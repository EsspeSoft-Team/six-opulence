"use client";

import { useEffect, useRef, useState } from "react";

import Link from "next/link";

import "./AccessCollection.css";

import type { AccessCollectionItem } from "@/lib/content/home/access";

interface AccessCollectionProps {
  chapters: AccessCollectionItem[];
}

const HOLD = 0.35;

function applyHold(continuous: number, total: number) {
  if (total <= 1) {
    return 0;
  }

  const index = Math.floor(continuous);

  const frac = continuous - index;

  const adjusted = frac < HOLD ? 0 : (frac - HOLD) / (1 - HOLD);

  return Math.min(index + adjusted, total - 1);
}

export default function AccessCollection({ chapters }: AccessCollectionProps) {
  const wrapRef = useRef<HTMLDivElement>(null);

  const [progress, setProgress] = useState(0);

  const targetRef = useRef(0);

  const currentRef = useRef(0);

  const rafRef = useRef<number>(0);

  const total = chapters.length;

  useEffect(() => {
    if (!total) {
      return;
    }

    function computeTarget() {
      const wrap = wrapRef.current;

      if (!wrap) {
        return;
      }

      const rect = wrap.getBoundingClientRect();

      const viewportH = window.innerHeight;

      const maxScroll = wrap.offsetHeight - viewportH;

      const scrolled = -rect.top;

      let raw = maxScroll > 0 ? scrolled / maxScroll : 0;

      raw = Math.min(Math.max(raw, 0), 0.999999);

      targetRef.current = applyHold(raw * total, total);
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

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    window.addEventListener("resize", onScroll);

    computeTarget();

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafRef.current);

      window.removeEventListener("scroll", onScroll);

      window.removeEventListener("resize", onScroll);
    };
  }, [total]);

  /*
   * No Shopify data available
   */
  if (!chapters.length) {
    return null;
  }

  return (
    <div className="access-root">
      <div ref={wrapRef} className="access-scroll-wrap">
        <div className="access-sticky-stage">
          {/* BACKGROUND LAYERS */}

          {chapters.map((ch, i) => {
            const offset = i - progress;

            return (
              <div
                key={ch.id}
                className={`access-bg-layer ${ch.bgClass}`}
                style={{
                  transform: `translate3d(0, ${offset * 100}%, 0)`,
                }}
              >
                <img src={ch.bgImage} alt="" className="access-bg-image" />
              </div>
            );
          })}

          {/* PRODUCT CARD */}

          <div className="access-card">
            <div className="access-card-stack">
              {chapters.map((ch, i) => {
                const offset = i - progress;

                return (
                  <div
                    key={ch.id}
                    className="access-card-panel"
                    style={{
                      transform: `translate3d(0, ${offset * 100}%, 0)`,
                    }}
                  >
                    <Link href={ch.productHandle} className="access-card-link">
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
