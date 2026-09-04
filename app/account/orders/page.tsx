"use client";
import "../account.css";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function OrdersPage() {
  const { customer, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !customer) {
      router.push("/login");
    }
  }, [loading, customer, router]);

  if (loading) return <p>Loading...</p>;
  if (!customer) return null;

  const orders = customer.orders.edges;

  return (
    <div className="container">
      <h1 className="section-title">Order History</h1>
      {orders.length === 0 ? (
        <p>You haven't placed any orders yet.</p>
      ) : (
        orders.map(({ node }: any) => (
          <div key={node.id} className="order-row">
            <div className="order-row-top">
              <span style={{ fontWeight: 500 }}>Order #{node.orderNumber}</span>
              <span style={{ fontWeight: 500 }}>
                {node.currentTotalPrice.currencyCode} {node.currentTotalPrice.amount}
              </span>
            </div>
            <p style={{ fontSize: 14, color: "#666", marginBottom: 12 }}>
              Placed on {new Date(node.processedAt).toLocaleDateString()} • Payment: {node.financialStatus} •
              Fulfillment: {node.fulfillmentStatus}
            </p>
            <ul style={{ fontSize: 14, color: "#333", paddingLeft: 20, margin: 0 }}>
              {node.lineItems.edges.map(({ node: item }: any, i: number) => (
                <li key={i}>
                  {item.title} × {item.quantity}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
}
