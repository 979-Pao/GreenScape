import { useEffect, useState } from "react";
import { supplierUpdateMe } from "../../api/supplier";
import { useAuth } from "../../Context/AuthContext.jsx";
import Topbar from "../Common/Topbar";


export default function SupplierProfileForm() {
const { user } = useAuth();
const [form, setForm] = useState({ name: "", phone: "", password: "" });
const [loading, setLoading] = useState(false);


useEffect(() => {
if (user) {
setForm((f) => ({
...f,
name: user.name || "",
phone: user.phone || "",
}));
}
}, [user]);


const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));


const onSubmit = async (e) => {
e.preventDefault();
if (loading) return;
setLoading(true);
try {
await supplierUpdateMe(form);
alert("Perfil actualizado ✅");
setForm((f) => ({ ...f, password: "" })); // no dejamos la pass en memoria
} catch (err) {
alert(err?.message || "No se pudo actualizar el perfil");
} finally {
setLoading(false);
}
};


const passwordOk = !form.password || form.password.length >= 6;


return (
<form className="card" onSubmit={onSubmit} style={{ maxWidth: 520 }}>

<Topbar
  backTo="/profile"
/>

<h3>Editar mi perfil (Proveedor)</h3>
<input placeholder="Nombre" value={form.name} onChange={set("name")} />
<input placeholder="Teléfono" value={form.phone} onChange={set("phone")} />
<input
type="password"
placeholder="Nueva contraseña (min. 6)"
value={form.password}
onChange={set("password")}
/>
{!passwordOk && (
<small style={{ color: "tomato" }}>
La contraseña debe tener al menos 6 caracteres.
</small>
)}
<button className="btn" disabled={loading || !passwordOk}>
{loading ? "Guardando..." : "Guardar cambios"}
</button>
</form>
);
}
