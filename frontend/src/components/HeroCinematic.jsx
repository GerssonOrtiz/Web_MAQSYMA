import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { waLink } from "../lib/scroll";

const SCENES = {
  ext: "https://customer-assets-gfyr7b9c.emergentagent.net/job_maqsyma-soldadura--1wdqpq22/artifacts/703c20f5b0e76d19_1.png",
  room: "https://static.prod-images.emergentagent.com/jobs/0367909c-413c-4cc9-aff8-b7b2180f8e4b/images/be25804855c34529b19c3bc209395a32554915fab026b8c04199c04df4169732.jpeg",
  st1: "https://static.prod-images.emergentagent.com/jobs/0367909c-413c-4cc9-aff8-b7b2180f8e4b/images/8564ac0f408b6257ef419f10ba99241874ffab8e0c6e6bfd80b3899bf3ac8df2.jpeg",
  st2: "https://static.prod-images.emergentagent.com/jobs/0367909c-413c-4cc9-aff8-b7b2180f8e4b/images/ab83bb25449657a116fa7779c79c0b48325b435a7f732080d6492cdecc9371f3.jpeg",
  st3: "https://static.prod-images.emergentagent.com/jobs/0367909c-413c-4cc9-aff8-b7b2180f8e4b/images/fd7ac519c127a3066720a747757ab573552514656c2ed2ddcb69f24e6b18a74a.jpeg",
};

/* Línea de tiempo condensada (4 hitos clave, 2D GPU-friendly sin rotateY) */
const KF = {
  ext: {
    o: [[0, 0.16, 0.24, 0.30], [1, 1, 0.4, 0]],
    s: [[0, 0.30], [1.0, 1.07]],
    y: [[0, 0.30], ["0%", "-3%"]],
  },
  room: {
    o: [[0.20, 0.28, 0.46, 0.54], [0, 1, 1, 0]],
    s: [[0.20, 0.54], [1.06, 1.0]],
    x: [[0.20, 0.54], ["1.5%", "-1%"]],
  },
  st1: {
    o: [[0.46, 0.52, 0.68, 0.75], [0, 1, 1, 0]],
    s: [[0.46, 0.75], [1.0, 1.06]],
    x: [[0.46, 0.75], ["-1.5%", "1%"]],
  },
  st2: {
    o: [[0.68, 0.74, 0.86, 0.92], [0, 1, 1, 0]],
    s: [[0.68, 0.92], [1.06, 1.0]],
    x: [[0.68, 0.92], ["1.5%", "-1%"]],
  },
  st3: {
    o: [[0.84, 0.90, 1, 1.001], [0, 1, 1, 1]],
    s: [[0.84, 1], [1.0, 1.05]],
  },
};

const SEGMENTS = [
  [0, "Inicio"],
  [0.22, "Showroom"],
  [0.48, "ESAB 01"],
  [0.70, "ESAB 02"],
  [0.86, "ESAB 03"],
];

const PANEL_WINDOWS = [
  [0.50, 0.67],
  [0.72, 0.85],
  [0.88, 0.99],
];

