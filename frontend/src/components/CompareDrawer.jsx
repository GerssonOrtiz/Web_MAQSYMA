import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowUpRight, Scale, Package } from "lucide-react";
import { waLink } from "../lib/scroll";

const formatPrice = (val) =>
  typeof val === "number"
    ? `S/ ${val.toLocaleString("es-PE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : "A cotizar";

export function CompareDrawer({ items, onRemove, onClear, onOpenModal }) {
  if (!items || items.length === 0) return null;

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: 80, opacity: 0 }}
      className="fixed inset-x-0 bottom-0 z-40 border-t border-accent/30 bg-coal/95 p-4 shadow-2xl backdrop-blur-md"
      data-testid="compare-drawer"
    >
      <div className="section-head flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider text-accent">
            <Scale className="h-3.5 w-3.5" /> Comparar ({items.length}/3):
          </span>
          {items.map((p) => (
            <span
              key={p.id}
              className="inline-flex items-center gap-1.5 border border-white/15 bg-ink/80 px-2.5 py-1 font-mono text-[10px] text-fog"
            >
              {p.model}
              <button
                type="button"
                onClick={() => onRemove(p.id)}
                className="text-mist hover:text-accent"
                aria-label={`Quitar ${p.model}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClear}
            className="btn-ghost !px-3 !py-2 !text-[10px]"
          >
            Limpiar
          </button>
          <button
            type="button"
            disabled={items.length < 2}
            onClick={onOpenModal}
            className="btn-primary !px-4 !py-2 !text-[10px] disabled:cursor-not-allowed disabled:opacity-40"
          >
            Comparar ahora {items.length < 2 ? "(mín. 2)" : ""}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export function CompareModal({ items, onClose }) {
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
    { label: "Precio", key: "price_current", format: (v) => formatPrice(v), highlight: true },
    { label: "Categoría", key: "category" },
    { label: "Tipo", key: "tipo" },
    { label: "Proceso", key: "process" },
    { label: "Amperaje / Potencia", key: "amperage", highlight: true },
    { label: "Voltaje", key: "voltage" },
    { label: "Alimentación", key: "power_supply" },
    { label: "Ciclo de trabajo", key: "duty_cycle" },
    { label: "SKU", key: "sku" },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[95] flex items-center justify-center p-4 sm:p-6"
      >
        <div
          className="absolute inset-0 bg-ink/85 backdrop-blur-md"
          onClick={onClose}
        />
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Comparación técnica de equipos"
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          className="relative z-10 max-h-[90vh] w-full max-w-5xl overflow-y-auto border border-white/15 bg-coal p-6 shadow-2xl sm:p-8"
          data-lenis-prevent
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h2 className="font-display text-2xl font-black uppercase text-fog sm:text-3xl">
              Comparativa técnica de <span className="text-accent">equipos</span>
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="border border-white/15 p-2 text-mist transition-colors hover:border-accent hover:text-accent"
              aria-label="Cerrar comparativa"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[540px] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="w-40 py-3 pr-4 font-mono text-[10px] uppercase tracking-wider text-mist">
                    Especificación
                  </th>
                  {items.map((p) => (
                    <th key={p.id} className="px-4 py-3 align-top">
                      <div className="flex h-28 items-center justify-center border border-white/10 bg-[#0B0D11] p-3">
                        {p.main_image ? (
                          <img
                            src={p.main_image}
                            alt={p.model}
                            className="max-h-full max-w-full object-contain drop-shadow-[0_6px_12px_rgba(0,0,0,0.7)]"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-mist/35" />
                        )}
                      </div>
                      <p className="mt-2 font-mono text-[9px] uppercase tracking-widest text-accent">
                        {p.brand}
                      </p>
                      <p className="font-display text-lg font-bold uppercase text-fog">
                        {p.model}
                      </p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-mono text-xs">
                {rows.map((r) => (
                  <tr key={r.key}>
                    <td className="py-3 pr-4 text-[10px] uppercase tracking-wider text-mist">
                      {r.label}
                    </td>
                    {items.map((p) => (
                      <td
                        key={p.id}
                        className={`px-4 py-3 tabular-nums ${
                          r.highlight ? "font-bold text-accent" : "text-fog/90"
                        }`}
                      >
                        {r.format ? r.format(p[r.key]) : p[r.key] || "—"}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <td className="py-4 pr-4 text-[10px] uppercase tracking-wider text-mist">
                    Cotizar
                  </td>
                  {items.map((p) => (
                    <td key={p.id} className="px-4 py-4">
                      <a
                        href={waLink(
                          `Hola MAQSYMA, comparé equipos y quiero cotizar ${p.brand} ${p.model} (${p.sku}).`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn-primary inline-flex w-full items-center justify-center gap-1 !px-3 !py-2 !text-[10px]"
                      >
                        Cotizar <ArrowUpRight className="h-3 w-3" />
                      </a>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
