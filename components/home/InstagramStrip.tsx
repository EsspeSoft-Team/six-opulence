"use client";

import { useEffect, useRef } from "react";
import Image from "next/image";
import "./InstagramStrip.css";

interface StripItem {
  type: "image" | "video";
  src: string;
}

const instagramItems: StripItem[] = [
  { type: "image", src: "/images/GAEL-OLIVE_480x.webp" },
  { type: "image", src: "/images/POST-P-OLIVE.webp" },
  { type: "video", src: "/images/vid1.mp4" },
  { type: "image", src: "/images/RR283327-1_480x.webp" },
  { type: "video", src: "/images/next_video.mp4" },
  { type: "image", src: "/images/RR291044.webp" },
  { type: "image", src: "/images/polo.png" },
  { type: "image", src: "/images/over.png" },
];

const AUTO_SLIDE_INTERVAL = 3000; // ms between auto-slides

export default function InstagramStrip() {
  const trackRef = useRef<HTMLDivElement>(null);
  const isHoveringRef = useRef(false);

  function scrollByCard(direction: 1 | -1) {
    const track = trackRef.current;
    if (!track) return;
    const card = track.querySelector(".instagram-thumb") as HTMLElement | null;
    const cardWidth = card ? card.offsetWidth + 24 : 300; // 24 = gap

    const maxScroll = track.scrollWidth - track.clientWidth;
    const atEnd = track.scrollLeft >= maxScroll - 4;
    const atStart = track.scrollLeft <= 4;

    if (direction === 1 && atEnd) {
      track.scrollTo({ left: 0, behavior: "smooth" });
    } else if (direction === -1 && atStart) {
      track.scrollTo({ left: maxScroll, behavior: "smooth" });
    } else {
      track.scrollBy({ left: direction * cardWidth, behavior: "smooth" });
    }
  }

  useEffect(() => {
    const id = setInterval(() => {
      if (!isHoveringRef.current) {
        scrollByCard(1);
      }
    }, AUTO_SLIDE_INTERVAL);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="instagram-strip">
      <div className="container">
        {/* =========================
          HEADING
      ========================= */}
        <div className="instagram-heading">
          <div>
            <span className="instagram-small-label"> Follow Us</span>
            <h2 className="title">
              <img
                src="/images/insta.png"
                alt="Instagram"
                className="instagram-title-icon"
              />
              Follow On Instagram
            </h2>
          </div>

          <div className="instagram-arrows">
            <button
              type="button"
              className="instagram-arrow-btn"
              onClick={() => scrollByCard(-1)}
              aria-label="Previous"
            >
              ←
            </button>
            <button
              type="button"
              className="instagram-arrow-btn"
              onClick={() => scrollByCard(1)}
              aria-label="Next"
            >
              →
            </button>
          </div>
        </div>

        {/* =========================
          SLIDING ROW — images + videos
      ========================= */}
        <div
          className="instagram-grid"
          ref={trackRef}
          onMouseEnter={() => (isHoveringRef.current = true)}
          onMouseLeave={() => (isHoveringRef.current = false)}
        >
          {instagramItems.map((item, i) => (
            <a
              key={item.src}
              href="#"
              className="instagram-thumb"
              aria-label={`Instagram post ${i + 1}`}
            >
              {item.type === "video" ? (
                <video
                  className="instagram-image"
                  src={item.src}
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <Image
                  src={item.src}
                  alt="Opulence fashion"
                  fill
                  sizes="
                (max-width: 768px) 50vw,
                20vw
              "
                  className="instagram-image"
                />
              )}

              {item.type === "video" && (
                <span className="instagram-video-badge">▶</span>
              )}

              <div className="instagram-thumb-overlay">
                <svg
                  className="instagram-overlay-icon"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient
                      id={`ig-gradient-${i}`}
                      x1="0%"
                      y1="100%"
                      x2="100%"
                      y2="0%"
                    >
                      <stop offset="0%" stopColor="#FEDA75" />
                      <stop offset="20%" stopColor="#FA7E1E" />
                      <stop offset="45%" stopColor="#D62976" />
                      <stop offset="70%" stopColor="#962FBF" />
                      <stop offset="100%" stopColor="#4F5BD5" />
                    </linearGradient>
                  </defs>
                  <rect
                    x="3"
                    y="3"
                    width="18"
                    height="18"
                    rx="5"
                    fill="none"
                    stroke={`url(#ig-gradient-${i})`}
                    strokeWidth="1.8"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="4"
                    fill="none"
                    stroke={`url(#ig-gradient-${i})`}
                    strokeWidth="1.8"
                  />
                  <circle
                    cx="17.5"
                    cy="6.5"
                    r="1"
                    fill={`url(#ig-gradient-${i})`}
                    stroke="none"
                  />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
