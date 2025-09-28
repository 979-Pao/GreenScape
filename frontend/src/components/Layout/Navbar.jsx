import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../Context/AuthContext.jsx";
//import HealthBadge from "../Common/HealthBadge";
import HealthCheckButton from "../Common/HealthCheckButton";
import ProfileMenu from "./ProfileMenu";
import logoUrl from "../../assets/images/greentree.png";


const linkClass = ({ isActive }) => "nav-link" + (isActive ? " active" : "");

export default function Navbar() {
  const { user, isAuthenticated, signOut } = useAuth();

  const roles = Array.isArray(user?.roles) ? user.roles : user?.role ? [user.role]: [];
  const isAdmin = roles.map(r => String(r).toUpperCase()).includes("ADMIN");
  const primaryRole = roles[0] ? String(roles[0]) : "";

  const closeMenu = () => {
    const cb = document.getElementById("nav-toggle");
    if (cb) cb.checked = false;
  };

  return (
    <header className="site-header">
      <div className="container section-logo" style={{ display: "flex", alignItems: "center", gap: 20 }}>

        <Link to="/" className="brand" aria-label="Ir al inicio" style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
          <img src={logoUrl} alt="GreenScape" style={{ height: 60, width: "auto" }} />
          <strong>GreenScape</strong>
        </Link>


        <input
          id="nav-toggle"
          className="nav-toggle"
          type="checkbox"
          role="switch"
          aria-label="Abrir menú"
          aria-controls="primary-nav"
        />
        <label htmlFor="nav-toggle" className="menu-toggle" aria-controls="primary-nav">
          <span />
        </label>


        <nav id="primary-nav" aria-label="Principal">
          <ul className="nav-list" role="list">
            <li><NavLink to="/" end className={linkClass} onClick={closeMenu}>Inicio</NavLink></li>
            <li><NavLink to="/tienda" className={linkClass} onClick={closeMenu}>Tienda</NavLink></li>
            <li><NavLink to="/blog" className={linkClass} onClick={closeMenu}>Blog</NavLink></li>
            <li><NavLink to="/contact" className={linkClass} onClick={closeMenu}>Contacto</NavLink></li>
          </ul>
        </nav>


        <label htmlFor="nav-toggle" className="nav-overlay" aria-hidden="true" />


        <div className="container-actions" style={{ display: "flex", alignItems: "center", gap: 12 }}>
          {!isAuthenticated ? (
            <>
              <NavLink to="/login" className="btn-icon" title="Iniciar sesión" aria-label="Iniciar sesión">
                <i className="fa-regular fa-user" />
              </NavLink>
              <NavLink to="/register" className="btn" title="Registrarse">
                Registrarse
              </NavLink>
              {/*<HealthBadge />*/}
              <HealthCheckButton />
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
                signOut={signOut}
                homePath={isAdmin ? "/admin" : "/profile"}
              />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
