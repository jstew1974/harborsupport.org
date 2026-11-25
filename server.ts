import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI } from '@google/genai';
import {
  extractVerifiedSources,
  validateSearchQuery,
  validateWaitlistForm,
} from './src/utils/harborLogic.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

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

  app.post('/api/waitlist', (req, res) => {
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
    res.status(201).json({
      referenceCode,
      fullName: input.fullName.trim(),
      email: input.email.trim(),
      focusArea: input.focusArea,
      region: input.region || null,
      submittedAt: new Date().toISOString(),
    });
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
