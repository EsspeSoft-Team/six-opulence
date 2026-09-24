import "./about-banner.css";

import Image from "next/image";

export default function AboutBanner() {
  return (
    <section className="hero-slider1">
      {/* =========================
          COLLAGE IMAGE 1
      ========================= */}
      <div className="collage-img collage-pos-1">
        <Image
          src="/images/b2.png"
          alt="Opulence fashion"
          fill
          style={{ objectFit: "cover" }}
          priority
        />
        <span className="collage-curtain" />
      </div>

      {/* =========================
          COLLAGE IMAGE 2
      ========================= */}
      <div className="collage-img collage-pos-2">
        <Image
          src="/images/b5.png"
          alt="Opulence fashion"
          fill
          style={{ objectFit: "cover" }}
        />
        <span className="collage-curtain" />
      </div>

      {/* =========================
          COLLAGE IMAGE 3
      ========================= */}
      <div className="collage-img collage-pos-3">
        <Image
          src="/images/b3.png"
          alt="Opulence fashion"
          fill
          style={{ objectFit: "cover" }}
        />
        <span className="collage-curtain" />
      </div>

      {/* =========================
          COLLAGE IMAGE 4
      ========================= */}
      <div className="collage-img collage-pos-4">
        <Image
          src="/images/b4.png"
          alt="Opulence fashion"
          fill
          style={{ objectFit: "cover" }}
        />
        <span className="collage-curtain" />
      </div>

      {/* =========================
          COLLAGE IMAGE 5
      ========================= */}
      <div className="collage-img collage-pos-5">
        <Image
          src="/images/b6.png"
          alt="Opulence fashion"
          fill
          style={{ objectFit: "cover" }}
        />
        <span className="collage-curtain" />
      </div>

      {/* =========================
          COLLAGE IMAGE 6
      ========================= */}
      <div className="collage-img collage-pos-6">
        <Image
          src="/images/b1.png"
          alt="Opulence fashion"
          fill
          style={{ objectFit: "cover" }}
        />
        <span className="collage-curtain" />
      </div>

      {/* =========================
          CENTER TEXT
      ========================= */}
      <div className="collage-center">
        <p className="collage-eyebrow">A Modern Man's</p>
        <span className="collage-eyebrow-line" />

        <h1 className="collage-heading">
          <span className="collage-line" style={{ animationDelay: "0.2s" }}>
            CREATED,
          </span>

          <span className="collage-line" style={{ animationDelay: "0.4s" }}>
            NOT CLAIMED.
          </span>
        </h1>

        <p className="collage-tagline">Purpose. Precision. Legacy. </p>

        <p className="collage-desc">BUILT, NOT GIVEN. </p>

        <span className="collage-divider-bottom" />

        <a
          href="#shop"
          className="collage-scroll-arrow"
          aria-label="Scroll down"
        >
          <span className="collage-explore-label">Explore</span>
          <span className="collage-arrow-glyph">↓</span>
        </a>
      </div>
    </section>
  );
}
