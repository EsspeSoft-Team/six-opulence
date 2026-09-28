import "server-only";

/**
 * Shopify Admin API Client
 * --------------------------------------------
 * SERVER-SIDE ONLY
 *
 * Uses Shopify Dev Dashboard Client Credentials Grant.
 *
 * Required env:
 * SHOPIFY_STORE_DOMAIN
 * SHOPIFY_CLIENT_ID
 * SHOPIFY_CLIENT_SECRET
 * SHOPIFY_ADMIN_API_VERSION
 */

const domain = process.env.SHOPIFY_STORE_DOMAIN?.trim();

const clientId = process.env.SHOPIFY_CLIENT_ID?.trim();

const clientSecret = process.env.SHOPIFY_CLIENT_SECRET?.trim();

const apiVersion = process.env.SHOPIFY_ADMIN_API_VERSION?.trim() || "2026-07";

/**
 * Shopify Client Credentials token cache.
 *
 * Shopify access tokens from this grant expire after 24 hours.
 * We keep the token in memory and refresh it shortly before expiry.
 */
let cachedAccessToken: string | null = null;
let cachedTokenExpiresAt = 0;

let tokenRequestPromise: Promise<string> | null = null;

/* =========================================================
   ERROR HELPER
========================================================= */

function getErrorMessage(errors: unknown): string {
  if (!errors) {
    return "Unknown Shopify Admin API error.";
  }

  if (Array.isArray(errors)) {
    return errors
      .map((error: any) => {
        if (typeof error === "string") {
          return error;
        }

        return error?.message || JSON.stringify(error);
      })
      .join(", ");
  }

  if (typeof errors === "object") {
    const errorObject = errors as Record<string, unknown>;

    if (typeof errorObject.message === "string") {
      return errorObject.message;
    }

    return JSON.stringify(errors);
  }

  if (typeof errors === "string") {
    return errors;
  }

  return String(errors);
}

/* =========================================================
   GET SHOPIFY ADMIN ACCESS TOKEN
========================================================= */

async function getShopifyAdminAccessToken(): Promise<string> {
  if (!domain) {
    throw new Error("Missing SHOPIFY_STORE_DOMAIN in .env.local");
  }

  if (!clientId) {
    throw new Error("Missing SHOPIFY_CLIENT_ID in .env.local");
  }

  if (!clientSecret) {
    throw new Error("Missing SHOPIFY_CLIENT_SECRET in .env.local");
  }

  /**
   * Return cached token if it is still valid.
   *
   * Refresh 5 minutes before actual expiration.
   */
  if (cachedAccessToken && Date.now() < cachedTokenExpiresAt) {
    return cachedAccessToken;
  }

  /**
   * Prevent multiple simultaneous token requests.
   */
  if (tokenRequestPromise) {
    return tokenRequestPromise;
  }

  tokenRequestPromise = (async () => {
    try {
      const tokenEndpoint = `https://${domain}/admin/oauth/access_token`;

      const body = new URLSearchParams();

      body.set("grant_type", "client_credentials");
      body.set("client_id", clientId);
      body.set("client_secret", clientSecret);

      const response = await fetch(tokenEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: body.toString(),
        cache: "no-store",
      });

      const responseText = await response.text();

      let json: any = null;

      try {
        json = responseText ? JSON.parse(responseText) : null;
      } catch {
        throw new Error(
          `Shopify token endpoint returned invalid JSON: ${responseText}`,
        );
      }

      if (!response.ok) {
        console.error("SHOPIFY TOKEN HTTP ERROR:", response.status, json);

        throw new Error(
          getErrorMessage(
            json?.errors ||
              json?.error_description ||
              json?.error ||
              `Shopify token request failed with HTTP ${response.status}`,
          ),
        );
      }

      const accessToken = json?.access_token;

      if (!accessToken) {
        console.error("SHOPIFY TOKEN RESPONSE:", json);

        throw new Error("Shopify did not return an access token.");
      }

      /**
       * Shopify returns expires_in.
       *
       * Refresh 5 minutes before expiration.
       */
      const expiresInSeconds = Number(json?.expires_in || 86399);

      const refreshBufferMs = 5 * 60 * 1000;

      cachedAccessToken = accessToken;

      cachedTokenExpiresAt =
        Date.now() +
        Math.max(60 * 1000, expiresInSeconds * 1000 - refreshBufferMs);

      console.log("SHOPIFY ADMIN ACCESS TOKEN: generated successfully");

      return accessToken;
    } finally {
      tokenRequestPromise = null;
    }
  })();

  return tokenRequestPromise;
}

/* =========================================================
   ADMIN API FETCH
========================================================= */

export async function shopifyAdminFetch<T>({
  query,
  variables,
}: {
  query: string;
  variables?: Record<string, unknown>;
}): Promise<T> {
  if (!domain) {
    throw new Error("Missing SHOPIFY_STORE_DOMAIN in .env.local");
  }

  const accessToken = await getShopifyAdminAccessToken();

  const endpoint = `https://${domain}/admin/api/${apiVersion}/graphql.json`;

  const response = await fetch(endpoint, {
    method: "POST",

    headers: {
      "Content-Type": "application/json",

      /**
       * IMPORTANT:
       * GraphQL Admin API needs the generated
       * access token, NOT Client ID or Client Secret.
       */
      "X-Shopify-Access-Token": accessToken,
    },

    body: JSON.stringify({
      query,
      variables,
    }),

    cache: "no-store",
  });

  const responseText = await response.text();

  let json: any = null;

  try {
    json = responseText ? JSON.parse(responseText) : null;
  } catch {
    console.error("SHOPIFY ADMIN RAW RESPONSE:", responseText);

    throw new Error(`Shopify Admin API returned invalid JSON: ${responseText}`);
  }

  /* =======================================================
     HTTP ERROR
  ======================================================= */

  if (!response.ok) {
    console.error("SHOPIFY ADMIN HTTP ERROR:", response.status, json);

    throw new Error(
      getErrorMessage(
        json?.errors ||
          json?.error ||
          `Shopify Admin API request failed with HTTP ${response.status}`,
      ),
    );
  }

  /* =======================================================
     GRAPHQL ERROR
  ======================================================= */

  if (json?.errors) {
    console.error(
      "SHOPIFY ADMIN GRAPHQL ERROR:",
      JSON.stringify(json.errors, null, 2),
    );

    throw new Error(getErrorMessage(json.errors));
  }

  /* =======================================================
     NO DATA
  ======================================================= */

  if (!json?.data) {
    console.error("SHOPIFY ADMIN EMPTY RESPONSE:", json);

    throw new Error("Shopify Admin API returned no data.");
  }

  return json.data as T;
}

/* =========================================================
   ADMIN OVERVIEW
========================================================= */

export async function getAdminOverview() {
  const query = `
    query adminOverview {
      products(
        first: 10
        sortKey: UPDATED_AT
        reverse: true
      ) {
        edges {
          node {
            id
            title
            totalInventory
            status
          }
        }
      }

      orders(
        first: 10
        sortKey: PROCESSED_AT
        reverse: true
      ) {
        edges {
          node {
            id
            name
            displayFinancialStatus
            displayFulfillmentStatus

            totalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }

            createdAt
          }
        }
      }
    }
  `;

  return shopifyAdminFetch<{
    products: {
      edges: {
        node: any;
      }[];
    };

    orders: {
      edges: {
        node: any;
      }[];
    };
  }>({
    query,
  });
}
