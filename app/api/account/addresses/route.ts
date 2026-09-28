import { NextRequest, NextResponse } from "next/server";
import { shopifyAdminFetch } from "@/lib/shopify-admin";

type AddressInput = {
  firstName?: string;
  lastName?: string;
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  provinceCode?: string;
  zip?: string;
  countryCode?: string;
  phone?: string;
  setAsDefault?: boolean;
};

async function getLoggedInCustomerId(request: NextRequest) {
  const origin = request.nextUrl.origin;

  const response = await fetch(`${origin}/api/auth/me`, {
    method: "GET",
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();

  return (
    data?.customer?.id || data?.user?.customer?.id || data?.customerId || null
  );
}

function cleanAddress(body: AddressInput) {
  return {
    firstName: String(body.firstName || "").trim(),
    lastName: String(body.lastName || "").trim(),
    address1: String(body.address1 || "").trim(),
    address2: String(body.address2 || "").trim(),
    city: String(body.city || "").trim(),
    province: String(body.province || "").trim(),
    provinceCode: body.provinceCode
      ? String(body.provinceCode).trim()
      : undefined,
    zip: String(body.zip || "").trim(),
    countryCode: String(body.countryCode || "IN")
      .trim()
      .toUpperCase(),
    phone: String(body.phone || "").trim(),
  };
}

function validateAddress(address: ReturnType<typeof cleanAddress>) {
  if (
    !address.firstName ||
    !address.lastName ||
    !address.address1 ||
    !address.city ||
    !address.province ||
    !address.zip
  ) {
    return "First name, last name, address, city, state and PIN code are required.";
  }

  if (address.zip.length < 4 || address.zip.length > 12) {
    return "Please enter a valid PIN code.";
  }

  return null;
}

/* =========================================================
   GET
   Load customer's saved addresses.
========================================================= */

export async function GET(request: NextRequest) {
  try {
    const customerId = await getLoggedInCustomerId(request);

    if (!customerId) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer session not found.",
        },
        { status: 401 },
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
            nodes {
              id
              firstName
              lastName
              company
              address1
              address2
              city
              province
              provinceCode
              zip
              country
              countryCodeV2
              phone
            }
          }
        }
      }
    `;

    const data = await shopifyAdminFetch<{
      data?: {
        customer?: {
          id: string;
          defaultAddress?: {
            id: string;
          } | null;
          addressesV2?: {
            nodes: any[];
          };
        } | null;
      };
      errors?: Array<{ message?: string }>;
    }>(query, {
      variables: {
        id: customerId,
      },
    });

    if (data?.errors?.length) {
      throw new Error(
        data.errors
          .map((item) => item.message)
          .filter(Boolean)
          .join(", "),
      );
    }

    const customer = data?.data?.customer;

    if (!customer) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      addresses: customer.addressesV2?.nodes || [],
      defaultAddressId: customer.defaultAddress?.id || null,
    });
  } catch (error) {
    console.error("GET /api/account/addresses:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unable to load addresses.",
      },
      { status: 500 },
    );
  }
}

/* =========================================================
   POST
   Create address.
========================================================= */

export async function POST(request: NextRequest) {
  try {
    const customerId = await getLoggedInCustomerId(request);

    if (!customerId) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer session not found.",
        },
        { status: 401 },
      );
    }

    const body = (await request.json()) as AddressInput;
    const address = cleanAddress(body);
    const validationError = validateAddress(address);

    if (validationError) {
      return NextResponse.json(
        {
          success: false,
          error: validationError,
        },
        { status: 400 },
      );
    }

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
            countryCodeV2
            phone
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const data = await shopifyAdminFetch<{
      data?: {
        customerAddressCreate?: {
          address?: any;
          userErrors?: Array<{
            field?: string[];
            message?: string;
          }>;
        };
      };
      errors?: Array<{ message?: string }>;
    }>(mutation, {
      variables: {
        address: {
          firstName: address.firstName,
          lastName: address.lastName,
          address1: address.address1,
          address2: address.address2 || undefined,
          city: address.city,
          province: address.province,
          provinceCode: address.provinceCode,
          zip: address.zip,
          countryCode: address.countryCode,
          phone: address.phone || undefined,
        },
        customerId,
        setAsDefault: Boolean(body.setAsDefault),
      },
    });

    if (data?.errors?.length) {
      throw new Error(
        data.errors
          .map((item) => item.message)
          .filter(Boolean)
          .join(", "),
      );
    }

    const payload = data?.data?.customerAddressCreate;

    if (payload?.userErrors?.length) {
      throw new Error(
        payload.userErrors
          .map((item) => item.message)
          .filter(Boolean)
          .join(", "),
      );
    }

    return NextResponse.json({
      success: true,
      address: payload?.address || null,
    });
  } catch (error) {
    console.error("POST /api/account/addresses:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unable to add address.",
      },
      { status: 500 },
    );
  }
}

/* =========================================================
   PATCH
   Update address.
========================================================= */

export async function PATCH(request: NextRequest) {
  try {
    const customerId = await getLoggedInCustomerId(request);

    if (!customerId) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer session not found.",
        },
        { status: 401 },
      );
    }

    const body = (await request.json()) as AddressInput & {
      addressId?: string;
    };

    if (!body.addressId) {
      return NextResponse.json(
        {
          success: false,
          error: "Address ID is required.",
        },
        { status: 400 },
      );
    }

    const address = cleanAddress(body);
    const validationError = validateAddress(address);

    if (validationError) {
      return NextResponse.json(
        {
          success: false,
          error: validationError,
        },
        { status: 400 },
      );
    }

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
            countryCodeV2
            phone
          }
          userErrors {
            field
            message
          }
        }
      }
    `;

    const data = await shopifyAdminFetch<{
      data?: {
        customerAddressUpdate?: {
          address?: any;
          userErrors?: Array<{
            field?: string[];
            message?: string;
          }>;
        };
      };
      errors?: Array<{ message?: string }>;
    }>(mutation, {
      variables: {
        address: {
          firstName: address.firstName,
          lastName: address.lastName,
          address1: address.address1,
          address2: address.address2 || undefined,
          city: address.city,
          province: address.province,
          provinceCode: address.provinceCode,
          zip: address.zip,
          countryCode: address.countryCode,
          phone: address.phone || undefined,
        },
        addressId: body.addressId,
        customerId,
        setAsDefault: Boolean(body.setAsDefault),
      },
    });

    if (data?.errors?.length) {
      throw new Error(
        data.errors
          .map((item) => item.message)
          .filter(Boolean)
          .join(", "),
      );
    }

    const payload = data?.data?.customerAddressUpdate;

    if (payload?.userErrors?.length) {
      throw new Error(
        payload.userErrors
          .map((item) => item.message)
          .filter(Boolean)
          .join(", "),
      );
    }

    return NextResponse.json({
      success: true,
      address: payload?.address || null,
    });
  } catch (error) {
    console.error("PATCH /api/account/addresses:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unable to update address.",
      },
      { status: 500 },
    );
  }
}

