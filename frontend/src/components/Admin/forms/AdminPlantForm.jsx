import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPlant as publicGetPlant } from "../../../api/plants"; 
import AdminTopbar from "../AdminTopbar";
import * as AdminApi from "../../../api/admin";

const normalizeForForm = (p = {}) => ({
  scientificName: p.scientificName ?? "",
  commonName:     p.commonName ?? "",
  name:           p.name ?? "",
  description:    p.description ?? "",
  category:       p.category ?? "",
  price:          p.price ?? "",           // string para <input type="number">
  stock:          p.stock ?? "",
  supplierId:     p.supplierId ?? p.supplier?.id ?? "",
});

const normalizeForPayload = (f = {}) => ({
  ...f,
  price:      f.price === "" ? null : Number(f.price),
  stock:      f.stock === "" ? null : Number(f.stock),
  supplierId: f.supplierId === "" ? null : Number(f.supplierId),
});

export default function AdminPlantForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState(normalizeForForm());
  const [initial, setInitial] = useState(null); // copia para calcular el diff
  const [loading, setLoading] = useState(isEdit);
  const [err, setErr] = useState("");

  // carga inicial en edición
  useEffect(() => {
    if (!isEdit) return;
    let alive = true;
    (async () => {
      try {
        setErr("");
       const data =
        (await AdminApi.adminGetPlant?.(id)) // si existiera en tu api/admin.js
        ?? (await publicGetPlant?.(id));     // fallback público
        if (!alive) return;
        const f = normalizeForForm(data || {});
        setForm(f);
        setInitial(f);
      } catch (e) {
        if (alive) setErr(e?.response?.data?.message || e?.message || "No se pudo cargar la planta");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id, isEdit]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // diff solo con campos cambiados (comparando strings del form)
  const diff = useMemo(() => {
    if (!initial) return form; // en crear, envía todo
    const entries = Object.entries(form).filter(([k, v]) => String(v) !== String(initial[k]));
    return Object.fromEntries(entries);
  }, [form, initial]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        // enviamos solo lo modificado para no sobreescribir con nulls
        const payload = normalizeForPayload(diff);
        await AdminApi.adminUpdatePlant(id, payload); // tu backend ya actualiza solo los no-nulos
      } else {
        await AdminApi.adminCreatePlant(normalizeForPayload(form));
      }
      navigate("/admin/plants");
    } catch (e2) {
      setErr(e2?.response?.data?.message || e2?.message || "Error al guardar");
    }
  };

  return (
    <section className="container" style={{ padding: "24px 0" }}>
      <AdminTopbar backTo="/admin/plants" title={isEdit ? "Editar planta" : "Nueva planta"} />
      {loading ? (
        <p>Cargando…</p>
      ) : (
        <>
          {err && <p style={{ color: "#b42318" }}>{err}</p>}
          <form className="card" onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
            <input placeholder="Nombre científico" value={form.scientificName} onChange={set("scientificName")} required />
            <input placeholder="Nombre común" value={form.commonName} onChange={set("commonName")} required />
            <input placeholder="Alias (name)" value={form.name} onChange={set("name")} />
            <input placeholder="Categoría" value={form.category} onChange={set("category")} />
            <textarea placeholder="Descripción" value={form.description} onChange={set("description")} />
            <input type="number" step="0.01" placeholder="Precio" value={form.price} onChange={set("price")} required />
            <input type="number" placeholder="Stock" value={form.stock} onChange={set("stock")} required />
            <input type="number" placeholder="Supplier ID (opcional)" value={form.supplierId} onChange={set("supplierId")} />
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn" type="submit" disabled={isEdit && Object.keys(diff).length === 0}>
                {isEdit ? "Guardar cambios" : "Guardar"}
              </button>
            </div>
          </form>
        </>
      )}
    </section>
  );
}
