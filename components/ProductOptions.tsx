"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/wishlist-context";

type SelectedOption = {
  name: string;
  value: string;
};

type VariantPrice = {
  amount: string;
  currencyCode: string;
};

type Variant = {
  id: string;
  title: string;
  availableForSale: boolean;
  price: VariantPrice;
  selectedOptions?: SelectedOption[];
};

type Product = {
  id: string;
  title: string;
  handle: string;
};

type ProductOptionsProps = {
  product: Product;
  variants: Variant[];
};

function ShareIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle cx="18" cy="5" r="2.2" stroke="currentColor" strokeWidth="1.4" />

      <circle cx="6" cy="12" r="2.2" stroke="currentColor" strokeWidth="1.4" />

      <circle cx="18" cy="19" r="2.2" stroke="currentColor" strokeWidth="1.4" />

      <path
        d="M8 10.9L15.9 6.2"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />

      <path
        d="M8 13.1L15.9 17.8"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function HeartIcon({ active }: { active: boolean }) {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill={active ? "currentColor" : "none"}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M20.84 4.61C19.81 3.58 18.43 3 17 3C15.57 3 14.19 3.58 13.16 4.61L12 5.77L10.84 4.61C8.7 2.47 5.23 2.47 3.09 4.61C0.95 6.75 0.95 10.22 3.09 12.36L12 21.27L20.91 12.36C23.05 10.22 23.05 6.75 20.84 4.61Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function ProductOptions({
  product,
  variants,
}: ProductOptionsProps) {
  const router = useRouter();

  const { addItem } = useCart();

  const { toggleWishlist, isWishlisted } = useWishlist();

  /* =========================================================
     VARIANT DATA
  ========================================================= */

  const availableVariants = useMemo(() => {
    return variants.filter((variant) => variant.availableForSale);
  }, [variants]);

  const getOptionValue = (variant: Variant, optionName: string) => {
    return (
      variant.selectedOptions?.find(
        (option) => option.name.toLowerCase() === optionName.toLowerCase(),
      )?.value || ""
    );
  };

  /* =========================================================
     AVAILABLE SIZES
  ========================================================= */

  const sizeOptions = useMemo(() => {
    const sizes: string[] = [];

    variants.forEach((variant) => {
      const size = getOptionValue(variant, "Size");

      if (size && !sizes.includes(size)) {
        sizes.push(size);
      }
    });

    return sizes.length ? sizes : ["S", "M", "L", "XL", "XXL"];
  }, [variants]);

  /* =========================================================
     AVAILABLE COLORS
  ========================================================= */

  const colorOptions = useMemo(() => {
    const colors: string[] = [];

    variants.forEach((variant) => {
      const color = getOptionValue(variant, "Color");

      if (color && !colors.includes(color)) {
        colors.push(color);
      }
    });

    return colors;
  }, [variants]);

  /* =========================================================
     DEFAULT SELECTION
  ========================================================= */

  const firstAvailable = availableVariants[0] || variants[0];

  const initialSize = firstAvailable
    ? getOptionValue(firstAvailable, "Size")
    : sizeOptions[0] || "S";

  const initialColor = firstAvailable
    ? getOptionValue(firstAvailable, "Color")
    : colorOptions[0] || "";

  const [selectedSize, setSelectedSize] = useState(
    initialSize || sizeOptions[0] || "S",
  );

  const [selectedColor, setSelectedColor] = useState(
    initialColor || colorOptions[0] || "",
  );

  /* =========================================================
     QUANTITY
  ========================================================= */

  const [quantity, setQuantity] = useState(1);

  /* =========================================================
     LOADING
  ========================================================= */

  const [adding, setAdding] = useState(false);

  const [buying, setBuying] = useState(false);

  /* =========================================================
     SHARE
  ========================================================= */

  const [shareMessage, setShareMessage] = useState("");

  /* =========================================================
     COUPON
  ========================================================= */

  const [couponCopied, setCouponCopied] = useState(false);

  /* =========================================================
     CURRENT VARIANT
  ========================================================= */

  const selectedVariant = useMemo(() => {
    if (!variants.length) {
      return null;
    }

    const exactMatch = variants.find((variant) => {
      const size = getOptionValue(variant, "Size");

      const color = getOptionValue(variant, "Color");

      const sizeMatches = !selectedSize || !size || size === selectedSize;

      const colorMatches = !selectedColor || !color || color === selectedColor;

      return sizeMatches && colorMatches;
    });

    return exactMatch || null;
  }, [variants, selectedSize, selectedColor]);

  /* =========================================================
     AVAILABLE CHECK
  ========================================================= */

  const selectedVariantAvailable = Boolean(selectedVariant?.availableForSale);

  /* =========================================================
     RESET INVALID SELECTION
  ========================================================= */

  useEffect(() => {
    if (!variants.length) return;

    const validSize = sizeOptions.includes(selectedSize);

    if (!validSize) {
      setSelectedSize(sizeOptions[0] || "");
    }
  }, [sizeOptions, selectedSize, variants.length]);

  /* =========================================================
     SIZE AVAILABILITY
  ========================================================= */

  function isSizeAvailable(size: string) {
    return variants.some((variant) => {
      const variantSize = getOptionValue(variant, "Size");

      const variantColor = getOptionValue(variant, "Color");

      const sizeMatch = variantSize === size;

      const colorMatch =
        !selectedColor || !variantColor || variantColor === selectedColor;

      return sizeMatch && colorMatch && variant.availableForSale;
    });
  }

  /* =========================================================
     COLOR AVAILABILITY
  ========================================================= */

  function isColorAvailable(color: string) {
    return variants.some((variant) => {
      const variantColor = getOptionValue(variant, "Color");

      const variantSize = getOptionValue(variant, "Size");

      const colorMatch = variantColor === color;

      const sizeMatch =
        !selectedSize || !variantSize || variantSize === selectedSize;

      return colorMatch && sizeMatch && variant.availableForSale;
    });
  }

  /* =========================================================
     SIZE CHANGE
  ========================================================= */

  function handleSizeChange(size: string) {
    if (!isSizeAvailable(size)) {
      return;
    }

    setSelectedSize(size);
  }

  /* =========================================================
     COLOR CHANGE
  ========================================================= */

  function handleColorChange(color: string) {
    if (!isColorAvailable(color)) {
      return;
    }

    setSelectedColor(color);
  }

  /* =========================================================
     QUANTITY
  ========================================================= */

  function decreaseQuantity() {
    setQuantity((current) => Math.max(1, current - 1));
  }

  function increaseQuantity() {
    setQuantity((current) => Math.min(99, current + 1));
  }

  /* =========================================================
     WISHLIST
  ========================================================= */

  const wishlisted = isWishlisted(product.handle);

  function handleWishlist() {
    toggleWishlist(product.handle);
  }

  /* =========================================================
     ADD TO CART
  ========================================================= */

  async function handleAddToCart() {
    if (!selectedVariant) {
      alert("Please select an available size and color.");
      return;
    }

    if (!selectedVariant.availableForSale) {
      alert("This variant is currently unavailable.");
      return;
    }

    if (adding) return;

    try {
      setAdding(true);

      await addItem(selectedVariant.id, quantity);
    } catch (error) {
      console.error("Add to cart failed:", error);

      alert("Unable to add this product to cart. Please try again.");
    } finally {
      setAdding(false);
    }
  }

  /* =========================================================
     BUY NOW
  ========================================================= */

  async function handleBuyNow() {
    if (!selectedVariant) {
      alert("Please select an available size and color.");
      return;
    }

    if (!selectedVariant.availableForSale) {
      alert("This variant is currently unavailable.");
      return;
    }

    if (buying) return;

    try {
      setBuying(true);

      await addItem(selectedVariant.id, quantity);

      router.push("/cart");
    } catch (error) {
      console.error("Buy now failed:", error);

      alert("Unable to continue. Please try again.");

      setBuying(false);
    }
  }

  /* =========================================================
     SHARE
  ========================================================= */

  async function handleShare() {
    try {
      const url = window.location.href;

      if (navigator.share) {
        await navigator.share({
          title: product.title,
          text: `Check out ${product.title} on OPULENCE.`,
          url,
        });

        return;
      }

      await navigator.clipboard.writeText(url);

      setShareMessage("Link copied");

      setTimeout(() => {
        setShareMessage("");
      }, 2000);
    } catch (error) {
      console.error("Share failed:", error);
    }
  }

  /* =========================================================
     COPY COUPON
  ========================================================= */

  async function handleCopyCoupon() {
    try {
      await navigator.clipboard.writeText("OPULENCE10");

      setCouponCopied(true);

      setTimeout(() => {
        setCouponCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Coupon copy failed:", error);
    }
  }

  /* =========================================================
     COLOR DOT
  ========================================================= */

  function getColorDot(color: string) {
    const value = color.toLowerCase();

    if (value === "white") {
      return "#ffffff";
    }

    if (value === "black") {
      return "#111111";
    }

    if (value === "olive") {
      return "#708238";
    }

    if (value === "navy") {
      return "#18243d";
    }

    if (value === "red") {
      return "#9e2020";
    }

    if (value === "blue") {
      return "#315d9b";
    }

    if (value === "green") {
      return "#3d7048";
    }

    if (value === "grey" || value === "gray") {
      return "#8b8b8b";
    }

    if (value === "beige") {
      return "#d8c8ad";
    }

    if (value === "brown") {
      return "#75543c";
    }

    return color;
  }

  return (
    <>
      {/* =====================================================
          WISHLIST + SHARE
      ====================================================== */}

      <div className="pdp-top-actions">
        <button
          type="button"
          className={`pdp-icon-button ${wishlisted ? "wishlist-active" : ""}`}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={handleWishlist}
        >
          <HeartIcon active={wishlisted} />
        </button>

        <button
          type="button"
          className="pdp-icon-button"
          aria-label="Share product"
          onClick={handleShare}
        >
          <ShareIcon />
        </button>

        {shareMessage && (
          <span
            style={{
              fontSize: "12px",
              marginLeft: "8px",
            }}
          >
            {shareMessage}
          </span>
        )}
      </div>

      {/* =====================================================
          SIZE
      ====================================================== */}

      <div className="pdp-size-section">
        <div className="pdp-size-header">
          <span>
            Select Size: <strong>{selectedSize || "-"}</strong>
          </span>

          <button
            type="button"
            className="size-chart-button"
            onClick={() => {
              document.getElementById("size-chart")?.scrollIntoView({
                behavior: "smooth",
              });
            }}
          >
            Size Chart
          </button>
        </div>

        <div className="pdp-sizes">
          {sizeOptions.map((size) => {
            const available = isSizeAvailable(size);

            const active = selectedSize === size;

            return (
              <button
                key={size}
                type="button"
                className={`pdp-size ${active ? "active" : ""} ${
                  !available ? "disabled" : ""
                }`}
                disabled={!available}
                onClick={() => handleSizeChange(size)}
              >
                {size}
              </button>
            );
          })}
        </div>
      </div>

      {/* =====================================================
          COLOR
      ====================================================== */}

      {colorOptions.length > 0 && (
        <div className="pdp-color-section">
          <div className="pdp-color-header">
            <span>
              Select Color: <strong>{selectedColor || "-"}</strong>
            </span>
          </div>

          <div className="pdp-colors">
            {colorOptions.map((color) => {
              const available = isColorAvailable(color);

              const active = selectedColor === color;

              return (
                <button
                  key={color}
                  type="button"
                  className={`pdp-color ${active ? "active" : ""} ${
                    !available ? "disabled" : ""
                  }`}
                  disabled={!available}
                  onClick={() => handleColorChange(color)}
                >
                  <span
                    className="pdp-color-dot"
                    style={{
                      background: getColorDot(color),
                    }}
                  />

                  <span>{color}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* =====================================================
    QUANTITY
            ====================================================== */}

      <div className="pdp-quantity-section">
        <div>
          <span>Quantity</span>

          <div className="pdp-quantity">
            <button
              type="button"
              onClick={decreaseQuantity}
              disabled={quantity <= 1}
              aria-label="Decrease quantity"
            >
              −
            </button>

            <span>{quantity}</span>

            <button
              type="button"
              onClick={increaseQuantity}
              disabled={quantity >= 99}
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* =====================================================
          DEAL
      ====================================================== */}

      <div className="pdp-deal">
        <div className="pdp-deal-title">
          <span>Deals of the Day</span>

          <span className="pdp-info-icon">i</span>
        </div>

        <div className="pdp-deal-box">
          <div className="pdp-deal-content">
            <strong>OPULENCE10</strong>

            <small>Get 10% Off On First Purchase</small>
          </div>

          <button type="button" className="pdp-copy" onClick={handleCopyCoupon}>
            <span>{couponCopied ? "✓" : "□"}</span>

            <small>{couponCopied ? "COPIED" : "COPY"}</small>
          </button>
        </div>
      </div>

      {/* =====================================================
          BUY NOW
      ====================================================== */}

      <button
        type="button"
        className="pdp-buy-now"
        onClick={handleBuyNow}
        disabled={buying || !selectedVariantAvailable}
      >
        {buying ? "PLEASE WAIT..." : "BUY NOW"}
      </button>

      {/* =====================================================
          ADD TO CART
      ====================================================== */}

      <div className="pdp-add-bag">
        <button
          type="button"
          className="pdp-add-button"
          onClick={handleAddToCart}
          disabled={adding || !selectedVariantAvailable}
        >
          {adding ? "ADDING..." : "ADD TO CART"}
        </button>
      </div>

      {/* =====================================================
          DELIVERY
      ====================================================== */}

      <div className="pdp-delivery">
        <span className="pdp-delivery-title">Delivery Details</span>

        <div className="pdp-pincode">
          <input
            type="text"
            placeholder="Enter Delivery Pincode"
            maxLength={6}
            inputMode="numeric"
          />

          <button type="button" aria-label="Check delivery">
            →
          </button>
        </div>
      </div>

      {/* =====================================================
          RETURN
      ====================================================== */}

      <div className="pdp-return">
        <span className="pdp-return-icon">◷</span>

        <span>15 days returns / exchange available</span>

        <a href="#return-info">More Info</a>
      </div>
    </>
  );
}
