import { Link } from "react-router-dom";

export default function AdminTopbar({ backTo = "/admin", toNew, newLabel }) {
  return (
    <div
      style={{display: "flex", alignItems: "center", justifyContent: "space-between",
        gap: 12, margin: "8px 0 16px", }}
    >
      <Link
        to={backTo}
        className="btn"
        style={{ background: "transparent", border: "1px solid var(--green-medium)",
          color: "var(--green-medium)", }}
      >
        ← Volver atras
      </Link>

      {/* Si pasas toNew + newLabel, muestro el botón de crear; si no, nada */}
      {toNew && newLabel ? (
        <Link to={toNew} className="btn">+ {newLabel}</Link>
      ) : (
        <span />
      )}
    </div>
  );
}
