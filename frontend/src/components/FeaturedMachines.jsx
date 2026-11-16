import { useEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "framer-motion";
import { X } from "lucide-react";
import { waLink } from "../lib/scroll";
import { supabase } from "../lib/supabase";

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const Z_GAP = 850;
const X_PATTERN = [0, 7, -6, 5, -5, 6, -4, 4];

const spec = (p, key) => p[key]?.trim() || "SEGÚN MODELO";
const mqCode = (i) => `MQ—${String(i + 1).padStart(3, "0")}`;

const FALLBACK_PRODUCTS = [
  {
    id: "1",
    brand: "ESAB",
    model: "WARRIOR 500i",
    category: "MMA",
    process: "MMA / TIG",
    main_image: "https://static.prod-images.emergentagent.com/jobs/0367909c-413c-4cc9-aff8-b7b2180f8e4b/images/f42f788aa23b25155a6e843d3b5d79bba0dc6721df8e4e93d9259061ac54e938.jpeg",
    description: "Equipo profesional de ejemplo (dato conceptual del briefing). Registro preparado para ser reemplazado por el producto real.",
    amperage: "500 A",
    voltage: "380 V",
    power_supply: "TRIFÁSICA 380 V",
    duty_cycle: "",
    applications: ["INDUSTRIAL"],
    features: ["Registro de ejemplo — carga aquí las características reales"],
    sku: "EJEMPLO-500I",
    sort_order: 0,
  },
  {
    id: "2",
    brand: "EJEMPLO",
    model: "INVERTER MIG 250",
    category: "MIG / MAG",
    process: "MIG / MAG",
    main_image: "https://static.prod-images.emergentagent.com/jobs/0367909c-413c-4cc9-aff8-b7b2180f8e4b/images/9d58211ac3517cb43e551f11609bedce3aaeabb5483e6fc6b6bad4eacbe2442b.jpeg",
    description: "Producto de ejemplo para demostrar la estructura del catálogo. Reemplaza marca, modelo, especificaciones e imágenes.",
    amperage: "250 A",
    voltage: "220 V",
    power_supply: "MONOFÁSICA 220 V",
    duty_cycle: "",
    applications: ["TALLER", "FABRICACIÓN"],
    features: ["Registro de ejemplo — carga aquí las características reales"],
    sku: "EJEMPLO-MIG250",
    sort_order: 1,
  },
  {
    id: "3",
    brand: "EJEMPLO",
    model: "TIG AC/DC 200",
    category: "TIG",
    process: "TIG",
    main_image: "https://static.prod-images.emergentagent.com/jobs/0367909c-413c-4cc9-aff8-b7b2180f8e4b/images/71b9e7b9a5586122d8b27f6800ef79bbeba6bd11ee91d599f33d0f0946731756.jpeg",
    description: "Producto de ejemplo para el proceso TIG. La ficha real se carga desde la colección de productos.",
    amperage: "200 A",
    voltage: "220 V",
    power_supply: "MONOFÁSICA 220 V",
    duty_cycle: "",
    applications: ["INOX", "ALUMINIO"],
    features: ["Registro de ejemplo — carga aquí las características reales"],
    sku: "EJEMPLO-TIG200",
    sort_order: 2,
  },
  {
    id: "4",
    brand: "EJEMPLO",
    model: "CORTE PLASMA 60",
    category: "CORTE PLASMA",
    process: "PLASMA",
    main_image: "https://static.prod-images.emergentagent.com/jobs/0367909c-413c-4cc9-aff8-b7b2180f8e4b/images/35ff09b017256acde509405867c323a6154292ce431c889f7f0481c6c0be1f8d.jpeg",
    description: "Producto de ejemplo para equipos de corte plasma. Sustitúyelo por el equipo real.",
    amperage: "60 A",
    voltage: "220 V",
    power_supply: "MONOFÁSICA 220 V",
    duty_cycle: "",
    applications: ["CORTE DE CHAPA"],
    features: ["Registro de ejemplo — carga aquí las características reales"],
    sku: "EJEMPLO-PLASMA60",
    sort_order: 3,
  },
];

function useProducts() {
  const [products, setProducts] = useState(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;

    async function fetchProducts() {
      // 1. Prioridad: Consulta a Supabase si está configurado
      if (supabase) {
        try {
          const { data, error: supaError } = await supabase
            .from("products")
            .select("*")
            .order("sort_order", { ascending: true });

          if (!supaError && data && data.length > 0) {
            if (alive) setProducts(data);
            return;
          }
        } catch (e) {
          console.warn("Supabase fetch failed, trying API fallback", e);
        }
      }

      // 2. Segunda opción: Backend API REST local
      try {
        const r = await fetch(`${API}/products`);
        if (r.ok) {
          const data = await r.json();
          if (alive && data?.length > 0) {
            setProducts(data);
            return;
          }
        }
      } catch (e) {
        console.warn("Backend API not reachable, using fallback catalog", e);
      }

      // 3. Respaldo garantizado: Productos iniciales
      if (alive) {
        setProducts(FALLBACK_PRODUCTS);
      }
    }

    fetchProducts();

    return () => {
      alive = false;
    };
  }, []);

  return { products, error };
}

