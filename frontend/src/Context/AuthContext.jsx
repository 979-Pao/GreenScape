import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/http";
import { login as apiLogin, me as apiMe, logout as apiLogout, register as apiRegister,} from "../api/auth";

const AuthContext = createContext(null);

// Hook
export const useAuth = () => useContext(AuthContext);

export default function AuthProvider({ children }) {
  const navigate = useNavigate();

  // ===== estado inicial desde localStorage + header =====
  const [auth, setAuth] = useState(() => {
    try {
      const raw = localStorage.getItem("auth");
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed?.token) {
        api.defaults.headers.common.Authorization = `Bearer ${parsed.token}`;
      }
      return parsed;
    } catch {
      return null;
    }
  });

  const [booting, setBooting] = useState(true);

  // ===== persistencia en localStorage =====
  useEffect(() => {
    if (auth?.token) localStorage.setItem("auth", JSON.stringify(auth));
    else localStorage.removeItem("auth");
  }, [auth]);

  // ===== bootstrap: si hay token, refrescar user con /me =====
  useEffect(() => {
    let alive = true;

    (async () => {
      if (!auth?.token) {
        setBooting(false);
        return;
      }
      try {
        api.defaults.headers.common.Authorization = `Bearer ${auth.token}`;
        const user = await apiMe();
        if (!alive) return;
        setAuth({ token: auth.token, user });
      } catch {
        if (!alive) return;
        delete api.defaults.headers.common.Authorization;
        localStorage.removeItem("auth");
        setAuth(null);
      } finally {
        if (alive) setBooting(false);
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // solo al montar

  // ===== helpers =====
  const getUserRolesUpper = (user) => {
    if (!user) return [];
    if (Array.isArray(user.roles)) return user.roles.map((r) => String(r).toUpperCase());
    if (user.role) return [String(user.role).toUpperCase()];
    return [];
  };

  const goHomeByRole = (user) => {
    const roles = getUserRolesUpper(user);
    if (roles.includes("ADMIN")) navigate("/admin", { replace: true });
    else navigate("/client/me", { replace: true }); // o "/profile"
  };

  // ===== acciones =====
  const signIn = async (email, password) => {
    const { token, user: userFromLogin } = await apiLogin(email, password);
    if (!token) throw new Error("El backend no devolvió token en /login");

    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    const user = userFromLogin ?? (await apiMe());

    const next = { token, user };
    setAuth(next);
    localStorage.setItem("auth", JSON.stringify(next));
    goHomeByRole(user);
    return user;
  };

  const signUp = async (name, email, password) => {
    const { token, user: userFromRegister } = await apiRegister({ name, email, password });
    if (!token) throw new Error("El backend no devolvió token en /register");

    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    const user = userFromRegister ?? (await apiMe());

    const next = { token, user };
    setAuth(next);
    localStorage.setItem("auth", JSON.stringify(next));
    goHomeByRole(user);
    return user;
  };

  const signOut = () => {
    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem("auth");
    setAuth(null);
    navigate("/login", { replace: true });
    apiLogout?.().catch(() => {
      if (import.meta.env.DEV) console.warn("logout() falló (ignorado)");
    });
  };

  const hasRole = (roles) => {
    const userRoles = getUserRolesUpper(auth?.user);
    if (!roles || (Array.isArray(roles) && roles.length === 0)) return true;
    const wanted = Array.isArray(roles) ? roles : [roles];
    const wantedUpper = wanted.map((r) => String(r).toUpperCase());
    return wantedUpper.some((r) => userRoles.includes(r));
  };

  const value = useMemo(
    () => ({
      auth,
      user: auth?.user || null,
      token: auth?.token || null,
      isAuthenticated: !!auth?.token && !!auth?.user,
      signIn,
      signUp,
      signOut,
      hasRole,
    }),
    [auth]
  );

  if (booting) return null; // aquí puedes poner un spinner global

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
