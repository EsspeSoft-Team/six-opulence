"use client";

import "./Header.css";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";

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
   DESKTOP 6-DOT BUTTON
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
                src="/images/logo.jpeg"
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
            <a href="#" onClick={onClose}>
              <span className="social-icon">f</span>
              <span>Facebook</span>
            </a>

            <a href="#" onClick={onClose}>
              <span className="social-icon twitter-icon">♥</span>
              <span>Twitter</span>
            </a>

            <a href="#" onClick={onClose}>
              <span className="social-icon">◉</span>
              <span>Dribbble</span>
            </a>

            <a href="#" onClick={onClose}>
              <span className="social-icon instagram-icon">◎</span>
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
      label: "New Arrivals",
      href: "/new-arrivals",
    },
    {
      number: "02",
      label: "Polo T-Shirts",
      href: "/collections/elevated-capsule",
    },
    {
      number: "03",
      label: "Graphic Tees",
      href: "/collections/graphic-tees",
    },
    {
      number: "04",
      label: "Oversized Fits",
      href: "/collections/oversized-fits",
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
                src="/images/logo.jpeg"
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
   OPENS FROM TOP
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
                src="/images/logo.jpeg"
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

  /*
   * Prevent body scroll when any drawer is open
   */
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

  /*
   * ESC closes all drawers
   */
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

  return (
    <>
      <header className="header">
        {/* ================= LOGO ================= */}
        <Link href="/" className="logo">
          <img src="/images/logo.jpeg" alt="OPULENCE" className="logo-image" />
        </Link>

        {/* ================= DESKTOP NAV ================= */}

        <nav className="nav">
          {/* <div className="nav-dropdown">
            <button type="button" className="nav-dropdown-trigger">
              Shop
            </button>

            <div className="nav-dropdown-menu">
              <Link href="/collections/elevated-capsule">Polo T-Shirts</Link>

              <Link href="/collections/graphic-tees">Graphic Tees</Link>

              <Link href="/collections/oversized-fits">Oversized Fits</Link>
            </div>
          </div> */}

          <Link href="/new-arrivals">Shop</Link>

          <Link href="/best-sellers">Best Seller</Link>

          <Link href="/new-arrivals">New Arrivals</Link>

          <Link href="/collections/elevated-capsule">Polo </Link>

          <Link href="/collections/graphic-tees">T-Shirts</Link>

          <Link href="/about">About Us</Link>
        </nav>

        {/* ================= HEADER ACTIONS ================= */}

        <div className="header-icons">
          {/* Search */}
          <button
            type="button"
            className="header-icon-btn"
            aria-label="Search"
            onClick={openSearch}
          >
            <SearchIcon />
          </button>

          {/* Profile */}
          <ProfileDropdown />

          {/* Wishlist */}
          <Link
            href="/wishlist"
            className="header-icon-btn"
            aria-label="Wishlist"
          >
            <HeartIcon />

            {wishlistCount > 0 && (
              <span className="header-badge">{wishlistCount}</span>
            )}
          </Link>

          {/* Cart */}
          <Link href="/cart" className="header-icon-btn" aria-label="Cart">
            <BagIcon />

            {cartCount > 0 && <span className="header-badge">{cartCount}</span>}
          </Link>

          {/* Desktop 6 DOT */}
          <button
            type="button"
            className="header-grid-btn"
            aria-label="More information"
            onClick={openInfo}
          >
            <GridIcon />
          </button>

          {/* Mobile Menu */}
          <button
            type="button"
            className="header-mobile-menu-btn"
            aria-label="Open menu"
            onClick={openMobileMenu}
          >
            <MenuIcon />
          </button>
        </div>
      </header>

      {/* ================= DRAWERS ================= */}

      <InformationDrawer open={infoOpen} onClose={() => setInfoOpen(false)} />

      <MobileMenuDrawer
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      <SearchDrawer open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
