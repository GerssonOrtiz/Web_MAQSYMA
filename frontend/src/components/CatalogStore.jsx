import { useState, useMemo, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  ArrowLeft,
  Check,
  X,
  Shield,
  Sparkles,
  Scale,
  Tag,
  Package,
  Wrench,
  HardHat,
  Zap,
  ZoomIn,
} from "lucide-react";
import { ESAB_PRODUCTS } from "../data/esabProducts";
import { waLink } from "../lib/scroll";
import FilterPanel, {
  AMPERAGE_RANGES,
  AVAILABILITY_OPTIONS,
  TYPE_OPTIONS,
  PROCESS_OPTIONS,
  POWER_SUPPLY_OPTIONS,
  BRAND_OPTIONS,
  APPLICATION_KEYWORDS,
  parseAmperageValue,
} from "./FilterPanel";
import { CompareDrawer, CompareModal } from "./CompareDrawer";

const CATEGORIES = [
  { id: "ALL", label: "Todos" },
  { id: "MIG / MAG", label: "MIG / MAG" },
  { id: "MMA", label: "MMA / Electrodo" },
  { id: "MULTIPROCESO", label: "Multiproceso" },
  { id: "TIG", label: "TIG" },
  { id: "LÁSER", label: "Soldadura Láser" },
  { id: "MOTOSOLDADORAS", label: "Motosoldadoras" },
  { id: "ALIMENTADORES", label: "Alimentadores" },
  { id: "COMPLEMENTOS", label: "Complementos" },
  { id: "EPP", label: "EPP's" },
];

const INITIAL_FILTERS = {
  availability: [],
  types: [],
  processes: [],
  amperageRanges: [],
  powerSupply: [],
  brands: [],
  applications: [],
};

