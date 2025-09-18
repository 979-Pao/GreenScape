import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/http";
import { login as apiLogin, me as apiMe, logout as apiLogout } from "../api/auth";

const AuthContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

export default function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [auth, setAuth] = useState(() => {
    try {
      const raw = localStorage.getItem("auth");
      const parsed = raw ? JSON.parse(raw) : { token: null, user: null };
      if (parsed?.token) {
        api.defaults.headers.common.Authorization = `Bearer ${parsed.token}`;
      }
      return parsed;
    } catch {
      return { token: null, user: null };
    }
  });

  const [booting, setBooting] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      // ⚠️ Si no hay token, termina el boot correctamente
      if (!auth?.token) {
        if (alive) setBooting(false);
        return;
      }

      try {
        api.defaults.headers.common.Authorization = `Bearer ${auth.token}`;
        const user = await apiMe();
        if (!alive) return;
        const next = { token: auth.token, user };
        setAuth(next);
        localStorage.setItem("auth", JSON.stringify(next));
      } catch (err) {
        if (import.meta.env.DEV) {
          console.warn("me() 403/401, limpiando sesión:", err?.response?.status);
        }
        if (!alive) return;
        delete api.defaults.headers.common.Authorization;
        localStorage.removeItem("auth");
        setAuth({ token: null, user: null });
      } finally {
        if (alive) setBooting(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // solo al montar

  // LOGIN con JWT { token, user? }
  const signIn = async (email, password) => {
    const { token, user: userFromLogin } = await apiLogin(email, password);
    if (!token) throw new Error("El backend no devolvió token en /login");

    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    const user = userFromLogin ?? (await apiMe());

    const next = { token, user };
    localStorage.setItem("auth", JSON.stringify(next));
    setAuth(next);

    const roles = (user?.roles || []).map((r) => String(r).toUpperCase());
    navigate(roles.includes("ADMIN") ? "/admin" : "/profile", { replace: true });
  };

  // LOGOUT: limpia primero el front y llama al back en background
  const doLogout = () => {
    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem("auth");
    setAuth({ token: null, user: null });
    navigate("/login", { replace: true });

    // notificar al backend sin bloquear el flujo
    apiLogout?.().catch(() => {
      if (import.meta.env.DEV) console.warn("logout() falló (ignorado)");
    });
  };

  const hasRole = (role) => {
    const roles = Array.isArray(auth.user?.roles)
      ? auth.user.roles.map((r) => String(r).toUpperCase())
      : auth.user?.role
      ? [String(auth.user.role).toUpperCase()]
      : [];
    return roles.includes(String(role).toUpperCase());
  };

  const value = useMemo(
    () => ({
      ...auth, // { token, user }
      isAuthenticated: !!auth.token && !!auth.user,
      signIn,
      signOut: doLogout,
      hasRole,
    }),
    [auth]
  );

  if (booting) return null; // aquí puedes mostrar un spinner global

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
