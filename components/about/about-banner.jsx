import "./about-banner.css";
import Image from "next/image";

export default function AboutBanner() {
  return (
    <section className="about-banner">
      <Image
        src="/images/b2.png"
        alt="Opulence fashion"
        fill
        priority
        className="about-banner-image"
      />

      <div className="about-banner-overlay" />

      <div className="about-banner-content">
        <span className="about-banner-eyebrow">A Modern Man's</span>

        <h1>
          CREATED,
          <br />
          NOT CLAIMED.
        </h1>

        <p className="about-banner-tagline">Purpose. Precision. Legacy.</p>

        <p className="about-banner-description">BUILT, NOT GIVEN.</p>

        <a href="/collections/all" className="about-banner-button">
          Explore
          <span>↓</span>
        </a>
      </div>
    </section>
  );
}
