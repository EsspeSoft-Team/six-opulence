import {
  getNewArrivals,
  getCollections,
  getProducts,
  getProductsByType,
} from "@/lib/shopify";

import HeroSlider from "@/components/home/HeroSlider";
import FeatureBar from "@/components/home/FeatureBar";

// import DiscoverCollection from "@/components/home/DiscoverCollection";

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
    graphicProducts,
    oversizedProducts,
  ] = await Promise.all([
    getNewArrivals(6),
    getCollections(3),
    getProducts(12),
    getProductsByType("Polo", 12),
    getProductsByType("Tee", 12),
    getProductsByType("Oversized Tee", 12),
  ]);

  // T-Shirt products
  const tshirtProducts = graphicProducts;

  // Temporary best seller source
  const bestSellerProducts = allProducts.slice(0, 5);

  return (
    <div className="home-page">
      {/* Hero */}
      <HeroSlider />

      {/* Existing sections */}
      <AboutSection />

      {/* 
      <OpulenceFashionHero />
      */}

      {/*
      <DiscoverCollection collections={collections} />
      */}

      {/* Scroll-synced world */}
      <AccessCollection />

      {/* Best Sellers */}
      {/*
      <BestSellers products={bestSellerProducts} />
      */}

      {/* Product Categories */}
      <AllProductsSection
        all={allProducts}
        polo={poloProducts}
        tshirt={tshirtProducts}
      />

      {/* Jewelry Feature */}
      {/*
      <JewelryFeature />
      */}

      {/* Dual Category Banner */}
      <DualBanner />

      {/* Video Section */}
      <VideoSection />

      {/*
      <JewelryFeature />
      */}

      {/*
      <Stockists />
      */}

      {/*
      <NewArrivalsSection products={newArrivals} />
      */}

      {/* Testimonials */}
      <CustomerReviews />

      {/* Instagram */}
      <InstagramStrip />
    </div>
  );
}
