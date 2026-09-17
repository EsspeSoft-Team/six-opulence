import "./product-detail.css";

import Image from "next/image";
import Link from "next/link";

import { getProductByHandle } from "@/lib/shopify";

import ProductOptions from "@/components/ProductOptions";
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

  const variants =
    product?.variants?.edges?.map(({ node }: any) => ({
      id: node.id,
      title: node.title,
      availableForSale: node.availableForSale,
      price: node.price,
      selectedOptions: node.selectedOptions || [],
    })) || [];

  const firstAvailableVariant =
    variants.find((variant: any) => variant.availableForSale) || variants[0];

  return (
    <div className="container-fluid">
      {/* =====================================================
          BREADCRUMB
      ===================================================== */}

      <nav className="pdp-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>

        <span>/</span>

        <Link href="/collections/all">Shop</Link>

        <span>/</span>

        <span>{product.title}</span>
      </nav>

      {/* =====================================================
          PRODUCT AREA
      ===================================================== */}

      <div className="pdp">
        {/* ===================================================
            LEFT
        =================================================== */}

        <div className="pdp-images">
          {product.images?.edges?.slice(0, 10).map((edge: any, i: number) => (
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

        {/* ===================================================
            RIGHT
        =================================================== */}

        <aside className="page-right">
          {/* BRAND */}

          <div className="pdp-brand">OPULENCE</div>

          {/* TITLE */}

          <h1 className="pdp-title">{product.title}</h1>

          {/* PRICE */}

          <p className="pdp-price">
            {firstAvailableVariant?.price?.currencyCode || "INR"}{" "}
            {firstAvailableVariant?.price?.amount || ""}
          </p>

          {/* =================================================
              PRODUCT OPTIONS
          ================================================= */}

          <ProductOptions
            product={{
              id: product.id,
              title: product.title,
              handle: product.handle,
            }}
            variants={variants}
          />

          {/* =================================================
              DESCRIPTION
          ================================================= */}

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

          {/* =================================================
              SPECIFICATIONS
          ================================================= */}

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

          {/* =================================================
              DISCLOSURE
          ================================================= */}

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

      {/* =====================================================
          RELATED PRODUCTS
      ===================================================== */}

      <RelatedProducts productId={product.id} />
    </div>
  );
}
