const ITEMS = [
  "MMA",
  "MIG / MAG",
  "TIG",
  "CORTE PLASMA",
  "MULTIPROCESO",
  "ACCESORIOS",
  "EQUIPOS DE SOLDADURA",
  "EQUIPOS DE CORTE",
];

export default function Marquee() {
  return (
    <section aria-hidden="true" className="overflow-hidden border-y border-white/10 bg-coal/40 py-5">
      <div className="animate-marquee flex w-max">
        {[0, 1].map((dup) => (
          <ul key={dup} className="flex shrink-0 items-center" aria-hidden={dup === 1}>
            {ITEMS.map((it) => (
              <li
                key={`${dup}-${it}`}
                className="flex items-center whitespace-nowrap font-mono text-[11px] uppercase tracking-[0.32em] text-mist"
              >
                <span className="px-8">{it}</span>
                <span className="text-accent">+</span>
              </li>
            ))}
          </ul>
        ))}
      </div>
    </section>
  );
}
