import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Plus, RefreshCw, ShieldCheck, Trash2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { supabase } from "../../lib/supabase";

const EMPTY_FORM = {
  brand: "ESAB",
  model: "",
  category: "MMA",
  process: "SMAW",
  main_image: "/equipos/ROGUE%20EM%20210.png",
  amperage: "",
  voltage: "",
  description: "",
  featured: false,
};

export default function AdminDashboard({ onReady }) {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState(EMPTY_FORM);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  const loadProducts = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);
    setError("");
    const { data, error: fetchErr } = await supabase
      .from("products")
      .select("id, brand, model, category, process, amperage, featured, sort_order")
      .order("sort_order", { ascending: true });

    if (fetchErr) {
      setError(fetchErr.message);
    } else {
      setProducts(data || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!supabase) return;
    setCreating(true);
    setError("");
    const { error: insertErr } = await supabase.from("products").insert([
      {
        ...form,
        sort_order: products.length,
      },
    ]);
    setCreating(false);
    if (insertErr) {
      setError(insertErr.message);
      return;
    }
    setForm(EMPTY_FORM);
    loadProducts();
  };

  const handleToggleFeatured = async (item) => {
    if (!supabase) return;
    const { error: updErr } = await supabase
      .from("products")
      .update({ featured: !item.featured })
      .eq("id", item.id);
    if (updErr) {
      setError(updErr.message);
      return;
    }
    loadProducts();
  };

  const handleDelete = async (id) => {
    if (!supabase) return;
    const { error: delErr } = await supabase.from("products").delete().eq("id", id);
    if (delErr) {
      setError(delErr.message);
      return;
    }
    loadProducts();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate("/admin/login", { replace: true });
  };

  return (
    <main className="min-h-screen bg-ink pt-28 pb-20">
      <div className="section-head">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
          <div>
            <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.28em] text-accent">
              <ShieldCheck className="h-3.5 w-3.5" /> Panel de Control Administrador
            </p>
            <h1 className="mt-2 font-display text-4xl font-extrabold uppercase tracking-tight text-fog">
              Gestión de Catálogo
            </h1>
            <p className="mt-1 font-mono text-xs text-mist">Sesión: {user?.email}</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadProducts}
              className="btn-ghost !px-4 !py-2.5 !text-[10px]"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Actualizar
            </button>
            <button
              type="button"
              onClick={handleSignOut}
              className="btn-ghost !px-4 !py-2.5 !text-[10px]"
            >
              <LogOut className="h-3.5 w-3.5" />
              Salir
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-6 border border-red-500/40 bg-red-500/10 px-4 py-3 font-mono text-xs text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="mt-8 border border-white/10 bg-coal/70 p-6">
          <h2 className="font-mono text-xs uppercase tracking-[0.22em] text-accent">
            Agregar equipo en Supabase
          </h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <input
              type="text"
              required
              placeholder="Marca (ej. ESAB)"
              value={form.brand}
              onChange={(e) => setForm({ ...form, brand: e.target.value })}
              className="border border-white/15 bg-ink px-3 py-2 text-sm text-fog focus:border-accent focus:outline-none"
            />
            <input
              type="text"
              required
              placeholder="Modelo (ej. Rogue ES 201iP)"
              value={form.model}
              onChange={(e) => setForm({ ...form, model: e.target.value })}
              className="border border-white/15 bg-ink px-3 py-2 text-sm text-fog focus:border-accent focus:outline-none"
            />
            <input
              type="text"
              required
              placeholder="Categoría (ej. MMA, MIG / MAG)"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              className="border border-white/15 bg-ink px-3 py-2 text-sm text-fog focus:border-accent focus:outline-none"
            />
            <input
              type="text"
              required
              placeholder="Proceso (ej. SMAW)"
              value={form.process}
              onChange={(e) => setForm({ ...form, process: e.target.value })}
              className="border border-white/15 bg-ink px-3 py-2 text-sm text-fog focus:border-accent focus:outline-none"
            />
            <input
              type="text"
              placeholder="Amperaje (ej. 200 A)"
              value={form.amperage}
              onChange={(e) => setForm({ ...form, amperage: e.target.value })}
              className="border border-white/15 bg-ink px-3 py-2 text-sm text-fog focus:border-accent focus:outline-none"
            />
            <input
              type="text"
              required
              placeholder="URL de imagen"
              value={form.main_image}
              onChange={(e) => setForm({ ...form, main_image: e.target.value })}
              className="border border-white/15 bg-ink px-3 py-2 text-sm text-fog focus:border-accent focus:outline-none"
            />
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
            <label className="inline-flex items-center gap-2 font-mono text-xs text-mist">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="accent-[#ffb703]"
              />
              Marcar como equipo destacado
            </label>
            <button
              type="submit"
              disabled={creating}
              className="btn-primary !px-5 !py-2.5 !text-[10px]"
            >
              <Plus className="h-3.5 w-3.5" />
              {creating ? "Guardando..." : "Crear equipo"}
            </button>
          </div>
        </form>

        <div className="mt-8 border border-white/10 bg-coal/50 overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 font-mono text-[10px] uppercase tracking-[0.2em] text-mist">
                <th className="p-4">Marca / Modelo</th>
                <th className="p-4">Categoría</th>
                <th className="p-4">Amperaje</th>
                <th className="p-4">Destacado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center font-mono text-xs text-mist">
                    Cargando productos desde Supabase...
                  </td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center font-mono text-xs text-mist">
                    No hay registros en la tabla public.products de Supabase todavía.
                  </td>
                </tr>
              ) : (
                products.map((item) => (
                  <tr key={item.id} className="hover:bg-white/[0.02]">
                    <td className="p-4 font-medium text-fog">
                      <span className="font-mono text-[10px] text-accent mr-2">{item.brand}</span>
                      {item.model}
                    </td>
                    <td className="p-4 font-mono text-xs text-mist">{item.category}</td>
                    <td className="p-4 font-mono text-xs text-fog">{item.amperage || "—"}</td>
                    <td className="p-4">
                      <button
                        type="button"
                        onClick={() => handleToggleFeatured(item)}
                        className={`border px-2.5 py-1 font-mono text-[10px] uppercase ${
                          item.featured
                            ? "border-accent/50 bg-accent/15 text-accent"
                            : "border-white/15 text-mist"
                        }`}
                      >
                        {item.featured ? "Sí" : "No"}
                      </button>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        aria-label={`Eliminar ${item.model}`}
                        className="inline-flex items-center gap-1 border border-red-500/30 px-2.5 py-1 font-mono text-[10px] text-red-300 hover:bg-red-500/15"
                      >
                        <Trash2 className="h-3 w-3" /> Eliminar
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
