import Logo from "./Logo";
import { WA_DEFAULT, WHATSAPP_DISPLAY, scrollToSection } from "../lib/scroll";

const LINKS = [
  ["Máquinas", "maquinas"],
  ["Categorías", "categorias"],
  ["Aplicaciones", "aplicaciones"],
  ["Contacto", "contacto"],
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-coal/40">
      <div className="section-head py-14">
        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="lg:col-span-6">
            <div className="flex items-center gap-3">
              <Logo className="h-9 w-auto" />
            </div>
            <p className="mt-4 max-w-sm font-mono text-[10px] uppercase leading-relaxed tracking-[0.18em] text-mist">
              Showroom digital de máquinas de soldar, equipos de corte y accesorios para soldadores,
              talleres e industria.
            </p>
          </div>

          <nav className="lg:col-span-3" aria-label="Pie de página">
            <p className="mono-label">Navegación</p>
            <ul className="mt-4 space-y-2.5">
              {LINKS.map(([label, id]) => (
                <li key={id}>
                  <button
                    onClick={() => scrollToSection(id)}
                    className="font-mono text-[11px] uppercase tracking-[0.2em] text-mist transition-colors duration-200 hover:text-accent"
                    data-testid={`footer-link-${id}`}
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <div className="lg:col-span-3">
            <p className="mono-label">Contacto directo</p>
            <ul className="mt-4 space-y-2.5 font-mono text-[11px] uppercase tracking-[0.16em] text-mist">
              <li>
                <a
                  href={WA_DEFAULT}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="transition-colors duration-200 hover:text-accent"
                  data-testid="footer-whatsapp"
                >
                  WhatsApp {WHATSAPP_DISPLAY}
                </a>
              </li>
              <li>[correo] — por confirmar</li>
              <li>[ubicación] — por confirmar</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist/70">
            © {new Date().getFullYear()} MAQSYMA — Todos los derechos reservados
          </p>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-mist/70">
            Catálogo administrable vía base de datos · V1
          </p>
        </div>
      </div>
    </footer>
  );
}
