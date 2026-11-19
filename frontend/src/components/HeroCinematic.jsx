import { useEffect, useRef, useState } from "react";
import {
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useTransform,
} from "framer-motion";
import { waLink, scrollToSection } from "../lib/scroll";

const SCENES = {
  ext: "https://customer-assets-gfyr7b9c.emergentagent.net/job_maqsyma-soldadura--1wdqpq22/artifacts/703c20f5b0e76d19_1.png",
  room: "https://static.prod-images.emergentagent.com/jobs/0367909c-413c-4cc9-aff8-b7b2180f8e4b/images/be25804855c34529b19c3bc209395a32554915fab026b8c04199c04df4169732.jpeg",
  st1: "https://static.prod-images.emergentagent.com/jobs/0367909c-413c-4cc9-aff8-b7b2180f8e4b/images/8564ac0f408b6257ef419f10ba99241874ffab8e0c6e6bfd80b3899bf3ac8df2.jpeg",
  st2: "https://static.prod-images.emergentagent.com/jobs/0367909c-413c-4cc9-aff8-b7b2180f8e4b/images/ab83bb25449657a116fa7779c79c0b48325b435a7f732080d6492cdecc9371f3.jpeg",
  st3: "https://static.prod-images.emergentagent.com/jobs/0367909c-413c-4cc9-aff8-b7b2180f8e4b/images/fd7ac519c127a3066720a747757ab573552514656c2ed2ddcb69f24e6b18a74a.jpeg",
  acc: "https://static.prod-images.emergentagent.com/jobs/0367909c-413c-4cc9-aff8-b7b2180f8e4b/images/d90fc02ea97e656001b063ac94c4146c757d867e9af9baf8d0eb290277530317.jpeg",
  wide: "https://static.prod-images.emergentagent.com/jobs/0367909c-413c-4cc9-aff8-b7b2180f8e4b/images/15385da378a8c93bdf83a4fa6f288163a57a88da403d3521cde0578f993d0ffa.jpeg",
  portal: "https://static.prod-images.emergentagent.com/jobs/0367909c-413c-4cc9-aff8-b7b2180f8e4b/images/47dc9a25b939d46e624d960f673ddf91ef2da3641d52b523bcb60a1ee9b06603.jpeg",
};

/* Línea de tiempo del recorrido (fracciones del progreso 0→1) */
const KF = {
  ext: {
    o: [[0, 0.08, 0.115, 0.15], [1, 1, 0.4, 0]],
    s: [[0, 0.15], [1.06, 1.5]],
    y: [[0, 0.15], ["0%", "-5%"]],
  },
  room: {
    o: [[0.08, 0.12, 0.255, 0.29], [0, 1, 1, 0]],
    s: [[0.08, 0.29], [1.26, 1.05]],
    x: [[0.08, 0.29], ["2%", "-1%"]],
  },
  st1: {
    o: [[0.235, 0.275, 0.325, 0.36], [0, 1, 1, 0]],
    s: [[0.235, 0.36], [1.2, 1.3]],
    x: [[0.235, 0.36], ["-2%", "1%"]],
    r: [[0.27, 0.33], [2, -1.5]],
  },
  st2: {
    o: [[0.395, 0.435, 0.48, 0.515], [0, 1, 1, 0]],
    s: [[0.395, 0.515], [1.2, 1.33]],
    x: [[0.395, 0.515], ["3%", "-2%"]],
    r: [[0.44, 0.5], [-1.8, 1.6]],
  },
  st3: {
    o: [[0.575, 0.64, 0.695, 0.73], [0, 1, 1, 0]],
    s: [[0.575, 0.73], [1.18, 1.3]],
    r: [[0.64, 0.705], [2.2, -2.2]],
  },
  acc: {
    o: [[0.775, 0.815, 0.855, 0.885], [0, 1, 1, 0]],
    s: [[0.775, 0.885], [1.14, 1.2]],
    x: [[0.775, 0.885], ["-5%", "4%"]],
  },
  wide: {
    o: [[0.88, 0.915, 0.938, 0.955], [0, 1, 1, 0]],
    s: [[0.88, 0.955], [1.22, 1.04]],
  },
  portal: {
    o: [[0.945, 0.972, 1, 1.001], [0, 1, 1, 1]],
    s: [[0.945, 1], [1.38, 1.04]],
  },
};

const SEGMENTS = [
  [0, "Exterior"],
  [0.08, "Ingreso"],
  [0.235, "ESAB 01"],
  [0.395, "ESAB 02"],
  [0.575, "ESAB 03"],
  [0.775, "Accesorios"],
  [0.945, "Portal"],
];

const PANEL_WINDOWS = [
  [0.27, 0.325],
  [0.435, 0.48],
  [0.635, 0.695],
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
  const rotate = useTransform(progress, spec.r ? spec.r[0] : [0, 1], spec.r ? spec.r[1] : [0, 0]);
  return (
    <motion.div
      style={{ opacity, scale, x, y, rotateY: rotate, transformPerspective: 1400 }}
      className="absolute inset-0 will-change-transform"
    >
      <img src={src} alt={alt} decoding="async" className="h-full w-full object-cover" />
    </motion.div>
  );
}

