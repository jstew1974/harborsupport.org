import { useState } from 'react';
import { ArrowRight, RotateCcw } from 'lucide-react';
import { CAPABILITIES, MICRO_PRACTICES } from '../data/harborContent';
import { getNextPracticeStep } from '../utils/harborLogic';
import { SafeImage } from './SafeImage';

export function CapabilitiesSection() {
  const [activePracticeId, setActivePracticeId] = useState<string>(
    MICRO_PRACTICES[0].id,
  );
  const [stepIndex, setStepIndex] = useState<number>(0);

  const activePractice =
    MICRO_PRACTICES.find((practice) => practice.id === activePracticeId) ??
    MICRO_PRACTICES[0];
  const currentStep = activePractice.steps[stepIndex] ?? activePractice.steps[0];

  const handleSelectPractice = (id: string) => {
    setActivePracticeId(id);
    setStepIndex(0);
  };

  const handleAdvanceStep = () => {
    setStepIndex((prev) =>
      getNextPracticeStep(prev, activePractice.steps.length),
    );
  };

  return (
    <section
      id="approach"
      className="scroll-mt-16 py-20 sm:py-28 border-t border-[#D9E3E8] bg-white"
    >
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        <div className="max-w-[66ch]">
          <p className="text-xs font-medium tracking-wide text-[#4C6270] mb-3">
            The Harbor Approach
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-normal tracking-[-0.02em] leading-[1.15] text-[#11222C] text-balance">
            Practical tools for the 167 hours between weekly therapy sessions.
          </h2>
          <p className="mt-4 text-base leading-[1.65] text-[#425866]">
            Most mental health apps trade calm for engagement loops. Harbor is
            built around short, clinically validated routines you can finish in
            minutes and leave behind as soon as you feel steadier.
          </p>
        </div>

        {/* Asymmetric Bento Grid */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {CAPABILITIES.map((item) => (
            <article
              key={item.index}
              className={`rounded-xl border border-[#D9E3E8] bg-[#F8FAFB] overflow-hidden flex flex-col justify-between ${
                item.span === 'wide' ? 'lg:col-span-2' : 'lg:col-span-1'
              }`}
            >
              {item.image && (
                <div
                  className={`w-full overflow-hidden border-b border-[#D9E3E8] bg-[#EEF3F5] ${
                    item.span === 'wide' ? 'h-56 sm:h-64' : 'h-48 sm:h-52'
                  }`}
                >
                  <SafeImage
                    src={item.image}
                    alt={item.imageAlt ?? item.title}
                    fallbackTitle={item.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              <div className="p-6 sm:p-8 flex flex-col flex-1 justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 text-xs text-[#4C6270] mb-3">
                    <span className="font-mono tabular-nums font-medium text-[#0E5A6D]">
                      {item.index}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{item.category}</span>
                  </div>
                  <h3 className="font-display text-xl sm:text-2xl font-normal tracking-[-0.015em] text-[#11222C]">
                    {item.title}
                  </h3>
                  <p className="mt-3 text-sm sm:text-[15px] leading-[1.65] text-[#425866]">
                    {item.summary}
                  </p>

                  {!item.image && (
                    <dl className="mt-8 pt-6 border-t border-[#D9E3E8] grid grid-cols-1 sm:grid-cols-3 gap-6">
                      <div>
                        <dt className="text-xs font-mono font-medium text-[#0E5A6D]">
                          AES-256 &amp; TLS 1.3
                        </dt>
                        <dd className="mt-1.5 text-xs leading-relaxed text-[#425866]">
                          Journal entries and mood logs encrypted in transit and
                          at rest.
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-mono font-medium text-[#0E5A6D]">
                          Zero Ad Profiling
                        </dt>
                        <dd className="mt-1.5 text-xs leading-relaxed text-[#425866]">
                          Reflections are never shared with ad networks or data
                          brokers.
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-mono font-medium text-[#0E5A6D]">
                          One-Click Export
                        </dt>
                        <dd className="mt-1.5 text-xs leading-relaxed text-[#425866]">
                          Download clean PDF/CSV session summaries or erase your
                          account anytime.
                        </dd>
                      </div>
                    </dl>
                  )}
                </div>

                <p className="pt-4 border-t border-[#D9E3E8] text-xs font-medium text-[#2A4250]">
                  {item.outcome}
                </p>
              </div>
            </article>
          ))}
        </div>

        {/* Interactive Guided Micro-Practice Preview (Single-elevation editorial split) */}
        <div className="mt-16 pt-14 border-t border-[#D9E3E8]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            <div className="lg:col-span-5">
              <p className="text-xs font-medium text-[#4C6270] mb-2">
                Interactive Preview
              </p>
              <h3 className="font-display text-2xl sm:text-[28px] font-normal tracking-[-0.015em] leading-[1.2] text-[#11222C]">
                Try a two-minute grounding routine right now.
              </h3>
              <p className="mt-3 text-sm leading-[1.65] text-[#425866]">
                Switch between three evidence-based practices available offline
                inside Harbor whenever stress or insomnia peaks.
              </p>

              <div
                role="tablist"
                aria-label="Guided grounding practices"
                className="mt-6 flex flex-col gap-2"
              >
                {MICRO_PRACTICES.map((practice) => {
                  const isActive = practice.id === activePractice.id;
                  return (
                    <button
                      key={practice.id}
                      type="button"
                      role="tab"
                      aria-selected={isActive}
                      onClick={() => handleSelectPractice(practice.id)}
                      className={`w-full text-left px-4 py-3.5 rounded-lg border transition-colors duration-150 cursor-pointer flex items-center justify-between gap-4 ${
                        isActive
                          ? 'bg-[#E4F1F4]/60 border-[#0E5A6D] text-[#11222C]'
                          : 'bg-white border-[#D9E3E8] text-[#425866] hover:bg-[#F8FAFB] hover:text-[#11222C]'
                      }`}
                    >
                      <span className="text-sm font-semibold truncate">
                        {practice.title}
                      </span>
                      <span className="font-mono tabular-nums text-xs text-[#4C6270] whitespace-nowrap shrink-0">
                        {practice.duration}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              role="tabpanel"
              aria-label={activePractice.title}
              className="lg:col-span-7 bg-[#F8FAFB] rounded-xl border border-[#D9E3E8] p-6 sm:p-8"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-[#EEF3F5] text-xs text-[#4C6270]">
                <span>
                  {activePractice.modality} · {activePractice.duration}
                </span>
                <span className="font-mono tabular-nums text-[#0E5A6D] font-medium">
                  {currentStep.phase}
                </span>
              </div>

              <div className="py-6 min-h-[148px]">
                <p className="font-display text-2xl sm:text-[26px] leading-[1.25] text-[#11222C]">
                  {currentStep.cue}
                </p>
                <p className="mt-3 text-sm sm:text-[15px] leading-[1.65] text-[#425866]">
                  {currentStep.detail}
                </p>
                <p className="mt-5 text-xs text-[#4C6270]">
                  Why it helps: {activePractice.purpose}
                </p>
              </div>

              {/* Step progress bar + controls */}
              <div className="pt-5 border-t border-[#EEF3F5] flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2" aria-hidden="true">
                  {activePractice.steps.map((step, idx) => (
                    <span
                      key={step.phase}
                      className={`h-1.5 rounded-full transition-colors duration-150 ${
                        idx === stepIndex
                          ? 'w-8 bg-[#0E5A6D]'
                          : 'w-3 bg-[#D9E3E8]'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex items-center gap-3">
                  {stepIndex > 0 && (
                    <button
                      type="button"
                      onClick={() => setStepIndex(0)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#425866] hover:text-[#11222C] border border-[#D9E3E8] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Restart</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleAdvanceStep}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-white bg-[#0E5A6D] hover:bg-[#0A4655] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>
                      {stepIndex < activePractice.steps.length - 1
                        ? 'Next Step'
                        : 'Repeat Cycle'}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
