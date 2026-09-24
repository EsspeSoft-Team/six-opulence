import "./HeroSlider.css";
import { getHeroSlider } from "@/lib/content/home/hero";

export default async function HeroSlider() {
  const hero = await getHeroSlider();

  if (!hero || !hero.active) {
    return null;
  }

  return (
    <section className="hero-slider">
      {/* Desktop Video */}
      {hero.desktopVideo && (
        <video
          className="hero-video hero-video-desktop"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={hero.poster || undefined}
        >
          <source src={hero.desktopVideo} type="video/mp4" />
        </video>
      )}

      {/* Mobile Video */}
      {hero.mobileVideo && (
        <video
          className="hero-video hero-video-mobile"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={hero.poster || undefined}
        >
          <source src={hero.mobileVideo} type="video/mp4" />
        </video>
      )}
    </section>
  );
}
