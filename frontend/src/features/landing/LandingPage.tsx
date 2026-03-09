import { HeroSection } from './HeroSection';
import { BenefitsSection } from './BenefitsSection';
import { CategoriesSection } from './CategoriesSection';
import { PresetsSection } from './PresetsSection';
import { CTASection } from './CTASection';
import { Footer } from '@/components/layout/Footer';

export function LandingPage() {
  return (
    <main>
      <HeroSection />
      <BenefitsSection />
      <CategoriesSection />
      <PresetsSection />
      <CTASection />
      <Footer />
    </main>
  );
}
