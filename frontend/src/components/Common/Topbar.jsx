import { Link } from "react-router-dom";

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

      {children && (
        <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          {children}
        </div>
      )}


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