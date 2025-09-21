import { useState } from "react";
import { adminCreatePlant } from "../../../api/admin";
import AdminTopbar from "../AdminTopbar";

export default function AdminPlantForm(){
  const [form, setForm] = useState({
    scientificName: "", commonName: "", name: "",
    description: "", category: "", price: "", stock: 0, supplierId: ""
  });

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      price: form.price === "" ? null : Number(form.price),
      stock: form.stock === "" ? null : Number(form.stock),
      supplierId: form.supplierId === "" ? null : Number(form.supplierId)
    };
    await adminCreatePlant(payload);
    alert("Planta creada ✅");
  };

  const set = (k) => (e) => setForm(f => ({...f, [k]: e.target.value}));

  return (
    <form className="card" onSubmit={onSubmit}>

       <AdminTopbar backTo="/admin/plants"/> 
      <h3>Nueva planta</h3>
      <input placeholder="Nombre científico" value={form.scientificName} onChange={set("scientificName")} required />
      <input placeholder="Nombre común" value={form.commonName} onChange={set("commonName")} required />
      <input placeholder="Alias (name)" value={form.name} onChange={set("name")} />
      <input placeholder="Categoría" value={form.category} onChange={set("category")} />
      <textarea placeholder="Descripción" value={form.description} onChange={set("description")} />
      <input type="number" step="0.01" placeholder="Precio" value={form.price} onChange={set("price")} required />
      <input type="number" placeholder="Stock" value={form.stock} onChange={set("stock")} required />
      <input type="number" placeholder="Supplier ID (opcional)" value={form.supplierId} onChange={set("supplierId")} />
      <button className="btn">Guardar</button>
    </form>
  );
}
