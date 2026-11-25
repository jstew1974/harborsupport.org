import { ArrowRight } from 'lucide-react';
import { CLINICAL_METRICS, HERO_IMAGE } from '../data/harborContent';
import { SafeImage } from './SafeImage';

interface HeroSectionProps {
  onRequestAccess: () => void;
}

export function HeroSection({ onRequestAccess }: HeroSectionProps) {
  return (
    <section id="top" className="pt-10 pb-16 sm:pt-14 sm:pb-24">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        {/* Balanced 2-column hero split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-between py-1">
            <div>
              <p className="text-xs font-medium tracking-wide text-[#4C6270] mb-5">
                Evidence-Based Support · Daily Check-Ins · Private by Design
              </p>

              <h1
                className="font-display font-normal text-[#11222C] tracking-[-0.02em] leading-[1.1] text-balance"
                style={{ fontSize: 'clamp(2.25rem, 4vw, 3.65rem)' }}
              >
                Steady mental health support, built for the days in between.
              </h1>

              <p className="mt-6 text-base sm:text-[17px] leading-[1.65] text-[#425866] max-w-[54ch]">
                Harbor pairs three-minute daily check-ins and clinician-authored
                grounding exercises with a live, search-verified directory of
                local care and crisis resources—so you always have a calm next
                step.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-5">
                <button
                  type="button"
                  onClick={onRequestAccess}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 text-sm font-medium text-white bg-[#0E5A6D] hover:bg-[#0A4655] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>

                <a
                  href="#care-finder"
                  className="inline-flex items-center gap-1.5 py-2.5 text-sm font-medium text-[#0E5A6D] hover:text-[#0A4655] underline underline-offset-4 decoration-[#0E5A6D]/40 hover:decoration-[#0E5A6D] transition-colors whitespace-nowrap shrink-0"
                >
                  Search Verified Care Resources
                </a>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-[#D9E3E8] text-xs text-[#4C6270] flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-y-1.5 sm:gap-x-3">
              <span>Licensed clinical advisors</span>
              <span className="hidden sm:inline" aria-hidden="true">·</span>
              <span>HIPAA-aligned encryption</span>
              <span className="hidden sm:inline" aria-hidden="true">·</span>
              <span>Live on iOS, Android &amp; Web</span>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative h-full min-h-[300px] sm:min-h-[380px] lg:min-h-[460px] rounded-xl overflow-hidden border border-[#D9E3E8] bg-[#EEF3F5]">
              <SafeImage
                src={HERO_IMAGE.src}
                alt={HERO_IMAGE.alt}
                fallbackTitle="Harbor Coastal Sanctuary"
                className="w-full h-full lg:h-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Full-width 4-column quantified clinical proof strip directly beneath hero split */}
        <div className="mt-12 sm:mt-16 pt-8 border-t border-[#D9E3E8] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {CLINICAL_METRICS.map((item) => (
            <div key={item.label} className="space-y-1.5">
              <p className="font-mono tabular-nums text-3xl font-medium tracking-tight text-[#11222C]">
                {item.value}
              </p>
              <p className="text-sm font-semibold text-[#11222C]">{item.label}</p>
              <p className="text-xs leading-relaxed text-[#4C6270]">{item.context}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
