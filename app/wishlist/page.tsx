"use client";

import { useEffect, useState } from "react";

import { useWishlist } from "@/lib/wishlist-context";
import { getProducts } from "@/lib/shopify";

import ProductCard from "@/components/ProductCard";

import "./wishlist.css";

export default function WishlistPage() {
  const { wishlist, removeFromWishlist } = useWishlist();

  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  /* ============================================================
     LOAD WISHLIST PRODUCTS
  ============================================================ */

  useEffect(() => {
    let cancelled = false;

    async function loadProducts() {
      setLoading(true);

      try {
        /*
         * Shopify theke products niye ashchi.
         * Saved wishlist handle-er sathe match korbo.
         */
        const allProducts = await getProducts(50);

        if (cancelled) {
          return;
        }

        const savedHandles = new Set(
          wishlist.map((handle) => handle?.trim()).filter(Boolean),
        );

        /*
         * Wishlist-er sathe Shopify product handle match
         */
        const matchedProducts = allProducts.filter(
          (product: any) => product?.handle && savedHandles.has(product.handle),
        );

        setProducts(matchedProducts);

        /*
         * Jodi old/stale handle thake,
         * automatically remove kore dibo.
         *
         * Example:
         * wishlist = [valid-product, old-product]
         *
         * old-product Shopify-te na thakle
         * ota wishlist theke remove hobe.
         */
        const matchedHandles = new Set(
          matchedProducts.map((product: any) => product.handle),
        );

        const staleHandles = wishlist.filter(
          (handle) => !matchedHandles.has(handle),
        );

        if (staleHandles.length > 0) {
          staleHandles.forEach((handle) => {
            removeFromWishlist(handle);
          });
        }
      } catch (error) {
        console.error("Failed to load wishlist products:", error);

        if (!cancelled) {
          setProducts([]);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    /*
     * Wishlist empty
     */
    if (wishlist.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    loadProducts();

    return () => {
      cancelled = true;
    };
  }, [wishlist, removeFromWishlist]);

  /* ============================================================
     REMOVE
  ============================================================ */

  function handleRemove(handle: string) {
    removeFromWishlist(handle);
  }

  /* ============================================================
     LOADING
  ============================================================ */

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

  /* ============================================================
     EMPTY
  ============================================================ */

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

  /* ============================================================
     WISHLIST PRODUCTS
  ============================================================ */

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

              {/* PRODUCT */}

              <ProductCard product={product} />
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
