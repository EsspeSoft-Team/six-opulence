import { shopifyFetch } from "@/lib/shopify";

export type AccessCollectionItem = {
  id: string;
  title: string;
  bgClass: string;
  bgImage: string;
  tag: string;

  productImage: string;
  productName: string;
  productPrice: string;
  productHandle: string;

  sortOrder: number;
  active: boolean;
};

type ShopifyImage = {
  url: string;
  altText: string | null;
};

type ShopifyProduct = {
  id: string;
  title: string;
  handle: string;

  featuredImage: ShopifyImage | null;

  priceRange: {
    minVariantPrice: {
      amount: string;
      currencyCode: string;
    };
  };
};

type AccessField = {
  key: string;
  value: string | null;

  reference:
    | {
        __typename: "Product";
        id: string;
        title: string;
        handle: string;

        featuredImage: ShopifyImage | null;

        priceRange: {
          minVariantPrice: {
            amount: string;
            currencyCode: string;
          };
        };
      }
    | {
        __typename: "MediaImage";
        image: ShopifyImage | null;
      }
    | null;
};

type AccessMetaobject = {
  id: string;
  handle: string;
  fields: AccessField[];
};

type AccessQueryResponse = {
  metaobjects: {
    nodes: AccessMetaobject[];
  };
};

/**
 * Get a field from Shopify Metaobject
 */
function getField(fields: AccessField[], key: string): AccessField | undefined {
  return fields.find((field) => field.key === key);
}

/**
 * Get normal text field
 */
function getTextField(fields: AccessField[], key: string): string {
  return getField(fields, key)?.value?.trim() || "";
}

/**
 * Get image from Image field
 */
function getImageUrl(fields: AccessField[], key: string): string | null {
  const field = getField(fields, key);

  if (!field?.reference || field.reference.__typename !== "MediaImage") {
    return null;
  }

  return field.reference.image?.url || null;
}

/**
 * Get Product Reference
 */
function getProduct(fields: AccessField[]): ShopifyProduct | null {
  const field = getField(fields, "product");

  if (!field?.reference || field.reference.__typename !== "Product") {
    return null;
  }

  return field.reference;
}

/**
 * Format Shopify price
 */
function formatPrice(amount: string, currencyCode: string): string {
  const number = Number(amount);

  if (Number.isNaN(number)) {
    return amount;
  }

  if (currencyCode === "INR") {
    return `₹${number.toLocaleString("en-IN", {
      maximumFractionDigits: 0,
    })}`;
  }

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currencyCode,
      maximumFractionDigits: 0,
    }).format(number);
  } catch {
    return amount;
  }
}

/**
 * Fetch Access Collection
 */
export async function getAccessCollections(): Promise<AccessCollectionItem[]> {
  const query = `
    query GetAccessCollections {
      metaobjects(
        type: "home_access_collection"
        first: 50
      ) {
        nodes {
          id
          handle

          fields {
            key
            value

            reference {
              __typename

              ... on Product {
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

              ... on MediaImage {
                image {
                  url
                  altText
                }
              }
            }
          }
        }
      }
    }
  `;

  try {
    const data = await shopifyFetch<AccessQueryResponse>({
      query,
    });

    const entries = data.metaobjects?.nodes || [];

    if (!entries.length) {
      return [];
    }

    const items: AccessCollectionItem[] = entries
      .map((entry) => {
        const fields = entry.fields;

        const title = getTextField(fields, "title");

        const tag = getTextField(fields, "tag");

        const bgClass = getTextField(fields, "background_class");

        const sortOrderValue = getTextField(fields, "sort_order");

        const activeValue = getTextField(fields, "active");

        const bgImage = getImageUrl(fields, "background_image");

        const product = getProduct(fields);

        if (!product) {
          return null;
        }

        const productImage = product.featuredImage?.url || "";

        const productPrice = formatPrice(
          product.priceRange.minVariantPrice.amount,
          product.priceRange.minVariantPrice.currencyCode,
        );

        const sortOrder = Number(sortOrderValue) || 0;

        const active = activeValue === "true";

        if (!title || !bgImage || !tag || !productImage) {
          return null;
        }

        return {
          id: entry.id,

          title,

          bgClass: bgClass || "bg-stable",

          bgImage,

          tag,

          productImage,

          productName: product.title,

          productPrice,

          productHandle: `/products/${product.handle}`,

          sortOrder,

          active,
        };
      })
      .filter((item): item is AccessCollectionItem => item !== null)
      .filter((item) => item.active)
      .sort((a, b) => a.sortOrder - b.sortOrder);

    return items;
  } catch (error) {
    console.error("Access Collection Shopify error:", error);

    return [];
  }
}
