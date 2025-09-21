import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { getAdminKpis } from "../../api/admin"; // <-- ojo aquí

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

function ActionDropdown({ title, items }) {
  return (
    <details
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: 12,
      }}
    >
      <summary
        style={{
          cursor: "pointer",
          listStyle: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontWeight: 800,
          fontSize: 16,
          color: "var(--green-medium)",
        }}
      >
        <span>{title}</span>
        <i className="fa-solid fa-chevron-down" aria-hidden="true" />
      </summary>

      <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
        {items.map((it) => (
          <Link
            key={it.to}
            to={it.to}
            className="btn"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              textAlign: "left",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
              {it.iconClass ? <i className={it.iconClass} aria-hidden="true" /> : null}
              {it.label}
            </span>
            <i className="fa-solid fa-arrow-right" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </details>
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
        const data = await getAdminKpis(); // { totalUsers, totalPlants, totalOrders, totalRevenue }
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

  const safeInt = (v) => (Number.isFinite(Number(v)) ? Number(v) : 0);
  const safeMoney = (v) => fmtMoney.format(Number.isFinite(Number(v)) ? Number(v) : 0);

  // KPIs
  const totalOrders = safeInt(kpi?.totalOrders);
  const totalRevenue = safeMoney(kpi?.totalRevenue);
  const totalPlants = safeInt(kpi?.totalPlants);
  const totalUsers = safeInt(kpi?.totalUsers);

  // Ítems de acciones
  const crearItems = [
    { label: "Planta", to: "/admin/plants/new", iconClass: "fa-solid fa-seedling" },
    { label: "Blog", to: "/admin/blog/new", iconClass: "fa-solid fa-pen-to-square" },
    { label: "Usuario", to: "/admin/users/new?role=CLIENT", iconClass: "fa-solid fa-user-plus" },
    { label: "pedidos a Proveedor", to: "/admin/purchases/new", iconClass: "fa-solid fa-handshake" },
  ];

  const listarItems = [
    { label: "Plantas", to: "/admin/plants", iconClass: "fa-solid fa-seedling" },
    { label: "Blog", to: "/admin/blog", iconClass: "fa-solid fa-newspaper" },
    { label: "Clientes/Proveedores", to: "/admin/users?roles=CLIENT,SUPPLIER", iconClass: "fa-solid fa-user-group" },
    { label: "Pedidos/Compras", to: "/admin/purchases", iconClass: "fa-solid fa-truck" },
  ];

  return (
    <section className="container" style={{ padding: "24px 0", display: "grid", gap: 16 }}>
      <h2 className="title" style={{ color: "var(--green-medium)" }}>Panel Admin</h2>

      {loading && <p>Cargando KPIs...</p>}
      {!loading && err && <p style={{ color: "#b42318" }}>{err}</p>}

      {/* KPIs */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
          opacity: loading ? 0.6 : 1,
          pointerEvents: loading ? "none" : "auto",
        }}
      >
        <KpiCard label="Pedidos totales" value={totalOrders}
          iconClass="fa-solid fa-truck" title="Cantidad total de pedidos"/>
        <KpiCard label="Ingresos acumulados" value={totalRevenue}
          iconClass="fa-solid fa-euro-sign" title="Suma de ingresos de pedidos PAID/SHIPPED"/>
        <KpiCard label="Plantas publicadas" value={totalPlants}
          iconClass="fa-solid fa-seedling" title="Cantidad de plantas en catálogo"/>
        <KpiCard label="Usuarios" value={totalUsers}
          iconClass="fa-solid fa-users" title="Total de usuarios registrados"/>
      </div>

      {/* Acciones: CREAR y LISTAR */}
      <div
        style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, }}>
        <ActionDropdown title="CREAR" items={crearItems} />
        <ActionDropdown title="LISTAR (para modificar)" items={listarItems} />
      </div>
    </section>
  );
}
