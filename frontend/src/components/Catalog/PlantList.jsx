import { useEffect, useState } from "react";
import { getPlantsPaged } from "../../api/plants";
import { addToCart } from "../../api/orders";
import PlantCard from "./PlantCard";
import SearchBar from "./SearchBar";
import ErrorComponent from "../Common/ErrorComponent";

export default function PlantList() {
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(12);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        const res = await getPlantsPaged({ q: query, page, size });
        if (alive) { setData(res); setError(""); }
      } catch (err) {
        console.error(err);
        if (alive) setError("No se pudo cargar el catálogo.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [query, page, size]);

  const onSearch = () => setPage(0);

  const handleAdd = async (plantId) => {
    try {
      await addToCart(plantId, 1);
      alert("Producto añadido al carrito");
    } catch {
      alert("Inicia sesión como cliente para usar el carrito");
    }
  };

  return (
    <section className="section-best-products container" style={{ padding: "24px 0" }}>
      {/* overrides suaves para quitar espacios grandes */}
      <style>{`
        .section-best-products { gap: 16px; }
        .section-best-products .section-head { margin: 0 0 8px; }
        .section-best-products .section-head .title { margin: 0; }
        .plant-grid {
          display: grid;
          gap: 14px;
          grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
          align-items: stretch;
        }
        .pager {
          display: flex; gap: 10px; align-items: center; justify-content: center; margin-top: 16px;
        }
      `}</style>

      <div className="section-head">
        <h2 className="title">Nuestra tienda</h2>
        <p className="subtitle" style={{ margin: "6px 0 0" }}>
          Descubre plantas que enamoran tu hogar
        </p>
      </div>

      <div>
        <SearchBar value={query} onChange={setQuery} onSubmit={onSearch} />
      </div>

      {error && <ErrorComponent message={error} />}

      {loading ? (
        <p>Cargando…</p>
      ) : (data?.content?.length ?? 0) === 0 ? (
        <p>No hay resultados para tu búsqueda.</p>
      ) : (
        <>
          <div className="plant-grid">
            {data.content.map((p) => (
              <PlantCard key={p.id} plant={p} onAdd={handleAdd} />
            ))}
          </div>

          <div className="pager">
            <button
              className="btn ghost"
              disabled={data.first}
              onClick={() => setPage((p) => p - 1)}
            >
              Anterior
            </button>
            <span>
              Página {data.number + 1} / {data.totalPages || 1}
            </span>
            <button
              className="btn ghost"
              disabled={data.last}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
            </button>
          </div>
        </>
      )}
    </section>
  );
}
