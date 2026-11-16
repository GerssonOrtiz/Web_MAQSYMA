import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";

const APPS = [
  { name: "Estructuras metálicas", img: "https://images.unsplash.com/photo-1509024368907-57294758cfc5?crop=entropy&cs=srgb&fm=jpg&q=85", span: "lg:col-span-7", ar: "aspect-[16/10]" },
  { name: "Fabricación industrial", img: "https://images.pexels.com/photos/29988963/pexels-photo-29988963.jpeg?auto=compress&cs=tinysrgb&h=650&w=940", span: "lg:col-span-5", ar: "aspect-[16/10] lg:aspect-auto lg:h-full" },
  { name: "Mantenimiento", img: "https://images.pexels.com/photos/28951817/pexels-photo-28951817.jpeg?auto=compress&cs=tinysrgb&h=650&w=940", span: "lg:col-span-4", ar: "aspect-[4/5]" },
  { name: "Construcción", img: "https://images.pexels.com/photos/3818947/pexels-photo-3818947.jpeg?auto=compress&cs=tinysrgb&h=650&w=940", span: "lg:col-span-4", ar: "aspect-[4/5]" },
  { name: "Minería", img: "https://images.unsplash.com/photo-1523848309072-c199db53f137?crop=entropy&cs=srgb&fm=jpg&q=85", span: "lg:col-span-4", ar: "aspect-[4/5]" },
  { name: "Calderería", img: "https://images.unsplash.com/photo-1493476523860-a6de6ce1b0c3?crop=entropy&cs=srgb&fm=jpg&q=85", span: "lg:col-span-5", ar: "aspect-[16/10]" },
  { name: "Reparación", img: "https://images.unsplash.com/photo-1608126841830-53832c4b326f?crop=entropy&cs=srgb&fm=jpg&q=85", span: "lg:col-span-4", ar: "aspect-[16/10] lg:aspect-auto lg:h-full" },
  { name: "Talleres profesionales", img: "https://images.unsplash.com/photo-1720036236697-018370867320?crop=entropy&cs=srgb&fm=jpg&q=85", span: "lg:col-span-3", ar: "aspect-[3/4]" },
];

function ParallaxCard({ app, index }) {
  const ref = useRef(null);
  const rm = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], rm ? ["0%", "0%"] : ["-7%", "7%"]);

  return (
    <figure ref={ref} className={`group ${app.span}`} data-testid={`application-card-${index}`}>
      <div className={`relative ${app.ar} overflow-hidden border border-white/10 bg-coal`}>
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.15 }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
        >
          <motion.img
            src={app.img}
            alt={`Aplicación de equipos de soldadura: ${app.name}`}
            style={{ y }}
            className="h-[118%] w-full scale-105 object-cover transition-transform duration-700 group-hover:scale-[1.09]"
          />
        </motion.div>
        <span className="mono-label absolute left-4 top-4 bg-ink/50 px-2 py-1 backdrop-blur-sm">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>
      <figcaption className="mt-3 flex items-center justify-between border-b border-white/10 pb-3">
        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-fog/85">{app.name}</span>
        <span className="h-1 w-1 bg-accent" />
      </figcaption>
    </figure>
  );
}

export default function Applications() {
  return (
    <section id="aplicaciones" className="py-24 lg:py-36" aria-label="Aplicaciones industriales">
      <div className="section-head">
        <p className="mono-label flex items-center gap-3">
          <span className="font-mono text-accent">05</span> Aplicaciones
          <span className="h-px flex-1 bg-white/10" />
        </p>
        <h2 className="mt-6 max-w-4xl font-display text-5xl font-extrabold uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
          Donde la potencia se convierte en <span className="text-accent">trabajo</span>
        </h2>

        <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-12 lg:gap-6">
          {APPS.map((app, i) => (
            <ParallaxCard key={app.name} app={app} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
