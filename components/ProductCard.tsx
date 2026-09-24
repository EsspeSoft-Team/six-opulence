"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";

import "./ProductCard.css";

import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";

/* ============================================================
   TYPES
============================================================ */

type ProductOption = {
  name: string;
  value: string;
};

type ProductVariant = {
  id: string;
  title?: string;
  availableForSale?: boolean;

  selectedOptions?: ProductOption[];

  image?: {
    url?: string;
    altText?: string | null;
  } | null;
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
   CLOSE ICON
============================================================ */

function CloseIcon() {
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
        d="M6 6L18 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />

      <path
        d="M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/* ============================================================
   PRODUCT CARD
============================================================ */

export default function ProductCard({ product }: ProductCardProps) {
  /* ==========================================================
     BASIC PRODUCT DATA
  ========================================================== */

  const productTitle = product?.title || "Product";

  const productHandle = product?.handle || "";

  const productImage = product?.featuredImage?.url || "/images/RR291044.webp";

  const productPrice = product?.priceRange?.minVariantPrice?.amount || "0";

  const currency = product?.priceRange?.minVariantPrice?.currencyCode || "INR";

  /* ==========================================================
     SHOPIFY VARIANTS
  ========================================================== */

  const variants: ProductVariant[] = useMemo(() => {
    const edges = product?.variants?.edges || [];

    return edges.map((edge: any) => edge?.node).filter(Boolean);
  }, [product]);

  /* ==========================================================
     GET OPTION VALUE
  ========================================================== */

  function getVariantOption(variant: ProductVariant, optionName: string) {
    return variant.selectedOptions?.find(
      (option) =>
        option.name?.trim().toLowerCase() === optionName.trim().toLowerCase(),
    )?.value;
  }

  /* ==========================================================
     SIZE OPTIONS
  ========================================================== */

  const sizes = useMemo(() => {
    const values = variants
      .flatMap((variant) => variant.selectedOptions || [])
      .filter((option) => option.name?.trim().toLowerCase() === "size")
      .map((option) => option.value);

    return Array.from(new Set(values));
  }, [variants]);

  /* ==========================================================
     COLOR OPTIONS
  ========================================================== */

  const colors = useMemo(() => {
    const values = variants
      .flatMap((variant) => variant.selectedOptions || [])
      .filter((option) => option.name?.trim().toLowerCase() === "color")
      .map((option) => option.value);

    return Array.from(new Set(values));
  }, [variants]);

  /* ==========================================================
     FIRST AVAILABLE VARIANT
  ========================================================== */

  const firstAvailableVariant = useMemo(() => {
    return (
      variants.find((variant) => variant.availableForSale !== false) ||
      variants[0] ||
      null
    );
  }, [variants]);

  /* ==========================================================
     CART
  ========================================================== */

  const { addItem } = useCart();

  /* ==========================================================
     WISHLIST
  ========================================================== */

  const { toggleWishlist, isWishlisted } = useWishlist();

  const wishlistActive = productHandle ? isWishlisted(productHandle) : false;

  /* ==========================================================
     STATES
  ========================================================== */

  const [showVariantPopup, setShowVariantPopup] = useState(false);

  const [selectedSize, setSelectedSize] = useState<string>("");

  const [selectedColor, setSelectedColor] = useState<string>("");

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    null,
  );

  const [addedToCart, setAddedToCart] = useState(false);

  const [adding, setAdding] = useState(false);

  /* ==========================================================
     FIND MATCHING VARIANT
  ========================================================== */

  function findMatchingVariant(size: string, color: string) {
    return (
      variants.find((variant) => {
        const variantSize = getVariantOption(variant, "Size");

        const variantColor = getVariantOption(variant, "Color");

        const sizeMatches = !sizes.length || !size || variantSize === size;

        const colorMatches = !colors.length || !color || variantColor === color;

        return sizeMatches && colorMatches;
      }) || null
    );
  }

  /* ==========================================================
     DISPLAY VARIANT
     
     IMPORTANT:
     
     Ei variant ta sudhu popup-er image
     display korar jonno.

     User Color change korlei eta immediately
     calculate hobe.

     Add To Cart click korar dorkar nei.
  ========================================================== */

  const displayVariant = useMemo(() => {
    if (!variants.length) {
      return null;
    }

    /*
     * First try exact Size + Color.
     */

    const exactVariant = variants.find((variant) => {
      const variantSize = getVariantOption(variant, "Size");

      const variantColor = getVariantOption(variant, "Color");

      const sizeMatches =
        !selectedSize || !sizes.length || variantSize === selectedSize;

      const colorMatches =
        !selectedColor || !colors.length || variantColor === selectedColor;

      return sizeMatches && colorMatches && variant.availableForSale !== false;
    });

    if (exactVariant) {
      return exactVariant;
    }

    /*
     * If Color is selected,
     * immediately find that color's
     * available variant.
     *
     * This is the important part for
     * instant image switching.
     */

    if (selectedColor) {
      const colorVariant = variants.find((variant) => {
        const variantColor = getVariantOption(variant, "Color");

        return (
          variantColor === selectedColor && variant.availableForSale !== false
        );
      });

      if (colorVariant) {
        return colorVariant;
      }
    }

    /*
     * If only Size is selected.
     */

    if (selectedSize) {
      const sizeVariant = variants.find((variant) => {
        const variantSize = getVariantOption(variant, "Size");

        return (
          variantSize === selectedSize && variant.availableForSale !== false
        );
      });

      if (sizeVariant) {
        return sizeVariant;
      }
    }

    return firstAvailableVariant;
  }, [
    variants,
    selectedSize,
    selectedColor,
    sizes.length,
    colors.length,
    firstAvailableVariant,
  ]);

  /* ==========================================================
     DISPLAY IMAGE
  ========================================================== */

  const displayImage = displayVariant?.image?.url || productImage;

  /* ==========================================================
     OPEN VARIANT POPUP
  ========================================================== */

  const handleOpenVariantPopup = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!variants.length) {
      alert("This product is currently unavailable.");

      return;
    }

    /*
     * Product has no options.
     * Directly add first variant.
     */

    if (sizes.length === 0 && colors.length === 0) {
      handleDirectAddToCart(firstAvailableVariant);

      return;
    }

    /*
     * Reset selection.
     */

    const initialSize = sizes.length === 1 ? sizes[0] : "";

    const initialColor = colors.length === 1 ? colors[0] : "";

    setSelectedSize(initialSize);

    setSelectedColor(initialColor);

    /*
     * Set matching initial variant.
     */

    const initialVariant = findMatchingVariant(initialSize, initialColor);

    setSelectedVariant(initialVariant);

    setShowVariantPopup(true);
  };

  /* ==========================================================
     DIRECT ADD TO CART
  ========================================================== */

  const handleDirectAddToCart = async (variant: ProductVariant | null) => {
    if (!variant?.id || variant.availableForSale === false) {
      alert("This product is currently unavailable.");

      return;
    }

    if (adding) {
      return;
    }

    try {
      setAdding(true);

      await addItem(variant.id, 1);

      setAddedToCart(true);

      setTimeout(() => {
        setAddedToCart(false);
      }, 1200);
    } catch (error) {
      console.error("Failed to add product to cart:", error);

      alert("Unable to add this product to cart. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  /* ==========================================================
     SIZE CLICK
  ========================================================== */

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);

    /*
     * Update selected variant immediately.
     */

    const variant = findMatchingVariant(size, selectedColor);

    setSelectedVariant(variant);
  };

  /* ==========================================================
     COLOR CLICK
  ========================================================== */

  const handleColorChange = (color: string) => {
    /*
     * IMPORTANT:
     *
     * Color change korlei image immediately
     * change korbe because displayVariant
     * selectedColor-er upor depend kore.
     */

    setSelectedColor(color);

    /*
     * Matching variant update kore rakhi
     * future Add To Cart-er jonno.
     */

    const variant = findMatchingVariant(selectedSize, color);

    setSelectedVariant(variant);
  };

  /* ==========================================================
     CONFIRM VARIANT / ADD TO CART
  ========================================================== */

  const handleConfirmVariant = async () => {
    /*
     * SIZE VALIDATION
     */

    if (sizes.length > 0 && !selectedSize) {
      alert("Please select a size.");

      return;
    }

    /*
     * COLOR VALIDATION
     */

    if (colors.length > 0 && !selectedColor) {
      alert("Please select a color.");

      return;
    }

    /*
     * Find exact Shopify variant.
     */

    const variant = findMatchingVariant(selectedSize, selectedColor);

    if (!variant) {
      alert("This combination is currently unavailable.");

      return;
    }

    if (variant.availableForSale === false) {
      alert("This selected option is currently unavailable.");

      return;
    }

    try {
      setAdding(true);

      /*
       * Add EXACT selected variant.
       */

      await addItem(variant.id, 1);

      setSelectedVariant(variant);

      setShowVariantPopup(false);

      setAddedToCart(true);

      setTimeout(() => {
        setAddedToCart(false);
      }, 1200);
    } catch (error) {
      console.error("Failed to add product to cart:", error);

      alert("Unable to add this product to cart. Please try again.");
    } finally {
      setAdding(false);
    }
  };

  /* ==========================================================
     WISHLIST
  ========================================================== */

  const handleWishlist = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (!productHandle) {
      return;
    }

    toggleWishlist(productHandle);
  };

  /* ==========================================================
     CLOSE POPUP
  ========================================================== */

  const handleClosePopup = () => {
    if (adding) {
      return;
    }

    setShowVariantPopup(false);
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <>
      <article className="product-card">
        {/* ==================================================
            PRODUCT IMAGE
        ================================================== */}

        <div className="product-card__image-wrap">
          <Image
            src={productImage}
            alt={productTitle}
            fill
            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 25vw"
            className="product-card__image"
          />

          <Link
            href={`/products/${productHandle}`}
            className="product-card__image-link"
            aria-label={`View ${productTitle}`}
          />

          <div className="product-card__overlay" />

          {/* ==================================================
              ACTIONS
          ================================================== */}

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

            {/* ADD TO CART */}

            <button
              type="button"
              className={`product-card__action product-card__action--cart ${
                addedToCart ? "is-added" : ""
              } ${adding ? "is-loading" : ""}`}
              aria-label={
                adding
                  ? "Adding to cart"
                  : addedToCart
                    ? "Added to cart"
                    : "Add to cart"
              }
              disabled={adding}
              onClick={handleOpenVariantPopup}
            >
              <CartIcon />
            </button>

            {/* VIEW PRODUCT */}

            <Link
              href={`/products/${productHandle}`}
              className="product-card__action product-card__action--view"
              aria-label={`View ${productTitle}`}
            >
              <ArrowIcon />
            </Link>
          </div>

          {/* BEST SELLER */}

          {product?.isBestSeller && (
            <span className="product-card__badge">BEST SELLER</span>
          )}
        </div>

        {/* ==================================================
            PRODUCT INFORMATION
        ================================================== */}

        <div className="product-card__info">
          <Link
            href={`/products/${productHandle}`}
            className="product-card__title"
          >
            {productTitle}
          </Link>

          <div className="product-card__price">
            {currency} {productPrice}
          </div>
        </div>
      </article>

      {/* ====================================================
          VARIANT POPUP
      ==================================================== */}

      {showVariantPopup && (
        <div className="product-variant-modal" onClick={handleClosePopup}>
          <div
            className="product-variant-modal__box"
            onClick={(e) => e.stopPropagation()}
          >
            {/* ==================================================
                HEADER
            ================================================== */}

            <div className="product-variant-modal__header">
              <div>
                <span className="product-variant-modal__eyebrow">
                  SELECT OPTIONS
                </span>

                <h3>{productTitle}</h3>
              </div>

              <button
                type="button"
                className="product-variant-modal__close"
                onClick={handleClosePopup}
                disabled={adding}
                aria-label="Close"
              >
                <CloseIcon />
              </button>
            </div>

            {/* ==================================================
                PRODUCT PREVIEW
            ================================================== */}

            <div className="product-variant-modal__product">
              <div className="product-variant-modal__image">
                <Image
                  key={displayImage}
                  src={displayImage}
                  alt={displayVariant?.image?.altText || productTitle}
                  fill
                  sizes="100px"
                  style={{
                    objectFit: "cover",
                  }}
                />
              </div>

              <div>
                <div className="product-variant-modal__product-title">
                  {productTitle}
                </div>

                <div className="product-variant-modal__product-price">
                  {currency} {productPrice}
                </div>
              </div>
            </div>

            {/* ==================================================
                SIZE
            ================================================== */}

            {sizes.length > 0 && (
              <div className="product-variant-modal__section">
                <div className="product-variant-modal__label-row">
                  <span>SIZE</span>

                  {selectedSize && <strong>{selectedSize}</strong>}
                </div>

                <div className="product-variant-modal__options">
                  {sizes.map((size) => {
                    const isSelected = selectedSize === size;

                    /*
                     * Check if this size
                     * is available with
                     * selected color.
                     */

                    const available = variants.some((variant) => {
                      const variantSize = getVariantOption(variant, "Size");

                      const variantColor = getVariantOption(variant, "Color");

                      const colorMatches =
                        !selectedColor ||
                        !colors.length ||
                        variantColor === selectedColor;

                      return (
                        variantSize === size &&
                        colorMatches &&
                        variant.availableForSale !== false
                      );
                    });

                    return (
                      <button
                        key={size}
                        type="button"
                        className={`product-variant-modal__size ${
                          isSelected ? "is-selected" : ""
                        } ${!available ? "is-disabled" : ""}`}
                        disabled={!available}
                        onClick={() => handleSizeChange(size)}
                      >
                        {size}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ==================================================
                COLOR
            ================================================== */}

            {colors.length > 0 && (
              <div className="product-variant-modal__section">
                <div className="product-variant-modal__label-row">
                  <span>COLOR</span>

                  {selectedColor && <strong>{selectedColor}</strong>}
                </div>

                <div className="product-variant-modal__options product-variant-modal__options--colors">
                  {colors.map((color) => {
                    const isSelected = selectedColor === color;

                    /*
                     * Check availability
                     * with selected size.
                     */

                    const available = variants.some((variant) => {
                      const variantColor = getVariantOption(variant, "Color");

                      const variantSize = getVariantOption(variant, "Size");

                      const sizeMatches =
                        !selectedSize ||
                        !sizes.length ||
                        variantSize === selectedSize;

                      return (
                        variantColor === color &&
                        sizeMatches &&
                        variant.availableForSale !== false
                      );
                    });

                    return (
                      <button
                        key={color}
                        type="button"
                        className={`product-variant-modal__color ${
                          isSelected ? "is-selected" : ""
                        } ${!available ? "is-disabled" : ""}`}
                        disabled={!available}
                        onClick={() => handleColorChange(color)}
                      >
                        <span
                          className="product-variant-modal__color-dot"
                          style={{
                            backgroundColor: getColorValue(color),
                          }}
                        />

                        <span>{color}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ==================================================
                CURRENT SELECTION
            ================================================== */}

            {selectedSize || selectedColor ? (
              <div className="product-variant-modal__selection">
                <span>YOUR SELECTION</span>

                <strong>
                  {[selectedSize, selectedColor].filter(Boolean).join(" / ")}
                </strong>
              </div>
            ) : (
              <div className="product-variant-modal__hint">
                Please select your preferred options before adding to cart.
              </div>
            )}

            {/* ==================================================
                ADD TO CART
            ================================================== */}

            <button
              type="button"
              className="product-variant-modal__add"
              disabled={adding}
              onClick={handleConfirmVariant}
            >
              {adding ? "ADDING..." : "ADD TO CART"}

              {!adding && <span>→</span>}
            </button>

            {/* ==================================================
                PRODUCT DETAILS
            ================================================== */}

            <Link
              href={`/products/${productHandle}`}
              className="product-variant-modal__details"
              onClick={handleClosePopup}
            >
              VIEW PRODUCT DETAILS
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

/* ============================================================
   COLOR HELPER
============================================================ */

function getColorValue(color: string) {
  const value = color.trim().toLowerCase();

  const colors: Record<string, string> = {
    black: "#111111",
    white: "#ffffff",
    red: "#b52222",
    blue: "#1f4f8f",
    navy: "#101c38",
    green: "#315b3b",
    olive: "#66704a",
    yellow: "#d6b12d",
    orange: "#d96b25",
    pink: "#d78391",
    purple: "#704d86",
    brown: "#72513e",
    beige: "#d9c5a7",
    cream: "#eee4d2",
    grey: "#8a8a8a",
    gray: "#8a8a8a",
  };

  return colors[value] || "#cccccc";
}
