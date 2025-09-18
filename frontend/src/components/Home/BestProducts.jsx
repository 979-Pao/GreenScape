import { useEffect, useState } from "react";
import { getPlantsPaged } from "../../api/plants";

function slugify(s = "") {
  return String(s)
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // quita acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")                      // espacios/raros -> "-"
    .replace(/(^-|-$)/g, "");
}

function ProductCard({ p }) {
  const slug = slugify(p.imageSlug || p.scientificName || p.commonName);
  const imgSrc = p.imageUrl || `/img/plants/${slug}.jpg`;

  return (
    <div className="card-product">
      <div className="img-product">
        <img
          src={imgSrc}
          alt={p.commonName || p.scientificName}
          onError={(e) => { e.currentTarget.src = "/img/placeholder-plant.png"; }}
        />
      </div>

      <div className="header-card">
        <span>
          <h3>{p.commonName || p.scientificName}</h3>
          <p className="price">€{Number(p.price || 0).toFixed(2)}</p>
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

      <p className="description">{p.description || "Planta hermosa y fácil de cuidar."}</p>
      <button className="btn-add-cart">Añadir al carrito</button>
    </div>
  );
}

export default function BestProducts() {
  const [data, setData] = useState([]);

  useEffect(() => {
    getPlantsPaged({ page: 0, size: 4 })
      .then(res => setData(res?.content || []))
      .catch(() => setData([]));
  }, []);

  return (
    <section className="section-best-products container">
      <h2>Mejores Productos</h2>
      <div className="container-cards-products">
        {data.map(p => <ProductCard key={p.id} p={p} />)}
      </div>
    </section>
  );
}
