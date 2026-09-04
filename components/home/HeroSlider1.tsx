"use client";

import "./HeroSlider.css";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { sectionImages } from "@/lib/mock-data";

const SLIDE_DURATION = 6000;

export default function HeroSlider() {
  const slides = sectionImages.heroSlides;
  const [active, setActive] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActive((current) => (current + 1) % slides.length);
    }, SLIDE_DURATION);

    return () => clearInterval(timer);
  }, [slides.length]);

  const slide = slides[active];

  return (
    <section className="hero-slider">
      {/* =====================================================
          BACKGROUND
      ====================================================== */}

      <div className="hero-media">
        {slides.map((item, index) => (
          <div
            key={index}
            className={`hero-media-slide ${
              index === active ? "is-active" : ""
            }`}
          >
            <Image
              src={item.image}
              alt=""
              fill
              priority={index === 0}
              sizes="100vw"
              style={{ objectFit: "cover" }}
            />
          </div>
        ))}

        <div className="hero-overlay" />
        <div className="hero-bottom-fade" />
      </div>

      {/* =====================================================
          VERTICAL BRAND MARK
      ====================================================== */}

      <div className="hero-vertical-brand">
        <span>OPULENCE</span>
      </div>

      {/* =====================================================
          MAIN CONTENT
      ====================================================== */}

      <div className="hero-inner">
        <div className="hero-main">
          <div className="hero-eyebrow-wrap">
            <span className="hero-eyebrow-line" />

            <p className="hero-eyebrow">{slide.eyebrow}</p>
          </div>

          <h1 className="hero-heading">
            {slide.heading.split("\n").map((line, index) => (
              <span key={index}>{line}</span>
            ))}
          </h1>

          <p className="hero-description">{slide.subtext}</p>

          {/* =================================================
              ACTIONS
          ================================================== */}

          <div className="hero-actions">
            <Link
              href={slide.primaryCta.href}
              className="hero-action hero-action-primary"
            >
              <span>{slide.primaryCta.label}</span>

              <span className="hero-action-arrow">↗</span>
            </Link>

            <Link
              href={slide.secondaryCta.href}
              className="hero-action hero-action-secondary"
            >
              <span>{slide.secondaryCta.label}</span>

              <span className="hero-action-arrow">→</span>
            </Link>
          </div>
        </div>

        {/* =====================================================
            BOTTOM INFORMATION
        ====================================================== */}

        <div className="hero-footer">
          <Link href="/new-arrivals" className="hero-discover">
            <span className="hero-discover-label">Discover</span>

            <span className="hero-discover-title">New Arrivals</span>

            <span className="hero-discover-arrow">→</span>
          </Link>

          {/* =================================================
              SLIDER CONTROL
          ================================================== */}

          <div className="hero-controls">
            <div className="hero-counter">
              <span className="hero-current">
                {String(active + 1).padStart(2, "0")}
              </span>

              <span className="hero-counter-line" />

              <span className="hero-total">
                {String(slides.length).padStart(2, "0")}
              </span>
            </div>

            <div className="hero-progress">
              {slides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={`hero-progress-item ${
                    index === active ? "is-active" : ""
                  }`}
                  onClick={() => setActive(index)}
                  aria-label={`Go to slide ${index + 1}`}
                >
                  <span />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
