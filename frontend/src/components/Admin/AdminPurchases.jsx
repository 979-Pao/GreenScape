import { useEffect, useMemo, useState } from "react";
import { adminListPurchases } from "../../api/admin";

export default function AdminPurchases() {
  const [all, setAll] = useState([]);      // todos los registros (no paginado desde backend)
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const size = 10;

  const money = useMemo(
    () => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }),
    []
  );

  const load = async () => {
    try {
      setLoading(true);
      setErr("");
      const res = await adminListPurchases(); // <- sin params: devuelve List<OrderDto>
      setAll(Array.isArray(res) ? res : []);
      setPage(0); // vuelve a la primera página al recargar
    } catch (e) {
      console.error(e);
      setErr(e?.response?.data?.message || e?.message || "No se pudieron cargar las compras.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  // Filtro + paginación en cliente
  const filtered = status ? all.filter(p => p.status === status) : all;
  const totalPages = Math.max(1, Math.ceil(filtered.length / size));
  const pageSafe = Math.min(page, totalPages - 1);
  const start = pageSafe * size;
  const content = filtered.slice(start, start + size);

  const isFirst = pageSafe === 0;
  const isLast = pageSafe >= totalPages - 1;

  // Si cambias el filtro, resetea a página 0
  useEffect(() => { setPage(0); }, [status]);

  return (
    <section className="container" style={{ padding: "24px 0" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <h2 className="title" style={{ color: "var(--green-medium)" }}>Compras a proveedores</h2>
        <select
          value={status}
          onChange={e => setStatus(e.target.value)}
          style={{ padding: 6, borderRadius: 8, border: "1px solid #e5e7eb" }}
        >
          <option value="">Todas</option>
          <option value="OPEN">Abiertas</option>
          <option value="SENT">Enviadas</option>
          <option value="RECEIVED">Recibidas</option>
          {/* Ajusta estos valores al ENUM real del backend si difieren */}
        </select>
      </div>

      {loading && <p>Cargando compras...</p>}
      {!loading && err && <p style={{ color: "#b42318" }}>{err}</p>}

      <div style={{ display: "grid", gap: 10, marginTop: 12, opacity: loading ? 0.6 : 1 }}>
        {content.map(p => (
          <div key={p.id} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>Compra #{p.id}</strong>
              <span className="role-badge" style={{ textTransform: "none" }}>{p.status}</span>
            </div>
            <small style={{ color: "#6b7280" }}>Proveedor: {p.supplierName}</small>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8 }}>
              <strong>Total: {money.format(Number(p.total) || 0)}</strong>
            </div>
          </div>
        ))}

        {!loading && content.length === 0 && (
          <p style={{ color: "#6b7280" }}>No hay compras para mostrar.</p>
        )}
      </div>

      {filtered.length > 0 && (
        <div className="pager" style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 12 }}>
          <button className="btn ghost" disabled={isFirst} onClick={() => setPage(p => Math.max(0, p - 1))}>
            Anterior
          </button>
          <span>Página {pageSafe + 1} / {totalPages}</span>
          <button className="btn ghost" disabled={isLast} onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}>
            Siguiente
          </button>
        </div>
      )}
    </section>
  );
}
