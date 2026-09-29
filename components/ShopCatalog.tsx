"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import "./ShopCatalog.css";

type ShopCatalogProps = {
  products: any[];
  currentHandle: string;
};

type FilterName = "size" | "colour" | "price" | null;

export default function ShopCatalog({
  products,
  currentHandle,
}: ShopCatalogProps) {
  const [sort, setSort] = useState("featured");
  const [openFilter, setOpenFilter] = useState<FilterName>(null);

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const [selectedColours, setSelectedColours] = useState<string[]>([]);
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);

  /* =====================================================
     GET PRODUCT PRICE FROM SHOPIFY
  ===================================================== */

  function getProductPrice(product: any) {
    return Number(
      product?.priceRange?.minVariantPrice?.amount ||
        product?.variants?.edges?.[0]?.node?.price?.amount ||
        product?.variants?.[0]?.price?.amount ||
        0,
    );
  }

  /* =====================================================
     GET SIZE + COLOUR FROM SHOPIFY
  ===================================================== */

  function getProductOptions(product: any) {
    const result = {
      size: [] as string[],
      colour: [] as string[],
    };

    /*
      Shopify product options
    */

    const options = Array.isArray(product?.options) ? product.options : [];

    options.forEach((option: any) => {
      const name = String(option?.name || "")
        .trim()
        .toLowerCase();

      const values = Array.isArray(option?.values) ? option.values : [];

      if (name === "size" || name === "sizes") {
        result.size.push(...values.map(String));
      }

      if (
        name === "color" ||
        name === "colour" ||
        name === "colors" ||
        name === "colours"
      ) {
        result.colour.push(...values.map(String));
      }
    });

    /*
      Shopify variant selectedOptions fallback
    */

    const variants = product?.variants?.edges
      ? product.variants.edges.map((edge: any) => edge?.node).filter(Boolean)
      : Array.isArray(product?.variants)
        ? product.variants
        : [];

    variants.forEach((variant: any) => {
      const selectedOptions = Array.isArray(variant?.selectedOptions)
        ? variant.selectedOptions
        : [];

      selectedOptions.forEach((option: any) => {
        const name = String(option?.name || "")
          .trim()
          .toLowerCase();

        const value = option?.value;

        if (!value) return;

        if (name === "size" || name === "sizes") {
          result.size.push(String(value));
        }

        if (
          name === "color" ||
          name === "colour" ||
          name === "colors" ||
          name === "colours"
        ) {
          result.colour.push(String(value));
        }
      });
    });

    return {
      size: [...new Set(result.size)],
      colour: [...new Set(result.colour)],
    };
  }

  /* =====================================================
     SHOPIFY SIZE FILTER OPTIONS
  ===================================================== */

  const availableSizes = useMemo(() => {
    const values = new Set<string>();

    products.forEach((product) => {
      const options = getProductOptions(product);

      options.size.forEach((value) => {
        values.add(value);
      });
    });

    return Array.from(values).sort((a, b) =>
      a.localeCompare(b, undefined, {
        numeric: true,
        sensitivity: "base",
      }),
    );
  }, [products]);

  /* =====================================================
     SHOPIFY COLOUR FILTER OPTIONS
  ===================================================== */

  const availableColours = useMemo(() => {
    const values = new Set<string>();

    products.forEach((product) => {
      const options = getProductOptions(product);

      options.colour.forEach((value) => {
        values.add(value);
      });
    });

    return Array.from(values).sort((a, b) =>
      a.localeCompare(b, undefined, {
        sensitivity: "base",
      }),
    );
  }, [products]);

  /* =====================================================
     FILTER TOGGLE
  ===================================================== */

  function toggleFilter(name: FilterName) {
    setOpenFilter((current) => (current === name ? null : name));
  }

  /* =====================================================
     SIZE
  ===================================================== */

  function toggleSize(size: string) {
    setSelectedSizes((current) =>
      current.includes(size)
        ? current.filter((item) => item !== size)
        : [...current, size],
    );
  }

  /* =====================================================
     COLOUR
  ===================================================== */

  function toggleColour(colour: string) {
    setSelectedColours((current) =>
      current.includes(colour)
        ? current.filter((item) => item !== colour)
        : [...current, colour],
    );
  }

  /* =====================================================
     PRICE
  ===================================================== */

  function togglePrice(price: string) {
    setSelectedPrices((current) =>
      current.includes(price)
        ? current.filter((item) => item !== price)
        : [...current, price],
    );
  }

  /* =====================================================
     PRICE MATCH
  ===================================================== */

  function matchesPrice(product: any) {
    const price = getProductPrice(product);

    if (selectedPrices.length === 0) {
      return true;
    }

    return selectedPrices.some((range) => {
      switch (range) {
        case "under-3000":
          return price < 3000;

        case "3000-4000":
          return price >= 3000 && price < 4000;

        case "4000-5000":
          return price >= 4000 && price < 5000;

        case "5000-6000":
          return price >= 5000 && price < 6000;

        case "6000-plus":
          return price >= 6000;

        default:
          return true;
      }
    });
  }

  /* =====================================================
     FILTER PRODUCTS
  ===================================================== */

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const options = getProductOptions(product);

      /* SIZE */

      const sizeMatch =
        selectedSizes.length === 0 ||
        selectedSizes.some((selectedSize) =>
          options.size.some(
            (productSize) =>
              String(productSize).toLowerCase() ===
              String(selectedSize).toLowerCase(),
          ),
        );

      /* COLOUR */

      const colourMatch =
        selectedColours.length === 0 ||
        selectedColours.some((selectedColour) =>
          options.colour.some(
            (productColour) =>
              String(productColour).toLowerCase() ===
              String(selectedColour).toLowerCase(),
          ),
        );

      /* PRICE */

      const priceMatch = matchesPrice(product);

      return sizeMatch && colourMatch && priceMatch;
    });
  }, [products, selectedSizes, selectedColours, selectedPrices]);

  /* =====================================================
     SORT
  ===================================================== */

  const sortedProducts = useMemo(() => {
    const items = [...filteredProducts];

    if (sort === "price-low") {
      items.sort((a, b) => getProductPrice(a) - getProductPrice(b));
    }

    if (sort === "price-high") {
      items.sort((a, b) => getProductPrice(b) - getProductPrice(a));
    }

    if (sort === "name") {
      items.sort((a, b) =>
        String(a?.title || "").localeCompare(String(b?.title || "")),
      );
    }

    return items;
  }, [filteredProducts, sort]);

  /* =====================================================
     RESET
  ===================================================== */

  function resetFilters() {
    setSelectedSizes([]);
    setSelectedColours([]);
    setSelectedPrices([]);
  }

  const activeFilterCount =
    selectedSizes.length + selectedColours.length + selectedPrices.length;

  /* =====================================================
     PRICE LABEL
  ===================================================== */

  function getPriceLabel(price: string) {
    switch (price) {
      case "under-3000":
        return "Under ₹3,000";

      case "3000-4000":
        return "₹3,000 – ₹4,000";

      case "4000-5000":
        return "₹4,000 – ₹5,000";

      case "5000-6000":
        return "₹5,000 – ₹6,000";

      case "6000-plus":
        return "₹6,000+";

      default:
        return price;
    }
  }

  /* =====================================================
     RENDER
  ===================================================== */

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

            {/* =================================================
                CATEGORIES
            ================================================= */}

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

            {/* =================================================
                FILTERS
            ================================================= */}

            <div className="sidebar-block filters-block">
              <div className="sidebar-heading filter-heading-row">
                <span>FILTER BY</span>

                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    className="reset-filter"
                    onClick={resetFilters}
                  >
                    CLEAR
                  </button>
                )}
              </div>

              {/* =================================================
                  SIZE
              ================================================= */}

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
                    {availableSizes.length > 0 ? (
                      availableSizes.map((size) => (
                        <button
                          type="button"
                          key={size}
                          className={
                            selectedSizes.includes(size)
                              ? "filter-option active"
                              : "filter-option"
                          }
                          onClick={() => toggleSize(size)}
                        >
                          <span className="filter-checkbox">
                            {selectedSizes.includes(size) ? "✓" : ""}
                          </span>

                          <span>{size}</span>
                        </button>
                      ))
                    ) : (
                      <div className="filter-empty">No sizes available</div>
                    )}
                  </div>
                )}
              </div>

              {/* =================================================
                  COLOUR
              ================================================= */}

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
                    {availableColours.length > 0 ? (
                      availableColours.map((colour) => (
                        <button
                          type="button"
                          key={colour}
                          className={
                            selectedColours.includes(colour)
                              ? "filter-option active"
                              : "filter-option"
                          }
                          onClick={() => toggleColour(colour)}
                        >
                          <span className="filter-checkbox">
                            {selectedColours.includes(colour) ? "✓" : ""}
                          </span>

                          <span>{colour}</span>
                        </button>
                      ))
                    ) : (
                      <div className="filter-empty">No colours available</div>
                    )}
                  </div>
                )}
              </div>

              {/* =================================================
                  PRICE
              ================================================= */}

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
                    {[
                      {
                        value: "under-3000",
                        label: "Under ₹3,000",
                      },
                      {
                        value: "3000-4000",
                        label: "₹3,000 – ₹4,000",
                      },
                      {
                        value: "4000-5000",
                        label: "₹4,000 – ₹5,000",
                      },
                      {
                        value: "5000-6000",
                        label: "₹5,000 – ₹6,000",
                      },
                      {
                        value: "6000-plus",
                        label: "₹6,000+",
                      },
                    ].map((item) => (
                      <button
                        type="button"
                        key={item.value}
                        className={
                          selectedPrices.includes(item.value)
                            ? "filter-option active"
                            : "filter-option"
                        }
                        onClick={() => togglePrice(item.value)}
                      >
                        <span className="filter-checkbox">
                          {selectedPrices.includes(item.value) ? "✓" : ""}
                        </span>

                        <span>{item.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </aside>

          {/* =================================================
              PRODUCTS
          ================================================= */}

          <div className="catalog-main">
            {/* =================================================
                TOOLBAR
            ================================================= */}

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

            {/* =================================================
                ACTIVE FILTERS
            ================================================= */}

            {activeFilterCount > 0 && (
              <div className="active-filters">
                <span className="active-filters-label">FILTERED BY:</span>

                {selectedSizes.map((size) => (
                  <button
                    type="button"
                    key={`size-${size}`}
                    onClick={() => toggleSize(size)}
                  >
                    {size} ×
                  </button>
                ))}

                {selectedColours.map((colour) => (
                  <button
                    type="button"
                    key={`colour-${colour}`}
                    onClick={() => toggleColour(colour)}
                  >
                    {colour} ×
                  </button>
                ))}

                {selectedPrices.map((price) => (
                  <button
                    type="button"
                    key={`price-${price}`}
                    onClick={() => togglePrice(price)}
                  >
                    {getPriceLabel(price)} ×
                  </button>
                ))}
              </div>
            )}

            {/* =================================================
                PRODUCT GRID
            ================================================= */}

            {sortedProducts.length > 0 ? (
              <div className="catalog-grid">
                {sortedProducts.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="catalog-empty">
                <p>No products match your selected filters.</p>

                <button type="button" onClick={resetFilters}>
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
