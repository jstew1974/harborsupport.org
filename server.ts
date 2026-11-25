import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { GoogleGenAI } from '@google/genai';
import {
  extractVerifiedSources,
  validateSearchQuery,
  validateWaitlistForm,
} from './src/utils/harborLogic.ts';
import {
  buildWaitlistEmailPayload,
  createRateLimiter,
} from './src/utils/waitlistEmail.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';
const DEFAULT_WAITLIST_RECIPIENT = 'john@harborsupport.org';
const DEFAULT_RESEND_FROM = 'Harbor Support <info@mail.harborsupport.org>';
const allowWaitlistRequest = createRateLimiter(5, 15 * 60 * 1000);

function isRetryableResendError(error: {
  name?: string;
  statusCode?: number | null;
}): boolean {
  if (typeof error.statusCode === 'number') {
    return error.statusCode === 429 || error.statusCode >= 500;
  }
  return (
    error.name === 'rate_limit_exceeded' ||
    error.name === 'internal_server_error' ||
    error.name === 'application_error'
  );
}

async function deliverWaitlistEmail(
  referenceCode: string,
  payload: {
    subject: string;
    replyTo: string;
    text: string;
    html: string;
  },
): Promise<{
  delivered: boolean;
  provider?: 'resend' | 'smtp';
  emailId?: string;
  error?: string;
}> {
  const toEmail =
    process.env.WAITLIST_TO_EMAIL?.trim() || DEFAULT_WAITLIST_RECIPIENT;
  const resendApiKey = process.env.RESEND_API_KEY?.trim();

  if (resendApiKey) {
    const resend = new Resend(resendApiKey);
    const fromEmail =
      process.env.RESEND_FROM_EMAIL?.trim() || DEFAULT_RESEND_FROM;
    const idempotencyKey = `onboarding-request/${referenceCode}`;
    const maxAttempts = 3;

    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      const { data, error } = await resend.emails.send(
        {
          from: fromEmail,
          to: [toEmail],
          replyTo: payload.replyTo,
          subject: payload.subject,
          text: payload.text,
          html: payload.html,
          tags: [{ name: 'category', value: 'onboarding' }],
        },
        { idempotencyKey },
      );

      if (!error && data?.id) {
        return {
          delivered: true,
          provider: 'resend',
          emailId: data.id,
        };
      }

      if (error && isRetryableResendError(error) && attempt < maxAttempts) {
        await new Promise((resolve) =>
          setTimeout(resolve, 500 * Math.pow(2, attempt - 1)),
        );
        continue;
      }

      console.error(
        `Resend delivery failed for ${referenceCode} (${error?.name ?? 'unknown'}): ${error?.message ?? 'No email ID returned'}`,
      );
      return {
        delivered: false,
        provider: 'resend',
        error:
          'We could not deliver your request right now. Please try again in a moment or email john@harborsupport.org directly.',
      };
    }
  }

  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim();

  if (smtpUser && smtpPass) {
    const smtpHost = process.env.SMTP_HOST?.trim() || 'smtp.gmail.com';
    const smtpPort = Number(process.env.SMTP_PORT) || 465;

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    await transporter.sendMail({
      from: `Harbor Support <${smtpUser}>`,
      to: toEmail,
      replyTo: payload.replyTo,
      subject: payload.subject,
      text: payload.text,
      html: payload.html,
    });

    return { delivered: true, provider: 'smtp' };
  }

  console.warn(
    'Waitlist email delivery is not configured. Set RESEND_API_KEY (or SMTP_USER and SMTP_PASS) in your hosting environment variables.',
  );

  return {
    delivered: false,
    error:
      'Form submissions are temporarily unavailable. Please reach out directly below and our team will help you get started.',
  };
}

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const SYSTEM_INSTRUCTION = [
  'You are the clinical resource researcher for Harbor, a mental health support app.',
  'Use Google Search to retrieve current, accurate, evidence-based mental health information, verified public helplines, clinical guidelines (e.g., NIMH, APA, WHO, SAMHSA, NHS), or vetted care directories.',
  'Structure your response concisely with 2-3 clear headings (using ##) and short, scannable bullet points.',
  'Include verified phone numbers, text lines, or official organization names when relevant.',
  'Keep a calm, empathetic, non-diagnostic tone. Never diagnose conditions or replace emergency medical care.',
  'Limit your full response to around 180-240 words so it reads cleanly in a web interface.',
].join(' ');

