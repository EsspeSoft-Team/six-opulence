import { NextRequest, NextResponse } from "next/server";
import { shopifyAdminFetch } from "@/lib/shopify-admin";

export const runtime = "nodejs";

type AuthCustomer = {
  id?: string;
  email?: string;
  emailAddress?: {
    emailAddress?: string;
  };
};

type AuthResponse = {
  customer?: AuthCustomer | null;
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

/* =========================================================
   GET LOGGED-IN CUSTOMER
========================================================= */

async function getLoggedInCustomer(request: NextRequest) {
  const response = await fetch(new URL("/api/auth/me", request.url), {
    method: "GET",
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as AuthResponse;

  return data.customer || null;
}

/* =========================================================
   PATCH PROFILE
========================================================= */

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

    const firstName = String(body.firstName || "").trim();
    const lastName = String(body.lastName || "").trim();

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

    let customerId = customer.id;

    /*
     * If auth/me does not return Shopify customer ID,
     * find customer by email.
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

      const searchData = await shopifyAdminFetch<{
        customers: {
          edges: {
            node: {
              id: string;
              email: string | null;
            };
          }[];
        };
      }>({
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
      });

      customerId = searchData.customers.edges[0]?.node?.id;
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

    const data = await shopifyAdminFetch<CustomerUpdateResponse>({
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

    const result = data.customerUpdate;

    if (result.userErrors?.length) {
      return NextResponse.json(
        {
          success: false,
          error: result.userErrors.map((item) => item.message).join(", "),
        },
        { status: 400 },
      );
    }

    return NextResponse.json({
      success: true,
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
