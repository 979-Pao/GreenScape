import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext.jsx";
import ErrorComponent from "../Common/ErrorComponent";

export default function LoginForm(){
  const [email,setEmail]=useState(""); const [password,setPassword]=useState("");
  const [err,setErr]=useState(""); const nav=useNavigate();
  const { signIn } = useAuth();

  const submit = async (e)=>{ e.preventDefault();
    try { await signIn(email,password); nav("/"); }
    catch { setErr("Credenciales inválidas"); }
  };

  return (
    <form onSubmit={submit} className="form">
      <h2>Entrar</h2>
      {err && <ErrorComponent message={err} />}
      <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" required />
      <input value={password} type="password" onChange={e=>setPassword(e.target.value)} placeholder="Contraseña" required />
      <button className="btn" type="submit">Entrar</button>
    </form>
  );
}
