import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

function Avatar({ user }) {
  const letter = (user?.name || user?.email || "?").trim().charAt(0).toUpperCase();
  return <div className="avatar-circle" aria-hidden="true">{letter}</div>;
}

export default function ProfileMenu({ user, signOut }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDocClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => { if (e.key === "Escape") setOpen(false); };

    // Escuchas "click" del documento; el contains() evita cerrar si haces click dentro
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const toggleMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen((o) => !o);
  };

  // ✔ onClick: cierra el menú y hace logout
  const handleSignOut = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setOpen(false);
    // por si te pasan undefined
    if (typeof signOut === "function") signOut();
  };

  const closeAnd = () => (e) => {
    e?.stopPropagation?.();
    setOpen(false);
  };

  const role = (user?.role || "").toUpperCase();

  return (
    <div className="profile-menu" ref={ref}>
      <button
        type="button"
        className="btn-icon"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Abrir menú de perfil"
        onClick={toggleMenu}
      >
        <i className="fa-regular fa-user" />
      </button>

      {open && (
        <div className="dropdown-panel" role="menu">
          <div className="dropdown-header">
            <Avatar user={user} />
            <div className="header-id">
              <strong>{user?.name || "Usuario"}</strong>
              <small>{user?.email}</small>
            </div>
            <span className={`role-badge role-${(user?.role || "").toLowerCase()}`}>{role}</span>
          </div>

          <div className="divider" />

          <Link to="/profile" className="dropdown-item" role="menuitem" onClick={closeAnd()}>
            <i className="fa-regular fa-id-badge" /> Perfil
          </Link>

          {user?.role === "CLIENT" && (
            <Link to="/cart" className="dropdown-item" role="menuitem" onClick={closeAnd()}>
              <i className="fa-solid fa-bag-shopping" /> Pedidos carrito
            </Link>
          )}
          {user?.role === "SUPPLIER" && (
            <Link to="/supplier/inbox" className="dropdown-item" role="menuitem" onClick={closeAnd()}>
              <i className="fa-solid fa-inbox" /> Pedidos prov.
            </Link>
          )}
          {user?.role === "ADMIN" && (
            <>
              <Link to="/admin/purchases" className="dropdown-item" role="menuitem" onClick={closeAnd()}>
                <i className="fa-solid fa-clipboard-list" /> Compras
              </Link>
              <Link to="/admin" className="dropdown-item" role="menuitem" onClick={closeAnd()}>
                <i className="fa-solid fa-chart-line" /> Panel
              </Link>
            </>
          )}

          <div className="divider" />

          {/* Salir con onClick */}
          <button
            type="button"
            className="dropdown-item danger"
            onClick={handleSignOut}
            role="menuitem"
          >
            <i className="fa-solid fa-arrow-right-from-bracket" />
          </button>
        </div>
      )}
    </div>
  );
}

