"use client";

import { useState } from "react";

type FilterName = "size" | "colour" | "price" | null;

export default function ShopFilters() {
  const [open, setOpen] = useState<FilterName>(null);

  const toggle = (name: FilterName) => {
    setOpen((current) => (current === name ? null : name));
  };

  return (
    <div className="sidebar-filters">
      {/* =====================================================
          SIZE
      ===================================================== */}

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
            <label>
              <input type="checkbox" value="XS" />
              <span>XS</span>
            </label>

            <label>
              <input type="checkbox" value="S" />
              <span>S</span>
            </label>

            <label>
              <input type="checkbox" value="M" />
              <span>M</span>
            </label>

            <label>
              <input type="checkbox" value="L" />
              <span>L</span>
            </label>

            <label>
              <input type="checkbox" value="XL" />
              <span>XL</span>
            </label>

            <label>
              <input type="checkbox" value="XXL" />
              <span>XXL</span>
            </label>
          </div>
        )}
      </div>

      {/* =====================================================
          COLOUR
      ===================================================== */}

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
            <label>
              <input type="checkbox" value="Black" />
              <span>Black</span>
            </label>

            <label>
              <input type="checkbox" value="White" />
              <span>White</span>
            </label>

            <label>
              <input type="checkbox" value="Olive" />
              <span>Olive</span>
            </label>

            <label>
              <input type="checkbox" value="Grey" />
              <span>Grey</span>
            </label>

            <label>
              <input type="checkbox" value="Brown" />
              <span>Brown</span>
            </label>

            <label>
              <input type="checkbox" value="Navy" />
              <span>Navy</span>
            </label>

            <label>
              <input type="checkbox" value="Beige" />
              <span>Beige</span>
            </label>
          </div>
        )}
      </div>

      {/* =====================================================
          PRICE
      ===================================================== */}

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
              <input type="checkbox" value="0-3000" />
              <span>Under ₹3,000</span>
            </label>

            <label>
              <input type="checkbox" value="3000-4000" />
              <span>₹3,000 - ₹4,000</span>
            </label>

            <label>
              <input type="checkbox" value="4000-5000" />
              <span>₹4,000 - ₹5,000</span>
            </label>

            <label>
              <input type="checkbox" value="5000-6000" />
              <span>₹5,000 - ₹6,000</span>
            </label>

            <label>
              <input type="checkbox" value="6000-plus" />
              <span>₹6,000+</span>
            </label>
          </div>
        )}
      </div>
    </div>
  );
}
