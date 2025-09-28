import api from "./http";

export async function login(email, password) {
  const { data } = await api.post("/api/auth/login", { email, password });
  const token = data?.token ?? data?.accessToken ?? data?.jwt ?? null;
  return { token, user: data?.user ?? null, raw: data };
}

export async function register({ name, email, password }) {
  const { data } = await api.post("/api/auth/register", { name, email, password });
  return data; 
}

export async function me() {
  const { data } = await api.get("/api/auth/me");
  return data; 
}

export function logout(redirectTo = "/login") {

  localStorage.removeItem("auth");

  delete api.defaults.headers?.common?.Authorization;

  window.location.assign(redirectTo); 
}
