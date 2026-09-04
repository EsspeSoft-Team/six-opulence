"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import "./ProductCard.css";

type ProductColor = {
  name: string;
  value: string;
  image: string;
};

type ProductCardProps = {
  product: any;
};

/* ============================================================
   HEART ICON
   ============================================================ */

function HeartIcon({ filled = false }: { filled?: boolean }) {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ============================================================
   CART ICON
   ============================================================ */

function CartIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M3 3H5L7.4 14.2C7.63 15.25 8.56 16 9.64 16H17.4C18.4 16 19.28 15.35 19.58 14.4L21 10H6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      <circle cx="9" cy="20" r="1.2" fill="currentColor" />

      <circle cx="18" cy="20" r="1.2" fill="currentColor" />
    </svg>
  );
}

/* ============================================================
   ARROW ICON
   ============================================================ */

function ArrowIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M5 12H19"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <path
        d="M13 6L19 12L13 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ============================================================
   PRODUCT CARD
   ============================================================ */

export default function ProductCard({ product }: ProductCardProps) {
  const colors: ProductColor[] = product?.colors || [];

  /* ==========================================================
     SELECTED COLOR
     ========================================================== */

  const [selectedColor, setSelectedColor] = useState<ProductColor | null>(
    colors.length > 0 ? colors[0] : null,
  );

  /* ==========================================================
     WISHLIST
     ========================================================== */

  const [wishlistActive, setWishlistActive] = useState(false);

  /* ==========================================================
     CART
     ========================================================== */

  const [addedToCart, setAddedToCart] = useState(false);

  /* ==========================================================
     PRODUCT DATA
     ========================================================== */

  const productTitle = product?.title || "Product";

  const productHandle = product?.handle || "";

  const productImage =
    selectedColor?.image ||
    product?.featuredImage?.url ||
    "/images/RR291044.webp";

  const productPrice = product?.priceRange?.minVariantPrice?.amount || "0";

  const currency = product?.priceRange?.minVariantPrice?.currencyCode || "INR";

  /* ==========================================================
     WISHLIST HANDLER
     ========================================================== */

  const handleWishlist = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setWishlistActive((current) => !current);
  };

  /* ==========================================================
     CART HANDLER
     ========================================================== */

  const handleAddToCart = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const selectedColorName = selectedColor?.name || colors[0]?.name || "";

    const variant =
      product?.variants?.edges?.find((item: any) => {
        const options = item?.node?.selectedOptions || [];

        const colorOption = options.find(
          (option: any) => option?.name?.toLowerCase() === "color",
        );

        return !selectedColorName || colorOption?.value === selectedColorName;
      })?.node || product?.variants?.edges?.[0]?.node;

    try {
      const existingCart = JSON.parse(
        localStorage.getItem("opulence-cart") || "[]",
      );

      existingCart.push({
        id: variant?.id || product?.id,

        productId: product?.id,

        title: productTitle,

        variantTitle: variant?.title || selectedColorName,

        price: productPrice,

        currency,

        quantity: 1,

        image: productImage,

        color: selectedColorName,
      });

      localStorage.setItem("opulence-cart", JSON.stringify(existingCart));

      window.dispatchEvent(new Event("opulence-cart-updated"));

      setAddedToCart(true);

      setTimeout(() => {
        setAddedToCart(false);
      }, 1200);
    } catch {
      setAddedToCart(true);

      setTimeout(() => {
        setAddedToCart(false);
      }, 1200);
    }
  };

  /* ==========================================================
     COLOR HANDLER
     ========================================================== */

  const handleColorChange = (
    e: React.MouseEvent<HTMLButtonElement>,
    color: ProductColor,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    setSelectedColor(color);
  };

  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <article className="product-card">
      {/* ======================================================
          IMAGE AREA
          ====================================================== */}

      <div className="product-card__image-wrap">
        {/* PRODUCT IMAGE */}

        <Image
          src={productImage}
          alt={
            selectedColor
              ? `${productTitle} - ${selectedColor.name}`
              : productTitle
          }
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 25vw"
          className="product-card__image"
        />

        {/* ====================================================
            PRODUCT LINK
            ====================================================

            This is now a separate Link.

            No Link is placed inside another Link.
        */}

        <Link
          href={`/products/${productHandle}`}
          className="product-card__image-link"
          aria-label={`View ${productTitle}`}
        />

        {/* ====================================================
            HOVER OVERLAY
            ==================================================== */}

        <div className="product-card__overlay" />

        {/* ====================================================
            HOVER ACTIONS
            ==================================================== */}

        <div className="product-card__actions">
          {/* WISHLIST */}

          <button
            type="button"
            className={`product-card__action product-card__action--wishlist ${
              wishlistActive ? "is-active" : ""
            }`}
            aria-label={
              wishlistActive ? "Remove from wishlist" : "Add to wishlist"
            }
            onClick={handleWishlist}
          >
            <HeartIcon filled={wishlistActive} />
          </button>

          {/* CART */}

          <button
            type="button"
            className={`product-card__action product-card__action--cart ${
              addedToCart ? "is-added" : ""
            }`}
            aria-label="Add to cart"
            onClick={handleAddToCart}
          >
            <CartIcon />
          </button>

          {/* VIEW */}

          <Link
            href={`/products/${productHandle}`}
            className="product-card__action product-card__action--view"
            aria-label={`View ${productTitle}`}
          >
            <ArrowIcon />
          </Link>
        </div>

        {/* ====================================================
            BEST SELLER
            ==================================================== */}

        {product?.isBestSeller && (
          <span className="product-card__badge">BEST SELLER</span>
        )}
      </div>

      {/* ======================================================
          PRODUCT INFORMATION
          ====================================================== */}

      <div className="product-card__info">
        {/* TITLE */}

        <Link
          href={`/products/${productHandle}`}
          className="product-card__title"
        >
          {productTitle}
        </Link>

        {/* PRICE */}

        <div className="product-card__price">
          {currency} {productPrice}
        </div>

        {/* COLORS */}

        {colors.length > 0 && (
          <div className="product-card__colors">
            {colors.map((color, index) => {
              const isSelected = selectedColor?.name === color.name;

              return (
                <button
                  key={`${color.name}-${index}`}
                  type="button"
                  className={`product-card__color ${
                    isSelected ? "is-selected" : ""
                  }`}
                  style={{
                    backgroundColor: color.value,
                  }}
                  aria-label={`Select ${color.name}`}
                  title={color.name}
                  onClick={(e) => handleColorChange(e, color)}
                />
              );
            })}
          </div>
        )}
      </div>
    </article>
  );
}
