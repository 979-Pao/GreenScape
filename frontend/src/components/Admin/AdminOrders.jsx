import { useEffect, useState } from "react";
import { getAllOrders } from "../../api/admin";

export default function AdminOrders(){
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const size = 10;

  const load = async ()=>{
    const res = await getAllOrders({ status, page, size });
    setData(res);
  };

  useEffect(()=>{ load(); }, [status, page]);

  return (
    <section className="container" style={{padding:"24px 0"}}>
      <div style={{display:"flex", alignItems:"center", gap:12}}>
        <h2 className="title" style={{color:"var(--green-medium)"}}>Pedidos</h2>
        <select value={status} onChange={e=>{ setPage(0); setStatus(e.target.value); }}>
          <option value="">Todos</option>
          <option value="PENDING">Pendientes</option>
          <option value="PAID">Pagados</option>
          <option value="SHIPPED">Enviados</option>
        </select>
      </div>

      <div style={{display:"grid", gap:10, marginTop:12}}>
        {data?.content?.map(o=>(
          <div key={o.id} style={{background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:16}}>
            <div style={{display:"flex", justifyContent:"space-between"}}>
              <strong>Pedido #{o.id}</strong>
              <span className="role-badge" style={{textTransform:"none"}}>{o.status}</span>
            </div>
            <small style={{color:"#6b7280"}}>{new Date(o.createdAt).toLocaleString()}</small>
            <div style={{display:"flex", justifyContent:"flex-end", gap:8, marginTop:8}}>
              <strong>Total: €{Number(o.total).toFixed(2)}</strong>
            </div>
          </div>
        ))}
      </div>

      {data && (
        <div className="pager">
          <button className="btn ghost" disabled={data.first} onClick={()=>setPage(p=>p-1)}>Anterior</button>
          <span>Página {data.number+1} / {data.totalPages || 1}</span>
          <button className="btn ghost" disabled={data.last} onClick={()=>setPage(p=>p+1)}>Siguiente</button>
        </div>
      )}
    </section>
  );
}
