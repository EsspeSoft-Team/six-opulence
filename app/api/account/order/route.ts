import { NextRequest, NextResponse } from "next/server";
import { shopifyAdminFetch } from "@/lib/shopify-admin";

export const runtime = "nodejs";

/* =========================================================
   GET CUSTOMER FROM AUTH
========================================================= */

async function getLoggedInCustomer(request: NextRequest) {
  const response = await fetch(new URL("/api/auth/me", request.url), {
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();

  return data.customer || null;
}

/* =========================================================
   GET ORDER
========================================================= */

export async function GET(request: NextRequest) {
  try {
    const customer = await getLoggedInCustomer(request);

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          error: "You must be logged in.",
        },
        { status: 401 },
      );
    }

    const { searchParams } = new URL(request.url);

    const orderId = searchParams.get("id");

    if (!orderId) {
      return NextResponse.json(
        {
          success: false,
          error: "Order ID is required.",
        },
        { status: 400 },
      );
    }

    const customerEmail =
      customer.email || customer.emailAddress?.emailAddress || "";

    if (!customerEmail) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer email not found.",
        },
        { status: 400 },
      );
    }

    const data = await shopifyAdminFetch<{
      order: any;
    }>({
      query: `
        query GetOrder(
          $id: ID!
        ) {
          order(id: $id) {
            id
            name
            orderNumber
            createdAt
            processedAt

            email

            displayFinancialStatus
            displayFulfillmentStatus

            cancelledAt
            cancelReason

            currentTotalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }

            subtotalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }

            totalShippingPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }

            totalTaxSet {
              shopMoney {
                amount
                currencyCode
              }
            }

            shippingAddress {
              firstName
              lastName
              company
              address1
              address2
              city
              province
              country
              zip
              phone
            }

            lineItems(first: 50) {
              edges {
                node {
                  id
                  title
                  quantity

                  variant {
                    id
                    title

                    image {
                      url
                      altText
                    }
                  }

                  originalUnitPriceSet {
                    shopMoney {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }

            fulfillments {
              id
              status

              trackingInfo {
                company
                number
                url
              }

              createdAt
            }
          }
        }
      `,
      variables: {
        id: orderId,
      },
    });

    const order = data.order;

    if (!order) {
      return NextResponse.json(
        {
          success: false,
          error: "Order not found.",
        },
        { status: 404 },
      );
    }

    /*
     * IMPORTANT:
     * Never trust only the browser-supplied order ID.
     * Verify ownership using customer email.
     */

    if (order.email?.toLowerCase() !== customerEmail.toLowerCase()) {
      return NextResponse.json(
        {
          success: false,
          error: "You cannot access this order.",
        },
        { status: 403 },
      );
    }

    return NextResponse.json({
      success: true,
      order,
    });
  } catch (error) {
    console.error("ORDER DETAILS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unable to load order.",
      },
      { status: 500 },
    );
  }
}
