import api from "./http";
export const getHealth = async () => (await api.get("/api/health")).data;
