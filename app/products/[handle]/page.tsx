import "./product-detail.css";

import Link from "next/link";

import { getProductByHandle } from "@/lib/shopify";

import ProductOptions from "@/components/ProductOptions";

import ProductGallery from "@/components/ProductGallery";

import RelatedProducts from "@/components/RelatedProducts";

type ProductPageProps = {
  params: Promise<{
    handle: string;
  }>;
};

export default async function ProductPage({ params }: ProductPageProps) {
  /* =========================================================
     GET HANDLE
  ========================================================= */

  const { handle } = await params;

  const productHandle = decodeURIComponent(handle).trim();

  /* =========================================================
     GET SHOPIFY PRODUCT
  ========================================================= */

  const product = await getProductByHandle(productHandle);

  /* =========================================================
     PRODUCT NOT FOUND
  ========================================================= */

  if (!product) {
    return (
      <main className="container">
        <div
          style={{
            minHeight: "50vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexDirection: "column",
            gap: "16px",
          }}
        >
          <h1>Product not found.</h1>

          <p>We couldn't find this product in the Shopify store.</p>

          <Link href="/collections/all">← BACK TO SHOP</Link>
        </div>
      </main>
    );
  }

  /* =========================================================
     VARIANTS
  ========================================================= */

  const variants =
    product?.variants?.edges?.map(({ node }: any) => ({
      id: node.id,
      title: node.title,
      availableForSale: node.availableForSale,
      price: node.price,
      selectedOptions: node.selectedOptions || [],
      image: node.image || null,
    })) || [];

  /* =========================================================
     FIRST AVAILABLE VARIANT
  ========================================================= */

  const firstAvailableVariant =
    variants.find((variant: any) => variant.availableForSale) || variants[0];

  /* =========================================================
     PRODUCT IMAGES
  ========================================================= */

  const productImages = product?.images?.edges?.slice(0, 50) || [];

  /* =========================================================
     PRICE
  ========================================================= */

  const price =
    firstAvailableVariant?.price?.amount ||
    product?.priceRange?.minVariantPrice?.amount ||
    "";

  const currency =
    firstAvailableVariant?.price?.currencyCode ||
    product?.priceRange?.minVariantPrice?.currencyCode ||
    "INR";

  /* =========================================================
     FIRST AVAILABLE VARIANT COLOR
  ========================================================= */

  const firstAvailableVariantColor =
    firstAvailableVariant?.selectedOptions?.find(
      (option: any) => option.name?.toLowerCase() === "color",
    )?.value || "";

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <main className="container-fluid">
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
            LEFT - PRODUCT IMAGES
        =================================================== */}

        <ProductGallery
          productTitle={product.title}
          productImages={productImages}
          featuredImage={product?.featuredImage || null}
          firstAvailableVariantImage={firstAvailableVariant?.image || null}
          firstAvailableVariantColor={firstAvailableVariantColor}
        />

        {/* ===================================================
            RIGHT - PRODUCT INFORMATION
        =================================================== */}

        <aside className="page-right">
          <div className="pdp-brand">OPULENCE</div>

          <h1 className="pdp-title">{product.title}</h1>

          <p className="pdp-price">
            {currency} {price}
          </p>

          {/* =================================================
              PRODUCT OPTIONS
          ================================================= */}

          {variants.length > 0 && (
            <ProductOptions
              product={{
                id: product.id,
                title: product.title,
                handle: product.handle,
              }}
              variants={variants}
            />
          )}

          {/* =================================================
              PRODUCT DESCRIPTION
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
              ) : product.description ? (
                <p>{product.description}</p>
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

      <RelatedProducts
        productId={product.id}
        productType={product.productType || ""}
      />
    </main>
  );
}
