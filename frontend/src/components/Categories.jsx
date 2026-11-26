import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { ESAB_PRODUCTS } from "../data/esabProducts";

const CATS = [
  {
    id: "MMA",
    name: "MMA",
    desc: "Electrodo revestido: equipos robustos y simples para obra, estructura y mantenimiento en campo.",
    meta: "Proceso / Electrodo revestido",
    app: "Obra · Estructura · Mantenimiento",
    img: "https://images.unsplash.com/photo-1641893823219-38b433f736c0?crop=entropy&cs=srgb&fm=jpg&q=85",
  },
  {
    id: "MIG / MAG",
    name: "MIG / MAG",
    desc: "Arco bajo gas protector con alambre: alta productividad para fabricación y producción continua.",
    meta: "Proceso / Arco bajo gas protector",
    app: "Fabricación · Producción en serie",
    img: "https://images.pexels.com/photos/5846282/pexels-photo-5846282.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  },
  {
    id: "TIG",
    name: "TIG",
    desc: "Máxima precisión y acabado de calidad en acero inoxidable, aluminio y trabajos exigentes.",
    meta: "Proceso / Arco de tungsteno",
    app: "Inox · Aluminio · Acabado fino",
    img: "https://images.unsplash.com/photo-1707064892275-a3088e8240be?crop=entropy&cs=srgb&fm=jpg&q=85",
  },
  {
    id: "MULTIPROCESO",
    name: "Multiproceso",
    desc: "Una sola plataforma, varios procesos: flexibilidad total para el taller que trabaja de todo.",
    meta: "MMA + TIG + MIG según modelo",
    app: "Taller general · Industria pesada",
    img: "https://images.unsplash.com/photo-1564182842834-681b7be6de4b?crop=entropy&cs=srgb&fm=jpg&q=85",
  },
  {
    id: "LÁSER",
    name: "Soldadura Láser",
    desc: "Alta velocidad de unión con mínima distorsión térmica y acabado limpio para manufactura avanzada.",
    meta: "Tecnología / Láser de fibra",
    app: "Manufactura · Chapa fina · Precisión",
    img: "https://images.unsplash.com/photo-1735494033576-9c882e80504c?crop=entropy&cs=srgb&fm=jpg&q=85",
  },
  {
    id: "ALIMENTADORES",
    name: "Alimentadores",
    desc: "Alimentadores de alambre portátiles e industriales diseñados para sincronizarse con fuentes ESAB.",
    meta: "Accesorios / Alimentación de alambre",
    app: "Producción · Astilleros · Estructuras",
    img: "https://images.pexels.com/photos/36003975/pexels-photo-36003975.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  },
];

export default function Categories() {
  const [active, setActive] = useState(0);
  const navigate = useNavigate();
  const cat = CATS[active];

  const matchingModels = ESAB_PRODUCTS.filter((p) => p.category === cat.id);

  const goToCategory = (categoryId) => {
    navigate(`/catalogo?categoria=${encodeURIComponent(categoryId)}`);
  };

  return (
    <section id="categorias" className="py-20 lg:py-28" aria-label="Categorías y selector de procesos">
      <div className="section-head">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl">
            Explora por <span className="text-accent">proceso</span>
          </h2>
          <button
            type="button"
            onClick={() => navigate("/catalogo")}
            className="btn-ghost !px-4 !py-2.5 !text-[10px]"
          >
            Ver todo el catálogo ({ESAB_PRODUCTS.length}) <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7" data-testid="categories-list">
            {CATS.map((c, i) => {
              const count = ESAB_PRODUCTS.filter((p) => p.category === c.id).length;
              return (
                <div
                  key={c.id}
                  className="group border-b border-white/10 first:border-t"
                >
                  <button
                    type="button"
                    onMouseEnter={() => setActive(i)}
                    onFocus={() => setActive(i)}
                    onClick={() => {
                      if (active === i) goToCategory(c.id);
                      else setActive(i);
                    }}
                    data-testid={`category-row-${c.id}`}
                    aria-pressed={active === i}
                    className="flex w-full items-center gap-5 py-5 text-left sm:gap-7 lg:py-6"
                  >
                    <span
                      className={`font-mono text-xs tabular-nums transition-colors duration-200 ${
                        active === i ? "text-accent" : "text-mist/60"
                      }`}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span
                      className={`font-display text-3xl font-bold uppercase tracking-tight transition-all duration-200 sm:text-4xl lg:text-5xl ${
                        active === i ? "translate-x-2 text-fog" : "text-mist/55 group-hover:text-fog"
                      }`}
                    >
                      {c.name}
                    </span>
                    <span className="ml-auto flex items-center gap-3">
                      <span className="hidden font-mono text-[10px] uppercase tracking-wider text-mist/60 sm:inline">
                        {count} {count === 1 ? "equipo" : "equipos"}
                      </span>
                      <ArrowUpRight
                        size={20}
                        className={`shrink-0 transition-colors duration-200 ${
                          active === i ? "text-accent" : "text-mist/40"
                        }`}
                      />
                    </span>
                  </button>

                  {/* Vista móvil expandible */}
                  <div className="lg:hidden">
                    <AnimatePresence initial={false}>
                      {active === i && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: "easeOut" }}
                          className="overflow-hidden pb-5"
                        >
                          <div className="overflow-hidden border border-white/10 bg-coal">
                            <img
                              src={c.img}
                              alt={`Categoría ${c.name}`}
                              className="aspect-[16/9] w-full object-cover"
                            />
                          </div>
                          <p className="mt-3 text-sm leading-relaxed text-mist">{c.desc}</p>
                          <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                            {c.app}
                          </p>
                          <button
                            type="button"
                            onClick={() => goToCategory(c.id)}
                            className="btn-primary mt-4 w-full !py-2.5 !text-[10px]"
                          >
                            Ver {count} equipos {c.name} →
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Panel derecho en desktop */}
          <div className="hidden lg:col-span-5 lg:block">
            <div className="sticky top-24 border border-white/10 bg-coal/50 p-6" data-testid="category-preview">
              <div className="relative aspect-[16/10] overflow-hidden border border-white/10 bg-coal">
                <AnimatePresence mode="popLayout">
                  <motion.img
                    key={cat.id}
                    src={cat.img}
                    alt={`Categoría ${cat.name}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </AnimatePresence>
                <span className="mono-label absolute left-3 top-3 bg-ink/75 px-2.5 py-1 backdrop-blur-sm">
                  {String(active + 1).padStart(2, "0")} / {String(CATS.length).padStart(2, "0")}
                </span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className="mt-4 text-sm leading-relaxed text-mist">{cat.desc}</p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                    {cat.app}
                  </p>

                  {matchingModels.length > 0 && (
                    <div className="mt-5 border-t border-white/10 pt-4">
                      <p className="font-mono text-[10px] uppercase tracking-wider text-mist/80">
                        Equipos disponibles ({matchingModels.length})
                      </p>
                      <ul className="mt-2.5 space-y-1.5">
                        {matchingModels.slice(0, 3).map((m) => (
                          <li
                            key={m.id}
                            className="flex items-center justify-between border-b border-white/5 pb-1.5 font-mono text-xs"
                          >
                            <span className="text-fog">{m.model}</span>
                            <span className="text-[10px] text-accent">{m.amperage}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => goToCategory(cat.id)}
                    className="btn-primary mt-5 w-full !py-3 !text-[10px]"
                  >
                    Ver equipos {cat.name} en catálogo <ArrowUpRight className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
