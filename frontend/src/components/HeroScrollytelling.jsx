/**
 * HeroScrollytelling — Experiencia Cinematográfica por Actos
 *
 * 5 actos en ~500vh con scroll-trigger:
 *   Acto 0: APERTURA — Headline, trust badges, atmospheric intro
 *   Acto 1: ARISTO 500iX — Multiproceso pulsado
 *   Acto 2: ARC 601i — Trabajo pesado
 *   Acto 3: REBEL EMP 320iC — Multiproceso en obra
 *   Acto 4: DUELER EHL 1500 — Soldadura láser + CTA final
 *
 * Técnica: video scrubbing HyperFrames + parallax CSS + clip-path reveal
 * Performance: 100% composited CSS transforms, sin WebGL, sin Three.js
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useMotionValue,
  useMotionValueEvent,
  AnimatePresence,
} from "framer-motion";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { waLink } from "../lib/scroll";

/* ─── Definición de Actos ─────────────────────────────────────────── */
const ACTS = [
  {
    id: "opening",
    index: 0,
    range: [0.0, 0.14],
    video: [0, 0],
    accent: "#00E5FF",
    label: "INICIO",
  },
  {
    id: "aristo",
    index: 1,
    range: [0.14, 0.36],
    video: [0, 2.5],
    accent: "#00E5FF",
    label: "ESTACIÓN 01",
    kicker: "ESTACIÓN 01 // MULTIPROCESO PULSADO",
    model: "ARISTO 500iX",
    process: "MIG / TIG / MMA",
    amperage: "500 A · 60%",
    modality: "VENTA · RENTING",
    description:
      "Fuente multiproceso industrial con pulso. Chasis reforzado con puntos de izaje; ideal para fabricación pesada, estructuras y producción continua.",
  },
  {
    id: "arc601",
    index: 2,
    range: [0.36, 0.58],
    video: [2.5, 5.0],
    accent: "#FFB703",
    label: "ESTACIÓN 02",
    kicker: "ESTACIÓN 02 // TRABAJO PESADO",
    model: "ARC 601i",
    process: "SMAW / ARCAIR",
    amperage: "601 A",
    modality: "VENTA · ALQUILER",
    description:
      "Fuente inversor IGBT para electrodo revestido y repelado por arco de carbono. Diseño compacto para obra, mantenimiento industrial y minería.",
  },
  {
    id: "rebel",
    index: 3,
    range: [0.58, 0.78],
    video: [5.0, 7.5],
    accent: "#38BDF8",
    label: "ESTACIÓN 03",
    kicker: "ESTACIÓN 03 // MULTIPROCESO EN OBRA",
    model: "REBEL EMP 320iC",
    process: "MIG / FCAW / TIG",
    amperage: "320 A",
    modality: "VENTA · ALQUILER",
    description:
      "Multiproceso portátil para trabajo en campo, talleres y construcción. Integra MIG, FCAW y TIG en un solo equipo robusto y liviano.",
  },
  {
    id: "dueler",
    index: 4,
    range: [0.78, 1.0],
    video: [7.5, 10.0],
    accent: "#FF6B35",
    label: "ESTACIÓN 04",
    kicker: "ESTACIÓN 04 // SOLDADURA LÁSER",
    model: "DUELER EHL 1500",
    process: "LÁSER LBW",
    amperage: "1,500 W",
    modality: "VENTA",
    description:
      "Soldadora láser portátil de mano para acero inoxidable, carbono y aluminio. Alta velocidad, mínima distorsión térmica y acabado de precisión.",
  },
];

const VIDEO_DURATION = 10; // segundos totales del video HyperFrames
const TOTAL_HEIGHT = "500vh";

/* ─── Easing cinemático (desacelera en zonas de equipo) ──────────── */
function cinematicVideoTime(progress) {
  for (const act of ACTS) {
    if (act.id === "opening") continue;
    const [start, end] = act.range;
    if (progress >= start && progress <= end) {
      const local = (progress - start) / (end - start);
      // Curva S: más lento al entrar y al contemplar, más rápido al transicionar
      const eased =
        local < 0.5
          ? 2 * local * local
          : 1 - Math.pow(-2 * local + 2, 2) / 2;
      return act.video[0] + eased * (act.video[1] - act.video[0]);
    }
  }
  // Apertura: frame 0
  return 0;
}

