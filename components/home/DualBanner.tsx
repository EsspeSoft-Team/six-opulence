"use client";

import { useEffect, useState } from "react";
import "./DualBanner.css";

import Link from "next/link";
import Image from "next/image";

const IMAGE_INTERVAL = 3500; // ms between image changes

const poloImages = [
  "/images/polo.png",
  "/images/polo2.png",
  "/images/polo1.png",
];

const graphicImages = [
  "/images/ove2.png",
  "/images/over1.png",
  "/images/DESKTOP_-_WEB_-_INNERV_df9383d6-2ea7-40e0-ab86-b7b0fff6f4f9.webp",
];

function useCyclingImages(images: string[]) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % images.length);
    }, IMAGE_INTERVAL);
    return () => clearInterval(id);
  }, [images.length]);

  return active;
}

function BannerImageStack({ images, alt }: { images: string[]; alt: string }) {
  const active = useCyclingImages(images);

  return (
    <>
      {images.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt={alt}
          fill
          sizes="50vw"
          className={`dual-banner-image ${i === active ? "active" : ""}`}
          priority={i === 0}
        />
      ))}
    </>
  );
}

export default function DualBanner() {
  return (
    <section className="dual-banner">
      {/* ================= POLO ================= */}
      <div className="dual-banner-panel dual-banner-polo">
        <BannerImageStack images={poloImages} alt="Polo T-Shirts" />

        <div className="dual-banner-dark-overlay" />

        {/* Side Number */}
        <div className="dual-banner-side-marker">
          <span>01</span>
          <i />
          <span>POLOS</span>
        </div>

        <div className="dual-banner-content">
          <p className="dual-banner-eyebrow">Smart. Sharp. Always.</p>

          <h2>
            POLO
            <br />
            T-SHIRTS
          </h2>

          <span className="dual-banner-accent" />

          <p className="dual-banner-desc">
            From casual days to classy moments,
            <br />
            our polos have you covered.
          </p>

          <Link
            href="/collections/elevated-capsule"
            className="dual-banner-link"
          >
            <span>Explore Polos</span>
            <b>→</b>
          </Link>
        </div>
      </div>

      {/* ================= GRAPHIC TEES ================= */}
      <div className="dual-banner-panel dual-banner-graphic">
        <BannerImageStack images={graphicImages} alt="Graphic Tees" />

        <div className="dual-banner-light-overlay" />

        {/* Side Number */}
        <div className="dual-banner-side-marker dual-banner-side-marker-right">
          <span>02</span>
          <i />
          <span>GRAPHIC TEES</span>
        </div>

        <div className="dual-banner-content">
          <p className="dual-banner-eyebrow">Bold. Expressive. You.</p>

          <h2>
            OVERSIZE
            <br />
            GRAPHIC TEES
          </h2>

          <span className="dual-banner-accent" />

          <p className="dual-banner-desc">
            Premium oversized tees with
            <br />
            unique graphics that speak your vibe.
          </p>

          <Link href="/collections/graphic-tees" className="dual-banner-link">
            <span>Explore Tees</span>
            <b>→</b>
          </Link>
        </div>
      </div>

      {/* ================= CENTER DETAIL ================= */}
      <div className="dual-banner-center-mark">
        <span>✦</span>
      </div>
    </section>
  );
}
