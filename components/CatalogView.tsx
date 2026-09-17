"use client";

import { useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";

type CatalogViewProps = {
  products: any[];
  title: string;
};

type SortOption = "popular" | "newest" | "price-low" | "price-high";

export default function CatalogView({ products, title }: CatalogViewProps) {
  const [sort, setSort] = useState<SortOption>("popular");

  const [view, setView] = useState<"grid" | "compact">("grid");

  /* =========================================================
     SORT PRODUCTS
  ========================================================= */

  const sortedProducts = useMemo(() => {
    const items = [...products];

    if (sort === "price-low") {
      items.sort((a, b) => {
        const priceA = Number(a?.priceRange?.minVariantPrice?.amount || 0);

        const priceB = Number(b?.priceRange?.minVariantPrice?.amount || 0);

        return priceA - priceB;
      });
    }

    if (sort === "price-high") {
      items.sort((a, b) => {
        const priceA = Number(a?.priceRange?.minVariantPrice?.amount || 0);

        const priceB = Number(b?.priceRange?.minVariantPrice?.amount || 0);

        return priceB - priceA;
      });
    }

    /*
     * Popular and newest:
     * Keep Shopify returned order.
     */

    return items;
  }, [products, sort]);

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="catalog-view">
      {/* =====================================================
          TOP BAR
      ===================================================== */}

      <div className="catalog-top">
        {/* TITLE */}

        <div className="catalog-title-area">
          <h1>{title}</h1>

          <span>{products.length} PRODUCTS</span>
        </div>

        {/* ===================================================
            ACTIONS
        =================================================== */}

        <div className="catalog-actions">
          <span className="sort-label">SORT BY</span>

          <select
            className="catalog-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value as SortOption)}
            aria-label="Sort products"
          >
            <option value="popular">Popular</option>

            <option value="newest">Newest</option>

            <option value="price-low">Price: Low to High</option>

            <option value="price-high">Price: High to Low</option>
          </select>

          {/* GRID */}

          <button
            type="button"
            className={`view-icon ${view === "grid" ? "active" : ""}`}
            onClick={() => setView("grid")}
            aria-label="3 column grid"
            title="Grid View"
          >
            <span className="grid-view-icon">
              <i />
              <i />
              <i />
              <i />
            </span>
          </button>

          {/* COMPACT */}

          <button
            type="button"
            className={`view-icon ${view === "compact" ? "active" : ""}`}
            onClick={() => setView("compact")}
            aria-label="2 column grid"
            title="Compact Grid"
          >
            <span className="list-view-icon">
              <i />
              <i />
              <i />
            </span>
          </button>
        </div>
      </div>

      {/* =====================================================
          PRODUCTS
      ===================================================== */}

      <div
        className={
          view === "grid"
            ? "catalog-product-grid"
            : "catalog-product-grid compact-view"
        }
      >
        {sortedProducts.length > 0 ? (
          sortedProducts.map((product: any) => (
            <ProductCard key={product.id} product={product} />
          ))
        ) : (
          <div className="catalog-empty">No products available.</div>
        )}
      </div>
    </div>
  );
}
