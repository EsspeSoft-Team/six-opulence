import "./admin.css";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminOverview } from "@/lib/shopify-admin";

export default async function AdminPage() {
  const cookieStore = cookies();
  const session = cookieStore.get("admin_session")?.value;

  if (!session || session !== process.env.ADMIN_DASHBOARD_PASSWORD) {
    redirect("/admin/login");
  }

  const { products, orders } = await getAdminOverview();

  return (
    <div className="container">
      <h1 className="section-title">Admin Overview</h1>
      <p className="note" style={{ marginBottom: 32 }}>
        Read-only quick glance. Product/order/inventory management ekhono
        Shopify Admin theke i korte hobe —{" "}
        <a
          href={`https://${process.env.SHOPIFY_STORE_DOMAIN}/admin`}
          target="_blank"
          style={{ textDecoration: "underline" }}
        >
          Shopify Admin
        </a>
        .
      </p>

      <div className="admin-grid">
        <section>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>Recent Products</h2>
          {products.edges.map(({ node }: any) => (
            <div key={node.id} className="admin-row">
              <span>{node.title}</span>
              <span style={{ color: "#666" }}>
                Stock: {node.totalInventory} • {node.status}
              </span>
            </div>
          ))}
        </section>

        <section>
          <h2 style={{ fontSize: 18, marginBottom: 16 }}>Recent Orders</h2>
          {orders.edges.map(({ node }: any) => (
            <div
              key={node.id}
              className="admin-row"
              style={{ flexDirection: "column", alignItems: "flex-start" }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  width: "100%",
                }}
              >
                <strong>{node.name}</strong>
                <span>
                  {node.totalPriceSet.shopMoney.currencyCode}{" "}
                  {node.totalPriceSet.shopMoney.amount}
                </span>
              </div>
              <p style={{ color: "#666", fontSize: 13, margin: "4px 0 0" }}>
                {node.displayFinancialStatus} • {node.displayFulfillmentStatus}{" "}
                • {new Date(node.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
