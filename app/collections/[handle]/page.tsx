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
  } else if (handle === "polo") {
    /* =========================================================
     POLO
     
     Shopify Product Type = Polo
  ========================================================= */
    products = await getProductsByType("Polo", 50);
    title = "POLO";
  } else if (handle === "t-shirts") {
    /* =========================================================
     T-SHIRTS
     
     Shopify Product Type = Tee
  ========================================================= */
    products = await getProductsByType("Tee", 50);
    title = "T-SHIRTS";
  } else {
    /* =========================================================
     INVALID COLLECTION
  ========================================================= */
    notFound();
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
                {/* ALL PRODUCTS */}

                <Link
                  href="/collections/all"
                  className={handle === "all" ? "active" : ""}
                >
                  All Products
                </Link>

                {/* POLO */}

                <Link
                  href="/collections/polo"
                  className={handle === "polo" ? "active" : ""}
                >
                  Polo
                </Link>

                {/* T-SHIRTS */}

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
