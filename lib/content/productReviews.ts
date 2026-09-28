import "server-only";

import { shopifyFetch } from "@/lib/shopify";

/* =========================================================
   PRODUCT REVIEW TYPE
========================================================= */

export type ProductReview = {
  id: string;

  name: string;

  email: string;

  title: string;

  rating: number;

  review: string;

  approved: boolean;

  verified: boolean;

  image: string | null;

  pictures: string[];

  createdAt: string;
};

/* =========================================================
   SHOPIFY METAOBJECT FIELD
========================================================= */

type ReviewField = {
  key: string;

  value: string | null;

  reference?: {
    __typename: string;

    id?: string;

    image?: {
      url: string;

      altText: string | null;
    } | null;

    url?: string;
  } | null;
};

/* =========================================================
   SHOPIFY RESPONSE
========================================================= */

type ShopifyReviewResponse = {
  metaobjects: {
    nodes: Array<{
      id: string;

      fields: ReviewField[];
    }>;
  };
};

/* =========================================================
   PRODUCT REVIEWS QUERY
========================================================= */

const PRODUCT_REVIEWS_QUERY = `
  query ProductReviews {

    metaobjects(
      type: "customer_product_review"
      first: 100
      reverse: true
      sortKey: UPDATED_AT
    ) {

      nodes {

        id

        fields {

          key

          value

          reference {

            __typename

            ... on Product {
              id
            }

            ... on MediaImage {

              id

              image {
                url
                altText
              }

            }

            ... on GenericFile {

              id

              url

            }

          }

        }

      }

    }

  }
`;

/* =========================================================
   SAFE STRING
========================================================= */

function getFieldValue(
  fields: Record<string, ReviewField>,
  key: string,
): string {
  return fields[key]?.value?.trim() || "";
}

/* =========================================================
   SAFE BOOLEAN
========================================================= */

function getBooleanField(
  fields: Record<string, ReviewField>,
  key: string,
): boolean {
  const value = getFieldValue(fields, key);

  return value === "true" || value === "1" || value === "yes";
}

/* =========================================================
   SAFE RATING
========================================================= */

function getRating(fields: Record<string, ReviewField>): number {
  const rawRating = Number(getFieldValue(fields, "rating") || 0);

  if (!Number.isFinite(rawRating)) {
    return 0;
  }

  return Math.min(5, Math.max(0, Math.round(rawRating)));
}

/* =========================================================
   GET IMAGE URL
========================================================= */

function getImageUrl(field?: ReviewField): string | null {
  if (!field) {
    return null;
  }

  const reference = field.reference;

  if (!reference) {
    return null;
  }

  /* -------------------------------------------------------
     MEDIA IMAGE
  ------------------------------------------------------- */

  if (reference.__typename === "MediaImage") {
    return reference.image?.url || null;
  }

  /* -------------------------------------------------------
     GENERIC FILE
  ------------------------------------------------------- */

  if (reference.__typename === "GenericFile") {
    return reference.url || null;
  }

  return null;
}

/* =========================================================
   GET PRODUCT REVIEWS
========================================================= */

export async function getProductReviews(
  productId: string,
): Promise<ProductReview[]> {
  try {
    if (!productId) {
      return [];
    }

    /* =====================================================
       FETCH METAOBJECTS
    ===================================================== */

    const data = await shopifyFetch<ShopifyReviewResponse>({
      query: PRODUCT_REVIEWS_QUERY,
    });

    const nodes = data?.metaobjects?.nodes || [];

    if (!nodes.length) {
      return [];
    }

    const reviews: ProductReview[] = [];

    /* =====================================================
       LOOP REVIEWS
    ===================================================== */

    for (const item of nodes) {
      if (!item?.id) {
        continue;
      }

      /* ===================================================
         CREATE FIELD MAP
      =================================================== */

      const fields = Object.fromEntries(
        item.fields.map((field) => [field.key, field]),
      ) as Record<string, ReviewField>;

      /* ===================================================
         PRODUCT
      =================================================== */

      const productReference = fields.product?.reference;

      if (productReference?.__typename !== "Product") {
        continue;
      }

      /* ===================================================
         PRODUCT MATCH
      =================================================== */

      if (productReference.id !== productId) {
        continue;
      }

      /* ===================================================
         APPROVAL
      =================================================== */

      const approved = getBooleanField(fields, "approved");

      /*
       * Only approved reviews
       * are shown on the website.
       */

      if (!approved) {
        continue;
      }

      /* ===================================================
         CUSTOMER NAME
      =================================================== */

      const name = getFieldValue(fields, "customer_name") || "Customer";

      /* ===================================================
         EMAIL
      =================================================== */

      const email = getFieldValue(fields, "email");

      /* ===================================================
         REVIEW TITLE
      =================================================== */

      const title = getFieldValue(fields, "title");

      /* ===================================================
         RATING
      =================================================== */

      const rating = getRating(fields);

      /* ===================================================
         REVIEW BODY
      =================================================== */

      const review = getFieldValue(fields, "review");

      /*
       * Don't render empty reviews.
       */

      if (!review) {
        continue;
      }

      /* ===================================================
         VERIFIED
      =================================================== */

      const verified = getBooleanField(fields, "verified");

      /* ===================================================
         IMAGE
      =================================================== */

      const image = getImageUrl(fields.image);

      /* ===================================================
         PICTURES
      =================================================== */

      const pictures: string[] = image ? [image] : [];

      /*
       * If your metaobject later contains
       * multiple image references, they can
       * be added here without changing the
       * frontend response structure.
       */

      /* ===================================================
         CREATED AT
      =================================================== */

      const createdAt =
        getFieldValue(fields, "created_at") ||
        getFieldValue(fields, "createdAt") ||
        "";

      /* ===================================================
         FINAL REVIEW OBJECT
      =================================================== */

      reviews.push({
        id: item.id,

        name,

        email,

        title,

        rating,

        review,

        approved: true,

        verified,

        image,

        pictures,

        createdAt,
      });
    }

    /* =====================================================
       SORT NEWEST FIRST
    ===================================================== */

    reviews.sort((a, b) => {
      if (!a.createdAt || !b.createdAt) {
        return 0;
      }

      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return reviews;
  } catch (error) {
    console.error("GET PRODUCT REVIEWS ERROR:", error);

    return [];
  }
}
