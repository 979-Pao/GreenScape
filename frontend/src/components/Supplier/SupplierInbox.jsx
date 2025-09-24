import { useCallback, useEffect, useState } from "react";
import { getSupplierKpis, supplierListPurchases, supplierAcceptPurchase, supplierCompletePurchase,} from "../../api/supplier";

function Kpi({ label, value }) {
  return (
    <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:12 }}>
      <div style={{ color:"var(--gray-text)", fontSize:12 }}>{label}</div>
      <div style={{ fontWeight:800, fontSize:18 }}>{value}</div>
    </div>
  );
}

function StatusPill({ s }) {
  return (
    <span className="role-badge" style={{ textTransform:"none" }}>
      {s}
    </span>
  );
}

export default function SupplierInbox() {
  const [kpi, setKpi] = useState(null);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // paginación (client-side)
  const [page, setPage] = useState(1);      // 1-based
  const [pageSize, setPageSize] = useState(10);

  const fetchAll = useCallback(async () => {
    setLoading(true); setErr("");
    try {
      const [k, list] = await Promise.all([
        getSupplierKpis(),       // opcional: { pending, openThreads, ... }
        supplierListPurchases(), // List<OrderDto> (POs del supplier)
      ]);

      // normaliza lista y ordena por fecha desc
      const arr = Array.isArray(list) ? [...list] : (list?.content || []);
      arr.sort((a,b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
      setRows(arr);

      // KPIs con fallback calculado en frontend
      const pendingCount = (k?.pending != null)
        ? k.pending
        : arr.filter(o => o.status === "NEW").length;

      const openThreads = (k?.openThreads != null)
        ? k.openThreads
        : pendingCount + arr.filter(o => o.status === "ACCEPTED").length;

      setKpi({
        pending: pendingCount,
        openThreads,
        totalPos: arr.length, // NUEVO: PO totales
      });

      // si la página actual quedó fuera de rango tras refrescar, reajusta
      const totalPagesNow = Math.max(1, Math.ceil(arr.length / pageSize));
      if (page > totalPagesNow) setPage(totalPagesNow);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "No se pudo cargar el inbox del proveedor");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const onAccept = async (id) => {
    try {
      await supplierAcceptPurchase(id);
      await fetchAll();
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "No se pudo aceptar el pedido");
    }
  };

  const onComplete = async (id) => {
    try {
      await supplierCompletePurchase(id);
      await fetchAll();
    } catch (e) {
      alert(e?.response?.data?.message || e?.message || "No se pudo marcar como completado");
    }
  };

  // cálculo de la página actual
  const total = rows.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const startIdx = (page - 1) * pageSize;
  const pageRows = rows.slice(startIdx, startIdx + pageSize);

  return (
    <section className="container" style={{ padding:"24px 0" }}>
      <h2 className="title" style={{ color:"var(--green-medium)" }}>Inbox Proveedor</h2>

      {err && <p style={{ color:"#b42318", marginTop:8 }}>{err}</p>}

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px,1fr))", gap:12, marginTop:12 }}>
        <Kpi label="Pendientes"     value={kpi?.pending ?? "—"} />
        <Kpi label="Hilos abiertos" value={kpi?.openThreads ?? "—"} />
        <Kpi label="PO totales"     value={kpi?.totalPos ?? (total || "—")} />
      </div>

      {loading ? (
        <p style={{ marginTop:12 }}>Cargando…</p>
      ) : (
        <>
          <div style={{ display:"grid", gap:10, marginTop:16 }}>
            {pageRows.map(po => (
              <div key={po.id} style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:16 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", gap:12 }}>
                  <div>
                    <strong>PO #{po.id}</strong>
                    <div style={{ color:"#6b7280", fontSize:12 }}>
                      {po.createdAt ? new Date(po.createdAt).toLocaleString() : "—"} · Total: {po.total ?? "—"}
                    </div>
                  </div>
                  <StatusPill s={po.status} />
                </div>

                {!!po.items?.length && (
                  <ul style={{ margin:"8px 0 0 0", paddingLeft:18, color:"#374151" }}>
                    {po.items.slice(0,3).map(it => (
                      <li key={it.itemId || `${it.plantId}-${it.commonName}`}>
                        {it.commonName || it.scientificName} × {it.quantity}
                      </li>
                    ))}
                    {po.items.length > 3 && <li>…</li>}
                  </ul>
                )}

                <div style={{ display:"flex", gap:8, marginTop:12 }}>
                  {po.status === "NEW" && (
                    <button className="btn" onClick={() => onAccept(po.id)}>Aceptar</button>
                  )}
                  {po.status === "ACCEPTED" && (
                    <button className="btn" onClick={() => onComplete(po.id)}>Marcar completado</button>
                  )}
                </div>
              </div>
            ))}

            {total === 0 && (
              <div style={{ background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:16 }}>
                <em>No hay pedidos de compra.</em>
              </div>
            )}
          </div>

          {/* Paginación al final */}
          {total > 0 && (
            <div className="pager" style={{ display:"flex", flexWrap:"wrap", gap:8, alignItems:"center", justifyContent:"space-between", marginTop:16 }}>
              <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                <button className="btn ghost" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>
                  Anterior
                </button>
                <span>Página {page} / {totalPages}</span>
                <button className="btn ghost" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>
                  Siguiente
                </button>
              </div>

              <label style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ color:"#6b7280" }}>Por página</span>
                <select
                  value={pageSize}
                  onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </label>
            </div>
          )}
        </>
      )}
    </section>
  );
}
