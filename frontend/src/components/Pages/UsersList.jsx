import { useEffect, useMemo, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { adminListUsers, adminDeleteUser } from "../../api/admin";
import Pagination from "../Common/Pagination";
import AdminTopbar from "../Admin/AdminTopbar";

const ROLES = ["CLIENT", "SUPPLIER", "ADMIN"];

const LS_KEY_INACTIVE = "greenscape_inactive_users_v1";
const loadInactiveSet = () => {
  try {
    const arr = JSON.parse(localStorage.getItem(LS_KEY_INACTIVE) || "[]");
    return new Set(Array.isArray(arr) ? arr : []);
  } catch {
    return new Set();
  }
};
const persistInactiveSet = (set) => {
  try {
    localStorage.setItem(LS_KEY_INACTIVE, JSON.stringify([...set]));
  } // eslint-disable-next-line no-empty
  catch {}
};

export default function UsersList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [sp, setSp] = useSearchParams();
  const role = sp.get("role") || ""; 
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [inactiveSet, setInactiveSet] = useState(() => loadInactiveSet());
  const [showInactive, setShowInactive] = useState(false);

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

  const toggleInactive = (id) => {
    setInactiveSet(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      persistInactiveSet(next);
      return next;
    });
  };

  const handlePillKey = (e, id) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleInactive(id);
    }
  };

  const filtered = useMemo(() => {
    const qx = q.trim().toLowerCase();
    return rows.filter(u => {
      const matches = !qx || [u.name, u.email, u.role].some(v => (v || "").toLowerCase().includes(qx));
      if (!matches) return false;
      if (!showInactive && inactiveSet.has(u.id)) return false; 
      return true;
    });
  }, [rows, q, showInactive, inactiveSet]);

  const total = filtered.length;
  const startIdx = (page - 1) * pageSize;
  const pageRows = filtered.slice(startIdx, startIdx + pageSize);

  useEffect(() => { setPage(1); }, [q, role, showInactive]);

  const statusPillStyle = (isInactive) => ({
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    padding: "2px 8px",
    borderRadius: 999,
    border: "1px solid " + (isInactive ? "#fecaca" : "#bbf7d0"),
    background: isInactive ? "#fee2e2" : "#e5f9ed",
    color: isInactive ? "#991b1b" : "#065f46",
    fontWeight: 700,
    whiteSpace: "nowrap",
    cursor: "pointer",
    userSelect: "none",
    outline: "none",
    boxShadow: "none",
    transition: "transform .06s ease, box-shadow .15s ease, opacity .15s ease",
  });

  const statusDotStyle = (isInactive) => ({
    width: 8, height: 8, borderRadius: "50%",
    background: isInactive ? "#ef4444" : "#10b981",
    boxShadow: "0 0 0 1px #fff"
  });

  return (
    <section className="container" style={{ padding: "24px 0" }}>
      <h2 className="title" style={{ color: "var(--green-medium)" }}>
        Usuarios {role ? `(${role})` : ""}
      </h2>

      <AdminTopbar toNew="/admin/users/new" newLabel="Agregar usuario" />
      {loading && <p>Cargando...</p>}
      {err && <p style={{ color: "#b42318" }}>{err}</p>}

      <div
        style={{
          display: "flex",
          gap: 12,
          flexWrap: "wrap",
          alignItems: "center",
          marginBottom: 12
        }}
      >
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

        <div style={{ marginLeft: "auto" }}>
          <label style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12 }}>
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
            />
            Mostrar inactivos
          </label>
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((u) => {
              const isInactive = inactiveSet.has(u.id);
              return (
                <tr key={u.id} style={isInactive ? { opacity: 0.55 } : undefined}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>

                  <td>
                    <span
                      role="button"
                      tabIndex={0}
                      aria-pressed={isInactive}
                      title="Toca para alternar entre ACTIVO/INACTIVO"
                      onClick={() => toggleInactive(u.id)}
                      onKeyDown={(e) => handlePillKey(e, u.id)}
                      style={statusPillStyle(isInactive)}
                      onMouseDown={(e) => { e.currentTarget.style.transform = "translateY(1px)"; }}
                      onMouseUp={(e) => { e.currentTarget.style.transform = "none"; }}
                      onBlur={(e) => { e.currentTarget.style.transform = "none"; }}
                    >
                      <span style={statusDotStyle(isInactive)} />
                      {isInactive ? "INACTIVO" : "ACTIVO"}
                    </span>
                  </td>

                  <td style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
                    <Link className="btn" to={`/admin/users/${u.id}/edit`}>Editar</Link>
                    <button className="btn" onClick={() => onDelete(u.id)}>Eliminar</button>
                  </td>
                </tr>
              );
            })}
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
