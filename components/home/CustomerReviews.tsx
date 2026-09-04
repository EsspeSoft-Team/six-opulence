"use client";

import React, { useEffect, useRef } from "react";
import "./CustomerReviews.css";

interface Testimonial {
  image: string;
  review: string;
  name: string;
  type: string;
}

const testimonials: Testimonial[] = [
  {
    image: "/images/test.avif",
    review:
      "Quality is absolutely top-notch. The fabric feels premium, fits perfectly, and the delivery was super fast. Definitely ordering again!",
    name: "Avesh Karim",
    type: "Regular Customer",
  },

  {
    image: "/images/test1.avif",
    review:
      "The hoodie I purchased went beyond my expectations. It’s soft, warm, and stylish — just like the pictures. I’ll definitely buy again!",
    name: "Arif Mahmud",
    type: "Verified Customer",
  },

  {
    image: "/images/test2.avif",
    review:
      "The shirt exceeded my expectations. Incredibly soft, perfectly comfortable, and looks just as good as the photos.",
    name: "Jonson Maltura",
    type: "Regular Customer",
  },

  {
    image: "/images/test.avif",
    review:
      "I absolutely love my new jacket! The fit is perfect, the fabric feels premium, and delivery was incredibly fast.",
    name: "Imran Hossain",
    type: "Fashion Enthusiast",
  },

  {
    image: "/images/test1.avif",
    review:
      "Loved the T-shirt! It’s cozy, stylish, and exactly what I hoped for. Looks just like the pictures.",
    name: "Kushal Mendis",
    type: "Verified Customer",
  },

  {
    image: "/images/test2.avif",
    review:
      "Absolutely love this jacket — the fit is perfect, the fabric feels premium, and the delivery was surprisingly fast.",
    name: "Nikky Jon",
    type: "Fashion Enthusiast",
  },

  {
    image: "/images/test.avif",
    review:
      "Absolutely impressed! The jacket is soft, warm, and matches the photos perfectly.",
    name: "Charlse Jonson",
    type: "Regular Customer",
  },

  {
    image: "/images/test1.avif",
    review:
      "I’m so impressed with this shirt! The fit is spot-on, the material feels luxurious, and the delivery was super quick.",
    name: "Hossain Mahmud",
    type: "Fashion Enthusiast",
  },
];

export default function CustomerReviews() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const track = trackRef.current;

    if (!section || !track) return;

    let raf = 0;

    const update = () => {
      const sectionTop = section.offsetTop;

      const sectionHeight = section.offsetHeight;

      const viewportHeight = window.innerHeight;

      const scrollableDistance = sectionHeight - viewportHeight;

      if (scrollableDistance <= 0) return;

      const currentScroll = window.scrollY - sectionTop;

      const progress = currentScroll / scrollableDistance;

      const clampedProgress = Math.max(0, Math.min(1, progress));

      const maxTranslate = track.scrollWidth - track.parentElement!.clientWidth;

      const x = maxTranslate * clampedProgress;

      track.style.transform = `translate3d(${-x}px, 0, 0)`;

      raf = 0;
    };

    const onScroll = () => {
      if (raf) return;

      raf = requestAnimationFrame(update);
    };

    const onResize = () => {
      update();
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    window.addEventListener("resize", onResize);

    update();

    return () => {
      window.removeEventListener("scroll", onScroll);

      window.removeEventListener("resize", onResize);

      if (raf) {
        cancelAnimationFrame(raf);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="customer-reviews-section">
      <div className="customer-reviews-sticky">
        <div className="container">
          {/* HEADER */}

          <div className="customer-reviews-header">
            <div className="customer-reviews-title">
              <span className="customer-reviews-label">TESTIMONIAL</span>

              <h2 className="title">What Our Customers Saying </h2>
            </div>

            <div className="customer-reviews-description">
              <p className="para">
                Read genuine reviews from customers who trust our brand for
                quality, style, reliable service, and value.
              </p>
            </div>
          </div>

          {/* SLIDER */}

          <div className="customer-reviews-window">
            <div ref={trackRef} className="customer-reviews-track">
              {testimonials.map((testimonial, index) => (
                <article className="customer-review-card" key={index}>
                  <div className="customer-review-image">
                    <img
                      src={testimonial.image}
                      alt={testimonial.name}
                      loading={index === 0 ? "eager" : "lazy"}
                    />
                  </div>

                  <div className="customer-review-content">
                    <div>
                      <div className="customer-review-stars">★ ★ ★ ★ ★</div>

                      <p className="customer-review-text">
                        “{testimonial.review}”
                      </p>
                    </div>

                    <div className="customer-review-author">
                      <div className="customer-review-line" />

                      <p className="customer-review-name">{testimonial.name}</p>

                      <p className="customer-review-type">{testimonial.type}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