const formatPEN = (val) =>
  `S/ ${Number(val).toLocaleString("es-PE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

function matchProductByFilters(p, filters, skipKey = null) {
  if (skipKey !== "availability" && filters.availability.length > 0) {
    const ok = filters.availability.some((id) => {
      if (id === "offer") return typeof p.price_current === "number";
      if (id === "quote") return typeof p.price_current !== "number";
      return false;
    });
    if (!ok) return false;
  }

  if (skipKey !== "types" && filters.types.length > 0) {
    if (!filters.types.includes(p.tipo)) return false;
  }

  if (skipKey !== "processes" && filters.processes.length > 0) {
    const procs = p.processes || [];
    const ok = filters.processes.some((pr) => procs.includes(pr));
    if (!ok) return false;
  }

  if (skipKey !== "amperageRanges" && filters.amperageRanges.length > 0) {
    const amp = p.amperage_num ?? parseAmperageValue(p.amperage);
    if (amp === null) return false;
    const ok = filters.amperageRanges.some((rangeId) => {
      const range = AMPERAGE_RANGES.find((r) => r.id === rangeId);
      return range && amp >= range.min && amp <= range.max;
    });
    if (!ok) return false;
  }

  if (skipKey !== "powerSupply" && filters.powerSupply.length > 0) {
    const supply = `${p.power_supply || ""} ${p.voltage || ""}`.toLowerCase();
    const ok = filters.powerSupply.some((psId) => {
      if (psId === "mono") return supply.includes("mono");
      if (psId === "tri") return supply.includes("tri");
      if (psId === "multi") return supply.includes("multi");
      if (psId === "comb") return supply.includes("combusti");
      return false;
    });
    if (!ok) return false;
  }

  if (skipKey !== "brands" && filters.brands.length > 0) {
    if (!filters.brands.includes(p.brand)) return false;
  }

  if (skipKey !== "applications" && filters.applications.length > 0) {
    const appsText = `${(p.applications || []).join(" ")} ${p.description || ""} ${p.subcategoria || ""}`.toLowerCase();
    const ok = filters.applications.some((kw) => appsText.includes(kw));
    if (!ok) return false;
  }

  return true;
}

function NoPhotoPlaceholder({ product }) {
  const Icon =
    product.category === "EPP"
      ? HardHat
      : product.category === "COMPLEMENTOS"
        ? Wrench
        : product.category === "LÁSER"
          ? Zap
          : Package;

  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-2.5 px-4 text-center">
      <div className="flex h-14 w-14 items-center justify-center border border-white/10 bg-coal/80 text-accent/70">
        <Icon className="h-7 w-7 stroke-[1.5]" />
      </div>
      <div className="space-y-0.5">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist">
          Imagen en preparación
        </p>
        <p className="font-mono text-[9px] uppercase tracking-wider text-mist/60">
          {product.subcategoria || product.category}
        </p>
      </div>
    </div>
  );
}

export default function CatalogStore() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedCat, setSelectedCat] = useState(
    () => searchParams.get("categoria") || "ALL"
  );
  const [searchQuery, setSearchQuery] = useState(
    () => searchParams.get("q") || ""
  );
  const [sortBy, setSortBy] = useState("default");
  const [filters, setFilters] = useState(() => {
    const appParam = searchParams.get("app");
    return {
      ...INITIAL_FILTERS,
      applications: appParam ? [appParam] : [],
    };
  });
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  useEffect(() => {
    const catParam = searchParams.get("categoria");
    const appParam = searchParams.get("app");
    if (catParam) setSelectedCat(catParam);
    if (appParam) {
      setFilters((prev) => ({
        ...prev,
        applications: [appParam],
      }));
    }
  }, [searchParams]);

  const handleFilterChange = (type, value) => {
    if (type === "reset") {
      setFilters(INITIAL_FILTERS);
      return;
    }
    setFilters((prev) => {
      const list = prev[type] || [];
      return {
        ...prev,
        [type]: list.includes(value)
          ? list.filter((v) => v !== value)
          : [...list, value],
      };
    });
  };

  const activeFilterCount =
    filters.availability.length +
    filters.types.length +
    filters.processes.length +
    filters.amperageRanges.length +
    filters.powerSupply.length +
    filters.brands.length +
    filters.applications.length;

  const baseMatches = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return ESAB_PRODUCTS.filter((p) => {
      const matchCat = selectedCat === "ALL" || p.category === selectedCat;
      if (!matchCat) return false;
      if (!q) return true;
      const haystack = `${p.model} ${p.brand} ${p.sku} ${p.description} ${p.process} ${p.amperage} ${p.subcategoria || ""} ${(p.applications || []).join(" ")}`.toLowerCase();
      return haystack.includes(q);
    });
  }, [selectedCat, searchQuery]);

  const categoryCounts = useMemo(() => {
    const counts = { ALL: ESAB_PRODUCTS.length };
    for (const c of CATEGORIES) {
      if (c.id !== "ALL") {
        counts[c.id] = ESAB_PRODUCTS.filter((p) => p.category === c.id).length;
      }
    }
    return counts;
  }, []);

  const facetCounts = useMemo(() => {
    const countFor = (groupKey, options, matcher) => {
      const pool = baseMatches.filter((p) => matchProductByFilters(p, filters, groupKey));
      const res = {};
      for (const opt of options) {
        res[opt.id] = pool.filter((p) => matcher(p, opt.id)).length;
      }
      return res;
    };

    return {
      availability: countFor("availability", AVAILABILITY_OPTIONS, (p, id) =>
        id === "offer" ? typeof p.price_current === "number" : typeof p.price_current !== "number"
      ),
      types: countFor("types", TYPE_OPTIONS, (p, id) => p.tipo === id),
      processes: countFor("processes", PROCESS_OPTIONS, (p, id) => (p.processes || []).includes(id)),
      amperageRanges: countFor("amperageRanges", AMPERAGE_RANGES, (p, id) => {
        const amp = p.amperage_num ?? parseAmperageValue(p.amperage);
        if (amp === null) return false;
        const range = AMPERAGE_RANGES.find((r) => r.id === id);
        return range && amp >= range.min && amp <= range.max;
      }),
      powerSupply: countFor("powerSupply", POWER_SUPPLY_OPTIONS, (p, id) => {
        const supply = `${p.power_supply || ""} ${p.voltage || ""}`.toLowerCase();
        if (id === "mono") return supply.includes("mono");
        if (id === "tri") return supply.includes("tri");
        if (id === "multi") return supply.includes("multi");
        if (id === "comb") return supply.includes("combusti");
        return false;
      }),
      brands: countFor("brands", BRAND_OPTIONS, (p, id) => p.brand === id),
      applications: countFor("applications", APPLICATION_KEYWORDS, (p, id) => {
        const appsText = `${(p.applications || []).join(" ")} ${p.description || ""} ${p.subcategoria || ""}`.toLowerCase();
        return appsText.includes(id);
      }),
    };
  }, [baseMatches, filters]);

  const filteredProducts = useMemo(() => {
    const filtered = baseMatches.filter((p) => matchProductByFilters(p, filters));
    const list = [...filtered];

    switch (sortBy) {
      case "price-asc":
        return list.sort(
          (a, b) => (a.price_current ?? 999999) - (b.price_current ?? 999999)
        );
      case "price-desc":
        return list.sort(
          (a, b) => (b.price_current ?? -1) - (a.price_current ?? -1)
        );
      case "amperage-desc":
        return list.sort(
          (a, b) =>
            (b.amperage_num ?? parseAmperageValue(b.amperage) ?? -1) -
            (a.amperage_num ?? parseAmperageValue(a.amperage) ?? -1)
        );
      case "amperage-asc":
        return list.sort(
          (a, b) =>
            (a.amperage_num ?? parseAmperageValue(a.amperage) ?? 99999) -
            (b.amperage_num ?? parseAmperageValue(b.amperage) ?? 99999)
        );
      case "name-asc":
        return list.sort((a, b) => a.model.localeCompare(b.model));
      case "name-desc":
        return list.sort((a, b) => b.model.localeCompare(a.model));
      default:
        return list.sort((a, b) => a.sort_order - b.sort_order);
    }
  }, [baseMatches, filters, sortBy]);

  const toggleCompare = (product) => {
    setCompareList((prev) => {
      const exists = prev.some((item) => item.id === product.id);
      if (exists) return prev.filter((item) => item.id !== product.id);
      if (prev.length >= 3) return prev;
      return [...prev, product];
    });
  };

  const resetAll = () => {
    setSelectedCat("ALL");
    setSearchQuery("");
    setSortBy("default");
    setFilters(INITIAL_FILTERS);
    setSearchParams({});
  };

  const offerCount = ESAB_PRODUCTS.filter((p) => p.is_offer).length;

  return (
    <section
      id="tienda"
      className="relative min-h-screen bg-ink/90 pb-24 pt-28 sm:pb-32 sm:pt-32"
      aria-label="Catálogo completo de equipos"
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-full max-w-7xl -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(255,183,3,0.06),transparent_70%)]" />

      <div className="section-head relative z-10">
        <div className="mb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-mist transition-colors hover:text-accent"
          >
            <ArrowLeft className="h-3.5 w-3.5" /> Volver al inicio
          </Link>
        </div>

        {/* Encabezado de sección */}
        <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end">
          <div>
            <h1 className="font-display text-4xl font-black uppercase tracking-tight sm:text-5xl lg:text-6xl">
              Catálogo <span className="text-accent">MAQSYMA</span>
            </h1>
            <p className="mt-3 max-w-2xl text-sm text-mist sm:text-base">
              Equipos ESAB, motosoldadoras, soldadora láser, alimentadores, complementos y EPP's con asesoría técnica especializada, precios promocionales vigentes y cotización inmediata.
            </p>
          </div>

          <div className="flex flex-col items-start gap-2 md:items-end">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-fog/90 tabular-nums">
              <span className="font-bold text-accent">{filteredProducts.length}</span> de {ESAB_PRODUCTS.length} productos
            </span>
            <span className="inline-flex items-center gap-1.5 border border-accent/25 bg-accent/10 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-accent">
              <Sparkles className="h-3 w-3" /> {offerCount} equipos en oferta pública
            </span>
          </div>
        </div>

        {/* Barra de Categorías con conteo en vivo */}
        <div className="mt-8 flex flex-wrap items-center gap-1.5">
          {CATEGORIES.map((cat) => {
            const count = categoryCounts[cat.id] ?? 0;
            const active = selectedCat === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`inline-flex items-center gap-2 whitespace-nowrap border px-3.5 py-2 font-mono text-[11px] uppercase tracking-wider transition-all duration-200 ${
                  active
                    ? "border-accent bg-accent font-bold text-ink shadow-[0_4px_16px_rgba(255,183,3,0.22)]"
                    : "border-white/10 bg-coal/50 text-mist hover:border-white/25 hover:text-fog"
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] tabular-nums ${
                    active ? "text-ink/75" : "text-mist/55"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Búsqueda, Atajos rápidos, Ordenamiento y Botón Filtros Móvil */}
        <div className="mt-4 flex flex-col items-stretch justify-between gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1 lg:max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar modelo, SKU, proceso o amperaje..."
              className="w-full border border-white/10 bg-coal/70 py-2.5 pl-10 pr-9 font-mono text-xs text-fog placeholder:text-mist/55 transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-mist hover:text-fog"
                title="Limpiar búsqueda"
                aria-label="Limpiar búsqueda"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Atajo rápido: Solo ofertas */}
            <button
              type="button"
              onClick={() => handleFilterChange("availability", "offer")}
              className={`inline-flex items-center gap-1.5 border px-3 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                filters.availability.includes("offer")
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-white/10 bg-coal/50 text-mist hover:border-white/25 hover:text-fog"
              }`}
            >
              <Tag className="h-3 w-3" />
              Ofertas ({offerCount})
            </button>

            <button
              type="button"
              onClick={() => handleFilterChange("types", "Portátil")}
              className={`inline-flex items-center gap-1.5 border px-3 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                filters.types.includes("Portátil")
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-white/10 bg-coal/50 text-mist hover:border-white/25 hover:text-fog"
              }`}
            >
              Portátiles
            </button>

            <button
              type="button"
              onClick={() => handleFilterChange("types", "Industrial")}
              className={`inline-flex items-center gap-1.5 border px-3 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                filters.types.includes("Industrial")
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-white/10 bg-coal/50 text-mist hover:border-white/25 hover:text-fog"
              }`}
            >
              Industriales
            </button>

            <button
              type="button"
              onClick={() => setShowFiltersMobile(true)}
              className="btn-ghost flex items-center gap-2 !px-3 !py-2 !text-[10px] lg:hidden"
            >
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Filtros
              {activeFilterCount > 0 && (
                <span className="bg-accent px-1.5 py-0.5 text-[9px] font-bold text-ink">
                  {activeFilterCount}
                </span>
              )}
            </button>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              aria-label="Ordenar productos"
              className="border border-white/10 bg-coal/80 px-3 py-2 font-mono text-xs text-fog focus:border-accent focus:outline-none"
            >
              <option value="default">Destacados y ofertas</option>
              <option value="price-asc">Menor precio público</option>
              <option value="price-desc">Mayor precio público</option>
              <option value="amperage-desc">Mayor amperaje</option>
              <option value="amperage-asc">Menor amperaje</option>
              <option value="name-asc">Nombre A → Z</option>
              <option value="name-desc">Nombre Z → A</option>
            </select>
          </div>
        </div>

        {/* Resumen de filtros activos */}
        {(selectedCat !== "ALL" || searchQuery || activeFilterCount > 0) && (
          <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-[11px] text-mist">
            <span>
              Mostrando <span className="font-bold text-accent tabular-nums">{filteredProducts.length}</span> de{" "}
              {ESAB_PRODUCTS.length}
            </span>
            {selectedCat !== "ALL" && (
              <span className="inline-flex items-center gap-1.5 border border-white/15 bg-coal/60 px-2.5 py-0.5 text-fog">
                {selectedCat}
                <button
                  onClick={() => setSelectedCat("ALL")}
                  className="text-mist hover:text-accent"
                  aria-label="Quitar categoría"
                >
                  ×
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1.5 border border-white/15 bg-coal/60 px-2.5 py-0.5 text-fog">
                "{searchQuery}"
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-mist hover:text-accent"
                  aria-label="Quitar búsqueda"
                >
                  ×
                </button>
              </span>
            )}
            {(activeFilterCount > 0 || selectedCat !== "ALL" || searchQuery) && (
              <button
                type="button"
                onClick={resetAll}
                className="text-accent underline underline-offset-4 hover:text-fog"
              >
                Limpiar todo
              </button>
            )}
          </div>
        )}

        {/* Layout con Panel Lateral de Filtros + Grid de Productos */}
        <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[270px_1fr]">
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                facetCounts={facetCounts}
                productCount={filteredProducts.length}
                totalCount={ESAB_PRODUCTS.length}
              />
            </div>
          </div>

          <div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((p) => {
                  const isCompared = compareList.some((c) => c.id === p.id);
                  const discountPct =
                    p.is_offer && p.price_previous && p.price_current
                      ? Math.round(((p.price_previous - p.price_current) / p.price_previous) * 100)
                      : null;

                  return (
                    <motion.article
                      layout
                      key={p.id}
                      initial={{ opacity: 0, scale: 0.97 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.97 }}
                      transition={{ duration: 0.22 }}
                      className="group relative flex flex-col justify-between border border-white/10 bg-coal/65 transition-all duration-300 hover:border-accent/55 hover:bg-coal hover:shadow-[0_12px_32px_rgba(0,0,0,0.45)]"
                    >
                      <div>
                        {/* Escenario de imagen de estudio 4:3 */}
                        <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden border-b border-white/10 bg-[#0B0D11]">
                          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,rgba(255,255,255,0.06),transparent_70%)]" />
                          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-px bg-gradient-to-r from-transparent via-accent/25 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                          {p.main_image ? (
                            <img
                              src={p.main_image}
                              alt={`${p.brand} ${p.model}`}
                              loading="lazy"
                              decoding="async"
                              width={400}
                              height={300}
                              className="relative z-10 h-full w-full scale-[1.12] object-contain transition-transform duration-500 group-hover:scale-[1.18]"
                            />
                          ) : (
                            <NoPhotoPlaceholder product={p} />
                          )}

                          {/* Badges superiores izquierda */}
                          <div className="absolute left-3 top-3 z-20 flex flex-wrap items-center gap-1.5">
                            <span className="border border-white/15 bg-ink/85 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-fog/90 backdrop-blur-sm">
                              {p.category}
                            </span>
                            {discountPct && (
                              <span className="bg-accent px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-ink tabular-nums">
                                -{discountPct}%
                              </span>
                            )}
                            {p.is_new && (
                              <span className="border border-accent/50 bg-accent/15 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-accent">
                                Nuevo
                              </span>
                            )}
                          </div>

                          {/* Badge capacidad / amperaje superior derecha */}
                          {p.amperage && (
                            <span className="absolute right-3 top-3 z-20 border border-white/15 bg-ink/85 px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider text-accent tabular-nums backdrop-blur-sm">
                              {p.amperage}
                            </span>
                          )}

                          {/* Botón Comparar */}
                          <button
                            type="button"
                            onClick={() => toggleCompare(p)}
                            disabled={!isCompared && compareList.length >= 3}
                            title={isCompared ? "Quitar de comparación" : "Comparar equipo (máx. 3)"}
                            className={`absolute bottom-3 right-3 z-20 inline-flex items-center gap-1 border px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider transition-colors ${
                              isCompared
                                ? "border-accent bg-accent font-bold text-ink"
                                : "border-white/15 bg-ink/85 text-mist hover:border-accent hover:text-accent disabled:opacity-40"
                            }`}
                          >
                            <Scale className="h-3 w-3" />
                            {isCompared ? "En lista" : "Comparar"}
                          </button>
                        </div>

                        {/* Cuerpo de la tarjeta */}
                        <div className="p-4">
                          <div className="flex items-center justify-between gap-2 text-mist">
                            <span className="font-mono text-[10px] font-semibold uppercase tracking-widest text-accent">
                              {p.brand}
                            </span>
                            <span className="truncate font-mono text-[9px] uppercase tracking-wider text-mist/60">
                              {p.sku}
                            </span>
                          </div>

                          <h3 className="mt-1 line-clamp-1 font-display text-lg font-extrabold uppercase tracking-tight text-fog transition-colors group-hover:text-accent sm:text-xl">
                            {p.model}
                          </h3>

                          {/* Bloque de Precio */}
                          <div className="mt-2 flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                            {typeof p.price_current === "number" ? (
                              <>
                                <span className="font-mono text-base font-bold text-fog tabular-nums">
                                  {formatPEN(p.price_current)}
                                </span>
                                {typeof p.price_previous === "number" && (
                                  <span className="font-mono text-[11px] text-mist/60 line-through tabular-nums">
                                    {formatPEN(p.price_previous)}
                                  </span>
                                )}
                                <span className="ml-auto font-mono text-[9px] uppercase tracking-wider text-accent">
                                  Oferta
                                </span>
                              </>
                            ) : (
                              <span className="font-mono text-xs uppercase tracking-wider text-mist">
                                Precio a cotizar
                              </span>
                            )}
                          </div>

                          <div className="mt-2.5 grid grid-cols-2 gap-2.5 border-t border-white/5 pt-2.5 font-mono text-[10px]">
                            <div>
                              <span className="block text-[9px] uppercase tracking-wider text-mist/60">
                                Proceso
                              </span>
                              <span className="block truncate font-medium text-fog">
                                {p.process}
                              </span>
                            </div>
                            <div>
                              <span className="block text-[9px] uppercase tracking-wider text-mist/60">
                                Alimentación
                              </span>
                              <span className="block truncate font-medium text-fog">
                                {p.power_supply}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="grid grid-cols-2 gap-2 p-4 pt-0">
                        <button
                          type="button"
                          onClick={() => setActiveProduct(p)}
                          className="btn-ghost w-full !px-3 !py-2 text-center !text-[10px]"
                        >
                          Ficha Técnica
                        </button>
                        <a
                          href={waLink(
                            `Hola MAQSYMA, me interesa el producto:\n` +
                              `${p.brand} ${p.model}\n` +
                              `${p.amperage} · ${p.process}\n` +
                              (typeof p.price_current === "number"
                                ? `Precio oferta visto: ${formatPEN(p.price_current)}\n`
                                : `Modalidad: Precio a cotizar\n`) +
                              `SKU: ${p.sku}\n\n` +
                              `¿Podrían confirmar disponibilidad y envío?`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary inline-flex w-full items-center justify-center gap-1 !px-3 !py-2 text-center !text-[10px]"
                        >
                          {typeof p.price_current === "number" ? "Comprar" : "Cotizar"}{" "}
                          <ArrowUpRight className="h-3 w-3" />
                        </a>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>

            {filteredProducts.length === 0 && (
              <div className="my-8 border border-dashed border-white/15 bg-coal/30 py-20 text-center">
                <p className="font-mono text-sm uppercase tracking-wider text-mist">
                  No se encontraron productos con los filtros seleccionados.
                </p>
                <button
                  onClick={resetAll}
                  className="btn-ghost mt-4 !px-4 !py-2 !text-xs"
                >
                  Restablecer todos los filtros
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Drawer de Filtros Móvil */}
      <AnimatePresence>
        {showFiltersMobile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[85] flex justify-end lg:hidden"
          >
            <div
              className="absolute inset-0 bg-ink/80 backdrop-blur-sm"
              onClick={() => setShowFiltersMobile(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="relative z-10 h-full w-full max-w-xs overflow-y-auto border-l border-white/15 bg-coal p-5"
            >
              <div className="mb-4 flex items-center justify-between">
                <span className="font-mono text-xs uppercase tracking-wider text-fog">
                  Filtros
                </span>
                <button
                  type="button"
                  onClick={() => setShowFiltersMobile(false)}
                  className="p-1 text-mist hover:text-fog"
                  aria-label="Cerrar filtros"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                facetCounts={facetCounts}
                productCount={filteredProducts.length}
                totalCount={ESAB_PRODUCTS.length}
                className="border-0 bg-transparent p-0"
              />
              <button
                type="button"
                onClick={() => setShowFiltersMobile(false)}
                className="btn-primary mt-6 w-full !py-2.5 !text-[10px]"
              >
                Ver {filteredProducts.length} productos
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal Ficha Técnica Completa */}
      <AnimatePresence>
        {activeProduct && (
          <ProductDetailModal
            product={activeProduct}
            isCompared={compareList.some((c) => c.id === activeProduct.id)}
            onToggleCompare={() => toggleCompare(activeProduct)}
            onClose={() => setActiveProduct(null)}
          />
        )}
      </AnimatePresence>

      {/* Drawer y Modal de Comparación */}
      <AnimatePresence>
        {compareList.length > 0 && (
          <CompareDrawer
            items={compareList}
            onRemove={(id) =>
              setCompareList((prev) => prev.filter((item) => item.id !== id))
            }
            onClear={() => setCompareList([])}
            onOpenModal={() => setShowCompareModal(true)}
          />
        )}
      </AnimatePresence>

      {showCompareModal && (
        <CompareModal
          items={compareList}
          onClose={() => setShowCompareModal(false)}
        />
      )}
    </section>
  );
}

function ZoomableProductImage({ product: p }) {
  const [isZoomed, setIsZoomed] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - rect.left) / rect.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - rect.top) / rect.height) * 100));
    setOrigin({ x, y });
    if (!isZoomed) setIsZoomed(true);
  };

  return (
    <div
      className={`relative flex aspect-square w-full items-center justify-center overflow-hidden border border-white/10 bg-[#0B0D11] p-2 ${
        p.main_image ? "cursor-zoom-in" : ""
      }`}
      onMouseEnter={() => p.main_image && setIsZoomed(true)}
      onMouseLeave={() => setIsZoomed(false)}
      onMouseMove={p.main_image ? handleMouseMove : undefined}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,rgba(255,255,255,0.065),transparent_70%)]" />
      {p.main_image ? (
        <>
          <img
            src={p.main_image}
            alt={p.model}
            style={{
              transformOrigin: `${origin.x}% ${origin.y}%`,
              transform: isZoomed ? "scale(2.2)" : "scale(1)",
            }}
            className="relative z-10 h-full w-full object-contain drop-shadow-[0_14px_24px_rgba(0,0,0,0.75)] transition-transform duration-150 ease-out will-change-transform"
          />
          <span
            className={`pointer-events-none absolute bottom-3 right-3 z-20 inline-flex items-center gap-1.5 border border-white/15 bg-ink/85 px-2.5 py-1 font-mono text-[9px] uppercase tracking-wider backdrop-blur-sm transition-opacity duration-200 ${
              isZoomed ? "border-accent/60 text-accent" : "text-mist/85"
            }`}
          >
            <ZoomIn className="h-3 w-3" />
            {isZoomed ? "Zoom 2.2x" : "Pasa el cursor para zoom"}
          </span>
        </>
      ) : (
        <NoPhotoPlaceholder product={p} />
      )}
      <span className="pointer-events-none absolute left-3 top-3 z-20 bg-accent px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-ink">
        {p.category}
      </span>
    </div>
  );
}

