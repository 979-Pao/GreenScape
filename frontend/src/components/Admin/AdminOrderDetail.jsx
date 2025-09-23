import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { adminGetOrder, adminUpdateOrderStatus } from "../../api/admin";

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  const money = useMemo(
    () => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }),
    []
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const data = await adminGetOrder(id);
        if (alive) setOrder(data);
      } catch (e) {
        if (alive)
          setErr(
            e?.response?.data?.message || e?.message || "No se pudo cargar el pedido"
          );
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const setStatus = async (next) => {
    try {
      const updated = await adminUpdateOrderStatus(order.id, next);
      setOrder(updated);
      alert("Estado actualizado");
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "No se pudo actualizar");
    }
  };

  if (loading) {
    return (
      <section className="container">
        <p>Cargando…</p>
      </section>
    );
  }
  if (err) {
    return (
      <section className="container">
        <p style={{ color: "#b42318" }}>{err}</p>
      </section>
    );
  }
  if (!order) return null;

  const canShip = order.status === "PAID";
  const canCancel = order.status === "PAID";

  return (
    <section className="container" style={{ padding: "24px 0", display: "grid", gap: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2 className="title" style={{ margin: 0, color: "var(--green-medium)" }}>
          Pedido #{order.id}
        </h2>
        <Link className="btn ghost" to="/admin/purchases">
          ← Volver al listado
        </Link>
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <p>
          <b>Cliente:</b> {order.customerName || order.customer?.name || "—"}
        </p>
        <p>
          <b>Estado:</b> {order.status}
        </p>
        <p>
          <b>Total:</b>{" "}
          {typeof order.total === "number"
            ? money.format(order.total)
            : money.format(Number(order.total || 0))}
        </p>
        <p>
          <b>Fecha:</b> {order.createdAt?.slice?.(0, 10) || "—"}
        </p>

        <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <button className="btn" disabled={!canShip} onClick={() => setStatus("SHIPPED")}>
            Marcar como enviado
          </button>
          <button
            className="btn ghost"
            disabled={!canCancel}
            onClick={() => setStatus("CANCELED")}
          >
            Cancelar
          </button>
        </div>
      </div>

      <div
        style={{
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <h3 style={{ marginTop: 0 }}>Items</h3>
        <table className="table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Cantidad</th>
              <th>Precio</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {(order.items || []).map((it) => {
              const name = it.commonName || it.scientificName || `#${it.plantId}`;
              const unit = typeof it.unitPrice === "number"
                ? money.format(it.unitPrice)
                : money.format(Number(it.unitPrice || 0));
              const sub = typeof it.lineTotal === "number"
                ? money.format(it.lineTotal)
                : money.format(Number(it.lineTotal || 0));
              return (
                <tr key={it.itemId ?? `${it.plantId}-${name}`}>
                  <td>{name}</td>
                  <td>{it.quantity}</td>
                  <td>{unit}</td>
                  <td>{sub}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}