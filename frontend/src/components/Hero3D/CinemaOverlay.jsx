import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, ArrowUpRight, Zap, ShieldCheck, Flame, Layers } from "lucide-react";
import { WA_DEFAULT, scrollToSection } from "../../lib/scroll";

const SCENE_CONTENT = [
  {
    id: "scene-1",
    tag: "MAQSYMA · DIVISIÓN INDUSTRIAL",
    title: "SOLUCIONES DE SOLDADURA",
    highlight: "SIN LÍMITES.",
    description:
      "Equipamiento de alta gama, ingeniería de procesos y suministros para grandes industrias, talleres de alta precisión y profesionales independientes.",
    productName: "ESAB WARRIOR™ 500i",
    productCategory: "MULTIPROCESO INDUSTRIAL PESADO",
    specs: [
      { label: "Corriente Max.", val: "500 A @ 60%" },
      { label: "Tecnología", val: "Inverter TrueArc" },
      { label: "Norma", val: "IP23 Grado Minero" },
    ],
    primaryCta: { label: "Explorar catálogo", action: "catalog" },
    secondaryCta: { label: "Solicitar cotización", action: "quote" },
  },
  {
    id: "scene-2",
    tag: "POTENCIA Y PRODUCTIVIDAD CONTINUA",
    title: "TECNOLOGÍA INDUSTRIAL",
    highlight: "Y TALLERES AVANZADOS.",
    description:
      "Transición fluida de potencia: desde el estándar multiproceso de la Warrior 500i hasta el control sinérgico de alambre continuo de la Rustler EM455i.",
    productName: "ESAB RUSTLER™ EM455i",
    productCategory: "MIG / MAG SINÉRGICO DE ALTO RENDIMIENTO",
    specs: [
      { label: "Ciclo de Trabajo", val: "450 A @ 60%" },
      { label: "Panel Digital", val: "Ajuste Sinérgico Inteligente" },
      { label: "Alimentador", val: "4 Rodillos de Precisión" },
    ],
    primaryCta: { label: "Cotizar Rustler EM455i", action: "quote-rustler" },
    secondaryCta: { label: "Ver especificaciones", action: "specs" },
  },
  {
    id: "scene-3",
    tag: "PORTABILIDAD Y PRECISIÓN PROFESIONAL",
    title: "SOLUCIONES PARA CADA",
    highlight: "ESCALA DE PROYECTO.",
    description:
      "Rendimiento profesional en formato compacto. La Rogue EM210 PRO ofrece la máxima confiabilidad para talleres mecánicos, contratistas y soldadores independientes.",
    productName: "ESAB ROGUE™ EM210 PRO",
    productCategory: "COMPACTO MULTIPROCESO MONOFÁSICO",
    specs: [
      { label: "Salida", val: "210 A @ 30%" },
      { label: "Peso", val: "13.5 kg Ultra-resistente" },
      { label: "Voltaje", val: "120V / 230V Dual" },
    ],
    primaryCta: { label: "Cotizar Rogue EM210", action: "quote-rogue" },
    secondaryCta: { label: "Explorar equipos ligeros", action: "catalog" },
  },
  {
    id: "scene-4",
    tag: "ECOSISTEMA INTEGRAL MAQSYMA",
    title: "TODO LO QUE NECESITAS",
    highlight: "PARA SOLDAR Y CORTAR.",
    description:
      "Soluciones integrales de extremo a extremo: consumibles certificados, antorchas de alto caudal, sistemas de corte por plasma y equipo de protección para soldadores.",
    productName: "CATÁLOGO TÉCNICO COMPLETO",
    productCategory: "CONSUMIBLES · ACCESORIOS · PLASMA · EPP",
    categories: [
      { name: "Alimentadores de Alambre", icon: Zap },
      { name: "Corte por Plasma", icon: Flame },
      { name: "Protección y Caretas EPP", icon: ShieldCheck },
      { name: "Antorchas y Consumibles", icon: Layers },
    ],
    primaryCta: { label: "Descubrir soluciones", action: "catalog" },
    secondaryCta: { label: "Hablar con un asesor técnico", action: "quote" },
  },
];

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
      {/* Top Bar Indicators */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#00f0ff]" />
          <span className="font-mono text-xs tracking-widest text-white/70 uppercase">
            {current.tag}
          </span>
        </div>

        {/* Scene Steps Indicator */}
        <div className="flex items-center gap-2 font-mono text-xs">
          {SCENE_CONTENT.map((s, idx) => (
            <div
              key={s.id}
              className={`flex items-center gap-1.5 transition-colors duration-300 ${
                activeScene === idx ? "text-cyan-400 font-bold" : "text-white/40"
              }`}
            >
              <span>0{idx + 1}</span>
              {idx < 3 && <span className="text-white/20">—</span>}
            </div>
          ))}
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
              <div className="inline-block rounded border border-white/10 bg-black/40 px-2.5 py-1 backdrop-blur-md">
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

        {/* Right Column: Spec HUD or Category Tiles */}
        <div className="lg:col-span-5 pointer-events-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={`hud-${current.id}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="rounded-lg border border-white/10 bg-black/60 p-5 backdrop-blur-md shadow-2xl space-y-3"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <span className="font-mono text-xs font-bold text-white tracking-wider">
                  {current.productName}
                </span>
                <span className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest">
                  HUD RECON V4.2
                </span>
              </div>

              {/* Normal Scene Specs */}
              {current.specs && (
                <div className="grid grid-cols-3 gap-3">
                  {current.specs.map((item, idx) => (
                    <div key={idx} className="rounded bg-white/5 p-2 border border-white/5">
                      <p className="font-mono text-[9px] uppercase tracking-wider text-white/50">
                        {item.label}
                      </p>
                      <p className="mt-1 font-mono text-xs font-bold text-amber-300 truncate">
                        {item.val}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {/* Scene 4: Categories Grid */}
              {current.categories && (
                <div className="grid grid-cols-2 gap-2">
                  {current.categories.map((cat, idx) => {
                    const Icon = cat.icon;
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-2 rounded bg-white/5 p-2 border border-white/5 transition-colors hover:border-cyan-500/40"
                      >
                        <Icon className="h-4 w-4 text-cyan-400 shrink-0" />
                        <span className="font-mono text-[11px] text-white/90 truncate">
                          {cat.name}
                        </span>
                      </div>
                    );
                  })}
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
