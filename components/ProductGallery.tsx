"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

type ProductImage = {
  url: string;
  altText?: string | null;
};

type ProductImageEdge = {
  node: ProductImage;
};

type ProductGalleryProps = {
  productTitle: string;
  productImages?: ProductImageEdge[];
  featuredImage?: ProductImage | null;
  firstAvailableVariantImage?: ProductImage | null;
  firstAvailableVariantColor?: string;
};

type VariantChangeDetail = {
  variantId?: string;
  image?: ProductImage | null;
  selectedOptions?: {
    name: string;
    value: string;
  }[];
};

export default function ProductGallery({
  productTitle,
  productImages = [],
  featuredImage = null,
  firstAvailableVariantImage = null,
  firstAvailableVariantColor = "",
}: ProductGalleryProps) {
  /* =========================================================
     BASE PRODUCT IMAGES
  ========================================================= */

  const baseImages = useMemo(() => {
    if (Array.isArray(productImages) && productImages.length > 0) {
      return productImages
        .map((edge) => edge?.node)
        .filter((image): image is ProductImage => Boolean(image?.url));
    }

    if (featuredImage?.url) {
      return [featuredImage];
    }

    return [];
  }, [productImages, featuredImage]);

  /* =========================================================
     SELECTED COLOR
  ========================================================= */

  const [selectedColor, setSelectedColor] = useState(
    firstAvailableVariantColor || "",
  );

  /* =========================================================
     VARIANT IMAGE
  ========================================================= */

  const [variantImage, setVariantImage] = useState<ProductImage | null>(
    firstAvailableVariantImage?.url ? firstAvailableVariantImage : null,
  );

  /* =========================================================
     ACTIVE IMAGE
  ========================================================= */

  const [activeImage, setActiveImage] = useState<ProductImage | null>(
    firstAvailableVariantImage?.url
      ? firstAvailableVariantImage
      : baseImages[0] || null,
  );

  /* =========================================================
     LIGHTBOX
  ========================================================= */

  const [lightboxOpen, setLightboxOpen] = useState(false);

  const [lightboxIndex, setLightboxIndex] = useState(0);

  /* =========================================================
     PERSISTED COLOR
  ========================================================= */

  const colorStorageKey = `opulence:selected-color:${productTitle}`;

  const [restoredColor, setRestoredColor] = useState("");

  const initialVariantEventHandled = useRef(false);

  /* =========================================================
     RESTORE COLOR AFTER RELOAD
  ========================================================= */

  useEffect(() => {
    try {
      const savedColor = localStorage.getItem(colorStorageKey)?.trim() || "";

      if (savedColor) {
        setRestoredColor(savedColor);
        setSelectedColor(savedColor);
      }
    } catch (error) {
      console.warn("Could not restore selected color:", error);
    }
  }, [colorStorageKey]);

  /* =========================================================
     SAVE COLOR
  ========================================================= */

  useEffect(() => {
    if (!selectedColor) return;

    try {
      localStorage.setItem(colorStorageKey, selectedColor);
    } catch (error) {
      console.warn("Could not save selected color:", error);
    }
  }, [selectedColor, colorStorageKey]);

  /* =========================================================
     VARIANT CHANGE EVENT
     
     ProductOptions.tsx theke event asbe.
  ========================================================= */

  useEffect(() => {
    function handleVariantChange(event: Event) {
      const customEvent = event as CustomEvent<VariantChangeDetail>;

      const newImage = customEvent.detail?.image || null;

      const selectedOptions = customEvent.detail?.selectedOptions || [];

      /* -------------------------------------------------------
         GET SELECTED COLOR
      ------------------------------------------------------- */

      const colorOption = selectedOptions.find(
        (option) => option.name.toLowerCase() === "color",
      );

      const newColor = colorOption?.value?.trim() || "";

      /*
       * After a full reload ProductOptions can briefly emit its
       * default variant before restoring the user's saved color.
       * Ignore that first different color so Red does not flash
       * back to Black. The restored variant event is accepted.
       */
      if (
        restoredColor &&
        !initialVariantEventHandled.current &&
        newColor &&
        newColor.toLowerCase() !== restoredColor.toLowerCase()
      ) {
        initialVariantEventHandled.current = true;
        return;
      }

      initialVariantEventHandled.current = true;

      if (newColor) {
        setSelectedColor(newColor);

        try {
          localStorage.setItem(colorStorageKey, newColor);
        } catch {}
      }

      /* -------------------------------------------------------
         VARIANT IMAGE
      ------------------------------------------------------- */

      if (newImage?.url) {
        setVariantImage(newImage);
        setActiveImage(newImage);
      } else {
        setVariantImage(null);

        /*
         * If selected variant doesn't have its own image,
         * use first image from selected color.
         */

        const fallbackColor = newColor || selectedColor;

        const colorImages = fallbackColor
          ? baseImages.filter((image) => {
              const alt = image.altText?.toLowerCase() || "";

              return alt.includes(fallbackColor.toLowerCase());
            })
          : [];

        setActiveImage(
          colorImages[0] || baseImages[0] || featuredImage || null,
        );
      }
    }

    window.addEventListener("opulence:variant-change", handleVariantChange);

    return () => {
      window.removeEventListener(
        "opulence:variant-change",
        handleVariantChange,
      );
    };
  }, [
    baseImages,
    featuredImage,
    selectedColor,
    restoredColor,
    colorStorageKey,
  ]);

  /* =========================================================
     BUILD COLOR GALLERY
     
     Shopify image Alt Text example:
     
     Black 1
     Black 2
     Black 3
     
     Red 1
     Red 2
     Red 3
  ========================================================= */

  const galleryImages = useMemo(() => {
    let colorImages: ProductImage[] = [];

    /* -------------------------------------------------------
       FILTER BY SELECTED COLOR
    ------------------------------------------------------- */

    if (selectedColor) {
      colorImages = baseImages.filter((image) => {
        const alt = image.altText?.toLowerCase().trim() || "";

        const color = selectedColor.toLowerCase().trim();

        return alt.includes(color);
      });
    }

    /* -------------------------------------------------------
       IF COLOR IMAGES FOUND
       
       Example:
       Black selected
       -> Black 1
       -> Black 2
       -> ...
       -> Black 10
    ------------------------------------------------------- */

    if (colorImages.length > 0) {
      return colorImages.slice(0, 10);
    }

    /* -------------------------------------------------------
       FALLBACK
       
       If Shopify Alt Text isn't set yet,
       use variant image + product images.
    ------------------------------------------------------- */

    const result: ProductImage[] = [];

    if (variantImage?.url) {
      result.push(variantImage);
    }

    baseImages.forEach((image) => {
      if (
        image?.url &&
        !result.some((existing) => existing.url === image.url)
      ) {
        result.push(image);
      }
    });

    return result.slice(0, 10);
  }, [selectedColor, baseImages, variantImage]);

  /* =========================================================
     KEEP ACTIVE IMAGE VALID
  ========================================================= */

  useEffect(() => {
    if (galleryImages.length === 0) {
      setActiveImage(null);
      return;
    }

    const activeStillExists =
      activeImage?.url &&
      galleryImages.some((image) => image.url === activeImage.url);

    if (!activeStillExists) {
      setActiveImage(galleryImages[0]);
    }
  }, [galleryImages, activeImage]);

  /* =========================================================
     UPDATE LIGHTBOX INDEX WHEN ACTIVE IMAGE CHANGES
  ========================================================= */

  useEffect(() => {
    if (!activeImage?.url) return;

    const index = galleryImages.findIndex(
      (image) => image.url === activeImage.url,
    );

    if (index >= 0) {
      setLightboxIndex(index);
    }
  }, [activeImage, galleryImages]);

  /* =========================================================
     OPEN LIGHTBOX
  ========================================================= */

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setActiveImage(galleryImages[index]);
    setLightboxOpen(true);
  };

  /* =========================================================
     CLOSE LIGHTBOX
  ========================================================= */

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  /* =========================================================
     NEXT IMAGE
  ========================================================= */

  const nextImage = () => {
    if (galleryImages.length <= 1) return;

    setLightboxIndex((current) => {
      const next = (current + 1) % galleryImages.length;

      setActiveImage(galleryImages[next]);

      return next;
    });
  };

  /* =========================================================
     PREVIOUS IMAGE
  ========================================================= */

  const previousImage = () => {
    if (galleryImages.length <= 1) return;

    setLightboxIndex((current) => {
      const previous =
        (current - 1 + galleryImages.length) % galleryImages.length;

      setActiveImage(galleryImages[previous]);

      return previous;
    });
  };

  /* =========================================================
     KEYBOARD CONTROL
     
     ESC   = close
     LEFT  = previous
     RIGHT = next
  ========================================================= */

  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeLightbox();
      }

      if (event.key === "ArrowRight") {
        nextImage();
      }

      if (event.key === "ArrowLeft") {
        previousImage();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);

      document.body.style.overflow = "";
    };
  }, [lightboxOpen, galleryImages.length]);

  /* =========================================================
     NO IMAGE
  ========================================================= */

  if (galleryImages.length === 0) {
    return (
      <div className="pdp-images">
        <div className="pdp-image">
          <div
            style={{
              width: "100%",
              height: "100%",
              minHeight: "400px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#f5f1ea",
            }}
          >
            <span>No image available</span>
          </div>
        </div>
      </div>
    );
  }

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <>
      {/* =====================================================
          PRODUCT IMAGE GALLERY
      ===================================================== */}

      <div className="pdp-images">
        {galleryImages.map((image, index) => {
          const isActive = activeImage?.url === image.url;

          return (
            <div
              key={`${image.url}-${index}`}
              className="pdp-image"
              onClick={() => openLightbox(index)}
              role="button"
              tabIndex={0}
              aria-label={`View ${productTitle} image ${index + 1}`}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  openLightbox(index);
                }
              }}
              style={{
                cursor: "zoom-in",
                position: "relative",
              }}
            >
              <Image
                src={image.url}
                alt={image.altText || `${productTitle} ${index + 1}`}
                fill
                sizes="(max-width: 768px) 90vw, 55vw"
                priority={index < 2}
                style={{
                  objectFit: "cover",
                }}
              />

              {/* ACTIVE DOT */}

              {isActive && (
                <span
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    left: "12px",
                    bottom: "12px",
                    width: "6px",
                    height: "6px",
                    borderRadius: "50%",
                    background: "#111",
                    zIndex: 5,
                  }}
                />
              )}

              {/* IMAGE NUMBER */}

              <span
                style={{
                  position: "absolute",
                  right: "12px",
                  bottom: "12px",
                  minWidth: "30px",
                  height: "30px",
                  padding: "0 8px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.92)",
                  color: "#111",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "11px",
                  zIndex: 5,
                }}
              >
                {index + 1}
              </span>

              {/* ZOOM ICON */}

              <span
                style={{
                  position: "absolute",
                  right: "12px",
                  top: "12px",
                  width: "34px",
                  height: "34px",
                  borderRadius: "50%",
                  background: "rgba(255,255,255,0.92)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "18px",
                  lineHeight: 1,
                  zIndex: 5,
                }}
                aria-hidden="true"
              >
                +
              </span>
            </div>
          );
        })}
      </div>

      {/* =====================================================
          LIGHTBOX
      ===================================================== */}

      {lightboxOpen && (
        <div
          className="opulence-lightbox"
          role="dialog"
          aria-modal="true"
          aria-label={`${productTitle} image gallery`}
          onClick={closeLightbox}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 99999,
            background: "rgba(0,0,0,0.94)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px",
          }}
        >
          {/* =================================================
              CLOSE
          ================================================= */}

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              closeLightbox();
            }}
            aria-label="Close image"
            style={{
              position: "absolute",
              top: "24px",
              right: "28px",
              zIndex: 20,
              width: "46px",
              height: "46px",
              border: "1px solid rgba(255,255,255,0.35)",
              background: "rgba(255,255,255,0.08)",
              color: "#fff",
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: "28px",
              lineHeight: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            ×
          </button>

          {/* =================================================
              COUNTER
          ================================================= */}

          <div
            style={{
              position: "absolute",
              top: "30px",
              left: "30px",
              zIndex: 20,
              color: "#fff",
              fontSize: "12px",
              letterSpacing: "0.12em",
            }}
          >
            {lightboxIndex + 1} / {galleryImages.length}
          </div>

          {/* =================================================
              PREVIOUS
          ================================================= */}

          {galleryImages.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                previousImage();
              }}
              aria-label="Previous image"
              style={{
                position: "absolute",
                left: "24px",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 20,
                width: "52px",
                height: "52px",
                border: "1px solid rgba(255,255,255,0.35)",
                background: "rgba(255,255,255,0.08)",
                color: "#fff",
                borderRadius: "50%",
                cursor: "pointer",
                fontSize: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ‹
            </button>
          )}

          {/* =================================================
              IMAGE
          ================================================= */}

          <div
            onClick={(event) => event.stopPropagation()}
            style={{
              position: "relative",
              width: "min(85vw, 1000px)",
              height: "min(85vh, 850px)",
            }}
          >
            {galleryImages[lightboxIndex]?.url && (
              <Image
                src={galleryImages[lightboxIndex].url}
                alt={
                  galleryImages[lightboxIndex].altText ||
                  `${productTitle} ${lightboxIndex + 1}`
                }
                fill
                sizes="90vw"
                priority
                style={{
                  objectFit: "contain",
                }}
              />
            )}
          </div>

          {/* =================================================
              NEXT
          ================================================= */}

          {galleryImages.length > 1 && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                nextImage();
              }}
              aria-label="Next image"
              style={{
                position: "absolute",
                right: "24px",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 20,
                width: "52px",
                height: "52px",
                border: "1px solid rgba(255,255,255,0.35)",
                background: "rgba(255,255,255,0.08)",
                color: "#fff",
                borderRadius: "50%",
                cursor: "pointer",
                fontSize: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              ›
            </button>
          )}

          {/* =================================================
              BOTTOM THUMBNAILS
          ================================================= */}

          {galleryImages.length > 1 && (
            <div
              onClick={(event) => event.stopPropagation()}
              style={{
                position: "absolute",
                bottom: "20px",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 20,
                display: "flex",
                gap: "8px",
                maxWidth: "90vw",
                overflowX: "auto",
                padding: "8px",
              }}
            >
              {galleryImages.map((image, index) => {
                const active = index === lightboxIndex;

                return (
                  <button
                    key={`lightbox-thumb-${index}`}
                    type="button"
                    onClick={() => {
                      setLightboxIndex(index);
                      setActiveImage(image);
                    }}
                    aria-label={`Open image ${index + 1}`}
                    style={{
                      position: "relative",
                      flex: "0 0 auto",
                      width: "64px",
                      height: "76px",
                      padding: 0,
                      overflow: "hidden",
                      border: active
                        ? "2px solid #fff"
                        : "1px solid rgba(255,255,255,0.35)",
                      background: "rgba(255,255,255,0.08)",
                      cursor: "pointer",
                    }}
                  >
                    <Image
                      src={image.url}
                      alt={image.altText || `Thumbnail ${index + 1}`}
                      fill
                      sizes="64px"
                      style={{
                        objectFit: "cover",
                      }}
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </>
  );
}
