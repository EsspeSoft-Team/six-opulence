import { NextRequest, NextResponse } from "next/server";
import { shopifyAdminFetch } from "@/lib/shopify-admin";

export const runtime = "nodejs";

/* =========================================================
   TYPES
========================================================= */

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

type AddressInput = {
  firstName?: string;
  lastName?: string;
  company?: string;
  address1?: string;
  address2?: string;
  city?: string;
  province?: string;
  provinceCode?: string;
  countryCode?: string;
  zip?: string;
  phone?: string;
};

/* =========================================================
   AUTH
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

  const data = (await response.json()) as AuthResponse;

  return data.customer || null;
}

/* =========================================================
   CUSTOMER ID
========================================================= */

async function resolveCustomerId(customer: AuthCustomer) {
  if (customer.id) {
    return customer.id;
  }

  const email = customer.email || customer.emailAddress?.emailAddress || "";

  if (!email) {
    return null;
  }

  const data = await shopifyAdminFetch<{
    customers: {
      edges: {
        node: {
          id: string;
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
            }
          }
        }
      }
    `,
    variables: {
      query: `email:${email}`,
    },
  });

  return data.customers.edges[0]?.node?.id || null;
}

/* =========================================================
   GET ADDRESSES
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

    const customerId = await resolveCustomerId(customer);

    if (!customerId) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer not found.",
        },
        { status: 404 },
      );
    }

    const data = await shopifyAdminFetch<{
      customer: {
        id: string;
        defaultAddress: {
          id: string;
        } | null;
        addressesV2: {
          edges: {
            node: any;
          }[];
        };
      } | null;
    }>({
      query: `
        query GetCustomerAddresses(
          $id: ID!
        ) {
          customer(id: $id) {
            id

            defaultAddress {
              id
            }

            addressesV2(first: 20) {
              edges {
                node {
                  id
                  firstName
                  lastName
                  company
                  address1
                  address2
                  city
                  province
                  provinceCode
                  country
                  countryCode
                  zip
                  phone
                }
              }
            }
          }
        }
      `,
      variables: {
        id: customerId,
      },
    });

    return NextResponse.json({
      success: true,
      customer: data.customer,
      addresses:
        data.customer?.addressesV2?.edges?.map((edge) => edge.node) || [],
    });
  } catch (error) {
    console.error("GET ADDRESSES ERROR:", error);

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
   CREATE ADDRESS
========================================================= */

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

    const customerId = await resolveCustomerId(customer);

    if (!customerId) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer not found.",
        },
        { status: 404 },
      );
    }

    const body = (await request.json()) as AddressInput & {
      setAsDefault?: boolean;
    };

    if (!body.address1 || !body.city || !body.zip) {
      return NextResponse.json(
        {
          success: false,
          error: "Address, city and PIN code are required.",
        },
        { status: 400 },
      );
    }

    const data = await shopifyAdminFetch<{
      customerAddressCreate: {
        address: any;
        userErrors: {
          field?: string[];
          message: string;
        }[];
      };
    }>({
      query: `
        mutation CreateAddress(
          $customerId: ID!
          $address: MailingAddressInput!
          $setAsDefault: Boolean
        ) {
          customerAddressCreate(
            customerId: $customerId
            address: $address
            setAsDefault: $setAsDefault
          ) {
            address {
              id
              firstName
              lastName
              company
              address1
              address2
              city
              province
              provinceCode
              country
              countryCode
              zip
              phone
            }

            userErrors {
              field
              message
            }
          }
        }
      `,
      variables: {
        customerId,
        address: {
          firstName: body.firstName || "",
          lastName: body.lastName || "",
          company: body.company || "",
          address1: body.address1,
          address2: body.address2 || "",
          city: body.city,
          province: body.province || "",
          provinceCode: body.provinceCode || "",
          countryCode: body.countryCode || "IN",
          zip: body.zip,
          phone: body.phone || "",
        },
        setAsDefault: Boolean(body.setAsDefault),
      },
    });

    const result = data.customerAddressCreate;

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
      address: result.address,
    });
  } catch (error) {
    console.error("CREATE ADDRESS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unable to create address.",
      },
      { status: 500 },
    );
  }
}

/* =========================================================
   UPDATE ADDRESS
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

    const customerId = await resolveCustomerId(customer);

    if (!customerId) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer not found.",
        },
        { status: 404 },
      );
    }

    const body = (await request.json()) as AddressInput & {
      id?: string;
      setAsDefault?: boolean;
    };

    if (!body.id) {
      return NextResponse.json(
        {
          success: false,
          error: "Address ID is required.",
        },
        { status: 400 },
      );
    }

    const data = await shopifyAdminFetch<{
      customerAddressUpdate: {
        address: any;
        userErrors: {
          field?: string[];
          message: string;
        }[];
      };
    }>({
      query: `
        mutation UpdateAddress(
          $customerId: ID!
          $addressId: ID!
          $address: MailingAddressInput!
          $setAsDefault: Boolean
        ) {
          customerAddressUpdate(
            customerId: $customerId
            addressId: $addressId
            address: $address
            setAsDefault: $setAsDefault
          ) {
            address {
              id
              firstName
              lastName
              company
              address1
              address2
              city
              province
              provinceCode
              country
              countryCode
              zip
              phone
            }

            userErrors {
              field
              message
            }
          }
        }
      `,
      variables: {
        customerId,
        addressId: body.id,
        address: {
          firstName: body.firstName || "",
          lastName: body.lastName || "",
          company: body.company || "",
          address1: body.address1 || "",
          address2: body.address2 || "",
          city: body.city || "",
          province: body.province || "",
          provinceCode: body.provinceCode || "",
          countryCode: body.countryCode || "IN",
          zip: body.zip || "",
          phone: body.phone || "",
        },
        setAsDefault: Boolean(body.setAsDefault),
      },
    });

    const result = data.customerAddressUpdate;

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
      { status: 500 },
    );
  }
}

/* =========================================================
   DELETE ADDRESS
========================================================= */

export async function DELETE(request: NextRequest) {
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

    const customerId = await resolveCustomerId(customer);

    if (!customerId) {
      return NextResponse.json(
        {
          success: false,
          error: "Customer not found.",
        },
        { status: 404 },
      );
    }

    const { searchParams } = new URL(request.url);

    const addressId = searchParams.get("id");

    if (!addressId) {
      return NextResponse.json(
        {
          success: false,
          error: "Address ID is required.",
        },
        { status: 400 },
      );
    }

    const data = await shopifyAdminFetch<{
      customerAddressDelete: {
        deletedAddressId: string | null;
        userErrors: {
          field?: string[];
          message: string;
        }[];
      };
    }>({
      query: `
        mutation DeleteAddress(
          $customerId: ID!
          $addressId: ID!
        ) {
          customerAddressDelete(
            customerId: $customerId
            addressId: $addressId
          ) {
            deletedAddressId

            userErrors {
              field
              message
            }
          }
        }
      `,
      variables: {
        customerId,
        addressId,
      },
    });

    const result = data.customerAddressDelete;

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
      { status: 500 },
    );
  }
}
