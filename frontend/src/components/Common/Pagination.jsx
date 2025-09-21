export default function Pagination({ page, setPage, pageSize, setPageSize, total }) {
const totalPages = Math.max(1, Math.ceil(total / pageSize));
const start = total === 0 ? 0 : (page - 1) * pageSize + 1;
const end = Math.min(total, page * pageSize);
return (
<div style={{display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap"}}>
<button className="btn" disabled={page <= 1} onClick={() => setPage(p => Math.max(1, p - 1))}>Anterior</button>
<span>{start}-{end} de {total}</span>
<button className="btn" disabled={page >= totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))}>Siguiente</button>
<label style={{marginLeft: "auto"}}>Por página:
<select value={pageSize} onChange={e => { setPageSize(Number(e.target.value)); setPage(1); }}>
{[5,10,20,50].map(n => <option key={n} value={n}>{n}</option>)}
</select>
</label>
</div>
);
}