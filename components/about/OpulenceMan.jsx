import "./OpulenceMan.css";
import Image from "next/image";

const identityPoints = [
  {
    number: "01",
    title: "CONFIDENT",
    text: "Knows who he is.\nNever needs to announce it.",
  },
  {
    number: "02",
    title: "CONSIDERED",
    text: "Every choice is intentional.\nNothing without purpose.",
  },
  {
    number: "03",
    title: "INDIVIDUAL",
    text: "Follows his own standard.\nNever the crowd.",
  },
];

export default function OpulenceMan() {
  return (
    <section className="opulence-man">
      {/* =========================================
          TOP LABEL
      ========================================== */}

      <div className="opulence-man__top">
        <div className="opulence-man__eyebrow">
          <span>THE OPULENCE MAN</span>
        </div>

        <div className="opulence-man__statement">
          <span>For Those Who</span>
          <span>Build Their Own</span>
          Standard.
        </div>
      </div>

      {/* =========================================
          MAIN VISUAL
      ========================================== */}

      <div className="opulence-man__visual">
        <div className="opulence-man__image">
          <Image
            src="/images/ban3.png"
            alt="The Opulence Man"
            fill
            sizes="(max-width: 767px) 100vw, 70vw"
          />

          <div className="opulence-man__image-overlay" />

          <div className="opulence-man__image-meta">
            <span>OPULENCE</span>
            <span>EST. 2026</span>
          </div>

          <div className="opulence-man__image-number">03</div>
        </div>

        {/* =========================================
            SIDE MESSAGE
        ========================================== */}

        <div className="opulence-man__message">
          <span className="opulence-man__message-label">PERSPECTIVE</span>

          <h2>
            He does not dress for approval.
            <br />
            He dresses with intent.
          </h2>

          <p>
            The Opulence personality is self-made, selective and quietly
            assured. He values{" "}
            <strong>discipline, character and distinction</strong>
            over noise.
          </p>
        </div>
      </div>

      {/* =========================================
          IDENTITY
      ========================================== */}

      <div className="opulence-man__identity">
        {identityPoints.map((item) => (
          <article className="opulence-man__identity-item" key={item.number}>
            <span className="opulence-man__identity-number">{item.number}</span>

            <div>
              <h3>{item.title}</h3>

              <p>
                {item.text.split("\n").map((line, index) => (
                  <span key={index}>
                    {line}
                    {index === 0 && <br />}
                  </span>
                ))}
              </p>
            </div>
          </article>
        ))}
      </div>

      {/* =========================================
          CLOSING STATEMENT
      ========================================== */}

      <div className="opulence-man__closing">
        <span className="opulence-man__closing-line" />

        <p>
          Style is not about following a standard.
          <br />
          It is about creating your own.
        </p>

        <span className="opulence-man__closing-line" />
      </div>
    </section>
  );
}
