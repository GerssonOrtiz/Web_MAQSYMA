import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowUpRight, ShieldCheck, Flame, Cpu, Wrench } from "lucide-react";
import { WA_DEFAULT, scrollToSection } from "../../lib/scroll";

const SCENE_CONTENT = [
  {
    id: "scene-1",
    tag: "PUNTO 01 · POTENCIA Y TRABAJO PESADO",
    heroImage: "/assets/hero/products/warrior-500i/front.webp",
    imageBadge: "ESAB WARRIOR 500i",
    title: "SOLUCIONES DE SOLDADURA",
    highlight: "DE GRADO INDUSTRIAL.",
    description:
      "Plataforma de alta potencia para minería, astilleros y calderería pesada. Máximo rendimiento de arco bajo las condiciones operativas más extremas.",
    productName: "ESAB WARRIOR™ 500i CC/CV",
    productCategory: "MULTIPROCESO INDUSTRIAL PESADO",
    specs: [
      { label: "Corriente Max.", val: "500 A @ 60%" },
      { label: "Tecnología", val: "Inverter TrueArc™" },
      { label: "Protección", val: "IP23 Grado Minero" },
    ],
    primaryCta: { label: "Cotizar Warrior 500i", action: "quote-warrior" },
    secondaryCta: { label: "Ver máquinas pesadas", action: "catalog" },
  },
  {
    id: "scene-2",
    tag: "PUNTO 02 · PRODUCTIVIDAD Y VERSATILIDAD",
    heroImage: "/assets/hero/products/rustler-em455i/front.webp",
    imageBadge: "ESAB RUSTLER EM455i",
    title: "TECNOLOGÍA SINÉRGICA",
    highlight: "PARA FABRICACIÓN CONTINUA.",
    description:
      "Control de arco inteligente para talleres de estructuras metálicas y manufactura exigente. Alimentación suave de alambre con reducción total de salpicaduras.",
    productName: "ESAB RUSTLER™ EM455i",
    productCategory: "MIG / MAG SINÉRGICO DE ALTO RENDIMIENTO",
    specs: [
      { label: "Ciclo de Trabajo", val: "450 A @ 60%" },
      { label: "Panel Digital", val: "Ajuste Sinérgico QuickSet" },
      { label: "Alimentador", val: "4 Rodillos de Alta Precisión" },
    ],
    primaryCta: { label: "Cotizar Rustler EM455i", action: "quote-rustler" },
    secondaryCta: { label: "Ver especificaciones", action: "specs" },
  },
  {
    id: "scene-3",
    tag: "PUNTO 03 · MOVILIDAD Y PRECISIÓN PROFESIONAL",
    heroImage: "/assets/hero/products/rogue-em210/front.webp",
    imageBadge: "ESAB ROGUE EM210 PRO",
    title: "MÁXIMA VERSATILIDAD",
    highlight: "PARA TALLERES Y CONTRATISTAS.",
    description:
      "Potencia profesional en formato portátil ultra-robusto. Ideal para mantenimiento en planta, talleres mecánicos y soldadores independientes con conexión 120V/230V.",
    productName: "ESAB ROGUE™ EM210 PRO",
    productCategory: "COMPACTO MULTIPROCESO MONOFÁSICO",
    specs: [
      { label: "Salida", val: "210 A @ 30%" },
      { label: "Peso", val: "13.5 kg Carcasa Robusta" },
      { label: "Voltaje", val: "120V / 230V Dual Auto" },
    ],
    primaryCta: { label: "Cotizar Rogue EM210", action: "quote-rogue" },
    secondaryCta: { label: "Ver catálogo liviano", action: "catalog" },
  },
  {
    id: "scene-4",
    tag: "PUNTO 04 · PROTECCIÓN Y SEGURIDAD INTEGRAL",
    heroImage: "/assets/hero/products/epp-zone/team.webp",
    imageBadge: "PROTECCIÓN EN ACCIÓN",
    title: "EQUIPOS DE PROTECCIÓN",
    highlight: "PARA EL SOLDADOR PROFESIONAL.",
    description:
      "Soluciones integrales para trabajo seguro: caretas electrónicas fotosensibles de alta definición óptica, guantes reforzados de carnaza/kevlar, mandiles y protección respiratoria.",
    productName: "ZONA SEGURIDAD INDUSTRIAL & EPP",
    productCategory: "CARETAS FOTOSENSIBLES · GUANTES · INDUMENTARIA · CASCOS",
    specs: [
      { label: "Caretas Ópticas", val: "Clase 1/1/1/1 TrueColor" },
      { label: "Guantes Cuero", val: "Kevlar Alta Temperatura" },
      { label: "Normativa", val: "ANSI Z87.1 / EN 175" },
    ],
    primaryCta: { label: "Cotizar línea de EPP", action: "quote-epp" },
    secondaryCta: { label: "Consultar asesor técnico", action: "quote" },
  },
];

