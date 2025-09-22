import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminKpis } from "../../api/admin"; // GET /api/admin/reports/overview

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
        setLoading(true); setErr("");
        const data = await getAdminKpis(); // { totalUsers, totalPlants, totalOrders, totalRevenue }
        if (alive) setKpi(data || {});
      } catch (e) {
        if (alive) setErr(e?.response?.data?.message || e?.message || "No se pudieron cargar los KPIs.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []);

  const safeInt = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
  const safeMoney = (v) => fmtMoney.format(Number.isFinite(Number(v)) ? Number(v) : 0);

  // KPIs
  const totalOrders  = safeInt(kpi?.totalOrders);
  const totalRevenue = safeMoney(kpi?.totalRevenue);
  const totalPlants  = safeInt(kpi?.totalPlants);
  const totalUsers   = safeInt(kpi?.totalUsers);

  // Estilos de los ítems negros (lista)
  const item = {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    background: "#375b41ff",
    color: "#fff",
    borderRadius: 10,
    padding: "12px 16px",
    textDecoration: "none",
    fontWeight: 600,
  };
  const icon = { opacity: 0.9 };
  const wrap = { display: "grid", gap: 10 };

  return (
    <section className="container" style={{ padding: "24px 0", display: "grid", gap: 16 }}>
      <h2 className="title" style={{ color: "var(--green-medium)" }}>Panel Admin</h2>

      {loading && <p>Cargando KPIs...</p>}
      {!loading && err && <p style={{ color: "#b42318" }}>{err}</p>}

      {/* KPIs en grilla como la imagen */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
          gap: 12,
          opacity: loading ? 0.6 : 1,
          pointerEvents: loading ? "none" : "auto",
        }}
      >
        <KpiCard label="Pedidos totales" value={totalOrders}
          iconClass="fa-solid fa-truck" title="Cantidad total de pedidos" />
        <KpiCard label="Ingresos acumulados" value={totalRevenue}
          iconClass="fa-solid fa-euro-sign" title="Suma de ingresos de pedidos PAID/SHIPPED" />
        <KpiCard label="Plantas publicadas" value={totalPlants}
          iconClass="fa-solid fa-seedling" title="Cantidad de plantas en catálogo" />
        <KpiCard label="Usuarios" value={totalUsers}
          iconClass="fa-solid fa-users" title="Total de usuarios registrados" />
      </div>

      {/* LISTAR (para modificar) con tarjetas negras */}
      <details open style={{ background:"#f6f6f6", borderRadius:12, padding:12 }}>
        <summary style={{ cursor:"pointer", fontWeight:700, color:"var(--green-medium)" }}>
           LISTADOS EDICION
        </summary>

        <nav style={{ ...wrap, marginTop: 12 }}>
          <Link style={item} to="/admin/plants">
            <span><span style={icon}>🌱</span> &nbsp; Plantas</span>
            <span>➜</span>
          </Link>

          <Link style={item} to="/admin/blog">
            <span><span style={icon}>📰</span> &nbsp; Blog</span>
            <span>➜</span>
          </Link>

          <Link style={item} to="/admin/users">
            <span><span style={icon}>👥</span> &nbsp; Clientes/Proveedores</span>
            <span>➜</span>
          </Link>

          <Link style={item} to="/admin/purchases">
            <span><span style={icon}>🚚</span> &nbsp; Ventas/Compras</span>
            <span>➜</span>
          </Link>
        </nav>
      </details>
    </section>
  );
}
