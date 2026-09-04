/**
 * Shopify Storefront API client
 * ------------------------------
 * Ei file ta diye Shopify-r Storefront API (GraphQL) er sathe connect kora hoy.
 * Shob product/collection/cart fetch ei ekta central function diye jabe,
 * jate multiple frontend (web, mobile app via BFF) ekই logic reuse korte pare.
 *
 * MOCK MODE:
 * Jotokkhon Shopify credentials .env.local-e set kora na hoy, ততক্ষণ eta
 * automatic-vabe mock/demo data return korবে (same shape, real Shopify
 * API response-r moto). Client approval-r pore .env.local-e real
 * credentials বসালেই — kono component/page code change chara — real
 * data ashte shuru korবে.
 */

import {
  mockProducts,
  mockCollections,
  mockCustomer,
  mockCart,
  mockAddLineToCart,
  mockGetCart,
} from "./mock-data";

const domain = process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN;
const storefrontAccessToken =
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;
const apiVersion = process.env.SHOPIFY_STOREFRONT_API_VERSION || "2024-07";

// Credentials na thakle automatically mock mode-e chole jay
const USE_MOCK = !domain || !storefrontAccessToken;

const endpoint = `https://${domain}/api/${apiVersion}/graphql.json`;

type ShopifyFetchParams = {
  query: string;
  variables?: Record<string, unknown>;
};

/**
 * Core fetcher — shob GraphQL query/mutation ei function diye jabe
 */
export async function shopifyFetch<T>({
  query,
  variables,
}: ShopifyFetchParams): Promise<T> {
  if (!domain || !storefrontAccessToken) {
    throw new Error(
      "Shopify env variables missing. .env.local file check koro (NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN, NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN)."
    );
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
    },
    body: JSON.stringify({ query, variables }),
    // Next.js caching control — product data khub beshi change na hole cache rakha jay
    next: { revalidate: 60 },
  });

  const json = await response.json();

  if (json.errors) {
    console.error("Shopify API Error:", JSON.stringify(json.errors, null, 2));
    throw new Error("Shopify Storefront API request failed.");
  }

  return json.data as T;
}

/* -----------------------------------------------------------
   QUERIES
----------------------------------------------------------- */

