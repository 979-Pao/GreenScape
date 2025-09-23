import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  adminCreatePost,
  adminUpdatePost,
  adminGetPost, // GET /api/admin/blog/:id
} from "../../../api/admin";
import { getPost as publicGetPost } from "../../../api/blog"; // fallback público
import AdminTopbar from "../AdminTopbar";

const normalizeForForm = (p = {}) => ({
  title:   p.title   ?? "",
  slug:    p.slug    ?? "",
  content: p.content ?? "",
  status:  p.status  ?? "DRAFT", // "DRAFT" | "PUBLISHED"
});

export default function AdminBlogForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();

  const [form, setForm] = useState(normalizeForForm());
  const [initial, setInitial] = useState(null);
  const [loading, setLoading] = useState(isEdit);
  const [err, setErr] = useState("");

  // Carga inicial (edición)
  useEffect(() => {
    if (!isEdit) return;
    let alive = true;
    (async () => {
      try {
        setErr("");
        const data = (await adminGetPost?.(id)) ?? (await publicGetPost?.(id));
        if (!alive) return;
        const f = normalizeForForm(data || {});
        setForm(f);
        setInitial(f);
      } catch (e) {
        if (alive) setErr(e?.response?.data?.message || e?.message || "No se pudo cargar el post");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id, isEdit]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  // Solo enviar cambios cuando editas
  const diff = useMemo(() => {
    if (!initial) return form; // en creación, envía todo
    const entries = Object.entries(form).filter(([k, v]) => String(v) !== String(initial[k]));
    return Object.fromEntries(entries);
  }, [form, initial]);

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) await adminUpdatePost(id, diff);
      else        await adminCreatePost(form);
      navigate("/admin/blog");
    } catch (e2) {
      setErr(e2?.response?.data?.message || e2?.message || "Error al guardar");
    }
  };

  return (
    <section className="container" style={{ padding: "24px 0" }}>
      <AdminTopbar backTo="/admin/blog" title={isEdit ? "Editar post" : "Nuevo post"} />
      {loading ? (
        <p>Cargando…</p>
      ) : (
        <>
          {err && <p style={{ color: "#b42318" }}>{err}</p>}
          <form className="card" onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
            <input placeholder="Título" value={form.title} onChange={set("title")} required />
            <input placeholder="Slug (opcional)" value={form.slug} onChange={set("slug")} />
            <select value={form.status} onChange={set("status")}>
              <option value="DRAFT">DRAFT</option>
              <option value="PUBLISHED">PUBLISHED</option>
            </select>
            <textarea placeholder="Contenido" value={form.content} onChange={set("content")} required />
            <button className="btn" type="submit" disabled={isEdit && Object.keys(diff).length === 0}>
              {isEdit ? "Guardar cambios" : "Publicar"}
            </button>
          </form>
        </>
      )}
    </section>
  );
}
