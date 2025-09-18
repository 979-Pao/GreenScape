import { useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";
import { login as apiLogin, registerClient } from "../api/auth";

export default function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    const raw = localStorage.getItem("auth");
    return raw ? JSON.parse(raw) : { token: null, user: null };
  });

  useEffect(() => {
    localStorage.setItem("auth", JSON.stringify(auth));
  }, [auth]);

  const signIn = async (email, password) => {
    const data = await apiLogin(email, password);
    setAuth(data);
    return data;
  };

  const signUp = async (name, email, password) => {
    const data = await registerClient(name, email, password);
    if (!data.token) {
      const after = await apiLogin(email, password);
      setAuth(after);
      return after;
    }
    setAuth(data);
    return data;
  };

  const signOut = () => setAuth({ token: null, user: null });

  const value = useMemo(() => ({ ...auth, signIn, signUp, signOut }), [auth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
