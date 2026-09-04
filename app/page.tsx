import {
  getNewArrivals,
  getCollections,
  getProducts,
  getProductsByType,
} from "@/lib/shopify";

import HeroSlider from "@/components/home/HeroSlider";
import FeatureBar from "@/components/home/FeatureBar";
// import DiscoverCollection from "@/components/home/DiscoverCollection";
import OpulenceFashionHero from "@/components/home/OpulenceFashionHero";
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

  // Temporary best seller source:
  // Shopify থেকে আলাদা best-seller query না থাকলে
  // বর্তমানে allProducts-এর প্রথম 4টি product ব্যবহার করছি।
  const bestSellerProducts = allProducts.slice(0, 5);

  return (
    <div className="home-page">
      {/* Hero */}
      <HeroSlider />

      {/* Benefits / Features */}
      <FeatureBar />

      {/* Existing sections */}

      <OpulenceFashionHero />

      {/* Collections */}
      {/* <DiscoverCollection collections={collections} /> */}
      {/* Scroll-synced world: location + piece, tied together */}
      <AccessCollection />

      {/* Best Sellers */}
      {/* <BestSellers products={bestSellerProducts} /> */}

      {/* Product Categories */}
      <AllProductsSection
        all={allProducts}
        polo={poloProducts}
        graphic={graphicProducts}
        oversized={oversizedProducts}
      />

      {/* Dual Category Banner */}
      <DualBanner />

      <JewelryFeature />

      {/* Stockists */}
      <Stockists />

      {/* New Arrivals */}
      {/* <NewArrivalsSection products={newArrivals} /> */}

      {/* About */}
      <AboutSection />

      {/* testimoanial */}
      <CustomerReviews />
      {/* Instagram */}
      <InstagramStrip />

      {/* Newsletter */}
      <NewsletterBar />
    </div>
  );
}
