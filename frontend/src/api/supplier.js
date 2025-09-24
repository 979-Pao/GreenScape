import api from "./http";

/* ============== KPIs del proveedor ============== */
export const getSupplierKpis = () =>
  api.get("/api/orders/supplier/kpis").then(r => r.data);

/* ============== Pedidos de compra (POs) reales ============== */
export const supplierListPurchases = (params) =>
  api.get("/api/orders/supplier/purchases", { params }).then(r => r.data);

/* ============== Acciones sobre POs ============== */
export const supplierAcceptPurchase = (id) =>
  api.put(`/api/orders/supplier/purchases/${id}/accept`).then(r => r.data);

export const supplierCompletePurchase = (id) =>
  api.put(`/api/orders/supplier/purchases/${id}/complete`).then(r => r.data);

/* ============== Perfil del proveedor ============== */
export const supplierUpdateMe = (payload) =>
  api.put("/api/supplier/me", payload).then(r => r.data);