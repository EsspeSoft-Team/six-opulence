"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import "./ShopCatalog.css";

type ShopCatalogProps = {
  products: any[];
  currentHandle: string;
};

export default function ShopCatalog({
  products,
  currentHandle,
}: ShopCatalogProps) {
  const [sort, setSort] = useState("featured");

  const [openFilter, setOpenFilter] = useState<string | null>(null);

  /* =====================================================
     SORT PRODUCTS
  ===================================================== */

  const sortedProducts = useMemo(() => {
    const items = [...products];

    if (sort === "price-low") {
      items.sort(
        (a, b) =>
          Number(a.priceRange?.minVariantPrice?.amount || a.price || 0) -
          Number(b.priceRange?.minVariantPrice?.amount || b.price || 0),
      );
    }

    if (sort === "price-high") {
      items.sort(
        (a, b) =>
          Number(b.priceRange?.minVariantPrice?.amount || b.price || 0) -
          Number(a.priceRange?.minVariantPrice?.amount || a.price || 0),
      );
    }

    if (sort === "name") {
      items.sort((a, b) =>
        String(a.title || "").localeCompare(String(b.title || "")),
      );
    }

    return items;
  }, [products, sort]);

  /* =====================================================
     FILTER ACCORDION
  ===================================================== */

  function toggleFilter(name: string) {
    setOpenFilter((current) => (current === name ? null : name));
  }

  return (
    <section className="catalog-section">
      <div className="catalog-container">
        <div className="catalog-layout">
          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="catalog-sidebar">
            <div className="sidebar-title">
              <span>SHOP</span>
            </div>

            {/* CATEGORY */}

            <div className="sidebar-block">
              <div className="sidebar-heading">CATEGORIES</div>

              <nav className="category-list">
                <Link
                  href="/collections/all"
                  className={currentHandle === "all" ? "active" : ""}
                >
                  <span>All Products</span>
                  <span>→</span>
                </Link>

                <Link
                  href="/collections/polo"
                  className={currentHandle === "polo" ? "active" : ""}
                >
                  <span>Polo</span>
                  <span>→</span>
                </Link>

                <Link
                  href="/collections/t-shirts"
                  className={currentHandle === "t-shirts" ? "active" : ""}
                >
                  <span>T-Shirts</span>
                  <span>→</span>
                </Link>
              </nav>
            </div>

            {/* FILTERS */}

            <div className="sidebar-block filters-block">
              <div className="sidebar-heading">FILTER BY</div>

              {/* SIZE */}

              <div className="filter-item">
                <button type="button" onClick={() => toggleFilter("size")}>
                  <span>SIZE</span>

                  <span
                    className={
                      openFilter === "size"
                        ? "filter-plus rotate"
                        : "filter-plus"
                    }
                  >
                    +
                  </span>
                </button>

                {openFilter === "size" && (
                  <div className="filter-content">
                    <span>S</span>
                    <span>M</span>
                    <span>L</span>
                    <span>XL</span>
                    <span>XXL</span>
                  </div>
                )}
              </div>

              {/* COLOUR */}

              <div className="filter-item">
                <button type="button" onClick={() => toggleFilter("colour")}>
                  <span>COLOUR</span>

                  <span
                    className={
                      openFilter === "colour"
                        ? "filter-plus rotate"
                        : "filter-plus"
                    }
                  >
                    +
                  </span>
                </button>

                {openFilter === "colour" && (
                  <div className="filter-content">
                    <span>White</span>
                    <span>Black</span>
                    <span>Olive</span>
                    <span>Navy</span>
                    <span>Blue</span>
                  </div>
                )}
              </div>

              {/* PRICE */}

              <div className="filter-item">
                <button type="button" onClick={() => toggleFilter("price")}>
                  <span>PRICE</span>

                  <span
                    className={
                      openFilter === "price"
                        ? "filter-plus rotate"
                        : "filter-plus"
                    }
                  >
                    +
                  </span>
                </button>

                {openFilter === "price" && (
                  <div className="filter-content">
                    <span>Under ₹4,000</span>
                    <span>₹4,000 – ₹5,000</span>
                    <span>Above ₹5,000</span>
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* =================================================
              PRODUCTS
          ================================================= */}

          <div className="catalog-main">
            {/* TOOLBAR */}

            <div className="catalog-toolbar">
              <div className="catalog-count">
                <strong>{sortedProducts.length}</strong>

                <span>
                  {sortedProducts.length === 1 ? " PRODUCT" : " PRODUCTS"}
                </span>
              </div>

              <div className="catalog-sort">
                <label htmlFor="shop-sort">SORT BY</label>

                <select
                  id="shop-sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="featured">Featured</option>

                  <option value="name">Name</option>

                  <option value="price-low">Price: Low to High</option>

                  <option value="price-high">Price: High to Low</option>
                </select>
              </div>
            </div>

            {/* PRODUCT GRID */}

            {sortedProducts.length > 0 ? (
              <div className="catalog-grid">
                {sortedProducts.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="catalog-empty">
                <p>No products available.</p>

                <Link href="/collections/all">Explore Collection</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
