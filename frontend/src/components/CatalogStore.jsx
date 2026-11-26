import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  SlidersHorizontal,
  ArrowUpRight,
  Check,
  X,
  Shield,
  Sparkles,
  Scale,
} from "lucide-react";
import { ESAB_PRODUCTS } from "../data/esabProducts";
import { waLink } from "../lib/scroll";
import FilterPanel, {
  AMPERAGE_RANGES,
  parseAmperageValue,
} from "./FilterPanel";
import { CompareDrawer, CompareModal } from "./CompareDrawer";

const CATEGORIES = [
  { id: "ALL", label: "Todos los equipos" },
  { id: "MIG / MAG", label: "MIG / MAG" },
  { id: "MMA", label: "MMA / Electrodo" },
  { id: "MULTIPROCESO", label: "Multiproceso" },
  { id: "TIG", label: "TIG" },
  { id: "LÁSER", label: "Soldadura Láser" },
  { id: "ALIMENTADORES", label: "Alimentadores" },
];

export default function CatalogStore() {
  const [selectedCat, setSelectedCat] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [filters, setFilters] = useState({
    amperageRanges: [],
    powerSupply: [],
    applications: [],
  });
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);
  const [activeProduct, setActiveProduct] = useState(null);
  const [compareList, setCompareList] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  useEffect(() => {
    const onCatEvent = (e) => {
      if (e.detail) setSelectedCat(e.detail);
    };
    window.addEventListener("filter-category", onCatEvent);
    return () => window.removeEventListener("filter-category", onCatEvent);
  }, []);

  const handleFilterChange = (type, value) => {
    if (type === "reset") {
      setFilters({ amperageRanges: [], powerSupply: [], applications: [] });
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
    filters.amperageRanges.length +
    filters.powerSupply.length +
    filters.applications.length;

  const filteredProducts = useMemo(() => {
    const filtered = ESAB_PRODUCTS.filter((p) => {
      const matchCat = selectedCat === "ALL" || p.category === selectedCat;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.model.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.process.toLowerCase().includes(q) ||
        p.amperage.toLowerCase().includes(q);

      const matchAmperage =
        filters.amperageRanges.length === 0 ||
        filters.amperageRanges.some((rangeId) => {
          const amp = parseAmperageValue(p.amperage);
          if (amp === null) return false;
          const range = AMPERAGE_RANGES.find((r) => r.id === rangeId);
          return range && amp >= range.min && amp <= range.max;
        });

      const matchPower =
        filters.powerSupply.length === 0 ||
        filters.powerSupply.some((psId) => {
          const supply = `${p.power_supply || ""} ${p.voltage || ""}`.toLowerCase();
          if (psId === "mono") return supply.includes("mono");
          if (psId === "tri") return supply.includes("tri");
          if (psId === "multi") return supply.includes("multi");
          return false;
        });

      const matchApp =
        filters.applications.length === 0 ||
        filters.applications.some((kw) => {
          const appsText = `${(p.applications || []).join(" ")} ${p.description || ""}`.toLowerCase();
          return appsText.includes(kw);
        });

      return matchCat && matchSearch && matchAmperage && matchPower && matchApp;
    });

    const list = [...filtered];
    switch (sortBy) {
      case "amperage-desc":
        return list.sort(
          (a, b) => (parseAmperageValue(b.amperage) ?? -1) - (parseAmperageValue(a.amperage) ?? -1)
        );
      case "amperage-asc":
        return list.sort(
          (a, b) => (parseAmperageValue(a.amperage) ?? 99999) - (parseAmperageValue(b.amperage) ?? 99999)
        );
      case "name-asc":
        return list.sort((a, b) => a.model.localeCompare(b.model));
      case "name-desc":
        return list.sort((a, b) => b.model.localeCompare(a.model));
      default:
        return list;
    }
  }, [selectedCat, searchQuery, filters, sortBy]);

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
    setFilters({ amperageRanges: [], powerSupply: [], applications: [] });
  };

  return (
    <section
      id="tienda"
      className="relative border-t border-white/10 bg-ink/90 py-24 sm:py-32"
      aria-label="Catálogo completo de equipos"
    >
      <div className="pointer-events-none absolute left-1/2 top-0 h-96 w-full max-w-7xl -translate-x-1/2 bg-[radial-gradient(ellipse_at_top,rgba(255,183,3,0.06),transparent_70%)]" />

      <div className="section-head relative z-10">
        {/* Encabezado de sección */}
        <div className="flex flex-col justify-between gap-6 border-b border-white/10 pb-8 md:flex-row md:items-end">
          <div>
            <p className="mono-label flex items-center gap-3">
              <span className="font-mono text-accent">04</span> Inventario Técnico ESAB
              <span className="h-px w-16 bg-white/10" />
            </p>
            <h2 className="mt-4 font-display text-4xl font-black uppercase tracking-tight sm:text-5xl lg:text-6xl">
              Catálogo & <span className="text-accent">Equipos</span>
            </h2>
            <p className="mt-3 max-w-xl text-sm text-mist sm:text-base">
              Explora nuestra gama completa de fuentes de poder, multiprocesos, tecnología láser y alimentadores de alambre originales con respaldo de garantía oficial.
            </p>
          </div>

          <div className="flex flex-col items-start gap-2 md:items-end">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-fog/90">
              <span className="font-bold text-accent">{filteredProducts.length}</span> de {ESAB_PRODUCTS.length} equipos disponibles
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/5 px-3 py-1 font-mono text-[10px] uppercase tracking-wider text-accent">
              <Sparkles className="h-3 w-3" /> Asesoría técnica inmediata
            </span>
          </div>
        </div>

        {/* Barra de Categorías */}
        <div className="mt-8 flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none no-scrollbar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              className={`whitespace-nowrap border px-4 py-2 font-mono text-[11px] uppercase tracking-wider transition-all duration-200 ${
                selectedCat === cat.id
                  ? "border-accent bg-accent font-bold text-ink shadow-[0_0_15px_rgba(255,183,3,0.3)]"
                  : "border-white/10 bg-coal/40 text-mist hover:border-white/25 hover:text-fog"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Búsqueda, Ordenamiento y Botón Filtros Móvil */}
        <div className="mt-4 flex flex-col items-stretch justify-between gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1 sm:max-w-md">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-mist" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por modelo, proceso o amperaje..."
              className="w-full border border-white/10 bg-coal/70 py-2 pl-10 pr-9 font-mono text-xs text-fog placeholder:text-mist/50 transition-colors focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-mist hover:text-fog"
                title="Limpiar búsqueda"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-3">
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
              aria-label="Ordenar equipos"
              className="border border-white/10 bg-coal/70 px-3 py-2 font-mono text-xs text-fog focus:border-accent focus:outline-none"
            >
              <option value="default">Orden predeterminado</option>
              <option value="amperage-desc">Mayor amperaje primero</option>
              <option value="amperage-asc">Menor amperaje primero</option>
              <option value="name-asc">Nombre A → Z</option>
              <option value="name-desc">Nombre Z → A</option>
            </select>
          </div>
        </div>

        {/* Resumen de filtros activos */}
        {(selectedCat !== "ALL" || searchQuery || activeFilterCount > 0) && (
          <div className="mt-4 flex flex-wrap items-center gap-2 font-mono text-[11px] text-mist">
            <span>
              Mostrando <span className="font-bold text-accent">{filteredProducts.length}</span> de{" "}
              {ESAB_PRODUCTS.length} equipos
            </span>
            {selectedCat !== "ALL" && (
              <span className="border border-white/10 bg-coal/50 px-2 py-0.5 text-fog">
                {selectedCat}
                <button
                  onClick={() => setSelectedCat("ALL")}
                  className="ml-1.5 text-mist hover:text-accent"
                >
                  ×
                </button>
              </span>
            )}
            {searchQuery && (
              <span className="border border-white/10 bg-coal/50 px-2 py-0.5 text-fog">
                "{searchQuery}"
                <button
                  onClick={() => setSearchQuery("")}
                  className="ml-1.5 text-mist hover:text-accent"
                >
                  ×
                </button>
              </span>
            )}
            {activeFilterCount > 0 && (
              <button
                type="button"
                onClick={() => handleFilterChange("reset")}
                className="text-accent underline underline-offset-4 hover:text-fog"
              >
                Limpiar ({activeFilterCount}) filtros técnicos
              </button>
            )}
          </div>
        )}

        {/* Layout con Panel Lateral de Filtros + Grid de Productos */}
        <div className="mt-10 grid grid-cols-1 gap-6 lg:grid-cols-[260px_1fr]">
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                productCount={filteredProducts.length}
                totalCount={ESAB_PRODUCTS.length}
              />
            </div>
          </div>

          <div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              <AnimatePresence mode="popLayout">
                {filteredProducts.map((p) => {
                  const isCompared = compareList.some((c) => c.id === p.id);
                  return (
                    <motion.article
                      layout
                      key={p.id}
                      initial={{ opacity: 0, scale: 0.96 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.96 }}
                      transition={{ duration: 0.25 }}
                      className="group relative flex flex-col justify-between border border-white/10 bg-coal/50 backdrop-blur-sm transition-all duration-300 hover:border-accent/50 hover:bg-coal/90"
                    >
                      <div>
                        <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden border-b border-white/10 bg-coal/90 p-5">
                          <img
                            src={p.main_image}
                            alt={`Equipo ${p.brand} ${p.model}`}
                            loading="lazy"
                            decoding="async"
                            width={400}
                            height={300}
                            className="max-h-full max-w-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] transition-transform duration-500 group-hover:scale-110"
                          />
                          <span className="absolute left-3 top-3 border border-white/15 bg-ink/80 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-accent backdrop-blur-sm">
                            {p.category}
                          </span>
                          {p.amperage && (
                            <span className="absolute right-3 top-3 border border-white/10 bg-coal/90 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-fog/90">
                              {p.amperage}
                            </span>
                          )}
                          <button
                            type="button"
                            onClick={() => toggleCompare(p)}
                            disabled={!isCompared && compareList.length >= 3}
                            title={isCompared ? "Quitar de comparación" : "Comparar equipo (máx. 3)"}
                            className={`absolute bottom-3 right-3 inline-flex items-center gap-1 border px-2 py-1 font-mono text-[9px] uppercase tracking-wider transition-colors ${
                              isCompared
                                ? "border-accent bg-accent font-bold text-ink"
                                : "border-white/15 bg-ink/80 text-mist hover:border-accent hover:text-accent disabled:opacity-40"
                            }`}
                          >
                            <Scale className="h-3 w-3" />
                            {isCompared ? "En lista" : "Comparar"}
                          </button>
                        </div>

                        <div className="p-5">
                          <div className="flex items-center justify-between text-mist">
                            <span className="font-mono text-[10px] font-semibold tracking-widest text-accent">
                              {p.brand}
                            </span>
                            <span className="font-mono text-[9px] uppercase tracking-wider text-mist/60">
                              {p.sku}
                            </span>
                          </div>

                          <h3 className="mt-1 line-clamp-1 font-display text-xl font-bold uppercase tracking-tight text-fog transition-colors group-hover:text-accent">
                            {p.model}
                          </h3>

                          <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-mist">
                            {p.description}
                          </p>

                          <div className="mt-4 grid grid-cols-2 gap-2 border-t border-white/5 pt-3 font-mono text-[10px]">
                            <div>
                              <span className="block uppercase text-mist/60">Proceso</span>
                              <span className="block truncate font-medium text-fog">{p.process}</span>
                            </div>
                            <div>
                              <span className="block uppercase text-mist/60">Alimentación</span>
                              <span className="block truncate font-medium text-fog">{p.power_supply}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 p-5 pt-0">
                        <button
                          onClick={() => setActiveProduct(p)}
                          className="btn-ghost w-full !px-3 !py-2 text-center !text-[10px]"
                        >
                          Ficha Técnica
                        </button>
                        <a
                          href={waLink(
                            `Hola MAQSYMA, me interesa el equipo:\n` +
                              `📋 ${p.brand} ${p.model}\n` +
                              `⚡ ${p.amperage} · ${p.process}\n` +
                              `🔖 SKU: ${p.sku}\n\n` +
                              `¿Podrían enviarme cotización y disponibilidad?`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-primary inline-flex w-full items-center justify-center gap-1 !px-3 !py-2 text-center !text-[10px]"
                        >
                          Cotizar <ArrowUpRight className="h-3 w-3" />
                        </a>
                      </div>
                    </motion.article>
                  );
                })}
              </AnimatePresence>
            </div>

            {filteredProducts.length === 0 && (
              <div className="my-8 border border-dashed border-white/10 py-20 text-center">
                <p className="font-mono text-sm uppercase tracking-wider text-mist">
                  No se encontraron equipos con los filtros seleccionados.
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
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <FilterPanel
                filters={filters}
                onFilterChange={handleFilterChange}
                productCount={filteredProducts.length}
                totalCount={ESAB_PRODUCTS.length}
                className="border-0 bg-transparent p-0"
              />
              <button
                type="button"
                onClick={() => setShowFiltersMobile(false)}
                className="btn-primary mt-6 w-full !py-2.5 !text-[10px]"
              >
                Ver {filteredProducts.length} equipos
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

function ProductDetailModal({ product: p, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    window.__lenis?.stop();
    return () => {
      window.removeEventListener("keydown", onKey);
      window.__lenis?.start();
    };
  }, [onClose]);

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
            <div className="relative flex aspect-square w-full items-center justify-center border border-white/10 bg-coal/90 p-6">
              <img
                src={p.main_image}
                alt={p.model}
                className="max-h-full max-w-full object-contain filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.8)]"
              />
              <span className="absolute left-3 top-3 bg-accent px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-ink">
                {p.category}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between font-mono text-xs text-mist">
              <span>SKU: {p.sku}</span>
              <span className="flex items-center gap-1 text-accent">
                <Shield className="h-3.5 w-3.5" /> Garantía ESAB
              </span>
            </div>
          </div>

          <div className="flex flex-col justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-accent">
                {p.brand}
              </p>
              <h2 className="mt-1 font-display text-2xl font-black uppercase tracking-tight text-fog sm:text-3xl">
                {p.model}
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-mist">
                {p.description}
              </p>

              <div className="mt-6 divide-y divide-white/5 border-b border-t border-white/10 font-mono text-xs">
                <div className="flex justify-between py-2.5">
                  <span className="text-mist">Proceso:</span>
                  <span className="text-right font-medium text-fog">{p.process}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-mist">Amperaje / Potencia:</span>
                  <span className="text-right font-medium text-accent">{p.amperage}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-mist">Voltaje:</span>
                  <span className="text-right font-medium text-fog">{p.voltage}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-mist">Alimentación:</span>
                  <span className="text-right font-medium text-fog">{p.power_supply}</span>
                </div>
                <div className="flex justify-between py-2.5">
                  <span className="text-mist">Ciclo de Trabajo:</span>
                  <span className="text-right font-medium text-fog">{p.duty_cycle}</span>
                </div>
              </div>

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
                  `Hola MAQSYMA, solicito cotización técnica del equipo:\n` +
                    `📋 ${p.brand} ${p.model}\n` +
                    `⚡ ${p.amperage} · ${p.process}\n` +
                    `🔖 SKU: ${p.sku}`
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary flex w-full items-center justify-center gap-2 !py-3 text-center"
              >
                Solicitar Cotización Inmediata <ArrowUpRight className="h-4 w-4" />
              </a>
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
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
