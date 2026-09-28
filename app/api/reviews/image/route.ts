import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const ALLOWED_HOSTS = [
  "judge.me",
  "cdn.judge.me",
  "api.judge.me",
  "shopify.com",
  "cdn.shopify.com",
];

function isAllowedImageHost(hostname: string) {
  const host = hostname.toLowerCase();

  if (ALLOWED_HOSTS.includes(host)) {
    return true;
  }

  return (
    host.endsWith(".judge.me") ||
    host.endsWith(".shopify.com") ||
    host.endsWith(".myshopify.com")
  );
}

export async function GET(request: NextRequest) {
  try {
    const imageUrl = request.nextUrl.searchParams.get("url");

    if (!imageUrl) {
      return new NextResponse("Missing image URL", {
        status: 400,
      });
    }

    let target: URL;

    try {
      target = new URL(imageUrl);
    } catch {
      return new NextResponse("Invalid image URL", {
        status: 400,
      });
    }

    if (target.protocol !== "https:") {
      return new NextResponse("Only HTTPS images are allowed", {
        status: 400,
      });
    }

    if (!isAllowedImageHost(target.hostname)) {
      return new NextResponse("Image host is not allowed", {
        status: 403,
      });
    }

    const response = await fetch(target.toString(), {
      method: "GET",
      headers: {
        Accept:
          "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "User-Agent": "Mozilla/5.0",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        "REVIEW IMAGE FETCH ERROR:",
        response.status,
        target.toString(),
      );

      return new NextResponse("Unable to load review image", {
        status: response.status,
      });
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";

    const body = await response.arrayBuffer();

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error("REVIEW IMAGE PROXY ERROR:", error);

    return new NextResponse("Unable to load review image", {
      status: 500,
    });
  }
}
