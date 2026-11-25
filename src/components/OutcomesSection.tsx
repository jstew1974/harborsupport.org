import { CLINICAL_OUTCOMES, TESTIMONIALS } from '../data/harborContent';

export function OutcomesSection() {
  return (
    <section
      id="outcomes"
      className="scroll-mt-16 py-20 sm:py-28 border-t border-[#D9E3E8] bg-white"
    >
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        <div className="max-w-[66ch]">
          <p className="text-xs font-medium tracking-wide text-[#4C6270] mb-3">
            Clinical Evidence &amp; Field Notes
          </p>
          <h2 className="font-display text-3xl sm:text-4xl font-normal tracking-[-0.02em] leading-[1.15] text-[#11222C] text-balance">
            Measured with standardized clinical scales, not vanity engagement
            metrics.
          </h2>
        </div>

        {/* Quantified pilot outcomes */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {CLINICAL_OUTCOMES.map((outcome) => (
            <article
              key={outcome.id}
              className="rounded-xl border border-[#D9E3E8] bg-[#F8FAFB] p-6 sm:p-8 flex flex-col justify-between gap-6"
            >
              <div>
                <p className="text-xs text-[#4C6270] mb-4">{outcome.cohort}</p>
                <div className="flex items-baseline gap-3">
                  <span className="font-mono tabular-nums text-4xl sm:text-5xl font-medium tracking-tight text-[#0E5A6D]">
                    {outcome.metric}
                  </span>
                </div>
                <h3 className="mt-3 font-display text-xl sm:text-2xl font-normal text-[#11222C] leading-[1.3]">
                  {outcome.metricLabel}
                </h3>
                <p className="mt-3 text-sm sm:text-[15px] leading-[1.65] text-[#425866]">
                  {outcome.summary}
                </p>
              </div>
              <p className="pt-4 border-t border-[#D9E3E8] text-xs text-[#4C6270]">
                {outcome.methodology}
              </p>
            </article>
          ))}
        </div>

        {/* Attributable practitioner and pilot member perspectives */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          {TESTIMONIALS.map((item) => (
            <figure
              key={item.id}
              className="rounded-xl border border-[#D9E3E8] bg-white p-6 sm:p-8 flex flex-col justify-between gap-6"
            >
              <blockquote className="font-display text-lg sm:text-[20px] leading-[1.5] text-[#11222C]">
                “{item.quote}”
              </blockquote>

              <figcaption className="pt-5 border-t border-[#EEF3F5] space-y-1.5">
                <p className="text-sm font-semibold text-[#11222C]">
                  {item.author}
                </p>
                <p className="text-xs text-[#4C6270]">
                  {item.role} · {item.organization}
                </p>
                <p className="text-xs font-medium text-[#0E5A6D] pt-1">
                  {item.changeNote}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
