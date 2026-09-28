import { NextRequest } from "next/server";
import PDFDocument from "pdfkit";
import { shopifyAdminFetch } from "@/lib/shopify-admin";

export const runtime = "nodejs";

async function getLoggedInCustomer(request: NextRequest) {
  const response = await fetch(new URL("/api/auth/me", request.url), {
    headers: {
      cookie: request.headers.get("cookie") || "",
    },
    cache: "no-store",
  });

  if (!response.ok) return null;

  const data = await response.json();

  return data.customer || null;
}

export async function GET(request: NextRequest) {
  try {
    const customer = await getLoggedInCustomer(request);

    if (!customer) {
      return new Response(
        JSON.stringify({
          error: "You must be logged in.",
        }),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const orderId = new URL(request.url).searchParams.get("id");

    if (!orderId) {
      return new Response(
        JSON.stringify({
          error: "Order ID is required.",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const customerEmail =
      customer.email || customer.emailAddress?.emailAddress || "";

    const data = await shopifyAdminFetch<{
      order: any;
    }>({
      query: `
        query GetInvoiceOrder(
          $id: ID!
        ) {
          order(id: $id) {
            id
            name
            orderNumber
            createdAt
            email

            displayFinancialStatus

            currentTotalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }

            subtotalPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }

            totalShippingPriceSet {
              shopMoney {
                amount
                currencyCode
              }
            }

            totalTaxSet {
              shopMoney {
                amount
                currencyCode
              }
            }

            shippingAddress {
              firstName
              lastName
              address1
              address2
              city
              province
              country
              zip
              phone
            }

            lineItems(first: 50) {
              edges {
                node {
                  title
                  quantity

                  originalUnitPriceSet {
                    shopMoney {
                      amount
                      currencyCode
                    }
                  }
                }
              }
            }
          }
        }
      `,
      variables: {
        id: orderId,
      },
    });

    const order = data.order;

    if (!order) {
      return new Response(
        JSON.stringify({
          error: "Order not found.",
        }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    if (order.email?.toLowerCase() !== customerEmail.toLowerCase()) {
      return new Response(
        JSON.stringify({
          error: "You cannot access this order.",
        }),
        {
          status: 403,
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
    }

    const doc = new PDFDocument({
      size: "A4",
      margin: 50,
    });

    const chunks: Buffer[] = [];

    doc.on("data", (chunk) => {
      chunks.push(chunk);
    });

    const pdfPromise = new Promise<Buffer>((resolve, reject) => {
      doc.on("end", () => {
        resolve(Buffer.concat(chunks));
      });

      doc.on("error", reject);
    });

    /* =====================================================
       PDF HEADER
    ===================================================== */

    doc.fontSize(24).font("Helvetica-Bold").text("OPULENCE");

    doc.fontSize(9).font("Helvetica").text("ORDER INVOICE");

    doc.moveDown();

    doc.fontSize(11).font("Helvetica-Bold").text(`Order: ${order.name}`);

    doc
      .fontSize(9)
      .font("Helvetica")
      .text(`Date: ${new Date(order.createdAt).toLocaleDateString("en-IN")}`);

    doc.moveDown();

    /* =====================================================
       CUSTOMER
    ===================================================== */

    doc.fontSize(11).font("Helvetica-Bold").text("BILL TO");

    const address = order.shippingAddress;

    if (address) {
      doc
        .fontSize(9)
        .font("Helvetica")
        .text(
          [
            `${address.firstName || ""} ${address.lastName || ""}`.trim(),
            address.address1,
            address.address2,
            `${address.city || ""}, ${address.province || ""}`,
            `${address.country || ""} ${address.zip || ""}`,
            address.phone,
          ]
            .filter(Boolean)
            .join("\n"),
        );
    }

    doc.moveDown();

    /* =====================================================
       ITEMS
    ===================================================== */

    doc.fontSize(11).font("Helvetica-Bold").text("ITEMS");

    doc.moveDown(0.5);

    for (const edge of order.lineItems.edges) {
      const item = edge.node;

      const price = Number(item.originalUnitPriceSet?.shopMoney?.amount || 0);

      const quantity = Number(item.quantity || 0);

      const total = price * quantity;

      doc.fontSize(9).font("Helvetica").text(`${item.title}  x${quantity}`);

      doc
        .fontSize(9)
        .text(
          `${order.currentTotalPriceSet?.shopMoney?.currencyCode || "INR"} ${total.toFixed(
            2,
          )}`,
          {
            align: "right",
          },
        );

      doc.moveDown(0.5);
    }

    doc.moveDown();

    /* =====================================================
       TOTALS
    ===================================================== */

    const currency =
      order.currentTotalPriceSet?.shopMoney?.currencyCode || "INR";

    const subtotal = order.subtotalPriceSet?.shopMoney?.amount || "0";

    const shipping = order.totalShippingPriceSet?.shopMoney?.amount || "0";

    const tax = order.totalTaxSet?.shopMoney?.amount || "0";

    const total = order.currentTotalPriceSet?.shopMoney?.amount || "0";

    doc
      .fontSize(9)
      .text(`Subtotal: ${currency} ${Number(subtotal).toFixed(2)}`);

    doc.text(`Shipping: ${currency} ${Number(shipping).toFixed(2)}`);

    doc.text(`Tax: ${currency} ${Number(tax).toFixed(2)}`);

    doc.moveDown();

    doc
      .fontSize(13)
      .font("Helvetica-Bold")
      .text(`TOTAL: ${currency} ${Number(total).toFixed(2)}`);

    doc.moveDown(2);

    doc
      .fontSize(8)
      .font("Helvetica")
      .text("Thank you for shopping with OPULENCE.");

    doc.end();

    const buffer = await pdfPromise;

    return new Response(new Uint8Array(buffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="OPULENCE-${order.name.replace(
          /[^a-zA-Z0-9-_]/g,
          "",
        )}-invoice.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("INVOICE ERROR:", error);

    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "Unable to generate invoice.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