/* ---------- Ficha técnica (especificaciones reales del catálogo) ---------- */

function SpecSheet({ p, index, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    window.__lenis?.stop();
    return () => {
      window.removeEventListener("keydown", onKey);
      window.__lenis?.start();
    };
  }, [onClose]);

  const rows = [
    ["Código", mqCode(index)],
    ["Proceso", p.process],
    ["Categoría", p.category],
    ["Amperaje", spec(p, "amperage")],
    ["Voltaje", spec(p, "voltage")],
    ["Alimentación", spec(p, "power_supply")],
    ["Factor de trabajo", spec(p, "duty_cycle")],
    ["SKU", p.sku || "POR CONFIRMAR"],
    ["Precio", p.price || "POR COTIZAR"],
    ["Disponibilidad", p.availability || "POR CONFIRMAR"],
  ];

  return (
    <motion.div
      className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className="absolute inset-0 bg-ink/85 backdrop-blur-sm"
        onClick={onClose}
        data-testid="spec-sheet-backdrop"
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={`Ficha técnica ${p.brand} ${p.model}`}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
        className="relative max-h-[86vh] w-full max-w-2xl overflow-y-auto border border-white/15 bg-coal p-6 sm:p-8"
        data-testid="spec-sheet"
        data-lenis-prevent
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">{p.brand}</p>
            <h3 className="mt-2 font-display text-4xl font-extrabold uppercase leading-none tracking-tight">
              {p.model}
            </h3>
            <p className="mt-2 font-mono text-[10px] tabular-nums text-mist">{mqCode(index)}</p>
          </div>
          <button
            autoFocus
            onClick={onClose}
            aria-label="Cerrar ficha"
            className="border border-white/15 p-2 text-mist transition-colors duration-200 hover:border-accent hover:text-accent"
            data-testid="spec-sheet-close"
          >
            <X size={16} />
          </button>
        </div>

        <p className="mt-5 text-sm leading-relaxed text-mist">{p.description}</p>

        <dl className="mt-6 grid grid-cols-1 gap-px border border-white/10 bg-white/10 sm:grid-cols-2">
          {rows.map(([k, v]) => (
            <div key={k} className="bg-coal px-4 py-3">
              <dt className="font-mono text-[9px] uppercase tracking-[0.2em] text-mist">{k}</dt>
              <dd className="mt-1 font-mono text-xs uppercase text-fog">{v}</dd>
            </div>
          ))}
        </dl>

        {p.applications?.length > 0 && (
          <div className="mt-6">
            <p className="mono-label">Aplicaciones</p>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {p.applications.map((a) => (
                <span
                  key={a}
                  className="border border-white/15 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-fog/85"
                >
                  {a}
                </span>
              ))}
            </div>
          </div>
        )}

        {p.features?.length > 0 && (
          <div className="mt-6">
            <p className="mono-label">Características</p>
            <ul className="mt-2.5 space-y-1.5">
              {p.features.map((f) => (
                <li key={f} className="text-sm text-fog/85">
                  — {f}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 border-t border-white/10 pt-6 sm:flex-row">
          <a
            className="btn-primary"
            href={p.quote_url || waLink(`Hola MAQSYMA, quiero cotizar ${p.brand} ${p.model} (${mqCode(index)}).`)}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="spec-sheet-quote"
          >
            Solicitar cotización <span aria-hidden="true">→</span>
          </a>
          {p.datasheet_url ? (
            <a className="btn-ghost" href={p.datasheet_url} target="_blank" rel="noopener noreferrer">
              Ficha técnica (PDF)
            </a>
          ) : (
            <span className="inline-flex items-center font-mono text-[10px] uppercase tracking-[0.2em] text-mist/70">
              Ficha técnica PDF / por publicar
            </span>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}

/* ---------- Info band (compartida) ---------- */

function InfoBand({ p, index, onSpec, tabIndex }) {
  return (
    <>
      <div className="flex items-baseline justify-between gap-4">
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-accent">{p.brand}</p>
          <h3 className="mt-1 font-display text-3xl font-extrabold uppercase leading-none tracking-tight sm:text-4xl">
            {p.model}
          </h3>
        </div>
        <span className="font-mono text-[10px] tabular-nums text-mist">{mqCode(index)}</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 border-t border-white/10 pt-3 sm:grid-cols-4">
        {[
          ["Categoría", p.category],
          ["Proceso", p.process],
          ["Amperaje", spec(p, "amperage")],
          ["Voltaje", spec(p, "voltage")],
        ].map(([k, v]) => (
          <div key={k}>
            <p className="font-mono text-[8px] uppercase tracking-[0.2em] text-mist">{k}</p>
            <p className="mt-0.5 font-mono text-[11px] uppercase text-fog/90">{v}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-mist sm:text-sm">{p.description}</p>
      <div className="mt-4 flex flex-col gap-2.5 sm:flex-row">
        <button
          className="btn-primary !px-5 !py-3 !text-[10px]"
          onClick={() => onSpec(p, index)}
          tabIndex={tabIndex}
          data-testid={`machine-specs-${index}`}
        >
          Ver especificaciones
        </button>
        <a
          className="btn-ghost !px-5 !py-3 !text-[10px]"
          href={p.quote_url || waLink(`Hola MAQSYMA, quiero cotizar ${p.brand} ${p.model} (${mqCode(index)}).`)}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={tabIndex}
          data-testid={`machine-quote-${index}`}
        >
          Solicitar cotización
        </a>
      </div>
    </>
  );
}

/* ---------- Escena 3D ligada al scroll ---------- */

function HollowFrame({ index, total, progress }) {
  const d = useTransform(progress, (v) => index + 1.5 - v * (total + 1));
  const z = useTransform(d, (v) => -v * Z_GAP);
  const opacity = useTransform(d, [-0.45, 0.1, 1.1, 1.9], [0, 0.35, 0.28, 0]);
  const xPct = useTransform(d, () => `${X_PATTERN[(index + 1) % X_PATTERN.length] / 2}%`);
  const transform = useMotionTemplate`translate(-50%, -50%) translate3d(${xPct}, 0, ${z}px)`;
  return (
    <motion.div
      aria-hidden="true"
      style={{ transform, opacity }}
      className="pointer-events-none absolute left-1/2 top-1/2 w-[min(62vw,580px)] will-change-transform"
    >
      <div className="relative aspect-[16/10] border border-white/5">
        <span className="absolute left-0 top-0 h-3 w-3 border-l border-t border-white/15" />
        <span className="absolute bottom-0 right-0 h-3 w-3 border-b border-r border-white/15" />
      </div>
    </motion.div>
  );
}

function MachineCard({ p, index, total, progress, active, onSpec }) {
  const d = useTransform(progress, (v) => index + 1 - v * (total + 1));
  const z = useTransform(d, (v) => -v * Z_GAP);
  const xPct = useTransform(d, () => `${X_PATTERN[index % X_PATTERN.length]}%`);
  const opacity = useTransform(d, [-0.5, -0.12, 1.25, 2.1], [0, 1, 1, 0]);
  const veil = useTransform(d, [-0.6, 0, 1.5], [0.45, 0, 0.75]);
  const infoOpacity = useTransform(d, [-0.35, 0, 0.45, 0.95], [0, 1, 1, 0]);

  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 130, damping: 18 });
  const sry = useSpring(ry, { stiffness: 130, damping: 18 });
  const [glare, setGlare] = useState({ x: 50, y: 35, on: false });

  const transform = useMotionTemplate`translate(-50%, -50%) translate3d(${xPct}, 0, ${z}px) rotateX(${srx}deg) rotateY(${sry}deg)`;

  const onMove = (e) => {
    if (!active || !window.matchMedia("(pointer: fine)").matches) return;
    const r = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    ry.set((px - 0.5) * 4);
    rx.set(-(py - 0.5) * 4);
    setGlare({ x: px * 100, y: py * 100, on: true });
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
    setGlare((g) => ({ ...g, on: false }));
  };

  return (
    <motion.div
      style={{ transform, opacity, pointerEvents: active ? "auto" : "none" }}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="absolute left-1/2 top-[55%] w-[min(70vw,660px)] will-change-transform"
      data-testid={`machine-frame-${index}`}
      aria-hidden={!active}
    >
      <div className="relative aspect-[16/10] overflow-hidden border border-white/15 bg-coal">
        <img
          src={p.main_image}
          alt={`Máquina de soldar ${p.brand} ${p.model}`}
          className="h-full w-full object-cover"
        />
        <motion.div style={{ opacity: veil }} className="pointer-events-none absolute inset-0 bg-ink" />
        <div
          className="pointer-events-none absolute inset-0 transition-opacity duration-300"
          style={{
            opacity: glare.on ? 0.6 : 0,
            background: `radial-gradient(300px at ${glare.x}% ${glare.y}%, rgba(255,255,255,0.10), transparent 65%)`,
          }}
        />
        {p.is_example && (
          <span className="absolute left-3 top-3 border border-accent/50 bg-ink/60 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-accent backdrop-blur-sm">
            Ejemplo
          </span>
        )}
        <span className="absolute right-3 top-3 bg-ink/50 px-2 py-1 font-mono text-[9px] tabular-nums text-fog/80 backdrop-blur-sm">
          {mqCode(index)}
        </span>
        <span className="absolute bottom-3 left-3 h-4 w-4 border-b border-l border-white/40" />
        <span className="absolute bottom-3 right-3 h-4 w-4 border-b border-r border-white/40" />
      </div>
      <motion.div
        style={{ opacity: infoOpacity }}
        className="border border-t-0 border-white/15 bg-ink/95 px-5 py-4 sm:px-6"
      >
        <InfoBand p={p} index={index} onSpec={onSpec} tabIndex={active ? 0 : -1} />
      </motion.div>
    </motion.div>
  );
}

function Tunnel({ products, onSpec }) {
  const ref = useRef(null);
  const total = products.length;
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [current, setCurrent] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const i = Math.min(total - 1, Math.max(0, Math.round(v * (total + 1) - 1)));
    setCurrent((c) => (c === i ? c : i));
  });

  return (
    <div
      ref={ref}
      className="relative"
      style={{ height: `${(total + 2) * 100}vh` }}
      data-testid="machines-tunnel"
    >
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="absolute inset-x-0 top-0 z-20 pt-24">
          <div className="section-head flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="mono-label flex items-center gap-3">
                <span className="font-mono text-accent">03</span> Catálogo
                <span className="h-px w-16 bg-white/10" />
              </p>
              <h2 className="mt-3 font-display text-4xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-5xl lg:text-6xl">
                Máquinas <span className="text-accent">seleccionadas</span>
              </h2>
            </div>
            <div className="text-right">
              <p className="font-mono text-[11px] tabular-nums text-fog/80" data-testid="machines-counter">
                {String(total).padStart(2, "0")} UNIDADES EN EXHIBICIÓN
              </p>
              <p className="mono-label mt-1.5 flex items-center justify-end gap-2">
                Desplázate para explorar <span className="text-accent">↓</span>
              </p>
            </div>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div className="h-[72vmin] w-[72vmin] rounded-full bg-[radial-gradient(circle,rgba(0,230,118,0.055),transparent_62%)]" />
          <span className="absolute h-3 w-px bg-white/20" />
          <span className="absolute h-px w-3 bg-white/20" />
        </div>

        <div
          className="absolute inset-0"
          style={{ perspective: "1100px", transformStyle: "preserve-3d" }}
        >
          {products.slice(0, -1).map((_, i) => (
            <HollowFrame key={`hollow-${i}`} index={i} total={total} progress={scrollYProgress} />
          ))}
          {products.map((p, i) => (
            <MachineCard
              key={p.id ?? i}
              p={p}
              index={i}
              total={total}
              progress={scrollYProgress}
              active={current === i}
              onSpec={onSpec}
            />
          ))}
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 pb-7">
          <div className="section-head">
            <div className="flex items-center gap-4 border-t border-white/10 pt-4">
              <span className="font-mono text-sm tabular-nums text-accent" data-testid="machines-current">
                {String(current + 1).padStart(2, "0")}
              </span>
              <span className="font-mono text-[10px] text-mist">/ {String(total).padStart(2, "0")}</span>
              <span className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-fog sm:inline">
                {products[current]?.model}
              </span>
              <span className="relative h-px flex-1 bg-white/10">
                <motion.span
                  style={{ scaleX: scrollYProgress }}
                  className="absolute inset-0 origin-left bg-accent"
                  data-testid="machines-progress"
                />
              </span>
              <span className="mono-label hidden sm:inline">Explorando catálogo</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------- Alternativa vertical (móvil y movimiento reducido) ---------- */

function MachineStatic({ p, index, onSpec }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="grid grid-cols-1 gap-6 border-t border-white/10 py-12 sm:grid-cols-2 sm:gap-8"
      data-testid={`machine-row-${index}`}
    >
      <div className="relative aspect-[4/3] overflow-hidden border border-white/10 bg-coal">
        <img
          src={p.main_image}
          alt={`Máquina de soldar ${p.brand} ${p.model}`}
          className="h-full w-full object-cover"
        />
        {p.is_example && (
          <span className="absolute left-3 top-3 border border-accent/50 bg-ink/60 px-2 py-1 font-mono text-[9px] uppercase tracking-[0.2em] text-accent backdrop-blur-sm">
            Ejemplo
          </span>
        )}
        <span className="absolute right-3 top-3 bg-ink/50 px-2 py-1 font-mono text-[9px] tabular-nums text-fog/80 backdrop-blur-sm">
          {mqCode(index)}
        </span>
      </div>
      <div>
        <InfoBand p={p} index={index} onSpec={onSpec} tabIndex={0} />
      </div>
    </motion.article>
  );
}

function Stack({ products, onSpec }) {
  const total = products.length;
  return (
    <div className="py-24 lg:py-36">
      <div className="section-head">
        <p className="mono-label flex items-center gap-3">
          <span className="font-mono text-accent">03</span> Catálogo
          <span className="h-px flex-1 bg-white/10" />
        </p>
        <div className="mt-6 flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-display text-5xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            Máquinas <span className="text-accent">seleccionadas</span>
          </h2>
          <p className="font-mono text-[11px] tabular-nums text-fog/80" data-testid="machines-counter">
            {String(total).padStart(2, "0")} UNIDADES EN EXHIBICIÓN
          </p>
        </div>
        <div className="mt-12 border-b border-white/10">
          {products.map((p, i) => (
            <MachineStatic key={p.id ?? i} p={p} index={i} onSpec={onSpec} />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------- Sección ---------- */

export default function FeaturedMachines() {
  const { products, error } = useProducts();
  const [specFor, setSpecFor] = useState(null);
  const rm = useReducedMotion();
  const [wide, setWide] = useState(
    typeof window !== "undefined" ? window.matchMedia("(min-width: 768px)").matches : true
  );

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const update = () => setWide(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  const total = products?.length ?? 0;
  const onSpec = (p, index) => setSpecFor({ p, index });

  return (
    <section id="maquinas" aria-label="Máquinas destacadas">
      {products === null && !error && (
        <div className="py-40 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-mist">
            {error ? "Catálogo no disponible — reintenta en unos segundos" : "Cargando catálogo…"}
          </p>
        </div>
      )}
      {products === null && error && (
        <div className="py-40 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-mist">
            Catálogo no disponible — reintenta en unos segundos
          </p>
        </div>
      )}
      {products && total === 0 && (
        <div className="py-40 text-center">
          <p className="font-mono text-xs uppercase tracking-[0.24em] text-mist">
            Catálogo en carga — [productos por publicar]
          </p>
        </div>
      )}
      {products && total > 0 && (wide && !rm
        ? <Tunnel products={products} onSpec={onSpec} />
        : <Stack products={products} onSpec={onSpec} />)}

      <AnimatePresence>
        {specFor && (
          <SpecSheet p={specFor.p} index={specFor.index} onClose={() => setSpecFor(null)} />
        )}
      </AnimatePresence>
    </section>
  );
}
