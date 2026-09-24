import { getRelatedProducts } from "@/lib/shopify";
import ProductCard from "./ProductCard";

export default async function RelatedProducts({
  productId,
  productType,
}: {
  productId: string;
  productType: string;
}) {
  const related = await getRelatedProducts(productId, productType, 4);

  if (!related || related.length === 0) {
    return null;
  }

  const productsToShow = related.slice(0, 4);

  return (
    <section
      className="section"
      style={{
        marginTop: 64,
      }}
    >
      <h2 className="section-title">You May Also Like</h2>

      <div className="grid grid-4">
        {productsToShow.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
