import React from "react";

export default function ParallaxSceneLayer({
  sceneIndex,
  layerType, // 'bg' | 'mid' | 'fg'
  opacity = 1,
  transform = "none",
  isMobile = false,
}) {
  const sceneNum = sceneIndex + 1;
  const basePath = `/assets/hero/frames/scene-${sceneNum}`;

  let src = "";
  if (layerType === "bg") {
    src = isMobile
      ? `${basePath}/bg/bg_mobile.webp`
      : `${basePath}/bg/bg_desktop.webp`;
  } else if (layerType === "mid") {
    src = isMobile
      ? `${basePath}/mid/mid_mobile.webp`
      : `${basePath}/mid/mid_desktop.webp`;
  } else if (layerType === "fg") {
    src = `${basePath}/fg/fg_desktop.webp`;
  }

  // Foreground omitida en mobile para ultrarrendimiento
  if (layerType === "fg" && isMobile) {
    return null;
  }

  return (
    <div
      className="absolute inset-0 h-full w-full overflow-hidden transition-opacity duration-300 ease-out will-change-transform"
      style={{
        opacity,
        transform,
        pointerEvents: layerType === "fg" ? "none" : "auto",
      }}
    >
      <img
        src={src}
        alt={`Showroom MAQSYMA Escena ${sceneNum} ${layerType}`}
        loading={sceneIndex === 0 ? "eager" : "lazy"}
        decoding="async"
        className={`h-full w-full object-cover select-none ${
          layerType === "fg" ? "pointer-events-none" : ""
        }`}
        style={{
          objectPosition: isMobile ? "center center" : "center center",
        }}
      />
    </div>
  );
}
