import { useState } from "react";
import { adminUpdateMe } from "../../../api/admin";
import AdminTopbar from "../AdminTopbar";

export default function AdminProfileForm(){
  const [form, setForm] = useState({ name:"", phone:"", password:"" });
  const set = (k)=>(e)=>setForm(f=>({...f,[k]:e.target.value}));
  const onSubmit = async (e) => {
    e.preventDefault();
    await adminUpdateMe(form);
    alert("Perfil actualizado ✅");
  };
  return (
    <form className="card" onSubmit={onSubmit}>

     <AdminTopbar backTo="/profile"/> 
      <h3>Editar mi perfil (Admin)</h3>
      <input placeholder="Nombre" value={form.name} onChange={set("name")} />
      <input placeholder="Teléfono" value={form.phone} onChange={set("phone")} />
      <input type="password" placeholder="Nueva contraseña" value={form.password} onChange={set("password")} />
      <button className="btn">Guardar cambios</button>
    </form>
  );
}
