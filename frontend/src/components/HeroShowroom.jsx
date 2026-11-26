/**
 * HeroShowroom — Opción 2: Showroom Interactivo por Estaciones
 *
 * Mecánica:
 *  - Scroll-trigger con framer-motion useScroll en sección de 240vh
 *  - El progreso de scroll [0→1] se mapea a 4 estaciones (0–0.25, 0.25–0.5, etc.)
 *  - El video HyperFrames renderizado se sincroniza al scroll via currentTime (scrubbing)
 *  - Pestañas superiores permiten saltar instantáneamente a cualquier estación
 *  - Ficha técnica se actualiza en vivo al cambiar estación
 *  - Fallback estático para reduced-motion
 */
import { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  useReducedMotion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import { ArrowUpRight, ChevronDown } from "lucide-react";
import { waLink } from "../lib/scroll";

/* ─── Datos de las 4 estaciones ─────────────────────────────────── */
const STATIONS = [
  {
    id: "aristo",
    index: 0,
    kicker: "ESTACIÓN 01 // MULTIPROCESO PULSADO",
    model: "ARISTO 500iX",
    process: "MIG / TIG / MMA",
    amperage: "500 A · 60%",
    modality: "VENTA · RENTING",
    description:
      "Fuente multiproceso industrial con pulso. Chasis reforzado con puntos de izaje; ideal para fabricación pesada, estructuras y producción continua.",
    videoStart: 0,      // segundos en el video HyperFrames
    videoEnd: 2.5,
  },
  {
    id: "arc601",
    index: 1,
    kicker: "ESTACIÓN 02 // TRABAJO PESADO",
    model: "ARC 601i",
    process: "SMAW / ARCAIR",
    amperage: "601 A",
    modality: "VENTA · ALQUILER",
    description:
      "Fuente inversor IGBT para electrodo revestido y repelado por arco de carbono. Diseño compacto para obra, mantenimiento industrial y minería.",
    videoStart: 2.5,
    videoEnd: 5.0,
  },
  {
    id: "rebel",
    index: 2,
    kicker: "ESTACIÓN 03 // MULTIPROCESO EN OBRA",
    model: "REBEL EMP 320iC",
    process: "MIG / FCAW / TIG",
    amperage: "320 A",
    modality: "VENTA · ALQUILER",
    description:
      "Multiproceso portátil para trabajo en campo, talleres y construcción. Integra MIG, FCAW y TIG en un solo equipo robusto y liviano.",
    videoStart: 5.0,
    videoEnd: 7.5,
  },
  {
    id: "dueler",
    index: 3,
    kicker: "ESTACIÓN 04 // SOLDADURA LÁSER",
    model: "DUELER EHL 1500",
    process: "LÁSER LBW",
    amperage: "1,500 W",
    modality: "VENTA",
    description:
      "Soldadora láser portátil de mano para acero inoxidable, carbono y aluminio. Alta velocidad, mínima distorsión térmica y acabado de precisión.",
    videoStart: 7.5,
    videoEnd: 10.0,
  },
];

const VIDEO_DURATION = 10; // segundos totales del video

/* ─── Barra de progreso por estación (evita hooks en .map) ────── */
function StationProgressSegment({ progress, index, total }) {
  const scaleX = useTransform(
    progress,
    [index / total, (index + 1) / total],
    [0, 1],
    { clamp: true }
  );
  return <motion.div className="h-full flex-1 origin-left bg-accent" style={{ scaleX }} />;
}

/* ─── Componente ficha técnica ───────────────────────────────────── */
function SpecCard({ station, visible }) {
  return (
    <motion.div
      key={station.id}
      initial={{ opacity: 0, y: 18, filter: "blur(4px)" }}
      animate={visible ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 0, y: -10, filter: "blur(4px)" }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="absolute inset-0 flex flex-col justify-end p-7 sm:p-9"
      aria-hidden={!visible}
    >
      <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-accent">
        {station.kicker}
      </p>
      <h2 className="mt-2 font-display text-[clamp(2.6rem,5.5vw,4.6rem)] font-black uppercase leading-[0.92] tracking-tight text-fog">
        {station.model}
      </h2>
      <p className="mt-3 max-w-sm text-sm leading-relaxed text-mist sm:text-base">
        {station.description}
      </p>
      <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
        {[
          ["Proceso", station.process],
          ["Amperaje", station.amperage],
          ["Modalidad", station.modality],
        ].map(([label, val]) => (
          <div key={label}>
            <p className="font-mono text-[9px] uppercase tracking-[0.2em] text-mist">{label}</p>
            <p className="mt-1 font-mono text-[11px] uppercase text-fog/90">{val}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ─── Hero Showroom (con scroll-trigger) ────────────────────────── */
export default function HeroShowroom({ onReady }) {
  const navigate = useNavigate();
  const rm = useReducedMotion();

  const sectionRef = useRef(null);
  const videoRef = useRef(null);
  const [activeStation, setActiveStation] = useState(0);
  const [videoReady, setVideoReady] = useState(false);

  /* Scroll progress sobre la sección completa */
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  /* Mapeo scroll → tiempo del video (scrubbing) */
  const videoTime = useTransform(scrollYProgress, [0, 1], [0, VIDEO_DURATION]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);

  /* Actualizar currentTime del video en cada tick de scroll */
  useMotionValueEvent(videoTime, "change", (t) => {
    const vid = videoRef.current;
    if (!vid || !videoReady) return;
    // Solo mover si la diferencia es perceptible (evitar microjitters)
    if (Math.abs(vid.currentTime - t) > 0.016) {
      vid.currentTime = Math.min(Math.max(t, 0), VIDEO_DURATION - 0.034);
    }
  });

  /* Detectar estación activa por scroll */
  useMotionValueEvent(scrollYProgress, "change", (p) => {
    const idx = Math.min(Math.floor(p * STATIONS.length), STATIONS.length - 1);
    setActiveStation(idx);
  });

  /* Listo para montar */
  useEffect(() => {
    const vid = videoRef.current;
    if (!vid) return;

    const handleCanPlay = () => {
      setVideoReady(true);
      vid.currentTime = 0;
      onReady?.();
    };

    if (vid.readyState >= 3) {
      handleCanPlay();
    } else {
      vid.addEventListener("canplaythrough", handleCanPlay, { once: true });
    }
    return () => vid.removeEventListener("canplaythrough", handleCanPlay);
  }, [onReady]);

  /* Saltar a estación por clic en pestaña */
  const jumpToStation = useCallback((idx) => {
    const section = sectionRef.current;
    if (!section) return;
    const sectionTop = section.getBoundingClientRect().top + window.scrollY;
    const sectionH = section.offsetHeight - window.innerHeight;
    const targetY = sectionTop + (idx / STATIONS.length) * sectionH;
    if (window.__lenis) {
      window.__lenis.scrollTo(targetY, { duration: 0.9 });
    } else {
      window.scrollTo({ top: targetY, behavior: "smooth" });
    }
  }, []);

  /* ── Fallback reduced-motion ── */
  if (rm) {
    const s = STATIONS[0];
    return (
      <section
        className="relative flex min-h-screen items-end bg-ink py-14"
        aria-label="Showroom de equipos ESAB"
      >
        <video
          ref={videoRef}
          src="/assets/hero/maqsyma-hero.mp4"
          playsInline
          muted
          preload="auto"
          className="absolute inset-0 h-full w-full object-cover opacity-40"
          onCanPlayThrough={() => onReady?.()}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/60 to-ink/30" />
        <div className="section-head relative z-10">
          <p className="mono-label text-accent">{s.kicker}</p>
          <h2 className="mt-3 font-display text-5xl font-black uppercase leading-none tracking-tight text-fog">
            {s.model}
          </h2>
          <div className="mt-8 flex gap-4">
            <a href={waLink("Hola MAQSYMA, quiero cotizar un equipo.")} target="_blank" rel="noopener noreferrer" className="btn-primary">
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

  return (
    /* Sección de 240vh para que el scroll-trigger tenga recorrido suficiente */
    <section
      ref={sectionRef}
      className="relative h-[240vh]"
      data-testid="hero-showroom"
      aria-label="Showroom interactivo de equipos ESAB"
    >
      {/* Panel sticky que ocupa el viewport mientras dura el scroll */}
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

        {/* Gradiente izquierdo para legibilidad de fichas */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/50 to-transparent" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/80 via-transparent to-ink/60" />

        {/* ── Pestañas de estación — parte superior izquierda ── */}
        <div
          className="absolute left-5 top-24 z-30 flex flex-col gap-1 sm:left-12"
          role="tablist"
          aria-label="Estaciones del showroom"
        >
          {STATIONS.map((st, i) => {
            const isActive = activeStation === i;
            return (
              <button
                key={st.id}
                role="tab"
                aria-selected={isActive}
                onClick={() => jumpToStation(i)}
                data-testid={`showroom-tab-${i}`}
                className={`group flex items-center gap-3 py-1 text-left transition-all duration-200`}
              >
                <span
                  className={`h-px w-6 transition-all duration-300 ${
                    isActive ? "w-10 bg-accent" : "bg-white/25 group-hover:bg-white/50"
                  }`}
                />
                <span
                  className={`font-mono text-[10px] uppercase tracking-[0.22em] transition-colors duration-200 ${
                    isActive ? "text-accent" : "text-mist/60 group-hover:text-fog"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={`hidden font-mono text-[10px] uppercase tracking-[0.18em] transition-colors duration-200 sm:block ${
                    isActive ? "text-fog" : "text-mist/40 group-hover:text-mist"
                  }`}
                >
                  {st.model}
                </span>
              </button>
            );
          })}
        </div>

        {/* ── Fichas técnicas (stack, solo visible la activa) ── */}
        <div
          className="absolute inset-x-5 bottom-0 z-20 sm:inset-x-auto sm:bottom-0 sm:left-12 sm:max-w-xl"
          aria-live="polite"
          aria-atomic="true"
        >
          <div className="relative h-72 sm:h-80">
            {STATIONS.map((st, i) => (
              <SpecCard key={st.id} station={st} visible={activeStation === i} />
            ))}
          </div>

          {/* CTAs fijos */}
          <div className="flex flex-col gap-3 pb-10 sm:flex-row">
            <a
              href={waLink(
                `Hola MAQSYMA, quiero cotizar el ${STATIONS[activeStation].model}.`
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              data-testid="showroom-cta-quote"
            >
              Cotizar {STATIONS[activeStation].model}
            </a>
            <button
              type="button"
              onClick={() => navigate("/catalogo")}
              className="btn-ghost"
              data-testid="showroom-cta-catalog"
            >
              Ver catálogo completo <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Barra de progreso inferior */}
        <div className="absolute bottom-0 left-0 right-0 z-30 flex h-[3px] bg-white/10">
          {STATIONS.map((st, i) => (
            <StationProgressSegment
              key={st.id}
              progress={scrollYProgress}
              index={i}
              total={STATIONS.length}
            />
          ))}
        </div>

        {/* Scroll hint */}
        <motion.div
          style={{ opacity: hintOpacity }}
          className="absolute bottom-10 left-1/2 z-30 hidden -translate-x-1/2 flex-col items-center gap-1.5 md:flex"
          aria-hidden="true"
        >
          <span className="font-mono text-[9px] uppercase tracking-[0.24em] text-mist">
            Desliza para explorar
          </span>
          <ChevronDown className="h-4 w-4 text-accent" />
        </motion.div>

        {/* Contador de estación */}
        <div
          className="absolute right-5 top-1/2 z-30 hidden -translate-y-1/2 flex-col items-center gap-1 sm:right-12 sm:flex"
          aria-hidden="true"
        >
          <span className="font-mono text-3xl font-black tabular-nums text-fog/20 leading-none">
            {String(activeStation + 1).padStart(2, "0")}
          </span>
          <span className="h-px w-5 bg-white/20" />
          <span className="font-mono text-[9px] tabular-nums text-mist/50">
            {String(STATIONS.length).padStart(2, "0")}
          </span>
        </div>
      </div>
    </section>
  );
}
