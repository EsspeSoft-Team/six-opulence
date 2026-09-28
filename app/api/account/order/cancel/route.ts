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

export async function POST(request: NextRequest) {
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

    const body = await request.json();

    const orderId = String(body.orderId || "").trim();

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

    /*
     * First verify the order belongs to
     * the logged-in customer.
     */

    const orderData = await shopifyAdminFetch<{
      order: {
        id: string;
        email: string | null;
        cancelledAt: string | null;
        displayFulfillmentStatus: string | null;
      } | null;
    }>({
      query: `
          query VerifyOrder(
            $id: ID!
          ) {
            order(id: $id) {
              id
              email
              cancelledAt
              displayFulfillmentStatus
            }
          }
        `,
      variables: {
        id: orderId,
      },
    });

    const order = orderData.order;

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
          error: "You cannot cancel this order.",
        },
        { status: 403 },
      );
    }

    if (order.cancelledAt) {
      return NextResponse.json(
        {
          success: false,
          error: "This order is already cancelled.",
        },
        { status: 400 },
      );
    }

    const data = await shopifyAdminFetch<{
      orderCancel: {
        job: {
          id: string;
          done: boolean;
        } | null;

        orderCancelUserErrors: {
          field?: string[];
          message: string;
          code?: string;
        }[];

        userErrors: {
          field?: string[];
          message: string;
        }[];
      };
    }>({
      query: `
          mutation CancelOrder(
            $orderId: ID!
            $notifyCustomer: Boolean
            $refundMethod: OrderCancelRefundMethodInput!
            $restock: Boolean!
            $reason: OrderCancelReason!
            $staffNote: String
          ) {
            orderCancel(
              orderId: $orderId
              notifyCustomer: $notifyCustomer
              refundMethod: $refundMethod
              restock: $restock
              reason: $reason
              staffNote: $staffNote
            ) {
              job {
                id
                done
              }

              orderCancelUserErrors {
                field
                message
                code
              }

              userErrors {
                field
                message
              }
            }
          }
        `,
      variables: {
        orderId,
        notifyCustomer: true,

        refundMethod: {
          originalPaymentMethodsRefund: true,
        },

        restock: true,

        reason: "CUSTOMER",

        staffNote: "Customer requested cancellation from OPULENCE account.",
      },
    });

    const result = data.orderCancel;

    const errors = [
      ...(result.orderCancelUserErrors || []),
      ...(result.userErrors || []),
    ];

    if (errors.length) {
      return NextResponse.json(
        {
          success: false,
          error: errors.map((item) => item.message).join(", "),
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      job: result.job,
      message: "Cancellation request submitted successfully.",
    });
  } catch (error) {
    console.error("ORDER CANCEL ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unable to cancel order.",
      },
      { status: 500 },
    );
  }
}