function useProducts() {
  const [products, setProducts] = useState(null);
  useEffect(() => {
    let alive = true;
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/products`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((data) => alive && setProducts(data))
      .catch(() => alive && setProducts([]));
    return () => {
      alive = false;
    };
  }, []);
  return products;
}

function Scene({ progress, spec, src, alt }) {
  const opacity = useTransform(progress, spec.o[0], spec.o[1]);
  const scale = useTransform(progress, spec.s[0], spec.s[1]);
  const x = useTransform(progress, spec.x ? spec.x[0] : [0, 1], spec.x ? spec.x[1] : ["0%", "0%"]);
  const y = useTransform(progress, spec.y ? spec.y[0] : [0, 1], spec.y ? spec.y[1] : ["0%", "0%"]);

  return (
    <motion.div
      style={{ opacity, scale, x, y }}
      className="absolute inset-0 will-change-transform"
    >
      <img src={src} alt={alt} decoding="async" className="h-full w-full object-cover" />
    </motion.div>
  );
}

function StationPanel({ progress, win, station, index, onGoCatalog }) {
  const opacity = useTransform(
    progress,
    [win[0], win[0] + 0.025, win[1] - 0.025, win[1] + 0.015],
    [0, 1, 1, 0]
  );
  const y = useTransform(progress, [win[0], win[0] + 0.03], [24, 0]);
  const [visible, setVisible] = useState(false);
  useMotionValueEvent(progress, "change", (v) =>
    setVisible(v >= win[0] && v <= win[1] + 0.015)
  );

  return (
    <motion.div
      style={{ opacity, y, pointerEvents: visible ? "auto" : "none" }}
      className="absolute inset-x-5 bottom-24 z-20 border border-white/15 bg-ink/85 p-5 backdrop-blur-md sm:inset-x-auto sm:bottom-28 sm:left-12 sm:max-w-sm sm:p-6"
      data-testid={`hero-panel-${index}`}
    >
      <p className="mono-label">
        Estación 0{index + 1} <span className="text-accent">/</span> Equipo ESAB
      </p>
      <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.3em] text-accent">{station.brand}</p>
      <h3 className="mt-1 font-display text-3xl font-extrabold uppercase leading-none tracking-tight sm:text-4xl">
        {station.model}
      </h3>
      <div className="mt-4 grid grid-cols-3 gap-2 border-t border-white/10 pt-3">
        {[
          ["Proceso", station.process],
          ["Amperaje", station.amperage],
          ["Voltaje", station.voltage],
        ].map(([k, v]) => (
          <div key={k}>
            <p className="font-mono text-[8px] uppercase tracking-[0.18em] text-mist">{k}</p>
            <p className="mt-0.5 font-mono text-[11px] uppercase text-fog/90">{v}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-mist sm:text-sm">{station.description}</p>
      <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
        <a
          className="btn-primary !px-4 !py-2.5 !text-[10px]"
          href={station.quoteUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-testid={`hero-panel-quote-${index}`}
        >
          Solicitar cotización
        </a>
        <button
          type="button"
          className="btn-ghost !px-4 !py-2.5 !text-[10px]"
          onClick={onGoCatalog}
          data-testid={`hero-panel-catalog-${index}`}
        >
          Ver en catálogo
        </button>
      </div>
    </motion.div>
  );
}

function StaticHero({ products, onGoCatalog }) {
  const stations = [0, 1, 2].map((i) => products?.[i]);
  return (
    <section className="relative min-h-[100svh] overflow-hidden" aria-label="MAQSYMA showroom">
      <img
        src={SCENES.ext}
        alt="Fachada MAQSYMA con iluminación dorada"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-ink/80 via-ink/60 to-ink" />
      <div className="section-head relative flex min-h-[100svh] flex-col justify-end pb-16 pt-32">
        <p className="mono-label flex items-center gap-3">
          <span className="inline-block h-2 w-2 bg-accent" />
          Distribuidor Autorizado ESAB / Tecnología Industrial
        </p>
        <h1 className="mt-6 font-display text-[clamp(3rem,9vw,7rem)] font-black uppercase leading-[0.92] tracking-tight">
          Potencia para
          <br />
          soldar <span className="text-accent">sin límites.</span>
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-mist sm:text-lg">
          Equipos MIG, TIG, MMA y Multiproceso con garantía oficial, stock inmediato y asesoría técnica directa para soldadores, talleres e industria.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <button
            type="button"
            className="btn-primary"
            onClick={onGoCatalog}
            data-testid="static-hero-catalog"
          >
            Ver catálogo completo <span aria-hidden="true">→</span>
          </button>
          <a
            className="btn-ghost"
            href={waLink("Hola MAQSYMA, quiero cotizar un equipo de soldadura.")}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="static-hero-quote"
          >
            Cotizar por WhatsApp
          </a>
        </div>
        <div className="mt-8 flex flex-wrap gap-5 border-t border-white/10 pt-5">
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist">✓ Garantía oficial ESAB</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist">✓ Stock inmediato</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist">✓ Envío a nivel nacional</span>
        </div>
        <ul className="mt-6 grid grid-cols-1 gap-2 border-t border-white/10 pt-5 sm:grid-cols-3">
          {stations.map((p, i) => (
            <li key={i} className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist">
              <span className="text-accent">ESAB 0{i + 1}</span> — {p ? p.model : "[modelo por confirmar]"}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export default function HeroCinematic({ onReady }) {
  const navigate = useNavigate();
  const rm = useReducedMotion();
  const products = useProducts();
  const ref = useRef(null);
  const pctRef = useRef(null);
  const barRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [seg, setSeg] = useState(0);
  const [introActive, setIntroActive] = useState(true);
  const goCatalog = () => navigate("/catalogo");

  useEffect(() => {
    const link = document.createElement("link");
    link.rel = "preload";
    link.as = "image";
    link.href = SCENES.ext;
    link.fetchPriority = "high";
    document.head.appendChild(link);

    const lazy = [SCENES.room, SCENES.st1, SCENES.st2, SCENES.st3];
    lazy.forEach((url) => {
      const img = new Image();
      img.loading = "lazy";
      img.src = url;
    });

    const timer = setTimeout(() => {
      if (onReady) onReady();
    }, 200);

    return () => {
      clearTimeout(timer);
      if (link.parentNode) document.head.removeChild(link);
    };
  }, [onReady]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    let s = 0;
    for (let i = 0; i < SEGMENTS.length; i++) if (v >= SEGMENTS[i][0]) s = i;
    setSeg((c) => (c === s ? c : s));
    setIntroActive((prev) => {
      const next = v < 0.16;
      return prev === next ? prev : next;
    });

    const pctValue = Math.round(v * 100);
    if (pctRef.current) {
      pctRef.current.textContent = `${String(pctValue).padStart(3, "0")}%`;
    }
    if (barRef.current) {
      barRef.current.style.width = `${pctValue}%`;
    }
  });

  const jump = (thr) => {
    const el = ref.current;
    if (!el) return;
    const y = el.offsetTop + thr * (el.offsetHeight - window.innerHeight);
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.1 });
    else window.scrollTo({ top: y, behavior: "smooth" });
  };

  const stations = [0, 1, 2].map((i) => {
    const p = products?.[i];
    return p
      ? {
          brand: p.brand,
          model: p.model,
          process: p.process,
          amperage: p.amperage?.trim() || "SEGÚN MODELO",
          voltage: p.voltage?.trim() || "SEGÚN MODELO",
          description: p.description,
          quoteUrl: p.quote_url || waLink(`Hola MAQSYMA, quiero cotizar ${p.brand} ${p.model}.`),
        }
      : {
          brand: "ESAB",
          model: "[MODELO POR CONFIRMAR]",
          process: "—",
          amperage: "—",
          voltage: "—",
          description: "Equipo en exhibición — ficha comercial en carga desde el catálogo.",
          quoteUrl: waLink("Hola MAQSYMA, quiero cotizar un equipo ESAB."),
        };
  });

  const introOpacity = useTransform(scrollYProgress, [0, 0.10, 0.18], [1, 1, 0]);
  const introY = useTransform(scrollYProgress, [0, 0.18], [0, -24]);
  const hintOpacity = useTransform(scrollYProgress, [0, 0.08, 0.14], [1, 1, 0]);

  if (rm) return <StaticHero products={products} onGoCatalog={goCatalog} />;

  return (
    <section
      ref={ref}
      className="relative h-[320vh] md:h-[400vh]"
      data-testid="hero-cinematic"
      aria-label="Recorrido cinematográfico MAQSYMA"
    >
      <div className="sticky top-0 h-screen overflow-hidden bg-ink">
        <Scene progress={scrollYProgress} spec={KF.ext} src={SCENES.ext} alt="Exterior del showroom MAQSYMA al anochecer con iluminación dorada" />
        <Scene progress={scrollYProgress} spec={KF.room} src={SCENES.room} alt="Interior del showroom MAQSYMA con plataformas de exhibición" />
        <Scene progress={scrollYProgress} spec={KF.st1} src={SCENES.st1} alt="Estación 01: equipo de soldadura en plataforma" />
        <Scene progress={scrollYProgress} spec={KF.st2} src={SCENES.st2} alt="Estación 02: equipo MIG con alimentador de alambre" />
        <Scene progress={scrollYProgress} spec={KF.st3} src={SCENES.st3} alt="Estación 03: equipo industrial protagonista" />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/75 via-ink/25 to-ink/85" />

        {/* Propuesta de valor inmediata en el viewport inicial */}
        <motion.div
          style={{ opacity: introOpacity, y: introY, pointerEvents: introActive ? "auto" : "none" }}
          className="absolute inset-x-5 bottom-20 z-20 sm:inset-x-auto sm:bottom-24 sm:left-12 sm:max-w-2xl"
          data-testid="hero-value-proposition"
        >
          <p className="mono-label flex items-center gap-3">
            <span className="inline-block h-2 w-2 bg-accent" />
            Distribuidor Autorizado ESAB en Perú
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.5rem,6.5vw,5.2rem)] font-black uppercase leading-[0.92] tracking-tight">
            Potencia para
            <br />
            soldar <span className="text-accent">sin límites.</span>
          </h1>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-mist sm:text-base">
            Equipos MIG, TIG, MMA y Multiproceso con garantía oficial, stock inmediato y asesoría técnica directa.
          </p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              className="btn-primary"
              onClick={goCatalog}
              data-testid="hero-cta-catalog"
            >
              Ver catálogo completo <span aria-hidden="true">→</span>
            </button>
            <a
              className="btn-ghost"
              href={waLink("Hola MAQSYMA, quiero cotizar un equipo de soldadura.")}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="hero-cta-whatsapp"
            >
              Cotizar por WhatsApp
            </a>
          </div>
          <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 border-t border-white/10 pt-4">
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-mist">✓ Garantía oficial ESAB</span>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-mist">✓ Stock inmediato</span>
            <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-mist">✓ Envío a nivel nacional</span>
          </div>
        </motion.div>

        {/* HUD derecho */}
        <div className="absolute right-5 top-1/2 z-20 hidden -translate-y-1/2 flex-col gap-4 sm:flex" data-testid="hero-hud">
          {SEGMENTS.map((s, i) => (
            <button
              key={s[1]}
              onClick={() => jump(s[0])}
              className="group flex items-center justify-end gap-3"
              data-testid={`hud-jump-${i}`}
            >
              <span
                className={`font-mono text-[9px] uppercase tracking-[0.22em] transition-colors duration-200 ${
                  seg === i ? "text-accent" : "text-mist/50 group-hover:text-fog"
                }`}
              >
                {s[1]}
              </span>
              <span
                className={`h-1.5 w-1.5 transition-colors duration-200 ${
                  seg === i ? "bg-accent" : "bg-white/25 group-hover:bg-white/60"
                }`}
              />
            </button>
          ))}
        </div>

        {/* Etiqueta de escena */}
        <div className="absolute bottom-7 left-5 z-20 sm:left-12" data-testid="hero-scene-label">
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-fog/90">
            <span className="text-accent">{String(seg + 1).padStart(2, "0")}</span>
            <span className="text-mist"> / {String(SEGMENTS.length).padStart(2, "0")} — {SEGMENTS[seg][1]}</span>
          </p>
          <div className="mt-2 flex items-center gap-3">
            <span className="h-px w-24 bg-white/15">
              <span
                ref={barRef}
                className="block h-px bg-accent transition-[width] duration-150"
                style={{ width: "0%" }}
              />
            </span>
            <span ref={pctRef} className="font-mono text-[9px] tabular-nums text-mist">
              000%
            </span>
          </div>
        </div>

        {/* Indicación inicial y botón saltar recorrido */}
        <motion.p
          style={{ opacity: hintOpacity }}
          className="mono-label pointer-events-none absolute bottom-7 left-1/2 z-20 hidden -translate-x-1/2 whitespace-nowrap md:block"
          data-testid="hero-scroll-hint"
        >
          Desliza para explorar el showroom ↓
        </motion.p>

        <button
          type="button"
          onClick={goCatalog}
          className="absolute bottom-7 right-5 z-20 border border-white/15 bg-ink/70 px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-mist backdrop-blur-sm transition-colors hover:border-accent hover:text-accent sm:right-12"
          data-testid="hero-skip-btn"
        >
          Ir al catálogo →
        </button>

        {PANEL_WINDOWS.map((win, i) => (
          <StationPanel key={i} progress={scrollYProgress} win={win} station={stations[i]} index={i} onGoCatalog={goCatalog} />
        ))}
      </div>
    </section>
  );
}
