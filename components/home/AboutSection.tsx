import Link from "next/link";
import "./AboutSection.css";

export default function AboutSection() {
  return (
    <section className="about-section">
      <div className="about-section__container">
        <div className="about-section__inner">
          {/* =========================
              EYEBROW
          ========================== */}

          <span className="about-section__eyebrow">ABOUT OPULENCE</span>

          {/* =========================
              MAIN TITLE
          ========================== */}

          <h2 className="about-section__title">
            A Distinctive Character. Perfection In Every Detail.
          </h2>

          {/* =========================
              DESCRIPTION
          ========================== */}

          <p className="about-section__text">
            OPULENCE is built for men who define their own standards. A modern
            expression of confidence, character, discipline and considered
            choice, shaped by wealth, strength, beauty, knowledge and restraint.
          </p>

          {/* =========================
              BUTTON
          ========================== */}

          <Link href="/about" className="about-section__button">
            <span>Discover Six Opulence</span>

            <span className="about-section__button-arrow">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
