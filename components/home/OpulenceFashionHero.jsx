"use client";

import React, { useEffect, useState } from "react";

import "./OpulenceFashionHero.css";

/* ============================================================
   ICONS
   ============================================================ */

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M7 17L17 7M9 7h8v8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const HeartIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M20.8 8.8c0 5.2-8.8 10.1-8.8 10.1S3.2 14 3.2 8.8A4.7 4.7 0 0 1 12 6.2a4.7 4.7 0 0 1 8.8 2.6Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
  </svg>
);

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M3 12s3.4-5.5 9-5.5S21 12 21 12s-3.4 5.5-9 5.5S3 12 3 12Z"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    />

    <circle
      cx="12"
      cy="12"
      r="2.3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    />
  </svg>
);

const CompareIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path
      d="M7 5v14M7 5l-3 3m3-3 3 3M17 19V5m0 14-3-3m3 3 3-3"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* ============================================================
   TESTIMONIAL DATA
   ============================================================ */

const testimonials = [
  {
    quote:
      "Exceptional quality and effortless style. Opulence has completely changed my everyday wardrobe.",
    name: "Arjun Mehta",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote:
      "The quality feels premium from the first touch. Every piece fits beautifully and feels incredibly comfortable.",
    name: "Rohan Kapoor",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote:
      "Minimal, elegant and timeless. Opulence has quickly become my favourite everyday clothing brand.",
    name: "Kabir Sharma",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
  },
  {
    quote:
      "Beautiful designs, excellent fabrics and a perfect fit. Every piece feels thoughtfully made.",
    name: "Aditya Malhotra",
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
  },
];

/* ============================================================
   COMPONENT
   ============================================================ */

export default function OpulenceFashionHero() {
  const [testimonialIndex, setTestimonialIndex] = useState(0);

  /* ==========================================================
     NEXT
     ========================================================== */

  const nextTestimonial = () => {
    setTestimonialIndex((current) =>
      current === testimonials.length - 1 ? 0 : current + 1,
    );
  };

  /* ==========================================================
     PREVIOUS
     ========================================================== */

  const previousTestimonial = () => {
    setTestimonialIndex((current) =>
      current === 0 ? testimonials.length - 1 : current - 1,
    );
  };

  /* ==========================================================
     AUTO SLIDER
     ========================================================== */

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTestimonialIndex((current) =>
        current === testimonials.length - 1 ? 0 : current + 1,
      );
    }, 5000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const activeTestimonial = testimonials[testimonialIndex];

  return (
    <section className="opulence-fashion-hero">
      <div className="container">
        <div className="opulence-fashion-grid">
          {/* ==================================================
              LEFT
              ================================================== */}

          <div className="opulence-fashion-left">
            <div className="opulence-fashion-eyebrow">
              NEW SEASON COLLECTION
            </div>

            <h1>Timeless clothing made to express quiet confidence</h1>

            <p className="opulence-fashion-description">
              Discover refined essentials shaped by thoughtful design, premium
              materials, and effortless everyday style. Designed for modern
              wardrobes and made to last.
            </p>

            <a href="#shop" className="opulence-fashion-shop-link">
              START SHOPPING
            </a>

            <div className="opulence-fashion-left-image">
              <img
                src="/images/RR291142_480x.webp"
                alt="Opulence denim collection"
              />
            </div>
          </div>

          {/* ==================================================
              CENTER
              ================================================== */}

          <div className="opulence-fashion-center">
            <div className="opulence-fashion-center-image">
              <img src="/images/polo.png" alt="Opulence fashion collection" />
            </div>
          </div>

          {/* ==================================================
              RIGHT
              ================================================== */}

          <div className="opulence-fashion-right">
            {/* ==================================================
                PRODUCT
                ================================================== */}

            <div className="opulence-fashion-product">
              <div className="opulence-fashion-product-image-wrap">
                <div className="opulence-fashion-discount">16%</div>

                <div className="opulence-fashion-product-actions">
                  <button type="button" aria-label="Add to wishlist">
                    <HeartIcon />
                  </button>

                  <button type="button" aria-label="Quick view">
                    <EyeIcon />
                  </button>

                  <button type="button" aria-label="Compare product">
                    <CompareIcon />
                  </button>
                </div>

                <img
                  className="opulence-fashion-product-image"
                  src="/images/GAEL-OLIVE_480x.webp"
                  alt="Opulence premium polo"
                />
              </div>

              <div className="opulence-fashion-product-category">
                POLO T-SHIRTS
              </div>

              <h2 className="opulence-fashion-product-title">
                PREMIUM SIGNATURE T-SHIRT
              </h2>

              <div className="opulence-fashion-price">
                <span>$120.00</span>
                <del>$145.00</del>
              </div>
            </div>

            {/* ==================================================
                TESTIMONIAL
                ================================================== */}

            <div className="opulence-fashion-testimonial">
              {/* IMAGE + CONTENT */}
              <div className="opulence-fashion-testimonial-main">
                {/* AVATAR */}

                <div className="opulence-fashion-testimonial-avatar">
                  <img
                    key={activeTestimonial.image}
                    src={activeTestimonial.image}
                    alt={activeTestimonial.name}
                  />
                </div>

                {/* CONTENT */}

                <div
                  className="opulence-fashion-testimonial-content"
                  key={testimonialIndex}
                >
                  <p>“{activeTestimonial.quote}”</p>

                  <strong>{activeTestimonial.name}</strong>
                </div>
              </div>

              {/* ==================================================
                  CONTROLS — BELOW IMAGE + CONTENT
                  ================================================== */}

              <div className="opulence-fashion-testimonial-controls">
                {/* PREVIOUS */}

                <button
                  type="button"
                  className="opulence-fashion-testimonial-arrow"
                  onClick={previousTestimonial}
                  aria-label="Previous testimonial"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M19 12H5M11 6l-6 6 6 6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/* DOTS */}

                <div className="opulence-fashion-testimonial-dots">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      className={index === testimonialIndex ? "active" : ""}
                      onClick={() => setTestimonialIndex(index)}
                      aria-label={`Show testimonial ${index + 1}`}
                    />
                  ))}
                </div>

                {/* NEXT */}

                <button
                  type="button"
                  className="opulence-fashion-testimonial-arrow"
                  onClick={nextTestimonial}
                  aria-label="Next testimonial"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      d="M5 12h14m-6-6 6 6-6 6"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
