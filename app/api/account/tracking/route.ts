import { NextRequest, NextResponse } from "next/server";
import { shopifyAdminFetch } from "@/lib/shopify-admin";

export const runtime = "nodejs";

async function getLoggedInCustomer(request: NextRequest) {
  const response = await fetch(new URL("/api/auth/me", request.url), {
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
    cache: "no-store",
  });

  if (!response.ok) return null;

  const data = await response.json();

  return data.customer || null;
}

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

    const orderId = new URL(request.url).searchParams.get("id");

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

    const data = await shopifyAdminFetch<{
      order: {
        id: string;
        email: string | null;
        name: string;
        displayFulfillmentStatus: string | null;
        fulfillments: {
          id: string;
          status: string | null;
          createdAt: string;
          trackingInfo: {
            company: string | null;
            number: string | null;
            url: string | null;
          }[];
        }[];
      } | null;
    }>({
      query: `
        query GetTracking(
          $id: ID!
        ) {
          order(id: $id) {
            id
            name
            email
            displayFulfillmentStatus

            fulfillments {
              id
              status
              createdAt

              trackingInfo {
                company
                number
                url
              }
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

    if (order.email?.toLowerCase() !== customerEmail.toLowerCase()) {
      return NextResponse.json(
        {
          success: false,
          error: "You cannot access this order.",
        },
        { status: 403 },
      );
    }

    const tracking = order.fulfillments.flatMap((fulfillment) =>
      fulfillment.trackingInfo.map((item) => ({
        fulfillmentId: fulfillment.id,

        status: fulfillment.status,

        createdAt: fulfillment.createdAt,

        company: item.company,

        number: item.number,

        url: item.url,
      })),
    );

    return NextResponse.json({
      success: true,
      order: {
        id: order.id,
        name: order.name,
        fulfillmentStatus: order.displayFulfillmentStatus,
      },
      tracking,
    });
  } catch (error) {
    console.error("ORDER TRACKING ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unable to load tracking.",
      },
      { status: 500 },
    );
  }
}
