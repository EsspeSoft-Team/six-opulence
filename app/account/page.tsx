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

  if (loading) return <p>Loading...</p>;
  if (!customer) return null;

  const recentOrders = customer.orders.edges.slice(0, 3);

  return (
    <div className="container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <h1 className="section-title" style={{ marginBottom: 0 }}>
          Hi, {customer.firstName || customer.email}
        </h1>
        <button
          onClick={async () => {
            await logout();
            router.push("/");
          }}
          style={{ background: "none", border: "none", textDecoration: "underline", fontSize: 14 }}
        >
          Logout
        </button>
      </div>

      <div className="account-tiles">
        <Link href="/account/orders" className="account-tile">
          <h3 style={{ margin: "0 0 4px" }}>Order History</h3>
          <p style={{ fontSize: 14, color: "#666", margin: 0 }}>{customer.orders.edges.length} order(s)</p>
        </Link>
        <Link href="/account/addresses" className="account-tile">
          <h3 style={{ margin: "0 0 4px" }}>Addresses</h3>
          <p style={{ fontSize: 14, color: "#666", margin: 0 }}>{customer.addresses.edges.length} saved address(es)</p>
        </Link>
        <Link href="/wishlist" className="account-tile">
          <h3 style={{ margin: "0 0 4px" }}>Wishlist</h3>
          <p style={{ fontSize: 14, color: "#666", margin: 0 }}>View saved items</p>
        </Link>
      </div>

      <h2 className="section-title" style={{ fontSize: 18 }}>
        Recent Orders
      </h2>
      {recentOrders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        recentOrders.map(({ node }: any) => (
          <div key={node.id} className="order-row">
            <div className="order-row-top">
              <span style={{ fontWeight: 500 }}>Order #{node.orderNumber}</span>
              <span style={{ fontWeight: 500 }}>
                {node.currentTotalPrice.currencyCode} {node.currentTotalPrice.amount}
              </span>
            </div>
            <p style={{ fontSize: 14, color: "#666", margin: 0 }}>
              {new Date(node.processedAt).toLocaleDateString()} • {node.fulfillmentStatus}
            </p>
          </div>
        ))
      )}
    </div>
  );
}
