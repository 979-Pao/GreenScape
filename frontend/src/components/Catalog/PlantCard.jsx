import { Link } from "react-router-dom";

const PLACEHOLDER = "/img/placeholder-plant.png"; // asegúrate de tener este archivo en /public/img/

function slugify(s = "") {
  return String(s)
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export default function PlantCard({ plant, onAdd }) {
  const slug = slugify(plant.imageSlug || plant.scientificName || plant.commonName);
  const cover = plant.imageUrl || `/img/plants/${slug}.jpg`;

  return (
    <article
      className="plant-card"
      style={{
        background: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        overflow: "hidden",
        display: "grid",
        // layout fijo: imagen + bloque info que rellena + botones abajo
        gridTemplateRows: "190px 1fr auto",
        height: 420,               // <-- altura fija
        boxShadow: "0 1px 2px rgba(0,0,0,.04)",
      }}
    >
      {/* Imagen fija */}
      <div style={{ background: "#f8fafc" }}>
        <img
          src={cover}
          alt={plant.commonName || plant.scientificName}
          loading="lazy"
          onError={(e) => { e.currentTarget.src = PLACEHOLDER; }}
          style={{ width: "100%", height: 190, objectFit: "cover", display: "block" }}
        />
      </div>

      {/* Texto */}
      <div style={{ padding: 12, display: "grid", gap: 8 }}>
        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 800 }}>
            {plant.commonName || plant.scientificName}
          </h3>
          <p className="price" style={{ margin: 0, fontWeight: 800 }}>
            €{Number(plant.price || 0).toFixed(2)}
          </p>
        </div>

        <p
          style={{
            color: "#334155",
            fontSize: 14,
            margin: 0,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: 60, // asegura altura estable del texto
          }}
        >
          {plant.description || "Planta hermosa y fácil de cuidar."}
        </p>
      </div>

      {/* Acciones */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, padding: 12 }}>
        <Link className="btn-add-cart" style={{ textAlign: "center", textDecoration: "none" }} to={`/plants/${plant.id}`}>
          Ver
        </Link>
        <button
          className="btn-add-cart"
          disabled={!plant.stock}
          onClick={() => onAdd?.(plant.id)}
          title={!plant.stock ? "Sin stock" : "Añadir al carrito"}
        >
          Añadir
        </button>
      </div>
    </article>
  );
}
