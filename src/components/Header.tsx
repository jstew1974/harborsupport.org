import { useState } from 'react';
import { Menu, X } from 'lucide-react';

interface HeaderProps {
  onRequestAccess: () => void;
}

const NAV_LINKS = [
  { href: '#approach', label: 'Approach' },
  { href: '#care-finder', label: 'Care Finder' },
  { href: '#outcomes', label: 'Outcomes' },
  { href: '#early-access', label: 'Early Access' },
];

export function Header({ onRequestAccess }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleMobileAction = () => {
    setMobileMenuOpen(false);
    onRequestAccess();
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F8FAFB]/95 backdrop-blur-sm border-b border-[#D9E3E8]">
      <div className="max-w-[1200px] mx-auto px-5 sm:px-8 h-16 flex items-center justify-between gap-8">
        {/* Zone 1: Single text element brand wordmark */}
        <a
          href="#top"
          className="font-display text-2xl font-medium tracking-tight text-[#11222C] whitespace-nowrap shrink-0"
        >
          Harbor
        </a>

        {/* Zone 2: 4 clean single-line navigation links */}
        <nav
          aria-label="Primary"
          className="hidden md:flex items-center gap-8 text-sm font-medium text-[#4C6270]"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="hover:text-[#11222C] hover:underline underline-offset-4 decoration-[#0E5A6D]/50 transition-colors whitespace-nowrap shrink-0"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="hidden md:flex items-center shrink-0">
          <button
            type="button"
            onClick={onRequestAccess}
            className="px-5 py-2.5 text-sm font-medium text-white bg-[#0E5A6D] hover:bg-[#0A4655] rounded-lg transition-colors duration-150 whitespace-nowrap shrink-0 cursor-pointer"
          >
            Join Early Access
          </button>
        </div>

        {/* Mobile drawer button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-navigation"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="md:hidden inline-flex items-center justify-center w-11 h-11 rounded-lg text-[#11222C] hover:bg-[#EEF3F5] transition-colors cursor-pointer"
        >
          {mobileMenuOpen ? (
            <X className="w-5 h-5" aria-hidden="true" />
          ) : (
            <Menu className="w-5 h-5" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Mobile navigation panel */}
      {mobileMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Mobile Navigation"
          className="md:hidden border-t border-[#D9E3E8] bg-white px-5 py-4 space-y-1"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-3 text-base font-medium text-[#11222C] hover:text-[#0E5A6D] border-b border-[#EEF3F5] last:border-b-0"
            >
              {link.label}
            </a>
          ))}
          <div className="pt-3">
            <button
              type="button"
              onClick={handleMobileAction}
              className="w-full py-3 px-5 text-sm font-medium text-white bg-[#0E5A6D] hover:bg-[#0A4655] rounded-lg transition-colors whitespace-nowrap cursor-pointer"
            >
              Join Early Access
            </button>
          </div>
        </nav>
      )}
    </header>
  );
}
