import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { adminCreateUser } from "../../../api/admin";
import AdminTopbar from "../AdminTopbar";

export default function AdminUserForm(){
  const [params] = useSearchParams();
  const defRole = params.get("role") || "CLIENT";
  const [form, setForm] = useState({ name:"", email:"", password:"", role:defRole, phone:"" });

  const onSubmit = async (e) => {
    e.preventDefault();
    await adminCreateUser(form);
    alert("Usuario creado ✅");
  };
  const set = (k) => (e)=>setForm(f=>({...f, [k]: e.target.value}));

  return (
    <form className="card" onSubmit={onSubmit}>
      <AdminTopbar backTo="/admin/users"/>
      <h3>Nuevo usuario</h3>
      <input placeholder="Nombre" value={form.name} onChange={set("name")} required />
      <input type="email" placeholder="Email" value={form.email} onChange={set("email")} required />
      <input type="password" placeholder="Password" value={form.password} onChange={set("password")} required />
      <select value={form.role} onChange={set("role")}>
        <option>CLIENT</option>
        <option>SUPPLIER</option>
        <option>ADMIN</option>
      </select>
      <input placeholder="Teléfono" value={form.phone} onChange={set("phone")} />
      <button className="btn">Guardar</button>
    </form>
  );
}
