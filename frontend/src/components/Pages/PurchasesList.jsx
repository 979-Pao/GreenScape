import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { getAllOrders, adminListPurchases, adminDeletePurchase, adminSetPOStatus,} from "../../api/admin";
import Pagination from "../Common/Pagination";
import DateRange from "../Common/DateRange";
import AdminTopbar from "../Admin/AdminTopbar";

// Opciones por tipo
const ORDER_STATUSES = ["PAID", "SHIPPED", "CANCELED"];
const PURCHASE_STATUSES = ["NEW", "ACCEPTED", "COMPLETED"];

export default function PurchasesList() {
  const [tab, setTab] = useState("purchases"); // "purchases" | "orders"
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // filtros
  const [status, setStatus] = useState("");
  const [supplier, setSupplier] = useState(""); // solo purchases
  const [q, setQ] = useState("");               // cliente/proveedor/ID
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  // paginación
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setErr("");
      const data = tab === "purchases" ? await adminListPurchases() : await getAllOrders();
      setRows(Array.isArray(data) ? data : data?.content || []);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "No se pudieron cargar los registros");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Al cambiar de pestaña, limpiar estado para no dejar uno inválido
  useEffect(() => { setStatus(""); }, [tab]);

  const filtered = useMemo(() => {
    const qx = q.trim().toLowerCase();
    const startDt = start ? new Date(start) : null;
    const endDt = end ? new Date(end) : null;

    return rows.filter((o) => {
      const inStatus = !status || o.status === status;
      const inSupplier =
        tab !== "purchases" ||
        !supplier ||
        (o.supplierName || o.supplier?.name || "")
          .toLowerCase()
          .includes(supplier.toLowerCase());
      const idStr = String(o.id || "");
      const who =
        tab === "purchases"
          ? o.supplierName || o.supplier?.name
          : o.customerName || o.customer?.name;
      const inQ = !qx || [idStr, who].some((v) => (v || "").toLowerCase().includes(qx));
      const created = o.createdAt ? new Date(o.createdAt) : null;
      const inStart = !startDt || (created && created >= startDt);
      const inEnd = !endDt || (created && created <= endDt);
      return inStatus && inSupplier && inQ && inStart && inEnd;
    });
  }, [rows, status, supplier, q, start, end, tab]);

  const total = filtered.length;
  const startIdx = (page - 1) * pageSize;
  const pageRows = filtered.slice(startIdx, startIdx + pageSize);

  useEffect(() => { setPage(1); }, [status, supplier, q, start, end, tab]);

  const onDeletePurchase = async (id) => {
    if (!window.confirm("¿Eliminar compra a proveedor?")) return;
    try { await adminDeletePurchase(id); fetchData(); }
    catch (e) { alert(e?.response?.data?.message || e?.message); }
  };

  const onChangeStatus = async (id, next) => {
    try { await adminSetPOStatus(id, next); fetchData(); }
    catch (e) { alert(e?.response?.data?.message || e?.message); }
  };

  const tabBtn = (active) => ({
    opacity: active ? 1 : 0.85,
    outline: active ? "2px solid #111" : "none",
  });

  // Opciones de estado según pestaña (para el filtro)
  const STATUS_OPTIONS = tab === "orders" ? ORDER_STATUSES : PURCHASE_STATUSES;

  return (
    <section className="container" style={{ padding: "24px 0" }}>
      <h2 className="title" style={{ color: "var(--green-medium)" }}>
        Ventas / Compras
      </h2>

      {/* corregido a plural */}
      <AdminTopbar toNew="/admin/purchases/new" newLabel="Nueva compra a proveedor" />

      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <button
          type="button"
          className="btn"
          aria-pressed={tab === "orders"}
          style={tabBtn(tab === "orders")}
          onClick={() => setTab("orders")}
        >
          Ventas (clientes)
        </button>
        <button
          type="button"
          className="btn"
          aria-pressed={tab === "purchases"}
          style={tabBtn(tab === "purchases")}
          onClick={() => setTab("purchases")}
        >
          Compras (proveedores)
        </button>
      </div>

      {loading && <p>Cargando...</p>}
      {err && <p style={{ color: "#b42318" }}>{err}</p>}

      <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <label>
            Estado{" "}
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Todos</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>

          {tab === "purchases" && (
            <input
              placeholder="Proveedor"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
            />
          )}

          <input
            placeholder="Buscar (ID, nombre)"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <DateRange start={start} end={end} setStart={setStart} setEnd={setEnd} />
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              {tab === "purchases" ? <th>Proveedor</th> : <th>Cliente</th>}
              <th>Estado</th>
              <th>Total</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((o) => (
              <tr key={o.id}>
                <td>{o.id}</td>
                {tab === "purchases"
                  ? <td>{o.supplierName || o.supplier?.name}</td>
                  : <td>{o.customerName || o.customer?.name}</td>}

                <td>
                  {tab === "purchases" ? (
                    // Solo estados válidos para compras
                    <select
                      value={o.status}
                      onChange={(e) => onChangeStatus(o.id, e.target.value)}
                    >
                      {PURCHASE_STATUSES.map((s) => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  ) : (
                    // Ventas: solo mostramos
                    o.status
                  )}
                </td>

                <td>{o.total}</td>
                <td>{o.createdAt?.slice?.(0, 10)}</td>
                <td style={{ display: "flex", gap: 8 }}>
                  {tab === "purchases" ? (
                    <>
                      <Link className="btn" to={`/admin/purchases/${o.id}/edit`}>Editar</Link>
                      <button className="btn" onClick={() => onDeletePurchase(o.id)}>Eliminar</button>
                    </>
                  ) : (
                    <Link className="btn" to={`/admin/orders/${o.id}`}>Ver</Link>
                  )}
                </td>
              </tr>
            ))}
            {pageRows.length === 0 && !loading && (
              <tr><td colSpan={6} style={{ textAlign: "center" }}>Sin resultados</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page}
        setPage={setPage}
        pageSize={pageSize}
        setPageSize={setPageSize}
        total={total}
      />
    </section>
  );
}
