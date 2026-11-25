export interface WaitlistFormInput {
  fullName: string;
  email: string;
  focusArea: string;
  region: string;
  acceptedConsent: boolean;
}

export interface WaitlistValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof WaitlistFormInput, string>>;
}

export interface GroundingChunkLike {
  web?: {
    uri?: string;
    title?: string;
  };
}

export interface VerifiedSource {
  title: string;
  url: string;
  domain: string;
}

export interface FormattedTextBlock {
  type: 'heading' | 'paragraph' | 'bullet';
  text: string;
}

export const SUPPORT_FOCUS_OPTIONS = [
  'Anxiety & Daily Stress',
  'Sleep & Burnout Recovery',
  'Between-Session Therapy Support',
  'Clinician or Care Team',
] as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function validateWaitlistForm(
  input: WaitlistFormInput,
): WaitlistValidationResult {
  const errors: Partial<Record<keyof WaitlistFormInput, string>> = {};
  const trimmedName = input.fullName.trim();
  const trimmedEmail = input.email.trim();

  if (trimmedName.length < 2) {
    errors.fullName = 'Please enter your name (at least 2 characters).';
  }

  if (!trimmedEmail) {
    errors.email = 'Please enter an email address.';
  } else if (!EMAIL_PATTERN.test(trimmedEmail)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (
    !SUPPORT_FOCUS_OPTIONS.includes(
      input.focusArea as (typeof SUPPORT_FOCUS_OPTIONS)[number],
    )
  ) {
    errors.focusArea = 'Please choose a primary focus area.';
  }

  if (!input.acceptedConsent) {
    errors.acceptedConsent =
      'Please confirm you understand Harbor is not an emergency service.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateSearchQuery(query: string): {
  valid: boolean;
  sanitized: string;
  error?: string;
} {
  const sanitized = query.replace(/\s+/g, ' ').trim();
  if (sanitized.length < 4) {
    return {
      valid: false,
      sanitized,
      error: 'Enter a topic or location (at least 4 characters) to search.',
    };
  }
  if (sanitized.length > 240) {
    return {
      valid: false,
      sanitized: sanitized.slice(0, 240),
      error: 'Please keep your query under 240 characters.',
    };
  }
  return { valid: true, sanitized };
}

export function extractVerifiedSources(
  chunks: GroundingChunkLike[] | undefined | null,
): VerifiedSource[] {
  if (!Array.isArray(chunks)) {
    return [];
  }

  const seen = new Set<string>();
  const sources: VerifiedSource[] = [];

  for (const chunk of chunks) {
    const rawUri = chunk?.web?.uri?.trim();
    if (!rawUri) continue;

    let parsed: URL;
    try {
      parsed = new URL(rawUri);
    } catch {
      continue;
    }

    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      continue;
    }

    const normalizedUrl = parsed.toString();
    if (seen.has(normalizedUrl)) continue;
    seen.add(normalizedUrl);

    const domain = parsed.hostname.replace(/^www\./, '');
    const rawTitle = chunk?.web?.title?.trim();
    const title = rawTitle && rawTitle.length > 0 ? rawTitle : domain;

    sources.push({
      title,
      url: normalizedUrl,
      domain,
    });
  }

  return sources;
}

export function parseStructuredGuidance(rawText: string): FormattedTextBlock[] {
  const lines = rawText
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0);

  const blocks: FormattedTextBlock[] = [];

  for (const line of lines) {
    const cleaned = line
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/__(.*?)__/g, '$1')
      .replace(/`([^`]+)`/g, '$1');

    if (/^#{1,3}\s+/.test(cleaned)) {
      blocks.push({
        type: 'heading',
        text: cleaned.replace(/^#{1,3}\s+/, '').trim(),
      });
    } else if (/^[-*•]\s+/.test(cleaned) || /^\d+\.\s+/.test(cleaned)) {
      blocks.push({
        type: 'bullet',
        text: cleaned
          .replace(/^[-*•]\s+/, '')
          .replace(/^\d+\.\s+/, '')
          .trim(),
      });
    } else {
      blocks.push({
        type: 'paragraph',
        text: cleaned,
      });
    }
  }

  return blocks;
}

export function getNextPracticeStep(
  currentStepIndex: number,
  totalSteps: number,
): number {
  if (totalSteps <= 0) return 0;
  return (currentStepIndex + 1) % totalSteps;
}
