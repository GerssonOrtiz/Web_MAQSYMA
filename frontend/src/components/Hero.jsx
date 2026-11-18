import React, { useState, useEffect } from "react";
import HeroParallax from "./HeroParallax/HeroParallax";
import Hero3DOriginal from "./Hero3DOriginal";

/**
 * Hero component switcher:
 * Permite alternar mediante query param (?hero=3d o ?hero=parallax)
 * Por defecto ofrece la experiencia cinematográfica HeroParallax basada en los 4 videos
 * con fondos, medios, primeros planos y profundidad optimizada tanto para móvil como ordenador.
 */
export default function Hero({ onReady }) {
  const [heroMode, setHeroMode] = useState("parallax");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const queryMode = params.get("hero");
      if (queryMode === "3d") {
        setHeroMode("3d");
      } else {
        setHeroMode("parallax");
      }
    }
  }, []);

  if (heroMode === "3d") {
    return <Hero3DOriginal onReady={onReady} />;
  }

  return <HeroParallax onReady={onReady} />;
}
