import "./HeroSlider.css";
import { getHeroSlider } from "@/lib/content/home/hero";

export default async function HeroSlider() {
  const hero = await getHeroSlider();

  if (!hero || !hero.active) {
    return null;
  }

  return (
    <section className="hero-slider">
      {hero.desktopVideo && (
        <video
          className="hero-video hero-video-desktop"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster={hero.poster || undefined}
          controls={false}
          disablePictureInPicture
          aria-hidden="true"
        >
          <source src={hero.desktopVideo} type="video/mp4" />
        </video>
      )}

      {hero.mobileVideo && (
        <video
          className="hero-video hero-video-mobile"
          autoPlay
          muted
          loop
          playsInline
          preload="none"
          poster={hero.poster || undefined}
          controls={false}
          disablePictureInPicture
          aria-hidden="true"
        >
          <source src={hero.mobileVideo} type="video/mp4" />
        </video>
      )}
    </section>
  );
}
