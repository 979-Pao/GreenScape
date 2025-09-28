import api from "./http";

/* === KPIs / REPORTS === */
export const getAdminKpis = () =>
  api.get("/api/admin/reports/overview").then((r) => r.data);

/* === ORDERS (ventas a clientes) === */
export const getAllOrders = () =>
  api.get("/api/admin/orders").then((r) => r.data);

export const adminGetOrder = (id) =>
  api.get(`/api/admin/orders/${id}`).then((r) => r.data);

export const adminUpdateOrderStatus = (id, status) =>
  api
    .put(`/api/admin/orders/${id}/status`, null, { params: { status } })
    .then((r) => r.data);

/* === PURCHASE ORDERS (compras a proveedores) === */

export const adminListPurchases = () =>
  api.get("/api/admin/orders/purchases").then((r) => r.data);

export const adminCreatePurchase = (payload) =>
  api.post("/api/admin/orders/purchases", payload).then((r) => r.data);

export const adminSetPOStatus = (id, status) =>
  api
    .put(`/api/admin/orders/purchases/${id}/status`, null, { params: { status } })
    .then((r) => r.data);

export const adminDeletePurchase = (id) =>
  api.delete(`/api/admin/orders/purchases/${id}`);

/* === PLANTS === */
export const listPlants = (params = {}) =>
  api.get("/api/admin/plants", { params }).then((r) => r.data);

export const adminGetPlant = (id) =>
  api.get(`/api/admin/plants/${id}`).then((r) => r.data);

export const adminCreatePlant = (payload) =>
  api.post("/api/admin/plants", payload).then((r) => r.data);

export const adminUpdatePlant = (id, payload) =>
  api.put(`/api/admin/plants/${id}`, payload).then((r) => r.data);

export const adminDeletePlant = (id) =>
  api.delete(`/api/admin/plants/${id}`).then((r) => r.data);

/* === USERS (clientes & proveedores) === */
export const adminListUsers = (role /* optional */) =>
  api
    .get("/api/admin/users", { params: role ? { role } : {} })
    .then((r) => r.data);

export const adminGetUser = (id) =>
  api.get(`/api/admin/users/${id}`).then((r) => r.data);

export const adminCreateUser = (payload) =>
  api.post("/api/admin/users", payload).then((r) => r.data);

export const adminUpdateUser = (id, payload) =>
  api.put(`/api/admin/users/${id}`, payload).then((r) => r.data);

export const adminDeleteUser = (id) =>
  api.delete(`/api/admin/users/${id}`).then((r) => r.data);

export const adminUpdateMe = (payload) =>
  api.put("/api/admin/users/me", payload).then((r) => r.data);

/* === BLOG === */
export const adminListPosts = (params = {}) =>
  api.get("/api/admin/blog", { params }).then((r) => r.data);

export const adminGetPost = (id) =>
  api.get(`/api/admin/blog/${id}`).then((r) => r.data);

export const adminCreatePost = (payload) =>
  api.post("/api/admin/blog", payload).then((r) => r.data);

export const adminUpdatePost = (id, payload) =>
  api.put(`/api/admin/blog/${id}`, payload).then((r) => r.data);

export const adminDeletePost = (id) =>
  api.delete(`/api/admin/blog/${id}`).then((r) => r.data);