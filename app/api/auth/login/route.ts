import { NextRequest, NextResponse } from "next/server";

import {
  createShopifyAuthorizationUrl,
  generateCodeChallenge,
  generateCodeVerifier,
  generateNonce,
  generateState,
} from "@/lib/customer-account";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const email = typeof body?.email === "string" ? body.email.trim() : "";

    if (!email) {
      return NextResponse.json(
        {
          success: false,
          error: "Please enter your email address.",
        },
        {
          status: 400,
        },
      );
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL || "https://six-opulence.vercel.app";

    const redirectUri = `${siteUrl}/api/auth/callback`;

    /*
     * Generate PKCE
     */
    const codeVerifier = generateCodeVerifier();

    const codeChallenge = generateCodeChallenge(codeVerifier);

    /*
     * Generate OAuth security values
     */
    const state = generateState();

    const nonce = generateNonce();

    /*
     * Create Shopify URL
     *
     * IMPORTANT:
     * email is passed here.
     */
    const authorizationUrl = await createShopifyAuthorizationUrl({
      email,
      redirectUri,
      state,
      nonce,
      codeChallenge,
    });

    const response = NextResponse.json({
      success: true,
      url: authorizationUrl,
    });

    /*
     * OAuth state cookie
     */
    response.cookies.set("shopify_auth_state", state, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });

    /*
     * PKCE verifier cookie
     */
    response.cookies.set("shopify_code_verifier", codeVerifier, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });

    /*
     * Nonce cookie
     */
    response.cookies.set("shopify_auth_nonce", nonce, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 600,
    });

    return response;
  } catch (error) {
    console.error("Shopify login error:", error);

    return NextResponse.json(
      {
        success: false,
        error: "Unable to start login. Please try again.",
      },
      {
        status: 500,
      },
    );
  }
}
