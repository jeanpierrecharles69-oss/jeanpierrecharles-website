import React from "react";
import { LangProvider } from "./src/components/homepage/LangContext";
import NavBar from "./src/components/homepage/NavBar";
import HeroSection from "./src/components/homepage/HeroSection";
import TrustBadges from "./src/components/homepage/TrustBadges";
import ParcoursRD from "./src/components/homepage/ParcoursRD";
import SansAvecAegis from "./src/components/homepage/SansAvecAegis";
import ServicesSection from "./src/components/homepage/ServicesSection";
import PricingSection from "./src/components/homepage/PricingSection";
import ReglementsSection from "./src/components/homepage/ReglementsSection";
import CTASection from "./src/components/homepage/CTASection";
import FooterSection from "./src/components/homepage/FooterSection";
import CookieBanner from "./src/components/common/CookieBanner";
import { C, FONT_LINK } from "./src/components/homepage/constants";

const App: React.FC = () => {
  return (
    <LangProvider>
      <link href={FONT_LINK} rel="stylesheet" />
      <div
        className="min-h-screen antialiased"
        style={{
          backgroundColor: C.bg,
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          color: C.text,
        }}
      >
        <NavBar />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <HeroSection />
          <TrustBadges />
          <ParcoursRD />
          <SansAvecAegis />
          <ServicesSection />
          <PricingSection />
          <ReglementsSection />
          <CTASection />
        </main>
        <FooterSection />
        <CookieBanner />
      </div>
    </LangProvider>
  );
};

export default App;

