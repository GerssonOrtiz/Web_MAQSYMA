import { ShieldCheck, Wrench, PackageCheck, Truck, MessageSquare } from "lucide-react";

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: "Garantía oficial ESAB" },
  { icon: Wrench, label: "Servicio técnico autorizado" },
  { icon: PackageCheck, label: "Stock disponible" },
  { icon: Truck, label: "Envío a nivel nacional" },
  { icon: MessageSquare, label: "Asesoría técnica directa" },
];

export default function TrustBar() {
  return (
    <section className="border-b border-white/10 bg-coal/30 py-8" aria-label="Respaldo y garantía">
      <div className="section-head">
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-5">
          {TRUST_ITEMS.map(({ icon: Icon, label }) => (
            <div key={label} className="flex items-center gap-3">
              <Icon className="h-5 w-5 shrink-0 text-accent" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-fog/80">
                {label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
