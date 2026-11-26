import React from "react";
import HeroScrollytelling from "./HeroScrollytelling";

/**
 * Hero component principal — HeroScrollytelling (Experiencia Cinemática 5 Actos)
 *
 * Legados disponibles para referencia:
 *   - HeroShowroom.jsx  (video scrubbing 4 estaciones, 240vh)
 *   - HeroCinematic.jsx (crossfade de imágenes, 320-400vh)
 *   - Hero3DOriginal.jsx (nave industrial Three.js)
 *   - HeroParallax/    (parallax 2.5D multicapa)
 *
 * Para activar legados: ?hero=showroom | ?hero=cinematic | ?hero=3d
 */
export default function Hero({ onReady }) {
  return <HeroScrollytelling onReady={onReady} />;
}
