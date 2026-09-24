"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import "./DualBanner.css";

const IMAGE_INTERVAL = 3500;

export type DualBannerData = {
  id: string;

  number: string;
  category: string;

  images: string[];

  alt: string;

  eyebrow: string;

  title: string[];

  description: string[];

  buttonText: string;
  buttonLink: string;

  theme: "dark" | "light";
};

function useCyclingImages(images: string[]) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (images.length <= 1) return;

    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % images.length);
    }, IMAGE_INTERVAL);

    return () => clearInterval(interval);
  }, [images.length]);

  return active;
}

function BannerImageStack({ images, alt }: { images: string[]; alt: string }) {
  const active = useCyclingImages(images);

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <>
      {images.map((src, i) => (
        <Image
          key={`${src}-${i}`}
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

function BannerPanel({
  banner,
  index,
}: {
  banner: DualBannerData;
  index: number;
}) {
  return (
    <div
      className={`dual-banner-panel ${
        banner.theme === "dark" ? "dual-banner-polo" : "dual-banner-graphic"
      }`}
    >
      {/* Images */}
      <BannerImageStack images={banner.images} alt={banner.alt} />

      {/* Overlay */}
      <div
        className={
          banner.theme === "dark"
            ? "dual-banner-dark-overlay"
            : "dual-banner-light-overlay"
        }
      />

      {/* Side Marker */}
      <div
        className={`dual-banner-side-marker ${
          index % 2 === 1 ? "dual-banner-side-marker-right" : ""
        }`}
      >
        <span>{banner.number}</span>

        <i />

        <span>{banner.category}</span>
      </div>

      {/* Content */}
      <div className="dual-banner-content">
        {banner.eyebrow && (
          <p className="dual-banner-eyebrow">{banner.eyebrow}</p>
        )}

        {banner.title?.length > 0 && (
          <h2>
            {banner.title.map((line, i) => (
              <span key={i}>
                {line}

                {i < banner.title.length - 1 && <br />}
              </span>
            ))}
          </h2>
        )}

        <span className="dual-banner-accent" />

        {banner.description?.length > 0 && (
          <p className="dual-banner-desc">
            {banner.description.map((line, i) => (
              <span key={i}>
                {line}

                {i < banner.description.length - 1 && <br />}
              </span>
            ))}
          </p>
        )}

        {banner.buttonText && (
          <Link href={banner.buttonLink || "#"} className="dual-banner-link">
            <span>{banner.buttonText}</span>
            <b>→</b>
          </Link>
        )}
      </div>
    </div>
  );
}

export default function DualBanner({ banners }: { banners: DualBannerData[] }) {
  if (!banners || banners.length === 0) {
    return null;
  }

  return (
    <section className="dual-banner">
      {banners.map((banner, index) => (
        <BannerPanel key={banner.id} banner={banner} index={index} />
      ))}

      {/* Center Detail */}
      <div className="dual-banner-center-mark">
        <span>✦</span>
      </div>
    </section>
  );
}
