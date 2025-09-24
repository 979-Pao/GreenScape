import { Link } from "react-router-dom";

/**
 * Topbar genérico con:
 * - título
 * - botón Volver (opcional)
 * - acciones a la derecha (links o botones)
 *
 * props:
 *  - title?: string
 *  - backTo?: string            // si existe, muestra "← Volver"
 *  - backLabel?: string         // por defecto "← Volver"
 *  - actions?: Array<{ label: string, to?: string, onClick?: () => void, variant?: 'primary'|'ghost'|'danger' }>
 *  - children?: ReactNode       // contenido extra (filtros, tabs, etc.)
 */
export default function Topbar({
  title,
  backTo,
  backLabel = "← Volver",
  actions = [],
  children,
}) {
  const btnClass = (v) =>
    v === "danger" ? "btn danger"
    : v === "ghost" ? "btn ghost"
    : "btn";

  return (
    <header
      className="topbar"
      style={{
        display: "flex",
        gap: 12,
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 12,
      }}
    >
      {/* IZQUIERDA: volver + título */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        {backTo && (
          <Link to={backTo} className="btn ghost">{backLabel}</Link>
        )}
        {title && (
          <h2 className="title" style={{ margin: 0, color: "var(--green-medium)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {title}
          </h2>
        )}
      </div>

      {/* CENTRO opcional: children (filtros, tabs, etc.) */}
      {children && (
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          {children}
        </div>
      )}

      {/* DERECHA: acciones */}
      <div style={{ display: "flex", gap: 8 }}>
        {actions.map((a, i) =>
          a.to ? (
            <Link key={i} to={a.to} className={btnClass(a.variant)}>
              {a.label}
            </Link>
          ) : (
            <button key={i} type="button" onClick={a.onClick} className={btnClass(a.variant)}>
              {a.label}
            </button>
          )
        )}
      </div>
    </header>
  );
}