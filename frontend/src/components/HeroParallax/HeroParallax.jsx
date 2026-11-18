import React, { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useReducedMotion } from "framer-motion";
import ParallaxSceneLayer from "./ParallaxSceneLayer";
import SparkCanvas from "./SparkCanvas";
import CinemaOverlay from "../Hero3D/CinemaOverlay";

gsap.registerPlugin(ScrollTrigger);

const TOTAL_SCENES = 4;

export default function HeroParallax({ onReady }) {
  const rm = useReducedMotion();
  const containerRef = useRef(null);
  const [activeScene, setActiveScene] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Offset de cursor o giroscopio (suavizado)
  const [mouseOffset, setMouseOffset] = useState({ x: 0, y: 0 });
  const mouseTargetRef = useRef({ x: 0, y: 0 });
  const rafRef = useRef(null);

  // Detección responsive
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
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

  // Smooth RAF loop para el lerp del parallax de cursor/giroscopio
  useEffect(() => {
    let currentX = 0;
    let currentY = 0;

    const tick = () => {
      const target = mouseTargetRef.current;
      currentX += (target.x - currentX) * 0.08;
      currentY += (target.y - currentY) * 0.08;
      setMouseOffset({ x: currentX, y: currentY });
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  // ScrollTrigger para scroll suave entre escenas
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    if (onReady) {
      // Notificar lista la carga inicial del Hero
      onReady();
    }

    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      scrub: 0.6,
      onUpdate: (self) => {
        const p = self.progress;
        setScrollProgress(p);

        // Mapear el progreso [0, 1] a las 4 escenas [0, 1, 2, 3]
        const sceneIndex = Math.min(
          Math.floor(p * TOTAL_SCENES),
          TOTAL_SCENES - 1
        );
        setActiveScene(sceneIndex);
      },
    });

    return () => {
      st.kill();
    };
  }, [onReady]);

  // Cálculo de opacidad y transform de cada escena en función del progreso continuo
  const getSceneStyle = (sceneIdx) => {
    // Rango continuo de la escena: cada una ocupa [idx/4, (idx+1)/4]
    const start = sceneIdx / TOTAL_SCENES;
    const end = (sceneIdx + 1) / TOTAL_SCENES;
    const mid = (start + end) / 2;

    let opacity = 0;
    // Crossfade con ventana de solapamiento
    if (scrollProgress >= start - 0.08 && scrollProgress <= end + 0.08) {
      if (scrollProgress < start) {
        opacity = (scrollProgress - (start - 0.08)) / 0.08;
      } else if (scrollProgress > end) {
        opacity = 1 - (scrollProgress - end) / 0.08;
      } else {
        opacity = 1;
      }
    }

    // Scroll vertical parallax offset por capa (en px o %)
    const localProgress = (scrollProgress - mid) * TOTAL_SCENES; // de -0.5 a 0.5 dentro del foco

    return {
      opacity: Math.max(0, Math.min(1, opacity)),
      localProgress,
    };
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

          // Parallax de scroll diferenciado por capa:
          // BG se mueve lento (profundidad lejana)
          const bgScrollY = localProgress * -25;
          // MID es el sujeto de referencia
          const midScrollY = localProgress * -10;
          // FG se mueve más rápido (pasa cerca de la lente)
          const fgScrollY = localProgress * 40;

          // Parallax de mouse / giroscopio:
          // BG se mueve opuesto al cursor lentamente
          const bgMouseX = mouseOffset.x * -12;
          const bgMouseY = mouseOffset.y * -8;
          // MID con ligero drift
          const midMouseX = mouseOffset.x * -4;
          const midMouseY = mouseOffset.y * -3;
          // FG se mueve adelante con mayor amplitud
          const fgMouseX = mouseOffset.x * 16;
          const fgMouseY = mouseOffset.y * 12;

          return (
            <div
              key={sceneIdx}
              className="absolute inset-0 h-full w-full pointer-events-none"
              style={{ opacity }}
            >
              {/* Capa 1: BACKGROUND (Techo, cerchas, lejanía) */}
              <ParallaxSceneLayer
                sceneIndex={sceneIdx}
                layerType="bg"
                isMobile={isMobile}
                transform={`translate3d(${bgMouseX}px, ${bgScrollY + bgMouseY}px, 0) scale(1.06)`}
              />

              {/* Capa 2: MIDGROUND (Máquinas centrales, mostrador, showroom) */}
              <ParallaxSceneLayer
                sceneIndex={sceneIdx}
                layerType="mid"
                isMobile={isMobile}
                transform={`translate3d(${midMouseX}px, ${midScrollY + midMouseY}px, 0) scale(1.02)`}
              />

              {/* Capa 3: FOREGROUND (Máquinas en primer plano, podio, arbustos) */}
              <ParallaxSceneLayer
                sceneIndex={sceneIdx}
                layerType="fg"
                isMobile={isMobile}
                transform={`translate3d(${fgMouseX}px, ${fgScrollY + fgMouseY}px, 0) scale(1.08)`}
              />
            </div>
          );
        })}

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
