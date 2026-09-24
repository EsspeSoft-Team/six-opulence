"use client";

import React from "react";
import Link from "next/link";

import "./VideoSection.css";

export default function VideoSection() {
  return (
    <section className="opulence-video-section">
      {/* Background Video */}
      <video
        className="opulence-video-bg"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      >
        <source src="/images/vid1.mp4" type="video/mp4" />
      </video>

      {/* Dark Overlay */}
      <div className="opulence-video-overlay" />

      {/* Content */}
      <div className="opulence-video-content">
        <span className="opulence-video-eyebrow">THE OPULENCE OATH</span>

        <h2>
          The Measure of <br /> Good Taste.
        </h2>

        <p>
          A curated expression of refined clothing, where proportion, material
          and detail speak for themselves.
        </p>

        <Link href="/new-arrivals" className="opulence-video-button">
          <span>EXPLORE THE COLLECTION </span>

          <span className="opulence-video-arrow">→</span>
        </Link>
      </div>

      {/* Bottom Label */}
      <div className="opulence-video-bottom">
        <span>OPULENCE</span>
        <span>EST. 2026</span>
      </div>
    </section>
  );
}
