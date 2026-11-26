import React from "react";
import HeroShowroom from "./HeroShowroom";

/**
 * Hero component principal configurado con HeroShowroom (Opción 2 + Scroll-Trigger)
 */
export default function Hero({ onReady }) {
  return <HeroShowroom onReady={onReady} />;
}
