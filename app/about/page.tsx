import AboutBanner from "@/components/about/about-banner";
import AboutSection from "@/components/about/AboutSection";
import AboutStorySection from "@/components/about/AboutStorySection";
import DesignPhilosophy from "@/components/about/DesignPhilosophy";
import OpulenceMan from "@/components/about/OpulenceMan";
import Stockists from "@/components/about/Stockists";
import OpulenceFashionHero from "@/components/about/OpulenceFashionHero";
import JewelryFeature from "@/components/about/JewelryFeature";

export default function AboutPage() {
  return (
    <main className="about-page">
      {/* =========================================
          ABOUT HERO
      ========================================== */}
      <AboutBanner />

      {/* =========================================
          BRAND INTRODUCTION
      ========================================== */}
      <AboutSection />

      {/* =========================================
          BRAND STORY / EDITORIAL SECTION
      ========================================== */}
      <AboutStorySection />

      {/* =========================================
          DESIGN PHILOSOPHY
      ========================================== */}
      <DesignPhilosophy />

      {/* =========================================
          THE OPULENCE MAN
      ========================================== */}
      <OpulenceMan />

      {/* =========================================
          SIX OPULENCES
      ========================================== */}
      <Stockists />

      {/* =========================================
          FASHION / BRAND STORY
      ========================================== */}
      <OpulenceFashionHero />

      {/* =========================================
          JEWELRY FEATURE
      ========================================== */}
      {/* <JewelryFeature /> */}
    </main>
  );
}
