import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowUpRight } from "lucide-react";
import { scrollToSection } from "../lib/scroll";

const CATS = [
  {
    id: "mma",
    name: "MMA",
    desc: "Electrodo revestido: equipos robustos y simples para obra, estructura y mantenimiento en campo.",
    meta: "Proceso / Electrodo revestido",
    img: "https://images.unsplash.com/photo-1641893823219-38b433f736c0?crop=entropy&cs=srgb&fm=jpg&q=85",
  },
  {
    id: "mig",
    name: "MIG / MAG",
    desc: "Arco bajo gas protector con alambre: alta productividad para fabricación y producción continua.",
    meta: "Proceso / Arco bajo gas protector",
    img: "https://images.pexels.com/photos/5846282/pexels-photo-5846282.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  },
  {
    id: "tig",
    name: "TIG",
    desc: "Máxima precisión y acabado de calidad en acero inoxidable, aluminio y trabajos exigentes.",
    meta: "Proceso / Arco de tungsteno",
    img: "https://images.unsplash.com/photo-1707064892275-a3088e8240be?crop=entropy&cs=srgb&fm=jpg&q=85",
  },
  {
    id: "plasma",
    name: "Corte Plasma",
    desc: "Corte rápido de chapa y perfil con una zona afectada mínima y bordes limpios.",
    meta: "Proceso / Arco de plasma",
    img: "https://images.unsplash.com/photo-1735494033576-9c882e80504c?crop=entropy&cs=srgb&fm=jpg&q=85",
  },
  {
    id: "multiproceso",
    name: "Multiproceso",
    desc: "Una sola plataforma, varios procesos: flexibilidad total para el taller que trabaja de todo.",
    meta: "MMA + TIG + MIG según modelo",
    img: "https://images.unsplash.com/photo-1564182842834-681b7be6de4b?crop=entropy&cs=srgb&fm=jpg&q=85",
  },
  {
    id: "accesorios",
    name: "Accesorios",
    desc: "Antorchas, cables, reguladores, consumibles y protección para acompañar cada equipo.",
    meta: "Compatibilidad / Según marca y modelo",
    img: "https://images.pexels.com/photos/36003975/pexels-photo-36003975.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  },
];

export default function Categories() {
  const [active, setActive] = useState(0);
  const cat = CATS[active];

  return (
    <section id="categorias" className="py-24 lg:py-36" aria-label="Categorías de productos">
      <div className="section-head">
        <p className="mono-label flex items-center gap-3">
          <span className="font-mono text-accent">02</span> Catálogo
          <span className="h-px flex-1 bg-white/10" />
        </p>
        <h2 className="mt-6 font-display text-5xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
          Explora nuestros <span className="text-accent">equipos</span>
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div
            className="lg:col-span-7"
            onMouseLeave={() => setActive(active)}
            data-testid="categories-list"
          >
            {CATS.map((c, i) => (
              <button
                key={c.id}
                onMouseEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onClick={() => setActive(i)}
                data-testid={`category-row-${c.id}`}
                aria-pressed={active === i}
                className="group block w-full border-b border-white/10 py-6 text-left first:border-t lg:py-7"
              >
                <div className="flex items-baseline gap-5 sm:gap-7">
                  <span
                    className={`font-mono text-xs tabular-nums transition-colors duration-200 ${active === i ? "text-accent" : "text-mist/60"}`}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`font-display text-4xl font-bold uppercase tracking-tight transition-all duration-200 sm:text-5xl lg:text-6xl ${
                      active === i ? "translate-x-2 text-fog" : "text-mist/50 group-hover:text-fog"
                    }`}
                  >
                    {c.name}
                  </span>
                  <ArrowUpRight
                    size={20}
                    className={`ml-auto shrink-0 transition-colors duration-200 ${active === i ? "text-accent" : "text-mist/40"}`}
                  />
                </div>

                <div className="mt-3 lg:hidden">
                  <AnimatePresence initial={false}>
                    {active === i && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                        className="overflow-hidden"
                      >
                        <div className="mt-2 overflow-hidden border border-white/10 bg-coal">
                          <img
                            src={c.img}
                            alt={`Categoría ${c.name}`}
                            className="aspect-[16/9] w-full object-cover"
                          />
                        </div>
                        <p className="mt-3 max-w-md text-sm leading-relaxed text-mist">{c.desc}</p>
                        <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                          {c.meta}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </button>
            ))}
          </div>

          <div className="hidden lg:col-span-5 lg:block">
            <div className="sticky top-28" data-testid="category-preview">
              <div className="relative aspect-[4/3] overflow-hidden border border-white/10 bg-coal">
                <AnimatePresence mode="popLayout">
                  <motion.img
                    key={cat.id}
                    src={cat.img}
                    alt={`Categoría ${cat.name}`}
                    initial={{ opacity: 0, y: 28 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </AnimatePresence>
                <span className="mono-label absolute left-4 top-4 bg-ink/50 px-2 py-1 backdrop-blur-sm">
                  {String(active + 1).padStart(2, "0")} / {String(CATS.length).padStart(2, "0")}
                </span>
              </div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.28 }}
                >
                  <p className="mt-5 max-w-md text-sm leading-relaxed text-mist">{cat.desc}</p>
                  <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
                    {cat.meta}
                  </p>
                  {["MMA", "MIG / MAG", "TIG", "MULTIPROCESO"].includes(cat.name.toUpperCase()) && (
                    <button
                      type="button"
                      onClick={() => {
                        scrollToSection("tienda");
                        window.dispatchEvent(
                          new CustomEvent("filter-category", {
                            detail: cat.name.toUpperCase(),
                          })
                        );
                      }}
                      className="btn-ghost mt-4 !px-3 !py-1.5 !text-[10px]"
                    >
                      Ver equipos {cat.name} →
                    </button>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
