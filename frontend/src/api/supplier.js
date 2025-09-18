import api from "./http";

export async function getSupplierKpis() {
  if (api) {
    await new Promise(r=>setTimeout(r, 150));
    return { pending: 3, todayAssigned: 1, openThreads: 4 };
  }
  const { data } = await api.get("/api/orders/supplier");
  return data;
}

export async function getSupplierInbox({ page=0, size=10 } = {}) {
  if (api) {
    await new Promise(r=>setTimeout(r, 250));
    const items = Array.from({length: 15}).map((_, i)=>({
      id: 200+i,
      subject: ["Pedido pendiente","Consulta stock","Incidencia envío"][i%3],
      status: ["OPEN","ASSIGNED","CLOSED"][i%3],
      createdAt: new Date(Date.now()-i*1800000).toISOString()
    }));
    return {
      content: items.slice(page*size, page*size+size),
      number: page, size, totalElements: items.length,
      totalPages: Math.ceil(items.length/size), first: page===0, last: (page*size+size)>=items.length
    };
  }
  const { data } = await api.get("/api/orders/supplier/mine", { params: { page, size } });
  return data; // Page<InboxItemDto>
}
