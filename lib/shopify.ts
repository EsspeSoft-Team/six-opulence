/**
 * Shopify Storefront API client
 * ------------------------------
 * Central Shopify Storefront API client for:
 * - Products
 * - Product variants
 * - Collections
 * - Search
 * - Customer auth
 * - Cart
 *
 * IMPORTANT:
 * Product listing queries include variants so ProductCard can
 * directly use Shopify variant IDs for Add to Cart.
 */

import {
  mockProducts,
  mockCollections,
  mockCustomer,
  mockCart,
  mockAddLineToCart,
  mockGetCart,
} from "./mock-data";

/* ============================================================
   SHOPIFY CONFIG
============================================================ */

const domain =
  process.env.NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN ||
  process.env.SHOPIFY_STORE_DOMAIN;

const storefrontAccessToken =
  process.env.NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

const apiVersion = process.env.SHOPIFY_STOREFRONT_API_VERSION || "2026-07";

/*
 * Real Shopify API will be used when both credentials exist.
 * Otherwise mock mode is used.
 */
const USE_MOCK = !domain || !storefrontAccessToken;

const endpoint = domain
  ? `https://${domain}/api/${apiVersion}/graphql.json`
  : "";

/* ============================================================
   TYPES
============================================================ */

type ShopifyFetchParams = {
  query: string;
  variables?: Record<string, unknown>;
};

/* ============================================================
   COMMON VARIANT FIELDS
============================================================ */

/*
 * Keep this field block identical everywhere.
 *
 * ProductCard needs:
 * - id
 * - availableForSale
 * - selectedOptions
 *
 * Product details also uses:
 * - title
 * - price
 */

const PRODUCT_VARIANTS_FRAGMENT = `
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
        image {
          url
          altText
        }
      }
    }
  }
`;

/* ============================================================
   CORE SHOPIFY FETCH
============================================================ */

export async function shopifyFetch<T>({
  query,
  variables,
}: ShopifyFetchParams): Promise<T> {
  if (!domain || !storefrontAccessToken) {
    throw new Error(
      "Shopify env variables missing. Check .env.local for NEXT_PUBLIC_SHOPIFY_STORE_DOMAIN and NEXT_PUBLIC_SHOPIFY_STOREFRONT_ACCESS_TOKEN.",
    );
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": storefrontAccessToken,
    },
    body: JSON.stringify({
      query,
      variables,
    }),
    next: {
      revalidate: 60,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();

    console.error("Shopify HTTP Error:", response.status, errorText);

    throw new Error(
      `Shopify API request failed with status ${response.status}`,
    );
  }

  const json = await response.json();

  if (json.errors) {
    console.error("Shopify API Error:", JSON.stringify(json.errors, null, 2));

    throw new Error("Shopify Storefront API request failed.");
  }

  if (!json.data) {
    throw new Error("Shopify API returned no data.");
  }

  return json.data as T;
}

/* ============================================================
   PRODUCTS
============================================================ */

/**
 * Get all products
 *
 * IMPORTANT:
 * variants are included here so ProductCard can add
 * the correct Shopify variant to the cart.
 */
export async function getProducts(first = 12) {
  if (USE_MOCK) {
    return mockProducts.slice(0, first);
  }

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

            ${PRODUCT_VARIANTS_FRAGMENT}
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<{
    products: {
      edges: {
        node: any;
      }[];
    };
  }>({
    query,
    variables: {
      first,
    },
  });

  return data.products.edges.map((edge) => edge.node);
}

/* ============================================================
   SINGLE PRODUCT
============================================================ */

export async function getProductByHandle(handle: string) {
  if (USE_MOCK) {
    return mockProducts.find((p) => p.handle === handle) || null;
  }

  const query = `
    query getProduct($handle: String!) {
      product(handle: $handle) {
        id
        title
        handle
        productType
        description
        descriptionHtml

        featuredImage {
          url
          altText
        }

        images(first: 10) {
          edges {
            node {
              url
              altText
            }
          }
        }

        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }

        ${PRODUCT_VARIANTS_FRAGMENT}
      }
    }
  `;

  const data = await shopifyFetch<{
    product: any;
  }>({
    query,
    variables: {
      handle,
    },
  });

  return data.product;
}

