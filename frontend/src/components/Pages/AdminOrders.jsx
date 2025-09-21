import { useEffect, useState } from "react";
import { getAllCustomerOrders } from "../api/orders";
import { useAuth } from "../Context/AuthContext";

function fmtDate(iso) {
  if (!iso) return "-";
  try {
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    }).format(new Date(iso));
  } catch { return iso; }
}

function fmtMoney(v) {
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" })
    .format(Number(v ?? 0));
}

function badge(status) {
  const s = (status || "").toUpperCase();
  const cls = {
    PAID: "green",
    NEW: "blue",
    ACCEPTED: "purple",
    COMPLETED: "teal",
    CART: "gray",
  }[s] || "gray";
  return <span className={`badge ${cls}`}>{s}</span>;
}

export default function AdminOrders() {
  const { user } = useAuth(); // asumo que tienes role en user.role
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true); setErr(null);
        const data = await getAllCustomerOrders(); // GET /api/orders
        const sorted = [...(data || [])].sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        setRows(sorted);
      } catch (e) {
        setErr(e?.response?.data?.message || e?.message || "No se pudo cargar pedidos");
      } finally { setLoading(false); }
    };
    load();
  }, []);

  // (Opcional) gate simple de rol en front:
  if (user && user.role && !["ADMIN"].includes(String(user.role).toUpperCase())) {
    return <p>No tienes permiso para ver esta página.</p>;
  }

  if (loading) return <p>Cargando pedidos…</p>;
  if (err) return <p style={{ color: "crimson" }}>{err}</p>;
  if (!rows.length) return <p>No hay pedidos registrados.</p>;

  return (
    <div className="container">
      <h2>Pedidos de clientes</h2>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Fecha</th>
              <th>Cliente</th>
              <th>Estado</th>
              <th>Items</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => {
              const count = (o.items?.length) ?? 0;
              return (
                <tr key={o.id}>
                  <td>{o.id}</td>
                  <td>{fmtDate(o.createdAt)}</td>
                  <td>{o.customerName ?? o.customerId ?? "-"}</td>
                  <td>{badge(o.status)}</td>
                  <td>{count}</td>
                  <td><strong>{fmtMoney(o.total)}</strong></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
