import { useState } from "react";
import { adminCreatePurchase } from "../../../api/admin";
import AdminTopbar from "../AdminTopbar";

export default function AdminPurchaseForm(){
  const [supplierId, setSupplierId] = useState("");
  const [items, setItems] = useState([{ plantId:"", quantity:1 }]);

  const addRow = () => setItems(s => [...s, { plantId:"", quantity:1 }]);
  const updateRow = (i,k,val) => setItems(s => s.map((r,ix) => ix===i? {...r,[k]:val} : r));
  const removeRow = (i) => setItems(s => s.filter((_,ix)=>ix!==i));

  const onSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      supplierId: Number(supplierId),
      items: items
        .filter(it => it.plantId)
        .map(it => ({ plantId: Number(it.plantId), quantity: Number(it.quantity||1) }))
    };
    await adminCreatePurchase(payload);
    alert("Pedido de compra creado ✅");
  };

  return (
    <form className="card" onSubmit={onSubmit}>
      <AdminTopbar backTo="/admin/purchases"/>
      <h3>Nuevo pedido a proveedor</h3>
      <input type="number" placeholder="Supplier ID" value={supplierId} onChange={e=>setSupplierId(e.target.value)} required />
      <div className="grid gap-2">
        {items.map((it, i)=>(
          <div key={i} className="row" style={{display:"flex", gap:8}}>
            <input type="number" placeholder="Plant ID" value={it.plantId} onChange={e=>updateRow(i,"plantId",e.target.value)} required />
            <input type="number" placeholder="Qty" value={it.quantity} onChange={e=>updateRow(i,"quantity",e.target.value)} min={1} />
            <button type="button" className="btn danger" onClick={()=>removeRow(i)}>Quitar</button>
          </div>
        ))}
      </div>
      <button type="button" className="btn ghost" onClick={addRow}>Agregar línea</button>
      <button className="btn">Crear PO</button>
    </form>
  );
}
