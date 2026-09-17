"use client";

import { useEffect, useState } from "react";
import { useWishlist } from "@/lib/wishlist-context";
import { getProductByHandle } from "@/lib/shopify";
import ProductCard from "@/components/ProductCard";
import "./wishlist.css";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);

      try {
        const results = await Promise.all(
          wishlist.map((handle) =>
            getProductByHandle(handle).catch(() => null),
          ),
        );

        setProducts(results.filter(Boolean));
      } catch (error) {
        console.error("Failed to load wishlist products:", error);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    }

    if (wishlist.length > 0) {
      loadProducts();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [wishlist]);

  function handleRemove(handle: string) {
    removeFromWishlist(handle);
  }

  /* =====================================================
     LOADING
  ===================================================== */

  if (loading) {
    return (
      <main className="wishlist-page">
        <div className="wishlist-loading">
          <span className="wishlist-loading-line" />
          <p>LOADING WISHLIST</p>
        </div>
      </main>
    );
  }

  /* =====================================================
     EMPTY
  ===================================================== */

  if (products.length === 0) {
    return (
      <main className="wishlist-page">
        <section className="wishlist-empty">
          <p className="wishlist-empty-eyebrow">OPULENCE COLLECTION</p>

          <h1 className="wishlist-empty-title">Your Wishlist</h1>

          <span className="wishlist-empty-line" />

          <p className="wishlist-empty-text">
            Your wishlist is waiting.
            <br />
            Save the pieces you love and find them here.
          </p>

          <a href="/collections/all" className="wishlist-shop-btn">
            <span>EXPLORE COLLECTION</span>
            <span className="wishlist-btn-arrow">→</span>
          </a>
        </section>
      </main>
    );
  }

  /* =====================================================
     WISHLIST
  ===================================================== */

  return (
    <main className="wishlist-page">
      <section className="wishlist-header">
        <p className="wishlist-eyebrow">OPULENCE COLLECTION</p>

        <h1 className="wishlist-title">Your Wishlist</h1>

        <p className="wishlist-subtitle">
          Pieces selected for your collection.
        </p>
      </section>

      <section className="wishlist-products">
        <div className="wishlist-products-top">
          <span>SAVED PIECES</span>

          <span>
            {products.length} {products.length === 1 ? "ITEM" : "ITEMS"}
          </span>
        </div>

        <div className="wishlist-grid">
          {products.map((product: any) => (
            <div className="wishlist-product-item" key={product.id}>
              {/* REMOVE BUTTON */}

              <button
                type="button"
                className="wishlist-remove"
                onClick={() => handleRemove(product.handle)}
                aria-label={`Remove ${product.title} from wishlist`}
              >
                <span>REMOVE</span>
                <span className="wishlist-remove-x">×</span>
              </button>

              <ProductCard
                product={{
                  ...product,
                  priceRange: {
                    minVariantPrice: product.variants?.edges?.[0]?.node?.price,
                  },
                }}
              />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
