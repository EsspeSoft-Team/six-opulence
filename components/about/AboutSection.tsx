import "./AboutSection.css";
import Link from "next/link";
import Image from "next/image";

const aboutFeatures = [
  {
    number: "01",
    title: "CONSIDERED DESIGN",
    text: "Refined silhouettes.\nNothing without purpose.",
  },
  {
    number: "02",
    title: "THE CRAFT",
    text: "Thoughtful fabrics.\nEnduring finishes.",
  },
  {
    number: "03",
    title: "LIMITED BY CHOICE",
    text: "Fewer pieces.\nGreater distinction.",
  },
];

export default function AboutSection() {
  return (
    <section className="about-section1">
      <div className="about-section1__inner">
        {/* =========================================
            IMAGE
        ========================================== */}

        <div className="about-image-wrap">
          <div className="about-image">
            <Image
              src="/images/DESKTOP_-_WEB_-_DENIM_b7277e3d-4d4a-48d2-b833-9f195d7ce86f.webp"
              alt="Opulence craftsmanship"
              fill
              sizes="(max-width: 767px) 100vw, 50vw"
            />

            <div className="about-image-overlay" />

            <div className="about-image-top-label">
              <span>01</span>
              <span>THE OPULENCE STORY</span>
            </div>

            <div className="about-image-caption">
              <div>
                <span className="caption-label">OPULENCE</span>
                <span className="caption-sub">EST. 2026</span>
              </div>

              <span className="caption-mark">O</span>
            </div>
          </div>
        </div>

        {/* =========================================
            CONTENT
        ========================================== */}

        <div className="about-content">
          <div className="about-content-top">
            <div className="about-meta">
              <span className="section-eyebrow">THE OPULENCE STORY</span>

              <span className="about-meta-line" />

              <span className="about-meta-number">01 / 03</span>
            </div>

            <h2 className="about-title">
              Made With
              <br />
              Intention.
            </h2>

            <p className="about-lead">
              Luxury should feel considered, never excessive.
            </p>

            <div className="about-description">
              <p>
                OPULENCE is defined by what is chosen, refined and made to
                endure.
              </p>

              <p>
                From considered fabrics to precise silhouettes, every piece is
                shaped with purpose and designed beyond the season.
              </p>
            </div>
          </div>

          {/* =========================================
              FEATURES
          ========================================== */}

          <div className="about-features">
            {aboutFeatures.map((feature) => (
              <div className="about-feature" key={feature.number}>
                <span className="about-feature-number">{feature.number}</span>

                <div className="about-feature-content">
                  <h3>{feature.title}</h3>

                  <p>
                    {feature.text.split("\n").map((line, index) => (
                      <span key={index}>
                        {line}
                        {index === 0 && <br />}
                      </span>
                    ))}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* =========================================
              BOTTOM
          ========================================== */}

          <div className="about-bottom">
            <Link href="/collections/all" className="about-link">
              <span>DISCOVER THE COLLECTION</span>

              <span className="about-link-circle">↗</span>
            </Link>

            <span className="about-bottom-note">DESIGNED IN INDIA</span>
          </div>
        </div>
      </div>
    </section>
  );
}
