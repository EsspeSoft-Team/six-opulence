"use client";

import React from "react";
import "./JewelryFeature.css";

export default function JewelryFeature() {
  return (
    <section className="jewelry-feature-section">
      <div className="jewelry-feature-container container">
        {/* LEFT PRODUCT */}
        <div className="jewelry-feature-left">
          <div className="jewelry-feature-product-image">
            <img src="/images/RR291044.webp" alt="Premium white T-shirt" />

            <span className="jewelry-feature-discount">16%</span>
          </div>

          <div className="jewelry-feature-product-info">
            <span className="jewelry-feature-category">T-SHIRTS</span>

            <h3>ESSENTIAL COTTON T-SHIRT</h3>

            <div className="jewelry-feature-price">
              <strong>$45.00</strong>
              <del>$54.00</del>
            </div>
          </div>

          <h3 className="wear">
            "Wear the life you built, not the legacy you inherited."
          </h3>
        </div>

        {/* CENTER HERO */}
        <div className="jewelry-feature-center">
          <div className="jewelry-feature-hero-image">
            <img src="/images/kji.png" alt="Opulence clothing collection" />

            <div className="jewelry-feature-overlay">
              <span className="jewelry-feature-label">
                NEW SEASON COLLECTION
              </span>

              <h2>Timeless clothing made for modern living</h2>

              <p>
                Discover refined T-shirts, Polo T-shirts, and everyday
                essentials designed with premium comfort, clean silhouettes, and
                effortless style.
              </p>

              <a href="/shop" className="jewelry-feature-cta">
                START SHOPPING
              </a>
            </div>
          </div>
        </div>

        {/* RIGHT FEATURE */}
        <div className="jewelry-feature-right">
          <div className="jewelry-feature-right-content">
            <h3>Designed for everyday expression</h3>

            <p>
              Premium fabrics, considered fits, and understated details come
              together to create contemporary essentials made for modern
              wardrobes.
            </p>
          </div>

          <div className="jewelry-feature-ring-image">
            <img
              src="/images/8907279586391_8_480x.webp"
              alt="Contemporary clothing"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
