import React, { forwardRef } from "react";

const ParallaxSceneLayer = forwardRef(function ParallaxSceneLayer(
  {
    sceneIndex,
    layerType, // 'bg' | 'mid' | 'fg'
    opacity = 1,
    scrollTransform = "none",
    baseScale = 1,
    isMobile = false,
  },
  ref
) {
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
      className={`absolute inset-0 h-full w-full overflow-visible transition-opacity duration-300 ease-out will-change-transform ${
        layerType === "bg" ? "parallax-bg-blur" : ""
      }`}
      style={{
        opacity,
        transform: scrollTransform,
        pointerEvents: layerType === "fg" ? "none" : "auto",
      }}
    >
      <img
        ref={ref}
        src={src}
        alt={`Showroom MAQSYMA Escena ${sceneNum} ${layerType}`}
        loading={sceneIndex === 0 ? "eager" : "lazy"}
        decoding="async"
        className={`h-full w-full object-cover select-none will-change-transform ${
          layerType === "fg" ? "pointer-events-none" : ""
        }`}
        style={{
          objectPosition: "center center",
          transform: `scale(${baseScale})`,
        }}
      />
    </div>
  );
});

export default ParallaxSceneLayer;
