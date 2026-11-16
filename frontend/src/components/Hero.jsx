import { useEffect, useRef, useState, useCallback } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useSpring,
  useMotionTemplate,
} from "framer-motion";
import { WA_DEFAULT, scrollToSection } from "../lib/scroll";

const HERO_IMG =
  "https://static.prod-images.emergentagent.com/jobs/0367909c-413c-4cc9-aff8-b7b2180f8e4b/images/620f5583aa2bd13c4a7ae0873e02e8a795669fccebbfe5ec663c62b1c11af830.jpeg";

const LINES = ["POTENCIA", "PARA SOLDAR", "SIN LÍMITES."];

const TECH_STRIP = [
  ["Procesos", "MMA · MIG/MAG · TIG · PLASMA"],
  ["Amperaje", "SEGÚN MODELO"],
  ["Alimentación", "SEGÚN MODELO"],
  ["Aplicación", "TALLER · INDUSTRIA · OBRA"],
];

const statusFor = (p) =>
  p >= 100
    ? "SISTEMA LISTO"
    : p >= 52
      ? "PREPARANDO CATÁLOGO"
      : p >= 26
        ? "ANALIZANDO EQUIPOS"
        : "INICIANDO";

export default function Hero() {
  const rm = useReducedMotion();
  const [initPct, setInitPct] = useState(0);

  // Contenedor exterior para el recorrido de scroll
  const sectionRef = useRef(null);
  const cardRef = useRef(null);

  // ----------------------------------------------------
  // SISTEMA A: ANIMACIÓN IMPULSADA POR SCROLL (Scroll-Driven)
  // Controla: Escala, profundidad, posición de cámara y progreso de escena
  // ----------------------------------------------------
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  // Suavizado controlado sin deriva perceptible
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 32,
    restDelta: 0.001,
  });

  // Secuencia en 4 Fases según mejora.md:
  // Fase A (0-20%): Activación y presentación inicial
  // Fase B (20-45%): Aproximación de cámara, escala y profundidad
  // Fase C (45-75%): Presentación protagónica, detalles nítidos
  // Fase D (75-100%): Transición y salida fluida hacia la siguiente sección
  const cameraScale = useTransform(smoothProgress, [0, 0.2, 0.45, 0.75, 1], [0.96, 1, 1.08, 1.08, 0.98]);
  const cameraY = useTransform(smoothProgress, [0, 0.2, 0.45, 0.75, 1], [0, 0, -12, -12, -36]);
  const cameraX = useTransform(smoothProgress, [0, 0.45, 0.75, 1], [0, 0, 6, 16]);
  const stageOpacity = useTransform(smoothProgress, [0, 0.05, 0.88, 1], [1, 1, 1, 0.92]);

  // Iluminación ambiental de fondo sincronizada con el scroll
  const bgGlowScale = useTransform(smoothProgress, [0, 0.5, 1], [0.85, 1.25, 1]);
  const bgGlowOpacity = useTransform(smoothProgress, [0, 0.3, 0.75, 1], [0.35, 0.65, 0.7, 0.35]);

  // Barra de progreso y revelado inicial
  useEffect(() => {
    if (rm) {
      setInitPct(100);
      return;
    }
    let raf;
    const t0 = performance.now();
    const DUR = 1400;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / DUR);
      setInitPct(Math.round((1 - Math.pow(1 - p, 3)) * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [rm]);

  // ----------------------------------------------------
  // SISTEMA B: EFECTO 3D DEL MOUSE, ILUMINACIÓN Y PARALLAX INTERIOR
  // Controla: Inclinación tridimensional, reflejo superficial, iluminación dinámica
  // ----------------------------------------------------
  const [isHovered, setIsHovered] = useState(false);
  const mouseSpringConfig = { stiffness: 220, damping: 24, mass: 0.6 };

  const rawRotateX = useSpring(0, mouseSpringConfig);
  const rawRotateY = useSpring(0, mouseSpringConfig);
  const rawParallaxX = useSpring(0, mouseSpringConfig);
  const rawParallaxY = useSpring(0, mouseSpringConfig);
  const spotX = useSpring(50, { stiffness: 220, damping: 24 });
  const spotY = useSpring(50, { stiffness: 220, damping: 24 });

  // Gradiente reactivo continuo para iluminación dinámica y reflejo superficial
  const dynamicGlare = useMotionTemplate`radial-gradient(380px circle at ${spotX}% ${spotY}%, rgba(255,255,255,0.16) 0%, rgba(0,230,118,0.12) 35%, transparent 75%)`;
  const metallicSheen = useMotionTemplate`linear-gradient(135deg, transparent 20%, rgba(255,255,255,0.35) 50%, transparent 80%)`;

  const onMouseMove = useCallback((e) => {
    if (rm || !cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    if (!rect.width || !rect.height) return;

    // Cálculo relativo al centro de la máquina (-1 a 1)
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const normX = Math.max(-1, Math.min(1, (px - 0.5) * 2));
    const normY = Math.max(-1, Math.min(1, (py - 0.5) * 2));

    // Parámetros orientativos de mejora.md:
    // Inclinación horizontal: 4-5 grados
    // Inclinación vertical: 3-4 grados
    // Parallax interior: 4-8 píxeles
    rawRotateX.set(-normY * 3.8);
    rawRotateY.set(normX * 4.6);
    rawParallaxX.set(normX * 6.5);
    rawParallaxY.set(normY * 6.5);
    spotX.set(px * 100);
    spotY.set(py * 100);
  }, [rm, rawRotateX, rawRotateY, rawParallaxX, rawParallaxY, spotX, spotY]);

  const onMouseEnter = useCallback(() => {
    if (!rm) setIsHovered(true);
  }, [rm]);

  const onMouseLeave = useCallback(() => {
    setIsHovered(false);
    rawRotateX.set(0);
    rawRotateY.set(0);
    rawParallaxX.set(0);
    rawParallaxY.set(0);
    spotX.set(50);
    spotY.set(50);
  }, [rawRotateX, rawRotateY, rawParallaxX, rawParallaxY, spotX, spotY]);

  return (
    // Contenedor exterior que define el tramo de scroll total
    <section
      ref={sectionRef}
      className="relative bg-ink"
      aria-label="Presentación"
      style={{ minHeight: "185vh" }}
    >
      {/* Escenario interior sticky: fijo durante la transformación */}
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden bg-grid flex flex-col justify-center">
        {/* Viñeta cinematográfica e iluminación industrial */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#07080A_82%)]" />

        {/* Resplandor industrial dinámico de fondo dependiente del progreso */}
        <motion.div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[750px] w-[750px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            background:
              "radial-gradient(circle, rgba(0, 230, 118, 0.08) 0%, rgba(20, 45, 60, 0.04) 50%, transparent 75%)",
            scale: rm ? 1 : bgGlowScale,
            opacity: rm ? 0.4 : bgGlowOpacity,
          }}
        />

        {/* Matriz y retícula sutil ambiental */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] opacity-60" />

        <div className="section-head relative grid grid-cols-1 items-center gap-10 py-8 lg:grid-cols-12 lg:gap-12 w-full">
          {/* Bloque de Información Comercial (Estable y legible) */}
          <div className="lg:col-span-7 z-10">
            <motion.p
              initial={{ opacity: rm ? 1 : 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mono-label flex items-center gap-3"
            >
              <span className="inline-block h-2 w-2 bg-accent shadow-[0_0_8px_#00E676]" />
              Equipos de soldadura / Tecnología industrial
            </motion.p>

            <h1 className="mt-5" data-testid="hero-title">
              {LINES.map((l, i) => (
                <span key={l} className="block overflow-hidden">
                  <motion.span
                    className={`block font-display text-[clamp(3.2rem,8.2vw,7.4rem)] font-black uppercase leading-[0.92] tracking-tight ${
                      i === 2 ? "text-accent drop-shadow-[0_0_24px_rgba(0,230,118,0.22)]" : "text-fog"
                    }`}
                    initial={rm ? false : { y: "115%" }}
                    animate={{ y: 0 }}
                    transition={{
                      duration: 0.75,
                      delay: 0.18 + i * 0.14,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {l}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: rm ? 1 : 0, y: rm ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 0.85 }}
              className="mt-5 max-w-xl text-sm sm:text-base leading-relaxed text-mist"
            >
              Máquinas de soldar, corte y accesorios para soldadores, talleres e industria.
              Tecnología seleccionada para responder cuando el trabajo realmente importa.
            </motion.p>

            <motion.div
              initial={{ opacity: rm ? 1 : 0, y: rm ? 0 : 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: 1 }}
              className="mt-8 flex flex-col gap-4 sm:flex-row"
            >
              <button
                className="btn-primary"
                onClick={scrollToSection("maquinas")}
                data-testid="hero-cta-machines"
              >
                Ver máquinas <span aria-hidden="true">→</span>
              </button>
              <a
                className="btn-ghost"
                href={WA_DEFAULT}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="hero-cta-quote"
              >
                Solicitar cotización
              </a>
            </motion.div>

            <motion.div
              initial={{ opacity: rm ? 1 : 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.15 }}
              className="mt-10"
            >
              <div className="grid grid-cols-2 border-t border-l border-white/10 lg:grid-cols-4 bg-ink/40 backdrop-blur-xs">
                {TECH_STRIP.map(([k, v]) => (
                  <div key={k} className="border-b border-r border-white/10 p-3.5">
                    <p className="mono-label">{k}</p>
                    <p className="mt-1.5 font-mono text-[11px] uppercase tracking-wider text-fog/90">
                      {v}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-5 flex items-center gap-4" data-testid="hero-progress">
                <span
                  className="font-mono text-[11px] tabular-nums text-accent"
                  data-testid="hero-progress-percent"
                >
                  {String(initPct).padStart(3, "0")}%
                </span>
                <span className="h-px flex-1 bg-white/10">
                  <span
                    className="block h-px bg-accent transition-[width] duration-100 ease-linear shadow-[0_0_6px_#00E676]"
                    style={{ width: `${initPct}%` }}
                    data-testid="hero-progress-bar"
                  />
                </span>
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist"
                  data-testid="hero-status"
                >
                  {statusFor(initPct)}
                </span>
              </div>
            </motion.div>
          </div>

          {/* Columna Escaparate de Maquinaria - Separación de Sistemas */}
          <div className="relative lg:col-span-5 flex justify-center items-center">
            {/* 
              SISTEMA A: CONTENEDOR DE CÁMARA SCROLL
              Evoluciona con la cámara virtual (escala, posición y profundidad general)
            */}
            <motion.div
              style={
                rm
                  ? undefined
                  : {
                      scale: cameraScale,
                      y: cameraY,
                      x: cameraX,
                      opacity: stageOpacity,
                    }
              }
              className="w-full max-w-[440px] perspective-[1200px]"
            >
              {/* 
                SISTEMA B: SUPERFICIE INTERACTIVA DEL RATÓN
                Responde al cursor calculando coordenadas respecto al centro del contenedor
              */}
              <div
                ref={cardRef}
                onMouseMove={onMouseMove}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                className="relative group cursor-crosshair select-none"
                style={{
                  transformStyle: "preserve-3d",
                }}
                data-testid="hero-image-frame"
              >
                {/* Plato tridimensional inclinable */}
                <motion.div
                  style={
                    rm
                      ? undefined
                      : {
                          rotateX: rawRotateX,
                          rotateY: rawRotateY,
                        }
                  }
                  className="relative aspect-[4/5] overflow-hidden rounded-xs border border-white/15 bg-coal shadow-[0_20px_50px_rgba(0,0,0,0.85)]"
                >
                  {/* 
                    SISTEMA B.3: PARALLAX INTERIOR
                    Desplazamiento sutil de 4-8px de la imagen sin alterar el contenedor exterior
                  */}
                  <motion.div
                    className="absolute -inset-3"
                    style={
                      rm
                        ? undefined
                        : {
                            x: rawParallaxX,
                            y: rawParallaxY,
                          }
                    }
                  >
                    <img
                      src={HERO_IMG}
                      alt="Máquina de soldar industrial en taller con iluminación cinematográfica"
                      className="h-full w-full object-cover object-[78%_center] filter contrast-[1.03] brightness-[0.98]"
                      loading="eager"
                    />
                  </motion.div>

                  {/* Iluminación dinámica que sigue al cursor y limitada a la máquina */}
                  <motion.div
                    className="pointer-events-none absolute inset-0 transition-opacity duration-300"
                    style={{
                      opacity: isHovered && !rm ? 1 : 0,
                      background: dynamicGlare,
                    }}
                  />

                  {/* Reflejo metálico superficial translúcido */}
                  <motion.div
                    className="pointer-events-none absolute inset-0 mix-blend-overlay transition-opacity duration-300"
                    style={{
                      opacity: isHovered && !rm ? 0.45 : 0,
                      background: metallicSheen,
                    }}
                  />

                  {/* Elementos HUD industriales y marcas de encuadre */}
                  <span className="absolute left-3 top-3 h-4 w-4 border-l border-t border-white/40" />
                  <span className="absolute right-3 top-3 h-4 w-4 border-r border-t border-white/40" />
                  <span className="absolute bottom-3 left-3 h-4 w-4 border-b border-l border-white/40" />
                  <span className="absolute bottom-3 right-3 h-4 w-4 border-b border-r border-white/40" />

                  {/* Etiqueta de estado en vivo */}
                  <span className="mono-label absolute left-4 top-4 bg-ink/80 px-2.5 py-1 backdrop-blur-md border border-white/10 flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent animate-ping-soft" />
                    Unidad / Soldadura industrial
                  </span>

                  {/* Tag técnico */}
                  <span className="absolute bottom-4 right-4 bg-ink/80 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-mist/90 backdrop-blur-md border border-white/10">
                    SISTEMA ACTIVO — 3D CALIBRADO
                  </span>
                </motion.div>
              </div>

              <div className="mt-3 flex items-center justify-between text-mist/60 font-mono text-[9px] uppercase tracking-[0.2em]">
                <span>MODO CINEMATOGRÁFICO</span>
                <span>FOTOGRAFÍA INDUSTRIAL</span>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
