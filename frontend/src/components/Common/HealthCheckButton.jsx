import { useState } from "react";
import { getHealth } from "../../api/health";

export default function HealthCheckButton({ title = "Conexión", buttonText = "Push" }) {
  const [status, setStatus] = useState(null);   
  const [loading, setLoading] = useState(false);

  const handleTest = async () => {
    setLoading(true);
    try {
      const res = await getHealth(); 
      const ok = res?.status ? res.status === "UP" : true;
      setStatus(ok);
    } catch {
      setStatus(false);
    } finally {
      setLoading(false);
    }
  };

  const Indicator = () => {
    const color = status ? "#10b981" : "#ef4444"; 
    const label = status ? "UP" : "DOWN";
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
        <span
          aria-label={`api-${label}`}
          style={{
            width: 15,
            height: 15,
            borderRadius: "50%",
            background: color,
            display: "inline-block",
            boxShadow: "0 0 0 1px #fff"
          }}
        />
        <small style={{ color: "#666", fontWeight: 700 }}>{label}</small>
      </span>
    );
  };

  return (
    <div style={{ display: "grid", gap: 8, justifyItems: "center" }}>

      <small style={{ color: "#6b7280", fontWeight: 600, fontSize: 11, lineHeight: 1, letterSpacing: 0.1 }}>
        {title}
      </small>

      {status === null ? (
<button
  onClick={handleTest}
  disabled={loading}
  aria-label="Probar conexión"
  title="Probar conexión"
  style={{
    width: 29, height: 29, padding: 0,
    border: "3px solid #abafb6ff",
    background: "#e0dcdcff",
    borderRadius: 15,
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    fontSize: 10, lineHeight: 1, cursor: "pointer"
  }}
>
  {loading ? "Load..." : buttonText}
</button>
      ) : (
        <Indicator />
      )}
    </div>
  );
}