const SCENE_ACCENT_CLASSES = {
  0: { dot: 'bg-cyan-400 shadow-[0_0_8px_#00f0ff]', text: 'text-cyan-400' },
  1: { dot: 'bg-amber-400 shadow-[0_0_8px_#fbbf24]', text: 'text-amber-400' },
  2: { dot: 'bg-sky-400 shadow-[0_0_8px_#38bdf8]',   text: 'text-sky-400'  },
  3: { dot: 'bg-orange-400 shadow-[0_0_8px_#fb923c]', text: 'text-orange-400' },
};

export default function CinemaOverlay({ activeScene = 0, progress = 0 }) {
  const current = SCENE_CONTENT[activeScene] || SCENE_CONTENT[0];

  const handleAction = (type) => {
    if (type === "catalog" || type === "specs") {
      scrollToSection("maquinas");
    } else {
      window.open(WA_DEFAULT, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="pointer-events-none absolute inset-0 z-20 flex flex-col justify-between p-6 sm:p-10 md:p-14">
      {/* Dynamic Scan Line Effect on Scene Change */}
      <AnimatePresence>
        <motion.div
          key={`scan-${activeScene}`}
          initial={{ scaleY: 0, opacity: 0.6 }}
          animate={{ scaleY: [0, 1, 1, 0], opacity: [0, 0.4, 0.4, 0] }}
          transition={{ duration: 0.45, times: [0, 0.2, 0.8, 1] }}
          className="pointer-events-none absolute inset-x-0 top-1/2 h-px bg-cyan-400 shadow-[0_0_20px_#00f0ff] z-30"
        />
      </AnimatePresence>

      {/* Top Bar Indicators */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`h-2 w-2 rounded-full animate-pulse ${SCENE_ACCENT_CLASSES[activeScene].dot}`} />
          <span className={`font-mono text-xs tracking-widest uppercase ${SCENE_ACCENT_CLASSES[activeScene].text}`}>
            {current.tag}
          </span>
        </div>

        {/* Linear minimap */}
        <div className="flex items-center gap-2 font-mono text-[10px]">
          <span className="text-white/40">NAVE</span>
          <div className="relative h-1.5 w-32 rounded-full bg-white/10">
            {/* Track de progreso */}
            <div
              className="absolute h-full rounded-full bg-white/5 transition-all duration-75"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
            {/* Marcadores de los 4 puntos */}
            {[0, 33.3, 66.6, 100].map((pct, i) => (
              <div
                key={i}
                className={`absolute top-1/2 h-2 w-2 rounded-full border transition-colors duration-300 ${
                  activeScene === i
                    ? 'bg-amber-400 border-amber-400'
                    : 'bg-transparent border-white/30'
                }`}
                style={{ left: `${pct}%`, transform: 'translate(-50%, -50%)' }}
              />
            ))}
            {/* Punto de cámara actual */}
            <div
              className="absolute top-1/2 h-2.5 w-2.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f0ff] transition-all duration-75"
              style={{ left: `${Math.round(progress * 100)}%`, transform: 'translate(-50%, -50%)' }}
            />
          </div>
          <span className="text-white/40">EPP</span>
        </div>
      </div>

      {/* Main Dynamic Information Card & Typography */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
        {/* Left Column: Headings & Copy */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={current.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="space-y-4"
            >
              <div className="inline-block rounded border border-white/10 bg-black/50 px-2.5 py-1 backdrop-blur-md">
                <span className="font-mono text-[11px] font-semibold tracking-wider text-amber-400">
                  {current.productCategory}
                </span>
              </div>

              <h1 className="font-mono text-3xl sm:text-5xl md:text-6xl font-extrabold uppercase tracking-tight text-white leading-none">
                {current.title}{" "}
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-200 to-cyan-400">
                  {current.highlight}
                </span>
              </h1>

              <p className="max-w-xl text-sm sm:text-base text-slate-300 font-sans leading-relaxed">
                {current.description}
              </p>

              {/* CTAs */}
              <div className="pt-2 flex flex-wrap gap-4 pointer-events-auto">
                <button
                  type="button"
                  onClick={() => handleAction(current.primaryCta.action)}
                  className="group relative inline-flex items-center gap-2 rounded bg-amber-400 px-5 py-3 font-mono text-xs font-bold uppercase tracking-wider text-black transition-all hover:bg-amber-300 shadow-[0_0_20px_rgba(251,191,36,0.3)] active:scale-95"
                >
                  <span>{current.primaryCta.label}</span>
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </button>

                <button
                  type="button"
                  onClick={() => handleAction(current.secondaryCta.action)}
                  className="inline-flex items-center gap-2 rounded border border-white/20 bg-black/50 px-5 py-3 font-mono text-xs font-medium uppercase tracking-wider text-white backdrop-blur-sm transition-all hover:border-cyan-400 hover:text-cyan-400 active:scale-95"
                >
                  <span>{current.secondaryCta.label}</span>
                  <ArrowUpRight className="h-4 w-4" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Right Column: Spec HUD Card */}
        <div className="lg:col-span-5 pointer-events-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={`hud-${current.id}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="rounded-lg border border-white/10 bg-black/65 p-5 backdrop-blur-md shadow-2xl space-y-3"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <span className="font-mono text-xs font-bold text-white tracking-wider">
                  {current.productName}
                </span>
                <span className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest">
                  FICHA TÉCNICA
                </span>
              </div>

              {/* Scene Specs Grid */}
              {current.heroImage && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="relative overflow-hidden rounded-md border border-cyan-400/30 bg-gradient-to-b from-white/5 to-black/80 mb-2 p-1.5"
                  style={{ aspectRatio: '16/9' }}
                >
                  <img
                    src={current.heroImage}
                    alt={current.productName}
                    className="w-full h-full object-contain object-center drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />
                  <div className="absolute bottom-2 left-2.5 flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-pulse" />
                    <span className="font-mono text-[8px] font-bold uppercase tracking-widest text-cyan-300">
                      {current.imageBadge || "EQUIPO DESTACADO"}
                    </span>
                  </div>
                </motion.div>
              )}
              {/* Scene Specs Grid */}
              {current.specs && (
                <div className="grid grid-cols-3 gap-2">
                  {current.specs.map((item, idx) => (
                    <div
                      key={idx}
                      className={`rounded p-2.5 border transition-all ${
                        idx === 0
                          ? 'bg-amber-400/10 border-amber-400/30 col-span-3'
                          : 'bg-white/5 border-white/5'
                      }`}
                    >
                      <p className="font-mono text-[9px] uppercase tracking-wider text-white/50">
                        {item.label}
                      </p>
                      <p className={`mt-0.5 font-mono font-bold truncate ${
                        idx === 0 ? 'text-sm text-amber-300' : 'text-xs text-amber-300/80'
                      }`}>
                        {item.val}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Scroll Guide & Spatial Progress */}
      <div className="flex items-center justify-between border-t border-white/10 pt-4">
        <div className="flex items-center gap-2 font-mono text-[11px] text-white/60">
          <span className="text-amber-400">SCROLL</span>
          <span>RECORRIDO CINEMATOGRÁFICO 3D</span>
        </div>

        {/* Continuous progress track */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-[11px] text-cyan-400">
            {Math.round(progress * 100)}%
          </span>
          <div className="h-1 w-28 sm:w-44 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-cyan-400 transition-all duration-75"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
