import { useEffect, useState } from "react";
import { getHealth } from "../../api/health";

export default function HealthBadge() {
  const [ok, setOk] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await getHealth(); // { status: 'UP' | ... } o 200
        setOk(res?.status ? res.status === "UP" : true);
      } catch {
        setOk(false);
      }
    })();
  }, []);

  const color = ok == null ? "#999" : ok ? "#16a34a" : "#dc2626";
  const label = ok == null ? "..." : ok ? "UP" : "DOWN";

  return (
    <span style={{display:"inline-flex", alignItems:"center", gap:6}}>
      <span
        aria-label={`api-${label}`}
        style={{
          width:12, height:12, borderRadius:"50%", background:color,
          display:"inline-block", boxShadow:"0 0 0 2px #fff"
        }}
      />
      <small style={{color:"#666"}}>{label}</small>
    </span>
  );
}