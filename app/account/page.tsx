"use client";

import "./account.css";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/lib/auth-context";

type TrackingItem = {
  fulfillmentId?: string;
  status?: string | null;
  createdAt?: string;
  company?: string | null;
  number?: string | null;
  url?: string | null;
};

export default function AccountPage() {
  const { customer, loading, logout } = useAuth();
  const router = useRouter();

  const [wishlistCount, setWishlistCount] = useState(0);

  const [savedAddresses, setSavedAddresses] = useState<any[] | null>(null);
  const [savedDefaultAddressId, setSavedDefaultAddressId] = useState<
    string | null
  >(null);

  const [addressModalOpen, setAddressModalOpen] = useState(false);
  const [addressEditingId, setAddressEditingId] = useState<string | null>(null);
  const [addressSaving, setAddressSaving] = useState(false);
  const [addressDeletingId, setAddressDeletingId] = useState<string | null>(
    null,
  );
  const [addressError, setAddressError] = useState("");
  const [addressSuccess, setAddressSuccess] = useState("");

  const [addressForm, setAddressForm] = useState({
    firstName: "",
    lastName: "",
    address1: "",
    address2: "",
    city: "",
    province: "",
    zip: "",
    countryCode: "IN",
    phone: "",
    setAsDefault: false,
  });

  const [editingName, setEditingName] = useState(false);
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");

  const [profileSaving, setProfileSaving] = useState(false);
  const [profileError, setProfileError] = useState("");
  const [profileSuccess, setProfileSuccess] = useState("");

  const [trackingOrderId, setTrackingOrderId] = useState<string | null>(null);

  const [tracking, setTracking] = useState<TrackingItem[]>([]);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState("");

  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(
    null,
  );

  const [cancelMessage, setCancelMessage] = useState("");
  const [cancelError, setCancelError] = useState("");

  /* =========================================================
     REDIRECT IF NOT LOGGED IN
  ========================================================= */

  useEffect(() => {
    if (!loading && !customer) {
      router.replace("/login");
    }
  }, [loading, customer, router]);

  /* =========================================================
     CUSTOMER DATA
  ========================================================= */

  useEffect(() => {
    if (!customer) return;

    const data = customer as any;

    setEditFirstName(data?.firstName ?? "");
    setEditLastName(data?.lastName ?? "");

    try {
      const storedWishlist = localStorage.getItem("opulence-wishlist");

      if (!storedWishlist) {
        setWishlistCount(0);
        return;
      }

      const parsed = JSON.parse(storedWishlist);

      setWishlistCount(Array.isArray(parsed) ? parsed.length : 0);
    } catch {
      setWishlistCount(0);
    }
  }, [customer]);

  /* =========================================================
     LOAD SAVED ADDRESSES
  ========================================================= */

  useEffect(() => {
    if (!customer) {
      setSavedAddresses([]);
      setSavedDefaultAddressId(null);
      return;
    }

    let cancelled = false;

    const loadSavedAddresses = async () => {
      try {
        const response = await fetch("/api/account/addresses", {
          method: "GET",
          cache: "no-store",
        });

        const data = await response.json();

        if (cancelled) return;

        if (!response.ok || !data?.success) {
          throw new Error(data?.error || "Unable to load saved addresses.");
        }

        setSavedAddresses(Array.isArray(data.addresses) ? data.addresses : []);
        setSavedDefaultAddressId(data.defaultAddressId || null);
      } catch (error) {
        if (cancelled) return;

        console.error("ACCOUNT ADDRESS LOAD ERROR:", error);
        setSavedAddresses(null);
        setSavedDefaultAddressId(null);
      }
    };

    loadSavedAddresses();

    return () => {
      cancelled = true;
    };
  }, [customer]);

  /* =========================================================
     LOADING
  ========================================================= */

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

  if (!customer) {
    return null;
  }

  const customerData = customer as any;

  const orders = customerData?.orders?.edges ?? [];

  const addresses =
    savedAddresses !== null
      ? savedAddresses.map((address) => ({ node: address }))
      : (customerData?.addresses?.edges ?? []);

  const recentOrders = orders.slice(0, 5);

  const firstName = customerData?.firstName ?? "";

  const lastName = customerData?.lastName ?? "";

  const email =
    customerData?.email ?? customerData?.emailAddress?.emailAddress ?? "";

  const phone = customerData?.phone ?? "";

  const displayName = firstName || email?.split("@")[0] || "Account";

  const fullName = `${firstName} ${lastName}`.trim() || displayName;

  const defaultAddress =
    savedAddresses !== null
      ? savedAddresses.find(
          (address) => address?.id === savedDefaultAddressId,
        ) ||
        savedAddresses?.[0] ||
        null
      : customerData?.defaultAddress || addresses?.[0]?.node || null;

  /* =========================================================
     FORMAT DATE
  ========================================================= */

  const formatDate = (date: string) => {
    if (!date) return "";

    try {
      return new Date(date).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "";
    }
  };

  /* =========================================================
     FORMAT CURRENCY
  ========================================================= */

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

  /* =========================================================
     STATUS
  ========================================================= */

  const getStatusClass = (status: string) => {
    const clean = String(status || "")
      .toLowerCase()
      .replace(/\s+/g, "-");

    if (clean.includes("deliver") || clean.includes("fulfilled")) {
      return "delivered";
    }

    if (clean.includes("cancel") || clean.includes("refund")) {
      return "cancelled";
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

    if (clean.includes("process") || clean.includes("pending")) {
      return "PROCESSING";
    }

    return String(status).toUpperCase();
  };

  /* =========================================================
     ADDRESS
  ========================================================= */

  const getAddressText = () => {
    if (!defaultAddress) {
      return "No saved address";
    }

    const lineOne = [defaultAddress.address1, defaultAddress.address2]
      .filter(Boolean)
      .join(", ");

    const lineTwo = [
      defaultAddress.city,
      defaultAddress.province,
      defaultAddress.zip,
    ]
      .filter(Boolean)
      .join(", ");

    return [lineOne, lineTwo].filter(Boolean).join(" • ");
  };

  /* =========================================================
     ADDRESS MANAGEMENT
  ========================================================= */

  const resetAddressForm = () => {
    setAddressForm({
      firstName: firstName,
      lastName: lastName,
      address1: "",
      address2: "",
      city: "",
      province: "",
      zip: "",
      countryCode: "IN",
      phone: phone,
      setAsDefault: addresses.length === 0,
    });
    setAddressEditingId(null);
    setAddressError("");
  };

  const openAddAddress = () => {
    resetAddressForm();
    setAddressSuccess("");
    setAddressModalOpen(true);
  };

  const openEditAddress = (address: any) => {
    setAddressEditingId(address?.id || null);
    setAddressError("");
    setAddressSuccess("");
    setAddressForm({
      firstName: address?.firstName || firstName,
      lastName: address?.lastName || lastName,
      address1: address?.address1 || "",
      address2: address?.address2 || "",
      city: address?.city || "",
      province: address?.province || address?.provinceCode || "",
      zip: address?.zip || "",
      countryCode: address?.countryCode || "IN",
      phone: address?.phone || phone,
      setAsDefault: savedDefaultAddressId
        ? address?.id === savedDefaultAddressId
        : Boolean(
            customerData?.defaultAddress?.id &&
            address?.id === customerData.defaultAddress.id,
          ),
    });
    setAddressModalOpen(true);
  };

  const handleAddressChange = (
    field: keyof typeof addressForm,
    value: string | boolean,
  ) => {
    setAddressForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleAddressSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setAddressError("");
    setAddressSuccess("");

    if (
      !addressForm.firstName.trim() ||
      !addressForm.lastName.trim() ||
      !addressForm.address1.trim() ||
      !addressForm.city.trim() ||
      !addressForm.province.trim() ||
      !addressForm.zip.trim()
    ) {
      setAddressError(
        "Please fill First Name, Last Name, Address, City, State and PIN Code.",
      );
      return;
    }

    try {
      setAddressSaving(true);

      const response = await fetch("/api/account/addresses", {
        method: addressEditingId ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          addressId: addressEditingId,
          ...addressForm,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "Unable to save address.");
      }

      try {
        const addressResponse = await fetch("/api/account/addresses", {
          method: "GET",
          cache: "no-store",
        });

        const addressData = await addressResponse.json();

        if (addressResponse.ok && addressData?.success) {
          setSavedAddresses(
            Array.isArray(addressData.addresses) ? addressData.addresses : [],
          );
          setSavedDefaultAddressId(addressData.defaultAddressId || null);
        }
      } catch (refreshError) {
        console.error("ADDRESS LIST REFRESH ERROR:", refreshError);
      }

      setAddressSuccess(
        addressEditingId
          ? "Address updated successfully."
          : "Address added successfully.",
      );

      setAddressModalOpen(false);
      setAddressEditingId(null);
      resetAddressForm();
    } catch (error) {
      setAddressError(
        error instanceof Error ? error.message : "Unable to save address.",
      );
    } finally {
      setAddressSaving(false);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!window.confirm("Delete this saved address?")) {
      return;
    }

    try {
      setAddressDeletingId(addressId);
      setAddressError("");
      setAddressSuccess("");

      const response = await fetch("/api/account/addresses", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          addressId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "Unable to delete address.");
      }

      try {
        const addressResponse = await fetch("/api/account/addresses", {
          method: "GET",
          cache: "no-store",
        });

        const addressData = await addressResponse.json();

        if (addressResponse.ok && addressData?.success) {
          setSavedAddresses(
            Array.isArray(addressData.addresses) ? addressData.addresses : [],
          );
          setSavedDefaultAddressId(addressData.defaultAddressId || null);
        }
      } catch (refreshError) {
        console.error("ADDRESS LIST REFRESH ERROR:", refreshError);
      }

      setAddressSuccess("Address deleted successfully.");
    } catch (error) {
      setAddressError(
        error instanceof Error ? error.message : "Unable to delete address.",
      );
    } finally {
      setAddressDeletingId(null);
    }
  };

  /* =========================================================
     LOGOUT
  ========================================================= */

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      router.push("/");
    }
  };

  /* =========================================================
     PROFILE UPDATE
  ========================================================= */

  const handleProfileSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setProfileError("");
    setProfileSuccess("");

    const first = editFirstName.trim().replace(/\s+/g, " ");

    const last = editLastName.trim().replace(/\s+/g, " ");

    if (!first) {
      setProfileError("Please enter your first name.");
      return;
    }

    if (first.length > 60 || last.length > 60) {
      setProfileError("Name must be 60 characters or less.");
      return;
    }

    try {
      setProfileSaving(true);

      const response = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstName: first,
          lastName: last,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "Unable to update your profile.");
      }

      setProfileSuccess("Profile updated successfully.");

      setEditingName(false);

      setTimeout(() => {
        window.location.reload();
      }, 700);
    } catch (error) {
      setProfileError(
        error instanceof Error
          ? error.message
          : "Unable to update your profile.",
      );
    } finally {
      setProfileSaving(false);
    }
  };

  /* =========================================================
     TRACK ORDER
  ========================================================= */

  const handleTrackOrder = async (orderId: string) => {
    if (trackingOrderId === orderId) {
      setTrackingOrderId(null);
      setTracking([]);
      setTrackingError("");
      return;
    }

    try {
      setTrackingOrderId(orderId);
      setTrackingLoading(true);
      setTrackingError("");
      setTracking([]);

      const response = await fetch(
        `/api/account/order/tracking?id=${encodeURIComponent(orderId)}`,
        {
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "Unable to load tracking information.");
      }

      setTracking(data.tracking || []);
    } catch (error) {
      setTrackingError(
        error instanceof Error
          ? error.message
          : "Unable to load tracking information.",
      );
    } finally {
      setTrackingLoading(false);
    }
  };

  /* =========================================================
     CANCEL ORDER
  ========================================================= */

  const handleCancelOrder = async (orderId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order?",
    );

    if (!confirmed) return;

    try {
      setCancellingOrderId(orderId);

      setCancelError("");
      setCancelMessage("");

      const response = await fetch("/api/account/order/cancel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orderId,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "Unable to cancel order.");
      }

      setCancelMessage("Order cancellation submitted successfully.");

      setTimeout(() => {
        window.location.reload();
      }, 800);
    } catch (error) {
      setCancelError(
        error instanceof Error ? error.message : "Unable to cancel order.",
      );
    } finally {
      setCancellingOrderId(null);
    }
  };

  /* =========================================================
     DOWNLOAD INVOICE
  ========================================================= */

  const handleInvoice = (orderId: string) => {
    window.open(
      `/api/account/order/invoice?id=${encodeURIComponent(orderId)}`,
      "_blank",
    );
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="account-page">
      <div className="account-shell">
        {/* =====================================================
            HEADER
        ===================================================== */}

        <section id="overview" className="account-welcome">
          <div>
            <span className="account-eyebrow">MY ACCOUNT</span>

            <h1>
              Welcome, <em>{displayName}</em>
            </h1>

            <p>Manage your orders, profile, addresses and saved pieces.</p>
          </div>

          <button
            type="button"
            className="account-logout"
            onClick={handleLogout}
          >
            Logout
            <span>↗</span>
          </button>
        </section>

        {/* =====================================================
            MOBILE NAV
        ===================================================== */}

        <nav className="account-mobile-nav">
          <a href="#overview">Overview</a>

          <a href="#orders">Orders</a>

          <a href="#addresses">Addresses</a>

          <a href="#profile">Profile</a>

          <Link href="/wishlist">Wishlist</Link>
        </nav>

        <div className="account-layout">
          {/* ===================================================
              SIDEBAR
          =================================================== */}

          <aside className="account-sidebar">
            <div className="account-profile-mini">
              <div className="account-avatar">
                {displayName.charAt(0).toUpperCase()}
              </div>

              <div>
                <strong>{fullName}</strong>

                <span>{email || "OPULENCE Member"}</span>
              </div>
            </div>

            <nav className="account-nav">
              <a href="#overview" className="account-nav-item is-active">
                <span className="nav-icon">01</span>

                <span>Overview</span>

                <span className="nav-arrow">↗</span>
              </a>

              <a href="#orders" className="account-nav-item">
                <span className="nav-icon">02</span>

                <span>My Orders</span>

                <span className="nav-count">{orders.length}</span>
              </a>

              <a href="#addresses" className="account-nav-item">
                <span className="nav-icon">03</span>

                <span>Addresses</span>

                <span className="nav-count">{addresses.length}</span>
              </a>

              <Link href="/wishlist" className="account-nav-item">
                <span className="nav-icon">04</span>

                <span>Wishlist</span>

                <span className="nav-count">{wishlistCount}</span>
              </Link>
            </nav>

            <div className="account-sidebar-note">
              <span>OPULENCE</span>

              <p>The art of affluence.</p>
            </div>
          </aside>

          {/* ===================================================
              MAIN
          =================================================== */}

          <div className="account-main">
            {/* =================================================
                QUICK STATS
            ================================================= */}

            <section className="account-stat-grid">
              <a href="#orders" className="account-stat-card">
                <span>ORDERS</span>

                <strong>{orders.length}</strong>

                <small>
                  {orders.length === 1 ? "Order placed" : "Orders placed"}
                </small>

                <b>↗</b>
              </a>

              <a href="#addresses" className="account-stat-card">
                <span>ADDRESSES</span>

                <strong>{addresses.length}</strong>

                <small>
                  {addresses.length === 1 ? "Saved address" : "Saved addresses"}
                </small>

                <b>↗</b>
              </a>

              <Link href="/wishlist" className="account-stat-card dark">
                <span>WISHLIST</span>

                <strong>{wishlistCount}</strong>

                <small>Saved pieces</small>

                <b>↗</b>
              </Link>
            </section>

            {/* =================================================
                ORDERS
            ================================================= */}

            <section id="orders" className="account-section">
              <div className="account-section-head">
                <div>
                  <span className="section-eyebrow">SHOPPING ACTIVITY</span>

                  <h2>My Orders</h2>
                </div>

                <span className="section-link">
                  {orders.length} {orders.length === 1 ? "Order" : "Orders"}
                </span>
              </div>

              {cancelMessage && (
                <p className="profile-message success">{cancelMessage}</p>
              )}

              {cancelError && (
                <p className="profile-message error">{cancelError}</p>
              )}

              {recentOrders.length === 0 ? (
                <div className="account-empty">
                  <span>NO ORDERS YET</span>

                  <h3>Your wardrobe awaits.</h3>

                  <p>
                    Discover the latest OPULENCE collection and find something
                    made for you.
                  </p>

                  <Link href="/" className="account-primary-btn">
                    Explore Collection
                  </Link>
                </div>
              ) : (
                <div className="account-order-list">
                  {recentOrders.map(({ node }: any) => {
                    if (!node) {
                      return null;
                    }

                    const orderNumber = node?.orderNumber ?? node?.name ?? "";

                    const total = node?.currentTotalPrice?.amount ?? "";

                    const currency =
                      node?.currentTotalPrice?.currencyCode ?? "INR";

                    const status =
                      node?.fulfillmentStatus ||
                      node?.financialStatus ||
                      "Processing";

                    const firstLine = node?.lineItems?.edges?.[0]?.node;

                    const productImage =
                      firstLine?.variant?.image?.url ||
                      firstLine?.image?.url ||
                      "";

                    const isCancelled = String(status)
                      .toLowerCase()
                      .includes("cancel");

                    return (
                      <article key={node.id} className="account-order-row">
                        <div className="order-product-image">
                          {productImage ? (
                            <img
                              src={productImage}
                              alt={firstLine?.title || "OPULENCE product"}
                            />
                          ) : (
                            <span>OP</span>
                          )}
                        </div>

                        <div className="order-row-info">
                          <span>ORDER #{orderNumber}</span>

                          <h3>
                            {firstLine?.title ||
                              `${firstLine?.quantity || 1} item${
                                firstLine?.quantity === 1 ? "" : "s"
                              }`}
                          </h3>

                          <p>
                            {formatDate(node?.processedAt)}
                            {" • "}
                            {firstLine?.quantity || 1} item
                            {firstLine?.quantity === 1 ? "" : "s"}
                          </p>
                        </div>

                        <div className="order-row-total">
                          <span>TOTAL</span>

                          <strong>{formatCurrency(total, currency)}</strong>
                        </div>

                        <div
                          className={`order-row-status ${getStatusClass(
                            status,
                          )}`}
                        >
                          <i />

                          {getStatusText(status)}
                        </div>

                        <div className="account-order-actions">
                          {/* TRACK */}

                          <button
                            type="button"
                            className="order-row-view"
                            onClick={() => handleTrackOrder(node.id)}
                          >
                            {trackingOrderId === node.id ? "Close" : "Track"}
                            <span>↗</span>
                          </button>

                          {/* INVOICE */}

                          <button
                            type="button"
                            className="order-row-view"
                            onClick={() => handleInvoice(node.id)}
                          >
                            Invoice
                            <span>↓</span>
                          </button>

                          {/* CANCEL */}

                          {!isCancelled && (
                            <button
                              type="button"
                              className="order-row-cancel"
                              disabled={cancellingOrderId === node.id}
                              onClick={() => handleCancelOrder(node.id)}
                            >
                              {cancellingOrderId === node.id
                                ? "Cancelling..."
                                : "Cancel"}
                            </button>
                          )}
                        </div>

                        {/* ===================================
                              TRACKING PANEL
                          =================================== */}

                        {trackingOrderId === node.id && (
                          <div className="order-tracking-panel">
                            <div className="tracking-heading">
                              <span>ORDER TRACKING</span>

                              <strong>#{orderNumber}</strong>
                            </div>

                            {trackingLoading && (
                              <p>Loading tracking information...</p>
                            )}

                            {trackingError && (
                              <p className="profile-message error">
                                {trackingError}
                              </p>
                            )}

                            {!trackingLoading &&
                              !trackingError &&
                              tracking.length === 0 && (
                                <div className="tracking-empty">
                                  <strong>
                                    Tracking information not available
                                  </strong>

                                  <p>
                                    Tracking details will appear here once your
                                    order has been shipped.
                                  </p>
                                </div>
                              )}

                            {!trackingLoading && tracking.length > 0 && (
                              <div className="tracking-list">
                                {tracking.map((item, index) => (
                                  <div
                                    className="tracking-item"
                                    key={`${item.fulfillmentId}-${index}`}
                                  >
                                    <div className="tracking-dot" />

                                    <div>
                                      <strong>
                                        {item.company || "Courier"}
                                      </strong>

                                      {item.number && (
                                        <p>Tracking No: {item.number}</p>
                                      )}

                                      {item.createdAt && (
                                        <small>
                                          {formatDate(item.createdAt)}
                                        </small>
                                      )}

                                      {item.url && (
                                        <a
                                          href={item.url}
                                          target="_blank"
                                          rel="noreferrer"
                                        >
                                          Track shipment ↗
                                        </a>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </section>

            {/* =================================================
                PROFILE
            ================================================= */}

            <section id="profile" className="account-section">
              <div className="account-section-head">
                <div>
                  <span className="section-eyebrow">PERSONAL INFORMATION</span>

                  <h2>Profile</h2>
                </div>

                {!editingName ? (
                  <button
                    type="button"
                    className="section-link section-button"
                    onClick={() => {
                      setEditFirstName(firstName);

                      setEditLastName(lastName);

                      setProfileError("");
                      setProfileSuccess("");

                      setEditingName(true);
                    }}
                  >
                    Edit profile <span>↗</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="section-link section-button"
                    onClick={() => {
                      setEditingName(false);
                      setProfileError("");
                      setProfileSuccess("");
                    }}
                    disabled={profileSaving}
                  >
                    Cancel
                  </button>
                )}
              </div>

              {!editingName ? (
                <div className="profile-grid">
                  <div className="profile-detail">
                    <span>FULL NAME</span>

                    <strong>{fullName}</strong>
                  </div>

                  <div className="profile-detail">
                    <span>EMAIL ADDRESS</span>

                    <strong>{email || "Not available"}</strong>
                  </div>

                  <div className="profile-detail">
                    <span>PHONE</span>

                    <strong>{phone || "Not available"}</strong>
                  </div>
                </div>
              ) : (
                <form
                  className="profile-edit-card"
                  onSubmit={handleProfileSubmit}
                >
                  <div className="profile-edit-grid">
                    <label>
                      <span>FIRST NAME</span>

                      <input
                        type="text"
                        value={editFirstName}
                        onChange={(event) =>
                          setEditFirstName(event.target.value)
                        }
                        maxLength={60}
                        autoComplete="given-name"
                        disabled={profileSaving}
                      />
                    </label>

                    <label>
                      <span>LAST NAME</span>

                      <input
                        type="text"
                        value={editLastName}
                        onChange={(event) =>
                          setEditLastName(event.target.value)
                        }
                        maxLength={60}
                        autoComplete="family-name"
                        disabled={profileSaving}
                      />
                    </label>
                  </div>

                  {profileError && (
                    <p className="profile-message error">{profileError}</p>
                  )}

                  {profileSuccess && (
                    <p className="profile-message success">{profileSuccess}</p>
                  )}

                  <div className="profile-edit-actions">
                    <button
                      type="button"
                      className="profile-cancel"
                      onClick={() => {
                        setEditingName(false);

                        setProfileError("");
                        setProfileSuccess("");
                      }}
                      disabled={profileSaving}
                    >
                      Cancel
                    </button>

                    <button
                      type="submit"
                      className="profile-save"
                      disabled={profileSaving}
                    >
                      {profileSaving ? "Saving..." : "Save Changes"}

                      {!profileSaving && <span>↗</span>}
                    </button>
                  </div>
                </form>
              )}
            </section>

            {/* =================================================
                ADDRESSES
            ================================================= */}

            <section id="addresses" className="account-section">
              <div className="account-section-head">
                <div>
                  <span className="section-eyebrow">DELIVERY INFORMATION</span>

                  <h2>Saved Addresses</h2>
                </div>

                <button
                  type="button"
                  className="section-link section-button"
                  onClick={openAddAddress}
                >
                  Add new address <span>+</span>
                </button>
              </div>

              {addressError && (
                <p className="profile-message error">{addressError}</p>
              )}

              {addressSuccess && (
                <p className="profile-message success">{addressSuccess}</p>
              )}

              {addresses.length > 0 ? (
                <div className="account-address-list">
                  {addresses.map(({ node }: any, index: number) => {
                    if (!node) return null;

                    const isDefault = savedDefaultAddressId
                      ? savedDefaultAddressId === node.id
                      : customerData?.defaultAddress?.id === node.id;

                    return (
                      <div
                        key={node.id || index}
                        className="account-address-card"
                      >
                        <div className="address-mark">
                          {String(index + 1).padStart(2, "0")}
                        </div>

                        <div className="address-content">
                          <div className="address-label-row">
                            <span>
                              {isDefault ? "PRIMARY ADDRESS" : "SAVED ADDRESS"}
                            </span>

                            {isDefault && (
                              <b className="address-default-badge">DEFAULT</b>
                            )}
                          </div>

                          <h3>
                            {node.firstName || firstName}{" "}
                            {node.lastName || lastName}
                          </h3>

                          <p>
                            {[
                              node.address1,
                              node.address2,
                              node.city,
                              node.province,
                              node.zip,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </p>

                          {node.phone && <small>{node.phone}</small>}
                        </div>

                        <div className="address-actions">
                          <button
                            type="button"
                            className="address-action"
                            onClick={() => openEditAddress(node)}
                          >
                            Edit <span>↗</span>
                          </button>

                          <button
                            type="button"
                            className="address-delete"
                            disabled={addressDeletingId === node.id}
                            onClick={() => handleDeleteAddress(node.id)}
                          >
                            {addressDeletingId === node.id
                              ? "Deleting..."
                              : "Delete"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="account-address-card address-empty">
                  <div className="address-mark">01</div>

                  <div className="address-content">
                    <span>PRIMARY ADDRESS</span>

                    <h3>No saved address</h3>

                    <p>Add an address for a faster checkout experience.</p>
                  </div>

                  <button
                    type="button"
                    className="address-action"
                    onClick={openAddAddress}
                  >
                    Add <span>+</span>
                  </button>
                </div>
              )}

              {addressModalOpen && (
                <div
                  className="address-modal-backdrop"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="address-modal-title"
                  onMouseDown={(event) => {
                    if (event.target === event.currentTarget) {
                      setAddressModalOpen(false);
                    }
                  }}
                >
                  <div className="address-modal">
                    <div className="address-modal-head">
                      <div>
                        <span className="section-eyebrow">
                          DELIVERY INFORMATION
                        </span>

                        <h3 id="address-modal-title">
                          {addressEditingId
                            ? "Edit Address"
                            : "Add New Address"}
                        </h3>
                      </div>

                      <button
                        type="button"
                        className="address-modal-close"
                        onClick={() => setAddressModalOpen(false)}
                        disabled={addressSaving}
                      >
                        ×
                      </button>
                    </div>

                    <form
                      className="address-form"
                      onSubmit={handleAddressSubmit}
                    >
                      <div className="address-form-grid two">
                        <label>
                          <span>FIRST NAME</span>
                          <input
                            value={addressForm.firstName}
                            onChange={(event) =>
                              handleAddressChange(
                                "firstName",
                                event.target.value,
                              )
                            }
                            autoComplete="given-name"
                          />
                        </label>

                        <label>
                          <span>LAST NAME</span>
                          <input
                            value={addressForm.lastName}
                            onChange={(event) =>
                              handleAddressChange(
                                "lastName",
                                event.target.value,
                              )
                            }
                            autoComplete="family-name"
                          />
                        </label>
                      </div>

                      <div className="address-form-grid">
                        <label>
                          <span>ADDRESS LINE 1</span>
                          <input
                            value={addressForm.address1}
                            onChange={(event) =>
                              handleAddressChange(
                                "address1",
                                event.target.value,
                              )
                            }
                            autoComplete="address-line1"
                          />
                        </label>

                        <label>
                          <span>ADDRESS LINE 2</span>
                          <input
                            value={addressForm.address2}
                            onChange={(event) =>
                              handleAddressChange(
                                "address2",
                                event.target.value,
                              )
                            }
                            autoComplete="address-line2"
                          />
                        </label>
                      </div>

                      <div className="address-form-grid three">
                        <label>
                          <span>CITY</span>
                          <input
                            value={addressForm.city}
                            onChange={(event) =>
                              handleAddressChange("city", event.target.value)
                            }
                            autoComplete="address-level2"
                          />
                        </label>

                        <label>
                          <span>STATE</span>
                          <input
                            value={addressForm.province}
                            onChange={(event) =>
                              handleAddressChange(
                                "province",
                                event.target.value,
                              )
                            }
                            autoComplete="address-level1"
                          />
                        </label>

                        <label>
                          <span>PIN CODE</span>
                          <input
                            value={addressForm.zip}
                            onChange={(event) =>
                              handleAddressChange("zip", event.target.value)
                            }
                            inputMode="numeric"
                            autoComplete="postal-code"
                          />
                        </label>
                      </div>

                      <div className="address-form-grid two">
                        <label>
                          <span>PHONE</span>
                          <input
                            value={addressForm.phone}
                            onChange={(event) =>
                              handleAddressChange("phone", event.target.value)
                            }
                            inputMode="tel"
                            autoComplete="tel"
                          />
                        </label>

                        <label>
                          <span>COUNTRY</span>
                          <select
                            value={addressForm.countryCode}
                            onChange={(event) =>
                              handleAddressChange(
                                "countryCode",
                                event.target.value,
                              )
                            }
                          >
                            <option value="IN">India</option>
                          </select>
                        </label>
                      </div>

                      <label className="address-default-check">
                        <input
                          type="checkbox"
                          checked={addressForm.setAsDefault}
                          onChange={(event) =>
                            handleAddressChange(
                              "setAsDefault",
                              event.target.checked,
                            )
                          }
                        />

                        <span>Set as default address</span>
                      </label>

                      {addressError && (
                        <p className="profile-message error">{addressError}</p>
                      )}

                      <div className="address-form-actions">
                        <button
                          type="button"
                          className="profile-cancel"
                          onClick={() => setAddressModalOpen(false)}
                          disabled={addressSaving}
                        >
                          Cancel
                        </button>

                        <button
                          type="submit"
                          className="profile-save"
                          disabled={addressSaving}
                        >
                          {addressSaving
                            ? "Saving..."
                            : addressEditingId
                              ? "Update Address"
                              : "Save Address"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}
            </section>

            {/* =================================================
                WISHLIST
            ================================================= */}

            <section id="wishlist" className="account-section">
              <div className="account-section-head">
                <div>
                  <span className="section-eyebrow">SAVED PIECES</span>

                  <h2>Wishlist</h2>
                </div>

                <Link href="/wishlist" className="section-link">
                  View wishlist <span>↗</span>
                </Link>
              </div>

              <div className="account-wishlist-card">
                <div>
                  <span>{wishlistCount}</span>

                  <p>{wishlistCount === 1 ? "piece saved" : "pieces saved"}</p>
                </div>

                <Link href="/wishlist" className="account-primary-btn">
                  View Wishlist
                </Link>
              </div>
            </section>

            {/* =================================================
                BRAND NOTE
            ================================================= */}

            <div className="account-brand-note">
              <span />

              <p>OPULENCE · THE ART OF AFFLUENCE</p>

              <span />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
