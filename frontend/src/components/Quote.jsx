import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { WA_DEFAULT, WHATSAPP_DISPLAY, waLink } from "../lib/scroll";

const FINAL = "ENCONTREMOS LA MÁQUINA ADECUADA PARA TU TRABAJO.";
const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#/—";

const CONTACTS = [
  ["Correo", "[correo] — por confirmar"],
  ["WhatsApp", WHATSAPP_DISPLAY],
  ["Teléfono", "[teléfono] — por confirmar"],
  ["Ubicación", "[ubicación] — por confirmar"],
  ["Horario", "[horario] — por confirmar"],
];

function useScramble(active, rm) {
  const [txt, setTxt] = useState(rm ? FINAL : "");
  useEffect(() => {
    if (!active) return;
    if (rm) {
      setTxt(FINAL);
      return;
    }
    let raf;
    const t0 = performance.now();
    const DUR = 620;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / DUR);
      const reveal = Math.floor(p * FINAL.length);
      let out = FINAL.slice(0, reveal);
      if (p < 1) {
        for (let i = 0; i < 6 && reveal + i < FINAL.length; i++) {
          out += GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        setTxt(out);
        raf = requestAnimationFrame(tick);
      } else {
        setTxt(FINAL);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active, rm]);
  return txt;
}

export default function Quote() {
  const rm = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.4 });
  const txt = useScramble(inView, rm);

  return (
    <section id="contacto" className="border-t border-white/10 py-24 lg:py-36" aria-label="Cotización y contacto">
      <div className="section-head">
        <p className="mono-label flex items-center gap-3">
          <span className="font-mono text-accent">07</span> Cotización
          <span className="relative h-px w-20 bg-accent/50">
            <span className="absolute -right-1 -top-[3px] h-[7px] w-[7px] rounded-full bg-accent animate-ping-soft" />
          </span>
        </p>

        <div ref={ref} className="relative mt-10">
          <h2
            className="invisible font-display text-[clamp(2.4rem,6.5vw,5.5rem)] font-black uppercase leading-[1.02] tracking-tight"
            aria-hidden="true"
          >
            {FINAL}
          </h2>
          <h2
            aria-label={FINAL}
            data-testid="quote-title"
            className="absolute inset-0 font-display text-[clamp(2.4rem,6.5vw,5.5rem)] font-black uppercase leading-[1.02] tracking-tight text-fog"
          >
            {txt}
          </h2>
        </div>

        <p className="mt-8 max-w-xl text-base leading-relaxed text-mist">
          Indícanos el proceso, el material y tu nivel de producción: te orientamos para elegir el
          equipo correcto y recibir una cotización directa, sin compromiso.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <a
            className="btn-primary"
            href={waLink("Hola MAQSYMA, quiero solicitar una cotización para un equipo de soldadura.")}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="quote-cta-primary"
          >
            Solicitar cotización <span aria-hidden="true">→</span>
          </a>
          <a className="btn-ghost" href={WA_DEFAULT} target="_blank" rel="noopener noreferrer" data-testid="quote-cta-whatsapp">
            Contactar por WhatsApp
          </a>
        </div>

        <dl className="mt-16 grid grid-cols-1 border-t border-white/10 sm:grid-cols-2 lg:grid-cols-5">
          {CONTACTS.map(([k, v], i) => (
            <div
              key={k}
              className={`border-b border-white/10 py-5 sm:border-l sm:border-white/10 sm:pl-5 lg:border-b-0 ${i === 0 ? "sm:border-l-0 sm:pl-0" : ""}`}
              data-testid={`contact-${k.toLowerCase()}`}
            >
              <dt className="mono-label">{k}</dt>
              <dd className="mt-2.5 font-mono text-xs uppercase tracking-wider text-fog/90">
                {k === "WhatsApp" ? (
                  <a
                    href={WA_DEFAULT}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline decoration-accent/60 underline-offset-4 transition-colors duration-200 hover:text-accent"
                  >
                    {v}
                  </a>
                ) : (
                  v
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
