"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import "./AccessCollection.css";

interface Chapter {
  key: string;
  title: string;
  bgClass: string;
  bgImage: string; // location/lifestyle photo — independent of the product photo

  tag: string;
  productImage: string; // set this to your own image, no product lookup needed
  productName: string;
  productPrice: string;
  productHandle: string; // used for the link — /products/<handle>
}

const CHAPTERS: Chapter[] = [
  {
    key: "fairway",
    title: "The Fairway",
    bgClass: "bg-fairway",
    bgImage: "/images/ban1.jpeg",
    tag: "The Fairway Collection — 01 / 04",
    productImage: "/images/pro.png",
    productName: "The Fairway Polo",
    productPrice: "₹4,200",
    productHandle: "the-fairway-polo",
  },
  {
    key: "atelier",
    title: "The Atelier",
    bgClass: "bg-atelier",
    bgImage: "/images/ban2.png",
    tag: "The Atelier Collection — 02 / 04",
    productImage: "/images/pro1.png",
    productName: "The Heritage Polo",
    productPrice: "₹4,600",
    productHandle: "the-heritage-polo",
  },
  {
    key: "court",
    title: "The Court",
    bgClass: "bg-court",
    bgImage: "/images/ban3.png",
    tag: "The Court Collection — 03 / 04",
    productImage: "/images/pro3.webp",
    productName: "The Polo, Elevated",
    productPrice: "₹4,900",
    productHandle: "the-polo-elevated",
  },
  {
    key: "lounge",
    title: "The Lounge",
    bgClass: "bg-lounge",
    bgImage: "/images/ban-grid4.png",
    tag: "The Lounge Collection — 04 / 04",
    productImage: "/images/pro4.png",
    productName: "The Lounge Polo",
    productPrice: "₹5,200",
    productHandle: "the-lounge-polo",
  },
  {
    key: "grand-tour",
    title: "The Grand Tour",
    bgClass: "bg-stable",
    bgImage: "/images/ban-4.png",
    tag: "The Grand Tour Collection — 04 / 04",
    productImage: "/images/pro-4.png",
    productName: "The Seal Edition",
    productPrice: "₹5,200",
    productHandle: "the-seal-edition",
  },
  {
    key: "grand-tour",
    title: "The Grand Tour",
    bgClass: "bg-stable",
    bgImage: "/images/ban5.png",
    tag: "The Grand Tour Collection — 04 / 04",
    productImage: "/images/pro5.png",
    productName: "The Seal Edition",
    productPrice: "₹5,200",
    productHandle: "the-seal-edition",
  },
];

const TOTAL = CHAPTERS.length;
const HOLD = 0.35;

function applyHold(continuous: number) {
  const index = Math.floor(continuous);
  const frac = continuous - index;

  const adjusted = frac < HOLD ? 0 : (frac - HOLD) / (1 - HOLD);

  return Math.min(index + adjusted, TOTAL - 1);
}

export default function AccessCollection() {
  const wrapRef = useRef<HTMLDivElement>(null);

  const [progress, setProgress] = useState(0);

  const targetRef = useRef(0);
  const currentRef = useRef(0);
  const rafRef = useRef<number>(0);

  useEffect(() => {
    function computeTarget() {
      const wrap = wrapRef.current;

      if (!wrap) return;

      const rect = wrap.getBoundingClientRect();
      const viewportH = window.innerHeight;

      const maxScroll = wrap.offsetHeight - viewportH;
      const scrolled = -rect.top;

      let raw = maxScroll > 0 ? scrolled / maxScroll : 0;

      raw = Math.min(Math.max(raw, 0), 0.999999);

      targetRef.current = applyHold(raw * TOTAL);
    }

    function loop() {
      currentRef.current += (targetRef.current - currentRef.current) * 0.12;

      if (Math.abs(targetRef.current - currentRef.current) < 0.0005) {
        currentRef.current = targetRef.current;
      }

      setProgress(currentRef.current);

      rafRef.current = requestAnimationFrame(loop);
    }

    function onScroll() {
      computeTarget();
    }

    window.addEventListener("scroll", onScroll, { passive: true });

    window.addEventListener("resize", onScroll);

    computeTarget();

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);

      window.removeEventListener("scroll", onScroll);

      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div className="access-root">
      <div ref={wrapRef} className="access-scroll-wrap">
        <div className="access-sticky-stage">
          {/* BACKGROUND LAYERS — location photo, separate from the product image */}
          {CHAPTERS.map((ch, i) => {
            const offset = i - progress;

            return (
              <div
                key={ch.key}
                className={`access-bg-layer ${ch.bgClass}`}
                style={{
                  transform: `translate3d(0, ${offset * 100}%, 0)`,
                }}
              >
                <img src={ch.bgImage} alt="" className="access-bg-image" />
              </div>
            );
          })}

          {/* PRODUCT CARD — image/name/price set directly per chapter above */}
          <div className="access-card">
            <div className="access-card-stack">
              {CHAPTERS.map((ch, i) => {
                const offset = i - progress;

                return (
                  <div
                    key={ch.key}
                    className="access-card-panel"
                    style={{
                      transform: `translate3d(0, ${offset * 100}%, 0)`,
                    }}
                  >
                    <Link
                      href={`/products/${ch.productHandle}`}
                      className="access-card-link"
                    >
                      <span className="access-card-tag">{ch.tag}</span>

                      <div className={`access-card-image ${ch.bgClass}`}>
                        <img src={ch.productImage} alt={ch.productName} />
                      </div>

                      <div className="access-card-body">
                        <p className="access-card-name">{ch.productName}</p>

                        <p className="access-card-price">{ch.productPrice}</p>
                      </div>
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