function StationPanel({ progress, win, station, index }) {
  const opacity = useTransform(
    progress,
    [win[0], win[0] + 0.012, win[1] - 0.012, win[1] + 0.008],
    [0, 1, 1, 0]
  );
  const y = useTransform(progress, [win[0], win[0] + 0.02], [28, 0]);
  const [visible, setVisible] = useState(false);
  useMotionValueEvent(progress, "change", (v) =>
    setVisible(v >= win[0] && v <= win[1] + 0.01)
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
          onClick={() => scrollToSection("maquinas")}
          data-testid={`hero-panel-catalog-${index}`}
        >
          Ver en catálogo
        </button>
      </div>
    </motion.div>
  );
}

function StaticHero({ products }) {
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
          Equipos de soldadura / Tecnología industrial
        </p>
        <h1 className="mt-6 font-display text-[clamp(3rem,9vw,7rem)] font-black uppercase leading-[0.92] tracking-tight">
          Potencia para
          <br />
          soldar <span className="text-accent">sin límites.</span>
        </h1>
        <p className="mt-5 max-w-xl text-base leading-relaxed text-mist sm:text-lg">
          Recorrido por el showroom MAQSYMA: equipos ESAB protagonistas y accesorios
          seleccionados para soldadores, talleres e industria.
        </p>
        <div className="mt-8 flex flex-col gap-4 sm:flex-row">
          <button
            type="button"
            className="btn-primary"
            onClick={() => scrollToSection("maquinas")}
            data-testid="static-hero-catalog"
          >
            Ver máquinas <span aria-hidden="true">→</span>
          </button>
          <a
            className="btn-ghost"
            href={waLink("Hola MAQSYMA, quiero cotizar un equipo de soldadura.")}
            target="_blank"
            rel="noopener noreferrer"
            data-testid="static-hero-quote"
          >
            Solicitar cotización
          </a>
        </div>
        <ul className="mt-10 grid grid-cols-1 gap-2 border-t border-white/10 pt-5 sm:grid-cols-3">
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
  const rm = useReducedMotion();
  const products = useProducts();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const [seg, setSeg] = useState(0);
  const [pct, setPct] = useState(0);

  // Notificar cuando el Hero esté montado y listo para la pantalla de carga (LoadingScreen)
  useEffect(() => {
    let timer = setTimeout(() => {
      if (onReady) onReady();
    }, 300);

    // Precargar las primeras imágenes críticas en segundo plano
    const preloadList = [SCENES.ext, SCENES.room, SCENES.st1];
    let loadedCount = 0;
    preloadList.forEach((url) => {
      const img = new Image();
      img.src = url;
      img.onload = img.onerror = () => {
        loadedCount++;
        if (loadedCount >= 1 && onReady) {
          onReady();
        }
      };
    });

    return () => clearTimeout(timer);
  }, [onReady]);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    let s = 0;
    for (let i = 0; i < SEGMENTS.length; i++) if (v >= SEGMENTS[i][0]) s = i;
    setSeg((c) => (c === s ? c : s));
    setPct(Math.round(v * 100));
  });

  const jump = (thr) => {
    const el = ref.current;
    if (!el) return;
    const y = el.offsetTop + thr * (el.offsetHeight - window.innerHeight);
    if (window.__lenis) window.__lenis.scrollTo(y, { duration: 1.4 });
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

  const hintOpacity = useTransform(scrollYProgress, [0, 0.035, 0.05], [1, 1, 0]);

  if (rm) return <StaticHero products={products} />;

  return (
    <section ref={ref} className="relative h-[1250vh] md:h-[1600vh]" data-testid="hero-cinematic" aria-label="Recorrido cinematográfico MAQSYMA">
      <div className="sticky top-0 h-screen overflow-hidden bg-ink">
        <Scene progress={scrollYProgress} spec={KF.ext} src={SCENES.ext} alt="Exterior del showroom MAQSYMA al anochecer con iluminación dorada" />
        <Scene progress={scrollYProgress} spec={KF.room} src={SCENES.room} alt="Interior del showroom MAQSYMA con plataformas de exhibición" />
        <Scene progress={scrollYProgress} spec={KF.st1} src={SCENES.st1} alt="Estación 01: equipo de soldadura en plataforma" />
        <Scene progress={scrollYProgress} spec={KF.st2} src={SCENES.st2} alt="Estación 02: equipo MIG con alimentador de alambre" />
        <Scene progress={scrollYProgress} spec={KF.st3} src={SCENES.st3} alt="Estación 03: equipo industrial protagonista" />
        <Scene progress={scrollYProgress} spec={KF.acc} src={SCENES.acc} alt="Zona de accesorios de soldadura exhibidos" />
        <Scene progress={scrollYProgress} spec={KF.wide} src={SCENES.wide} alt="Vista general del showroom MAQSYMA" />
        <Scene progress={scrollYProgress} spec={KF.portal} src={SCENES.portal} alt="Gran portal iluminado al final del recorrido" />

        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-ink/70 via-transparent to-ink/55" />

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
              <span className="block h-px bg-accent transition-[width] duration-150" style={{ width: `${pct}%` }} />
            </span>
            <span className="font-mono text-[9px] tabular-nums text-mist">{String(pct).padStart(3, "0")}%</span>
          </div>
        </div>

        {/* Indicación inicial */}
        <motion.p
          style={{ opacity: hintOpacity }}
          className="mono-label absolute bottom-7 left-1/2 z-20 -translate-x-1/2 whitespace-nowrap"
          data-testid="hero-scroll-hint"
        >
          Desliza para iniciar el recorrido ↓
        </motion.p>

        {PANEL_WINDOWS.map((win, i) => (
          <StationPanel key={i} progress={scrollYProgress} win={win} station={stations[i]} index={i} />
        ))}
      </div>
    </section>
  );
}
