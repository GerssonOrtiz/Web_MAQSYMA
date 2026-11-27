import React, { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "framer-motion";
import ParallaxSceneLayer from "./ParallaxSceneLayer";
import SparkCanvas from "./SparkCanvas";
import CinemaOverlay from "../Hero3D/CinemaOverlay";

gsap.registerPlugin(ScrollTrigger);

const TOTAL_SCENES = 4;
const OVERLAP = 0.12;
const DEADZONE = 0.08;

const PARALLAX = {
  bg: { x: -15, y: -8, scale: 1.12 },
  mid: { x: -6, y: -4, scale: 1.03 },
  fg: { x: 20, y: 11, scale: 1.09 },
};

const SCENE_AMBIENT = [
  "radial-gradient(ellipse 60% 40% at 50% 70%, rgba(0,240,255,0.08) 0%, transparent 70%)",
  "radial-gradient(ellipse 60% 40% at 50% 70%, rgba(251,191,36,0.08) 0%, transparent 70%)",
  "radial-gradient(ellipse 60% 40% at 50% 70%, rgba(56,189,248,0.08) 0%, transparent 70%)",
  "radial-gradient(ellipse 60% 40% at 50% 70%, rgba(251,146,60,0.08) 0%, transparent 70%)",
];

const easeInOutQuad = (t) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

export default function HeroParallax({ onReady }) {
  const rm = useReducedMotion();
  const containerRef = useRef(null);
  const [activeScene, setActiveScene] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const isMobileRef = useRef(false);
  const mouseTargetRef = useRef({ x: 0, y: 0 });
  const layerRefs = useRef({});
  const rafRef = useRef(null);
  const preloadedScenes = useRef(new Set([0]));

  // Detección responsive
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      isMobileRef.current = mobile;
      setIsMobile(mobile);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Parallax de mouse en Desktop
  const handleMouseMove = useCallback(
    (e) => {
      if (rm || isMobile) return;
      const nx = (e.clientX / window.innerWidth - 0.5) * 2;
      const ny = (e.clientY / window.innerHeight - 0.5) * 2;
      mouseTargetRef.current = { x: nx, y: ny };
    },
    [rm, isMobile]
  );

  const handleMouseLeave = useCallback(() => {
    mouseTargetRef.current = { x: 0, y: 0 };
  }, []);

  // Parallax de giroscopio en Mobile
  useEffect(() => {
    if (!isMobile || rm) return;

    const handleOrientation = (e) => {
      if (e.gamma !== null && e.beta !== null) {
        const nx = Math.min(Math.max(e.gamma / 30, -1), 1);
        const ny = Math.min(Math.max((e.beta - 45) / 30, -1), 1);
        mouseTargetRef.current = { x: nx, y: ny };
      }
    };

    window.addEventListener("deviceorientation", handleOrientation);
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, [isMobile, rm]);

  // Smooth RAF loop para actualizar transforms de cursor/giroscopio directo en el DOM
  useEffect(() => {
    if (rm) return;

    let currentX = 0;
    let currentY = 0;

    const tick = () => {
      const raw = mouseTargetRef.current;

      // Deadzone suave — suaviza a 0 si el cursor está cerca del centro
      const ax =
        Math.abs(raw.x) > DEADZONE
          ? raw.x
          : raw.x * (Math.abs(raw.x) / DEADZONE);
      const ay =
        Math.abs(raw.y) > DEADZONE
          ? raw.y
          : raw.y * (Math.abs(raw.y) / DEADZONE);

      currentX += (ax - currentX) * 0.07;
      currentY += (ay - currentY) * 0.06;

      for (let sceneIdx = 0; sceneIdx < TOTAL_SCENES; sceneIdx++) {
        const bg = layerRefs.current[`scene-${sceneIdx}-bg`];
        const mid = layerRefs.current[`scene-${sceneIdx}-mid`];
        const fg = layerRefs.current[`scene-${sceneIdx}-fg`];

        if (bg) {
          bg.style.transform = `translate3d(${currentX * PARALLAX.bg.x}px, ${currentY * PARALLAX.bg.y}px, 0) scale(${PARALLAX.bg.scale})`;
        }
        if (mid) {
          mid.style.transform = `translate3d(${currentX * PARALLAX.mid.x}px, ${currentY * PARALLAX.mid.y}px, 0) scale(${PARALLAX.mid.scale})`;
        }
        if (fg) {
          fg.style.transform = `translate3d(${currentX * PARALLAX.fg.x}px, ${currentY * PARALLAX.fg.y}px, 0) scale(${PARALLAX.fg.scale})`;
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [rm]);

  // ScrollTrigger para scroll suave entre escenas + preload de la siguiente
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (onReady) {
      onReady();
    }

    const preloadScene = (sceneIdx) => {
      if (preloadedScenes.current.has(sceneIdx)) return;
      preloadedScenes.current.add(sceneIdx);

      const base = `/assets/hero/frames/scene-${sceneIdx + 1}`;
      const urls = isMobileRef.current
        ? [`${base}/bg/bg_mobile.webp`, `${base}/mid/mid_mobile.webp`]
        : [
            `${base}/bg/bg_desktop.webp`,
            `${base}/mid/mid_desktop.webp`,
            `${base}/fg/fg_desktop.webp`,
          ];

      urls.forEach((href) => {
        const link = document.createElement("link");
        link.rel = "preload";
        link.as = "image";
        link.href = href;
        document.head.appendChild(link);
      });
    };

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      scrub: 1.2,
      onUpdate: (self) => {
        const p = self.progress;
        setScrollProgress(p);

        const sceneIndex = Math.min(
          Math.floor(p * TOTAL_SCENES),
          TOTAL_SCENES - 1
        );
        setActiveScene(sceneIndex);

        // Precargar siguiente escena cuando estamos al 60% de la actual
        const localP = (p * TOTAL_SCENES) % 1;
        if (localP > 0.6 && sceneIndex + 1 < TOTAL_SCENES) {
          preloadScene(sceneIndex + 1);
        }
      },
    });

    return () => {
      st.kill();
    };
  }, [onReady]);

  // Cálculo de opacidad (easeInOutQuad) y progreso local de cada escena
  const getSceneStyle = (sceneIdx) => {
    const start = sceneIdx / TOTAL_SCENES;
    const end = (sceneIdx + 1) / TOTAL_SCENES;
    const mid = (start + end) / 2;

    let opacity = 0;
    if (scrollProgress >= start - OVERLAP && scrollProgress <= end + OVERLAP) {
      if (scrollProgress < start) {
        opacity = easeInOutQuad(
          (scrollProgress - (start - OVERLAP)) / OVERLAP
        );
      } else if (scrollProgress > end) {
        opacity = easeInOutQuad(1 - (scrollProgress - end) / OVERLAP);
      } else {
        opacity = 1;
      }
    }

    const localProgress = (scrollProgress - mid) * TOTAL_SCENES;

    return {
      opacity: Math.max(0, Math.min(1, opacity)),
      localProgress,
    };
  };

  const setLayerRef = (key) => (node) => {
    if (node) {
      layerRefs.current[key] = node;
    } else {
      delete layerRefs.current[key];
    }
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full bg-[#06080a]"
      style={{ height: isMobile ? "320vh" : "400vh" }}
    >
      {/* Viewport fijo sticky 100vh */}
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        {/* Renderizado de las 4 escenas multicapa con profundidad */}
        {[0, 1, 2, 3].map((sceneIdx) => {
          const { opacity, localProgress } = getSceneStyle(sceneIdx);
          if (opacity <= 0.005) return null;

          // Parallax de scroll diferenciado por capa
          const bgScrollY = rm ? 0 : localProgress * -55;
          const midScrollY = rm ? 0 : localProgress * -12;
          const fgScrollY = rm ? 0 : localProgress * 65;

          return (
            <div
              key={sceneIdx}
              className="absolute inset-0 h-full w-full pointer-events-none"
              style={{ opacity }}
            >
              {/* Capa 1: BACKGROUND (Techo, cerchas, lejanía) */}
              <ParallaxSceneLayer
                ref={setLayerRef(`scene-${sceneIdx}-bg`)}
                sceneIndex={sceneIdx}
                layerType="bg"
                isMobile={isMobile}
                baseScale={PARALLAX.bg.scale}
                scrollTransform={`translate3d(0, ${bgScrollY}px, 0)`}
              />

              {/* Capa 2: MIDGROUND (Máquinas centrales, mostrador, showroom) */}
              <ParallaxSceneLayer
                ref={setLayerRef(`scene-${sceneIdx}-mid`)}
                sceneIndex={sceneIdx}
                layerType="mid"
                isMobile={isMobile}
                baseScale={PARALLAX.mid.scale}
                scrollTransform={`translate3d(0, ${midScrollY}px, 0)`}
              />

              {/* Capa 3: FOREGROUND (Máquinas en primer plano, podio, arbustos) */}
              <ParallaxSceneLayer
                ref={setLayerRef(`scene-${sceneIdx}-fg`)}
                sceneIndex={sceneIdx}
                layerType="fg"
                isMobile={isMobile}
                baseScale={PARALLAX.fg.scale}
                scrollTransform={`translate3d(0, ${fgScrollY}px, 0)`}
              />
            </div>
          );
        })}

        {/* Respiración atmosférica cromática por escena */}
        {!rm && (
          <div
            className="hero-ambient"
            style={{ background: SCENE_AMBIENT[activeScene] }}
          />
        )}

        {/* Chispas de arco de soldadura en Canvas 2D interactivo */}
        {!rm && <SparkCanvas scene={activeScene} />}

        {/* Vignette cinematográfica oscura en bordes */}
        <div className="pointer-events-none absolute inset-0 bg-radial-vignette opacity-75 z-10" />

        {/* Gradiente sutil inferior para fundir con la siguiente sección */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#07080a] to-transparent z-10" />

        {/* Capa HUD / Telemetría y fichas técnicas existentes */}
        <CinemaOverlay activeScene={activeScene} progress={scrollProgress} />
      </div>
    </div>
  );
}
