import { getNewArrivals } from "@/lib/shopify";
import ProductCard from "@/components/ProductCard";

export default async function NewArrivalsPage() {
  const products = await getNewArrivals(24);

  return (
    <div className="container">
      <h1 className="section-title">New Arrivals</h1>
      <div className="grid grid-4">
        {products.map((product: any) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
