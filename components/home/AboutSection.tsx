import "./AboutSection.css";
import Link from "next/link";
import Image from "next/image";

const aboutFeatures = [
  {
    number: "01",
    title: "Thoughtful Design",
    text: "Every detail is considered.",
  },
  {
    number: "02",
    title: "Premium Quality",
    text: "Made with fabrics that endure.",
  },
  {
    number: "03",
    title: "Limited by Choice",
    text: "Less quantity. More meaning.",
  },
];

export default function AboutSection() {
  return (
    <section className="about-section">
      {/* ================= IMAGE ================= */}
      <div className="about-image-wrap">
        <div className="about-image">
          <Image
            src="/images/DESKTOP_-_WEB_-_DENIM_b7277e3d-4d4a-48d2-b833-9f195d7ce86f.webp"
            alt="Opulence craftsmanship"
            fill
            sizes="(max-width: 900px) 100vw, 50vw"
            style={{ objectFit: "cover" }}
          />
        </div>

        <div className="about-image-caption">
          <span>OPULENCE</span>
          <span>EST. 2026</span>
        </div>
      </div>

      {/* ================= CONTENT ================= */}
      <div className="about-content">
        <div className="about-intro">
          <p className="section-eyebrow">The Opulence Story</p>

          <span className="about-small-mark">—</span>

          <h2 className=" title">
            MADE WITH
            <br />
            <em>INTENTION.</em>
          </h2>
        </div>

        <div className="about-description-wrap">
          <p className="about-desc">
            Opulence is built around a simple idea — exceptional clothing should
            feel considered, not excessive.
          </p>

          <p className="about-desc secondary">
            From the fabric we choose to the silhouettes we create, every piece
            is designed with purpose, refined through detail, and made to stay
            relevant beyond a season.
          </p>
        </div>

        {/* ================= FEATURES ================= */}
        <div className="about-features">
          {aboutFeatures.map((feature) => (
            <div className="about-feature" key={feature.number}>
              <span className="about-feature-number">{feature.number}</span>

              <div className="about-feature-content">
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ================= BOTTOM ================= */}
        <div className="about-bottom">
          <Link href="/about" className="about-link">
            <span>Discover Our Story</span>

            <span className="about-link-arrow">↗</span>
          </Link>

          <span className="about-bottom-note">Designed in India</span>
        </div>
      </div>
    </section>
  );
}
