import { NextRequest, NextResponse } from "next/server";
import { shopifyAdminFetch } from "@/lib/shopify-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type MeResponse = {
  customer?: {
    id?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    emailAddress?: {
      emailAddress?: string | null;
    } | null;
  } | null;
};

type CustomerUpdateResponse = {
  customerUpdate: {
    customer: {
      id: string;
      firstName: string | null;
      lastName: string | null;
    } | null;
    userErrors: {
      field?: string[];
      message: string;
    }[];
  };
};

type CustomerSearchResponse = {
  customers: {
    edges: {
      node: {
        id: string;
        email: string | null;
      };
    }[];
  };
};

function jsonError(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    { status },
  );
}

function cleanName(value: unknown) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();

    const firstName = cleanName(body?.firstName);
    const lastName = cleanName(body?.lastName);

    if (!firstName) {
      return jsonError("Please enter your first name.");
    }

    if (firstName.length > 60) {
      return jsonError("First name is too long.");
    }

    if (lastName.length > 60) {
      return jsonError("Last name is too long.");
    }

    /*
     * IMPORTANT:
     * Do not trust a customer ID sent from the browser.
     * We first ask the existing authenticated /api/auth/me route
     * who is currently logged in, forwarding the current cookies.
     */
    const meResponse = await fetch(new URL("/api/auth/me", request.url), {
      method: "GET",
      headers: {
        cookie: request.headers.get("cookie") || "",
      },
      cache: "no-store",
    });

    if (!meResponse.ok) {
      return jsonError("Your session has expired. Please log in again.", 401);
    }

    const me = (await meResponse.json()) as MeResponse;
    const currentCustomer = me?.customer;

    if (!currentCustomer) {
      return jsonError("You must be logged in to edit your profile.", 401);
    }

    let customerId = currentCustomer.id || null;

    /*
     * Customer Account API normally gives us the Shopify customer ID.
     * If the current auth response does not include it, safely resolve
     * the ID from the authenticated customer's email through Admin API.
     */
    if (!customerId || !customerId.startsWith("gid://shopify/Customer/")) {
      const email =
        currentCustomer.email ||
        currentCustomer.emailAddress?.emailAddress ||
        "";

      if (!email) {
        return jsonError(
          "Unable to identify your Shopify customer account.",
          400,
        );
      }

      const searchData = await shopifyAdminFetch<CustomerSearchResponse>({
        query: `
            query FindCustomer($query: String!) {
              customers(first: 1, query: $query) {
                edges {
                  node {
                    id
                    email
                  }
                }
              }
            }
          `,
        variables: {
          query: `email:${JSON.stringify(email)}`,
        },
      });

      customerId = searchData.customers.edges[0]?.node?.id || null;
    }

    if (!customerId || !customerId.startsWith("gid://shopify/Customer/")) {
      return jsonError("Unable to find your Shopify customer record.", 404);
    }

    const updateData = await shopifyAdminFetch<CustomerUpdateResponse>({
      query: `
          mutation UpdateCustomerName($input: CustomerInput!) {
            customerUpdate(input: $input) {
              customer {
                id
                firstName
                lastName
              }
              userErrors {
                field
                message
              }
            }
          }
        `,
      variables: {
        input: {
          id: customerId,
          firstName,
          lastName,
        },
      },
    });

    const result = updateData.customerUpdate;

    if (result.userErrors?.length) {
      return jsonError(
        result.userErrors.map((error) => error.message).join(", "),
        400,
      );
    }

    if (!result.customer) {
      return jsonError("Shopify did not return the updated customer.", 500);
    }

    return NextResponse.json({
      success: true,
      customer: result.customer,
      message: "Profile updated successfully.",
    });
  } catch (error) {
    console.error("PROFILE_UPDATE_ERROR:", error);

    return jsonError(
      error instanceof Error ? error.message : "Unable to update your profile.",
      500,
    );
  }
}
