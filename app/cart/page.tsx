"use client";

import "./cart.css";

import Image from "next/image";
import { useCart } from "@/lib/cart-context";

export default function CartPage() {
  const { cart, loading, removeItem } = useCart();

  /* =====================================================
     EMPTY CART
  ===================================================== */

  if (!cart || !cart.lines || cart.lines.edges.length === 0) {
    return (
      <main className="cart-page">
        <section className="cart-empty">
          <p className="cart-eyebrow">OPULENCE COLLECTION</p>

          <h1 className="cart-empty-title">Your Cart</h1>

          <span className="cart-empty-line" />

          <p className="cart-empty-text">
            Your cart is currently empty.
            <br />
            Discover pieces made for your collection.
          </p>

          <a href="/collections/all" className="cart-shop-btn">
            <span>EXPLORE COLLECTION</span>
            <span className="cart-btn-arrow">→</span>
          </a>
        </section>
      </main>
    );
  }

  /* =====================================================
     REMOVE
  ===================================================== */

  async function handleRemove(lineId: string) {
    try {
      await removeItem(lineId);
    } catch (error) {
      console.error("Unable to remove item:", error);
    }
  }

  return (
    <main className="cart-page">
      {/* HEADER */}

      <section className="cart-header">
        <p className="cart-eyebrow">OPULENCE COLLECTION</p>

        <h1 className="cart-title">Your Cart</h1>

        <p className="cart-subtitle">Pieces selected for your collection.</p>
      </section>

      {/* CART CONTENT */}

      <section className="cart-content">
        {/* LEFT */}

        <div className="cart-items">
          <div className="cart-items-top">
            <span>YOUR PIECES</span>

            <span>
              {cart.lines.edges.length}{" "}
              {cart.lines.edges.length === 1 ? "ITEM" : "ITEMS"}
            </span>
          </div>

          <div className="cart-list">
            {cart.lines.edges.map(({ node }: any) => {
              const product = node.merchandise?.product;

              const price = node.merchandise?.price;

              const image = product?.featuredImage;

              return (
                <article key={node.id} className="cart-line">
                  {/* IMAGE */}

                  <div className="cart-line-img">
                    {image?.url ? (
                      <Image
                        src={image.url}
                        alt={image.altText || product?.title || "Product"}
                        fill
                        sizes="(max-width: 768px) 120px, 220px"
                        style={{
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div className="cart-image-placeholder">OPULENCE</div>
                    )}
                  </div>

                  {/* DETAILS */}

                  <div className="cart-line-info">
                    <p className="cart-line-brand">OPULENCE</p>

                    <h2 className="cart-line-title">{product?.title}</h2>

                    {node.merchandise?.title &&
                      node.merchandise.title !== "Default Title" && (
                        <p className="cart-line-variant">
                          {node.merchandise.title}
                        </p>
                      )}

                    <p className="cart-line-qty">Qty: {node.quantity}</p>

                    {/* MOBILE PRICE */}

                    <p className="cart-line-price mobile-price">
                      {price?.currencyCode}{" "}
                      {Number(price?.amount || 0).toFixed(2)}
                    </p>

                    {/* REMOVE */}

                    <button
                      type="button"
                      className="cart-remove"
                      onClick={() => handleRemove(node.id)}
                      disabled={loading}
                    >
                      <span>{loading ? "REMOVING..." : "REMOVE"}</span>

                      {!loading && <span className="cart-remove-x">×</span>}
                    </button>
                  </div>

                  {/* DESKTOP PRICE */}

                  <div className="cart-line-right">
                    <p className="cart-line-price">
                      {price?.currencyCode}{" "}
                      {Number(price?.amount || 0).toFixed(2)}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* RIGHT SUMMARY */}

        <aside className="cart-summary">
          <div className="cart-summary-top">
            <p>ORDER SUMMARY</p>
          </div>

          <div className="cart-summary-row">
            <span>Subtotal</span>

            <span>
              {cart.cost?.subtotalAmount?.currencyCode}{" "}
              {Number(cart.cost?.subtotalAmount?.amount || 0).toFixed(2)}
            </span>
          </div>

          <div className="cart-summary-row">
            <span>Shipping</span>

            <span>CALCULATED AT CHECKOUT</span>
          </div>

          <div className="cart-summary-divider" />

          <div className="cart-total">
            <span>TOTAL</span>

            <span>
              {cart.cost?.totalAmount?.currencyCode}{" "}
              {Number(cart.cost?.totalAmount?.amount || 0).toFixed(2)}
            </span>
          </div>

          <a href={cart.checkoutUrl} className="cart-checkout-btn">
            <span>PROCEED TO CHECKOUT</span>

            <span>→</span>
          </a>

          <a href="/collections/all" className="cart-continue">
            CONTINUE SHOPPING
          </a>
        </aside>
      </section>
    </main>
  );
}
