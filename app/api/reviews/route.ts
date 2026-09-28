import { NextRequest, NextResponse } from "next/server";

import { createJudgeMeReview, getJudgeMeReviews } from "@/lib/judgeme";

import { shopifyAdminFetch } from "@/lib/shopify-admin";
import { shopifyFetch } from "@/lib/shopify";

export const runtime = "nodejs";

/* ============================================================
   CONFIG
============================================================ */

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;

const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

/* ============================================================
   TYPES
============================================================ */

type ShopifyProductResponse = {
  productByHandle: {
    id: string;
    handle: string;
  } | null;
};

type StagedUpload = {
  url: string;
  resourceUrl: string;
  parameters: {
    name: string;
    value: string;
  }[];
};

type StagedUploadsCreateResponse = {
  stagedUploadsCreate: {
    stagedTargets: StagedUpload[];
    userErrors: {
      field?: string[];
      message: string;
    }[];
  };
};

type FileCreateResponse = {
  fileCreate: {
    files: {
      id: string;
      alt?: string | null;
      createdAt?: string | null;
    }[];
    userErrors: {
      field?: string[];
      message: string;
    }[];
  };
};

type FileNodeResponse = {
  node: {
    id: string;
    url?: string | null;
    image?: {
      url?: string | null;
    } | null;
  } | null;
};

/* ============================================================
   ERROR
============================================================ */

function errorResponse(message: string, status = 400) {
  return NextResponse.json(
    {
      success: false,
      error: message,
    },
    {
      status,
    },
  );
}

/* ============================================================
   RESOLVE PRODUCT
   Supports:
   - gid://shopify/Product/123
   - short
   - any Shopify product handle
============================================================ */

async function resolveProductId(productValue: string) {
  const value = productValue.trim();

  if (value.startsWith("gid://shopify/Product/")) {
    return value;
  }

  if (!value) {
    throw new Error("Product information is missing.");
  }

  const query = `
    query GetProductByHandle(
      $handle: String!
    ) {
      productByHandle(
        handle: $handle
      ) {
        id
        handle
      }
    }
  `;

  const data = await shopifyFetch<ShopifyProductResponse>({
    query,
    variables: {
      handle: value,
    },
  });

  const product = data?.productByHandle;

  if (!product?.id) {
    throw new Error(`Shopify product "${value}" was not found.`);
  }

  return product.id;
}

/* ============================================================
   ADMIN GRAPHQL
============================================================ */

async function adminGraphQL<T>(
  query: string,
  variables?: Record<string, unknown>,
) {
  return shopifyAdminFetch<T>({
    query,
    variables,
  });
}

/* ============================================================
   UPLOAD IMAGE TO SHOPIFY
============================================================ */

async function uploadReviewImage(file: File) {
  /* ----------------------------------------------------------
     STEP 1
     STAGED UPLOAD
  ---------------------------------------------------------- */

  const stagedMutation = `
    mutation stagedUploadsCreate(
      $input: [StagedUploadInput!]!
    ) {
      stagedUploadsCreate(
        input: $input
      ) {
        stagedTargets {
          url
          resourceUrl
          parameters {
            name
            value
          }
        }

        userErrors {
          field
          message
        }
      }
    }
  `;

  const stagedData = await adminGraphQL<StagedUploadsCreateResponse>(
    stagedMutation,
    {
      input: [
        {
          filename: file.name,
          mimeType: file.type,
          httpMethod: "POST",
          resource: "FILE",
        },
      ],
    },
  );

  const stagedResult = stagedData.stagedUploadsCreate;

  if (stagedResult.userErrors?.length) {
    throw new Error(
      stagedResult.userErrors.map((item) => item.message).join(", "),
    );
  }

  const target = stagedResult.stagedTargets?.[0];

  if (!target) {
    throw new Error("Shopify did not return an upload target.");
  }

  /* ----------------------------------------------------------
     STEP 2
     UPLOAD BROWSER FILE
  ---------------------------------------------------------- */

  const uploadForm = new FormData();

  for (const parameter of target.parameters) {
    uploadForm.append(parameter.name, parameter.value);
  }

  uploadForm.append("file", file);

  const uploadResponse = await fetch(target.url, {
    method: "POST",
    body: uploadForm,
  });

  if (!uploadResponse.ok) {
    const uploadText = await uploadResponse.text();

    console.error("SHOPIFY IMAGE UPLOAD ERROR:", uploadText);

    throw new Error("Unable to upload review image.");
  }

  /* ----------------------------------------------------------
     STEP 3
     CREATE SHOPIFY FILE
  ---------------------------------------------------------- */

  const fileCreateMutation = `
    mutation fileCreate(
      $files: [FileCreateInput!]!
    ) {
      fileCreate(
        files: $files
      ) {
        files {
          id
          alt
          createdAt
        }

        userErrors {
          field
          message
        }
      }
    }
  `;

  const fileData = await adminGraphQL<FileCreateResponse>(fileCreateMutation, {
    files: [
      {
        alt: "Customer review image",
        contentType: "IMAGE",
        originalSource: target.resourceUrl,
      },
    ],
  });

  const fileResult = fileData.fileCreate;

  if (fileResult.userErrors?.length) {
    throw new Error(
      fileResult.userErrors.map((item) => item.message).join(", "),
    );
  }

  const createdFile = fileResult.files?.[0];

  if (!createdFile?.id) {
    throw new Error("Shopify did not create the review image file.");
  }

  /* ----------------------------------------------------------
     STEP 4
     GET PUBLIC CDN URL
  ---------------------------------------------------------- */

  const nodeQuery = `
    query getFile(
      $id: ID!
    ) {
      node(id: $id) {
        id

        ... on MediaImage {
          image {
            url
          }
        }

        ... on GenericFile {
          url
        }
      }
    }
  `;

  let publicUrl: string | null = null;

  for (let attempt = 0; attempt < 15; attempt++) {
    const nodeData = await adminGraphQL<FileNodeResponse>(nodeQuery, {
      id: createdFile.id,
    });

    const node = nodeData?.node;

    publicUrl = node?.image?.url || node?.url || null;

    if (publicUrl) {
      break;
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  if (!publicUrl) {
    throw new Error(
      "Shopify uploaded the image but did not return a public image URL.",
    );
  }

  console.log("SHOPIFY REVIEW IMAGE URL:", publicUrl);

  return publicUrl;
}

/* ============================================================
   GET REVIEWS
============================================================ */

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const productValue = searchParams.get("productId");

    if (!productValue) {
      return errorResponse("Product information is missing.", 400);
    }

    const productId = await resolveProductId(productValue);

    console.log("REVIEWS PRODUCT RESOLVED:", {
      input: productValue,
      productId,
    });

    const reviews = await getJudgeMeReviews(productId);

    return NextResponse.json(
      {
        success: true,
        reviews,
      },
      {
        status: 200,
      },
    );
  } catch (error) {
    console.error("GET REVIEWS ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        reviews: [],
        error:
          error instanceof Error ? error.message : "Unable to load reviews.",
      },
      {
        status: 500,
      },
    );
  }
}

