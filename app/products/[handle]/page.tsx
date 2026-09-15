import "./product-detail.css";
import Image from "next/image";
import Link from "next/link";

import { getProductByHandle } from "@/lib/shopify";
import AddToCartButton from "@/components/AddToCartButton";
import RelatedProducts from "@/components/RelatedProducts";

export default async function ProductPage({
  params,
}: {
  params: { handle: string };
}) {
  const product = await getProductByHandle(params.handle);

  if (!product) {
    return (
      <div className="container">
        <p>Product not found.</p>
      </div>
    );
  }

  const firstVariant = product.variants.edges[0]?.node;

  return (
    <div className="container-fluid">
      {/* =========================
          BREADCRUMB
      ========================== */}

      <nav className="pdp-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>
        <span>/</span>

        <Link href="/collections/all">Shop</Link>

        <span>/</span>

        <span>{product.title}</span>
      </nav>

      {/* =========================
          PRODUCT AREA
      ========================== */}

      <div className="pdp">
        {/* =========================
            LEFT — PRODUCT IMAGES
        ========================== */}

        <div className="pdp-images">
          {product.images.edges.slice(0, 10).map((edge: any, i: number) => (
            <div key={`${edge.node.url}-${i}`} className="pdp-image">
              <Image
                src={edge.node.url}
                alt={edge.node.altText || `${product.title} ${i + 1}`}
                fill
                sizes="(max-width: 768px) 90vw, 55vw"
                priority={i < 2}
                style={{
                  objectFit: "cover",
                }}
              />
            </div>
          ))}
        </div>

        {/* =========================
            RIGHT — PRODUCT DETAILS
        ========================== */}

        <aside className="page-right">
          {/* BRAND */}

          <div className="pdp-brand">OPULENCE</div>

          {/* TITLE */}

          <h1 className="pdp-title">{product.title}</h1>

          {/* PRICE */}

          <p className="pdp-price">
            {firstVariant?.price.currencyCode} {firstVariant?.price.amount}
          </p>

          {/* =========================
              WISHLIST + SHARE
          ========================== */}

          <div className="pdp-top-actions">
            {/* Wishlist */}

            <button
              type="button"
              className="pdp-icon-button"
              aria-label="Add to wishlist"
            >
              <svg
                width="21"
                height="21"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M20.84 4.61C19.81 3.58 18.43 3 17 3C15.57 3 14.19 3.58 13.16 4.61L12 5.77L10.84 4.61C8.7 2.47 5.23 2.47 3.09 4.61C0.95 6.75 0.95 10.22 3.09 12.36L12 21.27L20.91 12.36C23.05 10.22 23.05 6.75 20.84 4.61Z"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {/* Share */}

            <button
              type="button"
              className="pdp-icon-button"
              aria-label="Share product"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="18"
                  cy="5"
                  r="2.2"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />

                <circle
                  cx="6"
                  cy="12"
                  r="2.2"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />

                <circle
                  cx="18"
                  cy="19"
                  r="2.2"
                  stroke="currentColor"
                  strokeWidth="1.4"
                />

                <path
                  d="M8 10.9L15.9 6.2"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />

                <path
                  d="M8 13.1L15.9 17.8"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>

          {/* =========================
              SIZE
          ========================== */}

          <div className="pdp-size-section">
            <div className="pdp-size-header">
              <span>Select Size</span>

              <button type="button" className="size-chart-button">
                Size Chart
              </button>
            </div>

            <div className="pdp-sizes">
              {["S", "M", "L", "XL", "XXL"].map((size) => (
                <button key={size} type="button" className="pdp-size">
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* =========================
              DEAL
          ========================== */}

          <div className="pdp-deal">
            <div className="pdp-deal-title">
              <span>Deals of the Day</span>

              <span className="pdp-info-icon">i</span>
            </div>

            <div className="pdp-deal-box">
              <div className="pdp-deal-content">
                <strong>OPULENCE10</strong>

                <small>Get 10% Off On First Purchase</small>
              </div>

              <button type="button" className="pdp-copy">
                <span>□</span>
                <small>COPY</small>
              </button>
            </div>
          </div>

          {/* =========================
              BUY NOW
          ========================== */}

          <button type="button" className="pdp-buy-now">
            BUY NOW
          </button>

          {/* =========================
              ADD TO BAG
          ========================== */}

          <div className="pdp-add-bag">
            <AddToCartButton variants={product.variants.edges} />
          </div>

          {/* =========================
              DELIVERY
          ========================== */}

          <div className="pdp-delivery">
            <span className="pdp-delivery-title">Delivery Details</span>

            <div className="pdp-pincode">
              <input
                type="text"
                placeholder="Enter Delivery Pincode"
                maxLength={6}
              />

              <button type="button" aria-label="Check delivery">
                →
              </button>
            </div>
          </div>

          {/* =========================
              RETURN
          ========================== */}

          <div className="pdp-return">
            <span className="pdp-return-icon">◷</span>

            <span>15 days returns / exchange available</span>

            <a href="#return-info">More Info</a>
          </div>

          {/* =========================
              DESCRIPTION
          ========================== */}

          <details className="pdp-accordion" open>
            <summary>
              <span>Product Description</span>

              <span className="pdp-accordion-icon">−</span>
            </summary>

            <div className="pdp-accordion-content">
              {product.descriptionHtml ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: product.descriptionHtml,
                  }}
                />
              ) : (
                <>
                  <p>
                    This piece is designed with premium materials, refined
                    construction and a considered silhouette for everyday wear.
                  </p>

                  <p>
                    Designed for the modern man, combining comfort, quality and
                    timeless Opulence styling.
                  </p>
                </>
              )}
            </div>
          </details>

          {/* =========================
              SPECIFICATIONS
          ========================== */}

          <details className="pdp-accordion">
            <summary>
              <span>Product Specifications</span>

              <span className="pdp-accordion-icon">+</span>
            </summary>

            <div className="pdp-accordion-content">
              <div className="pdp-spec-row">
                <span>Fit</span>
                <span>Regular Fit</span>
              </div>

              <div className="pdp-spec-row">
                <span>Fabric</span>
                <span>Premium Cotton</span>
              </div>

              <div className="pdp-spec-row">
                <span>Care</span>
                <span>Machine Wash</span>
              </div>

              <div className="pdp-spec-row">
                <span>Country</span>
                <span>Made in India</span>
              </div>
            </div>
          </details>

          {/* =========================
              DISCLOSURE
          ========================== */}

          <details className="pdp-accordion" id="return-info">
            <summary>
              <span>Product Disclosure</span>

              <span className="pdp-accordion-icon">+</span>
            </summary>

            <div className="pdp-accordion-content">
              <p>
                Colours may vary slightly depending on your screen settings and
                lighting conditions.
              </p>

              <p>
                Product measurements may have minor variations due to the nature
                of garment production.
              </p>
            </div>
          </details>
        </aside>
      </div>

      {/* =========================
          RELATED PRODUCTS
      ========================== */}

      <RelatedProducts productId={product.id} />
    </div>
  );
}
