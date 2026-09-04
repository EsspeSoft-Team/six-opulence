import Link from "next/link";
import Image from "next/image";

export default function FeaturedCollection({ collection }: { collection: any }) {
  if (!collection) return null;

  return (
    <section className="featured-collection">
      {collection.image && (
        <Image
          src={collection.image.url}
          alt={collection.image.altText || collection.title}
          fill
          style={{ objectFit: "cover" }}
        />
      )}
      <div className="featured-overlay">
        <p className="eyebrow">The Elevated Capsule</p>
        <h2>{collection.title}</h2>
        <Link href={`/collections/${collection.handle}`} className="btn btn-primary">
          Explore
        </Link>
      </div>
    </section>
  );
}
