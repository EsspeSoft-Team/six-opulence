"use client";

import "./ProductReviews.css";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";

type ProductReviewsProps = {
  productId: string;
  productHandle?: string;
};

type Review = {
  id: string;
  name: string;
  email?: string;
  rating: number;
  title?: string;
  review: string;
  createdAt?: string;
  verified?: boolean;
  pictures?: string[];
};

function normalizeReviewPictures(pictures: unknown): string[] {
  if (!Array.isArray(pictures)) {
    return [];
  }

  return pictures
    .map((picture: unknown) => {
      if (typeof picture === "string") {
        return picture.trim();
      }

      if (picture && typeof picture === "object") {
        const value = picture as {
          url?: unknown;
          image_url?: unknown;
          src?: unknown;
          hidden?: unknown;
        };

        if (value.hidden === true) {
          return "";
        }

        if (typeof value.url === "string") {
          return value.url.trim();
        }

        if (typeof value.image_url === "string") {
          return value.image_url.trim();
        }

        if (typeof value.src === "string") {
          return value.src.trim();
        }
      }

      return "";
    })
    .filter((url: string) => url.length > 0);
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);

  const [loading, setLoading] = useState(true);

  const [submitting, setSubmitting] = useState(false);

  const [showForm, setShowForm] = useState(false);

  const [showAllReviews, setShowAllReviews] = useState(false);

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [title, setTitle] = useState("");

  const [review, setReview] = useState("");

  const [rating, setRating] = useState(0);

  const [image, setImage] = useState<File | null>(null);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  /* ==========================================================
     LOAD REVIEWS
  ========================================================== */

  async function loadReviews() {
    try {
      setLoading(true);

      const response = await fetch(
        `/api/reviews?productId=${encodeURIComponent(productId)}`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const text = await response.text();

      let data: any = null;

      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        console.error("REVIEWS RAW RESPONSE:", text);

        throw new Error("Invalid reviews response.");
      }

      if (!response.ok) {
        throw new Error(data?.error || "Unable to load reviews.");
      }

      const incomingReviews = Array.isArray(data?.reviews) ? data.reviews : [];

      const normalizedReviews: Review[] = incomingReviews.map((item: any) => {
        const pictures = normalizeReviewPictures(
          Array.isArray(item?.pictures)
            ? item.pictures
            : Array.isArray(item?.picture_urls)
              ? item.picture_urls
              : [],
        );

        console.log("FRONTEND REVIEW IMAGE:", {
          reviewId: item?.id,
          name: item?.name,
          pictures,
        });

        return {
          id: String(item?.id || ""),
          name: String(item?.name || "Customer"),
          email: item?.email ? String(item.email) : "",
          rating: Number(item?.rating || 0),
          title: item?.title ? String(item.title) : "",
          review: String(item?.review || ""),
          createdAt: item?.createdAt ? String(item.createdAt) : "",
          verified: Boolean(item?.verified),
          pictures,
        };
      });

      setReviews(normalizedReviews);
    } catch (error) {
      console.error("LOAD REVIEWS ERROR:", error);

      setReviews([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!productId) return;

    loadReviews();
  }, [productId]);

  /* ==========================================================
     AVERAGE RATING
  ========================================================== */

  const averageRating = useMemo(() => {
    if (!reviews.length) {
      return 0;
    }

    const total = reviews.reduce(
      (sum, item) => sum + Number(item.rating || 0),
      0,
    );

    return total / reviews.length;
  }, [reviews]);

  /* ==========================================================
     STAR DISTRIBUTION
  ========================================================== */

  const ratingDistribution = useMemo(() => {
    return [5, 4, 3, 2, 1].map((star) => {
      const count = reviews.filter(
        (item) => Number(item.rating) === star,
      ).length;

      const percentage = reviews.length ? (count / reviews.length) * 100 : 0;

      return {
        star,
        count,
        percentage,
      };
    });
  }, [reviews]);

  /* ==========================================================
     IMAGE CHANGE
  ========================================================== */

  function handleImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) {
      setImage(null);
      return;
    }

    const allowed = ["image/jpeg", "image/png", "image/webp"];

    if (!allowed.includes(file.type)) {
      setError("Only JPG, PNG and WEBP images are allowed.");

      event.target.value = "";
      setImage(null);

      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be 5MB or less.");

      event.target.value = "";
      setImage(null);

      return;
    }

    setError("");
    setImage(file);
  }

  /* ==========================================================
     SUBMIT REVIEW
  ========================================================== */

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setMessage("");
    setError("");

    if (!rating) {
      setError("Please select a rating.");
      return;
    }

    if (!name.trim()) {
      setError("Please enter your name.");
      return;
    }

    if (!email.trim()) {
      setError("Please enter your email.");
      return;
    }

    if (!review.trim()) {
      setError("Please write your review.");
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();

      formData.append("productId", productId);
      formData.append("name", name.trim());
      formData.append("email", email.trim());
      formData.append("title", title.trim());
      formData.append("rating", String(rating));
      formData.append("review", review.trim());

      if (image) {
        formData.append("image", image);
      }

      const response = await fetch("/api/reviews", {
        method: "POST",
        body: formData,
      });

      const text = await response.text();

      let data: any = null;

      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        console.error("SUBMIT RAW RESPONSE:", text);

        throw new Error("Invalid server response.");
      }

      if (!response.ok) {
        throw new Error(data?.error || "Unable to submit review.");
      }

      setMessage(
        data?.message ||
          "Thank you. Your review has been submitted and is awaiting approval.",
      );

      setName("");
      setEmail("");
      setTitle("");
      setReview("");
      setRating(0);
      setImage(null);

      const fileInput = document.getElementById(
        "review-image",
      ) as HTMLInputElement | null;

      if (fileInput) {
        fileInput.value = "";
      }

      /*
       * Refresh after submission.
       *
       * If Judge.me auto-publish is enabled,
       * the new review can appear after refresh.
       */
      setTimeout(() => {
        loadReviews();
      }, 1200);
    } catch (error) {
      console.error("SUBMIT REVIEW ERROR:", error);

      setError(
        error instanceof Error ? error.message : "Unable to submit review.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  /* ==========================================================
     STARS
  ========================================================== */

  function renderStars(value: number, clickable = false) {
    const safeValue = Math.max(0, Math.min(5, Number(value) || 0));

    return (
      <div
        className="op-review-stars"
        aria-label={`${safeValue} out of 5 stars`}
      >
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            disabled={!clickable}
            aria-label={`${star} star`}
            onClick={() => {
              if (clickable) {
                setRating(star);
              }
            }}
            className={`op-review-star ${
              star <= safeValue ? "is-active" : ""
            } ${clickable ? "is-clickable" : "is-static"}`}
          >
            ★
          </button>
        ))}
      </div>
    );
  }

  /* ==========================================================
     REVIEW IMAGE URL
  ========================================================== */

  function getReviewImageUrl(imageUrl: string) {
    if (!imageUrl || !imageUrl.trim()) {
      return "";
    }

    return `/api/reviews/image?url=${encodeURIComponent(imageUrl)}`;
  }

  /* ==========================================================
     DATE
  ========================================================== */

  function formatDate(date?: string) {
    if (!date) return "";

    const parsed = new Date(date);

    if (Number.isNaN(parsed.getTime())) {
      return "";
    }

    return parsed.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }

  /* ==========================================================
     VISIBLE REVIEWS
  ========================================================== */

  const visibleReviews = showAllReviews ? reviews : reviews.slice(0, 3);

  /* ==========================================================
     RETURN
  ========================================================== */

  return (
    <>
      <section id="product-reviews" className="op-reviews-section">
        <div className="op-reviews-container">
          {/* ==================================================
              HEADER
          ================================================== */}

          <div className="op-reviews-heading">
            <span className="op-reviews-eyebrow">CUSTOMER REVIEWS</span>

            <h2>What our customers say</h2>

            <p>Real experiences from people who chose Opulence.</p>
          </div>

          {/* ==================================================
              SUMMARY
          ================================================== */}

          <div className="op-reviews-summary">
            <div className="op-review-score">
              <div className="op-review-score-number">
                {reviews.length ? averageRating.toFixed(1) : "0.0"}
              </div>

              {renderStars(Math.round(averageRating))}

              <span>
                {reviews.length} {reviews.length === 1 ? "review" : "reviews"}
              </span>
            </div>

            <div className="op-review-breakdown">
              {ratingDistribution.map(({ star, count, percentage }) => (
                <div key={star} className="op-review-bar-row">
                  <span className="op-review-bar-star">{star}</span>

                  <div className="op-review-bar">
                    <span
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>

                  <span className="op-review-bar-count">{count}</span>
                </div>
              ))}
            </div>

            <div className="op-review-write">
              <p>Have you tried this product?</p>

              <button
                type="button"
                onClick={() => setShowForm((current) => !current)}
              >
                {showForm ? "Close review form" : "Write a review"}
              </button>
            </div>
          </div>

          {/* ==================================================
              SUCCESS
          ================================================== */}

          {message && (
            <div className="op-review-message op-review-success">{message}</div>
          )}

          {/* ==================================================
              ERROR
          ================================================== */}

          {error && (
            <div className="op-review-message op-review-error">{error}</div>
          )}

          {/* ==================================================
              FORM
          ================================================== */}

          {showForm && (
            <div className="op-review-form-wrap">
              <div className="op-review-form-header">
                <div>
                  <span>SHARE YOUR EXPERIENCE</span>

                  <h3>Write a review</h3>
                </div>

                <button type="button" onClick={() => setShowForm(false)}>
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="op-review-form">
                {/* NAME */}

                <div className="op-review-field">
                  <label htmlFor="review-name">Name</label>

                  <input
                    id="review-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    maxLength={100}
                  />
                </div>

                {/* EMAIL */}

                <div className="op-review-field">
                  <label htmlFor="review-email">Email</label>

                  <input
                    id="review-email"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="you@example.com"
                  />

                  <small>Your email will not be displayed publicly.</small>
                </div>

                {/* RATING */}

                <div className="op-review-field">
                  <label>Rating</label>

                  {renderStars(rating, true)}
                </div>

                {/* TITLE */}

                <div className="op-review-field">
                  <label htmlFor="review-title">Review title</label>

                  <input
                    id="review-title"
                    type="text"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="Give your review a title"
                    maxLength={200}
                  />
                </div>

                {/* REVIEW */}

                <div className="op-review-field op-review-field-full">
                  <label htmlFor="review-body">Your review</label>

                  <textarea
                    id="review-body"
                    value={review}
                    onChange={(event) => setReview(event.target.value)}
                    placeholder="Tell us about your experience..."
                    maxLength={3000}
                    rows={6}
                  />
                </div>

                {/* IMAGE */}

                <div className="op-review-field op-review-field-full">
                  <label htmlFor="review-image">Add a photo</label>

                  <div className="op-review-upload">
                    <input
                      id="review-image"
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleImageChange}
                    />

                    <span>JPG, PNG or WEBP · Max 5MB</span>
                  </div>

                  {image && (
                    <div className="op-review-selected-file">
                      Selected: {image.name}
                    </div>
                  )}
                </div>

                {/* HONEYPOT */}

                <div className="op-review-hidden" aria-hidden="true">
                  <input
                    type="text"
                    name="website"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                {/* SUBMIT */}

                <div className="op-review-form-submit">
                  <button type="submit" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit review"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* ==================================================
              REVIEWS
          ================================================== */}

          <div className="op-review-list">
            {loading ? (
              <div className="op-review-loading">
                Loading customer reviews...
              </div>
            ) : reviews.length === 0 ? (
              <div className="op-review-empty">
                <span>NO REVIEWS YET</span>

                <h3>Be the first to share your experience.</h3>

                <button type="button" onClick={() => setShowForm(true)}>
                  Write a review
                </button>
              </div>
            ) : (
              <>
                <div className="op-review-grid">
                  {visibleReviews.map((item) => (
                    <article key={item.id} className="op-review-card">
                      {/* CARD TOP */}

                      <div className="op-review-card-top">
                        <div className="op-review-customer">
                          <div className="op-review-avatar">
                            {item.name.charAt(0).toUpperCase()}
                          </div>

                          <div>
                            <div className="op-review-name-row">
                              <h4>{item.name}</h4>

                              {item.verified && (
                                <span className="op-review-verified">
                                  ✓ Verified
                                </span>
                              )}
                            </div>

                            {item.createdAt && (
                              <span className="op-review-date">
                                {formatDate(item.createdAt)}
                              </span>
                            )}
                          </div>
                        </div>

                        {renderStars(item.rating)}
                      </div>

                      {/* TITLE */}

                      {item.title && (
                        <h3 className="op-review-title">{item.title}</h3>
                      )}

                      {/* BODY */}

                      <p className="op-review-body">{item.review}</p>

                      {/* ==================================================
                        REVIEW IMAGE
                    ================================================== */}

                      {Array.isArray(item.pictures) &&
                        item.pictures.length > 0 && (
                          <div className="op-review-images">
                            {item.pictures.map((imageUrl, index) => {
                              const proxiedImageUrl =
                                getReviewImageUrl(imageUrl);

                              if (!imageUrl) {
                                return null;
                              }

                              return (
                                <button
                                  key={`${item.id}-${index}`}
                                  type="button"
                                  className="op-review-image"
                                  onClick={() => setSelectedImage(imageUrl)}
                                  aria-label="View customer photo"
                                >
                                  <img
                                    src={imageUrl}
                                    alt={`Customer review by ${item.name}`}
                                    loading="lazy"
                                    decoding="async"
                                    referrerPolicy="no-referrer"
                                    onError={(event) => {
                                      const img = event.currentTarget;

                                      if (
                                        proxiedImageUrl &&
                                        img.src !==
                                          new URL(
                                            proxiedImageUrl,
                                            window.location.origin,
                                          ).href
                                      ) {
                                        console.warn(
                                          "Direct review image failed, trying proxy:",
                                          imageUrl,
                                        );

                                        img.src = proxiedImageUrl;
                                        return;
                                      }

                                      console.error(
                                        "Review image failed:",
                                        imageUrl,
                                      );

                                      img.parentElement?.classList.add(
                                        "is-hidden",
                                      );
                                    }}
                                  />
                                </button>
                              );
                            })}
                          </div>
                        )}
                    </article>
                  ))}
                </div>

                {reviews.length > 3 && (
                  <div className="op-review-view-all">
                    <button
                      type="button"
                      onClick={() => setShowAllReviews((current) => !current)}
                    >
                      {showAllReviews ? "Show less" : "View all reviews"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      {/* ======================================================
          IMAGE LIGHTBOX
      ====================================================== */}

      {selectedImage && (
        <div
          className="op-review-lightbox"
          role="dialog"
          aria-modal="true"
          onClick={() => setSelectedImage(null)}
        >
          <button
            type="button"
            className="op-review-lightbox-close"
            onClick={() => setSelectedImage(null)}
            aria-label="Close image"
          >
            ×
          </button>

          <img
            src={selectedImage}
            alt="Customer review"
            loading="eager"
            decoding="async"
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}
