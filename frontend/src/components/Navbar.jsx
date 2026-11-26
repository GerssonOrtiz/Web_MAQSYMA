import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Logo from "./Logo";
import { scrollToSection } from "../lib/scroll";

const LINKS = [
  { id: "nosotros", label: "Nosotros", type: "section" },
  { id: "maquinas", label: "Destacados", type: "section" },
  { id: "/catalogo", label: "Catálogo", type: "route" },
  { id: "categorias", label: "Categorías", type: "section" },
  { id: "aplicaciones", label: "Aplicaciones", type: "section" },
  { id: "contacto", label: "Contacto", type: "section" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const handleNav = (link) => {
    setOpen(false);
    if (link.type === "route") {
      navigate(link.id);
      return;
    }
    if (location.pathname !== "/") {
      navigate("/", { state: { scrollTo: link.id } });
    } else {
      scrollToSection(link.id);
    }
  };

  const handleBrandClick = () => {
    if (location.pathname !== "/") {
      navigate("/");
    } else if (window.__lenis) {
      window.__lenis.scrollTo(0);
    } else {
      window.scrollTo(0, 0);
    }
  };

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || location.pathname !== "/"
          ? "border-b border-white/10 bg-ink/90 shadow-lg backdrop-blur-md"
          : "bg-transparent"
      }`}
    >
      <nav className="section-head flex h-16 items-center justify-between" aria-label="Principal">
        <button
          onClick={handleBrandClick}
          className="flex items-center gap-3"
          data-testid="nav-brand"
          aria-label="MAQSYMA — inicio"
        >
          <div id="navbar-logo-anchor" className="flex items-center">
            <Logo className="h-8 md:h-9 w-auto" />
          </div>
          <span className="mono-label hidden md:inline text-[9px] pl-3 border-l border-white/10">
            Equipos de soldadura
          </span>
        </button>

        <div className="hidden lg:flex items-center gap-8">
          {LINKS.map((l) => {
            const isActive = l.type === "route" && location.pathname === l.id;
            return (
              <button
                key={l.id}
                onClick={() => handleNav(l)}
                data-testid={`nav-link-${l.id.replace("/", "")}`}
                className={`group relative font-mono text-[11px] uppercase tracking-[0.22em] transition-colors duration-200 ${
                  isActive ? "text-accent" : "text-mist hover:text-fog"
                }`}
              >
                {l.label}
                <span
                  className={`absolute -bottom-1.5 left-0 h-px w-full origin-left bg-accent transition-transform duration-200 ${
                    isActive ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                  }`}
                />
              </button>
            );
          })}
          <span
            className="flex items-center gap-2.5 border border-white/10 px-3.5 py-2"
            data-testid="nav-status"
          >
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-accent animate-ping-soft" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-accent" />
            </span>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-fog/80">
              Atención comercial disponible
            </span>
          </span>
        </div>

        <button
          className="lg:hidden p-2 -mr-2 text-fog"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="mobile-menu"
          aria-label={open ? "Cerrar menú" : "Abrir menú"}
          data-testid="nav-mobile-toggle"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="lg:hidden overflow-hidden border-t border-white/10 bg-ink/95 backdrop-blur-md"
            data-testid="nav-mobile-menu"
          >
            <div className="section-head flex flex-col py-4">
              {LINKS.map((l) => (
                <button
                  key={l.id}
                  onClick={() => handleNav(l)}
                  className="flex items-center justify-between border-b border-white/5 py-4 font-mono text-xs uppercase tracking-[0.22em] text-mist hover:text-fog"
                  data-testid={`nav-mobile-${l.id.replace("/", "")}`}
                >
                  {l.label}
                  <span className="text-accent">→</span>
                </button>
              ))}
              <span className="flex items-center gap-2.5 py-4">
                <span className="h-1.5 w-1.5 rounded-full bg-accent animate-ping-soft" />
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-fog/80">
                  Atención comercial disponible
                </span>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
