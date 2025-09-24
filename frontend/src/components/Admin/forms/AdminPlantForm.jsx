import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getPlant as publicGetPlant } from "../../../api/plants";
import * as AdminApi from "../../../api/admin";
import AdminTopbar from "../AdminTopbar";

const normalizeForForm = (p = {}) => ({
  scientificName: p.scientificName ?? "",
  commonName:     p.commonName ?? "",
  name:           p.name ?? "",
  description:    p.description ?? "",
  category:       p.category ?? "",
  price:          p.price ?? "",
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
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!isEdit) return;
    let alive = true;

    (async () => {
      setErr("");
      setLoading(true);
      try {
        let data = null;

        // 1) intenta admin
        if (typeof AdminApi.adminGetPlant === "function") {
          try {
            data = await AdminApi.adminGetPlant(id);
          } catch (e) {
            // si falla con 401/403/404, seguimos al fallback
            console.warn("adminGetPlant falló, uso público:", e?.response?.status || e?.message);
          }
        }

        // 2) fallback público
        if (!data && typeof publicGetPlant === "function") {
          try {
            data = await publicGetPlant(id);
          } catch (e) {
            // si también falla, re-lanza y lo atrapamos abajo
            throw e;
          }
        }

        if (!alive) return;
        const f = normalizeForForm(data || {});
        setForm(f);
        setInitial(f);
      } catch (e) {
        if (alive) {
          setErr(e?.response?.data?.message || e?.message || "No se pudo cargar la planta");
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => { alive = false; };
  }, [id, isEdit]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const diff = useMemo(() => {
    if (!initial) return form; // en crear, envia todo
    const entries = Object.entries(form).filter(([k, v]) => String(v) !== String(initial[k]));
    return Object.fromEntries(entries);
  }, [form, initial]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        const payload = normalizeForPayload(diff);
        await AdminApi.adminUpdatePlant(id, payload);
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
