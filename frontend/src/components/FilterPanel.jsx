import { useState } from "react";
import { SlidersHorizontal, ChevronDown, Check } from "lucide-react";

export const AVAILABILITY_OPTIONS = [
  { id: "offer", label: "Precio público / Oferta" },
  { id: "quote", label: "Precio a cotizar" },
];

export const TYPE_OPTIONS = [
  { id: "Portátil", label: "Portátil" },
  { id: "Profesional", label: "Profesional" },
  { id: "Industrial", label: "Industrial" },
];

export const PROCESS_OPTIONS = [
  { id: "SMAW", label: "SMAW (Electrodo)" },
  { id: "GMAW", label: "GMAW (MIG / MAG)" },
  { id: "FCAW", label: "FCAW (Alambre tubular)" },
  { id: "GTAW", label: "GTAW (TIG)" },
  { id: "LBW", label: "Soldadura Láser" },
];

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
  { id: "comb", label: "Combustión / Autónoma" },
];

export const BRAND_OPTIONS = [
  { id: "ESAB", label: "ESAB" },
  { id: "Victor", label: "Victor" },
  { id: "Arcair", label: "Arcair" },
  { id: "GCE", label: "GCE" },
];

export const APPLICATION_KEYWORDS = [
  { id: "herreria", label: "Herrería / Taller ligero" },
  { id: "mantenimiento", label: "Mantenimiento y reparación" },
  { id: "estructura", label: "Estructuras metálicas" },
  { id: "industrial", label: "Fabricación industrial" },
  { id: "produccion", label: "Producción continua" },
  { id: "inoxidable", label: "Acero inox / Aluminio" },
  { id: "campo", label: "Campo / Obra" },
];

export function parseAmperageValue(str) {
  if (!str) return null;
  const s = String(str).trim();
  if (!/\d+\s*A\.?$/i.test(s)) return null;
  const num = parseInt(s.replace(/[^\d]/g, ""), 10);
  return Number.isNaN(num) ? null : num;
}

function FilterCheckbox({ checked, onChange, label, count }) {
  const isZero = count === 0 && !checked;
  return (
    <label
      className={`group flex cursor-pointer items-center justify-between gap-2 py-0.5 transition-opacity ${
        isZero ? "opacity-40" : "opacity-100"
      }`}
    >
      <span className="flex items-center gap-2.5">
        <input
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only"
        />
        <span
          aria-hidden="true"
          className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center border transition-colors ${
            checked
              ? "border-accent bg-accent text-ink"
              : "border-white/25 bg-ink/70 group-hover:border-accent/60"
          }`}
        >
          {checked && <Check className="h-2.5 w-2.5 stroke-[3]" />}
        </span>
        <span
          className={`font-mono text-[11px] transition-colors ${
            checked ? "font-semibold text-fog" : "text-mist group-hover:text-fog"
          }`}
        >
          {label}
        </span>
      </span>
      {typeof count === "number" && (
        <span className="font-mono text-[10px] tabular-nums text-mist/60">
          {count}
        </span>
      )}
    </label>
  );
}

function FilterSection({ title, expanded, onToggle, children, isFirst = false }) {
  return (
    <div className={isFirst ? "" : "border-t border-white/5 pt-4"}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={expanded}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="font-mono text-[10px] uppercase tracking-wider text-fog">
          {title}
        </span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-mist transition-transform duration-200 ${
            expanded ? "rotate-180" : ""
          }`}
        />
      </button>
      {expanded && <div className="mt-3 space-y-1.5">{children}</div>}
    </div>
  );
}

