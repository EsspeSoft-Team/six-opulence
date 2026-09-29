import "./product-detail.css";

import Link from "next/link";

import { getProductByHandle } from "@/lib/shopify";

import ProductOptions from "@/components/ProductOptions";
import ProductGallery from "@/components/ProductGallery";
import ProductReviews from "@/components/ProductReviews";
import RelatedProducts from "@/components/RelatedProducts";

type ProductPageProps = {
  params: Promise<{
    handle: string;
  }>;
};

/* ============================================================
   METAFIELD HELPER
============================================================ */

function getMetafieldValue(product: any, key: string): string {
  return (
    product?.metafields
      ?.find(
        (field: any) => field?.namespace === "custom" && field?.key === key,
      )
      ?.value?.trim?.() || ""
  );
}

/* ============================================================
   FORMAT METAFIELD
============================================================ */

function formatMetafieldValue(value: string): string {
  if (!value) {
    return "";
  }

  try {
    const parsed = JSON.parse(value);

    const extractText = (node: any): string => {
      if (!node) {
        return "";
      }

      if (typeof node === "string") {
        return node;
      }

      if (node.type === "text") {
        return node.value || "";
      }

      if (Array.isArray(node.children)) {
        return node.children.map(extractText).join("");
      }

      if (Array.isArray(node.content)) {
        return node.content.map(extractText).join("");
      }

      return "";
    };

    const text = extractText(parsed);

    if (text.trim()) {
      return text.trim();
    }
  } catch {
    // Plain text metafield
  }

  return value;
}

/* ============================================================
   PRODUCT PAGE
============================================================ */

