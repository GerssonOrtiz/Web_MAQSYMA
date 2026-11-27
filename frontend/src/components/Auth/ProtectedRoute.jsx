import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

export default function ProtectedRoute({ children, requireAdmin = false }) {
  const { loading, isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-ink px-6 pt-20">
        <p className="font-mono text-xs uppercase tracking-[0.24em] text-mist">
          Verificando sesión...
        </p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to={requireAdmin ? "/admin/login" : "/login"}
        state={{ from: location.pathname }}
        replace
      />
    );
  }

  if (requireAdmin && !isAdmin) {
    return <Navigate to="/mi-cuenta" replace />;
  }

  return children;
}
