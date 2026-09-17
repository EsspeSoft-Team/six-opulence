"use client";

import "./AllProductsSection.css";
import { useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";

type TabKey = "all" | "polo" | "t-shirt";

type Product = {
  id?: string;
  handle?: string;
  title?: string;
  price?: string;
  compareAtPrice?: string;
  image?: {
    url?: string;
    altText?: string | null;
  };
  variants?: {
    id: string;
    title?: string;
  }[];
};

const tabs: { key: TabKey; label: string }[] = [
  {
    key: "all",
    label: "ALL PRODUCTS",
  },
  {
    key: "polo",
    label: "POLO",
  },
  {
    key: "t-shirt",
    label: "T-SHIRT",
  },
];

export default function AllProductsSection({
  all = [],
  polo = [],
  tshirt = [],
}: {
  all?: Product[];
  polo?: Product[];
  tshirt?: Product[];
}) {
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  const productsByTab: Record<TabKey, Product[]> = {
    all: all || [],
    polo: polo || [],
    "t-shirt": tshirt || [],
  };

  const activeProducts = (productsByTab[activeTab] || [])
    .filter((product): product is Product => Boolean(product))
    .slice(0, 8);

  return (
    <section className="all-products-section">
      <div className="container">
        {/* Section Header */}
        <div className="section-header-centered">
          <p className="section-eyebrow">Shop</p>

          <h2 className="section-title-centered title">All Products</h2>

          <p className="section-subtext-centered para">
            Browse the full collection, or filter by style.
          </p>
        </div>

        {/* Product Tabs */}
        <div className="product-tabs">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className={`product-tab ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Products */}
        {activeProducts.length === 0 ? (
          <div className="all-products-empty">
            <p>No products in this category yet.</p>
          </div>
        ) : (
          <div className="all-products-grid">
            {activeProducts.map((product, index) => {
              const productKey =
                product?.id ||
                product?.handle ||
                `product-${activeTab}-${index}`;

              return (
                <div key={productKey} className="all-product-item">
                  <ProductCard product={product} />
                </div>
              );
            })}
          </div>
        )}

        {/* View All */}
        <div className="all-products-view-all">
          <Link href="/collections/all" className="all-products-button">
            <span>View All Products</span>
            <span className="all-products-button-arrow">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
