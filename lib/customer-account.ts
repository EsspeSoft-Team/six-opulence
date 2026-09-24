import "server-only";

import { createHash, randomBytes } from "crypto";

const SHOP_DOMAIN =
  process.env.SHOPIFY_STORE_DOMAIN ||
  process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;

const CLIENT_ID =
  process.env.SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID ||
  process.env.NEXT_PUBLIC_SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID;

export type ShopifyAuthConfig = {
  authorization_endpoint: string;
  token_endpoint: string;
  end_session_endpoint?: string;
  jwks_uri?: string;
};

export type ShopifyCustomerAccountConfig = {
  graphql_api: string;
  mcp_api?: string;
};

export type ShopifyTokenResponse = {
  access_token: string;
  expires_in: number;
  id_token?: string;
  refresh_token?: string;
};

function getShopDomain() {
  if (!SHOP_DOMAIN) {
    throw new Error("SHOPIFY_STORE_DOMAIN is not configured.");
  }

  return SHOP_DOMAIN.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

function getClientId() {
  if (!CLIENT_ID) {
    throw new Error("SHOPIFY_CUSTOMER_ACCOUNT_CLIENT_ID is not configured.");
  }

  return CLIENT_ID;
}

/* =========================================
   SHOPIFY AUTH DISCOVERY
========================================= */

export async function getShopifyAuthConfig(): Promise<ShopifyAuthConfig> {
  const shopDomain = getShopDomain();

  const response = await fetch(
    `https://${shopDomain}/.well-known/openid-configuration`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error("Unable to load Shopify authentication configuration.");
  }

  return response.json();
}

/* =========================================
   CUSTOMER ACCOUNT API DISCOVERY
========================================= */

export async function getCustomerAccountApiConfig(): Promise<ShopifyCustomerAccountConfig> {
  const shopDomain = getShopDomain();

  const response = await fetch(
    `https://${shopDomain}/.well-known/customer-account-api`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      "Unable to load Shopify Customer Account API configuration.",
    );
  }

  return response.json();
}

/* =========================================
   PKCE
========================================= */

export function generateCodeVerifier() {
  return randomBytes(32).toString("base64url");
}

export function generateCodeChallenge(codeVerifier: string) {
  return createHash("sha256").update(codeVerifier).digest("base64url");
}

/* =========================================
   OAUTH STATE
========================================= */

export function generateState() {
  return randomBytes(32).toString("base64url");
}

/* =========================================
   OIDC NONCE
========================================= */

export function generateNonce() {
  return randomBytes(32).toString("base64url");
}

/* =========================================
   CREATE SHOPIFY AUTHORIZATION URL
========================================= */

export async function createShopifyAuthorizationUrl({
  email,
  redirectUri,
  state,
  nonce,
  codeChallenge,
}: {
  email?: string;
  redirectUri: string;
  state: string;
  nonce: string;
  codeChallenge: string;
}) {
  const config = await getShopifyAuthConfig();

  const clientId = getClientId();

  const url = new URL(config.authorization_endpoint);

  url.searchParams.set("scope", "openid email customer-account-api:full");

  url.searchParams.set("client_id", clientId);

  url.searchParams.set("response_type", "code");

  url.searchParams.set("redirect_uri", redirectUri);

  url.searchParams.set("state", state);

  url.searchParams.set("nonce", nonce);

  /* PKCE */
  url.searchParams.set("code_challenge", codeChallenge);

  url.searchParams.set("code_challenge_method", "S256");

  /*
   * IMPORTANT:
   * Email entered on the custom
   * Opulence login page will be
   * passed to Shopify.
   */
  if (email) {
    url.searchParams.set("login_hint", email);
  }

  return url.toString();
}

/* =========================================
   EXCHANGE CODE FOR TOKEN
========================================= */

export async function exchangeCodeForToken({
  code,
  codeVerifier,
  redirectUri,
}: {
  code: string;
  codeVerifier: string;
  redirectUri: string;
}): Promise<ShopifyTokenResponse> {
  const config = await getShopifyAuthConfig();

  const clientId = getClientId();

  const response = await fetch(config.token_endpoint, {
    method: "POST",

    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },

    body: new URLSearchParams({
      grant_type: "authorization_code",

      client_id: clientId,

      redirect_uri: redirectUri,

      code,

      code_verifier: codeVerifier,
    }).toString(),

    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Shopify token exchange error:", errorText);

    throw new Error("Unable to authenticate with Shopify.");
  }

  return response.json();
}

/* =========================================
   CUSTOMER ACCOUNT API FETCH
========================================= */

