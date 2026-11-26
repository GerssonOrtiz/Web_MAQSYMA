/**
 * HeroDualScroll — Hero ScrollTrigger en 2 Secciones Conectadas
 *
 * Arquitectura compacta (240vh total, sticky 100vh):
 *   - Sección 1 (0%–48%): Propuesta comercial clara de VENTA DE MÁQUINAS DE SOLDAR + Equipo Estrella inmediato + CTAs.
 *   - Transición Vertical Conectada (44%–56%): Cortina ascendente con clip-path y haz de arco eléctrico sincronizado al scroll.
 *   - Sección 2 (52%–100%): Showroom interactivo de Equipos Estrella en stock con especificaciones reales y cotización directa.
 *
 * Video de fondo: /assets/hero/hero-weld-loop.mp4 (procesado con FFmpeg, keyframes densos -g 6 para scrubbing fluido).
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import { ArrowUpRight, ChevronDown, ShieldCheck, Truck, Zap, Sparkles } from "lucide-react";
import { waLink } from "../lib/scroll";

const TOTAL_HEIGHT = "240vh";
const VIDEO_DURATION = 9.41;

const STAR_MACHINES = [
  {
    id: "dueler",
    name: "DUELER EHL 1500",
    badge: "EQUIPO ESTRELLA · LÁSER",
    category: "SOLDADORA LÁSER LBW",
    power: "1,500 W",
    process: "LÁSER PORTÁTIL",
    modality: "VENTA DIRECTA",
    accent: "#FF6B35",
    image: "/equipos/DUELER EHL 1500.png",
    highlight: "Hasta 4× más rápida que TIG convencional",
    description:
      "Soldadura láser portátil de alta precisión para acero inoxidable, carbono y aluminio. Mínima distorsión térmica y acabado limpio listo para entrega.",
  },
  {
    id: "aristo",
    name: "ARISTO 500iX",
    badge: "LÍNEA PESADA · ESAB",
    category: "MULTIPROCESO PULSADO",
    power: "500 A · 60%",
    process: "MIG / TIG / MMA",
    modality: "VENTA · RENTING",
    accent: "#00E5FF",
    image: "/equipos/ARISTO 500iX.png",
    highlight: "Ciclo continuo para minería y estructuras",
    description:
      "Fuente multiproceso industrial con tecnología pulsada y chasis reforzado. Diseñada para fabricación pesada y producción ininterrumpida.",
  },
  {
    id: "arc601",
    name: "ARC 601i",
    badge: "ALTO AMPERAJE · ESAB",
    category: "TRABAJO PESADO IGBT",
    power: "601 A",
    process: "SMAW / ARCAIR",
    modality: "VENTA · ALQUILER",
    accent: "#FFB703",
    image: "/equipos/ARC 601i.png",
    highlight: "Electrodo revestido y repelado por arco",
    description:
      "Inversor IGBT de alta potencia para obra exigente, mantenimiento minero y montaje estructural con máxima estabilidad de arco.",
  },
  {
    id: "rebel",
    name: "REBEL EMP 320iC",
    badge: "VERSATILIDAD · ESAB",
    category: "MULTIPROCESO EN OBRA",
    power: "320 A",
    process: "MIG / FCAW / TIG",
    modality: "VENTA · ALQUILER",
    accent: "#38BDF8",
    image: "/equipos/REBEL EMP 320iC.png",
    highlight: "3 procesos en un chasis compacto y portátil",
    description:
      "Equipo multiproceso listo para taller y campo. Integra MIG, alambre tubular y TIG con interfaz inteligente sMIG.",
  },
];

/* ─── Chispas de soldadura sutiles en Canvas ────────────────────────── */
function SparkCanvas({ active }) {
  const canvasRef = useRef(null);
  const sparksRef = useRef([]);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!active) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const spawnSpark = () => ({
      x: canvas.width * (0.45 + Math.random() * 0.45),
      y: canvas.height * (0.35 + Math.random() * 0.3),
      vx: (Math.random() - 0.5) * 3.2,
      vy: -(Math.random() * 3.8 + 1.5),
      life: 1,
      decay: Math.random() * 0.025 + 0.015,
      size: Math.random() * 2.2 + 0.8,
    });

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (Math.random() < 0.3) sparksRef.current.push(spawnSpark());
      sparksRef.current = sparksRef.current.filter((s) => s.life > 0);
      sparksRef.current.forEach((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.11;
        s.life -= s.decay;
        ctx.globalAlpha = Math.max(0, s.life);
        ctx.fillStyle = `hsl(${32 + Math.random() * 18}, 100%, 72%)`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      rafRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, [active]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-10 h-full w-full opacity-60"
      aria-hidden="true"
    />
  );
}