function ProductDetailModal({ product: p, isCompared, onToggleCompare, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    window.__lenis?.stop();
    return () => {
      window.removeEventListener("keydown", onKey);
      window.__lenis?.start();
    };
  }, [onClose]);

  const specRows = [
    ["Proceso", p.process],
    ["Capacidad / Amperaje", p.amperage],
    ["Voltaje", p.voltage],
    ["Alimentación", p.power_supply],
    ["Ciclo de Trabajo", p.duty_cycle],
    ["Nivel / Tipo", p.tipo],
    p.weight ? ["Peso", p.weight] : null,
    p.ip_rating ? ["Grado de protección", p.ip_rating] : null,
    p.warranty ? ["Garantía", p.warranty] : null,
  ].filter(Boolean);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6"
    >
      <div
        className="absolute inset-0 bg-ink/80 backdrop-blur-md"
        onClick={onClose}
      />

      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`Ficha técnica ${p.brand} ${p.model}`}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative z-10 max-h-[90vh] w-full max-w-3xl overflow-y-auto border border-white/15 bg-coal p-6 shadow-2xl sm:p-8"
        data-lenis-prevent
      >
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 text-mist transition-colors hover:bg-white/5 hover:text-fog"
          title="Cerrar (Esc)"
          aria-label="Cerrar ficha técnica"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          <div className="flex flex-col">
            <ZoomableProductImage product={p} />

            <div className="mt-4 flex items-center justify-between font-mono text-xs text-mist">
              <span>SKU: {p.sku}</span>
              <span className="flex items-center gap-1 text-accent">
                <Shield className="h-3.5 w-3.5" /> Respaldo MAQSYMA
              </span>
            </div>

            <button
              type="button"
              onClick={onToggleCompare}
              className={`mt-3 inline-flex w-full items-center justify-center gap-2 border px-3 py-2 font-mono text-[10px] uppercase tracking-wider transition-colors ${
                isCompared
                  ? "border-accent bg-accent font-bold text-ink"
                  : "border-white/15 bg-ink/50 text-mist hover:border-accent hover:text-accent"
              }`}
            >
              <Scale className="h-3.5 w-3.5" />
              {isCompared ? "En lista de comparación" : "Agregar a comparación"}
            </button>
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-accent">
                {p.brand} {p.subcategoria ? `· ${p.subcategoria}` : ""}
              </p>
              <h2 className="mt-1 font-display text-2xl font-black uppercase tracking-tight text-fog sm:text-3xl">
                {p.model}
              </h2>

              {/* Precio en Modal */}
              <div className="mt-3 flex flex-wrap items-baseline gap-3 border border-white/10 bg-ink/50 px-4 py-3">
                {typeof p.price_current === "number" ? (
                  <>
                    <span className="font-mono text-xl font-bold text-accent tabular-nums">
                      {formatPEN(p.price_current)}
                    </span>
                    {typeof p.price_previous === "number" && (
                      <span className="font-mono text-xs text-mist/60 line-through tabular-nums">
                        {formatPEN(p.price_previous)}
                      </span>
                    )}
                    <span className="ml-auto font-mono text-[10px] uppercase tracking-wider text-fog/80">
                      Precio oferta
                    </span>
                  </>
                ) : (
                  <span className="font-mono text-xs uppercase tracking-wider text-mist">
                    Precio a cotizar · Venta y alquiler disponible
                  </span>
                )}
              </div>

              <p className="mt-4 text-sm leading-relaxed text-mist">
                {p.description}
              </p>

              <div className="mt-5 divide-y divide-white/5 border-b border-t border-white/10 font-mono text-xs">
                {specRows.map(([label, value]) => (
                  <div key={label} className="flex justify-between gap-4 py-2.5">
                    <span className="text-mist">{label}:</span>
                    <span className="text-right font-medium text-fog">{value}</span>
                  </div>
                ))}
              </div>

              {p.applications && p.applications.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {p.applications.map((app) => (
                    <span
                      key={app}
                      className="border border-white/10 bg-ink/40 px-2 py-0.5 font-mono text-[10px] text-mist"
                    >
                      {app}
                    </span>
                  ))}
                </div>
              )}

              {p.features && p.features.length > 0 && (
                <div className="mt-5">
                  <p className="mb-2 font-mono text-[11px] uppercase tracking-wider text-fog/80">
                    Destacados:
                  </p>
                  <ul className="space-y-1.5 text-xs text-mist">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-4 sm:flex-row">
              <a
                href={waLink(
                  `Hola MAQSYMA, solicito información/cotización del producto:\n` +
                    `${p.brand} ${p.model}\n` +
                    `${p.amperage} · ${p.process}\n` +
                    (typeof p.price_current === "number"
                      ? `Precio oferta: ${formatPEN(p.price_current)}\n`
                      : ``) +
                    `SKU: ${p.sku}`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex w-full items-center justify-center gap-2 !py-3 text-center"
              >
                {typeof p.price_current === "number" ? "Comprar / Consultar" : "Solicitar Cotización"}{" "}
                <ArrowUpRight className="h-4 w-4" />
              </a>
              {/* Oculto temporalmente a solicitud del cliente
              {p.datasheet_url && (
                <a
                  href={p.datasheet_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost w-full !py-3 text-center"
                >
                  Ficha Oficial ESAB
                </a>
              )}
              */}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