export async function customerAccountFetch<T>({
  accessToken,
  query,
  variables,
}: {
  accessToken: string;
  query: string;
  variables?: Record<string, unknown>;
}): Promise<T> {
  const apiConfig = await getCustomerAccountApiConfig();

  const response = await fetch(apiConfig.graphql_api, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",

      Authorization: accessToken,
    },

    body: JSON.stringify({
      query,
      variables: variables || {},
    }),

    cache: "no-store",
  });

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Customer Account API error:", errorText);

    throw new Error("Unable to access customer account.");
  }

  const json = await response.json();

  if (json.errors?.length) {
    console.error("Customer Account GraphQL errors:", json.errors);

    throw new Error(json.errors[0]?.message || "Customer Account API error.");
  }

  return json.data as T;
}

/* =========================================
   CURRENT CUSTOMER
========================================= */

export async function getCurrentCustomer(accessToken: string) {
  const data = await customerAccountFetch<{
    customer: {
      id: string;

      displayName: string;

      firstName: string | null;

      lastName: string | null;

      emailAddress: {
        emailAddress: string;
      } | null;
    } | null;
  }>({
    accessToken,

    query: `
        query GetCustomer {
          customer {
            id
            displayName
            firstName
            lastName

            emailAddress {
              emailAddress
            }
          }
        }
      `,
  });

  return data.customer;
}

/* =========================================
   CUSTOMER PROFILE
========================================= */

export async function getCustomerProfile(accessToken: string) {
  const data = await customerAccountFetch<{
    customer: {
      id: string;

      displayName: string;

      firstName: string | null;

      lastName: string | null;

      emailAddress: {
        emailAddress: string;
      } | null;

      defaultAddress: {
        id: string;
        address1: string | null;
        address2: string | null;
        city: string | null;
        province: string | null;
        zip: string | null;
        countryCode: string | null;
        phone: string | null;
      } | null;

      addresses: {
        nodes: Array<{
          id: string;
          address1: string | null;
          address2: string | null;
          city: string | null;
          province: string | null;
          zip: string | null;
          countryCode: string | null;
          phone: string | null;
        }>;
      };
    } | null;
  }>({
    accessToken,

    query: `
        query GetCustomerProfile {
          customer {
            id
            displayName
            firstName
            lastName

            emailAddress {
              emailAddress
            }

            defaultAddress {
              id
              address1
              address2
              city
              province
              zip
              countryCode
              phone
            }

            addresses(first: 20) {
              nodes {
                id
                address1
                address2
                city
                province
                zip
                countryCode
                phone
              }
            }
          }
        }
      `,
  });

  return data.customer;
}

/* =========================================
   CUSTOMER ORDERS
========================================= */

export async function getCustomerOrders(accessToken: string) {
  const data = await customerAccountFetch<{
    customer: {
      orders: {
        nodes: Array<{
          id: string;
          number: string;
          processedAt: string;

          financialStatus: string | null;

          fulfillmentStatus: string | null;

          currentTotalPrice: {
            amount: string;
            currencyCode: string;
          };

          lineItems: {
            nodes: Array<{
              name: string;
              quantity: number;
            }>;
          };
        }>;
      };
    } | null;
  }>({
    accessToken,

    query: `
        query GetCustomerOrders {
          customer {
            orders(
              first: 20
              sortKey: PROCESSED_AT
              reverse: true
            ) {
              nodes {
                id
                number
                processedAt
                financialStatus
                fulfillmentStatus

                currentTotalPrice {
                  amount
                  currencyCode
                }

                lineItems(first: 20) {
                  nodes {
                    name
                    quantity
                  }
                }
              }
            }
          }
        }
      `,
  });

  return data.customer?.orders?.nodes || [];
}

/* =========================================
   LOGOUT
========================================= */

export async function getShopifyLogoutUrl({
  postLogoutRedirectUri,
  idTokenHint,
}: {
  postLogoutRedirectUri: string;
  idTokenHint?: string;
}) {
  const config = await getShopifyAuthConfig();

  if (!config.end_session_endpoint) {
    return postLogoutRedirectUri;
  }

  const url = new URL(config.end_session_endpoint);

  if (idTokenHint) {
    url.searchParams.set("id_token_hint", idTokenHint);
  }

  url.searchParams.set("post_logout_redirect_uri", postLogoutRedirectUri);

  return url.toString();
}

/* =========================================
   CONFIG CHECK
========================================= */

export function isCustomerAccountConfigured() {
  return Boolean(SHOP_DOMAIN && CLIENT_ID);
}
