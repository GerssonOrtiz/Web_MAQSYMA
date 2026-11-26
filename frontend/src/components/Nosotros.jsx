import { useState } from "react";
import { ArrowUpRight, Check, MessageSquare, ShieldCheck, Wrench, Layers } from "lucide-react";
import { scrollToSection, waLink } from "../lib/scroll";

const VALUE_PILLARS = [
  {
    id: "modalidad",
    icon: Layers,
    title: "Compra, alquila o renting",
    summary:
      "Eliges la modalidad financiera y operativa que mejor se adapta a tu proyecto, obra o parada de planta.",
    tags: ["Venta directa", "Alquiler flexible", "Renting corporativo"],
  },
  {
    id: "confiabilidad",
    icon: ShieldCheck,
    title: "Equipos de alta confiabilidad",
    summary:
      "Máquinas de soldar y corte seleccionadas para responder bajo exigencia continua en campo, taller e industria.",
    tags: ["GMAW / FCAW", "SMAW / GTAW", "Multiproceso & Láser"],
  },
  {
    id: "integral",
    icon: Wrench,
    title: "Todo en un solo lugar",
    summary:
      "Máquinas de soldar, motosoldadoras, alimentadores, antorchas, EPP, flujómetros y soporte técnico especializado.",
    tags: ["Accesorios y EPP", "Capacitación", "Soporte logístico"],
  },
];

const PROCESS_STEPS = [
  {
    step: "01",
    title: "Evaluamos tu necesidad",
    detail:
      "Analizamos tu operación, proceso de soldadura o corte y exigencia en campo para recomendar el equipo adecuado y definir si conviene comprar o alquilar.",
    deliverable: "Diagnóstico operativo",
  },
  {
    step: "02",
    title: "Recomendamos la mejor modalidad",
    detail:
      "Estructuramos la alternativa más rentable para tu flujo de caja y cronograma: compra directa, alquiler por proyecto o renting corporativo.",
    deliverable: "Compra · Alquiler · Renting",
  },
  {
    step: "03",
    title: "Implementamos la solución",
    detail:
      "Alineamos cotización, condiciones comerciales y disponibilidad inmediata del equipo con acompañamiento técnico desde la entrega.",
    deliverable: "Despacho y puesta en marcha",
  },
  {
    step: "04",
    title: "Operas con respaldo",
    detail:
      "Aseguramos tu continuidad operativa con mantenimiento preventivo, soporte técnico, capacitación de personal y certificaciones.",
    deliverable: "Continuidad operativa 24/7",
  },
];

const SECTORS = [
  "Construcción",
  "Estructuras metálicas",
  "Mantenimiento industrial",
  "Minería",
  "Paradas de planta",
  "Talleres profesionales",
  "Trabajo en campo",
];

