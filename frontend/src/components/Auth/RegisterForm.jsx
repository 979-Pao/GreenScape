import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext.jsx";
import ErrorComponent from "../Common/ErrorComponent";
import { Link } from "react-router-dom";

export default function RegisterForm(){
  const [name,setName]=useState(""); const [email,setEmail]=useState("");
  const [password,setPassword]=useState(""); const [err,setErr]=useState("");
  const nav=useNavigate(); const { signUp } = useAuth();

  const submit = async (e)=>{ e.preventDefault();
    try { await signUp(name,email,password); nav("/"); }
    catch { setErr("No se pudo registrar"); }
  };

  return (
    <div className="form-wrapper">
    <form onSubmit={submit} className="form">
      <h2>Registro</h2>
      {err && <ErrorComponent message={err} />}
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="Nombre" required />
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required />
      <input value={password} type="password" onChange={e=>setPassword(e.target.value)} placeholder="Contraseña" required />
      <button className="btn" type="submit">Crear cuenta</button>
    </form>
    
     <p className="pager" style={{marginTop:12, fontSize:14, color:"var(--gray-text)"}}>
     ¿Ya tienes cuenta? <Link to="/login" style={{fontWeight:700}}>Inicia sesión</Link>
     </p>
   </div>
  );
}
