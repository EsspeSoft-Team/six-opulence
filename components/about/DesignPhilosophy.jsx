import "./DesignPhilosophy.css";

const philosophyItems = [
  {
    number: "01",
    title: "REFINED SILHOUETTES",
    text: "Clean proportions designed to feel effortless, confident and distinctly modern.",
  },
  {
    number: "02",
    title: "CONSIDERED MATERIALS",
    text: "Fabrics are selected for their texture, comfort and ability to remain relevant beyond a season.",
  },
  {
    number: "03",
    title: "DISTINCTIVE DETAILS",
    text: "Subtle finishes and considered details give every piece its own identity without excess.",
  },
];

export default function DesignPhilosophy() {
  return (
    <section className="design-philosophy">
      <div className="design-philosophy__top">
        <div className="design-philosophy__eyebrow">
          <span>OUR DESIGN PHILOSOPHY</span>
        </div>

        <h2>
          Designed With Intent. <br /> Defined By Restraint.
        </h2>
      </div>

      <div className="design-philosophy__intro">
        <p className="design-philosophy__lead">
          Great menswear begins with purpose. Every choice is considered, from
          proportion and fabric to the smallest detail.
        </p>

        <p className="design-philosophy__description">
          From the way a silhouette falls to the texture of a fabric, OPULENCE
          is built around details that feel intentional rather than excessive.
        </p>
      </div>

      <div className="design-philosophy__items">
        {philosophyItems.map((item) => (
          <article className="design-philosophy__item" key={item.number}>
            <span className="design-philosophy__number">{item.number}</span>

            <div className="design-philosophy__item-content">
              <h3>{item.title}</h3>

              <p>{item.text}</p>
            </div>
          </article>
        ))}
      </div>

      <div className="design-philosophy__bottom">
        <span>LESS NOISE</span>

        <span className="design-philosophy__line" />

        <span>MORE CHARACTER</span>
      </div>
    </section>
  );
}
