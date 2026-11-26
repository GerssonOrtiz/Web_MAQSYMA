import { useNavigate } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

const APPS = [
  {
    name: "Estructuras metálicas",
    rec: "MMA / MIG · 300–500 A",
    filterApp: "estructura",
    img: "https://images.unsplash.com/photo-1509024368907-57294758cfc5?crop=entropy&cs=srgb&fm=jpg&q=85",
  },
  {
    name: "Fabricación industrial",
    rec: "MIG / Multiproceso · 400–500 A",
    filterApp: "industrial",
    img: "https://images.pexels.com/photos/29988963/pexels-photo-29988963.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  },
  {
    name: "Mantenimiento y campo",
    rec: "MMA Inverter · Portátil",
    filterApp: "mantenimiento",
    img: "https://images.pexels.com/photos/28951817/pexels-photo-28951817.jpeg?auto=compress&cs=tinysrgb&h=650&w=940",
  },
  {
    name: "Inoxidable y aluminio",
    rec: "TIG AC/DC · Alta precisión",
    filterApp: "inoxidable",
    img: "https://images.unsplash.com/photo-1493476523860-a6de6ce1b0c3?crop=entropy&cs=srgb&fm=jpg&q=85",
  },
  {
    name: "Minería y calderería",
    rec: "Trabajo pesado · Alto ciclo",
    filterApp: "industrial",
    img: "https://images.unsplash.com/photo-1523848309072-c199db53f137?crop=entropy&cs=srgb&fm=jpg&q=85",
  },
  {
    name: "Talleres profesionales",
    rec: "Multiproceso · 200–350 A",
    filterApp: "taller",
    img: "https://images.unsplash.com/photo-1720036236697-018370867320?crop=entropy&cs=srgb&fm=jpg&q=85",
  },
];

export default function Applications() {
  const navigate = useNavigate();

  return (
    <section
      id="aplicaciones"
      className="border-t border-white/10 py-20 lg:py-28"
      aria-label="Aplicaciones industriales"
    >
      <div className="section-head">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl">
              Aplicaciones <span className="text-accent">por sector</span>
            </h2>
            <p className="mt-3 max-w-xl text-sm text-mist sm:text-base">
              Elige tu rubro de trabajo para ver los equipos ESAB recomendados según proceso y amperaje.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate("/catalogo")}
            className="btn-ghost !px-4 !py-2.5 !text-[10px]"
          >
            Explorar todos los rubros <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {APPS.map((app, i) => (
            <button
              key={app.name}
              type="button"
              onClick={() => navigate(`/catalogo?app=${encodeURIComponent(app.filterApp)}`)}
              data-testid={`application-card-${i}`}
              className="group relative overflow-hidden border border-white/10 bg-coal text-left transition-colors duration-300 hover:border-accent/60"
            >
              <div className="relative aspect-[16/10] overflow-hidden">
                <img
                  src={app.img}
                  alt={`Aplicación de equipos de soldadura: ${app.name}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/55 to-transparent" />
                <span className="absolute right-3 top-3 border border-white/15 bg-ink/75 p-1.5 text-mist transition-colors group-hover:border-accent group-hover:text-accent">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
                <div className="absolute inset-x-4 bottom-4">
                  <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                    {app.rec}
                  </p>
                  <h3 className="mt-1 font-display text-2xl font-bold uppercase tracking-tight text-fog">
                    {app.name}
                  </h3>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
