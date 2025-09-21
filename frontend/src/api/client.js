import api from "./http";

export async function clientUpdateMe(payload) {
  const { data } = await api.put("/api/client/me", payload, {
    headers: { "Content-Type": "application/json" },
  });
  return data;
}
