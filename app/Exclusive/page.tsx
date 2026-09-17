import { getNewArrivals } from "@/lib/shopify";
import ProductCard from "@/components/ProductCard";
import "./Exclusive.css";

export default async function ExclusivePage() {
  const products = await getNewArrivals(24);

  return (
    <main className="exclusive-page">
      <div className="container">
        <div className="exclusive-header">
          <span className="exclusive-eyebrow">THE LATEST EDIT</span>

          <h1 className="section-title">Exclusive</h1>

          <p className="exclusive-subtitle">
            Discover our latest and most exclusive pieces.
          </p>
        </div>

        {products.length > 0 ? (
          <div className="grid grid-4">
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="exclusive-empty">
            <p>No exclusive products available.</p>
          </div>
        )}
      </div>
    </main>
  );
}
