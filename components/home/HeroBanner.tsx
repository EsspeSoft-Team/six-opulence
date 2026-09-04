import Link from "next/link";

export default function HeroBanner() {
  return (
    <section className="hero">
      <p className="hero-eyebrow">Limited Edition Drop</p>
      <h1>OPULENCE</h1>
      <p>
        2,000 pieces. 11 designs. Crafted for those who refuse the ordinary.
        Once sold, it's gone forever.
      </p>
      <Link href="/new-arrivals" className="btn btn-primary">
        Shop The Collection
      </Link>
    </section>
  );
}
