import { NextRequest, NextResponse } from "next/server";

import { shopifyAdminFetch } from "@/lib/shopify-admin";

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
   shopifyAdminFetch accepts ONE object argument.
============================================================ */

async function adminGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  return shopifyAdminFetch<T>({
    query,
    variables,
  });
}

/* ============================================================
   GET LOGGED-IN CUSTOMER
============================================================ */

async function getLoggedInCustomer() {
  const request = await fetch(
    `${process.env.NEXT_PUBLIC_SITE_URL || ""}/api/auth/me`,
    {
      method: "GET",
      headers: {
        cookie: "",
      },
      cache: "no-store",
    },
  );

  if (!request.ok) {
    return null;
  }

  const data = await request.json();

  return data?.customer || data?.user || null;
}

/* ============================================================
   BETTER AUTH LOOKUP
   Forward current request cookies to /api/auth/me
============================================================ */

async function getCustomerFromAuth(request: NextRequest) {
  const cookie = request.headers.get("cookie") || "";

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL ||
    "http://localhost:3000";

  try {
    const response = await fetch(`${siteUrl}/api/auth/me`, {
      method: "GET",
      headers: {
        cookie,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return null;
    }

    const data = await response.json();

    return data?.customer || data?.user || null;
  } catch (error) {
    console.error("AUTH LOOKUP ERROR:", error);
    return null;
  }
}

/* ============================================================
   GET CUSTOMER ID
============================================================ */

async function resolveCustomerId(request: NextRequest) {
  const customer = await getCustomerFromAuth(request);

  const customerId =
    customer?.id || customer?.customer?.id || customer?.customerId || null;

  if (customerId) {
    return customerId;
  }

  return null;
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
   GET ADDRESSES
============================================================ */

export async function GET(request: NextRequest) {
  try {
    const customerId = await resolveCustomerId(request);

    if (!customerId) {
      return NextResponse.json(
        {
          success: false,
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
              }
            }
          }
        }
      }
    `;

    const data = await adminGraphQL<CustomerAddressesResponse>(query, {
      id: customerId,
    });

    if (!data.customer) {
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
    const customerId = await resolveCustomerId(request);

    if (!customerId) {
      return NextResponse.json(
        {
          success: false,
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

    const result = data.customerAddressCreate;

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
    const customerId = await resolveCustomerId(request);

    if (!customerId) {
      return NextResponse.json(
        {
          success: false,
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

    const result = data.customerAddressUpdate;

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
    const customerId = await resolveCustomerId(request);

    if (!customerId) {
      return NextResponse.json(
        {
          success: false,
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

    const result = data.customerAddressDelete;

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
