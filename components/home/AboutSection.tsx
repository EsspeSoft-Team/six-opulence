import Link from "next/link";
import "./AboutSection.css";

export default function AboutSection() {
  return (
    <section className="about-section">
      <div className="container">
        <div className="about-section__inner">
          <span className="section-eyebrow">ABOUT OPULENCE</span>

          <h2 className="title">
            Style Is Not What You Wear.
            <br />
            It Is Who You Become.
          </h2>

          <p className="about-section__text">
            OPULENCE is built for men who believe that style is more than
            appearance. It is confidence, character, discipline, and the freedom
            to define your own standard.
          </p>

          <Link href="/about" className="about-section__button">
            Discover Our Story
            <span>→</span>
          </Link>

          <div className="about-section__line" />

          {/* <div className="about-section__values">
            <div className="about-section__value">
              <span>01</span>
              <h3>STYLE</h3>
              <p>Designed with intention. Made to leave an impression.</p>
            </div>

            <div className="about-section__value">
              <span>02</span>
              <h3>SUBSTANCE</h3>
              <p>Quality, confidence and character behind every piece.</p>
            </div>

            <div className="about-section__value">
              <span>03</span>
              <h3>SELF-MADE</h3>
              <p>For those who build their own identity and their own path.</p>
            </div>
          </div> */}
        </div>
      </div>
    </section>
  );
}
