"use client";

import { useEffect, useState } from "react";

type FilterName = "size" | "colour" | "price" | null;

type ShopFiltersProps = {
  availableSizes: string[];
  availableColours: string[];
};

export default function ShopFilters({
  availableSizes,
  availableColours,
}: ShopFiltersProps) {
  const [open, setOpen] = useState<FilterName>(null);

  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);

  const [selectedColours, setSelectedColours] = useState<string[]>([]);

  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);

  /* =====================================================
     READ CURRENT URL FILTERS
  ===================================================== */

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    setSelectedSizes(
      params.get("size")
        ? params
            .get("size")!
            .split(",")
            .map((item) => decodeURIComponent(item))
            .filter(Boolean)
        : [],
    );

    setSelectedColours(
      params.get("colour")
        ? params
            .get("colour")!
            .split(",")
            .map((item) => decodeURIComponent(item))
            .filter(Boolean)
        : [],
    );

    setSelectedPrices(
      params.get("price")
        ? params.get("price")!.split(",").filter(Boolean)
        : [],
    );
  }, []);

  /* =====================================================
     UPDATE URL FILTER
  ===================================================== */

  function updateFilter(type: "size" | "colour" | "price", value: string) {
    const params = new URLSearchParams(window.location.search);

    const current = params.get(type)?.split(",").filter(Boolean) || [];

    const exists = current.includes(value);

    const updated = exists
      ? current.filter((item) => item !== value)
      : [...current, value];

    if (updated.length > 0) {
      params.set(type, updated.join(","));
    } else {
      params.delete(type);
    }

    const query = params.toString();

    const url = query
      ? `${window.location.pathname}?${query}`
      : window.location.pathname;

    window.location.assign(url);
  }

  /* =====================================================
     CLEAR FILTERS
  ===================================================== */

  function clearFilters() {
    window.location.assign(window.location.pathname);
  }

  /* =====================================================
     TOGGLE
  ===================================================== */

  function toggle(name: FilterName) {
    setOpen((current) => (current === name ? null : name));
  }

  const hasFilters =
    selectedSizes.length > 0 ||
    selectedColours.length > 0 ||
    selectedPrices.length > 0;

  return (
    <div className="sidebar-filters">
      {/* =================================================
          SIZE
      ================================================= */}

      <div className="filter-group">
        <button
          type="button"
          onClick={() => toggle("size")}
          aria-expanded={open === "size"}
        >
          <span>SIZE</span>

          <span className={`filter-icon ${open === "size" ? "open" : ""}`}>
            +
          </span>
        </button>

        {open === "size" && (
          <div className="filter-options">
            {availableSizes.length > 0 ? (
              availableSizes.map((size) => (
                <label key={size}>
                  <input
                    type="checkbox"
                    checked={selectedSizes.includes(size)}
                    onChange={() => updateFilter("size", size)}
                  />

                  <span>{size}</span>
                </label>
              ))
            ) : (
              <span>No sizes available</span>
            )}
          </div>
        )}
      </div>

      {/* =================================================
          COLOUR
      ================================================= */}

      <div className="filter-group">
        <button
          type="button"
          onClick={() => toggle("colour")}
          aria-expanded={open === "colour"}
        >
          <span>COLOUR</span>

          <span className={`filter-icon ${open === "colour" ? "open" : ""}`}>
            +
          </span>
        </button>

        {open === "colour" && (
          <div className="filter-options">
            {availableColours.length > 0 ? (
              availableColours.map((colour) => (
                <label key={colour}>
                  <input
                    type="checkbox"
                    checked={selectedColours.includes(colour)}
                    onChange={() => updateFilter("colour", colour)}
                  />

                  <span>{colour}</span>
                </label>
              ))
            ) : (
              <span>No colours available</span>
            )}
          </div>
        )}
      </div>

      {/* =================================================
          PRICE
      ================================================= */}

      <div className="filter-group">
        <button
          type="button"
          onClick={() => toggle("price")}
          aria-expanded={open === "price"}
        >
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
                onChange={() => updateFilter("price", "under-3000")}
              />

              <span>Under ₹3,000</span>
            </label>

            <label>
              <input
                type="checkbox"
                checked={selectedPrices.includes("3000-4000")}
                onChange={() => updateFilter("price", "3000-4000")}
              />

              <span>₹3,000 - ₹4,000</span>
            </label>

            <label>
              <input
                type="checkbox"
                checked={selectedPrices.includes("4000-5000")}
                onChange={() => updateFilter("price", "4000-5000")}
              />

              <span>₹4,000 - ₹5,000</span>
            </label>

            <label>
              <input
                type="checkbox"
                checked={selectedPrices.includes("5000-6000")}
                onChange={() => updateFilter("price", "5000-6000")}
              />

              <span>₹5,000 - ₹6,000</span>
            </label>

            <label>
              <input
                type="checkbox"
                checked={selectedPrices.includes("6000-plus")}
                onChange={() => updateFilter("price", "6000-plus")}
              />

              <span>₹6,000+</span>
            </label>
          </div>
        )}
      </div>

      {/* =================================================
          CLEAR
      ================================================= */}

      {hasFilters && (
        <button type="button" className="clear-filters" onClick={clearFilters}>
          CLEAR FILTERS
        </button>
      )}
    </div>
  );
}
