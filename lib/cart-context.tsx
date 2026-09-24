"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
  useCallback,
} from "react";

import {
  createCart,
  getCart,
  addToCart as addToCartApi,
  removeFromCart as removeFromCartApi,
  updateCartLines,
} from "./shopify";

type CartContextType = {
  cart: any;
  loading: boolean;
  cartCount: number;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
  removeItem: (lineId: string) => Promise<void>;
  updateItem: (lineId: string, quantity: number) => Promise<void>;
  refreshCart: () => Promise<void>;
  clearCart: () => void;
  proceedToCheckout: () => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_ID_KEY = "shopify_cart_id";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  /*
  ============================================================
  GET CART COUNT
  ============================================================
  */

  const cartCount = useMemo(() => {
    if (!cart?.lines?.edges) {
      return 0;
    }

    return cart.lines.edges.reduce((total: number, edge: any) => {
      return total + Number(edge?.node?.quantity || 0);
    }, 0);
  }, [cart]);

  /*
  ============================================================
  SAVE CART ID
  ============================================================
  */

  const saveCartId = useCallback((cartId: string) => {
    if (!cartId) return;

    try {
      localStorage.setItem(CART_ID_KEY, cartId);
    } catch (error) {
      console.error("Failed to save cart ID:", error);
    }
  }, []);

  /*
  ============================================================
  REMOVE CART ID
  ============================================================
  */

  const removeCartId = useCallback(() => {
    try {
      localStorage.removeItem(CART_ID_KEY);
    } catch (error) {
      console.error("Failed to remove cart ID:", error);
    }
  }, []);

  /*
  ============================================================
  DISPATCH CART UPDATE
  ============================================================
  */

  const dispatchCartUpdate = useCallback((updatedCart: any) => {
    try {
      window.dispatchEvent(
        new CustomEvent("shopify-cart-updated", {
          detail: {
            cart: updatedCart,
            count:
              updatedCart?.lines?.edges?.reduce(
                (total: number, edge: any) =>
                  total + Number(edge?.node?.quantity || 0),
                0,
              ) || 0,
          },
        }),
      );
    } catch (error) {
      console.error("Failed to dispatch cart update:", error);
    }
  }, []);

  /*
  ============================================================
  RESTORE EXISTING CART
  ============================================================
  */

  useEffect(() => {
    let cancelled = false;

    async function restoreCart() {
      try {
        const existingCartId = localStorage.getItem(CART_ID_KEY);

        if (!existingCartId) {
          return;
        }

        const fetchedCart = await getCart(existingCartId);

        if (cancelled) return;

        if (fetchedCart) {
          setCart(fetchedCart);
          dispatchCartUpdate(fetchedCart);
        } else {
          removeCartId();
          setCart(null);
          dispatchCartUpdate(null);
        }
      } catch (error) {
        console.error("Failed to restore Shopify cart:", error);

        if (!cancelled) {
          removeCartId();
          setCart(null);
          dispatchCartUpdate(null);
        }
      }
    }

    restoreCart();

    return () => {
      cancelled = true;
    };
  }, [dispatchCartUpdate, removeCartId]);

  /*
  ============================================================
  ADD ITEM TO SHOPIFY CART
  ============================================================
  */

  const addItem = useCallback(
    async (variantId: string, quantity = 1): Promise<void> => {
      if (!variantId) {
        throw new Error("Variant ID is required.");
      }

      if (quantity < 1) {
        throw new Error("Quantity must be at least 1.");
      }

      setLoading(true);

      try {
        let cartId = cart?.id || localStorage.getItem(CART_ID_KEY);

        /*
        --------------------------------------------------------
        CREATE SHOPIFY CART IF NONE EXISTS
        --------------------------------------------------------
        */

        if (!cartId) {
          const newCart = await createCart();

          if (!newCart?.id) {
            throw new Error("Shopify cart could not be created.");
          }

          cartId = newCart.id;

          saveCartId(cartId);
        }

        /*
        --------------------------------------------------------
        ADD SHOPIFY VARIANT
        --------------------------------------------------------
        */

        const updatedCart = await addToCartApi(cartId, variantId, quantity);

        if (!updatedCart) {
          throw new Error("Shopify did not return an updated cart.");
        }

        /*
        --------------------------------------------------------
        SAVE UPDATED CART
        --------------------------------------------------------
        */

        setCart(updatedCart);

        if (updatedCart.id) {
          saveCartId(updatedCart.id);
        }

        dispatchCartUpdate(updatedCart);
      } catch (error) {
        console.error("Failed to add item to Shopify cart:", error);

        throw error;
      } finally {
        setLoading(false);
      }
    },
    [cart?.id, saveCartId, dispatchCartUpdate],
  );

  /*
  ============================================================
  REMOVE ITEM
  ============================================================
  */

  const removeItem = useCallback(
    async (lineId: string): Promise<void> => {
      if (!lineId) {
        return;
      }

      const cartId = cart?.id || localStorage.getItem(CART_ID_KEY);

      if (!cartId) {
        return;
      }

      setLoading(true);

      try {
        /*
        --------------------------------------------------------
        IMPORTANT:
        Shopify removeFromCart expects string[]
        --------------------------------------------------------
        */

        const updatedCart = await removeFromCartApi(cartId, [lineId]);

        if (!updatedCart) {
          throw new Error("Shopify did not return updated cart.");
        }

        setCart(updatedCart);

        if (updatedCart.id) {
          saveCartId(updatedCart.id);
        }

        dispatchCartUpdate(updatedCart);
      } catch (error) {
        console.error("Failed to remove Shopify cart item:", error);

        throw error;
      } finally {
        setLoading(false);
      }
    },
    [cart?.id, saveCartId, dispatchCartUpdate],
  );

  /*
  ============================================================
  UPDATE ITEM QUANTITY
  ============================================================
  */

  const updateItem = useCallback(
    async (lineId: string, quantity: number): Promise<void> => {
      if (!lineId) {
        return;
      }

      const cartId = cart?.id || localStorage.getItem(CART_ID_KEY);

      if (!cartId) {
        return;
      }

      if (quantity < 1) {
        await removeItem(lineId);
        return;
      }

      setLoading(true);

      try {
        const updatedCart = await updateCartLines(cartId, [
          {
            id: lineId,
            quantity,
          },
        ]);

        if (!updatedCart) {
          throw new Error("Shopify did not return updated cart.");
        }

        setCart(updatedCart);

        if (updatedCart.id) {
          saveCartId(updatedCart.id);
        }

        dispatchCartUpdate(updatedCart);
      } catch (error) {
        console.error("Failed to update Shopify cart:", error);

        throw error;
      } finally {
        setLoading(false);
      }
    },
    [cart?.id, removeItem, saveCartId, dispatchCartUpdate],
  );

  /*
  ============================================================
  REFRESH CART
  ============================================================
  */

  const refreshCart = useCallback(async () => {
    const cartId = cart?.id || localStorage.getItem(CART_ID_KEY);

    if (!cartId) {
      setCart(null);
      return;
    }

    try {
      setLoading(true);

      const fetchedCart = await getCart(cartId);

      if (fetchedCart) {
        setCart(fetchedCart);

        if (fetchedCart.id) {
          saveCartId(fetchedCart.id);
        }

        dispatchCartUpdate(fetchedCart);
      } else {
        removeCartId();
        setCart(null);
        dispatchCartUpdate(null);
      }
    } catch (error) {
      console.error("Failed to refresh Shopify cart:", error);
    } finally {
      setLoading(false);
    }
  }, [cart?.id, saveCartId, removeCartId, dispatchCartUpdate]);

  /*
  ============================================================
  CLEAR CART
  ============================================================
  */

  const clearCart = useCallback(() => {
    removeCartId();
    setCart(null);
    dispatchCartUpdate(null);
  }, [removeCartId, dispatchCartUpdate]);

  /*
  ============================================================
  PROCEED TO SHOPIFY CHECKOUT
  ============================================================
  */

  const proceedToCheckout = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);

      let currentCart = cart;

      // Restore the cart if it is not currently in React state.
      if (!currentCart?.id) {
        const cartId = localStorage.getItem(CART_ID_KEY);

        if (!cartId) {
          throw new Error("Your cart is empty.");
        }

        currentCart = await getCart(cartId);

        if (!currentCart) {
          removeCartId();
          setCart(null);
          dispatchCartUpdate(null);

          throw new Error("Your cart could not be found.");
        }

        setCart(currentCart);
      }

      // Do not continue when there are no products.
      const totalQuantity = Number(
        currentCart?.totalQuantity ??
          currentCart?.lines?.edges?.reduce(
            (total: number, edge: any) =>
              total + Number(edge?.node?.quantity || 0),
            0,
          ) ??
          0,
      );

      if (totalQuantity < 1) {
        throw new Error("Your cart is empty.");
      }

      // checkoutUrl is generated by Shopify for this cart.
      const checkoutUrl = currentCart?.checkoutUrl;

      if (!checkoutUrl) {
        throw new Error(
          "Shopify checkout URL is not available. Please try again.",
        );
      }

      // Open Shopify's real hosted checkout.
      window.location.assign(checkoutUrl);
    } catch (error) {
      console.error("Proceed to checkout failed:", error);

      throw error;
    } finally {
      setLoading(false);
    }
  }, [cart, removeCartId, dispatchCartUpdate]);

  /*
  ============================================================
  PROVIDER
  ============================================================
  */

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        cartCount,
        addItem,
        removeItem,
        updateItem,
        refreshCart,
        clearCart,
        proceedToCheckout,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

/*
============================================================
HOOK
============================================================
*/

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