/* ============================================================
   COLLECTIONS
============================================================ */

export async function getCollections(first = 10) {
  if (USE_MOCK) {
    return mockCollections.slice(0, first);
  }

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
    collections: {
      edges: {
        node: any;
      }[];
    };
  }>({
    query,
    variables: {
      first,
    },
  });

  return data.collections.edges.map((edge) => edge.node);
}

/* ============================================================
   COLLECTION PRODUCTS
============================================================ */

export async function getCollectionByHandle(handle: string, first = 24) {
  if (USE_MOCK) {
    const collection = mockCollections.find((c) => c.handle === handle);

    return collection || null;
  }

  const query = `
    query getCollection(
      $handle: String!,
      $first: Int!
    ) {
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

              ${PRODUCT_VARIANTS_FRAGMENT}
            }
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<{
    collection: any;
  }>({
    query,
    variables: {
      handle,
      first,
    },
  });

  return data.collection;
}

/* ============================================================
   NEW ARRIVALS
============================================================ */

export async function getNewArrivals(first = 12) {
  if (USE_MOCK) {
    return [...mockProducts].reverse().slice(0, first);
  }

  const query = `
    query getNewArrivals($first: Int!) {
      products(
        first: $first,
        sortKey: CREATED_AT,
        reverse: true
      ) {
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

            ${PRODUCT_VARIANTS_FRAGMENT}
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<{
    products: {
      edges: {
        node: any;
      }[];
    };
  }>({
    query,
    variables: {
      first,
    },
  });

  return data.products.edges.map((edge) => edge.node);
}

/* ============================================================
   RELATED PRODUCTS
============================================================ */

/**
 * Related products:
 * - Prefer products with the same Shopify product type.
 * - Exclude the current product.
 * - Return up to 4 products.
 *
 * This avoids depending only on Shopify's productRecommendations
 * engine, which can return an empty array for products that do not
 * yet have enough recommendation data.
 */
export async function getRelatedProducts(
  productId: string,
  productType: string,
  first = 4,
) {
  const cleanProductType = productType?.trim();

  if (USE_MOCK) {
    return mockProducts
      .filter(
        (product: any) =>
          product.id !== productId &&
          (!cleanProductType || product.productType === cleanProductType),
      )
      .slice(0, first);
  }

  if (!cleanProductType) {
    return [];
  }

  const query = `
    query getRelatedProducts(
      $query: String!,
      $first: Int!
    ) {
      products(
        first: $first,
        query: $query
      ) {
        edges {
          node {
            id
            title
            handle
            productType

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

            ${PRODUCT_VARIANTS_FRAGMENT}
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<{
    products: {
      edges: {
        node: any;
      }[];
    };
  }>({
    query,
    variables: {
      query: `product_type:${cleanProductType}`,
      first: first + 1,
    },
  });

  return data.products.edges
    .map((edge) => edge.node)
    .filter((product) => product.id !== productId)
    .slice(0, first);
}

/* ============================================================
   SEARCH
============================================================ */

export async function searchProducts(searchTerm: string, first = 50) {
  const cleanTerm = searchTerm.trim();

  if (!cleanTerm) {
    return [];
  }

  if (USE_MOCK) {
    const term = cleanTerm.toLowerCase();

    return mockProducts
      .filter((p: any) => {
        const searchText = [
          p.title,
          p.handle,
          p.description,
          p.productType,
          p.vendor,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchText.includes(term);
      })
      .slice(0, first);
  }

  const query = `
    query searchProducts(
      $query: String!,
      $first: Int!
    ) {
      products(
        first: $first,
        query: $query
      ) {
        edges {
          node {
            id
            title
            handle
            description
            productType
            vendor

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

            ${PRODUCT_VARIANTS_FRAGMENT}
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<{
    products: {
      edges: {
        node: any;
      }[];
    };
  }>({
    query,
    variables: {
      query: cleanTerm,
      first,
    },
  });

  return data.products.edges.map((edge) => edge.node);
}

/* ============================================================
   EXCLUSIVE PRODUCTS
============================================================ */

export async function getExclusiveProducts(first = 24) {
  if (USE_MOCK) {
    return mockProducts
      .filter(
        (product: any) =>
          Array.isArray(product.tags) &&
          product.tags.some(
            (tag: string) => tag.trim().toLowerCase() === "exclusive",
          ),
      )
      .slice(0, first);
  }

  const query = `
    query getExclusiveProducts(
      $query: String!,
      $first: Int!
    ) {
      products(
        first: $first,
        query: $query
      ) {
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

            ${PRODUCT_VARIANTS_FRAGMENT}
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<{
    products: {
      edges: {
        node: any;
      }[];
    };
  }>({
    query,
    variables: {
      query: "tag:Exclusive",
      first,
    },
  });

  return data.products.edges.map((edge) => edge.node);
}

/* ============================================================
   BEST SELLERS
============================================================ */

export async function getBestSellers(first = 8) {
  if (USE_MOCK) {
    return mockProducts.slice(0, first);
  }

  const query = `
    query getBestSellers($first: Int!) {
      products(
        first: $first,
        sortKey: BEST_SELLING
      ) {
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

            ${PRODUCT_VARIANTS_FRAGMENT}
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<{
    products: {
      edges: {
        node: any;
      }[];
    };
  }>({
    query,
    variables: {
      first,
    },
  });

  return data.products.edges.map((edge) => edge.node);
}

/* ============================================================
   PRODUCT TYPE
============================================================ */

/**
 * Example:
 * getProductsByType("Polo", 12)
 * getProductsByType("Tee", 12)
 */
export async function getProductsByType(productType: string, first = 8) {
  if (USE_MOCK) {
    return mockProducts
      .filter((p) => p.productType === productType)
      .slice(0, first);
  }

  const query = `
    query getProductsByType(
      $query: String!,
      $first: Int!
    ) {
      products(
        first: $first,
        query: $query
      ) {
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

            ${PRODUCT_VARIANTS_FRAGMENT}
          }
        }
      }
    }
  `;

  const data = await shopifyFetch<{
    products: {
      edges: {
        node: any;
      }[];
    };
  }>({
    query,
    variables: {
      query: `product_type:${productType}`,
      first,
    },
  });

  return data.products.edges.map((edge) => edge.node);
}

/* ============================================================
   CUSTOMER AUTH
============================================================ */

/**
 * Customer registration
 */
export async function customerRegister(
  email: string,
  password: string,
  firstName: string,
  lastName: string,
) {
  if (USE_MOCK) {
    return {
      customer: {
        id: "gid://mock/Customer/1",
        email,
      },
      customerUserErrors: [],
    };
  }

  const query = `
    mutation customerCreate(
      $input: CustomerCreateInput!
    ) {
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

  const data = await shopifyFetch<{
    customerCreate: any;
  }>({
    query,
    variables: {
      input: {
        email,
        password,
        firstName,
        lastName,
      },
    },
  });

  return data.customerCreate;
}

/* ============================================================
   CUSTOMER LOGIN
============================================================ */

export async function customerLogin(email: string, password: string) {
  if (USE_MOCK) {
    return {
      customerAccessToken: {
        accessToken: "mock-token",
        expiresAt: "",
      },
      customerUserErrors: [],
    };
  }

  const query = `
    mutation customerAccessTokenCreate(
      $input: CustomerAccessTokenCreateInput!
    ) {
      customerAccessTokenCreate(
        input: $input
      ) {
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

  const data = await shopifyFetch<{
    customerAccessTokenCreate: any;
  }>({
    query,
    variables: {
      input: {
        email,
        password,
      },
    },
  });

  return data.customerAccessTokenCreate;
}

/* ============================================================
   CUSTOMER LOGOUT
============================================================ */

export async function customerLogout(accessToken: string) {
  if (USE_MOCK) {
    return;
  }

  const query = `
    mutation customerAccessTokenDelete(
      $customerAccessToken: String!
    ) {
      customerAccessTokenDelete(
        customerAccessToken: $customerAccessToken
      ) {
        deletedAccessToken
      }
    }
  `;

  await shopifyFetch({
    query,
    variables: {
      customerAccessToken: accessToken,
    },
  });
}

/* ============================================================
   GET CUSTOMER
============================================================ */

export async function getCustomer(accessToken: string) {
  if (USE_MOCK) {
    return accessToken === "mock-token" ? mockCustomer : null;
  }

  const query = `
    query getCustomer(
      $customerAccessToken: String!
    ) {
      customer(
        customerAccessToken: $customerAccessToken
      ) {
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

        orders(
          first: 20,
          sortKey: PROCESSED_AT,
          reverse: true
        ) {
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

  const data = await shopifyFetch<{
    customer: any;
  }>({
    query,
    variables: {
      customerAccessToken: accessToken,
    },
  });

  return data.customer;
}

/* ============================================================
   CUSTOMER PASSWORD RECOVERY
============================================================ */

export async function customerRecoverPassword(email: string) {
  if (USE_MOCK) {
    return {
      customerUserErrors: [],
    };
  }

  const query = `
    mutation customerRecover(
      $email: String!
    ) {
      customerRecover(email: $email) {
        customerUserErrors {
          field
          message
        }
      }
    }
  `;

  const data = await shopifyFetch<{
    customerRecover: any;
  }>({
    query,
    variables: {
      email,
    },
  });

  return data.customerRecover;
}

/* ============================================================
   CART
============================================================ */

/**
 * Create Shopify cart
 */
function normalizeCartVariantImages(cart: any) {
  if (!cart?.lines?.edges) return cart;

  cart.lines.edges = cart.lines.edges.map((edge: any) => {
    const merchandise = edge?.node?.merchandise;

    if (merchandise?.image?.url && merchandise?.product) {
      merchandise.product.featuredImage = {
        url: merchandise.image.url,
        altText: merchandise.image.altText || null,
      };
    }

    return edge;
  });

  return cart;
}

export async function createCart() {
  if (USE_MOCK) {
    return {
      ...mockCart,
    };
  }

  const query = `
    mutation cartCreate {
      cartCreate {
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

                    image {
                      url
                      altText
                    }

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

                    selectedOptions {
                      name
                      value
                    }
                  }
                }
              }
            }
          }
        }

        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await shopifyFetch<{
    cartCreate: {
      cart: any;
      userErrors: any[];
    };
  }>({
    query,
  });

  if (data.cartCreate.userErrors?.length) {
    console.error("Shopify cartCreate errors:", data.cartCreate.userErrors);

    throw new Error(
      data.cartCreate.userErrors[0]?.message ||
        "Unable to create Shopify cart.",
    );
  }

  return normalizeCartVariantImages(data.cartCreate.cart);
}

/* ============================================================
   ADD TO CART
============================================================ */

export async function addToCart(
  cartId: string,
  variantId: string,
  quantity: number = 1,
) {
  if (USE_MOCK) {
    return mockAddLineToCart(variantId, quantity);
  }

  const query = `
    mutation cartLinesAdd(
      $cartId: ID!,
      $lines: [CartLineInput!]!
    ) {
      cartLinesAdd(
        cartId: $cartId,
        lines: $lines
      ) {
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

                    image {
                      url
                      altText
                    }

                    selectedOptions {
                      name
                      value
                    }

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

        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await shopifyFetch<{
    cartLinesAdd: {
      cart: any;
      userErrors: any[];
    };
  }>({
    query,
    variables: {
      cartId,
      lines: [
        {
          merchandiseId: variantId,
          quantity,
        },
      ],
    },
  });

  if (data.cartLinesAdd.userErrors?.length) {
    console.error("Shopify cartLinesAdd errors:", data.cartLinesAdd.userErrors);

    throw new Error(
      data.cartLinesAdd.userErrors[0]?.message ||
        "Unable to add product to cart.",
    );
  }

  return normalizeCartVariantImages(data.cartLinesAdd.cart);
}

/* ============================================================
   GET CART
============================================================ */

export async function getCart(cartId: string) {
  if (USE_MOCK) {
    return mockGetCart();
  }

  const query = `
    query getCart(
      $cartId: ID!
    ) {
      cart(id: $cartId) {
        id
        checkoutUrl
        totalQuantity

        cost {
          subtotalAmount {
            amount
            currencyCode
          }

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

                  selectedOptions {
                    name
                    value
                  }

                  product {
                    title
                    handle

                    featuredImage {
                      url
                      altText
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

  const data = await shopifyFetch<{
    cart: any;
  }>({
    query,
    variables: {
      cartId,
    },
  });

  return normalizeCartVariantImages(data.cart);
}

/* ============================================================
   UPDATE CART LINES
============================================================ */

export async function updateCartLines(
  cartId: string,
  lines: {
    id: string;
    quantity: number;
  }[],
) {
  if (USE_MOCK) {
    return mockGetCart();
  }

  const query = `
    mutation cartLinesUpdate(
      $cartId: ID!,
      $lines: [CartLineUpdateInput!]!
    ) {
      cartLinesUpdate(
        cartId: $cartId,
        lines: $lines
      ) {
        cart {
          id
          checkoutUrl
          totalQuantity

          cost {
            subtotalAmount {
              amount
              currencyCode
            }

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

                    image {
                      url
                      altText
                    }

                    selectedOptions {
                      name
                      value
                    }

                    product {
                      title
                      handle

                      featuredImage {
                        url
                        altText
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

        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await shopifyFetch<{
    cartLinesUpdate: {
      cart: any;
      userErrors: any[];
    };
  }>({
    query,
    variables: {
      cartId,
      lines,
    },
  });

  if (data.cartLinesUpdate.userErrors?.length) {
    console.error(
      "Shopify cartLinesUpdate errors:",
      data.cartLinesUpdate.userErrors,
    );

    throw new Error(
      data.cartLinesUpdate.userErrors[0]?.message || "Unable to update cart.",
    );
  }

  return normalizeCartVariantImages(data.cartLinesUpdate.cart);
}

/* ============================================================
   REMOVE CART LINES
============================================================ */

export async function removeFromCart(cartId: string, lineIds: string[]) {
  if (USE_MOCK) {
    return mockGetCart();
  }

  const query = `
    mutation cartLinesRemove(
      $cartId: ID!,
      $lineIds: [ID!]!
    ) {
      cartLinesRemove(
        cartId: $cartId,
        lineIds: $lineIds
      ) {
        cart {
          id
          checkoutUrl
          totalQuantity

          cost {
            subtotalAmount {
              amount
              currencyCode
            }

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

                    image {
                      url
                      altText
                    }

                    selectedOptions {
                      name
                      value
                    }

                    product {
                      title
                      handle

                      featuredImage {
                        url
                        altText
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

        userErrors {
          field
          message
        }
      }
    }
  `;

  const data = await shopifyFetch<{
    cartLinesRemove: {
      cart: any;
      userErrors: any[];
    };
  }>({
    query,
    variables: {
      cartId,
      lineIds,
    },
  });

  if (data.cartLinesRemove.userErrors?.length) {
    console.error(
      "Shopify cartLinesRemove errors:",
      data.cartLinesRemove.userErrors,
    );

    throw new Error(
      data.cartLinesRemove.userErrors[0]?.message ||
        "Unable to remove cart item.",
    );
  }

  return normalizeCartVariantImages(data.cartLinesRemove.cart);
}
