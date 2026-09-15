"use client";

import "./HeroSlider.css";

export default function HeroSlider() {
  return (
    <section className="hero-slider">
      <video
        className="hero-video"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src="/images/next_video.mp4" type="video/mp4" />
      </video>
    </section>
  );
}
