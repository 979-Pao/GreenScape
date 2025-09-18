import { useEffect, useState } from "react";
import { getAdminPurchases } from "../../api/admin";

export default function AdminPurchases(){
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);
  const size = 10;

  const load = async ()=>{
    const res = await getAdminPurchases({ status, page, size });
    setData(res);
  };

  useEffect(()=>{ load(); }, [status, page]);

  return (
    <section className="container" style={{padding:"24px 0"}}>
      <div style={{display:"flex", alignItems:"center", gap:12}}>
        <h2 className="title" style={{color:"var(--green-medium)"}}>Compras a proveedores</h2>
        <select value={status} onChange={e=>{ setPage(0); setStatus(e.target.value); }}>
          <option value="">Todas</option>
          <option value="OPEN">Abiertas</option>
          <option value="SENT">Enviadas</option>
          <option value="RECEIVED">Recibidas</option>
        </select>
      </div>

      <div style={{display:"grid", gap:10, marginTop:12}}>
        {data?.content?.map(p=>(
          <div key={p.id} style={{background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:16}}>
            <div style={{display:"flex", justifyContent:"space-between"}}>
              <strong>Compra #{p.id}</strong>
              <span className="role-badge" style={{textTransform:"none"}}>{p.status}</span>
            </div>
            <small style={{color:"#6b7280"}}>Proveedor: {p.supplierName}</small>
            <div style={{display:"flex", justifyContent:"flex-end", gap:8, marginTop:8}}>
              <strong>Total: €{Number(p.total).toFixed(2)}</strong>
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
