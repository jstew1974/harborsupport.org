import { HARBOR_CONTACTS, HARBOR_PHONE } from '../data/harborContent';

export function Footer() {
  return (
    <footer className="border-t border-[#D9E3E8] bg-white py-12">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 pb-8 border-b border-[#EEF3F5]">
          <div>
            <a
              href="#top"
              className="font-display text-xl font-medium tracking-tight text-[#11222C]"
            >
              Harbor
            </a>
            <p className="mt-1.5 text-xs text-[#4C6270] max-w-[52ch] leading-relaxed">
              Evidence-based mental health support and live verified care
              discovery. Designed with licensed clinical advisors.
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="flex flex-wrap items-center gap-6 text-xs font-medium text-[#4C6270]"
          >
            <a href="#approach" className="hover:text-[#11222C] transition-colors">
              Approach
            </a>
            <a href="#care-finder" className="hover:text-[#11222C] transition-colors">
              Care Finder
            </a>
            <a href="#outcomes" className="hover:text-[#11222C] transition-colors">
              Outcomes
            </a>
            <a href="#get-started" className="hover:text-[#11222C] transition-colors">
              Contact
            </a>
          </nav>
        </div>

        <div className="py-6 border-b border-[#EEF3F5] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-xs">
          {HARBOR_CONTACTS.map((channel) => (
            <div key={channel.email} className="space-y-1">
              <p className="text-[#4C6270]">{channel.label}</p>
              <a
                href={`mailto:${channel.email}`}
                className="inline-block font-mono text-[#11222C] hover:text-[#0E5A6D] underline underline-offset-4 decoration-[#D9E3E8] hover:decoration-[#0E5A6D] transition-colors"
              >
                {channel.email}
              </a>
            </div>
          ))}
          <div className="space-y-1">
            <p className="text-[#4C6270]">
              {HARBOR_PHONE.label} · {HARBOR_PHONE.hours}
            </p>
            <a
              href={HARBOR_PHONE.href}
              className="inline-block font-mono tabular-nums text-[#11222C] hover:text-[#0E5A6D] underline underline-offset-4 decoration-[#D9E3E8] hover:decoration-[#0E5A6D] transition-colors"
            >
              {HARBOR_PHONE.display}
            </a>
          </div>
        </div>

        <div className="pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs text-[#4C6270]">
          <p>
            Harbor is not an emergency service. If you are in crisis, call or
            text 988 (US/Canada) or contact your local emergency number.
          </p>
          <p className="whitespace-nowrap shrink-0">
            &copy; {new Date().getFullYear()} Harbor ·{' '}
            <a
              href="https://harborsupport.org"
              className="hover:text-[#11222C] underline underline-offset-4 decoration-[#D9E3E8] hover:decoration-[#0E5A6D] transition-colors"
            >
              harborsupport.org
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
