import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { HeroSection } from './HeroSection';
import { BenefitsSection } from './BenefitsSection';
import { CategoriesSection } from './CategoriesSection';
import { PresetsSection } from './PresetsSection';
import { CTASection } from './CTASection';
import { Footer } from '@/components/layout/Footer';
export function LandingPage() {
    return (_jsxs("main", { children: [_jsx(HeroSection, {}), _jsx(BenefitsSection, {}), _jsx(CategoriesSection, {}), _jsx(PresetsSection, {}), _jsx(CTASection, {}), _jsx(Footer, {})] }));
}
