"use client";

import { useEffect, useState } from "react";

import "./Preloader.css";

export default function Preloader() {
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Prevent page scrolling while preloader is visible
    document.body.classList.add("preloader-active");

    // Keep preloader visible for at least 2.2 seconds
    const timer = window.setTimeout(() => {
      setIsClosing(true);

      // Wait for fade-out animation
      window.setTimeout(() => {
        setIsVisible(false);
        document.body.classList.remove("preloader-active");
      }, 800);
    }, 2200);

    return () => {
      window.clearTimeout(timer);
      document.body.classList.remove("preloader-active");
    };
  }, []);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={`op-preloader ${isClosing ? "op-preloader-closing" : ""}`}>
      <div className="op-preloader-inner">
        {/* OP LOGO IMAGE */}
        <div className="op-logo-mark">
          <img
            src="/images/opulence white-icon.png"
            alt="OPULENCE"
            className="op-logo-image"
          />
        </div>

        {/* BRAND */}
        <div className="op-preloader-brand">OPULENCE</div>

        {/* LOADING LINE */}
        <div className="op-preloader-line">
          <span />
        </div>
      </div>
    </div>
  );
}
