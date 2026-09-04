"use client";

import "./NewArrivalsSection.css";

import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";

import ProductCard from "@/components/ProductCard";

export default function NewArrivalsSection({ products }: { products: any[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: "start",
    loop: false,
    dragFree: false,
  });

  if (!products || products.length === 0) {
    return null;
  }

  const scrollPrev = () => {
    emblaApi?.scrollPrev();
  };

  const scrollNext = () => {
    emblaApi?.scrollNext();
  };

  return (
    <section className="new-arrivals-section">
      <div className="new-arrivals-container">
        {/* =========================
            HEADER
        ========================= */}

        <div className="new-arrivals-header">
          <div className="new-arrivals-heading">
            <p className="section-eyebrow">New In</p>

            <h2 className="title">New Arrivals</h2>

            <p className="new-arrivals-subtext para">
              Fresh styles. Premium quality. Made for you.
            </p>
          </div>

          <div className="new-arrivals-actions">
            <Link href="/new-arrivals" className="new-arrivals-view-all">
              <span>View All</span>
              <span className="new-arrivals-view-arrow">→</span>
            </Link>

            <div className="new-arrivals-navigation">
              <button
                type="button"
                className="new-arrivals-arrow"
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
                className="new-arrivals-arrow"
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
            CAROUSEL
        ========================= */}

        <div className="new-arrivals-viewport" ref={emblaRef}>
          <div className="new-arrivals-track">
            {products.map((product) => (
              <div className="new-arrival-slide" key={product.id}>
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>

        {/* =========================
            BOTTOM
        ========================= */}

        <div className="new-arrivals-bottom">
          <span className="new-arrivals-swipe">Swipe to explore</span>

          <div className="new-arrivals-line" />

          <span className="new-arrivals-count">{products.length} Products</span>
        </div>
      </div>
    </section>
  );
}
