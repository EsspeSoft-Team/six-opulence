import { getRelatedProducts } from "@/lib/shopify";
import ProductCard from "./ProductCard";

export default async function RelatedProducts({
  productId,
}: {
  productId: string;
}) {
  const related = await getRelatedProducts(productId);

  // Kono related product na thakle section show korbe na
  if (!related || related.length === 0) {
    return null;
  }

  // Shudhu first 4 ta product show korbe
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
