"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Plus, Minus } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import "./CartDrawer.css";

type CartDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export default function CartDrawer({ open, onClose }: CartDrawerProps) {
  const {
    cart,
    loading,
    removeItem,
    updateItem,
    proceedToCheckout,
    cartCount,
  } = useCart();

  if (!open) {
    return null;
  }

  const lines = cart?.lines?.edges || [];

  const subtotal =
    Number(cart?.cost?.subtotalAmount?.amount || 0) ||
    lines.reduce((total: number, { node }: any) => {
      const price = Number(node?.merchandise?.price?.amount || 0);

      const quantity = Number(node?.quantity || 0);

      return total + price * quantity;
    }, 0);

  const currency =
    cart?.cost?.subtotalAmount?.currencyCode ||
    cart?.cost?.totalAmount?.currencyCode ||
    lines?.[0]?.node?.merchandise?.price?.currencyCode ||
    "INR";

  async function handleRemove(lineId: string) {
    try {
      await removeItem(lineId);
    } catch (error) {
      console.error("Unable to remove cart item:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to remove item. Please try again.",
      );
    }
  }

  async function handleCheckout() {
    if (cartCount <= 0) {
      alert("Your cart is empty.");
      return;
    }

    try {
      await proceedToCheckout();
    } catch (error) {
      console.error("Unable to checkout:", error);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to proceed to checkout. Please try again.",
      );
    }
  }

  return (
    <div className="cart-drawer-overlay" onClick={onClose}>
      <aside
        className="cart-drawer"
        onClick={(event) => event.stopPropagation()}
      >
        {/* HEADER */}

        <div className="cart-drawer-header">
          <div>
            <p className="cart-drawer-eyebrow">OPULENCE COLLECTION</p>

            <h2>
              Your Cart
              {cartCount > 0 && (
                <span className="cart-drawer-count">{cartCount}</span>
              )}
            </h2>
          </div>

          <button
            type="button"
            className="cart-drawer-close"
            onClick={onClose}
            aria-label="Close cart"
          >
            <X size={20} strokeWidth={1.4} />
          </button>
        </div>

        {/* CONTENT */}

        <div className="cart-drawer-body">
          {lines.length === 0 ? (
            <div className="cart-drawer-empty">
              <div className="cart-drawer-empty-icon">BAG</div>

              <h3>Your Cart is Empty</h3>

              <p>Discover pieces made for your collection.</p>

              <Link
                href="/collections/all"
                className="cart-drawer-shop"
                onClick={onClose}
              >
                EXPLORE COLLECTION
              </Link>
            </div>
          ) : (
            <div className="cart-drawer-items">
              {lines.map(({ node }: any) => {
                const product = node?.merchandise?.product;

                const variant = node?.merchandise;

                const image = variant?.image || product?.featuredImage;

                const title = product?.title || "Product";

                const price = Number(variant?.price?.amount || 0);

                const quantity = Number(node?.quantity || 0);

                const lineTotal = price * quantity;

                return (
                  <article key={node.id} className="cart-drawer-item">
                    {/* IMAGE */}

                    <div className="cart-drawer-item-image">
                      {image?.url ? (
                        <Image
                          src={image.url}
                          alt={image.altText || title}
                          fill
                          sizes="100px"
                          style={{
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        <span>OPULENCE</span>
                      )}
                    </div>

                    {/* DETAILS */}

                    <div className="cart-drawer-item-info">
                      <div className="cart-drawer-item-top">
                        <div>
                          <p className="cart-drawer-brand">OPULENCE</p>

                          <h3>{title}</h3>

                          {variant?.title &&
                            variant.title !== "Default Title" && (
                              <p className="cart-drawer-variant">
                                {variant.title}
                              </p>
                            )}
                        </div>

                        <button
                          type="button"
                          className="cart-drawer-remove"
                          onClick={() => handleRemove(node.id)}
                          disabled={loading}
                        >
                          ×
                        </button>
                      </div>

                      <div className="cart-drawer-item-bottom">
                        <div className="cart-drawer-quantity">
                          <button
                            type="button"
                            disabled={loading || quantity <= 1}
                            onClick={() => updateItem(node.id, quantity - 1)}
                          >
                            <Minus size={12} strokeWidth={1.5} />
                          </button>

                          <span>{quantity}</span>

                          <button
                            type="button"
                            disabled={loading}
                            onClick={() => updateItem(node.id, quantity + 1)}
                          >
                            <Plus size={12} strokeWidth={1.5} />
                          </button>
                        </div>

                        <p className="cart-drawer-price">
                          {currency} {lineTotal.toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </div>

        {/* FOOTER */}

        {lines.length > 0 && (
          <div className="cart-drawer-footer">
            <div className="cart-drawer-subtotal">
              <span>Subtotal</span>

              <strong>
                {currency} {subtotal.toFixed(2)}
              </strong>
            </div>

            <p className="cart-drawer-note">Shipping calculated at checkout.</p>

            <button
              type="button"
              className="cart-drawer-checkout"
              onClick={handleCheckout}
              disabled={loading || cartCount <= 0}
            >
              <span>{loading ? "PROCESSING..." : "PROCEED TO CHECKOUT"}</span>

              {!loading && <span>→</span>}
            </button>

            <Link href="/cart" className="cart-drawer-view" onClick={onClose}>
              VIEW FULL CART
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
