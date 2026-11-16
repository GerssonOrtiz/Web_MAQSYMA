import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";

const PROCS = [
  {
    id: "mma",
    name: "MMA",
    desc: "Arco con electrodo revestido. El proceso más versátil y tolerante para obra, estructura y mantenimiento en campo.",
    app: "Obra · Estructura · Mantenimiento",
    features: ["Operación simple", "Equipos portátiles", "Gran tolerancia a condiciones de campo"],
    datos: ["Trabajo en exterior", "Electrodos de uso general", "Mantenimiento sencillo"],
  },
  {
    id: "mig",
    name: "MIG / MAG",
    desc: "Arco bajo gas protector con alambre. Alta productividad para fabricación y producción continua.",
    app: "Fabricación · Producción",
    features: ["Alta velocidad de depósito", "Soldadura continua", "Menos limpieza entre pasadas"],
    datos: ["Ideal para series", "Apto para chapa fina y gruesa", "Acabados limpios"],
  },
  {
    id: "tig",
    name: "TIG",
    desc: "Arco de tungsteno para máxima precisión y acabado. Acero inoxidable, aluminio y trabajos de calidad visual.",
    app: "Inox · Aluminio · Acabado fino",
    features: ["Control total del baño", "Costuras de alta calidad", "Zona afectada mínima"],
    datos: ["Acero inoxidable", "Aluminio en AC", "Trabajos de precisión"],
  },
  {
    id: "plasma",
    name: "Plasma",
    desc: "Corte por arco de plasma para chapa y perfil. Corte rápido con bordes limpios y retrabajo mínimo.",
    app: "Corte de chapa · Carpintería metálica",
    features: ["Corte rápido", "Bordes limpios", "Fácil de operar"],
    datos: ["Chapa y perfil", "Corte recto y figuras", "Arranque por contacto"],
  },
  {
    id: "multiproceso",
    name: "Multiproceso",
    desc: "Una sola plataforma, varios procesos. La flexibilidad que busca el taller que trabaja de todo.",
    app: "Taller general · Servicio técnico",
    features: ["Varios procesos en un equipo", "Optimiza la inversión", "Cambia de tarea sin cambiar de máquina"],
    datos: ["MMA + TIG + MIG según modelo", "Una sola alimentación", "Cobertura completa del taller"],
  },
];

function Radar() {
  return (
    <div className="pointer-events-none absolute bottom-0 right-0 h-44 w-44 opacity-40" aria-hidden="true">
      <div className="absolute inset-0 rounded-full border border-accent/25" />
      <div className="absolute inset-6 rounded-full border border-accent/20" />
      <div className="absolute inset-12 rounded-full border border-accent/15" />
      <div className="absolute inset-[4.5rem] rounded-full border border-accent/10" />
      <div
        className="animate-radar absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 0deg, transparent 0deg, rgba(0,230,118,0.30) 42deg, transparent 50deg)",
        }}
      />
      <span className="absolute left-1/2 top-1/2 h-1 w-1 -translate-x-1/2 -translate-y-1/2 bg-accent" />
    </div>
  );
}

export default function Selector() {
  const [selected, setSelected] = useState(0);
  const [hover, setHover] = useState(null);
  const active = hover ?? selected;
  const p = PROCS[active];

  return (
    <section className="py-24 lg:py-36" aria-label="Selector de equipos">
      <div className="section-head">
        <p className="mono-label flex items-center gap-3">
          <span className="font-mono text-accent">04</span> Selector
          <span className="h-px flex-1 bg-white/10" />
        </p>
        <h2 className="mt-6 max-w-3xl font-display text-5xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
          Encuentra el equipo <span className="text-accent">adecuado</span>
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-12">
          <div
            className="lg:col-span-7"
            onMouseLeave={() => setHover(null)}
            data-testid="selector-list"
          >
            {PROCS.map((proc, i) => (
              <button
                key={proc.id}
                onMouseEnter={() => setHover(i)}
                onFocus={() => setHover(i)}
                onClick={() => setSelected(i)}
                aria-pressed={selected === i}
                data-testid={`selector-row-${proc.id}`}
                className="flex w-full items-center gap-5 border-b border-white/10 py-6 text-left first:border-t lg:gap-7 lg:py-7"
              >
                <span
                  className={`font-mono text-xs tabular-nums ${active === i ? "text-accent" : "text-mist/50"}`}
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span
                  className={`font-display text-4xl font-bold uppercase tracking-tight transition-all duration-200 sm:text-5xl lg:text-5xl ${
                    active === i ? "translate-x-2 text-fog" : "text-mist/50 hover:text-fog"
                  }`}
                >
                  {proc.name}
                </span>
                <span className="ml-auto flex items-center gap-2 font-mono text-[9px] uppercase tracking-[0.22em]">
                  {selected === i ? (
                    <span className="flex items-center gap-2 text-accent" data-testid={`selector-state-${proc.id}`}>
                      <span className="h-1.5 w-1.5 bg-accent" /> Seleccionado
                    </span>
                  ) : (
                    <span className="text-mist/40">—</span>
                  )}
                </span>
              </button>
            ))}
          </div>

          <div className="lg:col-span-5">
            <div
              className="relative overflow-hidden border border-white/10 bg-coal/60 p-6 lg:sticky lg:top-28 lg:p-8"
              data-testid="selector-panel"
            >
              <Radar />
              <AnimatePresence mode="wait">
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22, ease: "easeOut" }}
                  className="relative min-h-[430px]"
                >
                  <p className="mono-label">Unidad seleccionada</p>
                  <h3 className="mt-3 font-display text-5xl font-extrabold uppercase tracking-tight">
                    {p.name}
                  </h3>
                  <p className="mt-4 text-sm leading-relaxed text-mist">{p.desc}</p>

                  <dl className="mt-6 grid grid-cols-2 gap-px border border-white/10 bg-white/10">
                    {[
                      ["Aplicación", p.app],
                      ["Amperaje", "Según modelo"],
                      ["Alimentación", "Según modelo"],
                      ["Proceso", p.name],
                    ].map(([k, v]) => (
                      <div key={k} className="bg-coal p-3.5">
                        <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-mist">{k}</dt>
                        <dd className="mt-1.5 font-mono text-xs uppercase text-fog">{v}</dd>
                      </div>
                    ))}
                  </dl>

                  <p className="mono-label mt-7">Características</p>
                  <ul className="mt-3 space-y-2">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-center gap-2.5 text-sm text-fog/85">
                        <Plus size={12} className="shrink-0 text-accent" /> {f}
                      </li>
                    ))}
                  </ul>

                  <p className="mono-label mt-7">Datos clave</p>
                  <ul className="mt-3 space-y-2">
                    {p.datos.map((d, i) => (
                      <li key={d} className="flex items-baseline gap-3 font-mono text-xs text-mist">
                        <span className="text-accent">{String(i + 1).padStart(2, "0")}</span> {d}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
