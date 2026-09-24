"use client";

import "./account.css";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function AccountPage() {
  const { customer, loading, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !customer) {
      router.push("/login");
    }
  }, [loading, customer, router]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!customer) {
    return null;
  }

  /*
   * Shopify customer data
   *
   * The Customer type currently does not contain
   * all fields returned by the Shopify API.
   * Using a local flexible object here prevents
   * TypeScript errors while keeping the existing UI.
   */
  const customerData = customer as any;

  const orders = customerData?.orders?.edges ?? [];
  const addresses = customerData?.addresses?.edges ?? [];

  const recentOrders = orders.slice(0, 3);

  const firstName = customerData?.firstName ?? "";
  const email = customerData?.email ?? "";

  const displayName = firstName || email || "Account";

  return (
    <div className="container">
      {/* ================================
          ACCOUNT HEADER
      ================================= */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 32,
        }}
      >
        <h1
          className="section-title"
          style={{
            marginBottom: 0,
          }}
        >
          Hi, {displayName}
        </h1>

        <button
          type="button"
          onClick={async () => {
            try {
              await logout();
            } finally {
              router.push("/");
            }
          }}
          style={{
            background: "none",
            border: "none",
            textDecoration: "underline",
            fontSize: 14,
            cursor: "pointer",
          }}
        >
          Logout
        </button>
      </div>

      {/* ================================
          ACCOUNT TILES
      ================================= */}

      <div className="account-tiles">
        {/* ORDER HISTORY */}

        <Link href="/account/orders" className="account-tile">
          <h3
            style={{
              margin: "0 0 4px",
            }}
          >
            Order History
          </h3>

          <p
            style={{
              fontSize: 14,
              color: "#666",
              margin: 0,
            }}
          >
            {orders.length} order(s)
          </p>
        </Link>

        {/* ADDRESSES */}

        <Link href="/account/addresses" className="account-tile">
          <h3
            style={{
              margin: "0 0 4px",
            }}
          >
            Addresses
          </h3>

          <p
            style={{
              fontSize: 14,
              color: "#666",
              margin: 0,
            }}
          >
            {addresses.length} saved address(es)
          </p>
        </Link>

        {/* WISHLIST */}

        <Link href="/wishlist" className="account-tile">
          <h3
            style={{
              margin: "0 0 4px",
            }}
          >
            Wishlist
          </h3>

          <p
            style={{
              fontSize: 14,
              color: "#666",
              margin: 0,
            }}
          >
            View saved items
          </p>
        </Link>
      </div>

      {/* ================================
          RECENT ORDERS
      ================================= */}

      <h2
        className="section-title"
        style={{
          fontSize: 18,
        }}
      >
        Recent Orders
      </h2>

      {recentOrders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        recentOrders.map(({ node }: any) => {
          if (!node) {
            return null;
          }

          const totalPrice = node?.currentTotalPrice?.amount ?? "";

          const currency = node?.currentTotalPrice?.currencyCode ?? "";

          const orderNumber = node?.orderNumber ?? node?.name ?? "";

          const fulfillmentStatus = node?.fulfillmentStatus ?? "Pending";

          const processedDate = node?.processedAt
            ? new Date(node.processedAt).toLocaleDateString()
            : "";

          return (
            <div key={node.id} className="order-row">
              <div className="order-row-top">
                <span
                  style={{
                    fontWeight: 500,
                  }}
                >
                  Order #{orderNumber}
                </span>

                <span
                  style={{
                    fontWeight: 500,
                  }}
                >
                  {currency} {totalPrice}
                </span>
              </div>

              <p
                style={{
                  fontSize: 14,
                  color: "#666",
                  margin: 0,
                }}
              >
                {processedDate}

                {processedDate && " • "}

                {fulfillmentStatus}
              </p>
            </div>
          );
        })
      )}
    </div>
  );
}
