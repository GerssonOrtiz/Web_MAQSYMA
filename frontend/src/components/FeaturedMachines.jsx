import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { X, ArrowUpRight } from "lucide-react";
import { waLink } from "../lib/scroll";
import { ESAB_PRODUCTS } from "../data/esabProducts";

const spec = (p, key) => p[key]?.trim() || "SEGÚN MODELO";
const mqCode = (i) => `MQ—${String(i + 1).padStart(3, "0")}`;

// Selección curada de 4 equipos protagonistas (variedad de procesos)
const CURATED_FEATURED = (() => {
  const featured = ESAB_PRODUCTS.filter((p) => p.featured);
  const picks = [];
  const usedCats = new Set();

  for (const p of featured) {
    if (!usedCats.has(p.category) && picks.length < 4) {
      picks.push(p);
      usedCats.add(p.category);
    }
  }
  for (const p of featured) {
    if (picks.length >= 4) break;
    if (!picks.some((x) => x.id === p.id)) picks.push(p);
  }
  return picks.slice(0, 4);
})();

function SpecSheet({ p, index, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    window.__lenis?.stop();
    return () => {
      window.removeEventListener("keydown", onKey);
      window.__lenis?.start();
    };
  }, [onClose]);

  const rows = [
    ["Código", mqCode(index)],
    ["Proceso", p.process],
    ["Categoría", p.category],
    ["Amperaje", spec(p, "amperage")],
    ["Voltaje", spec(p, "voltage")],
    ["Alimentación", spec(p, "power_supply")],
    ["Factor de trabajo", spec(p, "duty_cycle")],
    ["SKU", p.sku || "POR CONFIRMAR"],
  ];

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className="absolute inset-0 bg-ink/85 backdrop-blur-sm"
        onClick={onClose}
        data-testid="spec-sheet-backdrop"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`Ficha técnica ${p.brand} ${p.model}`}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-h-[86vh] w-full max-w-2xl overflow-y-auto border border-white/15 bg-coal p-6 sm:p-8"
        data-testid="spec-sheet"
        data-lenis-prevent
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">{p.brand}</p>
            <h3 className="mt-2 font-display text-3xl font-extrabold uppercase leading-none tracking-tight sm:text-4xl">
              {p.model}
            </h3>
            <p className="mt-2 font-mono text-[10px] tabular-nums text-mist">{mqCode(index)}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Cerrar ficha"
            className="border border-white/15 p-2 text-mist transition-colors duration-200 hover:border-accent hover:text-accent"
            data-testid="spec-sheet-close"
          >
            <X size={16} />
          </button>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-mist">{p.description}</p>

        <dl className="mt-6 grid grid-cols-1 gap-px border border-white/10 bg-white/10 sm:grid-cols-2">
          {rows.map(([k, v]) => (
            <div key={k} className="bg-coal px-4 py-3">
              <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-mist">{k}</dt>
              <dd className="mt-1 font-mono text-xs uppercase text-fog">{v}</dd>
            </div>
          ))}
        </dl>

        {p.applications?.length > 0 && (
          <div className="mt-6">
            <p className="mono-label">Aplicaciones</p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {p.applications.map((a) => (
                <span
                  key={a}
                  className="border border-white/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-fog/85"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {p.features?.length > 0 && (
          <div className="mt-6">
            <p className="mono-label">Características</p>
            <ul className="mt-2.5 space-y-1.5">
              {p.features.map((f) => (
                <li key={f} className="text-sm text-fog/85">
                  — {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row">
          <a
            className="btn-primary"
            href={
              p.quote_url ||
              waLink(`Hola MAQSYMA, quiero cotizar ${p.brand} ${p.model} (${p.sku || mqCode(index)}).`)
            }
            target="_blank"
            rel="noopener noreferrer"
            data-testid="spec-sheet-quote"
          >
            Solicitar cotización <span aria-hidden="true">→</span>
          </a>
          {/* Oculto temporalmente a solicitud del cliente
          {p.datasheet_url && (
            <a className="btn-ghost" href={p.datasheet_url} target="_blank" rel="noopener noreferrer">
              Ficha técnica oficial
            </a>
          )}
          */}
        </div>
      </motion.div>
    </motion.div>
  );
}

export default function FeaturedMachines() {
  const [specFor, setSpecFor] = useState(null);
  const navigate = useNavigate();

  return (
    <section id="maquinas" className="border-t border-white/10 py-20 lg:py-28" aria-label="Máquinas seleccionadas">
      <div className="section-head">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl">
              Máquinas <span className="text-accent">seleccionadas</span>
            </h2>
            <p className="mt-3 max-w-xl text-sm text-mist sm:text-base">
              Cuatro equipos protagonistas de nuestro showroom listos para entrega inmediata.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/catalogo")}
            className="btn-primary !px-5 !py-3 !text-[10px]"
            data-testid="featured-all-catalog"
          >
            Ver los {ESAB_PRODUCTS.length} equipos <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
          {CURATED_FEATURED.map((p, i) => (
            <article
              key={p.id}
              className="group flex flex-col justify-between border border-white/10 bg-coal/60 transition-colors duration-300 hover:border-accent/50"
              data-testid={`featured-card-${i}`}
            >
              <div className="grid grid-cols-1 sm:grid-cols-5">
                <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden border-b border-white/10 bg-[#0B0D11] p-2 sm:col-span-2 sm:aspect-auto sm:border-b-0 sm:border-r">
                  <img
                    src={p.main_image}
                    alt={`Máquina de soldar ${p.brand} ${p.model}`}
                    loading="lazy"
                    className="max-h-44 max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 border border-white/15 bg-ink/80 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-accent">
                    {p.category}
                  </span>
                </div>

                <div className="flex flex-col justify-between p-5 sm:col-span-3 sm:p-6">
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
                        {p.brand}
                      </span>
                      <span className="font-mono text-[10px] tabular-nums text-mist">
                        {mqCode(i)}
                      </span>
                    </div>
                    <h3 className="mt-1.5 font-display text-2xl font-extrabold uppercase tracking-tight text-fog sm:text-3xl">
                      {p.model}
                    </h3>
                    <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-mist sm:text-sm">
                      {p.description}
                    </p>

                    <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/10 pt-3 font-mono text-[10px]">
                      <div>
                        <span className="block uppercase text-mist/60">Amperaje</span>
                        <span className="font-semibold text-accent">{spec(p, "amperage")}</span>
                      </div>
                      <div>
                        <span className="block uppercase text-mist/60">Ciclo</span>
                        <span className="truncate block text-fog">{spec(p, "duty_cycle")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
                    <button
                      type="button"
                      className="btn-ghost flex-1 !px-3 !py-2.5 !text-[10px]"
                      onClick={() => setSpecFor({ p, index: i })}
                      data-testid={`machine-specs-${i}`}
                    >
                      Ficha técnica
                    </button>
                    <a
                      className="btn-primary flex-1 !px-3 !py-2.5 !text-[10px]"
                      href={waLink(
                        `Hola MAQSYMA, quiero cotizar ${p.brand} ${p.model} (${p.sku || mqCode(i)}).`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      data-testid={`machine-quote-${i}`}
                    >
                      Cotizar <ArrowUpRight className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      <AnimatePresence>
        {specFor && (
          <SpecSheet p={specFor.p} index={specFor.index} onClose={() => setSpecFor(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
