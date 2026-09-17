import { getProducts } from "@/lib/shopify";
import ProductCard from "@/components/ProductCard";
import "./search.css";

type SearchPageProps = {
  searchParams: {
    q?: string;
  };
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const query = (searchParams?.q || "").trim();

  const products = await getProducts(50);

  const searchResults = query
    ? products.filter((product: any) => {
        const searchText = [
          product.title,
          product.handle,
          product.description,
          product.productType,
          product.vendor,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchText.includes(query.toLowerCase());
      })
    : [];

  return (
    <main className="search-page">
      <div className="search-page-container">
        {/* =================================================
            HEADER
        ================================================= */}

        <div className="search-page-header">
          <span className="search-page-eyebrow">OPULENCE SEARCH</span>

          <h1>{query ? `Search results for "${query}"` : "Search"}</h1>

          {query && (
            <p>
              {searchResults.length}{" "}
              {searchResults.length === 1 ? "product" : "products"} found
            </p>
          )}
        </div>

        {/* =================================================
            RESULTS
        ================================================= */}

        {query ? (
          searchResults.length > 0 ? (
            <div className="search-product-grid">
              {searchResults.map((product: any) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="search-no-results">
              <div className="search-no-results-title">No products found</div>

              <p>We couldn't find anything matching "{query}".</p>

              <a href="/collections/all">
                VIEW ALL PRODUCTS
                <span>→</span>
              </a>
            </div>
          )
        ) : (
          <div className="search-empty">
            <div className="search-empty-title">What are you looking for?</div>

            <p>Search for polos, t-shirts and more.</p>
          </div>
        )}
      </div>
    </main>
  );
}