export default function FilterPanel({
  filters,
  onFilterChange,
  facetCounts = {},
  productCount,
  totalCount,
  className = "",
}) {
  const [expanded, setExpanded] = useState({
    availability: true,
    type: true,
    process: true,
    amperage: true,
    power: false,
    brand: false,
    application: false,
  });

  const toggle = (key) => setExpanded((e) => ({ ...e, [key]: !e[key] }));

  const hasActiveFilters =
    (filters.availability?.length || 0) > 0 ||
    (filters.types?.length || 0) > 0 ||
    (filters.processes?.length || 0) > 0 ||
    (filters.amperageRanges?.length || 0) > 0 ||
    (filters.powerSupply?.length || 0) > 0 ||
    (filters.brands?.length || 0) > 0 ||
    (filters.applications?.length || 0) > 0;

  return (
    <aside
      className={`border border-white/10 bg-coal/60 p-5 space-y-5 ${className}`}
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

      <FilterSection
        title="Precio / Modalidad"
        expanded={expanded.availability}
        onToggle={() => toggle("availability")}
        isFirst
      >
        {AVAILABILITY_OPTIONS.map((opt) => (
          <FilterCheckbox
            key={opt.id}
            label={opt.label}
            checked={filters.availability?.includes(opt.id) || false}
            onChange={() => onFilterChange("availability", opt.id)}
            count={facetCounts.availability?.[opt.id]}
          />
        ))}
      </FilterSection>

      <FilterSection
        title="Nivel / Tipo"
        expanded={expanded.type}
        onToggle={() => toggle("type")}
      >
        {TYPE_OPTIONS.map((opt) => (
          <FilterCheckbox
            key={opt.id}
            label={opt.label}
            checked={filters.types?.includes(opt.id) || false}
            onChange={() => onFilterChange("types", opt.id)}
            count={facetCounts.types?.[opt.id]}
          />
        ))}
      </FilterSection>

      <FilterSection
        title="Proceso"
        expanded={expanded.process}
        onToggle={() => toggle("process")}
      >
        {PROCESS_OPTIONS.map((opt) => (
          <FilterCheckbox
            key={opt.id}
            label={opt.label}
            checked={filters.processes?.includes(opt.id) || false}
            onChange={() => onFilterChange("processes", opt.id)}
            count={facetCounts.processes?.[opt.id]}
          />
        ))}
      </FilterSection>

      <FilterSection
        title="Corriente máxima"
        expanded={expanded.amperage}
        onToggle={() => toggle("amperage")}
      >
        {AMPERAGE_RANGES.map((r) => (
          <FilterCheckbox
            key={r.id}
            label={r.label}
            checked={filters.amperageRanges?.includes(r.id) || false}
            onChange={() => onFilterChange("amperageRanges", r.id)}
            count={facetCounts.amperageRanges?.[r.id]}
          />
        ))}
      </FilterSection>

      <FilterSection
        title="Alimentación"
        expanded={expanded.power}
        onToggle={() => toggle("power")}
      >
        {POWER_SUPPLY_OPTIONS.map((ps) => (
          <FilterCheckbox
            key={ps.id}
            label={ps.label}
            checked={filters.powerSupply?.includes(ps.id) || false}
            onChange={() => onFilterChange("powerSupply", ps.id)}
            count={facetCounts.powerSupply?.[ps.id]}
          />
        ))}
      </FilterSection>

      <FilterSection
        title="Marca"
        expanded={expanded.brand}
        onToggle={() => toggle("brand")}
      >
        {BRAND_OPTIONS.map((b) => (
          <FilterCheckbox
            key={b.id}
            label={b.label}
            checked={filters.brands?.includes(b.id) || false}
            onChange={() => onFilterChange("brands", b.id)}
            count={facetCounts.brands?.[b.id]}
          />
        ))}
      </FilterSection>

      <FilterSection
        title="Aplicación"
        expanded={expanded.application}
        onToggle={() => toggle("application")}
      >
        {APPLICATION_KEYWORDS.map((app) => (
          <FilterCheckbox
            key={app.id}
            label={app.label}
            checked={filters.applications?.includes(app.id) || false}
            onChange={() => onFilterChange("applications", app.id)}
            count={facetCounts.applications?.[app.id]}
          />
        ))}
      </FilterSection>

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
