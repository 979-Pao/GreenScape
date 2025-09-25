import { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getPlant, getPlantsPaged } from "../../api/plants";
import { addToCart } from "../../api/orders";
import PlantList from "../Catalog/PlantList";

// === Helpers ===
const PLACEHOLDER = "/img/placeholder-plant.png"; // asegúrate de tener este archivo en /public/img/
const slugify = (s = "") =>
  String(s)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

/**
 * Wrapper: decide listado o detalle SIN usar hooks condicionalmente
 */
export default function PlantPage() {
  const { id } = useParams(); // hook en tope de componente (OK)
  return id ? <PlantDetail id={id} /> : <PlantList />; // no hay hooks después
}

/**
 * Detalle de planta
 */
function PlantDetail({ id }) {
  const [plant, setPlant] = useState(null);
  const [related, setRelated] = useState([]);
  const [qty, setQty] = useState(1);
  const [err, setErr] = useState("");
  const money = useMemo(
    () => new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }),
    []
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setErr("");

        // Primero intento directo
        let p = null;
        try {
          p = await getPlant(id);
        } catch {
          /* puede no existir ese endpoint; seguimos con fallback */
        }

        // Fallback y relacionados
        const page = await getPlantsPaged({ page: 0, size: 200 });
        const rows = Array.isArray(page?.content) ? page.content : [];

        if (!p) {
          p = rows.find((r) => String(r.id) === String(id));
        }

        if (!p) throw new Error("Planta no encontrada");

        const rel = rows
          .filter((r) => String(r.id) !== String(id))
          .slice(0, 4);

        if (!alive) return;
        setPlant(p);
        setRelated(rel);
      } catch (e) {
        if (!alive) return;
        setErr(e?.response?.data?.message || e?.message || "Planta no encontrada");
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  if (err) {
    return (
      <section className="container" style={{ padding: "24px 0" }}>
        <p style={{ color: "#b42318" }}>{err}</p>
        <Link to="/tienda" className="btn ghost">
          ← Volver al catálogo
        </Link>
      </section>
    );
  }
  if (!plant) {
    return (
      <section className="container" style={{ padding: "24px 0" }}>
        <p>Cargando…</p>
      </section>
    );
  }

  const slug = slugify(plant.imageSlug || plant.scientificName || plant.commonName);
  const cover = plant.imageUrl || `/img/plants/${slug}.jpg`;

  const onAdd = async () => {
    try {
      await addToCart(plant.id, qty);
      alert("Producto añadido al carrito");
    } catch {
      alert("Inicia sesión como cliente para usar el carrito");
    }
  };

  return (
    <section className="container" style={{ padding: "24px 0", display: "grid", gap: 24 }}>
      {/* Volver */}
      <Link to="/tienda" className="btn ghost">
        ← Volver al catálogo
      </Link>

      {/* Card detalle */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(280px, 560px) 1fr",
          gap: 24,
          alignItems: "start",
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          padding: 16,
        }}
      >
        {/* Imagen */}
        <div style={{ background: "#f9fafb", borderRadius: 12, overflow: "hidden" }}>
          <img
            src={cover}
            alt={plant.commonName || plant.scientificName}
            loading="lazy"
            style={{ width: "100%", height: "100%", objectFit: "cover", maxHeight: 520 }}
            onError={(e) => {
              e.currentTarget.src = PLACEHOLDER;
            }}
          />
        </div>

        {/* Info */}
        <div style={{ display: "grid", gap: 12 }}>
          <h1 style={{ margin: 0, color: "var(--green-medium)" }}>
            {plant.commonName || plant.scientificName}
          </h1>
          <div style={{ color: "#64748b", fontSize: 13 }}>
            {plant.scientificName ? <span>{plant.scientificName}</span> : null}
            {plant.category ? <span> · {plant.category}</span> : null}
            {" · "}Stock: {plant.stock ?? 0}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ fontWeight: 800, fontSize: 24 }}>
              {money.format(Number(plant.price || 0))}
            </div>

            {/* Stepper cantidad */}
            <div
              aria-label="selector de cantidad"
              style={{
                display: "inline-flex",
                alignItems: "center",
                border: "1px solid #e5e7eb",
                borderRadius: 10,
                overflow: "hidden",
              }}
            >
              <button
                className="btn ghost"
                type="button"
                onClick={() => setQty((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <div style={{ minWidth: 40, textAlign: "center" }}>{qty}</div>
              <button className="btn ghost" type="button" onClick={() => setQty((q) => q + 1)}>
                +
              </button>
            </div>

            <button
              className="btn"
              disabled={!plant.stock}
              onClick={onAdd}
              title={!plant.stock ? "Sin stock" : "Añadir al carrito"}
            >
              🛒 Añadir al carrito
            </button>
          </div>

          <div style={{ color: "#111827", lineHeight: 1.6 }}>
            {plant.description || "Planta hermosa y fácil de cuidar."}
          </div>

          {/* Características rápidas (mock) */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))",
              gap: 10,
            }}
          >
            {[
              ["Ubicación", "Interior y exterior"],
              ["Iluminación", "Luz indirecta"],
              ["Riego", "Moderado"],
              ["Temperatura", "18–25ºC"],
              ["Brotación", "Primavera"],
            ].map(([k, v]) => (
              <div
                key={k}
                style={{ background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: 12, padding: 12 }}
              >
                <div style={{ fontWeight: 700 }}>{k}</div>
                <div style={{ color: "#334155", fontSize: 13 }}>{v}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Relacionados (mini-grid) */}
      {related.length > 0 && (
        <div style={{ display: "grid", gap: 12 }}>
          <h3 className="title" style={{ color: "var(--green-medium)" }}>
            Artículos relacionados
          </h3>
          <div
            style={{
              display: "grid",
              gap: 12,
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            }}
          >
            {related.map((p) => {
              const slugP = slugify(p.imageSlug || p.scientificName || p.commonName);
              const coverP = p.imageUrl || `/img/plants/${slugP}.jpg`;
              return (
                <article
                  key={p.id}
                  style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 12 }}
                >
                  <Link
                    to={`/plants/${p.id}`}
                    style={{ textDecoration: "none", color: "inherit", display: "grid", gap: 8 }}
                  >
                    <img
                      src={coverP}
                      alt={p.commonName || p.scientificName}
                      loading="lazy"
                      style={{ width: "100%", height: 160, objectFit: "cover", borderRadius: 8 }}
                      onError={(e) => {
                        e.currentTarget.src = PLACEHOLDER;
                      }}
                    />
                    <div style={{ fontWeight: 700 }}>{p.commonName || p.scientificName}</div>
                    <div style={{ color: "#64748b", fontSize: 13 }}>
                      {money.format(Number(p.price || 0))}
                    </div>
                  </Link>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}