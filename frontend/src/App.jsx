import { NavLink, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useCart } from './context/CartContext';
import { apiHealth } from './services/api';

export default function AppShell() {
  const { totals } = useCart();
  const [online, setOnline] = useState(null);

  useEffect(() => {
    let alive = true;
    (async () => {
      try { await apiHealth(); if (alive) setOnline(true); }
      catch { if (alive) setOnline(false); }
    })();
    const id = setInterval(async () => {
      try { await apiHealth(); setOnline(true); } catch { setOnline(false); }
    }, 15000);
    return () => { alive = false; clearInterval(id); };
  }, []);

  return (
    <>
      <nav className="nav">
        <div className="brand">🌿 PlantStore</div>
        <div className="links">
          <NavLink to="/">Inicio</NavLink>
          <NavLink to="/items">Plantas</NavLink>
          <NavLink to="/carrito">Carrito ({totals.count})</NavLink>
        </div>
        <button
          className={`chip ${online ? 'ok' : 'bad'}`}
          onClick={async () => { try { await apiHealth(); setOnline(true); } catch { setOnline(false); } }}
          title="Probar conexión"
        >
          {online == null ? '...' : online ? 'Conexión abierta' : 'Sin conexión'}
        </button>
      </nav>
      <main className="container"><Outlet /></main>
    </>
  );
}