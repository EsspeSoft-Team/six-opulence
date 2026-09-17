"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";

type WishlistContextType = {
  wishlist: string[];
  toggleWishlist: (handle: string) => void;
  removeFromWishlist: (handle: string) => void;
  isWishlisted: (handle: string) => boolean;
};

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined,
);

const WISHLIST_KEY = "wishlist_handles";

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  /* =========================================================
     LOAD WISHLIST
  ========================================================= */

  useEffect(() => {
    try {
      const stored = localStorage.getItem(WISHLIST_KEY);

      if (stored) {
        const parsed = JSON.parse(stored);

        if (Array.isArray(parsed)) {
          setWishlist(
            parsed
              .filter((item): item is string => typeof item === "string")
              .filter((item, index, arr) => arr.indexOf(item) === index),
          );
        }
      }
    } catch (error) {
      console.error("Failed to load wishlist:", error);
    } finally {
      setLoaded(true);
    }
  }, []);

  /* =========================================================
     SAVE WISHLIST
  ========================================================= */

  const saveWishlist = useCallback((items: string[]) => {
    try {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(items));

      /*
       * Other components / tabs can listen to this event.
       */
      window.dispatchEvent(
        new CustomEvent("wishlist-updated", {
          detail: {
            wishlist: items,
          },
        }),
      );
    } catch (error) {
      console.error("Failed to save wishlist:", error);
    }
  }, []);

  /* =========================================================
     TOGGLE WISHLIST
  ========================================================= */

  const toggleWishlist = useCallback(
    (handle: string) => {
      if (!handle) return;

      setWishlist((prev) => {
        const exists = prev.includes(handle);

        const updated = exists
          ? prev.filter((item) => item !== handle)
          : [...prev, handle];

        saveWishlist(updated);

        return updated;
      });
    },
    [saveWishlist],
  );

  /* =========================================================
     REMOVE WISHLIST
  ========================================================= */

  const removeFromWishlist = useCallback(
    (handle: string) => {
      if (!handle) return;

      setWishlist((prev) => {
        const updated = prev.filter((item) => item !== handle);

        saveWishlist(updated);

        return updated;
      });
    },
    [saveWishlist],
  );

  /* =========================================================
     CHECK WISHLIST
  ========================================================= */

  const isWishlisted = useCallback(
    (handle: string) => {
      return wishlist.includes(handle);
    },
    [wishlist],
  );

  /* =========================================================
     SYNC BETWEEN TABS / COMPONENTS
  ========================================================= */

  useEffect(() => {
    if (!loaded) return;

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== WISHLIST_KEY) {
        return;
      }

      try {
        const parsed = event.newValue ? JSON.parse(event.newValue) : [];

        if (Array.isArray(parsed)) {
          setWishlist(
            parsed.filter((item): item is string => typeof item === "string"),
          );
        }
      } catch (error) {
        console.error("Failed to sync wishlist:", error);
      }
    };

    const handleWishlistUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{
        wishlist?: string[];
      }>;

      const updated = customEvent.detail?.wishlist;

      if (Array.isArray(updated)) {
        setWishlist(updated);
      }
    };

    window.addEventListener("storage", handleStorage);

    window.addEventListener("wishlist-updated", handleWishlistUpdate);

    return () => {
      window.removeEventListener("storage", handleStorage);

      window.removeEventListener("wishlist-updated", handleWishlistUpdate);
    };
  }, [loaded]);

  /* =========================================================
     PROVIDER
  ========================================================= */

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        toggleWishlist,
        removeFromWishlist,
        isWishlisted,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

/* ===========================================================
   HOOK
=========================================================== */

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }

  return context;
}
