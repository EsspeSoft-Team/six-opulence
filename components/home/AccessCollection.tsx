"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import "./AccessCollection.css";

import type { AccessCollectionItem } from "@/lib/content/home/access";

interface AccessCollectionProps {
  chapters: AccessCollectionItem[];
}

const SCROLL_PER_CHAPTER = 175;
const ANIMATION_DURATION = 650;

export default function AccessCollection({ chapters }: AccessCollectionProps) {
  const wrapRef = useRef<HTMLDivElement>(null);

  const [activeIndex, setActiveIndex] = useState(0);

  const activeRef = useRef(0);
  const lockedRef = useRef(false);
  const touchStartY = useRef(0);
  const unlockTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const total = chapters.length;

  useEffect(() => {
    if (!total) return;

    const wrap = wrapRef.current;
    if (!wrap) return;

    const getSectionPosition = (index: number) => {
      const maxScroll = wrap.offsetHeight - window.innerHeight;
      const maxIndex = Math.max(total - 1, 1);

      return (
        wrap.getBoundingClientRect().top +
        window.scrollY +
        (maxScroll * index) / maxIndex
      );
    };

    const goToChapter = (index: number) => {
      if (lockedRef.current) return;

      const nextIndex = Math.max(0, Math.min(index, total - 1));

      if (nextIndex === activeRef.current) return;

      lockedRef.current = true;
      activeRef.current = nextIndex;
      setActiveIndex(nextIndex);

      window.scrollTo({
        top: getSectionPosition(nextIndex),
        behavior: "smooth",
      });

      if (unlockTimer.current) {
        clearTimeout(unlockTimer.current);
      }

      unlockTimer.current = setTimeout(() => {
        lockedRef.current = false;
      }, ANIMATION_DURATION + 150);
    };

    const isInsideSection = () => {
      const rect = wrap.getBoundingClientRect();

      return rect.top <= 0 && rect.bottom >= window.innerHeight;
    };

    const syncActiveIndex = () => {
      if (lockedRef.current) return;

      const rect = wrap.getBoundingClientRect();
      const maxScroll = Math.max(wrap.offsetHeight - window.innerHeight, 1);

      const progress = Math.max(0, Math.min(-rect.top / maxScroll, 1));

      const index = Math.round(progress * (total - 1));

      activeRef.current = index;
      setActiveIndex(index);
    };

    const onWheel = (event: WheelEvent) => {
      if (!isInsideSection()) return;

      const direction = Math.sign(event.deltaY);

      if (!direction) return;

      const nextIndex = activeRef.current + direction;

      if (nextIndex < 0 || nextIndex >= total) return;

      event.preventDefault();
      goToChapter(nextIndex);
    };

    const onTouchStart = (event: TouchEvent) => {
      touchStartY.current = event.touches[0].clientY;
    };

    const onTouchEnd = (event: TouchEvent) => {
      if (!isInsideSection()) return;

      const difference = touchStartY.current - event.changedTouches[0].clientY;

      if (Math.abs(difference) < 40) return;

      const direction = difference > 0 ? 1 : -1;
      const nextIndex = activeRef.current + direction;

      if (nextIndex < 0 || nextIndex >= total) return;

      goToChapter(nextIndex);
    };

    window.addEventListener("wheel", onWheel, {
      passive: false,
    });

    window.addEventListener("touchstart", onTouchStart, {
      passive: true,
    });

    window.addEventListener("touchend", onTouchEnd, {
      passive: true,
    });

    window.addEventListener("scroll", syncActiveIndex, {
      passive: true,
    });

    syncActiveIndex();

    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("scroll", syncActiveIndex);

      if (unlockTimer.current) {
        clearTimeout(unlockTimer.current);
      }
    };
  }, [total]);

  if (!chapters.length) return null;

  return (
    <div className="access-root">
      <div
        ref={wrapRef}
        className="access-scroll-wrap"
        style={{
          height: `${Math.max(total, 1) * SCROLL_PER_CHAPTER}vh`,
        }}
      >
        <div className="access-sticky-stage">
          {/* BACKGROUND */}
          {chapters.map((ch, i) => {
            const offset = i - activeIndex;

            return (
              <div
                key={ch.id}
                className={`access-bg-layer ${ch.bgClass}`}
                style={{
                  transform: `translate3d(0, ${offset * 100}%, 0)`,
                  transition: `transform ${ANIMATION_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1)`,
                }}
              >
                <img src={ch.bgImage} alt="" className="access-bg-image" />
              </div>
            );
          })}

          {/* VERTICAL DOTS */}
          <div className="access-progress" aria-hidden="true">
            <div className="access-progress-dots">
              {chapters.map((ch, i) => (
                <span
                  key={ch.id}
                  className={`access-progress-dot ${
                    i === activeIndex ? "is-active" : ""
                  }`}
                />
              ))}
            </div>
          </div>

          {/* PRODUCT CARDS */}
          <div className="access-card">
            <div className="access-card-stack">
              {chapters.map((ch, i) => {
                const offset = i - activeIndex;

                return (
                  <div
                    key={ch.id}
                    className="access-card-panel"
                    style={{
                      transform: `translate3d(0, ${offset * 100}%, 0)`,
                      transition: `transform ${ANIMATION_DURATION}ms cubic-bezier(0.22, 1, 0.36, 1)`,
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
