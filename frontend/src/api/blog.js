import api from "./http";
export const listPosts = async () => (await api.get("/api/blog")).data;
export const getPost = async (id) => (await api.get(`/api/blog/${id}`)).data;
