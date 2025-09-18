import { useEffect, useState } from "react";
import { getMyOrders } from "../../api/orders";

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setErr(null);
      const data = await getMyOrders(); // Espera: Array<Order>
      setOrders(Array.isArray(data) ? data : []);
    } catch (e) {
      setErr(
        e?.response?.data?.message ||
          e?.message ||
          "No se pudo cargar tu historial de pedidos."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (loading) return <p className="container">Cargando historial...</p>;
  if (err) return <p className="container" style={{ color: "#b42318" }}>{err}</p>;

  return (
    <section className="container" style={{ padding: "24px 0" }}>
      <h2 className="title" style={{ color: "var(--green-medium)" }}>
        Historial de pedidos
      </h2>

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        {orders.length === 0 && (
          <p style={{ color: "var(--gray-text)" }}>Aún no tienes pedidos.</p>
        )}

        {orders.map((o) => {
          const id = o.id ?? o.orderId ?? o.code;
          const createdAt = o.createdAt ?? o.date ?? o.created_on;
          const status = String(o.status ?? "").toUpperCase();
          const total = Number(o.total ?? 0);
          const items = Array.isArray(o.items) ? o.items : [];

          return (
            <div
              key={id}
              style={{
                background: "#fff",
                border: "1px solid #e5e7eb",
                borderRadius: 12,
                padding: 16,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <strong>Pedido #{id}</strong>
                <span className="role-badge" style={{ textTransform: "none" }}>
                  {status}
                </span>
              </div>

              <small style={{ color: "#6b7280" }}>
                {createdAt ? new Date(createdAt).toLocaleString() : "sin fecha"}
              </small>

              <ul style={{ marginTop: 10, paddingLeft: 18 }}>
                {items.map((it, idx) => {
                  const qty = Number(it.qty ?? it.quantity ?? 1);
                  const name = it.name ?? it.commonName ?? "Item";
                  const price = Number(it.price ?? 0);
                  const line = Number(it.lineTotal ?? qty * price);
                  const sci = it.scientificName ?? it.subtitle;

                  return (
                    <li key={it.itemId ?? it.id ?? idx}>
                      {qty}× {name}
                      {sci ? <span className="muted"> ({sci})</span> : null} — €
                      {line.toFixed(2)}
                    </li>
                  );
                })}
              </ul>

              <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                <strong>Total: €{total.toFixed(2)}</strong>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}