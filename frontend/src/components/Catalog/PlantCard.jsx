import { Link } from "react-router-dom";

function slugify(s = "") {
  return String(s)
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") 
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")                      
    .replace(/(^-|-$)/g, "");                         
}

export default function PlantCard({ plant, onAdd }) {
  const slug = slugify(plant.imageSlug || plant.scientificName || plant.commonName);
  const imgSrc = plant.imageUrl || `/img/plants/${slug}.jpg`;

  return (
    <div className="card-product">
      <div className="img-product">
        <img
          src={imgSrc}
          alt={plant.commonName || plant.scientificName}
          onError={(e) => { e.currentTarget.src = "/img/placeholder-plant.png"; }}
        />
      </div>

      <div className="header-card">
        <span>
          <h3>{plant.commonName || plant.scientificName}</h3>
          <p className="price">€{Number(plant.price || 0).toFixed(2)}</p>
        </span>
        <button aria-label="like"><i className="fa-solid fa-heart" /></button>
      </div>

      <div className="container-stars">
        <i className="fa-solid fa-star" />
        <i className="fa-solid fa-star" />
        <i className="fa-solid fa-star" />
        <i className="fa-solid fa-star" />
        <i className="fa-regular fa-star" />
      </div>

      <p className="description">
        {plant.description || "Planta hermosa y fácil de cuidar."}
      </p>

      <div style={{ display: "flex", gap: 8 }}>
        <Link
          className="btn-add-cart"
          style={{ flex: 1, textAlign: "center", textDecoration: "none" }}
          to={`/plants/${plant.id}`}
        >
          Ver
        </Link>
        <button
          className="btn-add-cart"
          disabled={!plant.stock}
          onClick={() => onAdd?.(plant.id)}
          style={{ flex: 1 }}
        >
          Añadir al carrito
        </button>
      </div>
    </div>
  );
}