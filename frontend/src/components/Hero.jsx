import React from "react";
import HeroDualScroll from "./HeroDualScroll";
import HeroScrollytelling from "./HeroScrollytelling";

/**
 * Hero component principal — HeroDualScroll (2 Secciones Conectadas con ScrollTrigger)
 *
 * Modos alternativos disponibles vía query param (?hero=scrollytelling).
 */
export default function Hero({ onReady }) {
  const params =
    typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const mode = params?.get("hero");

  if (mode === "scrollytelling") {
    return <HeroScrollytelling onReady={onReady} />;
  }

  return <HeroDualScroll onReady={onReady} />;
}
