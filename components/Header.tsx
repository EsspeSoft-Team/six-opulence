"use client";

import "./Header.css";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";
import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

/* =========================================================
   ICONS
========================================================= */

function SearchIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <circle cx="11" cy="11" r="7" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8z" />
    </svg>
  );
}

function BagIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
      <path d="M3 6h18" />
      <path d="M16 10a4 4 0 0 1-8 0" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
    >
      <line x1="4" y1="7" x2="20" y2="7" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <line x1="4" y1="17" x2="20" y2="17" />
    </svg>
  );
}

function GridIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="5" cy="5" r="1.5" />
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="19" cy="5" r="1.5" />
      <circle cx="5" cy="12" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="19" cy="12" r="1.5" />
      <circle cx="5" cy="19" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
      <circle cx="19" cy="19" r="1.5" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <line x1="5" y1="5" x2="19" y2="19" />
      <line x1="19" y1="5" x2="5" y2="19" />
    </svg>
  );
}

/* =========================================================
   PROFILE DROPDOWN
========================================================= */

function ProfileDropdown() {
  const { customer, loading, logout } = useAuth();

  const [open, setOpen] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="header-profile-wrap" ref={ref}>
      <button
        className="header-icon-btn"
        onClick={() => setOpen((value) => !value)}
        aria-label="Account"
        type="button"
      >
        <UserIcon />
      </button>

      {open && (
        <div className="profile-dropdown">
          {loading ? (
            <p className="profile-loading">Loading...</p>
          ) : customer ? (
            <>
              <p className="profile-dropdown-title">
                Hi, {customer.firstName || "there"}
              </p>

              <div className="profile-dropdown-links">
                <Link href="/account" onClick={() => setOpen(false)}>
                  My Account
                </Link>

                <Link href="/account/orders" onClick={() => setOpen(false)}>
                  Orders
                </Link>

                <Link href="/wishlist" onClick={() => setOpen(false)}>
                  Wishlist
                </Link>

                <Link href="/account/addresses" onClick={() => setOpen(false)}>
                  Saved Addresses
                </Link>
              </div>

              <button
                className="profile-dropdown-logout"
                type="button"
                onClick={async () => {
                  await logout();
                  setOpen(false);
                  router.push("/");
                }}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <p className="profile-dropdown-title">Welcome</p>

              <p className="profile-description">
                To access account and manage orders
              </p>

              <Link
                href="/login"
                className="profile-login-btn"
                onClick={() => setOpen(false)}
              >
                Login / Signup
              </Link>

              <div className="profile-dropdown-links profile-wishlist-link">
                <Link href="/wishlist" onClick={() => setOpen(false)}>
                  Wishlist
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}

/* =========================================================
   INFORMATION DRAWER
========================================================= */

function InformationDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <>
      <div
        className={`drawer-backdrop ${open ? "is-visible" : ""}`}
        onClick={onClose}
      />

      <aside
        className={`information-drawer ${open ? "is-open" : ""}`}
        aria-hidden={!open}
      >
        <div className="information-drawer-inner">
          <div className="drawer-top">
            <Link href="/" className="drawer-logo" onClick={onClose}>
              <img
                src="/images/logo-new-op.jpeg"
                alt="OPULENCE"
                className="drawer-logo-image"
              />
            </Link>

            <button
              type="button"
              className="drawer-close"
              onClick={onClose}
              aria-label="Close information"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="drawer-divider" />

          <div className="drawer-socials">
            <a href="#" onClick={onClose} aria-label="Facebook">
              <span className="social-icon">
                <FaFacebookF />
              </span>
              <span>Facebook</span>
            </a>

            <a href="#" onClick={onClose} aria-label="Twitter">
              <span className="social-icon twitter-icon">
                <FaXTwitter />
              </span>
              <span>Twitter</span>
            </a>

            <a href="#" onClick={onClose} aria-label="Instagram">
              <span className="social-icon">
                <FaInstagram />
              </span>
              <span>Instagram</span>
            </a>
          </div>

          <div className="drawer-contact">
            <a href="tel:+18408412569">+1 840 841 25 69</a>

            <a href="mailto:info@email.com">info@email.com</a>
          </div>
        </div>
      </aside>
    </>
  );
}

/* =========================================================
   MOBILE NAVIGATION DRAWER
========================================================= */

function MobileMenuDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const menuItems = [
    {
      number: "01",
      label: "All Products",
      href: "/collections/all",
    },
    {
      number: "02",
      label: "Polo",
      href: "/collections/polo",
    },
    {
      number: "03",
      label: "T-Shirts",
      href: "/collections/t-shirts",
    },
    {
      number: "04",
      label: "Exclusive",
      href: "/Exclusive",
    },
    {
      number: "05",
      label: "About Us",
      href: "/about",
    },
    {
      number: "06",
      label: "Contact",
      href: "/contact",
    },
  ];

  return (
    <>
      <div
        className={`mobile-menu-backdrop ${open ? "is-visible" : ""}`}
        onClick={onClose}
      />

      <aside className={`mobile-menu-drawer ${open ? "is-open" : ""}`}>
        <div className="mobile-menu-inner">
          <div className="mobile-menu-top">
            <Link href="/" className="mobile-drawer-logo" onClick={onClose}>
              <img
                src="/images/logo-new-op.jpeg"
                alt="OPULENCE"
                className="mobile-drawer-logo-image"
              />
            </Link>

            <button
              type="button"
              className="mobile-menu-close"
              onClick={onClose}
              aria-label="Close menu"
            >
              <CloseIcon />
            </button>
          </div>

          <div className="mobile-menu-line" />

          <nav className="mobile-main-nav">
            {menuItems.map((item) => (
              <Link
                key={item.number}
                href={item.href}
                onClick={onClose}
                className="mobile-nav-item"
              >
                <span className="mobile-nav-number">{item.number}</span>

                <span className="mobile-nav-label">{item.label}</span>

                <span className="mobile-nav-arrow">→</span>
              </Link>
            ))}
          </nav>

          <div className="mobile-menu-footer">
            <p>
              Elevated essentials.
              <br />
              Made to last.
            </p>

            <Link href="/newsletter" onClick={onClose}>
              JOIN OUR NEWSLETTER
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}

/* =========================================================
   SEARCH DRAWER
========================================================= */

function SearchDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 250);
    }
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const value = query.trim();

    if (!value) return;

    window.location.href = `/search?q=${encodeURIComponent(value)}`;
  }

  return (
    <>
      <div
        className={`search-backdrop ${open ? "is-visible" : ""}`}
        onClick={onClose}
      />

      <div className={`search-drawer ${open ? "is-open" : ""}`}>
        <div className="search-drawer-inner">
          <div className="search-drawer-top">
            <Link href="/" className="search-drawer-logo" onClick={onClose}>
              <img
                src="/images/logo-new-op.jpeg"
                alt="OPULENCE"
                className="search-drawer-logo-image"
              />
            </Link>

            <button
              type="button"
              className="search-close"
              onClick={onClose}
              aria-label="Close search"
            >
              <CloseIcon />
            </button>
          </div>

          <form className="search-form" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type words and hit enter"
              aria-label="Search products"
            />

            <button type="submit" aria-label="Search">
              <SearchIcon />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

/* =========================================================
   HEADER
========================================================= */

export default function Header() {
  const { cart } = useCart();
  const { wishlist } = useWishlist();

  const cartCount = cart?.totalQuantity || 0;
  const wishlistCount = wishlist.length;

  const [infoOpen, setInfoOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  /* =====================================================
     BODY SCROLL
  ===================================================== */

  useEffect(() => {
    const drawerOpen = infoOpen || mobileMenuOpen || searchOpen;

    if (drawerOpen) {
      document.body.classList.add("header-drawer-open");
    } else {
      document.body.classList.remove("header-drawer-open");
    }

    return () => {
      document.body.classList.remove("header-drawer-open");
    };
  }, [infoOpen, mobileMenuOpen, searchOpen]);

  /* =====================================================
     ESC
  ===================================================== */

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape") return;

      setInfoOpen(false);
      setMobileMenuOpen(false);
      setSearchOpen(false);
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  /* =====================================================
     OPEN FUNCTIONS
  ===================================================== */

  function openSearch() {
    setInfoOpen(false);
    setMobileMenuOpen(false);
    setSearchOpen(true);
  }

  function openInfo() {
    setSearchOpen(false);
    setMobileMenuOpen(false);
    setInfoOpen(true);
  }

  function openMobileMenu() {
    setSearchOpen(false);
    setInfoOpen(false);
    setMobileMenuOpen(true);
  }

  /* =====================================================
     RETURN
  ===================================================== */

  return (
    <>
      <header className="header">
        {/* =================================================
            TOP BAR
        ================================================= */}

        <div className="top-header">
          {/* LEFT MARQUEE */}

          <div className="top-header-left">
            <div className="top-marquee">
              <div className="top-marquee-track">
                <span>Elevated essentials. Made to last.</span>

                <span>•</span>

                <span>Discover the latest collection.</span>

                <span>•</span>

                <span>Elevated essentials. Made to last.</span>

                <span>•</span>

                <span>Discover the latest collection.</span>
              </div>
            </div>
          </div>

          {/* RIGHT PHONE */}

          <div className="top-header-right">
            <a href="tel:18008334488">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
              >
                <path
                  d="M22 16.92v3a2 2 0 0 1-2.18 2
                  19.79 19.79 0 0 1-8.63-3.07
                  19.5 19.5 0 0 1-6-6
                  A19.79 19.79 0 0 1 2.12 4.18
                  2 2 0 0 1 5.11 2h3a2 2 0 0 1 2 1.72
                  12.84 12.84 0 0 0 .7 2.81
                  2 2 0 0 1-.45 2.11L9.09 9.91
                  a16 16 0 0 0 6 6l1.27-1.27
                  a2 2 0 0 1 2.11-.45
                  12.84 12.84 0 0 0 2.81.7
                  A2 2 0 0 1 22 16.92z"
                />
              </svg>

              <span>1800-833-4488</span>
            </a>
          </div>
        </div>

        {/* =================================================
            MAIN HEADER
        ================================================= */}

        <div className="main-header">
          {/* LEFT NAV */}

          <nav className="nav">
            <div className="nav-dropdown">
              <button
                type="button"
                className="nav-dropdown-trigger"
                aria-haspopup="true"
              >
                Shop
              </button>

              <div className="nav-dropdown-menu">
                <Link href="/collections/polo">POLO</Link>

                <Link href="/collections/t-shirts">T-SHIRTS</Link>

                <Link href="/collections/all">ALL</Link>
              </div>
            </div>

            <Link href="/Exclusive">Exclusive</Link>

            <Link href="/about">About Us</Link>
          </nav>

          {/* CENTER LOGO */}

          <Link href="/" className="logo">
            <img
              src="/images/logo-new-op.jpeg"
              alt="OPULENCE"
              className="logo-image"
            />
          </Link>

          {/* RIGHT ACTIONS */}

          <div className="header-icons">
            {/* SEARCH */}

            <button
              type="button"
              className="header-action"
              aria-label="Search"
              onClick={openSearch}
            >
              <span className="header-action-icon">
                <SearchIcon />
              </span>

              <span>Search</span>
            </button>

            {/* ACCOUNT */}

            <div className="header-profile-action">
              <ProfileDropdown />

              <span>Account</span>
            </div>

            {/* WISHLIST */}

            <Link
              href="/wishlist"
              className="header-action"
              aria-label="Wishlist"
            >
              <span className="header-action-icon">
                <HeartIcon />

                {wishlistCount > 0 && (
                  <span className="header-badge">{wishlistCount}</span>
                )}
              </span>

              <span>Wishlist</span>
            </Link>

            {/* CART */}

            <Link href="/cart" className="header-action" aria-label="Cart">
              <span className="header-action-icon">
                <BagIcon />

                {cartCount > 0 && (
                  <span className="header-badge">{cartCount}</span>
                )}
              </span>

              <span>Cart</span>
            </Link>

            {/* SIX DOT */}

            <button
              type="button"
              className="header-grid-btn"
              aria-label="More information"
              onClick={openInfo}
            >
              <GridIcon />
            </button>

            {/* MOBILE MENU */}

            <button
              type="button"
              className="header-mobile-menu-btn"
              aria-label="Open menu"
              onClick={openMobileMenu}
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </header>

      {/* ===================================================
          DRAWERS
      =================================================== */}

      <InformationDrawer open={infoOpen} onClose={() => setInfoOpen(false)} />

      <MobileMenuDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <SearchDrawer open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