/* ─── Hook: acto activo ──────────────────────────────────────────── */
function useActiveAct(progress) {
  const [activeAct, setActiveAct] = useState(0);
  useMotionValueEvent(progress, "change", (p) => {
    let newAct = 0;
    for (let i = ACTS.length - 1; i >= 0; i--) {
      if (p >= ACTS[i].range[0]) {
        newAct = i;
        break;
      }
    }
    setActiveAct((prev) => (prev === newAct ? prev : newAct));
  });
  return activeAct;
}

/* ─── Componente: Chispas de Soldadura (Canvas 2D) ───────────────── */
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
      x: Math.random() * canvas.width * 0.6 + canvas.width * 0.2,
      y: canvas.height * 0.45 + Math.random() * 60,
      vx: (Math.random() - 0.5) * 3.5,
      vy: -(Math.random() * 4 + 2),
      life: 1,
      decay: Math.random() * 0.025 + 0.015,
      size: Math.random() * 2.5 + 0.8,
    });

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      if (Math.random() < 0.35) sparksRef.current.push(spawnSpark());
      sparksRef.current = sparksRef.current.filter((s) => s.life > 0);
      sparksRef.current.forEach((s) => {
        s.x += s.vx;
        s.y += s.vy;
        s.vy += 0.12; // gravedad
        s.life -= s.decay;
        ctx.globalAlpha = Math.max(0, s.life);
        ctx.fillStyle = `hsl(${30 + Math.random() * 20}, 100%, 75%)`;
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
      className="pointer-events-none absolute inset-0 h-full w-full opacity-70"
      aria-hidden="true"
    />
  );
}

/* ─── Componente: Scan-line de transición ────────────────────────── */
function ScanLine({ trigger }) {
  const [key, setKey] = useState(0);
  const prevTrigger = useRef(trigger);
  useEffect(() => {
    if (prevTrigger.current !== trigger) {
      setKey((k) => k + 1);
      prevTrigger.current = trigger;
    }
  }, [trigger]);
  return (
    <AnimatePresence>
      <motion.div
        key={key}
        initial={{ top: "-2px", opacity: 0 }}
        animate={{ top: "102vh", opacity: [0, 0.5, 0.5, 0] }}
        transition={{ duration: 0.7, ease: "easeInOut", times: [0, 0.1, 0.9, 1] }}
        className="pointer-events-none absolute left-0 right-0 z-30 h-[2px] bg-gradient-to-r from-transparent via-accent to-transparent"
        style={{ position: "absolute" }}
        aria-hidden="true"
      />
    </AnimatePresence>
  );
}

