import { useLocation, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import { WA_DEFAULT, WHATSAPP_DISPLAY, scrollToSection } from "../lib/scroll";

const LINKS = [
  ["Catálogo completo", "/catalogo", "route"],
  ["Nosotros", "nosotros", "section"],
  ["Destacados", "maquinas", "section"],
  ["Categorías", "categorias", "section"],
  ["Aplicaciones", "aplicaciones", "section"],
  ["Contacto", "contacto", "section"],
];

export default function Footer() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLink = (target, type) => {
    if (type === "route") {
      navigate(target);
      return;
    }
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: target } });
    } else {
      scrollToSection(target);
    }
  };
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
              {LINKS.map(([label, id, type]) => (
                <li key={id}>
                  <button
                    onClick={() => handleLink(id, type)}
                    className="font-mono text-[11px] uppercase tracking-[0.2em] text-mist transition-colors duration-200 hover:text-accent"
                    data-testid={`footer-link-${id.replace("/", "")}`}
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
              <li>
                <a
                  href="tel:+51957082739"
                  className="transition-colors duration-200 hover:text-accent"
                >
                  Tel. 957 082 739
                </a>
              </li>
              <li>
                <a
                  href="mailto:ventas@maqsyma.com"
                  className="lowercase transition-colors duration-200 hover:text-accent"
                >
                  ventas@maqsyma.com
                </a>
              </li>
              <li>Av. Venezuela 866</li>
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