export default function Nosotros() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <section
      id="nosotros"
      data-testid="nosotros-section"
      aria-label="Sobre MAQSYMA"
      className="border-t border-white/10 bg-ink py-20 lg:py-28"
    >
      <div className="section-head">
        {/* Cabecera editorial + Mensaje central */}
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <h2 className="font-display text-4xl font-extrabold uppercase leading-[0.94] tracking-tight sm:text-5xl lg:text-6xl">
              Hacemos que tu operación{" "}
              <span className="text-accent">nunca se detenga.</span>
            </h2>
          </div>

          <div className="lg:col-span-5">
            <p className="text-sm leading-relaxed text-mist sm:text-base">
              En el sector industrial, un minuto de parada técnica no es solo tiempo perdido: es
              producción detenida y proyectos que se retrasan. En{" "}
              <span className="font-semibold text-fog">MAQSYMA</span> vamos más allá de la venta
              o alquiler: actuamos como tu respaldo operativo en soldadura y corte con soporte
              técnico, operativo y logístico.
            </p>
          </div>
        </div>

        {/* Bloque Quiénes somos + Misión & Visión */}
        <div className="mt-14 grid grid-cols-1 border border-white/10 bg-coal/40 lg:grid-cols-12">
          <div className="border-b border-white/10 p-6 sm:p-8 lg:col-span-4 lg:border-b-0 lg:border-r">
            <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
              Identidad operativa
            </p>
            <h3 className="mt-3 font-display text-2xl font-bold uppercase tracking-tight text-fog sm:text-3xl">
              Respaldo real en campo y planta
            </h3>
            <p className="mt-3 text-sm leading-relaxed text-mist">
              Combinamos equipos de soldadura y corte de alta confiabilidad con asesoría directa para
              determinar qué solución técnica y comercial conviene a tu proyecto.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {SECTORS.map((sector) => (
                <span
                  key={sector}
                  className="border border-white/10 bg-ink/70 px-2.5 py-1 font-mono text-[9px] uppercase tracking-[0.16em] text-mist"
                >
                  {sector}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 divide-y divide-white/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:col-span-8">
            <div className="flex flex-col justify-between p-6 sm:p-8">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
                  Misión
                </p>
                <p className="mt-4 text-base font-medium leading-relaxed text-fog sm:text-lg">
                  Impulsar la productividad de nuestros clientes con equipos de soldadura y corte en
                  la modalidad de venta y alquiler, con disponibilidad inmediata, máxima eficiencia
                  y confiabilidad operativa.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-white/10 pt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-mist">
                <span>Productividad</span>
                <span className="text-accent">/</span>
                <span>Disponibilidad inmediata</span>
                <span className="text-accent">/</span>
                <span>Eficiencia</span>
              </div>
            </div>

            <div className="flex flex-col justify-between p-6 sm:p-8">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-accent">
                  Visión
                </p>
                <p className="mt-4 text-base font-medium leading-relaxed text-fog sm:text-lg">
                  Ser el socio estratégico líder en equipos de soldadura y corte industrial,
                  reconocidos por impulsar los proyectos de nuestros clientes hacia su máximo nivel
                  de productividad y rentabilidad.
                </p>
              </div>
              <div className="mt-6 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-white/10 pt-4 font-mono text-[10px] uppercase tracking-[0.16em] text-mist">
                <span>Socio estratégico</span>
                <span className="text-accent">/</span>
                <span>Aliado de proyectos</span>
                <span className="text-accent">/</span>
                <span>Rentabilidad</span>
              </div>
            </div>
          </div>
        </div>

        {/* ¿Por qué elegir MAQSYMA? */}
        <div className="mt-14">
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-white/10 pb-4">
            <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-fog sm:text-3xl">
              ¿Por qué elegir <span className="text-accent">MAQSYMA</span>?
            </h3>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist">
              Equipos + Modalidad flexible + Soporte + Continuidad operativa
            </p>
          </div>

          <div className="grid grid-cols-1 divide-y divide-white/10 border-x border-b border-white/10 md:grid-cols-3 md:divide-x md:divide-y-0">
            {VALUE_PILLARS.map(({ id, icon: Icon, title, summary, tags }) => (
              <div
                key={id}
                className="flex flex-col justify-between bg-coal/20 p-6 transition-colors duration-200 hover:bg-coal/50 sm:p-7"
                data-testid={`nosotros-pillar-${id}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <Icon className="h-5 w-5 text-accent" aria-hidden="true" />
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-mist">
                      Respaldo MAQSYMA
                    </span>
                  </div>
                  <h4 className="mt-5 font-display text-2xl font-bold uppercase tracking-tight text-fog">
                    {title}
                  </h4>
                  <p className="mt-2.5 text-sm leading-relaxed text-mist">{summary}</p>
                </div>

                <ul className="mt-6 space-y-1.5 border-t border-white/10 pt-4">
                  {tags.map((tag) => (
                    <li
                      key={tag}
                      className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.16em] text-fog/85"
                    >
                      <Check className="h-3 w-3 shrink-0 text-accent" aria-hidden="true" />
                      <span>{tag}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Cómo trabaja MAQSYMA — 4 pasos */}
        <div className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-fog sm:text-3xl">
                Cómo trabaja <span className="text-accent">MAQSYMA</span>
              </h3>
              <p className="mt-2 max-w-2xl text-sm text-mist">
                Un flujo pensado para que recibas el equipo correcto, bajo la modalidad más
                conveniente y con soporte continuo durante toda tu operación.
              </p>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {PROCESS_STEPS.map((item, idx) => {
              const isActive = activeStep === idx;
              return (
                <button
                  key={item.step}
                  type="button"
                  onClick={() => setActiveStep(idx)}
                  data-testid={`nosotros-step-${idx}`}
                  className={`flex flex-col justify-between border p-5 text-left transition-colors duration-200 sm:p-6 ${
                    isActive
                      ? "border-accent bg-coal/80"
                      : "border-white/10 bg-coal/25 hover:border-white/25 hover:bg-coal/45"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-mono text-xs font-semibold tracking-[0.2em] ${
                          isActive ? "text-accent" : "text-mist"
                        }`}
                      >
                        PASO {item.step}
                      </span>
                      <span
                        className={`h-1.5 w-1.5 ${isActive ? "bg-accent" : "bg-white/20"}`}
                      />
                    </div>
                    <h4 className="mt-4 font-display text-2xl font-bold uppercase leading-tight tracking-tight text-fog">
                      {item.title}
                    </h4>
                    <p className="mt-3 text-sm leading-relaxed text-mist">{item.detail}</p>
                  </div>

                  <p className="mt-5 border-t border-white/10 pt-3 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                    {item.deliverable}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* CTA comercial */}
        <div className="mt-14 flex flex-col justify-between gap-6 border border-white/15 bg-coal/60 p-6 sm:p-8 lg:flex-row lg:items-center">
          <div>
            <h3 className="font-display text-3xl font-extrabold uppercase leading-none tracking-tight text-fog sm:text-4xl">
              ¿Necesitas comprar o alquilar un equipo?
            </h3>
            <p className="mt-2.5 max-w-xl text-sm text-mist">
              Te ayudamos a elegir entre venta, alquiler o renting corporativo según tu proceso,
              amperaje y plazo de obra.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:shrink-0">
            <a
              href={waLink(
                "Hola MAQSYMA, necesito asesoría para comprar o alquilar un equipo de soldadura."
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              data-testid="nosotros-cta-specialist"
            >
              <MessageSquare className="h-4 w-4" aria-hidden="true" />
              Hablar con un especialista
            </a>
            <button
              type="button"
              onClick={() => scrollToSection("contacto")}
              className="btn-ghost"
              data-testid="nosotros-cta-quote"
            >
              Solicitar cotización
              <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
