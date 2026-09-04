"use client";

import { useEffect, useState } from "react";
import { useWishlist } from "@/lib/wishlist-context";
import { getProductByHandle } from "@/lib/shopify";
import ProductCard from "@/components/ProductCard";

export default function WishlistPage() {
  const { wishlist } = useWishlist();
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      const results = await Promise.all(
        wishlist.map((handle) => getProductByHandle(handle).catch(() => null))
      );
      setProducts(results.filter(Boolean));
      setLoading(false);
    }

    if (wishlist.length > 0) {
      loadProducts();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [wishlist]);

  if (loading) return <p>Loading wishlist...</p>;

  if (products.length === 0) {
    return (
      <div className="container">
        <h1 className="section-title">Your Wishlist</h1>
        <p>Your wishlist is empty. Start adding products you love.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="section-title">Your Wishlist</h1>
      <div className="grid grid-4">
        {products.map((product: any) => (
          <ProductCard
            key={product.id}
            product={{
              ...product,
              priceRange: {
                minVariantPrice: product.variants.edges[0]?.node.price,
              },
            }}
          />
        ))}
      </div>
    </div>
  );
}