/* ─── Fallback accesible (prefers-reduced-motion) ───────────────────── */
function StaticDualFallback({ onReady }) {
  const navigate = useNavigate();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const star = STAR_MACHINES[selectedIdx];

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  return (
    <section
      className="relative bg-ink py-24 text-fog"
      data-testid="hero-dual-scroll-static"
      aria-label="Venta de máquinas de soldar industriales MAQSYMA"
    >
      <div className="mx-auto grid max-w-7xl items-center gap-10 px-6 lg:grid-cols-12 lg:px-12">
        <div className="lg:col-span-7">
          <div className="mb-4 flex items-center gap-3">
            <span className="h-px w-8 bg-accent" />
            <span className="font-mono text-[10px] uppercase tracking-[0.24em] text-accent">
              Venta Directa · Distribuidor Autorizado ESAB
            </span>
          </div>
          <h1 className="font-display text-5xl font-black uppercase leading-[0.9] tracking-tight sm:text-7xl">
            Venta de Máquinas de Soldar <span className="text-accent">Industriales.</span>
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-relaxed text-mist sm:text-base">
            Equipos MIG, TIG, MMA, Multiproceso y Láser con stock inmediato, garantía oficial de fábrica y envío a todo el Perú.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <a
              href={waLink(`Hola MAQSYMA, quiero cotizar la ${star.name}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-accent px-6 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-ink transition hover:bg-accentbright"
            >
              Cotizar por WhatsApp <ArrowUpRight className="h-4 w-4" />
            </a>
            <button
              onClick={() => navigate("/catalogo")}
              className="inline-flex items-center gap-2 border border-white/20 bg-white/5 px-6 py-3.5 font-mono text-xs uppercase tracking-[0.18em] text-fog transition hover:border-accent/60"
            >
              Ver Catálogo
            </button>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="relative border border-white/10 bg-coal/80 p-6">
            <img
              src={star.image}
              alt={star.name}
              className="mx-auto h-64 w-auto object-contain"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              {STAR_MACHINES.map((m, idx) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedIdx(idx)}
                  className={`border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] ${
                    idx === selectedIdx
                      ? "border-accent bg-accent text-ink font-semibold"
                      : "border-white/15 text-mist hover:text-fog"
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Componente Principal: Hero ScrollTrigger 2 Secciones ──────────── */
export default function HeroDualScroll({ onReady }) {
  const navigate = useNavigate();
  const rm = useReducedMotion();
  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const readyFiredRef = useRef(false);

  const [activeSection, setActiveSection] = useState(0); // 0 = Venta, 1 = Equipo Estrella
  const [selectedStarIdx, setSelectedStarIdx] = useState(0);
  const activeStar = STAR_MACHINES[selectedStarIdx];

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  /* ── Sincronización de video con scroll (scrubbing suave) ── */
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const vid = videoRef.current;
    if (vid && vid.readyState >= 2) {
      const targetTime = Math.min(VIDEO_DURATION - 0.05, Math.max(0, p * VIDEO_DURATION));
      if (Math.abs(vid.currentTime - targetTime) > 0.03) {
        vid.currentTime = targetTime;
      }
    }
    const nextSection = p >= 0.48 ? 1 : 0;
    setActiveSection((prev) => (prev === nextSection ? prev : nextSection));
  });

  /* ── Notificar carga lista al LoadingScreen ── */
  useEffect(() => {
    const fireReady = () => {
      if (readyFiredRef.current) return;
      readyFiredRef.current = true;
      onReady?.();
    };

    const vid = videoRef.current;
    if (vid) {
      if (vid.readyState >= 2) {
        fireReady();
      } else {
        vid.addEventListener("loadeddata", fireReady, { once: true });
        vid.addEventListener("canplay", fireReady, { once: true });
      }
    }
    // Failsafe para no bloquear nunca la pantalla de carga
    const timer = setTimeout(fireReady, 1800);
    return () => {
      clearTimeout(timer);
      if (vid) {
        vid.removeEventListener("loadeddata", fireReady);
        vid.removeEventListener("canplay", fireReady);
      }
    };
  }, [onReady]);

  /* ── Transformaciones de la Transición Vertical Conectada (44%–56%) ── */
  // Sección 1: sube y se desvanece suavemente al llegar a la mitad
  const sec1Y = useTransform(scrollYProgress, [0, 0.42, 0.54], [0, -18, -90]);
  const sec1Scale = useTransform(scrollYProgress, [0.42, 0.54], [1, 0.96]);
  const sec1Opacity = useTransform(scrollYProgress, [0.40, 0.52], [1, 0]);

  // Equipo Estrella en Sección 1: parallax vertical sutil antes de la transición
  const star1Y = useTransform(scrollYProgress, [0, 0.44], [0, -28]);
  const star1Scale = useTransform(scrollYProgress, [0, 0.44], [1, 1.05]);

  // Cortina vertical conectada: sube de abajo (inset 100%) hasta cubrir (inset 0%)
  const curtainClip = useTransform(
    scrollYProgress,
    [0.42, 0.56],
    ["inset(100% 0% 0% 0%)", "inset(0% 0% 0% 0%)"]
  );
  // Haz luminoso de soldadura que viaja pegado al borde superior de la cortina
  const beamTop = useTransform(scrollYProgress, [0.42, 0.56], ["100%", "0%"]);
  const beamOpacity = useTransform(scrollYProgress, [0.40, 0.45, 0.53, 0.58], [0, 1, 1, 0]);

  // Sección 2: entra conectada desde abajo en el mismo eje vertical
  const sec2Y = useTransform(scrollYProgress, [0.44, 0.58], [72, 0]);
  const sec2Opacity = useTransform(scrollYProgress, [0.45, 0.56], [0, 1]);

  // Hint de scroll en la parte inferior de Sección 1
  const hintOpacity = useTransform(scrollYProgress, [0, 0.14], [1, 0]);

  const jumpToSection = useCallback((idx) => {
    const el = sectionRef.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    const travel = el.offsetHeight - window.innerHeight;
    const targetY = top + (idx === 0 ? 0 : 0.68 * travel);
    if (window.__lenis) {
      window.__lenis.scrollTo(targetY, { duration: 1.0 });
    } else {
      window.scrollTo({ top: targetY, behavior: "smooth" });
    }
  }, []);

  if (rm) return <StaticDualFallback onReady={onReady} />;

  return (
    <section
      ref={sectionRef}
      className="relative bg-ink"
      style={{ height: TOTAL_HEIGHT }}
      data-testid="hero-dual-scroll"
      aria-label="Venta de máquinas de soldar industriales y equipos estrella"
    >
      {/* Viewport Sticky 100vh */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-ink">
        {/* Video atmosférico limpio procesado con FFmpeg */}
        <video
          ref={videoRef}
          src="/assets/hero/hero-weld-loop.mp4"
          poster="/assets/hero/hero-poster.webp"
          playsInline
          muted
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover opacity-55"
          aria-hidden="true"
        />

        {/* Chispas de soldadura */}
        <SparkCanvas active />

        {/* Grilla técnica sutil */}
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
          aria-hidden="true"
        />

        {/* Vignette cinematográfica */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(95deg, rgba(8,9,12,0.95) 0%, rgba(8,9,12,0.78) 48%, rgba(8,9,12,0.45) 100%)",
          }}
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink via-transparent to-ink/65"
          aria-hidden="true"
        />

        {/* ═══════════════════════════════════════════════════════════════
            SECCIÓN 1 (0%–50%): VENTA DE MÁQUINAS DE SOLDAR + EQUIPO ESTRELLA
            ═══════════════════════════════════════════════════════════════ */}
        <motion.div
          style={{
            y: sec1Y,
            scale: sec1Scale,
            opacity: sec1Opacity,
            pointerEvents: activeSection === 0 ? "auto" : "none",
          }}
          className="relative z-20 mx-auto flex h-full max-w-7xl items-center px-5 pt-16 sm:px-10 lg:px-12"
        >
          <div className="grid w-full items-center gap-8 lg:grid-cols-12">
            {/* Columna Izquierda: Propuesta de venta directa */}
            <div className="lg:col-span-7">
              <div className="mb-4 inline-flex items-center gap-2.5 border border-accent/30 bg-accent/10 px-3.5 py-1.5 backdrop-blur-sm">
                <span className="h-2 w-2 rounded-full bg-accent animate-pulse" />
                <span className="font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-accent">
                  Venta Directa · Distribuidor Autorizado ESAB Perú
                </span>
              </div>

              <h1 className="font-display text-[clamp(2.8rem,6.2vw,5.2rem)] font-black uppercase leading-[0.88] tracking-tight text-fog">
                Venta de Máquinas
                <br />
                de Soldar{" "}
                <span className="text-accent">Industriales.</span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-relaxed text-mist sm:text-base">
                Equipos <strong className="text-fog font-medium">MIG, TIG, MMA, Multiproceso y Láser</strong> listos para entrega inmediata. Asesoría técnica especializada para talleres, construcción y minería.
              </p>

              {/* Trust Strip */}
              <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 border-y border-white/10 py-3">
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-fog/90">
                  <Zap className="h-3.5 w-3.5 text-accent" /> Stock Inmediato
                </span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-fog/90">
                  <ShieldCheck className="h-3.5 w-3.5 text-accent" /> Garantía Oficial ESAB
                </span>
                <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.16em] text-fog/90">
                  <Truck className="h-3.5 w-3.5 text-accent" /> Envío a todo el Perú
                </span>
              </div>

              {/* CTAs inmediatos */}
              <div className="mt-6 flex flex-wrap items-center gap-3.5">
                <a
                  href={waLink("Hola MAQSYMA, quiero cotizar una máquina de soldar.")}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2.5 bg-accent px-6 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-ink transition-all hover:bg-accentbright hover:shadow-[0_0_28px_rgba(255,183,3,0.35)]"
                >
                  Cotizar por WhatsApp
                  <ArrowUpRight className="h-4 w-4" />
                </a>
                <button
                  type="button"
                  onClick={() => navigate("/catalogo")}
                  className="inline-flex items-center gap-2 border border-white/20 bg-white/5 px-6 py-3.5 font-mono text-xs uppercase tracking-[0.18em] text-fog backdrop-blur-sm transition hover:border-accent/60 hover:bg-white/10"
                >
                  Explorar Catálogo
                </button>
              </div>
            </div>

            {/* Columna Derecha: Equipo Estrella visible desde el pixel 0 */}
            <motion.div
              style={{ y: star1Y, scale: star1Scale }}
              className="relative hidden lg:col-span-5 lg:flex lg:flex-col lg:items-center"
            >
              {/* Halo de arco eléctrico detrás del equipo */}
              <div
                className="pointer-events-none absolute inset-0 m-auto h-80 w-80 rounded-full blur-3xl opacity-35"
                style={{ background: "radial-gradient(circle, #FFB703 0%, transparent 70%)" }}
                aria-hidden="true"
              />

              <div className="relative w-full border border-white/10 bg-coal/65 p-6 backdrop-blur-md">
                <div className="mb-2 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                    <Sparkles className="h-3.5 w-3.5" /> Equipo Estrella
                  </span>
                  <span className="border border-emerald-400/30 bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-emerald-300">
                    En Stock
                  </span>
                </div>

                <div className="relative flex h-64 items-center justify-center">
                  <img
                    src={STAR_MACHINES[0].image}
                    alt={STAR_MACHINES[0].name}
                    className="max-h-60 w-auto object-contain drop-shadow-[0_20px_35px_rgba(0,0,0,0.85)]"
                  />
                </div>

                <div className="mt-3 flex items-end justify-between border-t border-white/10 pt-3">
                  <div>
                    <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist">
                      {STAR_MACHINES[0].category}
                    </p>
                    <p className="font-display text-2xl font-black uppercase tracking-tight text-fog">
                      {STAR_MACHINES[0].name}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => jumpToSection(1)}
                    className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent underline-offset-4 hover:underline"
                  >
                    Ver ficha ↓
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════
            TRANSICIÓN VERTICAL CONECTADA (42%–56%)
            Cortina oscura industrial + haz luminoso de arco en el borde
            ═══════════════════════════════════════════════════════════════ */}
        <motion.div
          style={{ clipPath: curtainClip }}
          className="pointer-events-none absolute inset-0 z-20 bg-gradient-to-b from-[#0A0C12] via-[#08090C]/95 to-[#08090C]"
          aria-hidden="true"
        >
          {/* Glow ambiental reactivo al equipo estrella seleccionado */}
          <div
            className="absolute inset-0 opacity-25 transition-colors duration-500"
            style={{
              background: `radial-gradient(circle at 72% 48%, ${activeStar.accent}44 0%, transparent 55%)`,
            }}
          />
        </motion.div>

        {/* Haz luminoso vertical conectado al borde de la transición */}
        <motion.div
          style={{ top: beamTop, opacity: beamOpacity }}
          className="pointer-events-none absolute left-0 right-0 z-40 h-[3px]"
          aria-hidden="true"
        >
          <div
            className="h-full w-full"
            style={{
              background: `linear-gradient(90deg, transparent 0%, ${activeStar.accent} 30%, #FFFFFF 50%, ${activeStar.accent} 70%, transparent 100%)`,
              boxShadow: `0 0 24px 4px ${activeStar.accent}`,
            }}
          />
        </motion.div>

        {/* ═══════════════════════════════════════════════════════════════
            SECCIÓN 2 (50%–100%): EQUIPO ESTRELLA & LÍNEA INSIGNIA EN VENTA
            ═══════════════════════════════════════════════════════════════ */}
        <motion.div
          style={{
            y: sec2Y,
            opacity: sec2Opacity,
            pointerEvents: activeSection === 1 ? "auto" : "none",
          }}
          className="absolute inset-0 z-30 mx-auto flex h-full max-w-7xl items-center px-5 pt-16 sm:px-10 lg:px-12"
        >
          <div className="grid w-full items-center gap-8 lg:grid-cols-12">
            {/* Imagen protagonista del Equipo Estrella seleccionado */}
            <div className="relative flex flex-col items-center justify-center lg:col-span-6">
              <div
                className="pointer-events-none absolute inset-0 m-auto h-72 w-72 rounded-full blur-3xl opacity-30 transition-colors duration-500 sm:h-96 sm:w-96"
                style={{
                  background: `radial-gradient(circle, ${activeStar.accent} 0%, transparent 70%)`,
                }}
                aria-hidden="true"
              />

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStar.id}
                  initial={{ opacity: 0, y: 24, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -20, scale: 0.97 }}
                  transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                  className="relative flex h-56 items-center justify-center sm:h-80 lg:h-[380px]"
                >
                  <img
                    src={activeStar.image}
                    alt={activeStar.name}
                    className="max-h-full w-auto object-contain drop-shadow-[0_24px_45px_rgba(0,0,0,0.9)]"
                  />
                </motion.div>
              </AnimatePresence>

              {/* Selector rápido de Equipos Estrella */}
              <div
                className="mt-4 flex flex-wrap justify-center gap-2"
                role="tablist"
                aria-label="Seleccionar equipo estrella"
              >
                {STAR_MACHINES.map((machine, idx) => {
                  const isSelected = idx === selectedStarIdx;
                  return (
                    <button
                      key={machine.id}
                      type="button"
                      role="tab"
                      aria-selected={isSelected}
                      onClick={() => setSelectedStarIdx(idx)}
                      className="border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.16em] transition-all"
                      style={{
                        borderColor: isSelected ? machine.accent : "rgba(255,255,255,0.14)",
                        backgroundColor: isSelected ? `${machine.accent}22` : "rgba(16,18,23,0.7)",
                        color: isSelected ? "#F5F6F8" : "#9CA3AF",
                      }}
                    >
                      {machine.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Ficha Técnica y Cotización Directa */}
            <div className="lg:col-span-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeStar.id}
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -14 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                >
                  <div className="mb-3 flex items-center gap-3">
                    <span
                      className="h-px w-8 flex-shrink-0"
                      style={{ backgroundColor: activeStar.accent }}
                    />
                    <span
                      className="font-mono text-[10px] uppercase tracking-[0.24em]"
                      style={{ color: activeStar.accent }}
                    >
                      {activeStar.badge}
                    </span>
                  </div>

                  <h2 className="font-display text-[clamp(2.4rem,5vw,4.2rem)] font-black uppercase leading-[0.9] tracking-tight text-fog">
                    {activeStar.name}
                  </h2>

                  <p className="mt-2 font-mono text-xs uppercase tracking-[0.16em] text-accent">
                    {activeStar.highlight}
                  </p>

                  <p className="mt-4 max-w-lg text-sm leading-relaxed text-mist sm:text-base">
                    {activeStar.description}
                  </p>

                  {/* Tabla compacta de especificaciones */}
                  <div className="mt-6 grid grid-cols-3 gap-3 border-y border-white/10 py-4">
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-mist">
                        Proceso
                      </p>
                      <p className="mt-1 font-mono text-xs font-semibold text-fog sm:text-sm">
                        {activeStar.process}
                      </p>
                    </div>
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-mist">
                        Potencia
                      </p>
                      <p
                        className="mt-1 font-mono text-xs font-semibold sm:text-sm"
                        style={{ color: activeStar.accent }}
                      >
                        {activeStar.power}
                      </p>
                    </div>
                    <div>
                      <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-mist">
                        Modalidad
                      </p>
                      <p className="mt-1 font-mono text-xs font-semibold text-fog sm:text-sm">
                        {activeStar.modality}
                      </p>
                    </div>
                  </div>

                  {/* CTAs de conversión */}
                  <div className="mt-6 flex flex-wrap items-center gap-3.5">
                    <a
                      href={waLink(
                        `Hola MAQSYMA, quiero cotizar el equipo estrella ${activeStar.name} (${activeStar.process}).`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2.5 px-6 py-3.5 font-mono text-xs font-semibold uppercase tracking-[0.18em] text-ink transition-all hover:brightness-110"
                      style={{ backgroundColor: activeStar.accent }}
                    >
                      Cotizar {activeStar.name}
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => navigate("/catalogo")}
                      className="inline-flex items-center gap-2 border border-white/20 bg-white/5 px-6 py-3.5 font-mono text-xs uppercase tracking-[0.18em] text-fog transition hover:border-white/40 hover:bg-white/10"
                    >
                      Ver Todo el Catálogo
                    </button>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </motion.div>

        {/* ── Indicador lateral 01 / 02 ── */}
        <div
          className="absolute right-5 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-4 sm:right-8 sm:flex"
          aria-label="Navegación de secciones del Hero"
        >
          {[
            { idx: 0, label: "01 VENTA" },
            { idx: 1, label: "02 ESTRELLA" },
          ].map((item) => {
            const isActive = activeSection === item.idx;
            return (
              <button
                key={item.idx}
                type="button"
                onClick={() => jumpToSection(item.idx)}
                className="flex items-center gap-2.5 text-right transition-opacity"
              >
                <span
                  className={`font-mono text-[9px] uppercase tracking-[0.22em] transition-colors ${
                    isActive ? "text-accent" : "text-mist/45 hover:text-mist"
                  }`}
                >
                  {item.label}
                </span>
                <span
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: isActive ? "10px" : "6px",
                    height: isActive ? "10px" : "6px",
                    backgroundColor: isActive ? activeStar.accent : "rgba(255,255,255,0.2)",
                  }}
                />
              </button>
            );
          })}
        </div>

        {/* ── Scroll Hint en Sección 1 ── */}
        <motion.div
          style={{ opacity: hintOpacity }}
          className="pointer-events-none absolute bottom-5 left-1/2 z-30 flex -translate-x-1/2 flex-col items-center gap-1"
          aria-hidden="true"
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-mist/80">
            Desliza para ver equipo estrella
          </span>
          <ChevronDown className="h-4 w-4 text-accent animate-bounce" />
        </motion.div>
      </div>
    </section>
  );
}
