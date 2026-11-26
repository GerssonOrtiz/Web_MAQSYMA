import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

const TEXT =
  "La soldadura no admite errores. Cada unión exige potencia, precisión y confiabilidad. En MAQSYMA seleccionamos tecnología diseñada para responder cuando el trabajo realmente importa.";

const HIGHLIGHTS = new Set(["potencia", "precisión", "confiabilidad", "MAQSYMA"]);
const WORDS = TEXT.split(" ");

const MILESTONES = [
  { at: 0.28, label: "Tecnología" },
  { at: 0.52, label: "Precisión" },
  { at: 0.76, label: "Rendimiento" },
  { at: 0.96, label: "Confiabilidad" },
];

function Word({ progress, index, total, children }) {
  const start = (index / total) * 0.85;
  const range = [start, start + 0.09];
  const opacity = useTransform(progress, range, [0.14, 1]);
  const y = useTransform(progress, range, [8, 0]);
  const highlighted = HIGHLIGHTS.has(children.replace(/[.,]/g, ""));
  return (
    <motion.span
      style={{ opacity, y }}
      className={`mr-[0.28em] inline-block ${highlighted ? "italic text-accent" : ""}`}
    >
      {children}
    </motion.span>
  );
}

function Milestone({ progress, at, label }) {
  const opacity = useTransform(progress, [at - 0.07, at], [0.25, 1]);
  const dotColor = useTransform(progress, [at - 0.07, at], ["#263042", "#FFB703"]);
  const textColor = useTransform(progress, [at - 0.07, at], ["#64748B", "#F4F5F8"]);
  return (
    <motion.li style={{ opacity }} className="flex items-center gap-2.5">
      <motion.span style={{ backgroundColor: dotColor }} className="h-1.5 w-1.5" />
      <motion.span
        style={{ color: textColor }}
        className="font-mono text-[10px] uppercase tracking-[0.22em]"
      >
        {label}
      </motion.span>
    </motion.li>
  );
}

export default function Manifesto() {
  const ref = useRef(null);
  const rm = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const counter = useTransform(scrollYProgress, (v) =>
    `${String(Math.round(v * 100)).padStart(3, "0")}%`
  );

  return (
    <section
      ref={ref}
      aria-label="Manifiesto de marca"
      className={rm ? "py-24 lg:py-36" : "relative h-[165vh] lg:h-[220vh]"}
    >
      <div className={rm ? "" : "sticky top-0 flex h-screen items-center"}>
        <div className="section-head w-full">
          <div className="h-px w-full bg-white/10" aria-hidden="true" />

          <p className="mt-10 max-w-5xl font-display text-[clamp(1.9rem,4.6vw,4rem)] font-bold uppercase leading-[1.08] tracking-tight">
            {rm
              ? WORDS.map((w, i) => (
                  <span
                    key={i}
                    className={HIGHLIGHTS.has(w.replace(/[.,]/g, "")) ? "italic text-accent" : ""}
                  >
                    {w}{" "}
                  </span>
                ))
              : WORDS.map((w, i) => (
                  <Word key={i} progress={scrollYProgress} index={i} total={WORDS.length}>
                    {w}
                  </Word>
                ))}
          </p>

          <div className="mt-14 border-t border-white/10 pt-6">
            <div className="flex items-center gap-5">
              <span className="relative h-[2px] flex-1 bg-white/10">
                <motion.span
                  style={rm ? undefined : { scaleX: scrollYProgress }}
                  className="absolute inset-0 origin-left bg-accent/90"
                  data-testid="manifesto-progress-bar"
                />
              </span>
              <motion.span
                className="font-mono text-xs tabular-nums text-accent"
                data-testid="manifesto-counter"
              >
                {rm ? "100%" : counter}
              </motion.span>
            </div>
            <ul className="mt-6 flex flex-wrap gap-x-10 gap-y-3" data-testid="manifesto-milestones">
              {MILESTONES.map((m) =>
                rm ? (
                  <li key={m.label} className="flex items-center gap-2.5">
                    <span className="h-1.5 w-1.5 bg-accent" />
                    <span className="font-mono text-[10px] uppercase tracking-[0.22em] text-fog">
                      {m.label}
                    </span>
                  </li>
                ) : (
                  <Milestone key={m.label} progress={scrollYProgress} at={m.at} label={m.label} />
                )
              )}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
