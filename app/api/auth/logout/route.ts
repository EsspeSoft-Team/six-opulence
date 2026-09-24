import { NextRequest, NextResponse } from "next/server";

import { getShopifyLogoutUrl } from "@/lib/customer-account";

export async function POST(request: NextRequest) {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://six-opulence.vercel.app";

  const idToken = request.cookies.get("shopify_customer_id_token")?.value;

  const loginUrl = `${siteUrl}/login`;

  let logoutUrl = loginUrl;

  try {
    logoutUrl = await getShopifyLogoutUrl({
      postLogoutRedirectUri: loginUrl,

      idTokenHint: idToken,
    });
  } catch (error) {
    console.error("Shopify logout URL error:", error);
  }

  const response = NextResponse.json({
    success: true,
    url: logoutUrl,
  });

  response.cookies.delete("shopify_customer_access_token");

  response.cookies.delete("shopify_customer_id_token");

  response.cookies.delete("shopify_auth_state");

  response.cookies.delete("shopify_code_verifier");

  response.cookies.delete("shopify_auth_nonce");

  return response;
}
