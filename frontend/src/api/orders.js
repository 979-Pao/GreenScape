import api from "./http";

export async function addToCart(plantId, quantity = 1) {
  const { data } = await api.post("/api/orders/cart/add", { plantId, quantity });
  return data;
}

export async function getCart() {
  const { data } = await api.get("/api/orders/cart");
  return data; 
}

export async function removeFromCart(itemId) {
  const { data } = await api.delete(`/api/orders/cart/items/${itemId}`);
  return data;
}

export async function checkout() {
  const { data } = await api.post("/api/orders/cart/checkout");
  return data; 
}

export const getMyOrderHistory = async () => {
  const { data } = await api.get("/api/orders/cart/history");
  return data;
};

// ---------- ADMIN ----------
export async function getAdminKpis() {
  const { data } = await api.get("/api/orders/admin/kpis"); 
  return data; 
}

export const getAllCustomerOrders = async () => {
  const { data } = await api.get("/api/orders");
  return data;
};



