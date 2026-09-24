import "./AboutStorySection.css";
import Image from "next/image";
import Link from "next/link";

export default function AboutStorySection() {
  return (
    <section className="op-about-story">
      {/* =========================================
          TOP STORY
      ========================================== */}

      <div className="op-about-top">
        {/* BELIEF */}
        <div className="op-belief">
          <span className="op-eyebrow">OUR BELIEF</span>

          <h2>
            Luxury Is Earned. Built Through Choice, Discipline, and Character.
          </h2>
        </div>

        {/* INTRO */}
        <div className="op-intro">
          <p>
            OPULENCE is made for the ones who build their own standard, choose
            with intent, and let character speak.
          </p>

          {/* <Link href="/about" className="op-story-link">
            <span className="op-story-line"></span>

            <span>LEARN MORE</span>
          </Link> */}
        </div>

        {/* PORTRAIT IMAGE */}
        <div className="op-top-image">
          <Image
            src="/images/b3.png"
            alt="Opulence"
            fill
            sizes="(max-width: 767px) 100vw, 28vw"
          />

          <div className="op-image-side-label">
            <span>TIMELESS</span>
            <span>DISCIPLINED</span>
            <span>DISTINCTIVE</span>
          </div>

          <div className="op-image-number">01</div>
        </div>
      </div>

      {/* =========================================
          BOTTOM STORY
      ========================================== */}

      <div className="op-about-bottom">
        {/* LARGE IMAGE */}

        <div className="op-story-image">
          <Image
            src="/images/ban1.jpeg"
            alt="The Opulence Story"
            fill
            sizes="(max-width: 767px) 100vw, 47vw"
          />

          <div className="op-story-image-caption">
            <span>OPULENCE</span>

            <span>EST. 2026</span>
          </div>
        </div>

        {/* BEGINNING */}

        <div className="op-beginning">
          <div className="op-beginning-main">
            <span className="op-eyebrow">THE BEGINNING</span>

            <h2>A New Definition </h2>

            <p>
              OPULENCE began with a simple belief: Luxury is not about excess.
              It is about what you choose.
            </p>
          </div>

          {/* JOURNEY */}

          <div className="op-journey">
            <p>
              Every piece is shaped with intention, refined through detail and
              made to endure. We create for the personality who values character
              over noise, substance over trends, and distinction over display.
            </p>

            {/* <Link href="/about" className="op-story-link">
              <span className="op-story-line"></span>

              <span>OUR JOURNEY</span>
            </Link> */}
          </div>
        </div>
      </div>
    </section>
  );
}
