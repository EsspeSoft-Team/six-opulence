"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";

/* ============================================================
   TYPES
============================================================ */

type WishlistContextType = {
  wishlist: string[];
  toggleWishlist: (handle: string) => void;
  removeFromWishlist: (handle: string) => void;
  isWishlisted: (handle: string) => boolean;
  clearWishlist: () => void;
  wishlistCount: number;
};

/* ============================================================
   CONTEXT
============================================================ */

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined,
);

/* ============================================================
   STORAGE
============================================================ */

const WISHLIST_KEY = "wishlist_handles";
const WISHLIST_EVENT = "wishlist-updated";

/* ============================================================
   NORMALIZE
============================================================ */

function normalizeWishlist(items: unknown): string[] {
  if (!Array.isArray(items)) {
    return [];
  }

  return Array.from(
    new Set(
      items
        .filter(
          (item): item is string =>
            typeof item === "string" && item.trim().length > 0,
        )
        .map((item) => item.trim()),
    ),
  );
}

/* ============================================================
   READ LOCAL STORAGE
============================================================ */

function getStoredWishlist(): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const stored = localStorage.getItem(WISHLIST_KEY);

    if (!stored) {
      return [];
    }

    const parsed = JSON.parse(stored);

    return normalizeWishlist(parsed);
  } catch (error) {
    console.error("Wishlist load error:", error);

    // Corrupt data thakle remove kore empty wishlist
    try {
      localStorage.removeItem(WISHLIST_KEY);
    } catch {}

    return [];
  }
}

/* ============================================================
   SAVE LOCAL STORAGE
============================================================ */

function saveStoredWishlist(items: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  const normalized = normalizeWishlist(items);

  try {
    if (normalized.length === 0) {
      localStorage.removeItem(WISHLIST_KEY);
    } else {
      localStorage.setItem(WISHLIST_KEY, JSON.stringify(normalized));
    }

    window.dispatchEvent(
      new CustomEvent(WISHLIST_EVENT, {
        detail: {
          wishlist: normalized,
        },
      }),
    );
  } catch (error) {
    console.error("Wishlist save error:", error);
  }
}

/* ============================================================
   PROVIDER
============================================================ */

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [hydrated, setHydrated] = useState(false);

  /* ==========================================================
     LOAD ONLY ONCE AFTER CLIENT HYDRATION
  ========================================================== */

  useEffect(() => {
    const storedWishlist = getStoredWishlist();

    setWishlist(storedWishlist);
    setHydrated(true);
  }, []);

  /* ==========================================================
     TOGGLE WISHLIST
  ========================================================== */

  const toggleWishlist = useCallback((handle: string) => {
    const cleanHandle = handle?.trim();

    if (!cleanHandle) {
      return;
    }

    setWishlist((current) => {
      const exists = current.includes(cleanHandle);

      let updated: string[];

      if (exists) {
        // Remove
        updated = current.filter((item) => item !== cleanHandle);
      } else {
        // Add
        updated = [...current, cleanHandle];
      }

      const normalized = normalizeWishlist(updated);

      saveStoredWishlist(normalized);

      return normalized;
    });
  }, []);

  /* ==========================================================
     REMOVE ONE
  ========================================================== */

  const removeFromWishlist = useCallback((handle: string) => {
    const cleanHandle = handle?.trim();

    if (!cleanHandle) {
      return;
    }

    setWishlist((current) => {
      const updated = current.filter((item) => item !== cleanHandle);

      const normalized = normalizeWishlist(updated);

      saveStoredWishlist(normalized);

      return normalized;
    });
  }, []);

  /* ==========================================================
     CHECK IF WISHLISTED
  ========================================================== */

  const isWishlisted = useCallback(
    (handle: string) => {
      const cleanHandle = handle?.trim();

      if (!cleanHandle) {
        return false;
      }

      return wishlist.includes(cleanHandle);
    },
    [wishlist],
  );

  /* ==========================================================
     CLEAR ALL
  ========================================================== */

  const clearWishlist = useCallback(() => {
    setWishlist([]);

    saveStoredWishlist([]);
  }, []);

  /* ==========================================================
     COUNT
  ========================================================== */

  const wishlistCount = useMemo(() => {
    if (!hydrated) {
      return 0;
    }

    return wishlist.length;
  }, [wishlist, hydrated]);

  /* ==========================================================
     SAME TAB + OTHER TAB SYNC
  ========================================================== */

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    /* --------------------------------------------------------
       SAME TAB
    -------------------------------------------------------- */

    const handleWishlistUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{
        wishlist?: unknown;
      }>;

      const updated = normalizeWishlist(customEvent.detail?.wishlist);

      setWishlist(updated);
    };

    /* --------------------------------------------------------
       OTHER BROWSER TAB
    -------------------------------------------------------- */

    const handleStorage = (event: StorageEvent) => {
      if (event.key !== WISHLIST_KEY) {
        return;
      }

      if (!event.newValue) {
        setWishlist([]);
        return;
      }

      try {
        const parsed = JSON.parse(event.newValue);

        setWishlist(normalizeWishlist(parsed));
      } catch {
        setWishlist([]);
      }
    };

    window.addEventListener(WISHLIST_EVENT, handleWishlistUpdate);

    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener(WISHLIST_EVENT, handleWishlistUpdate);

      window.removeEventListener("storage", handleStorage);
    };
  }, [hydrated]);

  /* ==========================================================
     PROVIDER
  ========================================================== */

  return (
    <WishlistContext.Provider
      value={{
        wishlist,
        wishlistCount,
        toggleWishlist,
        removeFromWishlist,
        isWishlisted,
        clearWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

/* ============================================================
   HOOK
============================================================ */

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider");
  }

  return context;
}
