import { useEffect, useMemo, useState } from "react";
import { getAdminKpis } from "../../api/orders";

function KpiCard({ label, value, iconClass, title }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 16,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}
      title={title || ""}
    >
      <div>
        <div style={{ color: "var(--gray-text)", fontSize: 12 }}>{label}</div>
        <div style={{ fontWeight: 800, fontSize: 22 }}>{value}</div>
      </div>
      <i className={iconClass} style={{ fontSize: 22, color: "var(--green-medium)" }} />
    </div>
  );
}

export default function AdminDashboard() {
  const [kpi, setKpi] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const fmtMoney = useMemo(
    () => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }),
    []
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const data = await getAdminKpis(); // espera { pendingOrders, todayRevenue, suppliersOpen, lowStock, ... }
        if (alive) setKpi(data || {});
      } catch (e) {
        console.error(e);
        if (alive) setErr(e?.response?.data?.message || e?.message || "No se pudieron cargar los KPIs.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const safeInt = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };
  const safeMoney = (v) => fmtMoney.format(Number.isFinite(Number(v)) ? Number(v) : 0);

  // Valores con fallback
  const pendingOrders = kpi?.pendingOrders ?? 0;
  const todayRevenue = kpi?.todayRevenue ?? 0;
  const suppliersOpen = kpi?.suppliersOpen ?? 0;
  const lowStock = kpi?.lowStock ?? 0;

  return (
    <section className="container" style={{ padding: "24px 0" }}>
      <h2 className="title" style={{ color: "var(--green-medium)" }}>Panel Admin</h2>

      {loading && <p>Cargando KPIs...</p>}
      {!loading && err && <p style={{ color: "#b42318" }}>{err}</p>}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
          marginTop: 16,
          opacity: loading ? 0.6 : 1,
          pointerEvents: loading ? "none" : "auto",
        }}
      >
        <KpiCard
          label="Pedidos pendientes"
          value={safeInt(pendingOrders)}
          iconClass="fa-solid fa-truck"
          title="Órdenes en estado pendiente"
        />
        <KpiCard
          label="Ventas hoy"
          value={safeMoney(todayRevenue)}
          iconClass="fa-solid fa-euro-sign"
          title="Ingresos del día"
        />
        <KpiCard
          label="Proveedores abiertos"
          value={safeInt(suppliersOpen)}
          iconClass="fa-solid fa-store"
          title="Órdenes de compra/relaciones activas"
        />
        <KpiCard
          label="Stock bajo"
          value={safeInt(lowStock)}
          iconClass="fa-solid fa-boxes-stacked"
          title="SKU por debajo del umbral"
        />
      </div>
    </section>
  );
}
