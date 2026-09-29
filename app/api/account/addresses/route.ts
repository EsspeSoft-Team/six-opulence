import { NextRequest, NextResponse } from "next/server";

import { shopifyAccountAdminFetch } from "@/lib/shopify-account-admin";

export const runtime = "nodejs";

/* ============================================================
   TYPES
============================================================ */

type AddressInput = {
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  zip?: string;
  countryCode?: string;
  phone?: string;
};

type ShopifyUserError = {
  field?: string[];
  message: string;
};

type CustomerAddress = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  province?: string | null;
  provinceCode?: string | null;
  zip?: string | null;
  country?: string | null;
  countryCode?: string | null;
  phone?: string | null;
};

type CustomerAddressesResponse = {
  customer: {
    id: string;

    defaultAddress?: {
      id: string;
    } | null;

    addressesV2: {
      edges: {
        node: CustomerAddress;
      }[];
    };
  } | null;
};

type CustomerAddressCreateResponse = {
  customerAddressCreate: {
    address: CustomerAddress | null;
    userErrors: ShopifyUserError[];
  };
};

type CustomerAddressUpdateResponse = {
  customerAddressUpdate: {
    address: CustomerAddress | null;
    userErrors: ShopifyUserError[];
  };
};

type CustomerAddressDeleteResponse = {
  customerAddressDelete: {
    deletedAddressId: string | null;
    userErrors: ShopifyUserError[];
  };
};

/* ============================================================
   ADMIN GRAPHQL HELPER

   IMPORTANT:
   Current shopifyAdminFetch accepts ONE object argument.
============================================================ */

async function adminGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  return shopifyAccountAdminFetch<T>({
    query,
    variables,
  });
}

/* ============================================================
   GET CURRENT LOGGED-IN CUSTOMER

   IMPORTANT:
   We forward the exact cookie from the current browser request.
   This keeps the same login session used by AuthContext.
============================================================ */

async function getCustomerFromAuth(request: NextRequest) {
  try {
    const cookie = request.headers.get("cookie") || "";

    if (!cookie) {
      console.error("ADDRESS API: No authentication cookie found.");
      return null;
    }

    /*
     * Build /api/auth/me from the current request URL.
     *
     * Example:
     * https://six-opulence.vercel.app/api/auth/me
     */
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
        "ADDRESS API: /api/auth/me failed:",
        response.status,
        rawText,
      );

      return null;
    }

    let data: any = null;

    try {
      data = JSON.parse(rawText);
    } catch {
      console.error(
        "ADDRESS API: /api/auth/me returned invalid JSON:",
        rawText,
      );

      return null;
    }

    /*
     * Your AuthContext expects:
     *
     * {
     *   authenticated: true,
     *   customer: {...}
     * }
     */

    if (data?.authenticated && data?.customer) {
      return data.customer;
    }

    /*
     * Fallback in case /api/auth/me returns customer
     * without the authenticated flag.
     */
    if (data?.customer) {
      return data.customer;
    }

    if (data?.user) {
      return data.user;
    }

    return null;
  } catch (error) {
    console.error("ADDRESS API AUTH ERROR:", error);

    return null;
  }
}

/* ============================================================
   RESOLVE CUSTOMER ID
============================================================ */

async function resolveCustomerId(request: NextRequest) {
  const customer = await getCustomerFromAuth(request);

  if (!customer) {
    return null;
  }

  const customerId =
    customer?.id || customer?.customerId || customer?.customer?.id || null;

  if (!customerId) {
    console.error(
      "ADDRESS API: Logged-in customer found but customer ID missing.",
      customer,
    );

    return null;
  }

  return customerId;
}

/* ============================================================
   NORMALIZE ADDRESS
============================================================ */

function normalizeAddress(body: any): AddressInput {
  return {
    firstName: String(body?.firstName || "").trim(),

    lastName: String(body?.lastName || "").trim(),

    address1: String(body?.address1 || "").trim(),

    address2: String(body?.address2 || "").trim(),

    city: String(body?.city || "").trim(),

    province: String(body?.province || "").trim(),

    zip: String(body?.zip || "").trim(),

    countryCode: String(body?.countryCode || "IN")
      .trim()
      .toUpperCase(),

    phone: String(body?.phone || "").trim(),
  };
}

