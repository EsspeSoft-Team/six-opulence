import { getRelatedProducts } from "@/lib/shopify";
import ProductCard from "./ProductCard";

export default async function RelatedProducts({
  productId,
}: {
  productId: string;
}) {
  const related = await getRelatedProducts(productId);

  if (!related || related.length === 0) return null;

  return (
    <section className="section" style={{ marginTop: 64 }}>
      <h2 className="section-title">You May Also Like</h2>
      <div className="grid grid-4">
        {related.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
