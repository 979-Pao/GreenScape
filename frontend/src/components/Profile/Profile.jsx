import { useAuth } from "../../Context/AuthContext.jsx";
import { Link } from "react-router-dom";

function Avatar({ user }) {
  const letter = (user?.name || user?.email || "?").trim().charAt(0).toUpperCase();
  return (
    <div className="avatar-circle" aria-hidden="true">
      {letter}
    </div>
  );
}

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

  // Normaliza roles: admite string o array
  const rolesArr = Array.isArray(user.roles)
    ? user.roles
    : (user.role ? [user.role] : []);

  const primaryRole = (rolesArr[0] || "").toUpperCase();
  const hasRole = (r) => rolesArr.map(x => String(x).toUpperCase()).includes(String(r).toUpperCase());

  const roleClass = `role-badge role-${(primaryRole || "").toLowerCase()}`;

  return (
    <section className="container" style={{ padding: "40px 0", display: "grid", gap: 24 }}>
      {/* Header del perfil */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 16,
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 16,
          boxShadow: "0 6px 20px rgba(0,0,0,.04)",
        }}
      >
        <Avatar user={user} />
        <div style={{ flex: 1, lineHeight: 1.3 }}>
          <h2 style={{ margin: 0, color: "var(--green-dark)" }}>
            {user?.name || "Usuario"}
          </h2>
          <small style={{ color: "#6b7280" }}>{user?.email || "—"}</small>
        </div>

        {/* Chip de rol */}
        {primaryRole && <span className={roleClass}>{primaryRole}</span>}
      </div>

      {/* Detalle rápido */}
      <div
        style={{
          display: "grid",
          gap: 12,
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 16,
        }}
      >
        <ul className="list" style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
          <li><b>Nombre:</b> {user?.name || "—"}</li>
          <li><b>Email:</b> {user?.email || "—"}</li>
          <li>
            <b>Roles:</b> {rolesArr.length ? rolesArr.join(", ") : "—"}
          </li>
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
        <Link to="/profile" className="btn" style={{ textAlign: "center" }}>
          Editar perfil
        </Link>

        {/* CLIENT → carrito / pedidos */}
        {hasRole("CLIENT") && (
          <>
            <Link to="/cart" className="btn" style={{ textAlign: "center" }}>
              Carrito
            </Link>
            <Link to="/orders" className="btn ghost" style={{ textAlign: "center" }}>
              Mis pedidos
            </Link>
          </>
        )}

        {/* SUPPLIER */}
        {hasRole("SUPPLIER") && (
          <Link to="/supplier/inbox" className="btn" style={{ textAlign: "center" }}>
            Pedidos prov.
          </Link>
        )}

        {/* ADMIN */}
        {hasRole("ADMIN") && (
          <>
            <Link to="/admin" className="btn ghost" style={{ textAlign: "center" }}>
              KPIs
            </Link>
            <Link to="/admin/orders" className="btn" style={{ textAlign: "center" }}>
              Ver pedidos
            </Link>
            <Link to="/admin/purchases" className="btn" style={{ textAlign: "center" }}>
              Compras a proveedores
            </Link>
          </>
        )}
      </div>
    </section>
  );
}