/* =========================================================
   DELETE
========================================================= */

export async function DELETE(request: NextRequest) {
  try {
    const customerId = await getLoggedInCustomerId(request);
    const body = await request.json();

    if (!customerId) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer session not found.",
        },
        { status: 401 },
      );
    }

    if (!body?.addressId) {
      return NextResponse.json(
        {
          success: false,
          error: "Address ID is required.",
        },
        { status: 400 },
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

    const data = await shopifyAdminFetch<{
      data?: {
        customerAddressDelete?: {
          deletedAddressId?: string;
          userErrors?: Array<{
            field?: string[];
            message?: string;
          }>;
        };
      };
      errors?: Array<{ message?: string }>;
    }>(mutation, {
      variables: {
        addressId: body.addressId,
        customerId,
      },
    });

    if (data?.errors?.length) {
      throw new Error(
        data.errors
          .map((item) => item.message)
          .filter(Boolean)
          .join(", "),
      );
    }

    const payload = data?.data?.customerAddressDelete;

    if (payload?.userErrors?.length) {
      throw new Error(
        payload.userErrors
          .map((item) => item.message)
          .filter(Boolean)
          .join(", "),
      );
    }

    return NextResponse.json({
      success: true,
      deletedAddressId: payload?.deletedAddressId || null,
    });
  } catch (error) {
    console.error("DELETE /api/account/addresses:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unable to delete address.",
      },
      { status: 500 },
    );
  }
}
