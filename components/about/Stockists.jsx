"use client";

import { useEffect, useRef } from "react";
import "./Stockists.css";

const stockists = [
  {
    key: "_1",
    number: "01",
    city: "WEALTH",
    startOffset: 55,
    endOffset: -32,
    numberAlign: "right",
    svg: "/images/one.png",
    title: "THE POWER TO CHOOSE.",
    paragraphs: [
      "Wealth was once measured by what was inherited. Today, it is measured by what you have built.",
      "In fashion, wealth is not excess. It is the freedom to choose quality over quantity, intention over impulse, and pieces that mean something beyond their price.",
      "Opulence is not having more. It is having the freedom to choose better.",
    ],
  },

  {
    key: "_2",
    number: "02",
    city: "STRENGTH",
    startOffset: 30,
    endOffset: -10,
    numberAlign: "left",
    svg: "/images/two.png",
    title: "THE CONFIDENCE TO STAND ALONE.",
    paragraphs: [
      "Strength has never needed to announce itself.",
      "It exists in posture. In presence. In the quiet certainty of a man who knows what he stands for.",
      "Fashion becomes an extension of that strength — structured, considered and confident without demanding attention.",
      "True strength is felt before it is seen.",
    ],
  },

  {
    key: "_3",
    number: "03",
    city: "FAME",
    startOffset: 55,
    endOffset: -40,
    numberAlign: "left",
    svg: "/images/three.png",
    title: "THE POWER TO BE REMEMBERED.",
    paragraphs: [
      "Fame is not simply being seen.",
      "It is leaving something behind that remains long after you have left the room.",
      "In fashion, that becomes identity — a silhouette, a detail, a presence that people remember without needing a name attached to it.",
      "To be noticed is momentary. To be remembered is opulence.",
    ],
  },

  {
    key: "_4",
    number: "04",
    city: "BEAUTY",
    startOffset: 30,
    endOffset: -10,
    numberAlign: "left",
    svg: "/images/four.png",
    title: "THE ART OF BEING CONSIDERED.",
    paragraphs: [
      "Beauty lives in what others overlook.",
      "The cut. The proportion. The texture. The detail that exists not for attention, but because it belongs there.",
      "For Opulence, fashion is not decoration. It is the discipline of making every element matter.",
      "Beauty is never accidental.",
    ],
  },

  {
    key: "_5",
    number: "05",
    city: "KNOWLEDGE",
    startOffset: 55,
    endOffset: -32,
    numberAlign: "left",
    svg: "/images/five.png",
    title: "THE LUXURY OF KNOWING.",
    paragraphs: [
      "The more you know, the less you need to prove.",
      "Knowledge changes how a man sees materials, craftsmanship, proportion, history and the world around him.",
      "Fashion becomes more than appearance. It becomes discernment — knowing why something deserves to be worn.",
      "Because taste begins where awareness deepens.",
    ],
  },

  {
    key: "_6",
    number: "06",
    city: "RESTRAINT",
    startOffset: 0,
    endOffset: 25.5,
    numberAlign: "right",
    svg: "/images/six.png",
    title: "THE HIGHEST FORM OF OPULENCE.",
    paragraphs: [
      "When everything is available, choosing less becomes a statement.",
      "Restraint is knowing when to stop. When to remove. When silence says more than excess ever could.",
      "In fashion, it is the confidence to let craftsmanship speak without making it shout.",
      "Possession is easy. Restraint is rare.",
    ],
  },
];
export default function Stockists() {
  const wrapperRef = useRef(null);
  const sectionRef = useRef(null);
  const contentWrapperRef = useRef(null);

  const itemRefs = useRef([]);

  const currentProgress = useRef(0);
  const targetProgress = useRef(0);

  const rafRef = useRef(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const section = sectionRef.current;
    const contentWrapper = contentWrapperRef.current;

    if (!wrapper || !section || !contentWrapper) {
      return;
    }

    /*
    ============================================
    GET SCROLL PROGRESS
    ============================================
    */

    const updateTargetProgress = () => {
      const wrapperRect = wrapper.getBoundingClientRect();

      /*
       IMPORTANT:

       Progress is calculated from the OUTER
       wrapper, not the sticky section.
      */

      const totalScroll = wrapper.offsetHeight - window.innerHeight;

      if (totalScroll <= 0) {
        targetProgress.current = 0;
        return;
      }

      const currentScroll = -wrapperRect.top;

      let progress = currentScroll / totalScroll;

      progress = Math.max(0, Math.min(1, progress));

      targetProgress.current = progress;
    };

    /*
    ============================================
    SMOOTH ANIMATION LOOP
    ============================================
    */

    const animate = () => {
      /*
       * Lower value = slower
       *
       * 0.06 = very smooth
       * 0.08 = smooth
       * 0.12 = faster
       */

      currentProgress.current +=
        (targetProgress.current - currentProgress.current) * 0.075;

      const progress = currentProgress.current;

      /*
      ============================================
      PHASE 1
      CARDS CONVERGE
      ============================================
      
      0 -> 60%

      This is intentionally slower.
      */

      const settleStart = 0;
      const settleEnd = 0.6;

      let settleProgress = (progress - settleStart) / (settleEnd - settleStart);

      settleProgress = Math.max(0, Math.min(1, settleProgress));

      /*
       * Ease Out Cubic
       */

      const eased = 1 - Math.pow(1 - settleProgress, 3);

      /*
      ============================================
      MOVE EACH CARD
      ============================================
      */

      stockists.forEach((item, index) => {
        const element = itemRefs.current[index];

        if (!element) return;

        const offset =
          item.startOffset + (item.endOffset - item.startOffset) * eased;

        element.style.transform = `translate3d(0, ${offset}%, 0)`;
      });

      /*
      ============================================
      BLACK -> WHITE
      ============================================

      Start at 72%
      End at 86%

      So there is a proper hold before
      the colour transition.
      */

      const transitionStart = 0.72;
      const transitionEnd = 0.86;

      let transitionProgress = 0;

      if (progress > transitionStart) {
        transitionProgress =
          (progress - transitionStart) / (transitionEnd - transitionStart);
      }

      transitionProgress = Math.max(0, Math.min(1, transitionProgress));

      /*
       * Smooth transition
       */

      const transitionEase = 1 - Math.pow(1 - transitionProgress, 3);

      /*
      ============================================
      BACKGROUND
      ============================================
      */

      const value = Math.round(transitionEase * 255);

      section.style.backgroundColor = `rgb(${value}, ${value}, ${value})`;

      /*
      ============================================
      TEXT INVERSION
      ============================================
      */

      contentWrapper.style.filter = `invert(${Math.round(
        transitionEase * 100,
      )}%)`;

      rafRef.current = requestAnimationFrame(animate);
    };

    /*
    ============================================
    INITIAL
    ============================================
    */

    updateTargetProgress();

    /*
    Set initial positions immediately
    */

    stockists.forEach((item, index) => {
      const element = itemRefs.current[index];

      if (!element) return;

      element.style.transform = `translate3d(0, ${item.startOffset}%, 0)`;
    });

    rafRef.current = requestAnimationFrame(animate);

    /*
    ============================================
    EVENTS
    ============================================
    */

    window.addEventListener("scroll", updateTargetProgress, {
      passive: true,
    });

    window.addEventListener("resize", updateTargetProgress);

    /*
    ============================================
    CLEANUP
    ============================================
    */

    return () => {
      window.removeEventListener("scroll", updateTargetProgress);

      window.removeEventListener("resize", updateTargetProgress);

      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  return (
    <div id="Stockists" ref={wrapperRef} className="section-stockists-wrapper">
      <section ref={sectionRef} className="section-stockists">
        <div className="container-stockists">
          <div ref={contentWrapperRef} className="stockists-content-wrapper">
            {/* LEFT SIDE */}

            <div className="stockists-content-left">
              <div className="stockists-intro">
                <div className="stockists-b-m stockists-intro-title">
                  The Six Opulences
                </div>

                <div className="stockists-b-m stockists-intro-description">
                  Six expressions of what it means to build your own.
                </div>
              </div>
            </div>

            {/* RIGHT SIDE */}

            <div className="stockists-content-right">
              {stockists.map((item, index) => (
                <div
                  key={item.city}
                  ref={(element) => {
                    itemRefs.current[index] = element;
                  }}
                  className={`stockists-item-wrapper ${item.key}`}
                >
                  <div className="stockists-item">
                    {/* CITY / NUMBER */}

                    <div className="stockists-origin">
                      <div className="stockists-b-l" aria-label={item.city}>
                        <div className="gsap-split-line-mask">
                          <div className="gsap-split-line">{item.city}</div>
                        </div>
                      </div>

                      <div
                        className={`stockists-origin-number align-${item.numberAlign}`}
                      >
                        <img
                          src={item.svg}
                          alt=""
                          className="stockists-vector"
                        />
                      </div>
                    </div>

                    {/* TEXT */}

                    <div className="stockists-item-text-block">
                      <div className="stockists-b-m stockists-item-title">
                        {item.title}
                      </div>

                      <div className="stockists-item-caption">
                        {item.paragraphs.map((paragraph, paragraphIndex) => (
                          <div
                            key={paragraphIndex}
                            className="stockists-caption"
                          >
                            {paragraph}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
