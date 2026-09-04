"use client";
import "../account.css";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function AddressesPage() {
  const { customer, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !customer) {
      router.push("/login");
    }
  }, [loading, customer, router]);

  if (loading) return <p>Loading...</p>;
  if (!customer) return null;

  const addresses = customer.addresses.edges;

  return (
    <div className="container">
      <h1 className="section-title">Saved Addresses</h1>
      {addresses.length === 0 ? (
        <p>No saved addresses yet. Addresses are added automatically at checkout.</p>
      ) : (
        <div className="grid grid-2">
          {addresses.map(({ node }: any) => (
            <div key={node.id} className="account-tile">
              <p style={{ margin: 0 }}>{node.address1}</p>
              {node.address2 && <p style={{ margin: 0 }}>{node.address2}</p>}
              <p style={{ margin: 0 }}>
                {node.city}, {node.province} {node.zip}
              </p>
              <p style={{ margin: 0 }}>{node.country}</p>
              {node.phone && <p style={{ fontSize: 14, color: "#666", marginTop: 4 }}>{node.phone}</p>}
            </div>
          ))}
        </div>
      )}
      <p className="note">
        Note: Nutun address checkout-r shomoy add hoy, edit korte hole Shopify checkout flow-e giye korte hobe.
      </p>
    </div>
  );
}
