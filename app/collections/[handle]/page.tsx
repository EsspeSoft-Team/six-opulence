import { getCollectionByHandle } from "@/lib/shopify";
import ProductCard from "@/components/ProductCard";

export default async function CollectionPage({
  params,
}: {
  params: { handle: string };
}) {
  const collection = await getCollectionByHandle(params.handle);

  if (!collection) {
    return <p>Collection not found.</p>;
  }

  const products = collection.products.edges.map((edge: any) => edge.node);

  return (
    <div className="container">
      <h1 className="section-title">{collection.title}</h1>
      {collection.description && (
        <p style={{ color: "#666", marginBottom: 24 }}>{collection.description}</p>
      )}
      <div className="grid grid-4">
        {products.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
