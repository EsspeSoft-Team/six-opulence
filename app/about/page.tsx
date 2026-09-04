import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="container" style={{ paddingTop: 48 }}>
      <p className="section-eyebrow">About Opulence</p>
      <h1 className="section-title" style={{ fontSize: 36, maxWidth: 600 }}>
        Crafted With Purpose. Worn With Pride.
      </h1>
      <p style={{ maxWidth: 600, color: "#555", lineHeight: 1.7, marginBottom: 40 }}>
        Opulence is a limited-run menswear label built around one idea:
        premium quality shouldn't mean mass production. Our first collection
        is a fixed lot of 2,000 pieces across 11 designs — graphic tees,
        oversized fits, and heritage-inspired polos. Once a design sells out,
        it will not be restocked.
      </p>
      <div className="pdp-image" style={{ maxWidth: 700, aspectRatio: "16/9" }}>
        <Image
          src="/placeholders/about-page.svg"
          alt="Opulence"
          fill
          style={{ objectFit: "cover" }}
        />
      </div>
    </div>
  );
}
