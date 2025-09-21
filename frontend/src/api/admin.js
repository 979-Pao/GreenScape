import api from "./http";

/* ===================== KPIs / REPORTS ===================== */
export const getAdminKpis = () =>
  api.get("/api/admin/reports/overview").then(r => r.data);

/* ===================== ORDERS (ventas a clientes) ===================== */
// Tu backend devuelve List<OrderDto> (no paginado)
export const getAllOrders = () =>
  api.get("/api/admin/orders").then(r => r.data);

/* ===================== PURCHASE ORDERS (compras a proveedores) ===================== */
// List<OrderDto> (tipo PURCHASE)
export const adminListPurchases = () =>
  api.get("/api/admin/orders/purchases").then(r => r.data);

// Crear PO: { supplierId, items:[{ plantId, quantity }] }
export const adminCreatePurchase = (payload) =>
  api.post("/api/admin/orders/purchases", payload).then(r => r.data);

// Cambiar estado: ?status=NEW|ACCEPTED|COMPLETED|CANCELED
export const adminSetPOStatus = (id, status) =>
  api.put(`/api/admin/orders/purchases/${id}/status`, null, { params: { status } })
     .then(r => r.data);

// Eliminar PO (sólo NEW/CANCELED según tu regla)
export const adminDeletePurchase = (id) =>
  api.delete(`/api/admin/orders/purchases/${id}`);

/* ===================== PLANTS ===================== */
export const adminCreatePlant = (payload) =>
  api.post("/api/admin/plants", payload).then(r => r.data);

export const adminUpdatePlant = (id, payload) =>
  api.put(`/api/admin/plants/${id}`, payload).then(r => r.data);

export const adminDeletePlant = (id) =>
  api.delete(`/api/admin/plants/${id}`).then(r => r.data);

export const listPlants = (params = {}) =>
  api.get("/api/admin/plants", { params }).then(r => r.data);

/* ===================== USERS (clientes & proveedores) ===================== */
export const adminListUsers = (role /* optional */) =>
  api.get("/api/admin/users", { params: role ? { role } : {} }).then(r => r.data);

export const adminCreateUser = (payload) =>
  api.post("/api/admin/users", payload).then(r => r.data);

export const adminUpdateUser = (id, payload) =>
  api.put(`/api/admin/users/${id}`, payload).then(r => r.data);

export const adminDeleteUser = (id) =>
  api.delete(`/api/admin/users/${id}`).then(r => r.data);

export const adminUpdateMe = (payload) =>
  api.put("/api/admin/users/me", payload).then(r => r.data);

/* ===================== BLOG ===================== */
export const adminCreatePost = (payload) =>
  api.post("/api/admin/blog", payload).then(r => r.data);

export const adminUpdatePost = (id, payload) =>
  api.put(`/api/admin/blog/${id}`, payload).then(r => r.data);

export const adminDeletePost = (id) =>
  api.delete(`/api/admin/blog/${id}`).then(r => r.data);

export const listPosts = (params = {}) =>
  api.get("/api/admin/blog", { params }).then(r => r.data)
