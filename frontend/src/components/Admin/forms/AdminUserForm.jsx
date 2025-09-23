import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import * as adminApi from "../../../api/admin";   // 👈 un solo import
import AdminTopbar from "../AdminTopbar";

const normalizeForForm = (u = {}, defRole = "CLIENT") => ({
  name:  u.name  ?? "",
  email: u.email ?? "",
  role:  u.role  ?? defRole,
  phone: u.phone ?? "",
  password: "", // en edición se deja vacío
});

export default function AdminUserForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const defRole = params.get("role") || "CLIENT";

  const [form, setForm] = useState(normalizeForForm({}, defRole));
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    let alive = true;
    (async () => {
      try {
        setErr("");
        if (!adminApi.adminGetUser) {
          throw new Error("Falta adminGetUser en src/api/admin.js");
        }
        const data = await adminApi.adminGetUser(id);
        if (!alive) return;
        const f = normalizeForForm(data || {}, defRole);
        setForm(f);
        setInitial(f);
      } catch (e) {
        if (alive) setErr(e?.response?.data?.message || e?.message || "No se pudo cargar el usuario");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id, isEdit, defRole]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const diff = useMemo(() => {
    if (!initial) return form; // creación => envía todo
    const entries = Object.entries(form).filter(([k, v]) => {
      if (k === "password") return v?.length > 0; // solo si escribiste una nueva
      return String(v) !== String(initial[k]);
    });
    return Object.fromEntries(entries);
  }, [form, initial]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await adminApi.adminUpdateUser(id, diff);
      } else {
        await adminApi.adminCreateUser(form); // aquí password es requerido
      }
      navigate("/admin/users");
    } catch (e2) {
      setErr(e2?.response?.data?.message || e2?.message || "Error al guardar");
    }
  };

  return (
    <section className="container" style={{ padding: "24px 0" }}>
      <AdminTopbar backTo="/admin/users" title={isEdit ? "Editar usuario" : "Nuevo usuario"} />
      {loading ? (
        <p>Cargando…</p>
      ) : (
        <>
          {err && <p style={{ color: "#b42318" }}>{err}</p>}
          <form className="card" onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
            <input placeholder="Nombre" value={form.name} onChange={set("name")} required />
            <input type="email" placeholder="Email" value={form.email} onChange={set("email")} required />
            <input
              type="password"
              placeholder={isEdit ? "Password (opcional)" : "Password"}
              value={form.password}
              onChange={set("password")}
              required={!isEdit}
            />
            <select value={form.role} onChange={set("role")}>
              <option value="CLIENT">CLIENT</option>
              <option value="SUPPLIER">SUPPLIER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <input placeholder="Teléfono" value={form.phone} onChange={set("phone")} />
            <button className="btn" type="submit" disabled={isEdit && Object.keys(diff).length === 0}>
              {isEdit ? "Guardar cambios" : "Guardar"}
            </button>
          </form>
        </>
      )}
    </section>
  );
}

