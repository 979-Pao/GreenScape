import api from "./http";

export async function getAdminKpis() {
  if (api) {
    await new Promise(r=>setTimeout(r, 200));
    return { pendingOrders: 5, todayRevenue: 243.60, suppliersOpen: 2, lowStock: 7 };
  }
  const { data } = await api.get("/api/orders");
  return data;
}

export async function getAllOrders({ status="", page=0, size=10 } = {}) {
  if (api) {
    await new Promise(r=>setTimeout(r, 250));
    const list = Array.from({length: 23}).map((_,i)=>({
      id: 500+i, createdAt: new Date(Date.now()-i*3600000).toISOString(),
      status: ["PENDING","PAID","SHIPPED"][i%3], total: 20+i
    }));
    return {
      content: status ? list.filter(o=>o.status===status) : list,
      number: page, size, totalElements: list.length,
      totalPages: Math.ceil(list.length/size), first: page===0, last: page>=Math.ceil(list.length/size)-1
    };
  }
  const { data } = await api.get("/api/orders", { params: { status, page, size } });
  return data; // Page<OrderDto>
}

export async function getAdminPurchases({ status="", page=0, size=10 } = {}) {
  if (api) {
    await new Promise(r=>setTimeout(r, 250));
    const list = Array.from({length: 12}).map((_,i)=>({
      id: 900+i, supplierName: ["GreenCo","Flora SA","Vivero Zeta"][i%3],
      status: ["OPEN","SENT","RECEIVED"][i%3],
      total: 100 + i*10, createdAt: new Date(Date.now()-i*7200000).toISOString()
    }));
    return {
      content: status ? list.filter(o=>o.status===status) : list,
      number: page, size, totalElements: list.length,
      totalPages: Math.ceil(list.length/size), first: page===0, last: page>=Math.ceil(list.length/size)-1
    };
  }
  const { data } = await api.get("/api/orders/purchases", { params: { status, page, size } });
  return data; // Page<PurchaseDto>
}
