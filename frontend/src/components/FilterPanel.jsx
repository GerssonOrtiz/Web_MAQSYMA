import { useState } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";

export const AMPERAGE_RANGES = [
  { id: "0-200", label: "Hasta 200 A", min: 0, max: 200 },
  { id: "200-350", label: "200 A – 350 A", min: 200, max: 350 },
  { id: "350-500", label: "350 A – 500 A", min: 350, max: 500 },
  { id: "500+", label: "500 A o más", min: 500, max: Infinity },
];

export const POWER_SUPPLY_OPTIONS = [
  { id: "mono", label: "Monofásica" },
  { id: "tri", label: "Trifásica" },
  { id: "multi", label: "Multivoltaje" },
];

export const APPLICATION_KEYWORDS = [
  { id: "mantenimiento", label: "Mantenimiento y reparación" },
  { id: "estructura", label: "Estructuras metálicas" },
  { id: "industrial", label: "Fabricación industrial" },
  { id: "produccion", label: "Producción continua" },
  { id: "taller", label: "Taller profesional" },
  { id: "inoxidable", label: "Acero inoxidable / Aluminio" },
];

export function parseAmperageValue(str) {
  if (!str) return null;
  const s = String(str).trim();
  if (!/\d+\s*A\.?$/i.test(s)) return null;
  const num = parseInt(s.replace(/[^\d]/g, ""), 10);
  return Number.isNaN(num) ? null : num;
}

export default function FilterPanel({
  filters,
  onFilterChange,
  productCount,
  totalCount,
  className = "",
}) {
  const [expanded, setExpanded] = useState({
    amperage: true,
    power: true,
    application: true,
  });

  const toggle = (key) => setExpanded((e) => ({ ...e, [key]: !e[key] }));

  const hasActiveFilters =
    (filters.amperageRanges?.length || 0) > 0 ||
    (filters.powerSupply?.length || 0) > 0 ||
    (filters.applications?.length || 0) > 0;

  return (
    <aside
      className={`border border-white/10 bg-coal/50 p-5 space-y-6 ${className}`}
      aria-label="Filtros técnicos"
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h3 className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-wider text-fog">
          <SlidersHorizontal className="h-4 w-4 text-accent" />
          Filtros técnicos
        </h3>
        <span className="font-mono text-[10px] tabular-nums text-mist">
          {productCount} / {totalCount}
        </span>
      </div>

      {/* Filtro por amperaje */}
      <div>
        <button
          type="button"
          onClick={() => toggle("amperage")}
          className="flex w-full items-center justify-between text-left"
        >
          <span className="font-mono text-[10px] uppercase tracking-wider text-fog">
            Amperaje
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-mist transition-transform ${
              expanded.amperage ? "rotate-180" : ""
            }`}
          />
        </button>
        {expanded.amperage && (
          <div className="mt-3 space-y-2">
            {AMPERAGE_RANGES.map((r) => (
              <label
                key={r.id}
                className="group flex cursor-pointer items-center gap-2.5"
              >
                <input
                  type="checkbox"
                  checked={filters.amperageRanges?.includes(r.id) || false}
                  onChange={() => onFilterChange("amperageRanges", r.id)}
                  className="h-3.5 w-3.5 accent-accent"
                />
                <span className="font-mono text-[11px] text-mist transition-colors group-hover:text-fog">
                  {r.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Filtro por alimentación eléctrica */}
      <div className="border-t border-white/5 pt-4">
        <button
          type="button"
          onClick={() => toggle("power")}
          className="flex w-full items-center justify-between text-left"
        >
          <span className="font-mono text-[10px] uppercase tracking-wider text-fog">
            Alimentación
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-mist transition-transform ${
              expanded.power ? "rotate-180" : ""
            }`}
          />
        </button>
        {expanded.power && (
          <div className="mt-3 space-y-2">
            {POWER_SUPPLY_OPTIONS.map((ps) => (
              <label
                key={ps.id}
                className="group flex cursor-pointer items-center gap-2.5"
              >
                <input
                  type="checkbox"
                  checked={filters.powerSupply?.includes(ps.id) || false}
                  onChange={() => onFilterChange("powerSupply", ps.id)}
                  className="h-3.5 w-3.5 accent-accent"
                />
                <span className="font-mono text-[11px] text-mist transition-colors group-hover:text-fog">
                  {ps.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Filtro por aplicación */}
      <div className="border-t border-white/5 pt-4">
        <button
          type="button"
          onClick={() => toggle("application")}
          className="flex w-full items-center justify-between text-left"
        >
          <span className="font-mono text-[10px] uppercase tracking-wider text-fog">
            Aplicación
          </span>
          <ChevronDown
            className={`h-3.5 w-3.5 text-mist transition-transform ${
              expanded.application ? "rotate-180" : ""
            }`}
          />
        </button>
        {expanded.application && (
          <div className="mt-3 space-y-2">
            {APPLICATION_KEYWORDS.map((app) => (
              <label
                key={app.id}
                className="group flex cursor-pointer items-center gap-2.5"
              >
                <input
                  type="checkbox"
                  checked={filters.applications?.includes(app.id) || false}
                  onChange={() => onFilterChange("applications", app.id)}
                  className="h-3.5 w-3.5 accent-accent"
                />
                <span className="font-mono text-[11px] text-mist transition-colors group-hover:text-fog">
                  {app.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {hasActiveFilters && (
        <button
          type="button"
          onClick={() => onFilterChange("reset")}
          className="btn-ghost w-full !py-2 !text-[10px]"
        >
          Limpiar filtros técnicos
        </button>
      )}
    </aside>
  );
}
