"use client";

import React from "react";
import "./OpulenceFashionHero.css";

const ArrowIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="opulence-brand-arrow">
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

const brandValues = [
  {
    number: "01",
    title: "CONSIDERED DESIGN",
    text: "Refined silhouettes shaped with intention.",
  },
  {
    number: "02",
    title: "PREMIUM CRAFT",
    text: "Thoughtful materials. Enduring finishes.",
  },
  {
    number: "03",
    title: "QUIET CONFIDENCE",
    text: "Presence without noise. Character without excess.",
  },
];

export default function OpulenceFashionHero() {
  return (
    <section className="opulence-fashion-hero">
      <div className="container">
        <div className="opulence-fashion-grid">
          {/* ==================================================
              LEFT
          ================================================== */}

          <div className="opulence-fashion-left">
            <div className="opulence-fashion-eyebrow">
              THE OPULENCE STANDARD
            </div>

            <h1>
              Timeless.
              <br />
              Made With Intent.
            </h1>

            <p className="opulence-fashion-description">
              OPULENCE is built for the man who chooses with purpose. Considered
              silhouettes, refined materials and enduring design come together
              without excess.
            </p>

            <div className="opulence-fashion-quiet-text">
              QUIETLY DISTINCTIVE.
            </div>

            <a href="/collection/all" className="opulence-fashion-shop-link">
              DISCOVER OUR PRODUCT
              <ArrowIcon />
            </a>

            <div className="opulence-fashion-left-image">
              <img
                src="/images/RR291142_480x.webp"
                alt="Opulence menswear collection"
              />
            </div>
          </div>

          {/* ==================================================
              CENTER IMAGE
          ================================================== */}

          <div className="opulence-fashion-center">
            <div className="opulence-fashion-center-image">
              <img src="/images/polo.png" alt="Opulence fashion collection" />
            </div>
          </div>

          {/* ==================================================
              RIGHT
              BRAND STORY
          ================================================== */}

          <div className="opulence-fashion-right">
            <div className="opulence-brand-story">
              {/* EYEBROW */}

              <div className="opulence-brand-story-eyebrow">ABOUT OPULENCE</div>

              {/* TITLE */}

              <h2 className="opulence-brand-story-title">
                More Than Clothing.
                <br />A Personal Standard.
              </h2>

              {/* INTRO */}

              <p className="opulence-brand-story-intro">
                OPULENCE is a philosophy of choice, character and restraint.
                Every piece is considered, refined and made to remain relevant
                beyond the season.
              </p>

              {/* VALUES */}

              <div className="opulence-brand-values">
                {brandValues.map((value) => (
                  <div className="opulence-brand-value" key={value.number}>
                    <div className="opulence-brand-value-number">
                      {value.number}
                    </div>

                    <div className="opulence-brand-value-content">
                      <h3>{value.title}</h3>

                      <p>{value.text}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* BOTTOM STATEMENT */}

              <div className="opulence-brand-closing">
                <p>
                  We don't follow the standard.
                  <br />
                  We define our own.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
