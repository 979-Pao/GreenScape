import { useEffect, useState } from "react";
import { getMyOrderHistory } from "../api/orders";
import { useAuth } from "../Context/AuthContext";

function fmtDate(iso) {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    // dd/MM/yyyy HH:mm
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(d);
  } catch {
    return iso;
  }
}

function fmtMoney(v) {
  const n = Number(v ?? 0);
  return new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(n);
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

export default function ClientOrderHistory() {
  const { isAuthenticated } = useAuth();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setErr(null);
        if (!isAuthenticated) {
          setRows([]);
          return;
        }
        const data = await getMyOrderHistory(); // GET /api/orders/cart/history
        // Si el back no ordena desc, ordenamos por createdAt desc aquí:
        const sorted = [...(data || [])].sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        setRows(sorted);
      } catch (e) {
        setErr(e?.response?.data?.message || e?.message || "No se pudo cargar el historial");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [isAuthenticated]);

  if (!isAuthenticated) return <p>Inicia sesión para ver tu historial.</p>;
  if (loading) return <p>Cargando historial…</p>;
  if (err) return <p style={{ color: "crimson" }}>{err}</p>;

  if (!rows.length) return <p>No tienes pedidos aún. ¿Unas plantitas? 🌱</p>;

  return (
    <div className="container">
      <h2>Mis pedidos</h2>
      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>#</th>
              <th>Fecha</th>
              <th>Estado</th>
              <th>Items</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((o) => {
              const count = (o.items?.length) ?? 0;
              return (
                <tr key={o.id ?? `${o.createdAt}-${Math.random()}`}>
                  <td>{o.id ?? "-"}</td>
                  <td>{fmtDate(o.createdAt)}</td>
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
