import { useAuth } from "../../Context/AuthContext.jsx";
import { Link } from "react-router-dom";

function Avatar({ user }) {
  const letter = (user?.name || user?.email || "?").trim().charAt(0).toUpperCase();
  return <div className="avatar-circle" aria-hidden="true">{letter}</div>;
}

// Normaliza un rol: "ROLE_CLIENT" -> "CLIENT"
const normRole = (r) => String(r || "").replace(/^ROLE_/, "").toUpperCase();

export default function Profile() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <section className="container" style={{ padding: "40px 0" }}>
        <h2 className="title" style={{ color: "var(--green-medium)" }}>Perfil</h2>
        <p style={{ marginTop: 12, color: "var(--gray-text)" }}>No autenticado.</p>
        <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
          <Link to="/login" className="btn">Iniciar sesión</Link>
          <Link to="/register" className="btn ghost">Registrarse</Link>
        </div>
      </section>
    );
  }

  // Acepta user.role (string) o user.roles (array)
  const rolesArrRaw = Array.isArray(user.roles)
    ? user.roles
    : (user.role ? [user.role] : []);
  const roles = rolesArrRaw.map(normRole);

  const hasRole = (r) => roles.includes(normRole(r));
  const primaryRole = roles[0] || "";
  const roleClass = `role-badge role-${primaryRole.toLowerCase()}`;

  // Etiqueta más humana (opcional)
  const roleLabel = {
    CLIENT: "CLIENTE",
    ADMIN: "ADMIN",
    SUPPLIER: "PROVEEDOR",
  }[primaryRole] || primaryRole;

  return (
    <section className="container" style={{ padding: "40px 0", display: "grid", gap: 24 }}>
      {/* Header del perfil */}
      <div
        style={{
          display: "flex", alignItems: "center", gap: 16,
          background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12,
          padding: 16, boxShadow: "0 6px 20px rgba(0,0,0,.04)",
        }}
      >
        <Avatar user={user} />
        <div style={{ flex: 1, lineHeight: 1.3 }}>
          <h2 style={{ margin: 0, color: "var(--green-dark)" }}>
            {user?.name || "Usuario"}
          </h2>
          <small style={{ color: "#6b7280" }}>{user?.email || "—"}</small>
        </div>

        {primaryRole && <span className={roleClass}>{roleLabel}</span>}
      </div>

      {/* Detalle rápido */}
      <div
        style={{
          display: "grid", gap: 12, background: "#fff",
          border: "1px solid #e5e7eb", borderRadius: 12, padding: 16,
        }}
      >
        <ul className="list" style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
          <li><b>Nombre:</b> {user?.name || "—"}</li>
          <li><b>Email:</b> {user?.email || "—"}</li>
          <li><b>Roles:</b> {roles.length ? roles.join(", ") : "—"}</li>
        </ul>
      </div>

      {/* Accesos rápidos según rol */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 12,
        }}
      >
        {/* Común */}


        {/* CLIENT → carrito / pedidos */}
        {hasRole("CLIENT") && (
          <>
            <Link to="/client/me" className="btn" style={{ textAlign: "center" }}>
              Editar perfil </Link>
            <Link to="/cart" className="btn" style={{ textAlign: "center" }}>
              Carrito</Link>
            {/* NUEVA ruta legible */}
            <Link to="/mi-historial" className="btn ghost" style={{ textAlign: "center" }}>
              Mis pedidos </Link>
            {/* Si prefieres mantener /orders, cambia a to="/orders" */}
          </>
        )}

        {/* SUPPLIER */}
        {hasRole("SUPPLIER") && (
         <>
           <Link to="/supplier/me" className="btn" style={{ textAlign: "center" }}>
              Editar perfil </Link>
           <Link to="/supplier/inbox" className="btn" style={{ textAlign: "center" }}>
            Pedidos prov. </Link>
         </>
        )}

        {/* ADMIN */}
        {hasRole("ADMIN") && (
          <>
            <Link to="/admin/me" className="btn" style={{ textAlign: "center" }}>
             Editar perfil </Link>
            <Link to="/admin" className="btn ghost" style={{ textAlign: "center" }}>
             KPIs </Link>

          </>
        )}
      </div>
    </section>
  );
}
