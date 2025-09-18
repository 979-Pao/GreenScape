import api from "./http";

/** Agrega un item al carrito */
export async function addToCart(plantId, quantity = 1) {
  const { data } = await api.post("/api/orders/cart/add", { plantId, quantity });
  return data;
}

/** Obtiene las órdenes (o el carrito del usuario, según tu API) */
export async function getCart() {
  const { data } = await api.get("/api/orders/me");
  return data; // List<OrderDto> (o lo que devuelva tu API)
}

/** Elimina un item del carrito por plantId */
export async function removeFromCart(itemId) {
  const { data } = await api.delete(`/api/orders/cart/items/${itemId}`);
  return data;
}

/** Realiza el checkout */
export async function checkout() {
  const { data } = await api.post("/api/orders/cart/checkout");
  return data; // pedido creado, etc.
}

// GET /api/orders/me
export async function getMyOrders() {
  const { data } = await api.get("/api/orders/me");
  return data; // Array<OrderDto>
}

// ---------- ADMIN ----------
export async function getAdminKpis() {
  const { data } = await api.get("/api/orders/admin/kpis"); // o "/api/admin/kpis"
  return data; // { pendingOrders, todayRevenue, suppliersOpen, lowStock, ... }
}



