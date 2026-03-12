import React, { useEffect } from "react";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
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
import BlogSection from "./src/components/blog/BlogSection";
import ArticlePage from "./src/components/blog/ArticlePage";
import OrganizationJsonLd from "./src/components/blog/OrganizationJsonLd";
import { C, FONT_LINK } from "./src/components/homepage/constants";

function HomePage() {
  const location = useLocation();

  useEffect(() => {
    const state = location.state as { scrollTo?: string } | null;
    if (state?.scrollTo) {
      const timer = setTimeout(() => {
        const el = document.getElementById(state.scrollTo!);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
      // Clear the state so it doesn't re-scroll on re-render
      window.history.replaceState({}, "");
      return () => clearTimeout(timer);
    }
  }, [location.state]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <OrganizationJsonLd />
      <HeroSection />
      <TrustBadges />
      <ParcoursRD />
      <SansAvecAegis />
      <ServicesSection />
      <PricingSection />
      <ReglementsSection />
      <BlogSection />
      <CTASection />
    </main>
  );
}

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <HelmetProvider>
        <LangProvider>
          <link href={FONT_LINK} rel="stylesheet" />
          <div
            className="min-h-screen antialiased"
            style={{
              backgroundColor: C.bg,
              fontFamily:
                "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
              color: C.text,
            }}
          >
            <NavBar />
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/insights/:articleId" element={<ArticlePage />} />
            </Routes>
            <FooterSection />
            <CookieBanner />
          </div>
        </LangProvider>
      </HelmetProvider>
    </BrowserRouter>
  );
};

export default App;
