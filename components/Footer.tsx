import "./Footer.css";
import Link from "next/link";
import { mockProducts } from "@/lib/mock-data";
// import { Instagram, Facebook, Linkedin } from "lucide-react";

const footerColumns = [
  {
    title: "Shop",
    links: [
      { label: "New Arrivals", href: "/new-arrivals" },
      { label: "Graphic Tees", href: "/collections/graphic-tees" },
      { label: "Oversized Fits", href: "/collections/oversized-fits" },
      {
        label: "Elevated Capsule (Polos)",
        href: "/collections/elevated-capsule",
      },
    ],
  },
  {
    title: "Help",
    links: [
      { label: "Track Order", href: "/account/orders" },
      { label: "Shipping & Returns", href: "/shipping-returns" },
      { label: "Size Guide", href: "/size-guide" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About Opulence", href: "/about" },
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Refund Policy", href: "/refund-policy" },
    ],
  },
];

export default function Footer() {
  const product = mockProducts[0];

  const productImage =
    product?.featuredImage?.url ||
    product?.images?.edges?.[0]?.node?.url ||
    "/images/POST-P-OLIVE.webp";

  return (
    <footer className="footer">
      {/* ============================================================
          MAIN FOOTER
          ============================================================ */}

      <div className="footer-inner">
        <div className="footer-main">
          {/* PRODUCT IMAGE */}

          <div className="footer-product">
            <Link
              href={`/products/${product?.handle || ""}`}
              className="footer-product-link"
            >
              <img
                src={productImage}
                alt={product?.title || "Opulence"}
                className="footer-product-image"
              />
            </Link>
          </div>

          {/* RIGHT SIDE */}

          <div className="footer-right">
            {/* COLUMNS */}

            <div className="footer-columns">
              {footerColumns.map((column) => (
                <div className="footer-column" key={column.title}>
                  <p className="footer-column-title">{column.title}</p>

                  <div className="footer-links">
                    {column.links.map((link) => (
                      <Link
                        key={link.label}
                        href={link.href}
                        className="footer-link"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* DIVIDER */}

            <div className="footer-divider" />

            {/* BOTTOM ROW */}

            <div className="footer-bottom">
              <p className="footer-copyright">
                © {new Date().getFullYear()} Opulence. All rights reserved.
              </p>

              <div className="footer-social">
                {/* Instagram */}
                <a
                  href="#"
                  aria-label="Instagram"
                  className="footer-social-icon"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="3"
                      y="3"
                      width="18"
                      height="18"
                      rx="5"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <circle
                      cx="12"
                      cy="12"
                      r="4"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                  </svg>
                </a>

                {/* Facebook */}
                <a
                  href="#"
                  aria-label="Facebook"
                  className="footer-social-icon"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M14 8H16V4H14C10.686 4 8 6.686 8 10V12H5V16H8V21H12V16H15L16 12H12V10C12 8.895 12.895 8 14 8Z"
                      fill="currentColor"
                    />
                  </svg>
                </a>

                {/* X */}
                <a href="#" aria-label="X" className="footer-social-icon">
                  <svg
                    width="17"
                    height="17"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M5 4L19 20M19 4L5 20"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                </a>

                {/* LinkedIn */}
                <a
                  href="#"
                  aria-label="LinkedIn"
                  className="footer-social-icon"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="4"
                      y="4"
                      width="16"
                      height="16"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="1.7"
                    />
                    <path
                      d="M8 10V16"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                    <circle cx="8" cy="7.5" r="1" fill="currentColor" />
                    <path
                      d="M12 16V10M12 13C12 11.343 13.343 10 15 10C16.657 10 18 11.343 18 13V16"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                    />
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================
            LARGE LOGO
            ============================================================ */}

        <div className="footer-large-logo" aria-hidden="true">
          OPULENCE
        </div>
      </div>
    </footer>
  );
}
