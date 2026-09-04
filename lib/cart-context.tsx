"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { createCart, getCart, addToCart as addToCartApi } from "./shopify";

type CartContextType = {
  cart: any;
  loading: boolean;
  addItem: (variantId: string, quantity?: number) => Promise<void>;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_ID_KEY = "shopify_cart_id";

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Page load-e existing cart restore kora (localStorage-e cart id save thake)
  useEffect(() => {
    const existingCartId = localStorage.getItem(CART_ID_KEY);
    if (existingCartId) {
      getCart(existingCartId)
        .then((fetchedCart) => {
          if (fetchedCart) setCart(fetchedCart);
        })
        .catch(() => {
          // cart expire hoye gele localStorage clear kore dao
          localStorage.removeItem(CART_ID_KEY);
        });
    }
  }, []);

  async function addItem(variantId: string, quantity = 1) {
    setLoading(true);
    try {
      let cartId = cart?.id || localStorage.getItem(CART_ID_KEY);

      if (!cartId) {
        const newCart = await createCart();
        cartId = newCart.id;
        localStorage.setItem(CART_ID_KEY, cartId);
      }

      const updatedCart = await addToCartApi(cartId, variantId, quantity);
      setCart(updatedCart);
    } finally {
      setLoading(false);
    }
  }

  return (
    <CartContext.Provider value={{ cart, loading, addItem }}>
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
