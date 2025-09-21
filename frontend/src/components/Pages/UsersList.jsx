import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { adminListUsers, adminDeleteUser } from "../../api/admin";
import Pagination from "../Common/Pagination";
import AdminTopbar from "../Admin/AdminTopbar";

const ROLES = ["CLIENT", "SUPPLIER", "ADMIN"];

export default function UsersList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [sp, setSp] = useSearchParams();     // <-- ahora sí con setSp

  // query param role (AdminController admite un solo role)
  const role = sp.get("role") || ""; // vacío = todos

  // filtros
  const [q, setQ] = useState("");

  // paginación
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true); setErr("");
      const data = await adminListUsers(role || undefined);
      setRows(Array.isArray(data) ? data : data?.content || []);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "No se pudieron cargar los usuarios");
    } finally {
      setLoading(false);
    }
  }, [role]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onDelete = async (id) => {
    if (!window.confirm("¿Eliminar usuario?")) return;
    try { await adminDeleteUser(id); fetchData(); }
    catch (e) { alert(e?.response?.data?.message || e?.message); }
  };

  const filtered = useMemo(() => {
    const qx = q.trim().toLowerCase();
    return rows.filter(u =>
      !qx || [u.name, u.email, u.role].some(v => (v || "").toLowerCase().includes(qx))
    );
  }, [rows, q]);

  const total = filtered.length;
  const startIdx = (page - 1) * pageSize;
  const pageRows = filtered.slice(startIdx, startIdx + pageSize);
  useEffect(() => { setPage(1); }, [q, role]);

  return (
    <section className="container" style={{ padding: "24px 0" }}>
      <h2 className="title" style={{ color: "var(--green-medium)" }}>
        Usuarios {role ? `(${role})` : ""}
      </h2>
      <AdminTopbar toNew="/admin/users/new" newLabel="Agregar usuario" />
      {loading && <p>Cargando...</p>}
      {err && <p style={{ color: "#b42318" }}>{err}</p>}

      <div style={{display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 12}}>
        <label>Rol
          <select
            value={role}
            onChange={e => {
              const v = e.target.value;
              v ? sp.set("role", v) : sp.delete("role");
              setSp(sp, { replace: true });
            }}
          >
            <option value="">Todos</option>
            {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </label>

        <input
          placeholder="Buscar (nombre / email)"
          value={q}
          onChange={e=>setQ(e.target.value)}
        />
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th><th>Nombre</th><th>Email</th><th>Rol</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td style={{ display: "flex", gap: 8 }}>
                  <Link className="btn" to={`/admin/users/${u.id}/edit`}>Editar</Link>
                  <button className="btn" onClick={() => onDelete(u.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={page} setPage={setPage}
        pageSize={pageSize} setPageSize={setPageSize}
        total={total}
      />
    </section>
  );
}