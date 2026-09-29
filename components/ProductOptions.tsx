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
  image?: {
    url: string;
    altText?: string | null;
  } | null;
};

type ProductMetafield = {
  namespace?: string | null;
  key?: string | null;
  value?: string | null;
  type?: string | null;
} | null;

type Product = {
  id: string;
  title: string;
  handle: string;
  vendor?: string | null;
  metafields?: ProductMetafield[] | null;
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

/*
 * IMPORTANT:
 * Shopify can return null entries inside metafields.
 * Never access item.namespace/item.key before checking item.
 */
function getMetafieldValue(product: Product, key: string): string {
  const metafields = Array.isArray(product?.metafields)
    ? product.metafields.filter(Boolean)
    : [];

  const field = metafields.find(
    (item) => item?.namespace === "custom" && item?.key === key,
  );

  return typeof field?.value === "string" ? field.value.trim() : "";
}

export default function ProductOptions({
  product,
  variants,
}: ProductOptionsProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const availableVariants = useMemo(
    () => variants.filter((variant) => variant.availableForSale),
    [variants],
  );

  const getOptionValue = (variant: Variant, optionName: string) => {
    return (
      variant.selectedOptions?.find(
        (option) => option?.name?.toLowerCase() === optionName.toLowerCase(),
      )?.value || ""
    );
  };

  const sizeOptions = useMemo(() => {
    const sizes: string[] = [];

    variants.forEach((variant) => {
      const size = getOptionValue(variant, "Size");

      if (size && !sizes.includes(size)) {
        sizes.push(size);
      }
    });

    return sizes;
  }, [variants]);

  const colorOptions = useMemo(() => {
    const colors: string[] = [];

    variants.forEach((variant) => {
      const color =
        getOptionValue(variant, "Color") || getOptionValue(variant, "Colour");

      if (color && !colors.includes(color)) {
        colors.push(color);
      }
    });

    return colors;
  }, [variants]);

  const firstAvailable = availableVariants[0] || variants[0];

  const initialSize = firstAvailable
    ? getOptionValue(firstAvailable, "Size")
    : "";

  const initialColor = firstAvailable
    ? getOptionValue(firstAvailable, "Color") ||
      getOptionValue(firstAvailable, "Colour")
    : "";

  const [selectedSize, setSelectedSize] = useState(initialSize);
  const [selectedColor, setSelectedColor] = useState(initialColor);

  const colorStorageKey = `opulence:selected-color:${product.handle}`;
  const sizeStorageKey = `opulence:selected-size:${product.handle}`;

  const [selectionLoaded, setSelectionLoaded] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const [buying, setBuying] = useState(false);
  const [shareMessage, setShareMessage] = useState("");
  const [couponCopied, setCouponCopied] = useState(false);
  const [sizeChartOpen, setSizeChartOpen] = useState(false);
  const [deliveryPincode, setDeliveryPincode] = useState("");

  /*
   * Dynamic Shopify metafields.
   * If a metafield is not configured, the existing UI text is used.
   */
  const couponCode = getMetafieldValue(product, "coupon_code");

  const couponText = getMetafieldValue(product, "coupon_text");

  const hasCoupon = Boolean(couponCode);

  const returnPolicy = getMetafieldValue(product, "return_policy");

  const deliveryInfo =
    getMetafieldValue(product, "delivery_info") || "Delivery Details";

  const sizeGuideRaw = getMetafieldValue(product, "size_guide");

  useEffect(() => {
    try {
      const savedSize = localStorage.getItem(sizeStorageKey);
      const savedColor = localStorage.getItem(colorStorageKey);

      if (savedSize && sizeOptions.includes(savedSize)) {
        setSelectedSize(savedSize);
      }

      if (savedColor && colorOptions.includes(savedColor)) {
        setSelectedColor(savedColor);
      }
    } catch (error) {
      console.warn("Could not restore variant selection:", error);
    } finally {
      setSelectionLoaded(true);
    }
  }, [sizeStorageKey, colorStorageKey, sizeOptions, colorOptions]);

  useEffect(() => {
    if (!selectionLoaded) return;

    try {
      if (selectedSize) {
        localStorage.setItem(sizeStorageKey, selectedSize);
      }

      if (selectedColor) {
        localStorage.setItem(colorStorageKey, selectedColor);
      }
    } catch (error) {
      console.warn("Could not save variant selection:", error);
    }
  }, [
    selectionLoaded,
    selectedSize,
    selectedColor,
    sizeStorageKey,
    colorStorageKey,
  ]);

  useEffect(() => {
    if (!sizeChartOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSizeChartOpen(false);
      }
    };

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [sizeChartOpen]);

  const selectedVariant = useMemo(() => {
    if (!variants.length) return null;

    const exactMatch = variants.find((variant) => {
      const size = getOptionValue(variant, "Size");
      const color =
        getOptionValue(variant, "Color") || getOptionValue(variant, "Colour");

      const sizeMatches = !selectedSize || !size || size === selectedSize;

      const colorMatches = !selectedColor || !color || color === selectedColor;

      return sizeMatches && colorMatches;
    });

    return exactMatch || null;
  }, [variants, selectedSize, selectedColor]);

  const selectedVariantAvailable = Boolean(selectedVariant?.availableForSale);

  useEffect(() => {
    if (!selectedVariant) return;

    window.dispatchEvent(
      new CustomEvent("opulence:variant-change", {
        detail: {
          variantId: selectedVariant.id,
          image: selectedVariant.image || null,
          selectedOptions: selectedVariant.selectedOptions || [],
        },
      }),
    );
  }, [selectedVariant]);

  useEffect(() => {
    if (!variants.length) return;

    if (
      selectedSize &&
      sizeOptions.length > 0 &&
      !sizeOptions.includes(selectedSize)
    ) {
      setSelectedSize(sizeOptions[0] || "");
    }

    if (
      selectedColor &&
      colorOptions.length > 0 &&
      !colorOptions.includes(selectedColor)
    ) {
      setSelectedColor(colorOptions[0] || "");
    }
  }, [variants.length, sizeOptions, colorOptions, selectedSize, selectedColor]);

  function isSizeAvailable(size: string) {
    return variants.some((variant) => {
      const variantSize = getOptionValue(variant, "Size");
      const variantColor =
        getOptionValue(variant, "Color") || getOptionValue(variant, "Colour");

      const sizeMatch = variantSize === size;

      const colorMatch =
        !selectedColor || !variantColor || variantColor === selectedColor;

      return sizeMatch && colorMatch && variant.availableForSale;
    });
  }

  function isColorAvailable(color: string) {
    return variants.some((variant) => {
      const variantColor =
        getOptionValue(variant, "Color") || getOptionValue(variant, "Colour");

      const variantSize = getOptionValue(variant, "Size");

      const colorMatch = variantColor === color;

      const sizeMatch =
        !selectedSize || !variantSize || variantSize === selectedSize;

      return colorMatch && sizeMatch && variant.availableForSale;
    });
  }

  function handleSizeChange(size: string) {
    if (!isSizeAvailable(size)) return;
    setSelectedSize(size);
  }

  function handleColorChange(color: string) {
    if (!isColorAvailable(color)) return;
    setSelectedColor(color);
  }

  function decreaseQuantity() {
    setQuantity((current) => Math.max(1, current - 1));
  }

  function increaseQuantity() {
    setQuantity((current) => Math.min(99, current + 1));
  }

  const wishlisted = isWishlisted(product.handle);

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

  async function handleCopyCoupon() {
    try {
      await navigator.clipboard.writeText(couponCode);

      setCouponCopied(true);

      setTimeout(() => {
        setCouponCopied(false);
      }, 2000);
    } catch (error) {
      console.error("Coupon copy failed:", error);
    }
  }

  function getColorDot(color: string) {
    const value = color.toLowerCase().trim();

    const colors: Record<string, string> = {
      white: "#ffffff",
      black: "#111111",
      olive: "#708238",
      navy: "#18243d",
      red: "#9e2020",
      blue: "#315d9b",
      green: "#3d7048",
      grey: "#8b8b8b",
      gray: "#8b8b8b",
      beige: "#d8c8ad",
      brown: "#75543c",
      cream: "#eee5d4",
      maroon: "#6d1d2b",
      pink: "#d99aaa",
      purple: "#70518d",
      yellow: "#d6b83f",
      orange: "#c87532",
    };

    return colors[value] || color;
  }

  function renderSizeChart() {
    if (!sizeGuideRaw) {
      return (
        <div className="size-chart-table">
          <div className="size-chart-row size-chart-head">
            <span>Size</span>
            <span>Chest</span>
            <span>Length</span>
          </div>

          <div className="size-chart-row">
            <span>S</span>
            <span>38"</span>
            <span>27"</span>
          </div>

          <div className="size-chart-row">
            <span>M</span>
            <span>40"</span>
            <span>28"</span>
          </div>

          <div className="size-chart-row">
            <span>L</span>
            <span>42"</span>
            <span>29"</span>
          </div>

          <div className="size-chart-row">
            <span>XL</span>
            <span>44"</span>
            <span>30"</span>
          </div>

          <div className="size-chart-row">
            <span>XXL</span>
            <span>46"</span>
            <span>31"</span>
          </div>
        </div>
      );
    }

    try {
      const parsed = JSON.parse(sizeGuideRaw);

      if (Array.isArray(parsed) && parsed.length > 0) {
        const columns = Object.keys(parsed[0] || {});

        return (
          <div className="size-chart-table">
            <div className="size-chart-row size-chart-head">
              {columns.map((column) => (
                <span key={column}>{column}</span>
              ))}
            </div>

            {parsed.map((row, index) => (
              <div className="size-chart-row" key={index}>
                {columns.map((column) => (
                  <span key={column}>{String(row?.[column] ?? "")}</span>
                ))}
              </div>
            ))}
          </div>
        );
      }
    } catch {
      return (
        <div className="size-chart-table">
          <div className="size-chart-row" style={{ display: "block" }}>
            {sizeGuideRaw}
          </div>
        </div>
      );
    }

    return (
      <div className="size-chart-table">
        <div className="size-chart-row" style={{ display: "block" }}>
          {sizeGuideRaw}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="pdp-top-actions">
        <button
          type="button"
          className={`pdp-icon-button ${wishlisted ? "wishlist-active" : ""}`}
          aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
          onClick={() => toggleWishlist(product.handle)}
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

      {sizeOptions.length > 0 && (
        <div className="pdp-size-section">
          <div className="pdp-size-header">
            <span>
              Select Size: <strong>{selectedSize || "-"}</strong>
            </span>

            <button
              type="button"
              className="size-chart-button"
              onClick={() => setSizeChartOpen(true)}
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
                  className={`pdp-size ${
                    active ? "active" : ""
                  } ${!available ? "disabled" : ""}`}
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
                  className={`pdp-color ${
                    active ? "active" : ""
                  } ${!available ? "disabled" : ""}`}
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

      {hasCoupon && (
        <div className="pdp-deal">
          <div className="pdp-deal-title">
            <span>Deals of the Day</span>
            <span className="pdp-info-icon">i</span>
          </div>

          <div className="pdp-deal-box">
            <div className="pdp-deal-content">
              <strong>{couponCode}</strong>
              {couponText && <small>{couponText}</small>}
            </div>

            <button
              type="button"
              className="pdp-copy"
              onClick={handleCopyCoupon}
            >
              <span>{couponCopied ? "✓" : "□"}</span>
              <small>{couponCopied ? "COPIED" : "COPY"}</small>
            </button>
          </div>
        </div>
      )}

      <button
        type="button"
        className="pdp-buy-now"
        onClick={handleBuyNow}
        disabled={buying || !selectedVariantAvailable}
      >
        {buying ? "PLEASE WAIT..." : "BUY NOW"}
      </button>

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

      <div className="pdp-delivery">
        <span className="pdp-delivery-title">{deliveryInfo}</span>

        <div className="pdp-pincode">
          <input
            type="text"
            placeholder="Enter Delivery Pincode"
            value={deliveryPincode}
            onChange={(event) =>
              setDeliveryPincode(
                event.target.value.replace(/\D/g, "").slice(0, 6),
              )
            }
            maxLength={6}
            inputMode="numeric"
          />

          <button type="button" aria-label="Check delivery">
            →
          </button>
        </div>
      </div>

      {returnPolicy && (
        <div className="pdp-return">
          <span className="pdp-return-icon">◷</span>

          <span>{returnPolicy}</span>

          <button
            type="button"
            className="pdp-more-info"
            onClick={() => {
              const returnSection = document.getElementById("return-info");

              if (returnSection instanceof HTMLDetailsElement) {
                returnSection.open = true;
              }

              returnSection?.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }}
          >
            More Info
          </button>
        </div>
      )}

      {sizeChartOpen && (
        <div
          className="size-chart-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="size-chart-title"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              setSizeChartOpen(false);
            }
          }}
        >
          <div className="size-chart-modal">
            <button
              type="button"
              className="size-chart-close"
              aria-label="Close size chart"
              onClick={() => setSizeChartOpen(false)}
            >
              ×
            </button>

            <h3 id="size-chart-title">Size Chart</h3>

            {renderSizeChart()}
          </div>
        </div>
      )}
    </>
  );
}
