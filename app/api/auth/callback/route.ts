import { NextRequest, NextResponse } from "next/server";

import { exchangeCodeForToken } from "@/lib/customer-account";

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL || "https://six-opulence.vercel.app";
}

function decodeJwtPayload(token: string) {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return null;
    }

    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");

    return JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);

  const code = searchParams.get("code");

  const state = searchParams.get("state");

  const oauthError = searchParams.get("error");

  const siteUrl = getSiteUrl();

  /*
   * Shopify authentication cancelled
   */
  if (oauthError) {
    return NextResponse.redirect(`${siteUrl}/login?error=login_cancelled`);
  }

  /*
   * Missing callback data
   */
  if (!code || !state) {
    return NextResponse.redirect(`${siteUrl}/login?error=invalid_callback`);
  }

  /*
   * Read OAuth cookies
   */
  const savedState = request.cookies.get("shopify_auth_state")?.value;

  const codeVerifier = request.cookies.get("shopify_code_verifier")?.value;

  const savedNonce = request.cookies.get("shopify_auth_nonce")?.value;

  /*
   * Check state
   */
  if (!savedState || state !== savedState) {
    console.error("Shopify OAuth state mismatch.");

    return NextResponse.redirect(`${siteUrl}/login?error=invalid_state`);
  }

  /*
   * Check PKCE verifier
   */
  if (!codeVerifier) {
    return NextResponse.redirect(`${siteUrl}/login?error=missing_verifier`);
  }

  try {
    const redirectUri = `${siteUrl}/api/auth/callback`;

    /*
     * Exchange code for token
     */
    const tokenResponse = await exchangeCodeForToken({
      code,
      codeVerifier,
      redirectUri,
    });

    if (!tokenResponse.access_token) {
      throw new Error("Shopify did not return an access token.");
    }

    /*
     * Validate nonce
     */
    if (savedNonce && tokenResponse.id_token) {
      const payload = decodeJwtPayload(tokenResponse.id_token);

      if (!payload || payload.nonce !== savedNonce) {
        throw new Error("Invalid authentication nonce.");
      }
    }

    /*
     * Login successful
     */
    const response = NextResponse.redirect(`${siteUrl}/account`);

    const expiresIn = Number(tokenResponse.expires_in) || 3600;

    /*
     * Customer access token
     */
    response.cookies.set(
      "shopify_customer_access_token",
      tokenResponse.access_token,
      {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: expiresIn,
      },
    );

    /*
     * ID token
     */
    if (tokenResponse.id_token) {
      response.cookies.set(
        "shopify_customer_id_token",
        tokenResponse.id_token,
        {
          httpOnly: true,
          secure: true,
          sameSite: "lax",
          path: "/",
          maxAge: expiresIn,
        },
      );
    }

    /*
     * Remove temporary cookies
     */
    response.cookies.delete("shopify_auth_state");

    response.cookies.delete("shopify_code_verifier");

    response.cookies.delete("shopify_auth_nonce");

    return response;
  } catch (error) {
    console.error("Shopify callback error:", error);

    return NextResponse.redirect(
      `${siteUrl}/login?error=authentication_failed`,
    );
  }
}
