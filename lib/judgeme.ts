/* ============================================================
   JUDGE.ME API
============================================================ */

const JUDGEME_API_URL = "https://api.judge.me/api/v1";

const SHOP_DOMAIN =
  process.env.JUDGEME_SHOP_DOMAIN || process.env.SHOPIFY_STORE_DOMAIN || "";

const PRIVATE_API_TOKEN = process.env.JUDGEME_PRIVATE_API_TOKEN || "";

/* ============================================================
   TYPES
============================================================ */

type JudgeMePictureUrls = {
  original?: string | null;
  huge?: string | null;
  compact?: string | null;
  small?: string | null;
};

type JudgeMePicture = {
  urls?: JudgeMePictureUrls | null;
  url?: string | null;
  image_url?: string | null;
  src?: string | null;
  hidden?: boolean;
  [key: string]: unknown;
};

type JudgeMeReview = {
  id?: string | number;
  name?: string;
  email?: string;
  rating?: number;
  title?: string;
  body?: string;
  review?: string;
  created_at?: string;
  createdAt?: string;
  verified?: boolean | string;
  published?: boolean;
  hidden?: boolean;
  pictures?: Array<JudgeMePicture | string>;
  picture_urls?: string[];
  has_published_pictures?: boolean;
  reviewer?: {
    name?: string;
    email?: string;
  };
};

type JudgeMeProductResponse = {
  product?: {
    id?: string | number;
    external_id?: string | number;
    handle?: string;
  };
};

type JudgeMeReviewsResponse = {
  reviews?: JudgeMeReview[];
};

export type NormalizedReview = {
  id: string;
  name: string;
  email: string;
  rating: number;
  title: string;
  review: string;
  createdAt: string;
  verified: boolean;
  pictures: string[];
  hasPublishedPictures: boolean;
};

/* ============================================================
   CONFIG
============================================================ */

function getConfig() {
  if (!SHOP_DOMAIN) {
    throw new Error("Judge.me shop domain is missing.");
  }

  if (!PRIVATE_API_TOKEN) {
    throw new Error("Judge.me private API token is missing.");
  }

  return {
    shopDomain: SHOP_DOMAIN,
    apiToken: PRIVATE_API_TOKEN,
  };
}

/* ============================================================
   SHOPIFY GID → NUMERIC ID
============================================================ */

function getNumericShopifyProductId(productId: string) {
  if (!productId) {
    throw new Error("Product ID is missing.");
  }

  if (productId.startsWith("gid://shopify/Product/")) {
    return productId.replace("gid://shopify/Product/", "");
  }

  if (/^\d+$/.test(productId)) {
    return productId;
  }

  throw new Error("Invalid Shopify product ID.");
}

/* ============================================================
   URL HELPERS
============================================================ */

