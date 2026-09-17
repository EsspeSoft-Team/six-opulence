/**
 * Shopify Storefront API client
 * ------------------------------
 * Shopify Storefront API-r sathe connect korar central file.
 *
 * MOCK MODE:
 * Shopify credentials na thakle mock-data theke demo data use korbe.
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

// Credentials na thakle mock mode
const USE_MOCK = !domain || !storefrontAccessToken;

const endpoint = domain
  ? `https://${domain}/api/${apiVersion}/graphql.json`
  : "";

type ShopifyFetchParams = {
  query: string;
  variables?: Record<string, unknown>;
};

/* ===========================================================
   CORE SHOPIFY FETCH
=========================================================== */

export async function shopifyFetch<T>({
  query,
  variables,
}: ShopifyFetchParams): Promise<T> {
  if (!domain || !storefrontAccessToken) {
    throw new Error("Shopify env variables missing. .env.local check koro.");
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

  const json = await response.json();

  if (!response.ok) {
    console.error("Shopify HTTP Error:", JSON.stringify(json, null, 2));

    throw new Error("Shopify Storefront API request failed.");
  }

  if (json.errors) {
    console.error("Shopify API Error:", JSON.stringify(json.errors, null, 2));

    throw new Error(
      json.errors?.[0]?.message || "Shopify Storefront API request failed.",
    );
  }

  return json.data as T;
}

/* ===========================================================
   PRODUCTS
=========================================================== */

/**
 * Get all products
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

/**
 * Get single product by handle
 */
export async function getProductByHandle(handle: string) {
  /* MOCK */

  if (USE_MOCK) {
    const product = mockProducts.find((p) => p.handle === handle);

    if (!product) {
      return null;
    }

    return {
      ...product,

      images: {
        edges: (product.images?.edges || []).slice(0, 10),
      },
    };
  }

  /* REAL SHOPIFY */

  const query = `
    query getProduct($handle: String!) {
      product(handle: $handle) {
        id
        title
        handle
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

              image {
                url
                altText
              }
            }
          }
        }
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

/* ===========================================================
   COLLECTIONS
=========================================================== */

/**
 * Get collections
 */
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

/**
 * Get collection by handle
 */
export async function getCollectionByHandle(handle: string, first = 24) {
  if (USE_MOCK) {
    const collection = mockCollections.find((c) => c.handle === handle);

    return collection || null;
  }

  const query = `
    query getCollection(
      $handle: String!
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

/* ===========================================================
   NEW ARRIVALS
=========================================================== */

export async function getNewArrivals(first = 12) {
  if (USE_MOCK) {
    return [...mockProducts].reverse().slice(0, first);
  }

  const query = `
    query getNewArrivals($first: Int!) {
      products(
        first: $first
        sortKey: CREATED_AT
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

/* ===========================================================
   RELATED PRODUCTS
=========================================================== */

export async function getRelatedProducts(productId: string) {
  if (USE_MOCK) {
    return mockProducts.filter((p) => p.id !== productId).slice(0, 10);
  }

  const query = `
    query getRelated($productId: ID!) {
      productRecommendations(
        productId: $productId
      ) {
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

  const data = await shopifyFetch<{
    productRecommendations: any[];
  }>({
    query,
    variables: {
      productId,
    },
  });

  return data.productRecommendations || [];
}

/* ===========================================================
   SEARCH
=========================================================== */

export async function searchProducts(searchTerm: string, first = 20) {
  if (USE_MOCK) {
    const term = searchTerm.toLowerCase();

    return mockProducts
      .filter(
        (p) =>
          p.title.toLowerCase().includes(term) ||
          p.productType.toLowerCase().includes(term),
      )
      .slice(0, first);
  }

  const query = `
    query searchProducts(
      $query: String!
      $first: Int!
    ) {
      products(
        first: $first
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
      query: searchTerm,
      first,
    },
  });

  return data.products.edges.map((edge) => edge.node);
}

/* ===========================================================
   BEST SELLERS
=========================================================== */

export async function getBestSellers(first = 8) {
  if (USE_MOCK) {
    return mockProducts.slice(0, first);
  }

  const query = `
    query getBestSellers($first: Int!) {
      products(
        first: $first
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

/* ===========================================================
   PRODUCTS BY TYPE
=========================================================== */

export async function getProductsByType(productType: string, first = 8) {
  if (USE_MOCK) {
    return mockProducts
      .filter((p) => p.productType === productType)
      .slice(0, first);
  }

  const query = `
    query getProductsByType(
      $query: String!
      $first: Int!
    ) {
      products(
        first: $first
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

/* ===========================================================
   CUSTOMER AUTH
=========================================================== */

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
      customerCreate(
        input: $input
      ) {
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

/* ===========================================================
   CUSTOMER LOGIN
=========================================================== */

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

/* ===========================================================
   CUSTOMER LOGOUT
=========================================================== */

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

/* ===========================================================
   GET CUSTOMER
=========================================================== */

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
          first: 20
          sortKey: PROCESSED_AT
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

/* ===========================================================
   FORGOT PASSWORD
=========================================================== */

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
      customerRecover(
        email: $email
      ) {
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

/* ===========================================================
   CART
=========================================================== */

/**
 * Create new cart
 */
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

                    product {
                      id
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
    cartCreate: {
      cart: any;
      userErrors: {
        field: string[];
        message: string;
      }[];
    };
  }>({
    query,
  });

  if (data.cartCreate.userErrors?.length) {
    throw new Error(data.cartCreate.userErrors[0].message);
  }

  return data.cartCreate.cart;
}

/**
 * Add item to cart
 */
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
      $cartId: ID!
      $lines: [CartLineInput!]!
    ) {
      cartLinesAdd(
        cartId: $cartId
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

                    product {
                      id
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
    cartLinesAdd: {
      cart: any;
      userErrors: {
        field: string[];
        message: string;
      }[];
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
    throw new Error(data.cartLinesAdd.userErrors[0].message);
  }

  return data.cartLinesAdd.cart;
}

/**
 * Get existing cart
 */
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

                  product {
                    id
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

  return data.cart;
}

/**
 * Remove item from cart
 *
 * lineId = Shopify cart line id
 */
export async function removeFromCart(cartId: string, lineId: string) {
  if (!cartId) {
    throw new Error("Cart ID is required.");
  }

  if (!lineId) {
    throw new Error("Cart line ID is required.");
  }

  /* =======================================================
     MOCK MODE
  ======================================================= */

  if (USE_MOCK) {
    const currentCart = mockGetCart();

    if (!currentCart) {
      return null;
    }

    const currentEdges = currentCart.lines?.edges || [];

    const updatedEdges = currentEdges.filter(
      (edge: any) => edge.node.id !== lineId,
    );

    const totalQuantity = updatedEdges.reduce(
      (total: number, edge: any) => total + Number(edge.node.quantity || 0),
      0,
    );

    return {
      ...currentCart,

      totalQuantity,

      lines: {
        ...currentCart.lines,
        edges: updatedEdges,
      },
    };
  }

  /* =======================================================
     REAL SHOPIFY
  ======================================================= */

  const query = `
    mutation cartLinesRemove(
      $cartId: ID!
      $lineIds: [ID!]!
    ) {
      cartLinesRemove(
        cartId: $cartId
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

                    product {
                      id
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

      userErrors: {
        field: string[];
        message: string;
      }[];
    };
  }>({
    query,

    variables: {
      cartId,

      lineIds: [lineId],
    },
  });

  if (data.cartLinesRemove.userErrors?.length) {
    throw new Error(data.cartLinesRemove.userErrors[0].message);
  }

  return data.cartLinesRemove.cart;
}
