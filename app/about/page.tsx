import AboutBanner from "@/components/about/about-banner";
import AboutSection from "@/components/about/AboutSection";
import OpulenceFashionHero from "@/components/about/OpulenceFashionHero";
import Stockists from "@/components/about/Stockists";
import JewelryFeature from "@/components/about/JewelryFeature";

export default function AboutPage() {
  return (
    <main className="about-page">
      <AboutBanner />
      <AboutSection />

      <OpulenceFashionHero />

      <Stockists />

      <JewelryFeature />
    </main>
  );
}
