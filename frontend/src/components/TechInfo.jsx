import { useEffect, useRef, useState } from "react";
import { animate, useInView, useReducedMotion } from "framer-motion";

function CountUp({ to, suffix }) {
  const ref = useRef(null);
  const rm = useReducedMotion();
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (rm) {
      setVal(to);
      return;
    }
    const controls = animate(0, to, {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
      onUpdate: (v) => setVal(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, to, rm]);

  return (
    <span ref={ref} className="font-mono text-3xl font-semibold tabular-nums text-fog lg:text-4xl">
      {String(val).padStart(3, "0")}
      <span className="ml-1.5 text-base text-accent">{suffix}</span>
    </span>
  );
}

const CELLS = [
  { label: "Output", node: <CountUp to={500} suffix="A" />, note: "Corriente de soldadura" },
  { label: "Input", node: <CountUp to={380} suffix="V" />, note: "Alimentación trifásica" },
  { label: "Duty cycle", node: <CountUp to={60} suffix="%" />, note: "Ciclo de trabajo", bar: 60 },
  { label: "Potencia", node: <span className="font-mono text-3xl text-fog lg:text-4xl">[kW]</span>, note: "Según ficha del equipo" },
  { label: "Tecnología", node: <span className="font-mono text-2xl text-fog lg:text-3xl">INVERTER</span>, note: "Electrónica de conmutación" },
  { label: "Protección", node: <span className="font-mono text-3xl text-fog lg:text-4xl">[IP]</span>, note: "Grado según modelo" },
];

export default function TechInfo() {
  return (
    <section className="py-24 lg:py-36" aria-label="Información técnica">
      <div className="section-head">
        <p className="mono-label flex items-center gap-3">
          <span className="font-mono text-accent">06</span> Especificaciones
          <span className="h-px flex-1 bg-white/10" />
        </p>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-display text-5xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            Datos que <span className="text-accent">deciden</span> la compra
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-mist">
            Cada equipo publica su ficha técnica real: corriente, alimentación, ciclo de trabajo,
            tecnología y grado de protección.
          </p>
        </div>

        <div
          className="mt-14 grid grid-cols-1 gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3"
          data-testid="tech-grid"
        >
          {CELLS.map((c) => (
            <div key={c.label} className="group bg-ink p-7 transition-colors duration-300 hover:bg-coal lg:p-9">
              <p className="mono-label">{c.label}</p>
              <div className="mt-5">{c.node}</div>
              {c.bar && (
                <div className="mt-4 h-px w-full bg-white/10">
                  <div className="h-px bg-accent" style={{ width: `${c.bar}%` }} />
                </div>
              )}
              <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-mist/70">{c.note}</p>
            </div>
          ))}
        </div>

        <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.16em] text-mist/70">
          * Valores de ejemplo visual — cada equipo muestra aquí sus especificaciones reales desde
          su ficha de producto.
        </p>
      </div>
    </section>
  );
}
