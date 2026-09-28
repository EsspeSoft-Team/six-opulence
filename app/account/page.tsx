"use client";

import "./account.css";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

import { useAuth } from "@/lib/auth-context";

export default function AccountPage() {
  const { customer, loading, logout } = useAuth();
  const router = useRouter();

  /*
   * LOGIN REQUIRED
   */
  useEffect(() => {
    if (!loading && !customer) {
      router.replace("/login");
    }
  }, [loading, customer, router]);

  /*
   * LOADING
   */
  if (loading) {
    return (
      <main className="account-loading">
        <div className="account-loader">
          <span />
          <p>Loading your account</p>
        </div>
      </main>
    );
  }

  /*
   * NOT LOGGED IN
   */
  if (!customer) {
    return null;
  }

  const customerData = customer as any;

  /*
   * SHOPIFY DATA
   */
  const orders = customerData?.orders?.edges ?? [];
  const addresses = customerData?.addresses?.edges ?? [];

  /*
   * Recent 3 orders
   */
  const recentOrders = orders.slice(0, 3);

  /*
   * CUSTOMER
   */
  const firstName = customerData?.firstName ?? "";
  const lastName = customerData?.lastName ?? "";
  const email =
    customerData?.email ?? customerData?.emailAddress?.emailAddress ?? "";
  const phone = customerData?.phone ?? "";

  const displayName = firstName || email?.split("@")[0] || "Account";

  const fullName = `${firstName} ${lastName}`.trim() || displayName;

  /*
   * ADDRESS
   */
  const defaultAddress =
    customerData?.defaultAddress || addresses?.[0]?.node || null;

  /*
   * WISHLIST
   *
   * Wishlist system is separate from Shopify customer API.
   * If your existing wishlist page stores the count in localStorage,
   * this will read it.
   */
  let wishlistCount = 0;

  if (typeof window !== "undefined") {
    try {
      const storedWishlist = localStorage.getItem("opulence-wishlist");

      if (storedWishlist) {
        const parsed = JSON.parse(storedWishlist);

        if (Array.isArray(parsed)) {
          wishlistCount = parsed.length;
        }
      }
    } catch {
      wishlistCount = 0;
    }
  }

  /*
   * HELPERS
   */
  const formatDate = (date: string) => {
    if (!date) return "";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: string | number, currencyCode = "INR") => {
    if (amount === "" || amount === null || amount === undefined) {
      return "";
    }

    try {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: currencyCode,
        maximumFractionDigits: 0,
      }).format(Number(amount));
    } catch {
      return `${currencyCode} ${amount}`;
    }
  };

  const getStatusClass = (status: string) => {
    const clean = String(status || "")
      .toLowerCase()
      .replace(/\s+/g, "-");

    if (clean.includes("deliver") || clean.includes("fulfilled")) {
      return "delivered";
    }

    if (clean.includes("cancel") || clean.includes("refun")) {
      return "cancelled";
    }

    if (clean.includes("process") || clean.includes("pending")) {
      return "processing";
    }

    return "processing";
  };

  const getStatusText = (status: string) => {
    if (!status) return "PROCESSING";

    const clean = String(status).toLowerCase();

    if (clean.includes("fulfilled") || clean.includes("deliver")) {
      return "DELIVERED";
    }

    if (clean.includes("cancel")) {
      return "CANCELLED";
    }

    if (clean.includes("refund")) {
      return "REFUNDED";
    }

    if (clean.includes("process")) {
      return "PROCESSING";
    }

    return String(status).toUpperCase();
  };

  const getAddressText = () => {
    if (!defaultAddress) {
      return "No saved address";
    }

    const parts = [defaultAddress.city, defaultAddress.province].filter(
      Boolean,
    );

    if (parts.length) {
      return parts.join(", ");
    }

    return [
      defaultAddress.address1,
      defaultAddress.address2,
      defaultAddress.zip,
    ]
      .filter(Boolean)
      .join(", ");
  };

  /*
   * LOGOUT
   */
  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      router.push("/");
    }
  };

  return (
    <main className="account-page">
      <div className="account-container">
        {/* ==================================================
            HEADER
        ================================================== */}

        <header className="account-header">
          <div className="account-header-content">
            <span className="account-eyebrow">MY ACCOUNT</span>

            <h1>
              Welcome, <em>{displayName}</em>
            </h1>

            <p>Manage your orders, addresses and saved pieces.</p>
          </div>

          <button
            type="button"
            className="account-logout"
            onClick={handleLogout}
          >
            Logout
            <span>↗</span>
          </button>
        </header>

        {/* ==================================================
            ACCOUNT SUMMARY
        ================================================== */}

        <section className="account-summary">
          {/* ORDER HISTORY */}

          <Link href="/account/orders" className="summary-card">
            <div className="summary-card-top">
              <span className="summary-number">01</span>

              <span className="summary-arrow">↗</span>
            </div>

            <div className="summary-content">
              <span className="summary-label">ORDER HISTORY</span>

              <strong>{orders.length}</strong>

              <p>{orders.length === 1 ? "Order" : "Orders"}</p>
            </div>
          </Link>

          {/* ADDRESSES */}

          <Link href="/account/addresses" className="summary-card">
            <div className="summary-card-top">
              <span className="summary-number">02</span>

              <span className="summary-arrow">↗</span>
            </div>

            <div className="summary-content">
              <span className="summary-label">ADDRESSES</span>

              <strong>{addresses.length}</strong>

              <p>{addresses.length === 1 ? "Address" : "Addresses"}</p>
            </div>
          </Link>

          {/* WISHLIST */}

          <Link href="/wishlist" className="summary-card">
            <div className="summary-card-top">
              <span className="summary-number">03</span>

              <span className="summary-arrow">↗</span>
            </div>

            <div className="summary-content">
              <span className="summary-label">WISHLIST</span>

              <strong>{wishlistCount}</strong>

              <p>Saved</p>
            </div>
          </Link>
        </section>

        {/* ==================================================
            YOUR PURCHASES
        ================================================== */}

        <section className="recent-orders">
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">YOUR PURCHASES</span>

              <h2>Recent Orders</h2>
            </div>

            {orders.length > 0 && (
              <Link href="/account/orders" className="view-all">
                View all
                <span>↗</span>
              </Link>
            )}
          </div>

          {/* NO ORDERS */}

          {recentOrders.length === 0 ? (
            <div className="orders-empty">
              <span className="empty-label">NO ORDERS YET</span>

              <h3>Your wardrobe awaits.</h3>

              <p>
                Discover our latest collection and find something made for you.
              </p>

              <Link href="/" className="empty-button">
                Explore Collection
              </Link>
            </div>
          ) : (
            <div className="orders-list">
              {recentOrders.map(({ node }: any) => {
                if (!node) {
                  return null;
                }

                const orderNumber = node?.orderNumber ?? node?.name ?? "";

                const total = node?.currentTotalPrice?.amount ?? "";

                const currency = node?.currentTotalPrice?.currencyCode ?? "INR";

                const date = formatDate(node?.processedAt);

                const status =
                  node?.fulfillmentStatus ||
                  node?.financialStatus ||
                  "Processing";

                return (
                  <article key={node.id} className="order-card">
                    {/* TOP */}

                    <div className="order-card-top">
                      <div className="order-main-info">
                        <span className="order-label">ORDER</span>

                        <h3>#{orderNumber}</h3>
                      </div>

                      <div className="order-date">{date}</div>

                      <span
                        className={`order-status ${getStatusClass(status)}`}
                      >
                        {getStatusText(status)}
                      </span>
                    </div>

                    {/* BOTTOM */}

                    <div className="order-card-bottom">
                      <div className="order-total">
                        <span>TOTAL</span>

                        <strong>{formatCurrency(total, currency)}</strong>
                      </div>

                      <div className="order-actions">
                        <Link
                          href={`/account/orders?order=${encodeURIComponent(
                            node.id,
                          )}`}
                          className="order-view"
                        >
                          View Order
                          <span>↗</span>
                        </Link>

                        <Link
                          href={`/account/invoice?order=${encodeURIComponent(
                            node.id,
                          )}`}
                          className="invoice-link"
                        >
                          Invoice
                          <span>↓</span>
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* ==================================================
            ACCOUNT DETAILS
        ================================================== */}

        <section className="details-section">
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">PERSONAL INFORMATION</span>

              <h2>Account Details</h2>
            </div>

            <Link href="/account/profile" className="edit-link">
              Edit Profile
              <span>↗</span>
            </Link>
          </div>

          <div className="details-card">
            <div className="detail-row">
              <span className="detail-label">NAME</span>

              <strong>{fullName}</strong>
            </div>

            <div className="detail-row">
              <span className="detail-label">EMAIL</span>

              <strong>{email || "Not available"}</strong>
            </div>

            <div className="detail-row">
              <span className="detail-label">PHONE</span>

              <strong>{phone || "Not available"}</strong>
            </div>
          </div>
        </section>

        {/* ==================================================
            SAVED ADDRESSES
        ================================================== */}

        <section className="address-section">
          <div className="section-heading">
            <div>
              <span className="section-eyebrow">DELIVERY INFORMATION</span>

              <h2>Saved Addresses</h2>
            </div>

            <Link href="/account/addresses" className="edit-link">
              Manage
              <span>↗</span>
            </Link>
          </div>

          {defaultAddress ? (
            <div className="address-card">
              <div className="address-card-left">
                <span className="address-type">HOME</span>

                <h3>{defaultAddress.address1 || "Saved Address"}</h3>

                <p>{getAddressText()}</p>

                {defaultAddress.zip && (
                  <span className="address-pin">{defaultAddress.zip}</span>
                )}
              </div>

              <Link href="/account/addresses" className="address-edit">
                Edit
                <span>↗</span>
              </Link>
            </div>
          ) : (
            <div className="address-card address-empty">
              <div>
                <span className="address-type">HOME</span>

                <h3>No saved address</h3>

                <p>Add an address for faster checkout.</p>
              </div>

              <Link href="/account/addresses" className="address-edit">
                Add
                <span>↗</span>
              </Link>
            </div>
          )}
        </section>

        {/* ==================================================
            FOOTER
        ================================================== */}

        <footer className="account-footer">
          <span />

          <p>Thank you for being part of OPULENCE.</p>

          <span />
        </footer>
      </div>
    </main>
  );
}
