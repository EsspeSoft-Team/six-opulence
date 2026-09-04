/**
 * Shopify ADMIN API client — SERVER-SIDE ONLY
 * --------------------------------------------
 * Eta kokhono client component-e import kora jabe na, karon
 * SHOPIFY_ADMIN_API_TOKEN ekta secret token — full store access dey.
 * Shudhu Server Components ba API routes theke call korte hobe.
 *
 * Important note (client-r jonno):
 * Shopify Admin er nijeই full product/order/inventory management
 * dashboard ache (Shopify Admin login diye). Eta duplicate kore
 * custom-e rebuild kora shomoy-r অপচয় ar extra security risk.
 * Ei file ta shudhu ekta READ-ONLY quick-glance dashboard-r jonno,
 * full management Shopify Admin theke i korben.
 */

const domain = process.env.SHOPIFY_STORE_DOMAIN; // e.g. your-store.myshopify.com
const adminToken = process.env.SHOPIFY_ADMIN_API_TOKEN;
const apiVersion = process.env.SHOPIFY_STOREFRONT_API_VERSION || "2024-07";

const endpoint = `https://${domain}/admin/api/${apiVersion}/graphql.json`;

export async function shopifyAdminFetch<T>({
  query,
  variables,
}: {
  query: string;
  variables?: Record<string, unknown>;
}): Promise<T> {
  if (!domain || !adminToken) {
    throw new Error(
      "Admin API env variables missing (SHOPIFY_STORE_DOMAIN, SHOPIFY_ADMIN_API_TOKEN)."
    );
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": adminToken,
    },
    body: JSON.stringify({ query, variables }),
    cache: "no-store",
  });

  const json = await response.json();

  if (json.errors) {
    console.error("Shopify Admin API Error:", JSON.stringify(json.errors));
    throw new Error("Shopify Admin API request failed.");
  }

  return json.data as T;
}

export async function getAdminOverview() {
  if (!domain || !adminToken) {
    // Demo mode — real Admin API credentials na thakle mock overview dekhabe
    return {
      products: {
        edges: [
          { node: { id: "1", title: "Shadow Graphic Tee (demo)", totalInventory: 24, status: "ACTIVE" } },
          { node: { id: "2", title: "Onyx Oversized Tee (demo)", totalInventory: 12, status: "ACTIVE" } },
        ],
      },
      orders: {
        edges: [
          {
            node: {
              id: "1",
              name: "#1001 (demo)",
              displayFinancialStatus: "PAID",
              displayFulfillmentStatus: "FULFILLED",
              totalPriceSet: { shopMoney: { amount: "4200", currencyCode: "INR" } },
              createdAt: new Date().toISOString(),
            },
          },
        ],
      },
    };
  }

  const query = `
    query adminOverview {
      products(first: 10, sortKey: UPDATED_AT, reverse: true) {
        edges {
          node {
            id
            title
            totalInventory
            status
          }
        }
      }
      orders(first: 10, sortKey: PROCESSED_AT, reverse: true) {
        edges {
          node {
            id
            name
            displayFinancialStatus
            displayFulfillmentStatus
            totalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }
            createdAt
          }
        }
      }
    }
  `;

  return shopifyAdminFetch<{
    products: { edges: { node: any }[] };
    orders: { edges: { node: any }[] };
  }>({ query });
}
