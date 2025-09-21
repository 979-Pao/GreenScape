import { useState } from "react";
import { adminCreatePost } from "../../../api/admin";
import AdminTopbar from "../AdminTopbar";

export default function AdminBlogForm(){
  const [form, setForm] = useState({ title:"", slug:"", content:"", status:"DRAFT" });
  const set = (k) => (e)=>setForm(f=>({...f, [k]: e.target.value}));
  const onSubmit = async (e) => {
    e.preventDefault();
    await adminCreatePost(form);
    alert("Entrada creada ✅");
  };
  return (
    <form className="card" onSubmit={onSubmit}>
      <AdminTopbar backTo="/admin/blog"/>
      <h3>Nuevo post</h3>
      <input placeholder="Título" value={form.title} onChange={set("title")} required />
      <input placeholder="Slug (opcional)" value={form.slug} onChange={set("slug")} />
      <select value={form.status} onChange={set("status")}>
        <option value="DRAFT">DRAFT</option>
        <option value="PUBLISHED">PUBLISHED</option>
      </select>
      <textarea placeholder="Contenido" value={form.content} onChange={set("content")} required />
      <button className="btn">Publicar</button>
    </form>
  );
}
