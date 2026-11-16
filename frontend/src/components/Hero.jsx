import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
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
  const [pct, setPct] = useState(0);
  const frameRef = useRef(null);
  const { scrollY } = useScroll();
  const imgY = useTransform(scrollY, [0, 600], [0, 48]);

  useEffect(() => {
    if (rm) {
      setPct(100);
      return;
    }
    let raf;
    const t0 = performance.now();
    const DUR = 1400;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / DUR);
      setPct(Math.round((1 - Math.pow(1 - p, 3)) * 100));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [rm]);

  const onSpot = (e) => {
    const r = frameRef.current?.getBoundingClientRect();
    if (!r) return;
    frameRef.current.style.setProperty("--mx", `${e.clientX - r.left}px`);
    frameRef.current.style.setProperty("--my", `${e.clientY - r.top}px`);
  };

  return (
    <section className="relative overflow-hidden bg-grid" aria-label="Presentación">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#07080A_78%)]" />
      <div className="section-head relative grid grid-cols-1 items-end gap-12 pt-32 pb-10 lg:min-h-[100svh] lg:grid-cols-12 lg:gap-10 lg:pt-40 lg:pb-14">
        <div className="lg:col-span-7">
          <motion.p
            initial={{ opacity: rm ? 1 : 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="mono-label flex items-center gap-3"
          >
            <span className="inline-block h-2 w-2 bg-accent" />
            Equipos de soldadura / Tecnología industrial
          </motion.p>

          <h1 className="mt-6" data-testid="hero-title">
            {LINES.map((l, i) => (
              <span key={l} className="block overflow-hidden">
                <motion.span
                  className={`block font-display text-[clamp(3.6rem,9.5vw,8rem)] font-black uppercase leading-[0.92] tracking-tight ${i === 2 ? "text-accent" : ""}`}
                  initial={rm ? false : { y: "112%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.75, delay: 0.18 + i * 0.14, ease: [0.22, 1, 0.36, 1] }}
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
            className="mt-6 max-w-xl text-base leading-relaxed text-mist sm:text-lg"
          >
            Máquinas de soldar, corte y accesorios para soldadores, talleres e industria.
            Tecnología seleccionada para responder cuando el trabajo realmente importa.
          </motion.p>

          <motion.div
            initial={{ opacity: rm ? 1 : 0, y: rm ? 0 : 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 1 }}
            className="mt-9 flex flex-col gap-4 sm:flex-row"
          >
            <button className="btn-primary" onClick={scrollToSection("maquinas")} data-testid="hero-cta-machines">
              Ver máquinas <span aria-hidden="true">→</span>
            </button>
            <a className="btn-ghost" href={WA_DEFAULT} target="_blank" rel="noopener noreferrer" data-testid="hero-cta-quote">
              Solicitar cotización
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: rm ? 1 : 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.15 }}
            className="mt-12"
          >
            <div className="grid grid-cols-2 border-t border-l border-white/10 lg:grid-cols-4">
              {TECH_STRIP.map(([k, v]) => (
                <div key={k} className="border-b border-r border-white/10 p-4">
                  <p className="mono-label">{k}</p>
                  <p className="mt-2 font-mono text-[11px] uppercase tracking-wider text-fog/90">{v}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center gap-4" data-testid="hero-progress">
              <span className="font-mono text-[11px] tabular-nums text-accent" data-testid="hero-progress-percent">
                {String(pct).padStart(3, "0")}%
              </span>
              <span className="h-px flex-1 bg-white/10">
                <span
                  className="block h-px bg-accent transition-[width] duration-100 ease-linear"
                  style={{ width: `${pct}%` }}
                  data-testid="hero-progress-bar"
                />
              </span>
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist" data-testid="hero-status">
                {statusFor(pct)}
              </span>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="relative lg:col-span-5"
          initial={{ opacity: rm ? 1 : 0, y: rm ? 0 : 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.div style={rm ? undefined : { y: imgY }}>
            <div
              ref={frameRef}
              onMouseMove={onSpot}
              className="group relative aspect-[4/5] overflow-hidden border border-white/10 bg-coal"
              data-testid="hero-image-frame"
            >
              <img
                src={HERO_IMG}
                alt="Máquina de soldar industrial en taller con iluminación cinematográfica"
                className="h-full w-full object-cover object-[78%_center]"
                loading="eager"
              />
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                style={{
                  background:
                    "radial-gradient(260px at var(--mx,50%) var(--my,50%), rgba(0,230,118,0.12), transparent 70%)",
                }}
              />
              <span className="absolute left-3 top-3 h-4 w-4 border-l border-t border-white/40" />
              <span className="absolute right-3 top-3 h-4 w-4 border-r border-t border-white/40" />
              <span className="absolute bottom-3 left-3 h-4 w-4 border-b border-l border-white/40" />
              <span className="absolute bottom-3 right-3 h-4 w-4 border-b border-r border-white/40" />
              <span className="mono-label absolute left-4 top-5 bg-ink/50 px-2 py-1 backdrop-blur-sm">
                Unidad / Soldadura industrial
              </span>
              <span className="absolute bottom-5 right-4 bg-ink/50 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-mist backdrop-blur-sm">
                [Modelo / serie — por confirmar]
              </span>
            </div>
            <p className="mt-3 text-right font-mono text-[9px] uppercase tracking-[0.2em] text-mist/70">
              Fotografía de presentación — producto real por cargar
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