/* ─── Componente: Ficha Técnica de Estación ──────────────────────── */
function StationCard({ act, visible }) {
  if (!act || act.id === "opening") return null;
  const accent = act.accent;

  return (
    <AnimatePresence mode="wait">
      {visible && (
        <motion.div
          key={act.id}
          initial={{ opacity: 0, y: 24, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -16, filter: "blur(4px)" }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col justify-end"
        >
          {/* Kicker con línea de acento */}
          <div className="flex items-center gap-3 mb-3">
            <span
              className="h-px w-8 flex-shrink-0"
              style={{ backgroundColor: accent }}
            />
            <p className="font-mono text-[10px] uppercase tracking-[0.26em]" style={{ color: accent }}>
              {act.kicker}
            </p>
          </div>

          {/* Nombre del equipo — reveal por clip-path */}
          <motion.h2
            initial={{ clipPath: "inset(0 100% 0 0)" }}
            animate={{ clipPath: "inset(0 0% 0 0)" }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[clamp(2.8rem,5.5vw,4.8rem)] font-black uppercase leading-[0.9] tracking-tight text-fog"
          >
            {act.model}
          </motion.h2>

          {/* Descripción */}
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-4 max-w-sm text-sm leading-relaxed text-mist sm:text-base"
          >
            {act.description}
          </motion.p>

          {/* Specs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.35 }}
            className="mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-4"
          >
            {[
              ["Proceso", act.process],
              ["Amperaje", act.amperage],
              ["Modalidad", act.modality],
            ].map(([label, val]) => (
              <div key={label}>
                <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-mist">{label}</p>
                <p className="mt-1 font-mono text-[11px] uppercase text-fog/90">{val}</p>
              </div>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.45 }}
            className="mt-6 flex flex-col gap-3 sm:flex-row"
          >
            <a
              href={waLink(`Hola MAQSYMA, quiero cotizar el ${act.model}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary animate-cta-glow"
            >
              Cotizar {act.model}
            </a>
            <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-mist/50 self-center hidden sm:block">
              o
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ─── Componente: Apertura (Acto 0) ─────────────────────────────── */
function OpeningAct({ visible, scrollProgress }) {
  const y = useTransform(scrollProgress, [0, 0.14], [0, -30]);
  const opacity = useTransform(scrollProgress, [0, 0.10, 0.14], [1, 1, 0]);

  return (
    <motion.div
      style={{ opacity, y, pointerEvents: visible ? "auto" : "none" }}
      className="absolute inset-x-5 bottom-0 z-20 sm:inset-x-auto sm:bottom-0 sm:left-12 sm:max-w-2xl"
    >
      <div className="flex flex-col justify-end py-10">
        {/* Kicker */}
        <div className="flex items-center gap-3 mb-4">
          <span className="h-px w-6 bg-accent flex-shrink-0" />
          <p className="mono-label">Distribuidor Autorizado ESAB en Perú</p>
        </div>

        {/* Headline principal */}
        <h1 className="font-display text-[clamp(3rem,7vw,5.6rem)] font-black uppercase leading-[0.9] tracking-tight text-fog">
          Potencia para<br />
          soldar{" "}
          <span className="text-accent">sin límites.</span>
        </h1>

        <p className="mt-5 max-w-xl text-sm leading-relaxed text-mist sm:text-base">
          Equipos MIG, TIG, MMA y Multiproceso con garantía oficial, stock inmediato
          y asesoría técnica directa para soldadores, talleres e industria.
        </p>

        {/* Trust badges */}
        <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-4">
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-mist">
            ✓ Garantía oficial ESAB
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-mist">
            ✓ Stock inmediato
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-mist">
            ✓ Envío a nivel nacional
          </span>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Componente: HUD minimap ────────────────────────────────────── */
function ProgressHUD({ activeIndex, scrollProgress }) {
  const stationActs = ACTS.filter((a) => a.id !== "opening");

  return (
    <div
      className="absolute right-5 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-end gap-4 sm:right-12 sm:flex"
      aria-hidden="true"
    >
      {ACTS.map((act, i) => {
        const isActive = activeIndex === i;
        return (
          <div key={act.id} className="flex items-center gap-3">
            <span
              className={`font-mono text-[9px] uppercase tracking-[0.22em] transition-colors duration-300 ${
                isActive ? "text-accent" : "text-mist/40"
              }`}
            >
              {act.label}
            </span>
            <span
              className="transition-all duration-300"
              style={{
                width: isActive ? "10px" : "5px",
                height: isActive ? "10px" : "5px",
                borderRadius: "50%",
                backgroundColor: isActive ? (ACTS[activeIndex]?.accent || "#FFB703") : "rgba(255,255,255,0.2)",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}

/* ─── Fallback: Estático (reduced-motion o mobile) ───────────────── */
function StaticFallback({ onReady }) {
  const navigate = useNavigate();
  useEffect(() => { onReady?.(); }, [onReady]);

  return (
    <section
      className="relative flex min-h-screen items-end bg-ink py-14"
      aria-label="Showroom de equipos ESAB"
    >
      <video
        src="/assets/hero/maqsyma-hero.mp4"
        playsInline
        muted
        preload="auto"
        className="absolute inset-0 h-full w-full object-cover opacity-40"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/30" />
      <div className="section-head relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="h-px w-6 bg-accent" />
          <p className="mono-label">Distribuidor Autorizado ESAB en Perú</p>
        </div>
        <h1 className="font-display text-5xl font-black uppercase leading-none tracking-tight text-fog">
          Potencia para<br />soldar <span className="text-accent">sin límites.</span>
        </h1>
        <div className="mt-8 flex gap-4 flex-wrap">
          {ACTS.filter((a) => a.id !== "opening").map((act) => (
            <a
              key={act.id}
              href={waLink(`Hola MAQSYMA, quiero cotizar el ${act.model}.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist border border-white/10 px-4 py-2 hover:border-accent hover:text-accent transition-colors"
            >
              {act.model}
            </a>
          ))}
        </div>
        <div className="mt-8 flex gap-4">
          <a
            href={waLink("Hola MAQSYMA, quiero cotizar un equipo de soldadura.")}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary"
          >
            Cotizar por WhatsApp
          </a>
          <button onClick={() => navigate("/catalogo")} className="btn-ghost">
            Ver catálogo <ArrowUpRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}

/* ─── Componente Principal ───────────────────────────────────────── */
export default function HeroScrollytelling({ onReady }) {
  const navigate = useNavigate();
  const rm = useReducedMotion();

  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const [videoReady, setVideoReady] = useState(false);
  const [activeActIndex, setActiveActIndex] = useState(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  const hintOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);

  /* Scrubbing cinemático del video */
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const vid = videoRef.current;
    if (!vid || !videoReady) return;
    const targetTime = cinematicVideoTime(p);
    if (Math.abs(vid.currentTime - targetTime) > 0.016) {
      vid.currentTime = Math.min(Math.max(targetTime, 0), VIDEO_DURATION - 0.034);
    }

    // Actualizar acto activo
    let newAct = 0;
    for (let i = ACTS.length - 1; i >= 0; i--) {
      if (p >= ACTS[i].range[0]) {
        newAct = i;
        break;
      }
    }
    setActiveActIndex((prev) => (prev === newAct ? prev : newAct));
  });

  /* Señal onReady cuando video está listo */
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;
    const handleReady = () => {
      setVideoReady(true);
      vid.currentTime = 0;
      onReady?.();
    };
    if (vid.readyState >= 3) {
      handleReady();
    } else {
      vid.addEventListener("canplaythrough", handleReady, { once: true });
    }
    return () => vid.removeEventListener("canplaythrough", handleReady);
  }, [onReady]);

  /* Saltar a acto */
  const jumpToAct = useCallback((actIndex) => {
    const section = sectionRef.current;
    if (!section) return;
    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    const sectionH = section.offsetHeight - window.innerHeight;
    const actProgress = ACTS[actIndex].range[0];
    const targetY = sectionTop + actProgress * sectionH;
    if (window.__lenis) {
      window.__lenis.scrollTo(targetY, { duration: 1.0 });
    } else {
      window.scrollTo({ top: targetY, behavior: "smooth" });
    }
  }, []);

  if (rm) return <StaticFallback onReady={onReady} />;

  const activeAct = ACTS[activeActIndex];
  const isOpening = activeActIndex === 0;
  const accentColor = activeAct?.accent || "#FFB703";

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: TOTAL_HEIGHT }}
      data-testid="hero-scrollytelling"
      aria-label="Showroom cinemático de equipos ESAB"
    >
      {/* Panel sticky */}
      <div className="sticky top-0 h-screen overflow-hidden bg-ink">

        {/* VIDEO scrubbing — fondo del showroom */}
        <video
          ref={videoRef}
          src="/assets/hero/maqsyma-hero.mp4"
          playsInline
          muted
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover"
          aria-hidden="true"
        />

        {/* Vignette dinámica — más oscura en apertura, se abre para equipos */}
        <motion.div
          className="pointer-events-none absolute inset-0"
          animate={{
            background: isOpening
              ? "linear-gradient(to right, rgba(6,8,10,0.92) 0%, rgba(6,8,10,0.55) 60%, rgba(6,8,10,0.2) 100%)"
              : "linear-gradient(to right, rgba(6,8,10,0.88) 0%, rgba(6,8,10,0.45) 55%, rgba(6,8,10,0.1) 100%)",
          }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
        {/* Gradiente inferior */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-ink/55" />

        {/* Acento de color reactivo al acto — línea superior */}
        <motion.div
          className="absolute top-0 left-0 right-0 z-10 h-[2px]"
          animate={{ backgroundColor: accentColor, opacity: isOpening ? 0 : 0.6 }}
          transition={{ duration: 0.5 }}
        />

        {/* Chispas de soldadura — solo en estaciones (no en apertura) */}
        <SparkCanvas active={!isOpening} />

        {/* ── Tabs de navegación (izquierda superior) ── */}
        <div
          className="absolute left-5 top-24 z-30 flex flex-col gap-1 sm:left-12"
          role="tablist"
          aria-label="Actos del showroom"
        >
          {ACTS.map((act, i) => {
            const isActive = activeActIndex === i;
            return (
              <button
                key={act.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => jumpToAct(i)}
                className="group flex items-center gap-3 py-1 text-left transition-all duration-200"
              >
                <span
                  className="h-px transition-all duration-300"
                  style={{
                    width: isActive ? "36px" : "20px",
                    backgroundColor: isActive ? accentColor : "rgba(255,255,255,0.2)",
                  }}
                />
                <span
                  className="font-mono text-[10px] uppercase tracking-[0.22em] transition-colors duration-200"
                  style={{ color: isActive ? accentColor : "rgba(156,163,175,0.5)" }}
                >
                  {String(i).padStart(2, "0")}
                </span>
                <span
                  className="hidden font-mono text-[10px] uppercase tracking-[0.18em] transition-colors duration-200 sm:block"
                  style={{ color: isActive ? "rgba(245,246,248,0.9)" : "rgba(156,163,175,0.35)" }}
                >
                  {act.label}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Contenido narrativo ── */}
        <div className="absolute inset-x-5 bottom-0 z-20 sm:inset-x-auto sm:bottom-0 sm:left-12 sm:max-w-xl">
          {/* Apertura (Acto 0) */}
          <OpeningAct
            visible={isOpening}
            scrollProgress={scrollYProgress}
          />

          {/* Fichas de estaciones (Actos 1–4) */}
          <div className="relative min-h-[340px] sm:min-h-[360px] flex flex-col justify-end py-10">
            {ACTS.filter((a) => a.id !== "opening").map((act) => (
              <div key={act.id} className="absolute inset-0 flex flex-col justify-end">
                <StationCard act={act} visible={activeAct?.id === act.id} />
              </div>
            ))}

            {/* CTA Ver catálogo — siempre visible en actos de estación */}
            <AnimatePresence>
              {!isOpening && (
                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  onClick={() => navigate("/catalogo")}
                  className="btn-ghost mt-3 w-fit"
                  style={{ position: "relative", zIndex: 10 }}
                >
                  Ver catálogo completo <ArrowUpRight className="h-4 w-4" />
                </motion.button>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── HUD minimap lateral derecho ── */}
        <ProgressHUD activeIndex={activeActIndex} scrollProgress={scrollYProgress} />

        {/* ── Contador de acto (derecho centro) ── */}
        <div
          className="absolute right-5 bottom-10 z-30 hidden flex-col items-end sm:right-12 sm:flex"
          aria-hidden="true"
        >
          <span className="font-mono text-3xl font-black tabular-nums leading-none" style={{ color: `${accentColor}30` }}>
            {String(activeActIndex).padStart(2, "0")}
          </span>
          <span className="mt-1 h-px w-5 bg-white/20" />
          <span className="mt-1 font-mono text-[9px] tabular-nums text-mist/40">
            {String(ACTS.length - 1).padStart(2, "0")}
          </span>
        </div>

        {/* ── Barra de progreso inferior segmentada ── */}
        <div className="absolute bottom-0 left-0 right-0 z-30 flex h-[2px] bg-white/8">
          {ACTS.map((act, i) => (
            <SegmentProgress
              key={act.id}
              progress={scrollYProgress}
              range={act.range}
              accent={act.accent}
            />
          ))}
        </div>

        {/* ── Scroll hint inicial ── */}
        <motion.div
          style={{ opacity: hintOpacity }}
          className="absolute bottom-10 left-1/2 z-30 hidden -translate-x-1/2 flex-col items-center gap-2 md:flex"
          aria-hidden="true"
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-mist">
            Desliza para explorar
          </span>
          <ChevronDown className="h-4 w-4 animate-bounce" style={{ color: accentColor }} />
        </motion.div>

      </div>
    </section>
  );
}

/* ─── Segmento de barra de progreso ──────────────────────────────── */
function SegmentProgress({ progress, range, accent }) {
  const scaleX = useTransform(progress, range, [0, 1], { clamp: true });
  return (
    <div className="relative flex-1 overflow-hidden">
      <motion.div
        className="absolute inset-0 origin-left"
        style={{ scaleX, backgroundColor: accent }}
      />
    </div>
  );
}
