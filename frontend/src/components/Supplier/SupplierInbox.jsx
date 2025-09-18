import { useEffect, useState } from "react";
import { getSupplierInbox, getSupplierKpis } from "../../api/supplier";

function Kpi({ label, value }) {
  return (
    <div style={{background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:12}}>
      <div style={{color:"var(--gray-text)", fontSize:12}}>{label}</div>
      <div style={{fontWeight:800, fontSize:18}}>{value}</div>
    </div>
  );
}

export default function SupplierInbox(){
  const [data, setData] = useState(null);
  const [kpi, setKpi] = useState(null);
  const [error, setError] = useState("");
  const [page, setPage] = useState(0);
  const size = 10;

  useEffect(()=>{
    (async()=>{
      try {
        setKpi(await getSupplierKpis()); // { pending, todayAssigned, openThreads }
      } catch (err) {
      console.error(err);
      setError("No se pudieron cargar los KPIs del proveedor.");
    }
    })();
  },[]);

  useEffect(()=>{
    (async()=>{
      const res = await getSupplierInbox({ page, size }); // {content:[{id,subject,status,createdAt}],...}
      setData(res);
    })();
  },[page]);

  return (
    <section className="container" style={{padding:"24px 0"}}>
      <h2 className="title" style={{color:"var(--green-medium)"}}>Inbox Proveedor</h2>

      {error && (                                   
        <p style={{color:"#b42318", marginTop:8}}>{error}</p>)}

      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px,1fr))", gap:12, marginTop:12}}>
        <Kpi label="Pendientes" value={kpi?.pending ?? "—"} />
        <Kpi label="Asignadas hoy" value={kpi?.todayAssigned ?? "—"} />
        <Kpi label="Hilos abiertos" value={kpi?.openThreads ?? "—"} />
      </div>

      <div style={{display:"grid", gap:10, marginTop:16}}>
        {data?.content?.map(msg=>(
          <div key={msg.id} style={{background:"#fff", border:"1px solid #e5e7eb", borderRadius:12, padding:16}}>
            <div style={{display:"flex", justifyContent:"space-between"}}>
              <strong>#{msg.id} — {msg.subject}</strong>
              <span className="role-badge" style={{textTransform:"none"}}>{msg.status}</span>
            </div>
            <small style={{color:"#6b7280"}}>{new Date(msg.createdAt).toLocaleString()}</small>
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