/* ============================================================
   POST REVIEW
============================================================ */

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const productValue = String(formData.get("productId") || "").trim();

    const name = String(formData.get("name") || "").trim();

    const email = String(formData.get("email") || "").trim();

    const title = String(formData.get("title") || "").trim();

    const review = String(formData.get("review") || "").trim();

    const ratingValue = String(formData.get("rating") || "").trim();

    const honeypot = String(formData.get("website") || "").trim();

    /* ----------------------------------------------------------
       BOT PROTECTION
    ---------------------------------------------------------- */

    if (honeypot) {
      return NextResponse.json({
        success: true,
        message: "Review submitted.",
      });
    }

    /* ----------------------------------------------------------
       PRODUCT
    ---------------------------------------------------------- */

    if (!productValue) {
      return errorResponse("Product information is missing.");
    }

    const productId = await resolveProductId(productValue);

    /* ----------------------------------------------------------
       NAME
    ---------------------------------------------------------- */

    if (!name) {
      return errorResponse("Please enter your name.");
    }

    if (name.length > 100) {
      return errorResponse("Name is too long.");
    }

    /* ----------------------------------------------------------
       EMAIL
    ---------------------------------------------------------- */

    if (!email) {
      return errorResponse("Please enter your email.");
    }

    if (email.length > 200) {
      return errorResponse("Email is too long.");
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
      return errorResponse("Please enter a valid email address.");
    }

    /* ----------------------------------------------------------
       REVIEW
    ---------------------------------------------------------- */

    if (!review) {
      return errorResponse("Please write your review.");
    }

    if (review.length > 3000) {
      return errorResponse("Review is too long.");
    }

    /* ----------------------------------------------------------
       TITLE
    ---------------------------------------------------------- */

    if (title.length > 200) {
      return errorResponse("Review title is too long.");
    }

    /* ----------------------------------------------------------
       RATING
    ---------------------------------------------------------- */

    const rating = Number(ratingValue);

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return errorResponse("Please select a valid rating.");
    }

    /* ----------------------------------------------------------
       IMAGE
    ---------------------------------------------------------- */

    const imageEntry = formData.get("image");

    let imageFile: File | null = null;

    if (imageEntry instanceof File && imageEntry.size > 0) {
      imageFile = imageEntry;
    }

    if (imageFile) {
      if (!ALLOWED_IMAGE_TYPES.includes(imageFile.type)) {
        return errorResponse("Only JPG, PNG and WEBP images are allowed.");
      }

      if (imageFile.size > MAX_IMAGE_SIZE) {
        return errorResponse("Image size must be 5MB or less.");
      }
    }

    /* ----------------------------------------------------------
       UPLOAD IMAGE
    ---------------------------------------------------------- */

    let pictureUrls: string[] = [];

    if (imageFile) {
      const imageUrl = await uploadReviewImage(imageFile);

      pictureUrls = [imageUrl];
    }

    console.log("REVIEW PICTURE URLS:", pictureUrls);

    /* ----------------------------------------------------------
       CREATE JUDGE.ME REVIEW
    ---------------------------------------------------------- */

    const createdReview = await createJudgeMeReview({
      productId,
      name,
      email,
      rating,
      body: review,
      title: title || undefined,
      pictureUrls,
    });

    return NextResponse.json(
      {
        success: true,

        message:
          "Thank you. Your review has been submitted and is awaiting approval.",

        review: createdReview || null,
      },
      {
        status: 201,
      },
    );
  } catch (error) {
    console.error("CREATE REVIEW ERROR:", error);

    return NextResponse.json(
      {
        success: false,

        error:
          error instanceof Error ? error.message : "Unable to submit review.",
      },
      {
        status: 500,
      },
    );
  }
}
