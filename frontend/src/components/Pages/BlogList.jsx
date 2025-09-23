import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";

// ✅ un único import por namespace del módulo admin
import * as adminApi from "../../api/admin";
// ✅ fallback al listado público si el admin no existe
import { listPosts as publicListPosts } from "../../api/blog";

import Pagination from "../Common/Pagination";
import DateRange from "../Common/DateRange";
import AdminTopbar from "../Admin/AdminTopbar";

const STATUSES = ["DRAFT", "PUBLISHED"];

export default function AdminBlogList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // filtros
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");

  // paginación (client-side)
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setErr("");

      // 👉 si adminListPosts no existe, usa el público
      const fetcher = adminApi.adminListPosts ?? publicListPosts;
      const data = await fetcher();

      setRows(Array.isArray(data) ? data : data?.content || []);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "No se pudo cargar el blog");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onDelete = async (id) => {
    if (!window.confirm("¿Eliminar entrada del blog?")) return;
    try {
      if (!adminApi.adminDeletePost) {
        alert("Falta adminDeletePost en src/api/admin.js");
        return;
      }
      await adminApi.adminDeletePost(id);
      fetchData();
    } catch (e) {
      alert(e?.response?.data?.message || e?.message);
    }
  };

  const filtered = useMemo(() => {
    const qx = q.trim().toLowerCase();
    const startDt = start ? new Date(start) : null;
    const endDt = end ? new Date(end) : null;

    return rows.filter((p) => {
      const inQ = !qx || [p.title, p.slug, p.content].some((v) => (v || "").toLowerCase().includes(qx));
      const inStatus = !status || p.status === status;
      const created = p.createdAt ? new Date(p.createdAt) : null;
      const inStart = !startDt || (created && created >= startDt);
      const inEnd = !endDt || (created && created <= endDt);
      return inQ && inStatus && inStart && inEnd;
    });
  }, [rows, q, status, start, end]);

  const total = filtered.length;
  const startIdx = (page - 1) * pageSize;
  const pageRows = filtered.slice(startIdx, startIdx + pageSize);

  useEffect(() => { setPage(1); }, [q, status, start, end]);

  return (
    <section className="container" style={{ padding: "24px 0" }}>
      <h2 className="title" style={{ color: "var(--green-medium)" }}>Blog</h2>
      <AdminTopbar toNew="/admin/blog/new" newLabel="Nueva entrada" />

      {loading && <p>Cargando...</p>}
      {err && <p style={{ color: "#b42318" }}>{err}</p>}

      <div style={{ display: "grid", gap: 8, marginBottom: 12 }}>
        <input
          placeholder="Buscar (título, slug, contenido)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <label>
            Estado{" "}
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Todos</option>
              {STATUSES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </label>
          <DateRange start={start} end={end} setStart={setStart} setEnd={setEnd} />
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Slug</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.title}</td>
                <td>{p.slug}</td>
                <td>{p.status}</td>
                <td>{p.createdAt?.slice?.(0, 10)}</td>
                <td style={{ display: "flex", gap: 8 }}>
                  <Link to={`/admin/blog/${p.id}/edit`} className="btn">Editar</Link>
                  <button className="btn" onClick={() => onDelete(p.id)}>Eliminar</button>
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
