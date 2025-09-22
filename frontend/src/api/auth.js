import api from "./http";

// Acepta cualquier nombre típico de token que pueda devolver tu back
export async function login(email, password) {
  const { data } = await api.post("/api/auth/login", { email, password });
  const token = data?.token ?? data?.accessToken ?? data?.jwt ?? null;
  return { token, user: data?.user ?? null, raw: data };
}

export async function register({ name, email, password }) {
  const { data } = await api.post("/api/auth/register", { name, email, password });
  return data; // { token, user }
}

export async function me() {
  const { data } = await api.get("/api/auth/me");
  return data; // user
}

export function logout(redirectTo = "/login") {
  // 1) borra token/sesion local
  localStorage.removeItem("auth");
  // 2) (opcional) por si en algún lado seteaste un default
  delete api.defaults.headers?.common?.Authorization;
  // 3) redirige
  window.location.assign(redirectTo); // o usa navigate()
}