function normalizeUrl(url: unknown): string {
  if (typeof url !== "string") return "";

  const trimmed = url.trim();

  if (!trimmed) return "";

  // Protocol-relative URL (//cdn.example.com/...) → https
  if (trimmed.startsWith("//")) return `https:${trimmed}`;

  // Only allow http(s) URLs
  if (!/^https?:\/\//i.test(trimmed)) return "";

  return trimmed;
}

/* ============================================================
   GET PICTURE URL
   Judge.me format:
   { urls: { original, huge, compact, small }, hidden: false }
============================================================ */

function getPictureUrl(picture: unknown): string {
  if (!picture) return "";

  if (typeof picture === "string") {
    return normalizeUrl(picture);
  }

  if (typeof picture === "object") {
    const item = picture as JudgeMePicture;

    if (item.hidden === true) return "";

    const url =
      item.urls?.huge ||
      item.urls?.original ||
      item.urls?.compact ||
      item.urls?.small ||
      item.url ||
      item.image_url ||
      item.src ||
      "";

    return normalizeUrl(url);
  }

  return "";
}

/* ============================================================
   NORMALIZE REVIEW
============================================================ */

function normalizeReview(review: JudgeMeReview): NormalizedReview {
  const rawPictures = Array.isArray(review.pictures) ? review.pictures : [];

  const pictures = rawPictures.map(getPictureUrl).filter(Boolean);

  const fallbackPictures = Array.isArray(review.picture_urls)
    ? review.picture_urls.map(normalizeUrl).filter(Boolean)
    : [];

  // Remove duplicates
  const finalPictures = Array.from(
    new Set(pictures.length > 0 ? pictures : fallbackPictures),
  );

  const verified =
    typeof review.verified === "string"
      ? review.verified !== "" && review.verified !== "nothing"
      : Boolean(review.verified);

  return {
    id: String(review.id || ""),
    name: String(review.reviewer?.name || review.name || "Customer"),
    email: String(review.reviewer?.email || review.email || ""),
    rating: Number(review.rating || 0),
    title: String(review.title || ""),
    review: String(review.body || review.review || ""),
    createdAt: review.created_at || review.createdAt || "",
    verified,
    pictures: finalPictures,
    // Decide from actual pictures, not the API flag (often undefined)
    hasPublishedPictures: finalPictures.length > 0,
  };
}

/* ============================================================
   SAFE JSON PARSE
============================================================ */

async function parseJsonResponse<T>(
  response: Response,
  label: string,
): Promise<T> {
  const text = await response.text();

  try {
    return (text ? JSON.parse(text) : {}) as T;
  } catch {
    console.error(`JUDGE.ME ${label} RAW RESPONSE:`, text);
    throw new Error(`Invalid Judge.me ${label.toLowerCase()} response.`);
  }
}

/* ============================================================
   FIND JUDGE.ME PRODUCT
============================================================ */

async function findJudgeMeProduct(productId: string) {
  const { shopDomain, apiToken } = getConfig();

  const numericId = getNumericShopifyProductId(productId);

  const url =
    `${JUDGEME_API_URL}/products/-1` +
    `?api_token=${encodeURIComponent(apiToken)}` +
    `&shop_domain=${encodeURIComponent(shopDomain)}` +
    `&external_id=${encodeURIComponent(numericId)}`;

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  const data = await parseJsonResponse<JudgeMeProductResponse>(
    response,
    "PRODUCT",
  );

  if (!response.ok) {
    console.error("JUDGE.ME PRODUCT ERROR:", response.status, data);
    throw new Error("Unable to find Judge.me product.");
  }

  const internalProductId = data?.product?.id;

  if (!internalProductId) {
    throw new Error("Judge.me product was not found.");
  }

  return String(internalProductId);
}

/* ============================================================
   GET REVIEWS
============================================================ */

export async function getJudgeMeReviews(
  productId: string,
): Promise<NormalizedReview[]> {
  const { shopDomain, apiToken } = getConfig();

  const internalProductId = await findJudgeMeProduct(productId);

  const url =
    `${JUDGEME_API_URL}/reviews` +
    `?api_token=${encodeURIComponent(apiToken)}` +
    `&shop_domain=${encodeURIComponent(shopDomain)}` +
    `&product_id=${encodeURIComponent(internalProductId)}` +
    `&published=true` +
    `&per_page=100` +
    `&page=1`;

  const response = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  const data = await parseJsonResponse<JudgeMeReviewsResponse>(
    response,
    "REVIEWS",
  );

  if (!response.ok) {
    console.error("JUDGE.ME REVIEWS ERROR:", response.status, data);
    throw new Error("Unable to load Judge.me reviews.");
  }

  const reviews = Array.isArray(data.reviews) ? data.reviews : [];

  // Uncomment to debug image structure:
  // console.log(
  //   "JUDGE.ME RAW PICTURES:",
  //   JSON.stringify(reviews.map((r) => ({ id: r.id, pictures: r.pictures })), null, 2),
  // );

  return reviews
    .filter((review) => review.hidden !== true)
    .map(normalizeReview);
}

/* ============================================================
   CREATE REVIEW
============================================================ */

type CreateJudgeMeReviewInput = {
  productId: string;
  name: string;
  email: string;
  rating: number;
  body: string;
  title?: string;
  pictureUrls?: string[];
};

export async function createJudgeMeReview(input: CreateJudgeMeReviewInput) {
  const { shopDomain, apiToken } = getConfig();

  const numericProductId = getNumericShopifyProductId(input.productId);

  const pictureUrls = Array.isArray(input.pictureUrls)
    ? input.pictureUrls.map(normalizeUrl).filter(Boolean).slice(0, 5)
    : [];

  const payload: Record<string, unknown> = {
    api_token: apiToken,
    shop_domain: shopDomain,
    platform: "shopify",

    name: input.name,
    email: input.email,
    rating: input.rating,
    body: input.body,

    id: numericProductId,
  };

  if (input.title) {
    payload.title = input.title;
  }

  if (pictureUrls.length > 0) {
    payload.picture_urls = pictureUrls;
  }

  const response = await fetch(`${JUDGEME_API_URL}/reviews`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const text = await response.text();

  let data: unknown = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!response.ok) {
    console.error("JUDGE.ME CREATE ERROR:", response.status, data);
    throw new Error("Judge.me could not create the review.");
  }

  return data;
}
