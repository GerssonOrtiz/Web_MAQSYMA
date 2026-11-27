import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, ShieldCheck, Save, ArrowUpRight } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { waLink } from "../../lib/scroll";

export default function AccountPage({ onReady }) {
  const { user, profile, isAdmin, signOut, updateProfile } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(profile?.full_name || "");
  const [company, setCompany] = useState(profile?.company || "");
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState("");

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  useEffect(() => {
    setFullName(profile?.full_name || "");
    setCompany(profile?.company || "");
  }, [profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg("");
    try {
      await updateProfile({ fullName, company });
      setStatusMsg("Perfil actualizado correctamente.");
    } catch (err) {
      setStatusMsg(err?.message || "No se pudo actualizar el perfil.");
    } finally {
      setSaving(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/login", { replace: true });
  };

  return (
    <main className="min-h-screen bg-ink pt-28 pb-20">
      <div className="section-head max-w-3xl">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent">
              {isAdmin ? "Cuenta Administrador" : "Cuenta Cliente"}
            </p>
            <h1 className="mt-2 font-display text-4xl font-extrabold uppercase tracking-tight text-fog">
              Mi Cuenta
            </h1>
            <p className="mt-1 font-mono text-xs text-mist">{user?.email}</p>
          </div>

          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                type="button"
                onClick={() => navigate("/admin")}
                className="btn-primary !px-4 !py-2.5 !text-[10px]"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Ir al Panel Admin
              </button>
            )}
            <button
              type="button"
              onClick={handleSignOut}
              className="btn-ghost !px-4 !py-2.5 !text-[10px]"
            >
              <LogOut className="h-3.5 w-3.5" />
              Cerrar sesión
            </button>
          </div>
        </div>

        <form onSubmit={handleSave} className="mt-8 border border-white/10 bg-coal/70 p-6 space-y-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div>
              <label className="mono-label block mb-2">Nombre completo</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Tu nombre"
                className="w-full border border-white/15 bg-ink px-3.5 py-2.5 text-sm text-fog focus:border-accent focus:outline-none"
              />
            </div>

            <div>
              <label className="mono-label block mb-2">Empresa</label>
              <input
                type="text"
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Nombre de tu empresa"
                className="w-full border border-white/15 bg-ink px-3.5 py-2.5 text-sm text-fog focus:border-accent focus:outline-none"
              />
            </div>
          </div>

          {statusMsg && (
            <p className="font-mono text-xs text-accent">{statusMsg}</p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary !px-5 !py-3 !text-[10px]"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? "Guardando..." : "Guardar cambios"}
            </button>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate("/catalogo")}
                className="btn-ghost !px-4 !py-2.5 !text-[10px]"
              >
                Explorar catálogo
              </button>
              <a
                href={waLink(`Hola MAQSYMA, soy ${fullName || user?.email} y necesito asesoría.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-ghost !px-4 !py-2.5 !text-[10px]"
              >
                WhatsApp <ArrowUpRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
