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
        <span className="opulence-video-eyebrow">THE OPULENCE EDIT</span>

        <h2>
          Designed For
          <br />
          The Exceptional.
        </h2>

        <p>
          A considered collection of modern menswear, crafted for those who
          choose quality over excess.
        </p>

        <Link href="/new-arrivals" className="opulence-video-button">
          <span>EXPLORE COLLECTION</span>

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
