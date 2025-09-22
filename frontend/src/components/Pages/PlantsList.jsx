import { useEffect, useMemo, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { listPlants, adminDeletePlant } from "../../api/admin"; // 👈 cambio
import Pagination from "../Common/Pagination";
import AdminTopbar from "../Admin/AdminTopbar";

export default function PlantsList() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // filtros
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // paginación
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setErr("");
      const data = await listPlants(); // GET /api/admin/plants
      setRows(Array.isArray(data) ? data : data?.content || []);
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "No se pudieron cargar las plantas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const onDelete = async (id) => {
    if (!window.confirm("¿Eliminar planta? Esta acción no se puede deshacer.")) return;
    try {
      await adminDeletePlant(id);      
      fetchData();
    } catch (e) {
      alert(e?.response?.data?.message || e?.message);
    }
  };

  const filtered = useMemo(() => {
    const qx = q.trim().toLowerCase();
    return rows.filter(p => {
      const inQ = !qx || [p.name, p.commonName, p.scientificName, p.category]
        .some(v => (v || "").toLowerCase().includes(qx));
      const inCat = !category || (p.category || "").toLowerCase().includes(category.toLowerCase());
      const inMin = !minPrice || Number(p.price) >= Number(minPrice);
      const inMax = !maxPrice || Number(p.price) <= Number(maxPrice);
      return inQ && inCat && inMin && inMax;
    });
  }, [rows, q, category, minPrice, maxPrice]);

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const pageRows = filtered.slice(start, start + pageSize);

  useEffect(() => { setPage(1); }, [q, category, minPrice, maxPrice]);

  return (
    <section className="container" style={{ padding: "24px 0" }}>
      <h2 className="title" style={{ color: "var(--green-medium)" }}>Plantas</h2>
      <AdminTopbar toNew="/admin/plants/new" newLabel="Agregar planta" />
      {loading && <p>Cargando...</p>}
      {err && <p style={{ color: "#b42318" }}>{err}</p>}

      <div style={{display: "grid", gap: 8, marginBottom: 12}}>
        <input placeholder="Buscar (nombre, científico, común)" value={q} onChange={e=>setQ(e.target.value)} />
        <div style={{display: "flex", gap: 8, flexWrap: "wrap"}}>
          <input placeholder="Categoría" value={category} onChange={e=>setCategory(e.target.value)} />
          <input type="number" placeholder="Precio mín" value={minPrice} onChange={e=>setMinPrice(e.target.value)} />
          <input type="number" placeholder="Precio máx" value={maxPrice} onChange={e=>setMaxPrice(e.target.value)} />
        </div>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table className="table">
          <thead>
            <tr>
              <th>ID</th><th>Nombre</th><th>Categoría</th><th>Precio</th><th>Stock</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {pageRows.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{p.category}</td>
                <td>{p.price}</td>
                <td>{p.stock}</td>
                <td style={{ display: "flex", gap: 8 }}>
                  <Link className="btn" to={`/admin/plants/${p.id}/edit`}>Editar</Link>
                  <button className="btn" onClick={() => onDelete(p.id)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination page={page} setPage={setPage} pageSize={pageSize} setPageSize={setPageSize} total={total} />
    </section>
  );
}