import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, ArrowUpRight, Check, X, Shield, Zap, Sparkles } from "lucide-react";
import { ESAB_PRODUCTS } from "../data/esabProducts";
import { waLink } from "../lib/scroll";

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
  const [activeProduct, setActiveProduct] = useState(null);

  const filteredProducts = useMemo(() => {
    return ESAB_PRODUCTS.filter((p) => {
      const matchCat = selectedCat === "ALL" || p.category === selectedCat;
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        p.model.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.process.toLowerCase().includes(q) ||
        p.amperage.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [selectedCat, searchQuery]);

  return (
    <section id="tienda" className="relative py-24 sm:py-32 bg-ink/90 border-t border-white/10" aria-label="Catálogo completo de equipos">
      {/* Luz ambiental industrial de fondo */}
      <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 w-full max-w-7xl h-96 bg-[radial-gradient(ellipse_at_top,rgba(255,183,3,0.06),transparent_70%)]" />

      <div className="section-head relative z-10">
        {/* Encabezado de sección */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-white/10">
          <div>
            <p className="mono-label flex items-center gap-3">
              <span className="font-mono text-accent">04</span> Inventario Técnico ESAB
              <span className="h-px w-16 bg-white/10" />
            </p>
            <h2 className="mt-4 font-display text-4xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight">
              Catálogo & <span className="text-accent">Equipos</span>
            </h2>
            <p className="mt-3 text-sm sm:text-base text-mist max-w-xl">
              Explora nuestra gama completa de fuentes de poder, multiprocesos, tecnología láser y alimentadores de alambre originales con respaldo de garantía oficial.
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end gap-2">
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-fog/90">
              <span className="text-accent font-bold">{filteredProducts.length}</span> de {ESAB_PRODUCTS.length} equipos disponibles
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-accent/20 bg-accent/5 font-mono text-[10px] text-accent uppercase tracking-wider">
              <Sparkles className="w-3 h-3" /> Asesoría técnica inmediata
            </span>
          </div>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="mt-8 flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
          {/* Categorías / Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none no-scrollbar">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`whitespace-nowrap px-4 py-2 font-mono text-[11px] uppercase tracking-wider transition-all duration-200 border ${
                  selectedCat === cat.id
                    ? "border-accent bg-accent text-ink font-bold shadow-[0_0_15px_rgba(255,183,3,0.3)]"
                    : "border-white/10 bg-coal/40 text-mist hover:border-white/25 hover:text-fog"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Campo de búsqueda */}
          <div className="relative min-w-[260px] sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-mist" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por modelo, proceso o amperaje..."
              className="w-full bg-coal/70 border border-white/10 pl-10 pr-9 py-2 font-mono text-xs text-fog placeholder:text-mist/50 focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-mist hover:text-fog"
                title="Limpiar búsqueda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Grid de Productos / Equipos */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredProducts.map((p, idx) => (
              <motion.article
                layout
                key={p.id}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.25 }}
                className="group relative flex flex-col justify-between border border-white/10 bg-coal/50 hover:border-accent/50 hover:bg-coal/90 transition-all duration-300 backdrop-blur-sm"
              >
                {/* Imagen del equipo */}
                <div>
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-coal/90 border-b border-white/10 p-5 flex items-center justify-center">
                    <img
                      src={p.main_image}
                      alt={`Equipo ${p.brand} ${p.model}`}
                      loading="lazy"
                      className="max-h-full max-w-full object-contain filter drop-shadow-[0_4px_12px_rgba(0,0,0,0.8)] transition-transform duration-500 group-hover:scale-110"
                    />
                    {/* Badge de Categoría */}
                    <span className="absolute left-3 top-3 border border-white/15 bg-ink/80 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-accent backdrop-blur-sm">
                      {p.category}
                    </span>
                    {/* Badge de Amperaje / Potencia */}
                    {p.amperage && (
                      <span className="absolute right-3 top-3 border border-white/10 bg-coal/90 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-fog/90">
                        {p.amperage}
                      </span>
                    )}
                  </div>

                  {/* Información Técnica */}
                  <div className="p-5">
                    <div className="flex items-center justify-between text-mist">
                      <span className="font-mono text-[10px] tracking-widest text-accent font-semibold">{p.brand}</span>
                      <span className="font-mono text-[9px] tracking-wider uppercase text-mist/60">{p.sku}</span>
                    </div>

                    <h3 className="mt-1 font-display text-xl font-bold uppercase tracking-tight text-fog group-hover:text-accent transition-colors line-clamp-1">
                      {p.model}
                    </h3>

                    <p className="mt-2 text-xs text-mist line-clamp-2 leading-relaxed">
                      {p.description}
                    </p>

                    {/* Especificaciones clave rápidas */}
                    <div className="mt-4 pt-3 border-t border-white/5 grid grid-cols-2 gap-2 text-[10px] font-mono">
                      <div>
                        <span className="text-mist/60 block uppercase">Proceso</span>
                        <span className="text-fog truncate block font-medium">{p.process}</span>
                      </div>
                      <div>
                        <span className="text-mist/60 block uppercase">Alimentación</span>
                        <span className="text-fog truncate block font-medium">{p.power_supply}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setActiveProduct(p)}
                    className="btn-ghost !px-3 !py-2 !text-[10px] w-full text-center"
                  >
                    Ficha Técnica
                  </button>
                  <a
                    href={waLink(`Hola MAQSYMA, deseo cotizar el equipo ${p.brand} ${p.model} (${p.sku}).`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-primary !px-3 !py-2 !text-[10px] w-full text-center inline-flex items-center justify-center gap-1"
                  >
                    Cotizar <ArrowUpRight className="w-3 h-3" />
                  </a>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </div>

        {/* Estado vacío si la búsqueda no arroja resultados */}
        {filteredProducts.length === 0 && (
          <div className="py-20 text-center border border-dashed border-white/10 my-8">
            <p className="font-mono text-sm uppercase tracking-wider text-mist">
              No se encontraron equipos para "<span className="text-fog">{searchQuery}</span>" en {selectedCat}
            </p>
            <button
              onClick={() => { setSelectedCat("ALL"); setSearchQuery(""); }}
              className="mt-4 btn-ghost !px-4 !py-2 !text-xs"
            >
              Restablecer filtros
            </button>
          </div>
        )}
      </div>

      {/* Modal Ficha Técnica Completa */}
      <AnimatePresence>
        {activeProduct && (
          <ProductDetailModal product={activeProduct} onClose={() => setActiveProduct(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}

function ProductDetailModal({ product: p, onClose }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6"
    >
      <div className="absolute inset-0 bg-ink/80 backdrop-blur-md" onClick={onClose} />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-white/15 bg-coal p-6 sm:p-8 shadow-2xl z-10"
      >
        {/* Botón Cerrar */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 p-2 text-mist hover:text-fog hover:bg-white/5 transition-colors"
          title="Cerrar (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Imagen y badges */}
          <div className="flex flex-col">
            <div className="relative aspect-square w-full bg-coal/90 border border-white/10 p-6 flex items-center justify-center">
              <img
                src={p.main_image}
                alt={p.model}
                className="max-h-full max-w-full object-contain filter drop-shadow-[0_8px_20px_rgba(0,0,0,0.8)]"
              />
              <span className="absolute top-3 left-3 px-2 py-0.5 bg-accent text-ink font-mono text-[9px] font-bold uppercase tracking-wider">
                {p.category}
              </span>
            </div>

            <div className="mt-4 flex items-center justify-between font-mono text-xs text-mist">
              <span>SKU: {p.sku}</span>
              <span className="text-accent flex items-center gap-1">
                <Shield className="w-3.5 h-3.5" /> Garantía ESAB
              </span>
            </div>
          </div>

          {/* Especificaciones completas */}
          <div className="flex flex-col justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-accent">{p.brand}</p>
              <h2 className="mt-1 font-display text-2xl sm:text-3xl font-black uppercase text-fog tracking-tight">
                {p.model}
              </h2>
              <p className="mt-3 text-sm text-mist leading-relaxed">{p.description}</p>

              {/* Tabla de atributos técnicos */}
              <div className="mt-6 border-t border-b border-white/10 divide-y divide-white/5 font-mono text-xs">
                <div className="py-2.5 flex justify-between">
                  <span className="text-mist">Proceso:</span>
                  <span className="text-fog font-medium text-right">{p.process}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-mist">Amperaje / Potencia:</span>
                  <span className="text-accent font-medium text-right">{p.amperage}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-mist">Voltaje:</span>
                  <span className="text-fog font-medium text-right">{p.voltage}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-mist">Alimentación:</span>
                  <span className="text-fog font-medium text-right">{p.power_supply}</span>
                </div>
                <div className="py-2.5 flex justify-between">
                  <span className="text-mist">Ciclo de Trabajo:</span>
                  <span className="text-fog font-medium text-right">{p.duty_cycle}</span>
                </div>
              </div>

              {/* Características destacadas */}
              {p.features && p.features.length > 0 && (
                <div className="mt-5">
                  <p className="font-mono text-[11px] uppercase tracking-wider text-fog/80 mb-2">Destacados:</p>
                  <ul className="space-y-1.5 text-xs text-mist">
                    {p.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-accent mt-0.5 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* CTAs */}
            <div className="mt-8 pt-4 border-t border-white/10 flex flex-col sm:flex-row gap-3">
              <a
                href={waLink(`Hola MAQSYMA, solicito cotización técnica del equipo ${p.brand} ${p.model} (${p.sku}).`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary !py-3 w-full text-center flex items-center justify-center gap-2"
              >
                Solicitar Cotización Inmediata <ArrowUpRight className="w-4 h-4" />
              </a>
              {p.datasheet_url && (
                <a
                  href={p.datasheet_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-ghost !py-3 w-full text-center"
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