// Shob products fetch (listing page-r jonno)
export async function getProducts(first = 12) {
  if (USE_MOCK) return mockProducts.slice(0, first);

  const query = `
    query getProducts($first: Int!) {
      products(first: $first) {
        edges {
          node {
            id
            title
            handle
            description
            featuredImage {
              url
              altText
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<{
    products: { edges: { node: any }[] };
  }>({ query, variables: { first } });

  return data.products.edges.map((edge) => edge.node);
}

// Ekta single product handle diye fetch (product detail page-r jonno)
export async function getProductByHandle(handle: string) {
  if (USE_MOCK) return mockProducts.find((p) => p.handle === handle) || null;

  const query = `
    query getProduct($handle: String!) {
      product(handle: $handle) {
        id
        title
        description
        descriptionHtml
        images(first: 10) {
          edges {
            node {
              url
              altText
            }
          }
        }
        variants(first: 25) {
          edges {
            node {
              id
              title
              availableForSale
              price {
                amount
                currencyCode
              }
              selectedOptions {
                name
                value
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<{ product: any }>({
    query,
    variables: { handle },
  });

  return data.product;
}

// Collections fetch (category/collection page-r jonno)
export async function getCollections(first = 10) {
  if (USE_MOCK) return mockCollections.slice(0, first);

  const query = `
    query getCollections($first: Int!) {
      collections(first: $first) {
        edges {
          node {
            id
            title
            handle
            image {
              url
              altText
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<{
    collections: { edges: { node: any }[] };
  }>({ query, variables: { first } });

  return data.collections.edges.map((edge) => edge.node);
}

// Ekta collection-r products fetch (collection/category page-r jonno)
export async function getCollectionByHandle(handle: string, first = 24) {
  if (USE_MOCK) {
    const collection = mockCollections.find((c) => c.handle === handle);
    return collection || null;
  }

  const query = `
    query getCollection($handle: String!, $first: Int!) {
      collection(handle: $handle) {
        id
        title
        description
        products(first: $first) {
          edges {
            node {
              id
              title
              handle
              featuredImage {
                url
                altText
              }
              priceRange {
                minVariantPrice {
                  amount
                  currencyCode
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<{ collection: any }>({
    query,
    variables: { handle, first },
  });

  return data.collection;
}

// New arrivals — sorted by CREATED_AT descending
export async function getNewArrivals(first = 12) {
  if (USE_MOCK) return [...mockProducts].reverse().slice(0, first);

  const query = `
    query getNewArrivals($first: Int!) {
      products(first: $first, sortKey: CREATED_AT, reverse: true) {
        edges {
          node {
            id
            title
            handle
            featuredImage {
              url
              altText
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<{ products: { edges: { node: any }[] } }>({
    query,
    variables: { first },
  });

  return data.products.edges.map((edge) => edge.node);
}

// Related products — same product type/tags diye simple approach
// (Shopify Storefront API-te "recommendations" query direct ache, seta use korchi)
export async function getRelatedProducts(productId: string) {
  if (USE_MOCK) {
    return mockProducts.filter((p) => p.id !== productId).slice(0, 4);
  }

  const query = `
    query getRelated($productId: ID!) {
      productRecommendations(productId: $productId) {
        id
        title
        handle
        featuredImage {
          url
          altText
        }
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<{ productRecommendations: any[] }>({
    query,
    variables: { productId },
  });

  return data.productRecommendations || [];
}

// Search products by query text
export async function searchProducts(searchTerm: string, first = 20) {
  if (USE_MOCK) {
    const term = searchTerm.toLowerCase();
    return mockProducts
      .filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.productType.toLowerCase().includes(term)
      )
      .slice(0, first);
  }

  const query = `
    query searchProducts($query: String!, $first: Int!) {
      products(first: $first, query: $query) {
        edges {
          node {
            id
            title
            handle
            featuredImage {
              url
              altText
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<{ products: { edges: { node: any }[] } }>({
    query,
    variables: { query: searchTerm, first },
  });

  return data.products.edges.map((edge) => edge.node);
}

// Best sellers — Storefront API-r built-in BEST_SELLING sort key use kore
export async function getBestSellers(first = 8) {
  if (USE_MOCK) return mockProducts.slice(0, first);

  const query = `
    query getBestSellers($first: Int!) {
      products(first: $first, sortKey: BEST_SELLING) {
        edges {
          node {
            id
            title
            handle
            featuredImage {
              url
              altText
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<{ products: { edges: { node: any }[] } }>({
    query,
    variables: { first },
  });

  return data.products.edges.map((edge) => edge.node);
}

// Product type diye filter (e.g. "Tee", "Polo") — homepage category tiles-r jonno
export async function getProductsByType(productType: string, first = 8) {
  if (USE_MOCK) {
    return mockProducts
      .filter((p) => p.productType === productType)
      .slice(0, first);
  }

  const query = `
    query getProductsByType($query: String!, $first: Int!) {
      products(first: $first, query: $query) {
        edges {
          node {
            id
            title
            handle
            featuredImage {
              url
              altText
            }
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<{ products: { edges: { node: any }[] } }>({
    query,
    variables: { query: `product_type:${productType}`, first },
  });

  return data.products.edges.map((edge) => edge.node);
}

/* -----------------------------------------------------------
   CUSTOMER AUTH (Storefront API classic customer accounts)
   Note: Jodi apnar Shopify store "new Customer Accounts" e migrate
   kora thake, tahole eta na kore alada "Customer Account API"
   (OAuth-based) lagbe. Shopify Admin -> Settings -> Customer accounts
   e check kore dekhben kon type active ache.
----------------------------------------------------------- */

export async function customerRegister(
  email: string,
  password: string,
  firstName: string,
  lastName: string
) {
  if (USE_MOCK) {
    return { customer: { id: "gid://mock/Customer/1", email }, customerUserErrors: [] };
  }

  const query = `
    mutation customerCreate($input: CustomerCreateInput!) {
      customerCreate(input: $input) {
        customer {
          id
          email
        }
        customerUserErrors {
          field
          message
        }
      }
    }
  `;

  const data = await shopifyFetch<{ customerCreate: any }>({
    query,
    variables: { input: { email, password, firstName, lastName } },
  });

  return data.customerCreate;
}

export async function customerLogin(email: string, password: string) {
  if (USE_MOCK) {
    return {
      customerAccessToken: { accessToken: "mock-token", expiresAt: "" },
      customerUserErrors: [],
    };
  }

  const query = `
    mutation customerAccessTokenCreate($input: CustomerAccessTokenCreateInput!) {
      customerAccessTokenCreate(input: $input) {
        customerAccessToken {
          accessToken
          expiresAt
        }
        customerUserErrors {
          field
          message
        }
      }
    }
  `;

  const data = await shopifyFetch<{ customerAccessTokenCreate: any }>({
    query,
    variables: { input: { email, password } },
  });

  return data.customerAccessTokenCreate;
}

export async function customerLogout(accessToken: string) {
  if (USE_MOCK) return;

  const query = `
    mutation customerAccessTokenDelete($customerAccessToken: String!) {
      customerAccessTokenDelete(customerAccessToken: $customerAccessToken) {
        deletedAccessToken
      }
    }
  `;

  await shopifyFetch({ query, variables: { customerAccessToken: accessToken } });
}

export async function getCustomer(accessToken: string) {
  if (USE_MOCK) return accessToken === "mock-token" ? mockCustomer : null;

  const query = `
    query getCustomer($customerAccessToken: String!) {
      customer(customerAccessToken: $customerAccessToken) {
        id
        firstName
        lastName
        email
        phone
        defaultAddress {
          address1
          city
          province
          zip
          country
        }
        addresses(first: 10) {
          edges {
            node {
              id
              address1
              address2
              city
              province
              zip
              country
              phone
            }
          }
        }
        orders(first: 20, sortKey: PROCESSED_AT, reverse: true) {
          edges {
            node {
              id
              orderNumber
              processedAt
              financialStatus
              fulfillmentStatus
              currentTotalPrice {
                amount
                currencyCode
              }
              lineItems(first: 10) {
                edges {
                  node {
                    title
                    quantity
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<{ customer: any }>({
    query,
    variables: { customerAccessToken: accessToken },
  });

  return data.customer;
}

export async function customerRecoverPassword(email: string) {
  if (USE_MOCK) return { customerUserErrors: [] };

  const query = `
    mutation customerRecover($email: String!) {
      customerRecover(email: $email) {
        customerUserErrors {
          field
          message
        }
      }
    }
  `;

  const data = await shopifyFetch<{ customerRecover: any }>({
    query,
    variables: { email },
  });

  return data.customerRecover;
}

/* -----------------------------------------------------------
   CART MUTATIONS
----------------------------------------------------------- */

// Notun cart create kora
export async function createCart() {
  if (USE_MOCK) return { ...mockCart };

  const query = `
    mutation cartCreate {
      cartCreate {
        cart {
          id
          checkoutUrl
        }
      }
    }
  `;

  const data = await shopifyFetch<{ cartCreate: { cart: any } }>({ query });
  return data.cartCreate.cart;
}

// Cart-e item add kora
export async function addToCart(
  cartId: string,
  variantId: string,
  quantity: number = 1
) {
  if (USE_MOCK) return mockAddLineToCart(variantId, quantity);

  const query = `
    mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
      cartLinesAdd(cartId: $cartId, lines: $lines) {
        cart {
          id
          checkoutUrl
          totalQuantity
          cost {
            totalAmount {
              amount
              currencyCode
            }
          }
          lines(first: 50) {
            edges {
              node {
                id
                quantity
                merchandise {
                  ... on ProductVariant {
                    id
                    title
                    product {
                      title
                      featuredImage {
                        url
                      }
                    }
                    price {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<{ cartLinesAdd: { cart: any } }>({
    query,
    variables: {
      cartId,
      lines: [{ merchandiseId: variantId, quantity }],
    },
  });

  return data.cartLinesAdd.cart;
}

// Existing cart fetch kora (page reload-e cart persist korte)
export async function getCart(cartId: string) {
  if (USE_MOCK) return mockGetCart();

  const query = `
    query getCart($cartId: ID!) {
      cart(id: $cartId) {
        id
        checkoutUrl
        totalQuantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
        lines(first: 50) {
          edges {
            node {
              id
              quantity
              merchandise {
                ... on ProductVariant {
                  id
                  title
                  product {
                    title
                    featuredImage {
                      url
                    }
                  }
                  price {
                    amount
                    currencyCode
                  }
                }
              }
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<{ cart: any }>({
    query,
    variables: { cartId },
  });

  return data.cart;
}