/* ============================================================
   VALIDATE ADDRESS
============================================================ */

function validateAddress(address: AddressInput) {
  if (!address.firstName) {
    return "First name is required.";
  }

  if (!address.lastName) {
    return "Last name is required.";
  }

  if (!address.address1) {
    return "Address is required.";
  }

  if (!address.city) {
    return "City is required.";
  }

  if (!address.zip) {
    return "PIN / ZIP code is required.";
  }

  if (!address.countryCode) {
    return "Country is required.";
  }

  return null;
}

/* ============================================================
   ADDRESS FIELDS
============================================================ */

const ADDRESS_FIELDS = `
  id
  firstName
  lastName
  address1
  address2
  city
  province
  provinceCode
  zip
  country
  countryCode
  phone
`;

/* ============================================================
   GET ADDRESSES
============================================================ */

export async function GET(request: NextRequest) {
  try {
    /*
     * Get the same logged-in customer used by AuthContext.
     */
    const customerId = await resolveCustomerId(request);

    if (!customerId) {
      return NextResponse.json(
        {
          success: false,
          authenticated: false,
          error: "You are not logged in.",
        },
        {
          status: 401,
        },
      );
    }

    const query = `
      query GetCustomerAddresses($id: ID!) {
        customer(id: $id) {
          id

          defaultAddress {
            id
          }

          addressesV2(first: 50) {
            edges {
              node {
                ${ADDRESS_FIELDS}
              }
            }
          }
        }
      }
    `;

    const data = await adminGraphQL<CustomerAddressesResponse>(query, {
      id: customerId,
    });

    if (!data?.customer) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer not found.",
        },
        {
          status: 404,
        },
      );
    }

    const addresses =
      data.customer.addressesV2?.edges?.map((edge) => edge.node) || [];

    return NextResponse.json({
      success: true,

      authenticated: true,

      addresses,

      defaultAddressId: data.customer.defaultAddress?.id || null,
    });
  } catch (error) {
    console.error("GET ADDRESSES ERROR:", error);

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error ? error.message : "Unable to load addresses.",
      },
      {
        status: 500,
      },
    );
  }
}

/* ============================================================
   CREATE ADDRESS
============================================================ */

export async function POST(request: NextRequest) {
  try {
    /*
     * Make sure the customer is actually logged in.
     */
    const customerId = await resolveCustomerId(request);

    if (!customerId) {
      return NextResponse.json(
        {
          success: false,

          authenticated: false,

          error: "You are not logged in.",
        },
        {
          status: 401,
        },
      );
    }

    const body = await request.json();

    const address = normalizeAddress(body);

    const validationError = validateAddress(address);

    if (validationError) {
      return NextResponse.json(
        {
          success: false,
          error: validationError,
        },
        {
          status: 400,
        },
      );
    }

    const setAsDefault = Boolean(body?.setAsDefault);

    const mutation = `
      mutation CreateCustomerAddress(
        $address: MailingAddressInput!
        $customerId: ID!
        $setAsDefault: Boolean
      ) {
        customerAddressCreate(
          address: $address
          customerId: $customerId
          setAsDefault: $setAsDefault
        ) {
          address {
            ${ADDRESS_FIELDS}
          }

          userErrors {
            field
            message
          }
        }
      }
    `;

    const data = await adminGraphQL<CustomerAddressCreateResponse>(mutation, {
      address,

      customerId,

      setAsDefault,
    });

    const result = data?.customerAddressCreate;

    if (!result) {
      return NextResponse.json(
        {
          success: false,

          error: "Shopify did not return an address response.",
        },
        {
          status: 500,
        },
      );
    }

    if (result.userErrors?.length) {
      return NextResponse.json(
        {
          success: false,

          error: result.userErrors.map((item) => item.message).join(", "),

          errors: result.userErrors,
        },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json({
      success: true,

      message: "Address added successfully.",

      address: result.address,
    });
  } catch (error) {
    console.error("CREATE ADDRESS ERROR:", error);

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error ? error.message : "Unable to add address.",
      },
      {
        status: 500,
      },
    );
  }
}

