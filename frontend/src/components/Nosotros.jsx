import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Check,
  MessageSquare,
  ShieldCheck,
  Wrench,
  Layers,
} from "lucide-react";
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
      className="relative min-h-screen overflow-hidden bg-[#0E1117] bg-grid pb-24 pt-28 sm:pb-32 sm:pt-32"
    >
      {/* Iluminación ambiental sutil para evitar fondo negro plano */}
      <div className="pointer-events-none absolute left-1/2 top-0 h-[28rem] w-full max-w-7xl -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(255,183,3,0.09),transparent_70%)]" />

      <div className="section-head relative z-10">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.2em] text-[#CBD5E1] transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Volver al inicio
          </Link>
        </div>

        {/* Cabecera editorial + Mensaje central */}
        <div className="grid grid-cols-1 gap-8 border-b border-white/15 pb-10 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <h1 className="font-display text-4xl font-black uppercase leading-[0.94] tracking-tight text-fog sm:text-5xl lg:text-6xl">
              Hacemos que tu operación{" "}
              <span className="text-accent">nunca se detenga.</span>
            </h1>
          </div>

          <div className="lg:col-span-5">
            <p className="text-base leading-relaxed text-[#E2E8F0] sm:text-[17px]">
              En el sector industrial,{" "}
              <strong className="font-bold text-fog">
                un minuto de parada técnica no es solo tiempo perdido
              </strong>
              : es producción detenida y proyectos que se retrasan. En{" "}
              <strong className="font-bold text-accent">MAQSYMA</strong> vamos más allá de la
              venta o alquiler: actuamos como tu{" "}
              <strong className="font-semibold text-fog">
                respaldo operativo en soldadura y corte
              </strong>{" "}
              con soporte técnico, operativo y logístico.
            </p>
          </div>
        </div>

        {/* Bloque Quiénes somos + Misión & Visión */}
        <div className="mt-12 grid grid-cols-1 border border-white/15 bg-[#151922] shadow-[0_16px_40px_rgba(0,0,0,0.35)] lg:grid-cols-12">
          <div className="border-b border-white/15 p-7 sm:p-9 lg:col-span-4 lg:border-b-0 lg:border-r">
            <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent">
              Identidad operativa
            </p>
            <h2 className="mt-3 font-display text-3xl font-extrabold uppercase leading-tight tracking-tight text-fog">
              Respaldo real en campo y planta
            </h2>
            <p className="mt-4 text-base leading-relaxed text-[#D1D5DB]">
              Combinamos{" "}
              <strong className="font-semibold text-fog">
                equipos de soldadura y corte de alta confiabilidad
              </strong>{" "}
              con asesoría directa para definir qué solución técnica y comercial conviene a tu
              proyecto.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {SECTORS.map((sector) => (
                <span
                  key={sector}
                  className="border border-white/15 bg-[#0E1117] px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-[#E2E8F0]"
                >
                  {sector}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 divide-y divide-white/15 sm:grid-cols-2 sm:divide-x sm:divide-y-0 lg:col-span-8">
            <div className="flex flex-col justify-between p-7 sm:p-9">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent">
                  Misión
                </p>
                <p className="mt-4 text-lg font-semibold leading-relaxed text-fog sm:text-xl">
                  Impulsar la{" "}
                  <span className="font-bold text-accent">productividad de nuestros clientes</span>{" "}
                  con equipos de soldadura y corte en modalidad de{" "}
                  <strong className="font-bold text-fog">venta y alquiler</strong>, con
                  disponibilidad inmediata, máxima eficiencia y confiabilidad operativa.
                </p>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-white/10 pt-4 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#CBD5E1]">
                <span>Productividad</span>
                <span className="text-accent">/</span>
                <span>Disponibilidad inmediata</span>
                <span className="text-accent">/</span>
                <span>Eficiencia</span>
              </div>
            </div>

            <div className="flex flex-col justify-between p-7 sm:p-9">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent">
                  Visión
                </p>
                <p className="mt-4 text-lg font-semibold leading-relaxed text-fog sm:text-xl">
                  Ser el{" "}
                  <span className="font-bold text-accent">socio estratégico líder</span> en equipos
                  de soldadura y corte industrial, reconocidos por impulsar los proyectos de nuestros
                  clientes hacia su máximo nivel de productividad y rentabilidad.
                </p>
              </div>
              <div className="mt-7 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-white/10 pt-4 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-[#CBD5E1]">
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
        <div className="mt-16">
          <div className="flex flex-wrap items-baseline justify-between gap-4 border-b border-white/15 pb-4">
            <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight text-fog sm:text-4xl">
              ¿Por qué elegir <span className="text-accent">MAQSYMA</span>?
            </h2>
            <p className="font-mono text-[11px] font-medium uppercase tracking-[0.18em] text-[#CBD5E1]">
              Equipos + Modalidad flexible + Soporte + Continuidad operativa
            </p>
          </div>

          <div className="grid grid-cols-1 divide-y divide-white/15 border-x border-b border-white/15 bg-[#131720] md:grid-cols-3 md:divide-x md:divide-y-0">
            {VALUE_PILLARS.map(({ id, icon: Icon, title, summary, tags }) => (
              <div
                key={id}
                className="flex flex-col justify-between p-7 transition-colors duration-200 hover:bg-[#191E2A] sm:p-8"
                data-testid={`nosotros-pillar-${id}`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <Icon className="h-6 w-6 text-accent" aria-hidden="true" />
                    <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.18em] text-[#CBD5E1]">
                      Respaldo MAQSYMA
                    </span>
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-extrabold uppercase tracking-tight text-fog sm:text-[26px]">
                    {title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-relaxed text-[#D1D5DB]">{summary}</p>
                </div>

                <ul className="mt-6 space-y-2 border-t border-white/10 pt-4">
                  {tags.map((tag) => (
                    <li
                      key={tag}
                      className="flex items-center gap-2 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-fog"
                    >
                      <Check className="h-3.5 w-3.5 shrink-0 text-accent" aria-hidden="true" />
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
              <h2 className="font-display text-3xl font-extrabold uppercase tracking-tight text-fog sm:text-4xl">
                Cómo trabaja <span className="text-accent">MAQSYMA</span>
              </h2>
              <p className="mt-2.5 max-w-2xl text-base text-[#D1D5DB]">
                Un flujo pensado para que recibas el{" "}
                <strong className="font-semibold text-fog">equipo correcto</strong>, bajo la{" "}
                <strong className="font-semibold text-fog">modalidad más conveniente</strong> y con
                soporte continuo durante toda tu operación.
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
                  className={`flex flex-col justify-between border p-6 text-left transition-all duration-200 ${
                    isActive
                      ? "border-accent bg-[#181D27] shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
                      : "border-white/15 bg-[#131720] hover:border-white/30 hover:bg-[#171C26]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-mono text-xs font-bold tracking-[0.2em] ${
                          isActive ? "text-accent" : "text-[#CBD5E1]"
                        }`}
                      >
                        PASO {item.step}
                      </span>
                      <span
                        className={`h-2 w-2 ${isActive ? "bg-accent" : "bg-white/25"}`}
                      />
                    </div>
                    <h3 className="mt-4 font-display text-2xl font-extrabold uppercase leading-tight tracking-tight text-fog">
                      {item.title}
                    </h3>
                    <p className="mt-3 text-[15px] leading-relaxed text-[#D1D5DB]">{item.detail}</p>
                  </div>

                  <p className="mt-5 border-t border-white/10 pt-3 font-mono text-[11px] font-bold uppercase tracking-[0.16em] text-accent">
                    {item.deliverable}
                  </p>
                </button>
              );
            })}
          </div>
        </div>

        {/* CTA comercial */}
        <div className="mt-14 flex flex-col justify-between gap-6 border border-white/15 bg-[#151922] p-7 shadow-[0_12px_32px_rgba(0,0,0,0.35)] sm:p-9 lg:flex-row lg:items-center">
          <div>
            <h2 className="font-display text-3xl font-black uppercase leading-none tracking-tight text-fog sm:text-4xl">
              ¿Necesitas comprar o alquilar un equipo?
            </h2>
            <p className="mt-3 max-w-xl text-base text-[#D1D5DB]">
              Te ayudamos a elegir entre{" "}
              <strong className="font-semibold text-fog">venta, alquiler o renting corporativo</strong>{" "}
              según tu proceso, amperaje y plazo de obra.
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
