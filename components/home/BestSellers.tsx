"use client";

import "./BestSellers.css";

import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";

import ProductCard from "@/components/ProductCard";

type Product = {
  id: string;
  handle?: string;
  title?: string;

  price?: string;
  compareAtPrice?: string;

  image?: {
    url?: string;
    altText?: string | null;
  };

  featuredImage?: {
    url?: string;
    altText?: string | null;
  };

  priceRange?: {
    minVariantPrice?: {
      amount?: string;
      currencyCode?: string;
    };
  };

  variants?: {
    id: string;
    title?: string;
  }[];
};

export default function BestSellers({ products }: { products: Product[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    dragFree: false,
  });

  if (!products?.length) {
    return null;
  }

  /* =========================
     CAROUSEL CONTROLS
  ========================= */

  const scrollPrev = () => {
    emblaApi?.scrollPrev();
  };

  const scrollNext = () => {
    emblaApi?.scrollNext();
  };

  return (
    <section className="best-sellers-section">
      <div className="best-sellers-container">
        {/* =========================
            HEADER
        ========================= */}

        <div className="best-sellers-header">
          <div className="best-sellers-heading">
            <p className="section-eyebrow">Most Wanted</p>

            <h2 className="title">Best Sellers</h2>

            <p className="para">
              The pieces our customers keep coming back for.
            </p>
          </div>

          <div className="best-sellers-actions">
            <Link
              href="/collections/best-sellers"
              className="best-sellers-view-all"
            >
              <span>View All</span>
              <span className="best-sellers-view-arrow">→</span>
            </Link>

            <div className="best-sellers-navigation">
              <button
                type="button"
                className="best-sellers-arrow"
                onClick={scrollPrev}
                aria-label="Previous products"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M19 12H5" />
                  <path d="M11 6l-6 6 6 6" />
                </svg>
              </button>

              <button
                type="button"
                className="best-sellers-arrow"
                onClick={scrollNext}
                aria-label="Next products"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M5 12h14" />
                  <path d="M13 6l6 6-6 6" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* =========================
            PRODUCT CAROUSEL
        ========================= */}

        <div className="best-sellers-viewport" ref={emblaRef}>
          <div className="best-sellers-track">
            {products.map((product) => (
              <div className="best-seller-slide" key={product.id}>
                {/* 
                  Existing ProductCard design
                  exactly reuse kora hocche
                */}

                <div className="best-seller-card-wrapper">
                  {/* BEST SELLER BADGE */}
                  <span className="best-seller-badge">Best Seller</span>

                  <ProductCard product={product} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* =========================
            BOTTOM
        ========================= */}

        <div className="best-sellers-bottom">
          <span className="best-sellers-swipe">Swipe to explore</span>

          <div className="best-sellers-line" />

          <span className="best-sellers-count">{products.length} Products</span>
        </div>
      </div>
    </section>
  );
}
