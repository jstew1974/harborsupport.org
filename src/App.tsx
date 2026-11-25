import { useRef } from 'react';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CapabilitiesSection } from './components/CapabilitiesSection';
import { CareFinderSection } from './components/CareFinderSection';
import { OutcomesSection } from './components/OutcomesSection';
import { EarlyAccessSection } from './components/EarlyAccessSection';
import { Footer } from './components/Footer';

export default function App() {
  const waitlistNameRef = useRef<HTMLInputElement | null>(null);

  const handleRequestAccess = () => {
    const section = document.getElementById('get-started');
    section?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    window.setTimeout(() => {
      waitlistNameRef.current?.focus({ preventScroll: true });
    }, 350);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFB] text-[#11222C]">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#0E5A6D] focus:text-white focus:rounded-lg focus:text-sm"
      >
        Skip to main content
      </a>

      <Header onRequestAccess={handleRequestAccess} />

      <main id="main-content" className="flex-1">
        <HeroSection onRequestAccess={handleRequestAccess} />
        <CapabilitiesSection />
        <CareFinderSection />
        <OutcomesSection />
        <EarlyAccessSection nameInputRef={waitlistNameRef} />
      </main>

      <Footer />
    </div>
  );
}
