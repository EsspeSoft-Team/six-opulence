"use client";

import "./Stockists.css";

const stockists = [
  {
    city: "WEALTH",
    svg: "/images/one-re.png",
    title: "THE POWER TO CHOOSE.",
    paragraphs: ["Choose quality over quantity.", "Build with intention."],
  },
  {
    city: "STRENGTH",
    svg: "/images/two-re.png",
    title: "THE CONFIDENCE TO STAND ALONE.",
    paragraphs: ["Stand with quiet confidence.", "Let presence speak."],
  },
  {
    city: "FAME",
    svg: "/images/three-re.png",
    title: "THE POWER TO BE REMEMBERED.",
    paragraphs: ["Leave an impression.", "Create a presence that lasts."],
  },
  {
    city: "BEAUTY",
    svg: "/images/four-re.png",
    title: "THE ART OF BEING CONSIDERED.",
    paragraphs: ["Every detail has a purpose.", "Nothing is accidental."],
  },
  {
    city: "KNOWLEDGE",
    svg: "/images/five-re.png",
    title: "THE LUXURY OF KNOWING.",
    paragraphs: [
      "Know what deserves to be worn.",
      "Let taste speak for itself.",
    ],
  },
  {
    city: "RESTRAINT",
    svg: "/images/six-re.png",
    title: "THE HIGHEST FORM OF OPULENCE.",
    paragraphs: ["Choose less. Mean more.", "Let craftsmanship speak."],
  },
];

export default function Stockists() {
  return (
    <section id="Stockists" className="section-stockists">
      <div className="container-stockists">
        {/* TOP TITLE + DESCRIPTION */}

        <div className="stockists-intro">
          <div className="stockists-intro-title">The Six Opulences</div>

          <div className="stockists-intro-line" />

          <div className="stockists-intro-description">
            Six expressions of what it means to build your own.
          </div>
        </div>

        {/* SIX OPULENCES */}

        <div className="stockists-icons-row">
          {stockists.map((item) => (
            <div key={item.city} className="stockists-icon-item">
              {/* ICON */}

              <div className="stockists-icon">
                <img src={item.svg} alt={item.city} />
              </div>

              {/* CATEGORY */}

              <div className="stockists-city">{item.city}</div>

              {/* SHORT CONTENT */}

              <div className="stockists-item-content">
                <div className="stockists-item-title">{item.title}</div>

                <div className="stockists-item-caption">
                  {item.paragraphs.map((paragraph, index) => (
                    <p key={index}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
