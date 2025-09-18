import api from "./http";

// Acepta cualquier nombre típico de token que pueda devolver tu back
export async function login(email, password) {
  const { data } = await api.post("/api/auth/login", { email, password });
  const token = data?.token ?? data?.accessToken ?? data?.jwt ?? null;
  return { token, user: data?.user ?? null, raw: data };
}


export async function me() {
  const { data } = await api.get("/api/auth/me");
  return data; // user
}

export async function logout() {
  try {
    await api.post("/api/auth/logout");
  } catch (err) {
    if (import.meta?.env?.DEV) console.warn("logout() falló:", err?.response?.status, err?.message);
  } finally {
    // MUY IMPORTANTE: quita el Authorization por si estaba seteado por defecto
    delete api.defaults.headers.common.Authorization;
  }
}
