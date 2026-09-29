import Link from "next/link";
import { notFound } from "next/navigation";

import { getProducts, getProductsByType } from "@/lib/shopify";

import ShopFilters from "@/components/ShopFilters";
import CatalogView from "@/components/CatalogView";

import "./collection.css";

type PageProps = {
  params: Promise<{
    handle: string;
  }>;

  searchParams: Promise<{
    size?: string;
    colour?: string;
    price?: string;
  }>;
};

/* =========================================================
   SHOPIFY PRODUCT OPTIONS
========================================================= */

function getShopifyProductOptions(product: any) {
  const sizes: string[] = [];
  const colours: string[] = [];

  /* -------------------------------------------------------
     Product options
  ------------------------------------------------------- */

  if (Array.isArray(product?.options)) {
    product.options.forEach((option: any) => {
      const name = String(option?.name || "")
        .trim()
        .toLowerCase();

      const values = Array.isArray(option?.values) ? option.values : [];

      if (name === "size" || name === "sizes") {
        sizes.push(...values.map((value: any) => String(value).trim()));
      }

      if (
        name === "color" ||
        name === "colour" ||
        name === "colors" ||
        name === "colours"
      ) {
        colours.push(...values.map((value: any) => String(value).trim()));
      }
    });
  }

  /* -------------------------------------------------------
     Variant selectedOptions
  ------------------------------------------------------- */

  const variants = product?.variants?.edges
    ? product.variants.edges.map((edge: any) => edge?.node).filter(Boolean)
    : Array.isArray(product?.variants)
      ? product.variants
      : [];

  variants.forEach((variant: any) => {
    const selectedOptions = Array.isArray(variant?.selectedOptions)
      ? variant.selectedOptions
      : [];

    selectedOptions.forEach((option: any) => {
      const name = String(option?.name || "")
        .trim()
        .toLowerCase();

      const value = String(option?.value || "").trim();

      if (!value) return;

      if (name === "size" || name === "sizes") {
        sizes.push(value);
      }

      if (
        name === "color" ||
        name === "colour" ||
        name === "colors" ||
        name === "colours"
      ) {
        colours.push(value);
      }
    });
  });

  return {
    sizes: [...new Set(sizes)],
    colours: [...new Set(colours)],
  };
}

/* =========================================================
   SHOPIFY PRODUCT PRICE
========================================================= */

function getShopifyProductPrice(product: any) {
  return Number(
    product?.priceRange?.minVariantPrice?.amount ||
      product?.variants?.edges?.[0]?.node?.price?.amount ||
      0,
  );
}

/* =========================================================
   PRICE FILTER
========================================================= */

function matchesPrice(product: any, selectedPrices: string[]) {
  if (selectedPrices.length === 0) {
    return true;
  }

  const price = getShopifyProductPrice(product);

  return selectedPrices.some((range) => {
    switch (range) {
      case "under-3000":
        return price < 3000;

      case "3000-4000":
        return price >= 3000 && price < 4000;

      case "4000-5000":
        return price >= 4000 && price < 5000;

      case "5000-6000":
        return price >= 5000 && price < 6000;

      case "6000-plus":
        return price >= 6000;

      default:
        return true;
    }
  });
}

/* =========================================================
   COLLECTION PAGE
========================================================= */

export default async function CollectionPage({
  params,
  searchParams,
}: PageProps) {
  const { handle } = await params;
  const filters = await searchParams;

  /* =======================================================
     GET PRODUCTS FROM SHOPIFY
  ======================================================= */

  let products: any[] = [];
  let title = "ALL PRODUCTS";

  if (handle === "all") {
    products = await getProducts(50);
    title = "ALL PRODUCTS";
  } else if (handle === "polo") {
    products = await getProductsByType("Polo", 50);
    title = "POLO";
  } else if (handle === "t-shirts") {
    products = await getProductsByType("Tee", 50);
    title = "T-SHIRTS";
  } else {
    notFound();
  }

  /* =======================================================
     BUILD FILTER OPTIONS FROM SHOPIFY
  ======================================================= */

  const sizeSet = new Set<string>();
  const colourSet = new Set<string>();

  products.forEach((product) => {
    const options = getShopifyProductOptions(product);

    options.sizes.forEach((size) => {
      sizeSet.add(size);
    });

    options.colours.forEach((colour) => {
      colourSet.add(colour);
    });
  });

  const availableSizes = Array.from(sizeSet);

  const availableColours = Array.from(colourSet);

  /* =======================================================
     SELECTED FILTERS
  ======================================================= */

  const selectedSizes = filters.size
    ? filters.size
        .split(",")
        .map((item) => decodeURIComponent(item).trim())
        .filter(Boolean)
    : [];

  const selectedColours = filters.colour
    ? filters.colour
        .split(",")
        .map((item) => decodeURIComponent(item).trim())
        .filter(Boolean)
    : [];

  const selectedPrices = filters.price
    ? filters.price.split(",").filter(Boolean)
    : [];

  /* =======================================================
     FILTER SHOPIFY PRODUCTS
  ======================================================= */

  const filteredProducts = products.filter((product) => {
    const options = getShopifyProductOptions(product);

    /* SIZE */

    const sizeMatch =
      selectedSizes.length === 0 ||
      selectedSizes.some((selectedSize) =>
        options.sizes.some(
          (productSize) =>
            productSize.toLowerCase() === selectedSize.toLowerCase(),
        ),
      );

    /* COLOUR */

    const colourMatch =
      selectedColours.length === 0 ||
      selectedColours.some((selectedColour) =>
        options.colours.some(
          (productColour) =>
            productColour.toLowerCase() === selectedColour.toLowerCase(),
        ),
      );

    /* PRICE */

    const priceMatch = matchesPrice(product, selectedPrices);

    return sizeMatch && colourMatch && priceMatch;
  });

  /* =======================================================
     PAGE
     ORIGINAL DESIGN PRESERVED
  ======================================================= */

  return (
    <main className="opulence-catalog">
      <div className="catalog-container">
        {/* =================================================
            BREADCRUMB
        ================================================= */}

        <nav className="catalog-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>

          <span>/</span>

          <Link href="/collections/all">Collections</Link>

          <span>/</span>

          <span>{title}</span>
        </nav>

        {/* =================================================
            MAIN LAYOUT
        ================================================= */}

        <div className="catalog-layout">
          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="catalog-sidebar">
            <div className="sidebar-brand">SHOP</div>

            {/* CATEGORY */}

            <div className="sidebar-group">
              <div className="sidebar-label">CATEGORIES</div>

              <div className="category-list">
                <Link
                  href="/collections/all"
                  className={handle === "all" ? "active" : ""}
                >
                  All Products
                </Link>

                <Link
                  href="/collections/polo"
                  className={handle === "polo" ? "active" : ""}
                >
                  Polo
                </Link>

                <Link
                  href="/collections/t-shirts"
                  className={handle === "t-shirts" ? "active" : ""}
                >
                  T-Shirts
                </Link>
              </div>
            </div>

            {/* FILTER */}

            <div className="sidebar-filters">
              <div className="sidebar-label">FILTER</div>

              <ShopFilters
                availableSizes={availableSizes}
                availableColours={availableColours}
              />
            </div>
          </aside>

          {/* =================================================
              PRODUCTS
          ================================================= */}

          <section className="catalog-products">
            <CatalogView products={filteredProducts} title={title} />
          </section>
        </div>
      </div>
    </main>
  );
}
