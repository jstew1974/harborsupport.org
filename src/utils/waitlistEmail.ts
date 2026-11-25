export interface WaitlistEmailInput {
  referenceCode: string;
  fullName: string;
  email: string;
  focusArea: string;
  region: string | null;
  submittedAt: string;
}

export interface WaitlistEmailPayload {
  subject: string;
  replyTo: string;
  text: string;
  html: string;
}

export function stripHeaderNewlines(value: string): string {
  return value.replace(/[\r\n\0]+/g, ' ').replace(/\s+/g, ' ').trim();
}

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildWaitlistEmailPayload(
  input: WaitlistEmailInput,
): WaitlistEmailPayload {
  const safeName = stripHeaderNewlines(input.fullName).slice(0, 120);
  const safeEmail = stripHeaderNewlines(input.email).slice(0, 160);
  const safeFocus = stripHeaderNewlines(input.focusArea).slice(0, 120);
  const safeRegion = input.region
    ? stripHeaderNewlines(input.region).slice(0, 120)
    : 'Not provided';
  const safeRef = stripHeaderNewlines(input.referenceCode).slice(0, 40);
  const safeTime = stripHeaderNewlines(input.submittedAt).slice(0, 60);

  const subject = `Harbor Early Access Request (${safeRef}) — ${safeName}`;

  const text = [
    'New Harbor Early Access Request',
    '================================',
    `Reference: ${safeRef}`,
    `Full Name: ${safeName}`,
    `Email: ${safeEmail}`,
    `Primary Support Focus: ${safeFocus}`,
    `City / Region: ${safeRegion}`,
    `Submitted At: ${safeTime}`,
    '',
    'Reply directly to this email to reach the applicant.',
  ].join('\n');

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #11222C; max-width: 560px; margin: 0 auto; padding: 24px;">
      <p style="font-size: 12px; color: #0E5A6D; font-weight: 600; margin: 0 0 8px 0;">HARBOR EARLY ACCESS · ${escapeHtml(safeRef)}</p>
      <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 16px 0; color: #11222C;">New Beta Cohort Request</h2>
      <table style="width: 100%; border-collapse: collapse; font-size: 14px; border: 1px solid #D9E3E8;">
        <tr>
          <td style="padding: 10px 12px; background: #F8FAFB; border-bottom: 1px solid #EEF3F5; color: #4C6270; width: 38%;">Full name</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #EEF3F5; font-weight: 600;">${escapeHtml(safeName)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; background: #F8FAFB; border-bottom: 1px solid #EEF3F5; color: #4C6270;">Email address</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #EEF3F5;"><a href="mailto:${escapeHtml(safeEmail)}" style="color: #0E5A6D;">${escapeHtml(safeEmail)}</a></td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; background: #F8FAFB; border-bottom: 1px solid #EEF3F5; color: #4C6270;">Primary support focus</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #EEF3F5;">${escapeHtml(safeFocus)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; background: #F8FAFB; border-bottom: 1px solid #EEF3F5; color: #4C6270;">City / Region</td>
          <td style="padding: 10px 12px; border-bottom: 1px solid #EEF3F5;">${escapeHtml(safeRegion)}</td>
        </tr>
        <tr>
          <td style="padding: 10px 12px; background: #F8FAFB; color: #4C6270;">Submitted at</td>
          <td style="padding: 10px 12px;">${escapeHtml(safeTime)}</td>
        </tr>
      </table>
      <p style="font-size: 12px; color: #4C6270; margin-top: 16px;">Reply directly to this email to respond to ${escapeHtml(safeName)}.</p>
    </div>
  `.trim();

  return {
    subject,
    replyTo: safeEmail,
    text,
    html,
  };
}

export function createRateLimiter(maxRequests: number, windowMs: number) {
  const buckets = new Map<string, number[]>();

  return function allowRequest(key: string, now = Date.now()): boolean {
    const cutoff = now - windowMs;

    if (buckets.size > 2000) {
      for (const [k, timestamps] of buckets) {
        const active = timestamps.filter((ts) => ts > cutoff);
        if (active.length === 0) {
          buckets.delete(k);
        } else {
          buckets.set(k, active);
        }
      }
    }

    const recent = (buckets.get(key) ?? []).filter((ts) => ts > cutoff);

    if (recent.length >= maxRequests) {
      buckets.set(key, recent);
      return false;
    }

    recent.push(now);
    buckets.set(key, recent);
    return true;
  };
}