async function createServer() {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '64kb' }));

  app.post('/api/resources/search', async (req, res) => {
    const rawQuery = typeof req.body?.query === 'string' ? req.body.query : '';
    const rawRegion =
      typeof req.body?.region === 'string' ? req.body.region.trim().slice(0, 80) : '';

    const validation = validateSearchQuery(rawQuery);
    if (!validation.valid) {
      res.status(400).json({ error: validation.error });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.status(503).json({
        error:
          'Live search service is not configured yet. Please check your GEMINI_API_KEY in Settings > Secrets.',
      });
      return;
    }

    const prompt = rawRegion
      ? `Mental health care & evidence query (Location context: ${rawRegion}): ${validation.sanitized}`
      : `Mental health care & evidence query: ${validation.sanitized}`;

    try {
      let response;
      const maxAttempts = 3;
      let lastError: unknown;

      for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
        try {
          response = await ai.models.generateContent({
            model: 'gemini-4-hydrogen',
            contents: prompt,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              tools: [{ googleSearch: {} }],
            },
          });
          lastError = undefined;
          break;
        } catch (attemptErr: unknown) {
          lastError = attemptErr;
          const status =
            typeof attemptErr === 'object' &&
            attemptErr !== null &&
            'status' in attemptErr &&
            typeof (attemptErr as { status: unknown }).status === 'number'
              ? (attemptErr as { status: number }).status
              : 0;

          if ((status === 429 || status === 503) && attempt < maxAttempts) {
            await new Promise((resolve) =>
              setTimeout(resolve, 600 * Math.pow(2, attempt - 1)),
            );
            continue;
          }
          throw attemptErr;
        }
      }

      if (!response) {
        throw lastError ?? new Error('No response from Gemini service.');
      }

      const answer = response.text?.trim() ?? '';
      if (!answer) {
        res.status(502).json({
          error: 'No grounded guidance was returned for this query. Please try rephrasing.',
        });
        return;
      }

      const groundingMetadata = response.candidates?.[0]?.groundingMetadata;
      const sources = extractVerifiedSources(groundingMetadata?.groundingChunks);
      const searchQueries = Array.isArray(groundingMetadata?.webSearchQueries)
        ? groundingMetadata.webSearchQueries.filter(
            (item): item is string => typeof item === 'string' && item.trim().length > 0,
          )
        : [];

      res.json({
        query: validation.sanitized,
        region: rawRegion || null,
        answer,
        sources,
        searchQueries,
        retrievedAt: new Date().toISOString(),
      });
    } catch (err: unknown) {
      const status =
        typeof err === 'object' &&
        err !== null &&
        'status' in err &&
        typeof (err as { status: unknown }).status === 'number'
          ? (err as { status: number }).status
          : 502;

      const message =
        err instanceof Error ? err.message : 'Unable to reach live search grounding service.';

      if (status === 403 || status === 400) {
        res.status(status).json({
          error:
            'Could not authenticate with the Gemini API. Please check your API key in Settings > Secrets.',
        });
        return;
      }

      if (status === 429) {
        res.status(429).json({
          error:
            'Live search quota is temporarily exhausted. Please try again in a moment or check your billing tier in Settings > Secrets.',
        });
        return;
      }

      res.status(502).json({
        error: `Live search failed: ${message}`,
      });
    }
  });

  app.post('/api/waitlist', async (req, res) => {
    const honeypot =
      typeof req.body?.website === 'string' ? req.body.website.trim() : '';
    if (honeypot.length > 0) {
      res.status(400).json({ error: 'Invalid submission.' });
      return;
    }

    const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
    if (!allowWaitlistRequest(clientIp)) {
      res.status(429).json({
        error:
          'Too many requests from this connection. Please wait a few minutes or email john@harborsupport.org directly.',
      });
      return;
    }

    const input = {
      fullName: typeof req.body?.fullName === 'string' ? req.body.fullName : '',
      email: typeof req.body?.email === 'string' ? req.body.email : '',
      focusArea: typeof req.body?.focusArea === 'string' ? req.body.focusArea : '',
      region: typeof req.body?.region === 'string' ? req.body.region.trim().slice(0, 80) : '',
      acceptedConsent: Boolean(req.body?.acceptedConsent),
    };

    const validation = validateWaitlistForm(input);
    if (!validation.valid) {
      res.status(400).json({
        error: 'Please review the highlighted fields.',
        fieldErrors: validation.errors,
      });
      return;
    }

    const referenceCode = `HBR-${Math.floor(100000 + Math.random() * 900000)}`;
    const submittedAt = new Date().toISOString();
    const cleanName = input.fullName.trim();
    const cleanEmail = input.email.trim();
    const cleanRegion = input.region || null;

    const emailPayload = buildWaitlistEmailPayload({
      referenceCode,
      fullName: cleanName,
      email: cleanEmail,
      focusArea: input.focusArea,
      region: cleanRegion,
      submittedAt,
    });

    try {
      const delivery = await deliverWaitlistEmail(referenceCode, emailPayload);
      if (!delivery.delivered) {
        res.status(503).json({
          error:
            delivery.error ||
            'Unable to deliver your request right now. Please email john@harborsupport.org directly.',
        });
        return;
      }

      console.log(
        `Onboarding request ${referenceCode} delivered via ${delivery.provider}${delivery.emailId ? ` (emailId: ${delivery.emailId})` : ''}`,
      );

      res.status(201).json({
        referenceCode,
        fullName: cleanName,
        email: cleanEmail,
        focusArea: input.focusArea,
        region: cleanRegion,
        submittedAt,
      });
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : 'Unexpected email delivery error.';
      console.error(`Waitlist delivery failed for ${referenceCode}:`, message);
      res.status(502).json({
        error:
          'We could not deliver your request right now. Please try again or email john@harborsupport.org directly.',
      });
    }
  });

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexPath = path.join(distDir, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).send('Build output not found. Run npm run build first.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Harbor server listening on http://localhost:${PORT}`);
  });
}

createServer().catch((error) => {
  console.error('Failed to start Harbor server:', error);
  process.exit(1);
});
