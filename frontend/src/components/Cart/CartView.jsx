import { useEffect, useState } from "react";
import { getCart, removeFromCart, checkout } from "../../api/orders";
import { useAuth } from "../../Context/AuthContext"; 

export default function CartView() {
  const [cart, setCart] = useState({ items: [], total: 0 });
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);
  const { isAuthenticated } = useAuth();

  const load = async () => {
    try {
      setLoading(true);
      setErr(null);
      const data = await getCart(); // GET /api/orders/cart
      setCart(data || { items: [], total: 0 });
    } catch (e) {
      const msg =
        e?.response?.status === 403
          ? "Inicia sesión para ver tu carrito."
          : e?.response?.data?.message || e?.message || "Error al cargar el carrito";
      setErr(msg);
      if (e?.response?.status === 403) setCart({ items: [], total: 0 });
    } finally {
      setLoading(false);
    }
  };

  // Un solo efecto, dependiente de isAuthenticated
  useEffect(() => {
    if (!isAuthenticated) {
      setCart({ items: [], total: 0 });
      setLoading(false);
      setErr(null);
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const removeItem = async (itemId) => {
    try {
      await removeFromCart(itemId); // DELETE /api/orders/cart/items/{itemId}
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || "No se pudo quitar el item");
    }
  };

  const doCheckout = async () => {
    try {
      await checkout(); // POST /api/orders/cart/checkout
      alert("¡Carrito pagado! ✅");
      await load();
    } catch (e) {
      alert(e?.response?.data?.message || "Error en checkout");
    }
  };

  if (loading) return <p>Cargando...</p>;
  if (err) return <p style={{ color: "crimson" }}>{err}</p>;
  if (!cart) return <p>No hay datos de carrito.</p>;

  const items = cart.items ?? [];
  const total = Number(cart.total ?? 0);

  return (
    <div>
      <h2>Tu carrito</h2>

      {items.length === 0 ? (
        <p>Vacío</p>
      ) : (
        <>
          <ul className="list">
            {items.map((it) => {
              const id = it.itemId ?? it.id ?? it.cartItemId; // 👈 fallback por si cambia el campo
              const qty = Number(it.quantity ?? 1);
              const lineTotal = Number(it.lineTotal ?? (it.price ?? 0) * qty);

              return (
                <li key={id} className="row">
                  <div>
                    {it.commonName ?? it.name ?? "Item"}
                    {it.scientificName ? (
                      <span className="muted"> ({it.scientificName})</span>
                    ) : null}
                  </div>
                  <div>x{qty}</div>
                  <div>€ {lineTotal.toFixed(2)}</div>
                  <button className="btn ghost" onClick={() => removeItem(id)}>
                    Quitar
                  </button>
                </li>
              );
            })}
          </ul>

          <div className="row right">
            <strong>Total: € {total.toFixed(2)}</strong>
            <button className="btn" onClick={doCheckout}>
              Pagar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
