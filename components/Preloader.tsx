"use client";

import { useEffect, useState, type CSSProperties } from "react";
import "./Preloader.css";

const BRAND = "OPULENCE";
const LOGO_SRC = "/images/opulence white-icon.png";

const MIN_VISIBLE = 3200;
const FADE_OUT = 700;
const READY_FALLBACK = 1500;

export default function Preloader() {
  const [isReady, setIsReady] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  // Wait for logo decoding before starting animation
  useEffect(() => {
    document.body.classList.add("preloader-active");

    let cancelled = false;
    let started = false;
    let raf1 = 0;
    let raf2 = 0;

    let fallback: number;

    const start = () => {
      if (cancelled || started) return;

      started = true;
      window.clearTimeout(fallback);

      raf1 = requestAnimationFrame(() => {
        raf2 = requestAnimationFrame(() => {
          if (!cancelled) {
            setIsReady(true);
          }
        });
      });
    };

    fallback = window.setTimeout(start, READY_FALLBACK);

    const img = new Image();
    img.src = LOGO_SRC;

    if (typeof img.decode === "function") {
      img.decode().then(start).catch(start);
    } else {
      img.onload = start;
      img.onerror = start;
    }

    return () => {
      cancelled = true;

      window.clearTimeout(fallback);
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);

      document.body.classList.remove("preloader-active");
    };
  }, []);

  // Wait for animation and initial page loading
  useEffect(() => {
    if (!isReady) return;

    let closeTimer: number | undefined;
    let minDone = false;
    let pageLoaded = document.readyState === "complete";
    let closed = false;

    const tryClose = () => {
      if (closed || !minDone || !pageLoaded) return;

      closed = true;

      setIsClosing(true);

      closeTimer = window.setTimeout(() => {
        setIsVisible(false);
        document.body.classList.remove("preloader-active");
      }, FADE_OUT);
    };

    const minTimer = window.setTimeout(() => {
      minDone = true;
      tryClose();
    }, MIN_VISIBLE);

    const onLoad = () => {
      pageLoaded = true;
      tryClose();
    };

    if (!pageLoaded) {
      window.addEventListener("load", onLoad);
    }

    return () => {
      window.clearTimeout(minTimer);

      if (closeTimer !== undefined) {
        window.clearTimeout(closeTimer);
      }

      window.removeEventListener("load", onLoad);
    };
  }, [isReady]);

  if (!isVisible) return null;

  return (
    <div
      className={`op-preloader ${
        isReady ? "op-ready" : ""
      } ${isClosing ? "op-preloader-closing" : ""}`}
      role="status"
      aria-label="Loading"
    >
      <div className="op-preloader-inner">
        {/* OPULENCE LOGO */}
        <div className="op-logo-mark" role="img" aria-label="OPULENCE">
          <img
            src={LOGO_SRC}
            alt=""
            aria-hidden="true"
            decoding="async"
            className="op-logo-piece op-logo-left"
          />

          <img
            src={LOGO_SRC}
            alt=""
            aria-hidden="true"
            decoding="async"
            className="op-logo-piece op-logo-right"
          />
        </div>

        {/* TYPEWRITER BRAND */}
        <div className="op-preloader-brand" aria-hidden="true">
          {BRAND.split("").map((char, i) => (
            <span
              key={i}
              className="op-char"
              style={{ "--i": i } as CSSProperties}
            >
              {char}
            </span>
          ))}
        </div>

        {/* LOADING LINE */}
        <div className="op-preloader-line">
          <span />
        </div>
      </div>
    </div>
  );
}