export default async function ProductPage({ params }: ProductPageProps) {
  const { handle } = await params;

  const productHandle = decodeURIComponent(handle).trim();

  const product = await getProductByHandle(productHandle);

  /* ==========================================================
     NOT FOUND
  ========================================================== */

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

  /* ==========================================================
     VARIANTS
  ========================================================== */

  const variants =
    product?.variants?.edges?.map(({ node }: any) => ({
      id: node.id,

      title: node.title,

      availableForSale: node.availableForSale,

      price: node.price,

      selectedOptions: node.selectedOptions || [],

      image: node.image || null,
    })) || [];

  /* ==========================================================
     FIRST AVAILABLE VARIANT
  ========================================================== */

  const firstAvailableVariant =
    variants.find((variant: any) => variant.availableForSale) || variants[0];

  /* ==========================================================
     IMAGES
  ========================================================== */

  const productImages = product?.images?.edges?.slice(0, 50) || [];

  /* ==========================================================
     PRICE
  ========================================================== */

  const price =
    firstAvailableVariant?.price?.amount ||
    product?.priceRange?.minVariantPrice?.amount ||
    "";

  const currency =
    firstAvailableVariant?.price?.currencyCode ||
    product?.priceRange?.minVariantPrice?.currencyCode ||
    "INR";

  /* ==========================================================
     VARIANT COLOR
  ========================================================== */

  const firstAvailableVariantColor =
    firstAvailableVariant?.selectedOptions?.find(
      (option: any) =>
        option.name?.toLowerCase() === "color" ||
        option.name?.toLowerCase() === "colour",
    )?.value || "";

  /* ==========================================================
     SPECIFICATIONS
  ========================================================== */

  const fit = formatMetafieldValue(getMetafieldValue(product, "fit"));

  const fabric = formatMetafieldValue(getMetafieldValue(product, "fabric"));

  const material = formatMetafieldValue(getMetafieldValue(product, "material"));

  const care = formatMetafieldValue(getMetafieldValue(product, "care"));

  const country = formatMetafieldValue(getMetafieldValue(product, "country"));

  const gender = formatMetafieldValue(getMetafieldValue(product, "gender"));

  const occasion = formatMetafieldValue(getMetafieldValue(product, "occasion"));

  const productDisclosure = formatMetafieldValue(
    getMetafieldValue(product, "product_disclosure"),
  );

  const returnPolicy = formatMetafieldValue(
    getMetafieldValue(product, "return_policy"),
  );

  const returnExchangeDetails = formatMetafieldValue(
    getMetafieldValue(product, "return_exchange_details"),
  );

  /* ==========================================================
     SPECIFICATION LIST
  ========================================================== */

  const specifications = [
    {
      label: "Fit",
      value: fit,
    },

    {
      label: "Fabric",
      value: fabric,
    },

    {
      label: "Material",
      value: material,
    },

    {
      label: "Care",
      value: care,
    },

    {
      label: "Country",
      value: country,
    },

    {
      label: "Gender",
      value: gender,
    },

    {
      label: "Occasion",
      value: occasion,
    },
  ].filter((item) => item.value);

  /* ==========================================================
     COLLECTION
  ========================================================== */

  const firstCollection = product?.collections?.edges?.[0]?.node || null;

  return (
    <main className="container-fluid">
      {/* ====================================================
          BREADCRUMB
      ==================================================== */}

      <nav className="pdp-breadcrumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link>

        <span>/</span>

        {firstCollection ? (
          <>
            <Link href={`/collections/${firstCollection.handle}`}>
              {firstCollection.title}
            </Link>

            <span>/</span>
          </>
        ) : (
          <>
            <Link href="/collections/all">Shop</Link>

            <span>/</span>
          </>
        )}

        <span>{product.title}</span>
      </nav>

      {/* ====================================================
          PRODUCT
      ==================================================== */}

      <div className="pdp">
        {/* ==================================================
            GALLERY
        ================================================== */}

        <ProductGallery
          productTitle={product.title}
          productImages={productImages}
          featuredImage={product?.featuredImage || null}
          firstAvailableVariantImage={firstAvailableVariant?.image || null}
          firstAvailableVariantColor={firstAvailableVariantColor}
        />

        {/* ==================================================
            RIGHT SIDE
        ================================================== */}

        <aside className="page-right">
          {/* BRAND */}
          <div className="pdp-brand">{product.vendor || "OPULENCE"}</div>

          {/* TITLE */}
          <h1 className="pdp-title">{product.title}</h1>

          {/* PRICE */}
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

                vendor: product.vendor || "",

                metafields: product.metafields || [],
              }}
              variants={variants}
            />
          )}

          {/* =================================================
              DESCRIPTION
          ================================================= */}

          {(product.descriptionHtml || product.description) && (
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
                  <p>{product.description}</p>
                )}
              </div>
            </details>
          )}

          {/* =================================================
              SPECIFICATIONS
          ================================================= */}

          {specifications.length > 0 && (
            <details className="pdp-accordion">
              <summary>
                <span>Product Specifications</span>

                <span className="pdp-accordion-icon">+</span>
              </summary>

              <div className="pdp-accordion-content">
                {specifications.map((item) => (
                  <div className="pdp-spec-row" key={item.label}>
                    <span>{item.label}</span>

                    <span>{item.value}</span>
                  </div>
                ))}
              </div>
            </details>
          )}

          {/* =================================================
              RETURN & EXCHANGE
          ================================================= */}

          {(returnPolicy || returnExchangeDetails) && (
            <details className="pdp-accordion" id="return-info">
              <summary>
                <span>Return & Exchange</span>

                <span className="pdp-accordion-icon">+</span>
              </summary>

              <div className="pdp-accordion-content">
                {returnExchangeDetails ? (
                  <p style={{ whiteSpace: "pre-line" }}>
                    {returnExchangeDetails}
                  </p>
                ) : (
                  <p>{returnPolicy}</p>
                )}
              </div>
            </details>
          )}

          {/* =================================================
              PRODUCT DISCLOSURE
          ================================================= */}

          {productDisclosure && (
            <details className="pdp-accordion">
              <summary>
                <span>Product Disclosure</span>

                <span className="pdp-accordion-icon">+</span>
              </summary>

              <div className="pdp-accordion-content">
                <p>{productDisclosure}</p>
              </div>
            </details>
          )}
        </aside>
      </div>

      {/* ====================================================
          REVIEWS
      ==================================================== */}

      <ProductReviews productId={product.id} productHandle={product.handle} />

      {/* ====================================================
          RELATED PRODUCTS
      ==================================================== */}

      <RelatedProducts
        productId={product.id}
        productType={product.productType || ""}
      />
    </main>
  );
}
