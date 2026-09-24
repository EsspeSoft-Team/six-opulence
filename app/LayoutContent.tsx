"use client";

import { usePathname } from "next/navigation";

import Header from "@/components/Header";
import NewsletterBar from "@/components/home/NewsletterBar";
import FeatureBar from "@/components/home/FeatureBar";
import Footer from "@/components/Footer";

import { CartProvider } from "@/lib/cart-context";
import { WishlistProvider } from "@/lib/wishlist-context";

export default function LayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const isAuthPage =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname === "/forgot-password";

  /* ============================================================
     AUTH PAGES
     ============================================================ */

  if (isAuthPage) {
    return <main>{children}</main>;
  }

  /* ============================================================
     GLOBAL PROVIDERS
     ============================================================ */

  return (
    <CartProvider>
      <WishlistProvider>
        <Header />

        <main>{children}</main>

        <div className="global-footer-area">
          <NewsletterBar />
          <FeatureBar />
          <Footer />
        </div>
      </WishlistProvider>
    </CartProvider>
  );
}
