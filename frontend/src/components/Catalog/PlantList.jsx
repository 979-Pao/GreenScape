import { useCallback, useEffect, useState } from "react";
import { getPlantsPaged } from "../../api/plants";
import { addToCart } from "../../api/orders";
import PlantCard from "./PlantCard";
import SearchBar from "./SearchBar";
import ErrorComponent from "../Common/ErrorComponent";

export default function PlantList(){
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const [size] = useState(12);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const res = await getPlantsPaged({ query, page, size });
      setData(res);
      setError("");
    } catch (err) {
      console.error(err);
      setError("No se pudo cargar el catálogo.");
    }
  }, [query, page, size]);

  useEffect(() => { load(); }, [load]);

  const onSearch = () => { setPage(0); load(); };

  const handleAdd = async (plantId) => {
    try {
      await addToCart(plantId, 1);
      alert("Producto añadido al carrito");
    } catch (err) {
      console.error(err);
      alert("Inicia sesión como cliente para usar el carrito");
    }
  };

  return (
    <section className="section-best-products container">
      <div className="section-head">
        <h2 className="title">Nuestra tienda</h2>
        <p className="subtitle">Descubre plantas que enamoran tu hogar</p>
      </div>

      <SearchBar value={query} onChange={setQuery} onSubmit={onSearch} />
      {error && <ErrorComponent message={error} />}

      <div className="container-cards-products">
        {data?.content?.map(p => (
          <PlantCard key={p.id} plant={p} onAdd={handleAdd} />
        ))}
      </div>

      {data && (
        <div className="pager">
          <button className="btn ghost" disabled={data.first} onClick={()=>setPage(p=>p-1)}>Anterior</button>
          <span>Página {data.number+1} / {data.totalPages || 1}</span>
          <button className="btn ghost" disabled={data.last} onClick={()=>setPage(p=>p+1)}>Siguiente</button>
        </div>
      )}
    </section>
  );
}
