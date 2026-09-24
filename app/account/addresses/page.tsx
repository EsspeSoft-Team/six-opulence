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

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!customer) {
    return null;
  }

  // Safely read addresses from the Shopify customer object
  const addresses = (customer as any)?.addresses?.edges ?? [];

  return (
    <div className="container">
      <h1 className="section-title">Saved Addresses</h1>

      {addresses.length === 0 ? (
        <p>
          No saved addresses yet. Addresses are added automatically at checkout.
        </p>
      ) : (
        <div className="grid grid-2">
          {addresses.map(({ node }: any) => (
            <div key={node.id} className="account-tile">
              {node.address1 && <p style={{ margin: 0 }}>{node.address1}</p>}

              {node.address2 && <p style={{ margin: 0 }}>{node.address2}</p>}

              {(node.city || node.province || node.zip) && (
                <p style={{ margin: 0 }}>
                  {node.city}
                  {node.city && node.province ? ", " : ""}
                  {node.province} {node.zip}
                </p>
              )}

              {node.country && <p style={{ margin: 0 }}>{node.country}</p>}

              {node.phone && (
                <p
                  style={{
                    fontSize: 14,
                    color: "#666",
                    marginTop: 4,
                  }}
                >
                  {node.phone}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      <p className="note">
        Note: New addresses are added during checkout. To edit an address,
        please use the Shopify checkout flow.
      </p>
    </div>
  );
}
