"use client";

import "./NewsletterBar.css";

import { useState } from "react";

export default function NewsletterBar() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    // TODO: Klaviyo/Mailchimp/Shopify Email API connect korte hobe
    setSubmitted(true);
  }

  return (
    <section className="newsletter-bar">
      {/* BACKGROUND VIDEO */}
      <video
        className="newsletter-bar-video"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      >
        <source src="/images/next_video.mp4" type="video/mp4" />
      </video>

      {/* VIDEO OVERLAY */}
      <div className="newsletter-bar-overlay" aria-hidden="true" />

      <div className="newsletter-bar-inner">
        <div className="newsletter-bar-text">
          <p className="section-eyebrow">Join The Club</p>

          <h2 className="newsletter-bar-title">
            Get 10% Off Your
            <br />
            First Order
          </h2>

          <p className="newsletter-bar-desc">
            Sign up and be the first to know about new arrivals, exclusive
            offers and more.
          </p>
        </div>

        <div className="newsletter-bar-action">
          {submitted ? (
            <div className="newsletter-success">
              <span className="newsletter-success-icon">✓</span>

              <div>
                <strong>You're on the list.</strong>

                <p>Check your inbox for your welcome offer.</p>
              </div>
            </div>
          ) : (
            <form className="newsletter-bar-form" onSubmit={handleSubmit}>
              <div className="newsletter-input-wrap">
                <input
                  type="email"
                  required
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label="Email address"
                />

                <button type="submit" aria-label="Subscribe">
                  <span>Subscribe</span>
                  <span className="newsletter-arrow">↗</span>
                </button>
              </div>

              <p className="newsletter-note">
                By subscribing, you agree to receive updates from Opulence.
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
