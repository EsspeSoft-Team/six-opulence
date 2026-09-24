import {
  getNewArrivals,
  getCollections,
  getProducts,
  getProductsByType,
} from "@/lib/shopify";

import { getAccessCollections } from "@/lib/content/home/access";
import { getDualBanners } from "@/lib/content/home/dualBanner";

import HeroSlider from "@/components/home/HeroSlider";
import FeatureBar from "@/components/home/FeatureBar";
import BestSellers from "@/components/home/BestSellers";
import DualBanner from "@/components/home/DualBanner";
import AllProductsSection from "@/components/home/AllProductsSection";
import NewArrivalsSection from "@/components/home/NewArrivalsSection";
import AboutSection from "@/components/home/AboutSection";
import Stockists from "@/components/home/Stockists";
import InstagramStrip from "@/components/home/InstagramStrip";
import NewsletterBar from "@/components/home/NewsletterBar";
import JewelryFeature from "@/components/home/JewelryFeature";
import AccessCollection from "@/components/home/AccessCollection";
import CustomerReviews from "@/components/home/CustomerReviews";
import VideoSection from "@/components/home/VideoSection";

export default async function HomePage() {
  const [
    newArrivals,
    collections,
    allProducts,
    poloProducts,
    tshirtProducts,
    oversizedProducts,
    accessCollections,
    dualBanners,
  ] = await Promise.all([
    getNewArrivals(6),
    getCollections(3),
    getProducts(12),
    getProductsByType("Polo", 12),
    getProductsByType("Tee", 12),
    getProductsByType("Oversized Tee", 12),
    getAccessCollections(),
    getDualBanners(),
  ]);

  const bestSellerProducts = allProducts.slice(0, 5);

  return (
    <div className="home-page">
      {/* Hero */}
      <HeroSlider />

      {/* Existing sections */}
      <AboutSection />

      {/* Scroll-synced world */}
      <AccessCollection chapters={accessCollections} />

      {/* Best Sellers */}
      {/*
      <BestSellers
        products={bestSellerProducts}
      />
      */}

      {/* Product Categories */}
      <AllProductsSection
        all={allProducts}
        polo={poloProducts}
        tshirt={tshirtProducts}
      />

      {/* Dual Category Banner */}
      <DualBanner banners={dualBanners} />

      {/* Video Section */}
      <VideoSection />

      {/* Testimonials */}
      <CustomerReviews />

      {/* Instagram */}
      <InstagramStrip />
    </div>
  );
}
