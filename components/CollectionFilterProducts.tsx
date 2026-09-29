"use client";

import { useMemo, useState } from "react";

import ProductCard from "@/components/ProductCard";

type Props = {
  products: any[];
};

type FilterName = "size" | "colour" | "price" | null;

export default function CollectionFilterProducts({ products }: Props) {
  const [open, setOpen] = useState<FilterName>(null);

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const [selectedColours, setSelectedColours] = useState<string[]>([]);

  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);

  /* =====================================================
     PRODUCT PRICE
  ===================================================== */

  function getProductPrice(product: any) {
    return Number(
      product?.priceRange?.minVariantPrice?.amount ||
        product?.variants?.edges?.[0]?.node?.price?.amount ||
        0,
    );
  }

  /* =====================================================
     SHOPIFY OPTIONS
  ===================================================== */

  function getProductOptions(product: any) {
    const sizes: string[] = [];
    const colours: string[] = [];

    const options = Array.isArray(product?.options) ? product.options : [];

    options.forEach((option: any) => {
      const name = String(option?.name || "")
        .toLowerCase()
        .trim();

      const values = Array.isArray(option?.values) ? option.values : [];

      if (name === "size" || name === "sizes") {
        sizes.push(...values.map(String));
      }

      if (
        name === "color" ||
        name === "colour" ||
        name === "colors" ||
        name === "colours"
      ) {
        colours.push(...values.map(String));
      }
    });

    /* =================================================
       VARIANT OPTIONS
    ================================================= */

    const variants = product?.variants?.edges
      ? product.variants.edges.map((edge: any) => edge?.node).filter(Boolean)
      : [];

    variants.forEach((variant: any) => {
      const selectedOptions = Array.isArray(variant?.selectedOptions)
        ? variant.selectedOptions
        : [];

      selectedOptions.forEach((option: any) => {
        const name = String(option?.name || "")
          .toLowerCase()
          .trim();

        const value = option?.value;

        if (!value) return;

        if (name === "size" || name === "sizes") {
          sizes.push(String(value));
        }

        if (
          name === "color" ||
          name === "colour" ||
          name === "colors" ||
          name === "colours"
        ) {
          colours.push(String(value));
        }
      });
    });

    return {
      sizes: [...new Set(sizes)],
      colours: [...new Set(colours)],
    };
  }

  /* =====================================================
     AVAILABLE SIZES
  ===================================================== */

  const availableSizes = useMemo(() => {
    const values = new Set<string>();

    products.forEach((product) => {
      const options = getProductOptions(product);

      options.sizes.forEach((size) => {
        values.add(size);
      });
    });

    return Array.from(values);
  }, [products]);

  /* =====================================================
     AVAILABLE COLOURS
  ===================================================== */

  const availableColours = useMemo(() => {
    const values = new Set<string>();

    products.forEach((product) => {
      const options = getProductOptions(product);

      options.colours.forEach((colour) => {
        values.add(colour);
      });
    });

    return Array.from(values);
  }, [products]);

  /* =====================================================
     FILTER PRODUCTS
  ===================================================== */

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const options = getProductOptions(product);

      /* SIZE */

      const sizeMatch =
        selectedSizes.length === 0 ||
        selectedSizes.some((size) =>
          options.sizes.some(
            (productSize) => productSize.toLowerCase() === size.toLowerCase(),
          ),
        );

      /* COLOUR */

      const colourMatch =
        selectedColours.length === 0 ||
        selectedColours.some((colour) =>
          options.colours.some(
            (productColour) =>
              productColour.toLowerCase() === colour.toLowerCase(),
          ),
        );

      /* PRICE */

      const price = getProductPrice(product);

      const priceMatch =
        selectedPrices.length === 0 ||
        selectedPrices.some((range) => {
          if (range === "under-3000") {
            return price < 3000;
          }

          if (range === "3000-4000") {
            return price >= 3000 && price < 4000;
          }

          if (range === "4000-5000") {
            return price >= 4000 && price < 5000;
          }

          if (range === "5000-6000") {
            return price >= 5000 && price < 6000;
          }

          if (range === "6000-plus") {
            return price >= 6000;
          }

          return true;
        });

      return sizeMatch && colourMatch && priceMatch;
    });
  }, [products, selectedSizes, selectedColours, selectedPrices]);

  /* =====================================================
     TOGGLE
  ===================================================== */

  function toggleFilter(name: FilterName) {
    setOpen((current) => (current === name ? null : name));
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
     CLEAR
  ===================================================== */

  function clearFilters() {
    setSelectedSizes([]);
    setSelectedColours([]);
    setSelectedPrices([]);
  }

  const activeFilters =
    selectedSizes.length + selectedColours.length + selectedPrices.length;

  return (
    <>
      {/* =================================================
          FILTERS
      ================================================= */}

      <div className="filter-group">
        <button type="button" onClick={() => toggleFilter("size")}>
          <span>SIZE</span>

          <span className={`filter-icon ${open === "size" ? "open" : ""}`}>
            +
          </span>
        </button>

        {open === "size" && (
          <div className="filter-options">
            {availableSizes.map((size) => (
              <label key={size}>
                <input
                  type="checkbox"
                  checked={selectedSizes.includes(size)}
                  onChange={() => toggleSize(size)}
                />

                <span>{size}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* =================================================
          COLOUR
      ================================================= */}

      <div className="filter-group">
        <button type="button" onClick={() => toggleFilter("colour")}>
          <span>COLOUR</span>

          <span className={`filter-icon ${open === "colour" ? "open" : ""}`}>
            +
          </span>
        </button>

        {open === "colour" && (
          <div className="filter-options">
            {availableColours.map((colour) => (
              <label key={colour}>
                <input
                  type="checkbox"
                  checked={selectedColours.includes(colour)}
                  onChange={() => toggleColour(colour)}
                />

                <span>{colour}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* =================================================
          PRICE
      ================================================= */}

      <div className="filter-group">
        <button type="button" onClick={() => toggleFilter("price")}>
          <span>PRICE</span>

          <span className={`filter-icon ${open === "price" ? "open" : ""}`}>
            +
          </span>
        </button>

        {open === "price" && (
          <div className="filter-options">
            <label>
              <input
                type="checkbox"
                checked={selectedPrices.includes("under-3000")}
                onChange={() => togglePrice("under-3000")}
              />
              <span>Under ₹3,000</span>
            </label>

            <label>
              <input
                type="checkbox"
                checked={selectedPrices.includes("3000-4000")}
                onChange={() => togglePrice("3000-4000")}
              />
              <span>₹3,000 - ₹4,000</span>
            </label>

            <label>
              <input
                type="checkbox"
                checked={selectedPrices.includes("4000-5000")}
                onChange={() => togglePrice("4000-5000")}
              />
              <span>₹4,000 - ₹5,000</span>
            </label>

            <label>
              <input
                type="checkbox"
                checked={selectedPrices.includes("5000-6000")}
                onChange={() => togglePrice("5000-6000")}
              />
              <span>₹5,000 - ₹6,000</span>
            </label>

            <label>
              <input
                type="checkbox"
                checked={selectedPrices.includes("6000-plus")}
                onChange={() => togglePrice("6000-plus")}
              />
              <span>₹6,000+</span>
            </label>
          </div>
        )}
      </div>

      {/* =================================================
          CLEAR
      ================================================= */}

      {activeFilters > 0 && (
        <button type="button" onClick={clearFilters} className="clear-filters">
          CLEAR FILTERS
        </button>
      )}

      {/* =================================================
          PRODUCTS
      ================================================= */}

      <div className="catalog-products">
        <div className="catalog-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product: any) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <div className="catalog-empty">
              <p>No products match your selected filters.</p>

              <button type="button" onClick={clearFilters}>
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
