import { FormEvent, RefObject, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { HARBOR_CONTACTS, HARBOR_PHONE } from '../data/harborContent';
import {
  SUPPORT_FOCUS_OPTIONS,
  validateWaitlistForm,
  WaitlistFormInput,
} from '../utils/harborLogic';

interface EarlyAccessSectionProps {
  nameInputRef: RefObject<HTMLInputElement | null>;
}

interface WaitlistConfirmation {
  referenceCode: string;
  fullName: string;
  email: string;
  focusArea: string;
  region: string | null;
  submittedAt: string;
}

const INITIAL_FORM: WaitlistFormInput = {
  fullName: '',
  email: '',
  focusArea: SUPPORT_FOCUS_OPTIONS[0],
  region: '',
  acceptedConsent: false,
};

export function EarlyAccessSection({ nameInputRef }: EarlyAccessSectionProps) {
  const [form, setForm] = useState<WaitlistFormInput>(INITIAL_FORM);
  const [honeypot, setHoneypot] = useState('');
  const [errors, setErrors] = useState<
    Partial<Record<keyof WaitlistFormInput, string>>
  >({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [confirmation, setConfirmation] =
    useState<WaitlistConfirmation | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setServerError(null);

    const validation = validateWaitlistForm(form);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setSubmitting(true);

    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, website: honeypot }),
      });

      const payload = (await response.json()) as Partial<WaitlistConfirmation> & {
        error?: string;
        fieldErrors?: Partial<Record<keyof WaitlistFormInput, string>>;
      };

      if (!response.ok) {
        if (payload.fieldErrors) {
          setErrors(payload.fieldErrors);
        }
        throw new Error(
          payload.error || 'Unable to submit your request.',
        );
      }

      setConfirmation({
        referenceCode: payload.referenceCode ?? 'HBR-CONFIRMED',
        fullName: payload.fullName ?? form.fullName.trim(),
        email: payload.email ?? form.email.trim(),
        focusArea: payload.focusArea ?? form.focusArea,
        region: payload.region ?? (form.region.trim() || null),
        submittedAt: payload.submittedAt ?? new Date().toISOString(),
      });
    } catch (err: unknown) {
      setServerError(
        err instanceof Error
          ? err.message
          : 'Could not reach the server. Please try again.',
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm(INITIAL_FORM);
    setHoneypot('');
    setErrors({});
    setServerError(null);
    setConfirmation(null);
  };

  return (
    <section
      id="get-started"
      className="scroll-mt-16 py-20 sm:py-28 border-t border-[#D9E3E8] bg-[#F8FAFB]"
    >
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          <div className="lg:col-span-5">
            <p className="text-xs font-medium tracking-wide text-[#4C6270] mb-3">
              Get Started with Harbor
            </p>
            <h2 className="font-display text-3xl sm:text-4xl font-normal tracking-[-0.02em] leading-[1.15] text-[#11222C] text-balance">
              Start using Harbor for daily support or your care practice.
            </h2>
            <p className="mt-4 text-base leading-[1.65] text-[#425866]">
              Share your details below and we’ll send your personalized
              onboarding guide, curated local care directory, and clinician
              templates.
            </p>

            <dl className="mt-8 pt-6 border-t border-[#D9E3E8] space-y-4 text-sm">
              <div>
                <dt className="font-semibold text-[#11222C]">
                  Individual membership
                </dt>
                <dd className="text-[#425866] mt-0.5">
                  Open to the public with private daily check-ins, grounding
                  tools, and permanent member data export.
                </dd>
              </div>
              <div>
                <dt className="font-semibold text-[#11222C]">
                  Outpatient clinics &amp; therapists
                </dt>
                <dd className="text-[#425866] mt-0.5">
                  Includes HIPAA-aligned session summary templates for client
                  check-ins.
                </dd>
              </div>
              <div className="pt-2 border-t border-[#E6EEF2]">
                <dt className="font-semibold text-[#11222C] mb-2">
                  Prefer to write or call directly?
                </dt>
                <dd className="space-y-1.5 text-xs text-[#425866]">
                  {HARBOR_CONTACTS.map((channel) => (
                    <div
                      key={channel.email}
                      className="flex flex-wrap items-baseline justify-between gap-2"
                    >
                      <span>{channel.label}</span>
                      <a
                        href={`mailto:${channel.email}`}
                        className="font-mono text-[#0E5A6D] hover:text-[#0A4655] underline underline-offset-4 decoration-[#0E5A6D]/35 hover:decoration-[#0E5A6D] transition-colors"
                      >
                        {channel.email}
                      </a>
                    </div>
                  ))}
                  <div className="pt-2 mt-2 border-t border-[#E6EEF2] flex flex-wrap items-baseline justify-between gap-2">
                    <span>
                      {HARBOR_PHONE.label} · {HARBOR_PHONE.hours}
                    </span>
                    <a
                      href={HARBOR_PHONE.href}
                      className="font-mono tabular-nums text-[#0E5A6D] hover:text-[#0A4655] underline underline-offset-4 decoration-[#0E5A6D]/35 hover:decoration-[#0E5A6D] transition-colors whitespace-nowrap"
                    >
                      {HARBOR_PHONE.display}
                    </a>
                  </div>
                  <p className="pt-1 text-[11px] text-[#5B707D]">
                    Non-emergency inquiries only · For 24/7 crisis support, call
                    or text 988.
                  </p>
                </dd>
              </div>
            </dl>
          </div>

          <div className="lg:col-span-7">
            <div className="rounded-xl border border-[#D9E3E8] bg-white p-6 sm:p-8">
              {confirmation ? (
                <div
                  role="status"
                  data-testid="waitlist-confirmation"
                  className="space-y-6 py-2"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircle2
                      className="w-6 h-6 text-[#0E5A6D] shrink-0 mt-0.5"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-xs font-mono text-[#0E5A6D] font-medium">
                        Confirmation {confirmation.referenceCode}
                      </p>
                      <h3 className="mt-1 font-display text-2xl font-normal text-[#11222C]">
                        We received your request, {confirmation.fullName}.
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed text-[#425866]">
                        We’ve sent your details to our team for{' '}
                        <strong className="font-semibold text-[#11222C]">
                          {confirmation.email}
                        </strong>{' '}
                        with onboarding resources tailored to{' '}
                        <strong className="font-semibold text-[#11222C]">
                          {confirmation.focusArea}
                        </strong>
                        {confirmation.region ? ` in ${confirmation.region}` : ''}.
                      </p>
                    </div>
                  </div>

                  <div className="pt-5 border-t border-[#EEF3F5] flex flex-wrap items-center justify-between gap-4">
                    <span className="text-xs text-[#4C6270]">
                      Follow-ups arrive from{' '}
                      <a
                        href="mailto:info@harborsupport.org"
                        className="font-mono text-[#11222C] underline underline-offset-4 decoration-[#D9E3E8] hover:decoration-[#0E5A6D]"
                      >
                        info@harborsupport.org
                      </a>{' '}
                      — no marketing spam.
                    </span>
                    <button
                      type="button"
                      onClick={handleReset}
                      className="px-4 py-2 text-xs font-medium text-[#11222C] border border-[#D9E3E8] hover:border-[#0E5A6D] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Submit Another Request
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="space-y-5">
                  <div className="sr-only" aria-hidden="true">
                    <label htmlFor="waitlist-website">Website</label>
                    <input
                      id="waitlist-website"
                      name="website"
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      value={honeypot}
                      onChange={(e) => setHoneypot(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="waitlist-name"
                        className="block text-xs font-medium text-[#2A4250] mb-1.5"
                      >
                        Full name
                      </label>
                      <input
                        ref={nameInputRef}
                        id="waitlist-name"
                        name="fullName"
                        type="text"
                        autoComplete="name"
                        value={form.fullName}
                        onChange={(e) => {
                          setForm((prev) => ({
                            ...prev,
                            fullName: e.target.value,
                          }));
                          if (errors.fullName) {
                            setErrors((prev) => ({ ...prev, fullName: undefined }));
                          }
                        }}
                        placeholder="Maya Lin"
                        aria-invalid={Boolean(errors.fullName)}
                        aria-describedby={
                          errors.fullName ? 'waitlist-name-error' : undefined
                        }
                        className="w-full px-3.5 py-2.5 text-sm text-[#11222C] placeholder:text-[#738A97] bg-[#F8FAFB] border border-[#CBD8DF] rounded-lg focus:bg-white focus:border-[#0E5A6D] transition-colors"
                      />
                      {errors.fullName && (
                        <p
                          id="waitlist-name-error"
                          role="alert"
                          className="mt-1.5 text-xs font-medium text-[#9F2D2D]"
                        >
                          {errors.fullName}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="waitlist-email"
                        className="block text-xs font-medium text-[#2A4250] mb-1.5"
                      >
                        Email address
                      </label>
                      <input
                        id="waitlist-email"
                        name="email"
                        type="email"
                        autoComplete="email"
                        value={form.email}
                        onChange={(e) => {
                          setForm((prev) => ({ ...prev, email: e.target.value }));
                          if (errors.email) {
                            setErrors((prev) => ({ ...prev, email: undefined }));
                          }
                        }}
                        placeholder="maya@example.org"
                        aria-invalid={Boolean(errors.email)}
                        aria-describedby={
                          errors.email ? 'waitlist-email-error' : undefined
                        }
                        className="w-full px-3.5 py-2.5 text-sm text-[#11222C] placeholder:text-[#738A97] bg-[#F8FAFB] border border-[#CBD8DF] rounded-lg focus:bg-white focus:border-[#0E5A6D] transition-colors"
                      />
                      {errors.email && (
                        <p
                          id="waitlist-email-error"
                          role="alert"
                          className="mt-1.5 text-xs font-medium text-[#9F2D2D]"
                        >
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="waitlist-focus"
                        className="block text-xs font-medium text-[#2A4250] mb-1.5"
                      >
                        Primary support focus
                      </label>
                      <select
                        id="waitlist-focus"
                        name="focusArea"
                        value={form.focusArea}
                        onChange={(e) => {
                          setForm((prev) => ({
                            ...prev,
                            focusArea: e.target.value,
                          }));
                          if (errors.focusArea) {
                            setErrors((prev) => ({
                              ...prev,
                              focusArea: undefined,
                            }));
                          }
                        }}
                        aria-invalid={Boolean(errors.focusArea)}
                        className="w-full px-3.5 py-2.5 text-sm text-[#11222C] bg-[#F8FAFB] border border-[#CBD8DF] rounded-lg focus:bg-white focus:border-[#0E5A6D] transition-colors"
                      >
                        {SUPPORT_FOCUS_OPTIONS.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="waitlist-region"
                        className="block text-xs font-medium text-[#2A4250] mb-1.5"
                      >
                        City or region (optional)
                      </label>
                      <input
                        id="waitlist-region"
                        name="region"
                        type="text"
                        value={form.region}
                        onChange={(e) =>
                          setForm((prev) => ({ ...prev, region: e.target.value }))
                        }
                        placeholder="Portland, OR"
                        className="w-full px-3.5 py-2.5 text-sm text-[#11222C] placeholder:text-[#738A97] bg-[#F8FAFB] border border-[#CBD8DF] rounded-lg focus:bg-white focus:border-[#0E5A6D] transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        id="waitlist-consent"
                        type="checkbox"
                        checked={form.acceptedConsent}
                        onChange={(e) => {
                          setForm((prev) => ({
                            ...prev,
                            acceptedConsent: e.target.checked,
                          }));
                          if (errors.acceptedConsent) {
                            setErrors((prev) => ({
                              ...prev,
                              acceptedConsent: undefined,
                            }));
                          }
                        }}
                        aria-invalid={Boolean(errors.acceptedConsent)}
                        aria-describedby={
                          errors.acceptedConsent
                            ? 'waitlist-consent-error'
                            : undefined
                        }
                        className="mt-1 w-4 h-4 rounded border-[#CBD8DF] text-[#0E5A6D] focus:ring-[#0E5A6D]"
                      />
                      <span className="text-xs leading-relaxed text-[#425866]">
                        I understand Harbor offers daily mental wellness tools
                        and verified care discovery, and does not provide
                        emergency medical or crisis intervention.
                      </span>
                    </label>
                    {errors.acceptedConsent && (
                      <p
                        id="waitlist-consent-error"
                        role="alert"
                        className="mt-1.5 text-xs font-medium text-[#9F2D2D]"
                      >
                        {errors.acceptedConsent}
                      </p>
                    )}
                  </div>

                  {serverError && (
                    <div
                      role="alert"
                      className="rounded-lg border border-[#E5C6C6] bg-[#FDF6F6] p-4 space-y-2 text-xs text-[#6E2626]"
                    >
                      <p className="font-semibold text-[#8A2424]">{serverError}</p>
                      <p>
                        You can also send your request directly to{' '}
                        <a
                          href={`mailto:john@harborsupport.org?subject=${encodeURIComponent('Harbor Onboarding Request')}`}
                          className="font-mono text-[#0E5A6D] underline underline-offset-4"
                        >
                          john@harborsupport.org
                        </a>
                        .
                      </p>
                    </div>
                  )}

                  <div className="pt-2 flex flex-wrap items-center justify-between gap-4">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="inline-flex items-center gap-2 px-6 py-3 text-sm font-medium text-white bg-[#0E5A6D] hover:bg-[#0A4655] disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {submitting ? (
                        <>
                          <Loader2
                            className="w-4 h-4 animate-spin"
                            aria-hidden="true"
                          />
                          <span>Sending Request...</span>
                        </>
                      ) : (
                        <span>Get Started</span>
                      )}
                    </button>

                    <span className="text-xs text-[#4C6270]">
                      Encrypted submission · Delete anytime
                    </span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
