import Link from "next/link";
import { notFound } from "next/navigation";

import { getProducts, getCollectionByHandle } from "@/lib/shopify";

import ShopFilters from "@/components/ShopFilters";
import CatalogView from "@/components/CatalogView";

import "./collection.css";

type PageProps = {
  params: Promise<{
    handle: string;
  }>;
};

const collectionMap: Record<string, string> = {
  polo: "elevated-capsule",
  "t-shirts": "graphic-tees",
};

export default async function CollectionPage({ params }: PageProps) {
  const { handle } = await params;

  /* =========================================================
     GET PRODUCTS
  ========================================================= */

  let products: any[] = [];
  let title = "ALL PRODUCTS";

  /* =========================================================
     ALL PRODUCTS
  ========================================================= */

  if (handle === "all") {
    products = await getProducts(50);

    title = "ALL PRODUCTS";
  } else {
    /* =========================================================
     POLO / T-SHIRTS
  ========================================================= */
    const shopifyHandle = collectionMap[handle];

    if (!shopifyHandle) {
      notFound();
    }

    const collection = await getCollectionByHandle(shopifyHandle, 50);

    if (!collection) {
      notFound();
    }

    products = collection.products?.edges?.map((edge: any) => edge.node) || [];

    if (handle === "polo") {
      title = "POLO";
    } else if (handle === "t-shirts") {
      title = "T-SHIRTS";
    } else {
      title = collection.title?.toUpperCase() || "COLLECTION";
    }
  }

  /* =========================================================
     PAGE
  ========================================================= */

  return (
    <main className="opulence-catalog">
      <div className="catalog-container">
        {/* =====================================================
            BREADCRUMB
        ===================================================== */}

        <nav className="catalog-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>

          <span>/</span>

          <Link href="/collections/all">Collections</Link>

          <span>/</span>

          <span>{title}</span>
        </nav>

        {/* =====================================================
            MAIN LAYOUT
        ===================================================== */}

        <div className="catalog-layout">
          {/* ===================================================
              SIDEBAR
          =================================================== */}

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

            {/* FILTERS */}

            <div className="sidebar-filters">
              <div className="sidebar-label">FILTER</div>

              <ShopFilters />
            </div>
          </aside>

          {/* ===================================================
              PRODUCTS
          =================================================== */}

          <section className="catalog-products">
            <CatalogView products={products} title={title} />
          </section>
        </div>
      </div>
    </main>
  );
}
