"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

/**
 * Wishlist Context
 * ----------------
 * Note: Shopify Storefront API-te kono native "wishlist" feature nei.
 * Tai eta localStorage-e product handle store kore banano hoyeche —
 * device-specific, login na thakleo kaj korবে.
 *
 * Future upgrade: customer login thakle ei list customer metafield-e
 * sync kora jay (Admin API diye, server-side), tahole cross-device
 * wishlist kaj korবে. Seta lagle janaben, add kore debo.
 */

type WishlistContextType = {
  wishlist: string[]; // product handles
  toggleWishlist: (handle: string) => void;
  isWishlisted: (handle: string) => boolean;
};

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined
);

const WISHLIST_KEY = "wishlist_handles";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(WISHLIST_KEY);
    if (stored) {
      setWishlist(JSON.parse(stored));
    }
  }, []);

  function toggleWishlist(handle: string) {
    setWishlist((prev) => {
      const updated = prev.includes(handle)
        ? prev.filter((h) => h !== handle)
        : [...prev, handle];
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
      return updated;
    });
  }

  function isWishlisted(handle: string) {
    return wishlist.includes(handle);
  }

  return (
    <WishlistContext.Provider value={{ wishlist, toggleWishlist, isWishlisted }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
