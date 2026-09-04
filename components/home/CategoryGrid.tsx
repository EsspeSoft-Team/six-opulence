import Link from "next/link";
import Image from "next/image";

const productTypeTiles = [
  { type: "Tee", label: "Graphic Tees" },
  { type: "Oversized Tee", label: "Oversized Tees" },
  { type: "Polo", label: "Polos" },
];

export function ProductTypeCategoryGrid() {
  return (
    <section className="section">
      <h2 className="section-title">Shop By Style</h2>
      <div className="grid grid-3">
        {productTypeTiles.map((tile) => (
          <Link
            key={tile.type}
            href={`/search?q=${encodeURIComponent(tile.type)}`}
            className="category-tile"
          >
            <span>{tile.label}</span>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function CollectionsCategoryGrid({ collections }: { collections: any[] }) {
  if (!collections || collections.length === 0) return null;

  return (
    <section className="section">
      <h2 className="section-title">Shop By Category</h2>
      <div className="grid grid-4">
        {collections.map((collection) => (
          <Link key={collection.id} href={`/collections/${collection.handle}`}>
            <div className="product-image-wrap">
              {collection.image && (
                <Image
                  src={collection.image.url}
                  alt={collection.image.altText || collection.title}
                  fill
                  style={{ objectFit: "cover" }}
                />
              )}
            </div>
            <p className="product-title" style={{ textAlign: "center" }}>
              {collection.title}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
