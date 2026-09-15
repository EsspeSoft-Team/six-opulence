import type { Metadata } from "next";
import "./globals.css";

import { CartProvider } from "@/lib/cart-context";
import { AuthProvider } from "@/lib/auth-context";
import { WishlistProvider } from "@/lib/wishlist-context";

import Header from "@/components/Header";
import NewsletterBar from "@/components/home/NewsletterBar";
import FeatureBar from "@/components/home/FeatureBar";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Opulence — Limited Edition Menswear",
  description: "Premium D2C menswear. Limited to 2,000 pieces.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />

        <link
          href="https://fonts.googleapis.com/css2?family=Archivo:wght@700;800;900&family=Inter:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>

      <body>
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <Header />

              <main>{children}</main>

              {/* =========================
                  GLOBAL FOOTER AREA
              ========================= */}

              <div className="global-footer-area">
                <NewsletterBar />

                <FeatureBar />

                <Footer />
              </div>
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
