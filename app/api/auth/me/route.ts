import { NextRequest, NextResponse } from "next/server";

import { getCurrentCustomer } from "@/lib/customer-account";

export async function GET(request: NextRequest) {
  try {
    const accessToken = request.cookies.get(
      "shopify_customer_access_token",
    )?.value;

    if (!accessToken) {
      return NextResponse.json({
        authenticated: false,
        customer: null,
      });
    }

    const customer = await getCurrentCustomer(accessToken);

    if (!customer) {
      const response = NextResponse.json({
        authenticated: false,
        customer: null,
      });

      response.cookies.delete("shopify_customer_access_token");

      response.cookies.delete("shopify_customer_id_token");

      return response;
    }

    return NextResponse.json({
      authenticated: true,
      customer,
    });
  } catch (error) {
    console.error("Customer session error:", error);

    const response = NextResponse.json({
      authenticated: false,
      customer: null,
    });

    response.cookies.delete("shopify_customer_access_token");

    response.cookies.delete("shopify_customer_id_token");

    return response;
  }
}
