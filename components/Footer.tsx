"use client";

import React from "react";
import "./Footer.css";
import { FaInstagram, FaLinkedinIn, FaEnvelope } from "react-icons/fa";

const Footer = () => {
  const handleBackToTop = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <footer className="opulence-footer">
      {/* =========================================
          MAIN FOOTER
      ========================================== */}
      <div className="opulence-footer-inner">
        {/* LOGO */}
        <div className="opulence-footer-logo">
          <img
            src="/images/opulence white.png"
            alt="OPULENCE"
            className="opulence-logo-img"
          />
        </div>

        {/* TAGLINE */}
        <div className="opulence-tagline">The Art Of Affluence</div>

        {/* =========================================
            NAVIGATION
        ========================================== */}
        <nav className="opulence-footer-nav">
          <a href="/track-order">Track Order</a>

          <a href="/privacy-policy">Privacy Policy</a>

          <a href="/terms-and-conditions">Terms &amp; Conditions</a>

          <a href="/refund-policy">Refund Policy</a>

          <a href="/shipping-policy">Shipping Policy</a>
        </nav>

        {/* =========================================
            CUSTOMER SUPPORT
        ========================================== */}
        <div className="opulence-customer-support">
          <div className="opulence-support-title">CUSTOMER SUPPORT</div>

          <div className="opulence-support-text">
            We are happy to help you with your purchase
          </div>

          <a
            href="mailto:support@opulence.com"
            className="opulence-support-email"
          >
            <span className="opulence-email-icon">
              <FaEnvelope />
            </span>

            <span>support@opulence.com</span>
          </a>
        </div>

        {/* =========================================
            SOCIAL MEDIA
        ========================================== */}
        <div className="opulence-social">
          {/* INSTAGRAM */}
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="opulence-social-link"
          >
            <FaInstagram />
          </a>

          {/* LINKEDIN */}
          <a
            href="#"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="opulence-social-link"
          >
            <FaLinkedinIn />
          </a>
        </div>
      </div>

      {/* =========================================
          FOOTER BOTTOM
      ========================================== */}
      <div className="opulence-footer-bottom">
        {/* COPYRIGHT */}
        <div className="opulence-copyright">
          © {new Date().getFullYear()} OPULENCE. ALL RIGHTS RESERVED.
        </div>

        {/* BACK TO TOP */}
        <button
          type="button"
          className="opulence-back-top"
          onClick={handleBackToTop}
        >
          <span className="back-top-arrow">↑</span>
          <span>Back To Top</span>
        </button>
      </div>
    </footer>
  );
};

export default Footer;
