import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext.jsx";
import HealthBadge from "../Common/HealthBadge";
import ProfileMenu from "./ProfileMenu";
import logoUrl from "../../assets/images/greentree.png";

const linkClass = ({ isActive }) => "nav-link" + (isActive ? " active" : "");

export default function Navbar() {
  const { user, isAuthenticated, signOut } = useAuth();

  // Normaliza roles para que funcione con user.roles (array) o user.role (string)
  const roles = Array.isArray(user?.roles)
    ? user.roles
    : user?.role
      ? [user.role]
      : [];

  const isAdmin = roles.map(r => String(r).toUpperCase()).includes("ADMIN");
  const primaryRole = roles[0] ? String(roles[0]) : "";

  return (
    <header className="site-header">
      <div className="container section-logo" style={{ display: "flex", alignItems: "center", gap: 20 }}>
        {/* Logo */}
        <Link to="/" className="brand" aria-label="Ir al inicio" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <img src={logoUrl} alt="GreenScape" style={{ height: 60, width: "auto" }} />
          <strong>GreenScape</strong>
        </Link>

        {/* Menú principal */}
        <nav aria-label="Principal" style={{ display: "flex", gap: 40, marginLeft: 24 }}>
          <NavLink to="/" end className={linkClass}>Inicio</NavLink>
          <NavLink to="/tienda" className={linkClass}>Tienda</NavLink>
          <NavLink to="/blog" className={linkClass}>Blog</NavLink>
          <NavLink to="/contact" className={linkClass}>Contacto</NavLink>
        </nav>


        {/* Acciones derechas */}
        <div className="container-actions" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <HealthBadge />

          {!isAuthenticated ? (
            <>
              <NavLink to="/login" className="btn-icon" title="Iniciar sesión" aria-label="Iniciar sesión">
                <i className="fa-regular fa-user" />
              </NavLink>
              <NavLink to="/register" className="btn" title="Registrarse">
                Registrarse
              </NavLink>
            </>
          ) : (
            <>
              <NavLink to="/cart" className="btn-icon" title="Carrito" aria-label="Carrito">
                <i className="fa-solid fa-cart-shopping" />
              </NavLink>

              {primaryRole && (
                <span className={`role-badge role-${primaryRole.toLowerCase()}`}>
                  {primaryRole.toUpperCase()}
                </span>
              )}

              <ProfileMenu
                user={user}
                signOut={signOut}              // <- asegúrate que ProfileMenu use onLogout
                homePath={isAdmin ? "/admin" : "/profile"}  // <- alinea con tus rutas reales
              />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
