import "./search.css";
import { searchProducts } from "@/lib/shopify";
import ProductCard from "@/components/ProductCard";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: { q?: string };
}) {
  const query = searchParams.q || "";
  const products = query ? await searchProducts(query) : [];

  return (
    <div className="search-hero">
      <div className="container">
        <p className="section-eyebrow" style={{ textAlign: "center" }}>Find Your Piece</p>
        <h1 className="search-title">What are you looking for?</h1>

        <form action="/search" className="search-form">
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search graphic tees, polos, oversized fits..."
          />
          <button type="submit" className="btn btn-solid">Search</button>
        </form>

        {query && (
          <p className="search-result-count">
            {products.length} result{products.length !== 1 ? "s" : ""} for "{query}"
          </p>
        )}

        {products.length > 0 && (
          <div className="grid grid-4" style={{ marginTop: 40 }}>
            {products.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