/* ============================================================
   UPDATE ADDRESS
============================================================ */

export async function PATCH(request: NextRequest) {
  try {
    /*
     * Make sure the customer is logged in.
     */
    const customerId = await resolveCustomerId(request);

    if (!customerId) {
      return NextResponse.json(
        {
          success: false,

          authenticated: false,

          error: "You are not logged in.",
        },
        {
          status: 401,
        },
      );
    }

    const body = await request.json();

    const addressId = String(body?.addressId || "").trim();

    if (!addressId) {
      return NextResponse.json(
        {
          success: false,

          error: "Address ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const address = normalizeAddress(body);

    const validationError = validateAddress(address);

    if (validationError) {
      return NextResponse.json(
        {
          success: false,

          error: validationError,
        },
        {
          status: 400,
        },
      );
    }

    const setAsDefault = Boolean(body?.setAsDefault);

    const mutation = `
      mutation UpdateCustomerAddress(
        $address: MailingAddressInput!
        $addressId: ID!
        $customerId: ID!
        $setAsDefault: Boolean
      ) {
        customerAddressUpdate(
          address: $address
          addressId: $addressId
          customerId: $customerId
          setAsDefault: $setAsDefault
        ) {
          address {
            ${ADDRESS_FIELDS}
          }

          userErrors {
            field
            message
          }
        }
      }
    `;

    const data = await adminGraphQL<CustomerAddressUpdateResponse>(mutation, {
      address,

      addressId,

      customerId,

      setAsDefault,
    });

    const result = data?.customerAddressUpdate;

    if (!result) {
      return NextResponse.json(
        {
          success: false,

          error: "Shopify did not return an address response.",
        },
        {
          status: 500,
        },
      );
    }

    if (result.userErrors?.length) {
      return NextResponse.json(
        {
          success: false,

          error: result.userErrors.map((item) => item.message).join(", "),

          errors: result.userErrors,
        },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json({
      success: true,

      message: "Address updated successfully.",

      address: result.address,
    });
  } catch (error) {
    console.error("UPDATE ADDRESS ERROR:", error);

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error ? error.message : "Unable to update address.",
      },
      {
        status: 500,
      },
    );
  }
}

/* ============================================================
   DELETE ADDRESS
============================================================ */

export async function DELETE(request: NextRequest) {
  try {
    /*
     * Make sure the customer is logged in.
     */
    const customerId = await resolveCustomerId(request);

    if (!customerId) {
      return NextResponse.json(
        {
          success: false,

          authenticated: false,

          error: "You are not logged in.",
        },
        {
          status: 401,
        },
      );
    }

    const body = await request.json();

    const addressId = String(body?.addressId || "").trim();

    if (!addressId) {
      return NextResponse.json(
        {
          success: false,

          error: "Address ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const mutation = `
      mutation DeleteCustomerAddress(
        $addressId: ID!
        $customerId: ID!
      ) {
        customerAddressDelete(
          addressId: $addressId
          customerId: $customerId
        ) {
          deletedAddressId

          userErrors {
            field
            message
          }
        }
      }
    `;

    const data = await adminGraphQL<CustomerAddressDeleteResponse>(mutation, {
      addressId,

      customerId,
    });

    const result = data?.customerAddressDelete;

    if (!result) {
      return NextResponse.json(
        {
          success: false,

          error: "Shopify did not return a delete response.",
        },
        {
          status: 500,
        },
      );
    }

    if (result.userErrors?.length) {
      return NextResponse.json(
        {
          success: false,

          error: result.userErrors.map((item) => item.message).join(", "),

          errors: result.userErrors,
        },
        {
          status: 400,
        },
      );
    }

    return NextResponse.json({
      success: true,

      message: "Address deleted successfully.",

      deletedAddressId: result.deletedAddressId,
    });
  } catch (error) {
    console.error("DELETE ADDRESS ERROR:", error);

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error ? error.message : "Unable to delete address.",
      },
      {
        status: 500,
      },
    );
  }
}
