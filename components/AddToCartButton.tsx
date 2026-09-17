"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";

type VariantEdge = {
  node: {
    id: string;
    title: string;
    availableForSale: boolean;
    price: {
      amount: string;
      currencyCode: string;
    };
  };
};

export default function AddToCartButton({
  variants,
}: {
  variants: VariantEdge[];
}) {
  const { addItem, loading } = useCart();

  // Select first available variant
  const firstAvailableVariant =
    variants.find((variant) => variant.node.availableForSale)?.node.id || "";

  const [selectedVariantId, setSelectedVariantId] = useState(
    firstAvailableVariant,
  );

  const [added, setAdded] = useState(false);

  async function handleAddToCart() {
    if (!selectedVariantId) {
      return;
    }

    try {
      await addItem(selectedVariantId, 1);

      setAdded(true);

      setTimeout(() => {
        setAdded(false);
      }, 2000);
    } catch (error) {
      console.error("Add to cart error:", error);
    }
  }

  const selectedVariant = variants.find(
    (variant) => variant.node.id === selectedVariantId,
  );

  const canAddToCart =
    !!selectedVariantId && !!selectedVariant?.node.availableForSale && !loading;

  return (
    <div>
      {/* Variant Selector */}
      {variants.length > 1 && (
        <select
          value={selectedVariantId}
          onChange={(e) => setSelectedVariantId(e.target.value)}
          disabled={loading}
          style={{
            marginBottom: 16,
            width: "100%",
            padding: "12px 16px",
            borderRadius: 8,
            border: "1px solid #ddd",
            background: "#fff",
            color: "#111",
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {variants.map(({ node }) => (
            <option
              key={node.id}
              value={node.id}
              disabled={!node.availableForSale}
            >
              {node.title}
              {!node.availableForSale ? " (Out of stock)" : ""}
            </option>
          ))}
        </select>
      )}

      {/* Add To Cart */}
      <button
        type="button"
        className="btn btn-dark"
        onClick={handleAddToCart}
        disabled={!canAddToCart}
      >
        {loading
          ? "Adding..."
          : added
            ? "Added ✓"
            : !selectedVariantId
              ? "Out of Stock"
              : "Add to Cart"}
      </button>
    </div>
  );
}
