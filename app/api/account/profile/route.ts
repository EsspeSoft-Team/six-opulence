import { NextRequest, NextResponse } from "next/server";

import { shopifyAccountAdminFetch } from "@/lib/shopify-account-admin";

export const runtime = "nodejs";

type AuthCustomer = {
  id?: string;
  email?: string;
  emailAddress?: {
    emailAddress?: string;
  };
};

type AuthResponse = {
  authenticated?: boolean;
  customer?: AuthCustomer | null;
  user?: AuthCustomer | null;
};

type CustomerUpdateResponse = {
  customerUpdate: {
    customer: {
      id: string;
      firstName: string | null;
      lastName: string | null;
      email: string | null;
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

/* ============================================================
   GET LOGGED-IN CUSTOMER
   ============================================================ */

async function getLoggedInCustomer(
  request: NextRequest,
): Promise<AuthCustomer | null> {
  try {
    const cookie = request.headers.get("cookie") || "";

    if (!cookie) {
      return null;
    }

    const authUrl = new URL("/api/auth/me", request.url);

    const response = await fetch(authUrl.toString(), {
      method: "GET",
      headers: {
        cookie,
      },
      cache: "no-store",
    });

    const rawText = await response.text();

    if (!response.ok) {
      console.error(
        "PROFILE API: /api/auth/me failed:",
        response.status,
        rawText,
      );

      return null;
    }

    let data: AuthResponse | null = null;

    try {
      data = JSON.parse(rawText) as AuthResponse;
    } catch {
      console.error(
        "PROFILE API: /api/auth/me returned invalid JSON:",
        rawText,
      );

      return null;
    }

    if (data?.authenticated && data.customer) {
      return data.customer;
    }

    if (data?.customer) {
      return data.customer;
    }

    if (data?.user) {
      return data.user;
    }

    return null;
  } catch (error) {
    console.error("PROFILE AUTH ERROR:", error);
    return null;
  }
}

/* ============================================================
   PATCH PROFILE
   ============================================================ */

export async function PATCH(request: NextRequest) {
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

    const firstName = String(body?.firstName || "").trim();
    const lastName = String(body?.lastName || "").trim();

    if (!firstName) {
      return NextResponse.json(
        {
          success: false,
          error: "First name is required.",
        },
        { status: 400 },
      );
    }

    if (firstName.length > 50 || lastName.length > 50) {
      return NextResponse.json(
        {
          success: false,
          error: "Name is too long.",
        },
        { status: 400 },
      );
    }

    /* ========================================================
       GET CUSTOMER ID
       ======================================================== */

    let customerId = customer.id || "";

    /*
     * If /api/auth/me does not return the Shopify
     * customer ID, find the customer using email.
     */

    if (!customerId) {
      const email = customer.email || customer.emailAddress?.emailAddress || "";

      if (!email) {
        return NextResponse.json(
          {
            success: false,
            error: "Customer email was not found.",
          },
          { status: 400 },
        );
      }

      const searchData = await shopifyAccountAdminFetch<CustomerSearchResponse>(
        {
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
            query: `email:${email}`,
          },
        },
      );

      customerId = searchData.customers.edges[0]?.node?.id || "";
    }

    if (!customerId) {
      return NextResponse.json(
        {
          success: false,
          error: "Shopify customer was not found.",
        },
        { status: 404 },
      );
    }

    /* ========================================================
       UPDATE CUSTOMER
       ======================================================== */

    const data = await shopifyAccountAdminFetch<CustomerUpdateResponse>({
      query: `
          mutation CustomerUpdate(
            $input: CustomerInput!
          ) {
            customerUpdate(input: $input) {
              customer {
                id
                firstName
                lastName
                email
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

    const result = data?.customerUpdate;

    if (!result) {
      return NextResponse.json(
        {
          success: false,
          error: "Shopify did not return a customer update response.",
        },
        { status: 500 },
      );
    }

    if (result.userErrors?.length) {
      return NextResponse.json(
        {
          success: false,
          error: result.userErrors.map((item) => item.message).join(", "),
          errors: result.userErrors,
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
      message: "Profile updated successfully.",
      customer: result.customer,
    });
  } catch (error) {
    console.error("PROFILE UPDATE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unable to update profile.",
      },
      { status: 500 },
    );
  }
}
