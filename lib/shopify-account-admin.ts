/**
 * Shopify Admin API client
 *
 * Used ONLY for customer account management:
 *
 * - Edit Profile
 * - Create Address
 * - Update Address
 * - Delete Address
 *
 * Uses OPULENCE STOREFRONT app credentials.
 */

type AdminFetchParams = {
  query: string;
  variables?: Record<string, unknown>;
};

type CachedToken = {
  accessToken: string;
  expiresAt: number;
};

const domain = process.env.SHOPIFY_STORE_DOMAIN;

const clientId = process.env.SHOPIFY_ADMIN_CLIENT_ID;

const clientSecret = process.env.SHOPIFY_ADMIN_CLIENT_SECRET;

const apiVersion = process.env.SHOPIFY_ADMIN_API_VERSION || "2026-07";

let cachedToken: CachedToken | null = null;

/* =========================================================
   GET ACCESS TOKEN
========================================================= */

async function getAdminAccessToken(): Promise<string> {
  if (!domain) {
    throw new Error("SHOPIFY_STORE_DOMAIN is missing.");
  }

  if (!clientId) {
    throw new Error("SHOPIFY_ADMIN_CLIENT_ID is missing.");
  }

  if (!clientSecret) {
    throw new Error("SHOPIFY_ADMIN_CLIENT_SECRET is missing.");
  }

  const now = Date.now();

  /*
   * Reuse token while valid.
   */
  if (cachedToken && cachedToken.expiresAt > now + 5 * 60 * 1000) {
    return cachedToken.accessToken;
  }

  const response = await fetch(`https://${domain}/admin/oauth/access_token`, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      grant_type: "client_credentials",
      client_id: clientId,
      client_secret: clientSecret,
    }),

    cache: "no-store",
  });

  const text = await response.text();

  let data: any;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Shopify token response was not valid JSON: ${text}`);
  }

  if (!response.ok) {
    console.error(
      "Shopify Storefront Admin token error:",
      response.status,
      data,
    );

    throw new Error(
      data?.error_description ||
        data?.error ||
        "Unable to get Shopify Admin access token.",
    );
  }

  if (!data?.access_token) {
    throw new Error("Shopify Admin access token was not returned.");
  }

  const expiresIn = Number(data.expires_in) || 86400;

  cachedToken = {
    accessToken: data.access_token,
    expiresAt: now + expiresIn * 1000,
  };

  return data.access_token;
}

/* =========================================================
   ADMIN GRAPHQL
========================================================= */

export async function shopifyAccountAdminFetch<T = any>({
  query,
  variables,
}: AdminFetchParams): Promise<T> {
  if (!domain) {
    throw new Error("SHOPIFY_STORE_DOMAIN is missing.");
  }

  const accessToken = await getAdminAccessToken();

  const endpoint = `https://${domain}/admin/api/${apiVersion}/graphql.json`;

  const response = await fetch(endpoint, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Access-Token": accessToken,
    },

    body: JSON.stringify({
      query,
      variables: variables || {},
    }),

    cache: "no-store",
  });

  const text = await response.text();

  let data: any;

  try {
    data = JSON.parse(text);
  } catch {
    throw new Error(`Shopify Admin API returned invalid JSON: ${text}`);
  }

  if (!response.ok) {
    console.error("Shopify Account Admin HTTP error:", response.status, data);

    throw new Error(
      data?.errors?.[0]?.message ||
        `Shopify Admin API failed with status ${response.status}`,
    );
  }

  if (data?.errors?.length) {
    console.error(
      "Shopify Account Admin GraphQL errors:",
      JSON.stringify(data.errors, null, 2),
    );

    throw new Error(data.errors.map((error: any) => error.message).join(", "));
  }

  return data.data as T;
}
