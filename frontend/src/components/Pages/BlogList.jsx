import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { listPosts, adminDeletePost } from "../../api/admin";
import Pagination from "../Common/Pagination";
import DateRange from "../Common/DateRange";
import AdminTopbar from "../Admin/AdminTopbar";

const STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"];

export default function BlogList() {
const [rows, setRows] = useState([]);
const [loading, setLoading] = useState(true);
const [err, setErr] = useState("");

// filtros
const [q, setQ] = useState("");
const [status, setStatus] = useState("");
const [start, setStart] = useState("");
const [end, setEnd] = useState("");


// paginación
const [page, setPage] = useState(1);
const [pageSize, setPageSize] = useState(10);

const fetchData = useCallback(async () => {
  try { setLoading(true); setErr("");
    const data = await listPosts();
    setRows(Array.isArray(data) ? data : data?.content || []);
  } catch(e){ setErr(e?.response?.data?.message || e?.message || "No se pudo cargar el blog"); }
  finally { setLoading(false); }
}, []);

useEffect(() => { fetchData(); }, [fetchData]);

const onDelete = async (id) => {
if (!window.confirm("¿Eliminar entrada del blog?")) return;
try { await adminDeletePost(id); fetchData(); } catch (e) { alert(e?.response?.data?.message || e?.message); }
};


const filtered = useMemo(() => {
const qx = q.trim().toLowerCase();
const startDt = start ? new Date(start) : null;
const endDt = end ? new Date(end) : null;
return rows.filter(p => {
const inQ = !qx || [p.title, p.slug, p.content].some(v => (v||"").toLowerCase().includes(qx));
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


<div style={{display: "grid", gap: 8, marginBottom: 12}}>
<input placeholder="Buscar (título, slug, contenido)" value={q} onChange={e=>setQ(e.target.value)} />
<div style={{display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center"}}>
<label>Estado
<select value={status} onChange={e=>setStatus(e.target.value)}>
<option value="">Todos</option>
{STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
</select>
</label>
<DateRange start={start} end={end} setStart={setStart} setEnd={setEnd} />
</div>
</div>


<div style={{ overflowX: "auto" }}>
<table className="table">
<thead>
<tr>
<th>ID</th><th>Título</th><th>Slug</th><th>Estado</th><th>Fecha</th><th>Acciones</th>
</tr>
</thead>
<tbody>
{pageRows.map((p) => (
<tr key={p.id}>
<td>{p.id}</td>
<td>{p.title}</td>
<td>{p.slug}</td>
<td>{p.status}</td>
<td>{p.createdAt?.slice?.(0,10)}</td>
<td style={{ display: "flex", gap: 8 }}>
<Link className="btn" to={`/admin/blog/${p.id}/edit`}>Editar</Link>
<button className="btn" onClick={() => onDelete(p.id)}>Eliminar</button>
</td>
</tr>
))}
</tbody>
</table>
</div>


<Pagination page={page} setPage={setPage} pageSize={pageSize} setPageSize={setPageSize} total={total} />
</section>
);
}