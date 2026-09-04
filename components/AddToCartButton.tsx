"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";

type VariantEdge = {
  node: {
    id: string;
    title: string;
    availableForSale: boolean;
    price: { amount: string; currencyCode: string };
  };
};

export default function AddToCartButton({
  variants,
}: {
  variants: VariantEdge[];
}) {
  const { addItem, loading } = useCart();
  const [selectedVariantId, setSelectedVariantId] = useState(
    variants[0]?.node.id
  );
  const [added, setAdded] = useState(false);

  async function handleAddToCart() {
    await addItem(selectedVariantId, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  return (
    <div>
      {variants.length > 1 && (
        <select
          value={selectedVariantId}
          onChange={(e) => setSelectedVariantId(e.target.value)}
          style={{
            marginBottom: 16,
            width: "100%",
            padding: "12px 16px",
            borderRadius: 8,
            border: "1px solid #ddd",
          }}
        >
          {variants.map(({ node }) => (
            <option key={node.id} value={node.id} disabled={!node.availableForSale}>
              {node.title} {!node.availableForSale ? "(Out of stock)" : ""}
            </option>
          ))}
        </select>
      )}

      <button className="btn btn-dark" onClick={handleAddToCart} disabled={loading}>
        {loading ? "Adding..." : added ? "Added ✓" : "Add to Cart"}
      </button>
    </div>
  );
}
