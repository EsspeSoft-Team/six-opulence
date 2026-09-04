"use client";

import "./cart.css";

import Image from "next/image";
import { useCart } from "@/lib/cart-context";

export default function CartPage() {
  const { cart } = useCart();

  if (!cart || cart.lines.edges.length === 0) {
    return (
      <div className="container">
        <h1 className="section-title">Your Cart</h1>
        <p>Your cart is empty.</p>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="section-title">Your Cart</h1>

      <div style={{ marginBottom: 24 }}>
        {cart.lines.edges.map(({ node }: any) => (
          <div key={node.id} className="cart-line">
            {node.merchandise.product.featuredImage && (
              <div className="cart-line-img">
                <Image
                  src={node.merchandise.product.featuredImage.url}
                  alt={node.merchandise.product.title}
                  fill
                  style={{ objectFit: "cover" }}
                />
              </div>
            )}
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 500, margin: 0 }}>{node.merchandise.product.title}</p>
              <p style={{ fontSize: 14, color: "#666", margin: "2px 0" }}>{node.merchandise.title}</p>
              <p style={{ fontSize: 14, margin: 0 }}>Qty: {node.quantity}</p>
            </div>
            <p style={{ fontWeight: 500 }}>
              {node.merchandise.price.currencyCode} {node.merchandise.price.amount}
            </p>
          </div>
        ))}
      </div>

      <div className="cart-total">
        <span>Total</span>
        <span>
          {cart.cost.totalAmount.currencyCode} {cart.cost.totalAmount.amount}
        </span>
      </div>

      <a href={cart.checkoutUrl} className="btn btn-dark" style={{ display: "block", textAlign: "center" }}>
        Checkout
      </a>
    </div>
  );
}
