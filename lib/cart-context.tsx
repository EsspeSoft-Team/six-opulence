"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import {
  createCart,
  getCart,
  addToCart as addToCartApi,
  removeFromCart as removeFromCartApi,
} from "./shopify";

type CartContextType = {
  cart: any;
  loading: boolean;

  addItem: (variantId: string, quantity?: number) => Promise<void>;

  removeItem: (lineId: string) => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_ID_KEY = "shopify_cart_id";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  /* =====================================================
     RESTORE EXISTING CART
  ===================================================== */

  useEffect(() => {
    const existingCartId = localStorage.getItem(CART_ID_KEY);

    if (!existingCartId) {
      return;
    }

    getCart(existingCartId)
      .then((fetchedCart) => {
        if (fetchedCart) {
          setCart(fetchedCart);
        } else {
          localStorage.removeItem(CART_ID_KEY);
          setCart(null);
        }
      })
      .catch((error) => {
        console.error("Failed to restore cart:", error);

        localStorage.removeItem(CART_ID_KEY);
        setCart(null);
      });
  }, []);

  /* =====================================================
     ADD ITEM
  ===================================================== */

  async function addItem(variantId: string, quantity = 1) {
    setLoading(true);

    try {
      let cartId = cart?.id || localStorage.getItem(CART_ID_KEY);

      /* Create cart if needed */

      if (!cartId) {
        const newCart = await createCart();

        cartId = newCart.id;

        localStorage.setItem(CART_ID_KEY, cartId);
      }

      const updatedCart = await addToCartApi(cartId, variantId, quantity);

      setCart(updatedCart);
    } catch (error) {
      console.error("Failed to add item:", error);

      throw error;
    } finally {
      setLoading(false);
    }
  }

  /* =====================================================
     REMOVE ITEM
  ===================================================== */

  async function removeItem(lineId: string) {
    if (!lineId) {
      return;
    }

    setLoading(true);

    try {
      const cartId = cart?.id || localStorage.getItem(CART_ID_KEY);

      if (!cartId) {
        return;
      }

      const updatedCart = await removeFromCartApi(cartId, lineId);

      setCart(updatedCart);

      /* If cart becomes empty */

      if (updatedCart && updatedCart.lines?.edges?.length === 0) {
        setCart(updatedCart);
      }
    } catch (error) {
      console.error("Failed to remove cart item:", error);

      throw error;
    } finally {
      setLoading(false);
    }
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        loading,
        addItem,
        removeItem,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }

  return context;
}
