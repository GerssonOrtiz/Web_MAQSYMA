import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Lock,
  Mail,
  Building2,
  User,
  ShieldCheck,
  ArrowRight,
  Phone,
  FileText,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";

const DOC_TYPES = [
  { value: "DNI", label: "DNI" },
  { value: "CE", label: "Carné de Extranjería" },
  { value: "RUC", label: "RUC" },
  { value: "PASAPORTE", label: "Pasaporte" },
];

export default function AuthPage({ defaultMode = "login", adminOnly = false, onReady }) {
  const { signIn, signUp, signOut, isAuthenticated, isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mode, setMode] = useState(adminOnly ? "login" : defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [documentType, setDocumentType] = useState("DNI");
  const [documentNumber, setDocumentNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [company, setCompany] = useState("");
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    onReady?.();
  }, [onReady]);

  useEffect(() => {
    setMode(adminOnly ? "login" : defaultMode);
    setError("");
    setNotice("");
  }, [defaultMode, adminOnly]);

  useEffect(() => {
    if (loading || !isAuthenticated) return;
    if (adminOnly) {
      if (isAdmin) {
        navigate(location.state?.from || "/admin", { replace: true });
      }
      return;
    }
    navigate(location.state?.from || (isAdmin ? "/admin" : "/mi-cuenta"), { replace: true });
  }, [loading, isAuthenticated, isAdmin, adminOnly, navigate, location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");

    if (mode === "register" && !adminOnly && !acceptedPrivacy) {
      setError("Debes aceptar las políticas de privacidad para registrarte.");
      return;
    }

    setSubmitting(true);

    try {
      if (mode === "login") {
        const res = await signIn(email, password);
        if (adminOnly && res?.profile?.role !== "admin") {
          await signOut();
          setError("Esta cuenta no tiene permisos de administrador.");
          setSubmitting(false);
          return;
        }
        navigate(
          location.state?.from || (res?.profile?.role === "admin" ? "/admin" : "/mi-cuenta"),
          { replace: true }
        );
      } else {
        const res = await signUp({
          email,
          password,
          firstName,
          lastName,
          documentType,
          documentNumber,
          phone,
          company,
          acceptedPrivacy,
        });
        if (res?.session) {
          navigate("/mi-cuenta", { replace: true });
        } else {
          setNotice(
            "Cuenta creada. Revisa tu correo electrónico para confirmar tu cuenta antes de iniciar sesión."
          );
          setMode("login");
        }
      }
    } catch (err) {
      setError(err?.message || "No se pudo completar la operación.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-ink pt-28 pb-20">
      <div className="section-head flex justify-center">
        <div className="w-full max-w-lg border border-white/10 bg-coal/80 p-6 sm:p-8">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-accent">
                {adminOnly ? "Acceso Restringido" : "Cuenta MAQSYMA"}
              </p>
              <h1 className="mt-2 font-display text-3xl font-extrabold uppercase tracking-tight text-fog">
                {adminOnly
                  ? "Panel Administrador"
                  : mode === "login"
                  ? "Iniciar sesión"
                  : "Crear cuenta"}
              </h1>
            </div>
            {adminOnly && <ShieldCheck className="h-7 w-7 text-accent" />}
          </div>

          {!adminOnly && (
            <div className="mt-5 grid grid-cols-2 border border-white/10 bg-ink/70 p-1">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setError("");
                  setNotice("");
                }}
                className={`py-2 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors ${
                  mode === "login"
                    ? "bg-accent text-black font-semibold"
                    : "text-mist hover:text-fog"
                }`}
              >
                Ingresar
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setError("");
                  setNotice("");
                }}
                className={`py-2 font-mono text-[10px] uppercase tracking-[0.2em] transition-colors ${
                  mode === "register"
                    ? "bg-accent text-black font-semibold"
                    : "text-mist hover:text-fog"
                }`}
              >
                Registrarse
              </button>
            </div>
          )}

          {error && (
            <div className="mt-5 border border-red-500/40 bg-red-500/10 px-4 py-3 font-mono text-xs text-red-300">
              {error}
            </div>
          )}

          {notice && (
            <div className="mt-4 border border-accent/40 bg-accent/10 px-4 py-3 font-mono text-xs text-accent">
              {notice}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            {mode === "register" && !adminOnly && (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mono-label block mb-1.5">Nombres *</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mist/60" />
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Ej. Carlos"
                        className="w-full border border-white/15 bg-ink pl-10 pr-3 py-2.5 text-sm text-fog placeholder:text-mist/40 focus:border-accent focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mono-label block mb-1.5">Apellidos *</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Ej. Mendoza Quispe"
                      className="w-full border border-white/15 bg-ink px-3.5 py-2.5 text-sm text-fog placeholder:text-mist/40 focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mono-label block mb-1.5">Tipo de documento *</label>
                    <div className="relative">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mist/60 pointer-events-none" />
                      <select
                        required
                        value={documentType}
                        onChange={(e) => setDocumentType(e.target.value)}
                        className="w-full border border-white/15 bg-ink pl-10 pr-3 py-2.5 text-sm text-fog focus:border-accent focus:outline-none"
                      >
                        {DOC_TYPES.map((d) => (
                          <option key={d.value} value={d.value}>
                            {d.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="mono-label block mb-1.5">N° de documento *</label>
                    <input
                      type="text"
                      required
                      value={documentNumber}
                      onChange={(e) => setDocumentNumber(e.target.value)}
                      placeholder="Ej. 72345678"
                      className="w-full border border-white/15 bg-ink px-3.5 py-2.5 text-sm text-fog placeholder:text-mist/40 focus:border-accent focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mono-label block mb-1.5">Celular *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mist/60" />
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ej. 987 654 321"
                        className="w-full border border-white/15 bg-ink pl-10 pr-3 py-2.5 text-sm text-fog placeholder:text-mist/40 focus:border-accent focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mono-label block mb-1.5">Empresa (opcional)</label>
                    <div className="relative">
                      <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mist/60" />
                      <input
                        type="text"
                        value={company}
                        onChange={(e) => setCompany(e.target.value)}
                        placeholder="Opcional"
                        className="w-full border border-white/15 bg-ink pl-10 pr-3 py-2.5 text-sm text-fog placeholder:text-mist/40 focus:border-accent focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="mono-label block mb-1.5">Dirección de correo electrónico *</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mist/60" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="correo@empresa.com"
                  className="w-full border border-white/15 bg-ink pl-10 pr-3 py-2.5 text-sm text-fog placeholder:text-mist/40 focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mono-label block mb-1.5">Contraseña *</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mist/60" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full border border-white/15 bg-ink pl-10 pr-3 py-2.5 text-sm text-fog placeholder:text-mist/40 focus:border-accent focus:outline-none"
                />
              </div>
            </div>

            {mode === "register" && !adminOnly && (
              <label className="flex items-start gap-3 pt-1 text-xs leading-relaxed text-mist cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={acceptedPrivacy}
                  onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-[#ffb703]"
                />
                <span>
                  He leído y acepto las{" "}
                  <span className="text-accent underline">Políticas de Privacidad</span> y el
                  tratamiento de mis datos personales para atención comercial de MAQSYMA.
                </span>
              </label>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full justify-center disabled:opacity-60"
            >
              {submitting
                ? "Procesando..."
                : adminOnly
                ? "Ingresar como Admin"
                : mode === "login"
                ? "Ingresar"
                : "Crear cuenta"}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>

          <div className="mt-6 border-t border-white/10 pt-4 text-center">
            {adminOnly ? (
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist hover:text-accent"
              >
                ← Volver al acceso de clientes
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate("/admin/login")}
                className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist/70 hover:text-accent"
              >
                Acceso administrador →
              </button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
