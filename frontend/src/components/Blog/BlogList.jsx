import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listPosts } from "../../api/blog";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1200&auto=format&fit=crop";

export default function BlogList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true); setErr("");
        const data = await listPosts();
        const rows = Array.isArray(data) ? data : (data?.content || []);
        if (alive) setPosts(rows);
      } catch (e) {
        if (alive) setErr(e?.response?.data?.message || e?.message || "No se pudo cargar el blog");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, []); // eslint-disable-next-line react-hooks/exhaustive-deps

  if (loading) return <p>Cargando...</p>;
  if (err) return <p style={{ color: "#b42318" }}>{err}</p>;
  if (posts.length === 0) return <p>No hay publicaciones.</p>;

  const excerpt = (txt = "", n = 200) => {
    const clean = String(txt).replace(/\s+/g, " ").trim();
    return clean.length > n ? clean.slice(0, n).trim() + "…" : clean;
  };

  const wrapper = { padding: "24px 0", display: "grid", gap: 24 };

  return (
    <section className="container" style={wrapper}>
      {/* estilos locales para el layout de tarjetas */}
      <style>{`
        .blog-grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
        .blog-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; display: grid; grid-template-rows: 200px auto; box-shadow: 0 1px 2px rgba(0,0,0,.04);}
        .blog-cover { position: relative; background-size: cover; background-position: center; }
        .blog-cover::after { content: ""; position: absolute; inset: 0; background: linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,.15) 40%, rgba(0,0,0,0));}
        .blog-title { position: absolute; left: 12px; right: 12px; bottom: 12px; color: #fff; font-weight: 800; font-size: 20px; line-height: 1.2; text-shadow: 0 1px 2px rgba(0,0,0,.5);}
        .chip { display:inline-block; background: rgba(255,255,255,.85); color:#0f172a; padding: 2px 8px; border-radius: 999px; font-size: 11px; font-weight:600; margin-right: 6px; border:1px solid rgba(0,0,0,.06); }
        .blog-body { padding: 12px; display: grid; gap: 10px; }
        .blog-meta { color:#64748b; font-size:12px }
        .blog-btn { width: max-content; background: #eff7f2; color: #0f5132; border: 1px solid #c6e9d6; border-radius: 10px; padding: 8px 14px; font-weight:700; text-decoration:none; transition: background .15s ease, transform .05s;}
        .blog-btn:hover { background:#ffffff; }
        .blog-btn:active { transform: translateY(1px); }
        .section-title { color: var(--green-medium); font-weight: 900; }
        .section-sub { color:#334155;max-width: 80ch; }
        .divider { height: 2px; background: #d1d5db; border: 0; width: 140px; margin: 4px 0 0 0;}
      `}</style>

      {/* Hero / introducción */}
      <header style={{ display: "grid", gap: 6 }}>
        <h1 className="section-title" style={{ fontSize: 28 }}>
          Disfruta del Blog de GreenScape </h1>
        <p className="section-sub">
          Te damos la bienvenida al blog de plantas, flores, y jardinería. Un espacio en el que
          queremos compartir contigo nuestra experiencia y pasión por la naturaleza a través de
          consejos e ideas para disfrutar plenamente de tu hogar, y tu jardín.
        </p>
      </header>

      {/* Últimos Post */}
      <div>
        <h3 className="section-title" style={{ fontSize: 20, marginBottom: 6 }}>Últimos Post</h3>
        <hr className="divider" />
      </div>

      {/* Grid de tarjetas */}
      <div className="blog-grid">
        {posts.map((p) => {
          const date = p.createdAt?.slice?.(0, 10);
          const cover = p.coverUrl || PLACEHOLDER;
          return (
            <article key={p.id} className="blog-card">
              <div
                className="blog-cover"
                style={{ backgroundImage: `url(${cover})` }}
                role="img"
                aria-label={p.title}
              >
                <div style={{ position: "absolute", top: 10, left: 10, display: "flex", gap: 6 }}>
                  {p.status ? <span className="chip">{p.status}</span> : null}
                  {p.slug ? <span className="chip">{p.slug.replaceAll("-", " ")}</span> : null}
                </div>
                <h4 className="blog-title">{p.title}</h4>
              </div>

              <div className="blog-body">
                <p className="blog-meta">{date}</p>
                <p>{excerpt(p.content, 180)}</p>
                <Link className="blog-btn" to={`/blog/${p.id}`}>
                  Leer más
                </Link>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
