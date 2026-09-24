"use client";

import "./cart.css";

import Image from "next/image";

import { useCart } from "@/lib/cart-context";

export default function CartPage() {
  const { cart, loading, removeItem, proceedToCheckout, cartCount } = useCart();

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
     SUBTOTAL
     
     Shopify subtotalAmount থাকলে সেটা ব্যবহার করবে।
     না থাকলে line price × quantity calculate করবে।
  ===================================================== */

  const calculatedSubtotal = cart.lines.edges.reduce(
    (total: number, { node }: any) => {
      const price = Number(node?.merchandise?.price?.amount || 0);

      const quantity = Number(node?.quantity || 0);

      return total + price * quantity;
    },
    0,
  );

  const shopifySubtotal = Number(cart?.cost?.subtotalAmount?.amount || 0);

  const subtotal = shopifySubtotal > 0 ? shopifySubtotal : calculatedSubtotal;

  const currency =
    cart?.cost?.subtotalAmount?.currencyCode ||
    cart?.cost?.totalAmount?.currencyCode ||
    cart?.lines?.edges?.[0]?.node?.merchandise?.price?.currencyCode ||
    "INR";

  /* =====================================================
     TOTAL
     
     Shopify total থাকলে সেটা ব্যবহার করবে।
     না থাকলে subtotal fallback হবে।
  ===================================================== */

  const shopifyTotal = Number(cart?.cost?.totalAmount?.amount || 0);

  const total = shopifyTotal > 0 ? shopifyTotal : subtotal;

  /* =====================================================
     REMOVE ITEM
  ===================================================== */

  async function handleRemove(lineId: string) {
    try {
      await removeItem(lineId);
    } catch (error) {
      console.error("Unable to remove item:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to remove item. Please try again.",
      );
    }
  }

  /* =====================================================
     PROCEED TO SHOPIFY CHECKOUT
  ===================================================== */

  async function handleCheckout() {
    if (cartCount <= 0) {
      alert("Your cart is empty.");
      return;
    }

    try {
      await proceedToCheckout();
    } catch (error) {
      console.error("Unable to proceed to checkout:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to proceed to checkout. Please try again.",
      );
    }
  }

  return (
    <main className="cart-page">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <section className="cart-header">
        <p className="cart-eyebrow">OPULENCE COLLECTION</p>

        <h1 className="cart-title">Your Cart</h1>

        <p className="cart-subtitle">Pieces selected for your collection.</p>
      </section>

      {/* =====================================================
          CART CONTENT
      ===================================================== */}

      <section className="cart-content">
        {/* =====================================================
            LEFT
        ===================================================== */}

        <div className="cart-items">
          <div className="cart-items-top">
            <span>YOUR PIECES</span>

            <span>
              {cartCount} {cartCount === 1 ? "ITEM" : "ITEMS"}
            </span>
          </div>

          <div className="cart-list">
            {cart.lines.edges.map(({ node }: any) => {
              const product = node?.merchandise?.product;

              const price = node?.merchandise?.price;

              const image = product?.featuredImage;

              const lineTotal =
                Number(price?.amount || 0) * Number(node?.quantity || 0);

              return (
                <article key={node.id} className="cart-line">
                  {/* =====================================================
                        IMAGE
                    ===================================================== */}

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

                  {/* =====================================================
                        DETAILS
                    ===================================================== */}

                  <div className="cart-line-info">
                    <p className="cart-line-brand">OPULENCE</p>

                    <h2 className="cart-line-title">
                      {product?.title || "Product"}
                    </h2>

                    {node?.merchandise?.title &&
                      node.merchandise.title !== "Default Title" && (
                        <p className="cart-line-variant">
                          {node.merchandise.title}
                        </p>
                      )}

                    <p className="cart-line-qty">Qty: {node.quantity}</p>

                    {/* =====================================================
                          MOBILE PRICE
                      ===================================================== */}

                    <p className="cart-line-price mobile-price">
                      {price?.currencyCode || currency} {lineTotal.toFixed(2)}
                    </p>

                    {/* =====================================================
                          REMOVE
                      ===================================================== */}

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

                  {/* =====================================================
                        DESKTOP PRICE
                    ===================================================== */}

                  <div className="cart-line-right">
                    <p className="cart-line-price">
                      {price?.currencyCode || currency} {lineTotal.toFixed(2)}
                    </p>
                  </div>
                </article>
              );
            })}
          </div>
        </div>

        {/* =====================================================
            RIGHT SUMMARY
        ===================================================== */}

        <aside className="cart-summary">
          <div className="cart-summary-top">
            <p>ORDER SUMMARY</p>
          </div>

          {/* =====================================================
              SUBTOTAL
          ===================================================== */}

          <div className="cart-summary-row">
            <span>Subtotal</span>

            <span>
              {currency} {subtotal.toFixed(2)}
            </span>
          </div>

          {/* =====================================================
              SHIPPING
          ===================================================== */}

          <div className="cart-summary-row">
            <span>Shipping</span>

            <span>CALCULATED AT CHECKOUT</span>
          </div>

          <div className="cart-summary-divider" />

          {/* =====================================================
              TOTAL
          ===================================================== */}

          <div className="cart-total">
            <span>TOTAL</span>

            <span>
              {currency} {total.toFixed(2)}
            </span>
          </div>

          {/* =====================================================
              SHOPIFY CHECKOUT
          ===================================================== */}

          <button
            type="button"
            className="cart-checkout-btn"
            onClick={handleCheckout}
            disabled={loading || cartCount <= 0}
          >
            <span>{loading ? "PROCESSING..." : "PROCEED TO CHECKOUT"}</span>

            {!loading && <span>→</span>}
          </button>

          {/* =====================================================
              CONTINUE SHOPPING
          ===================================================== */}

          <a href="/collections/all" className="cart-continue">
            CONTINUE SHOPPING
          </a>
        </aside>
      </section>
    </main>
  );
}
