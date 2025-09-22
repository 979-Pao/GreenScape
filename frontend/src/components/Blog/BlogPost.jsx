import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { getPost, listPosts } from "../../api/blog";

const PLACEHOLDER =
  "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?q=80&w=1200&auto=format&fit=crop";

export default function BlogPost() {
  const { id } = useParams();
  const [post, setPost] = useState(null);
  const [others, setOthers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true); setErr("");
        const [one, all] = await Promise.all([getPost(id), listPosts()]);
        if (!alive) return;

        setPost(one || null);

        const arr = Array.isArray(all) ? all : (all?.content || []);
        setOthers(arr.filter((p) => String(p.id) !== String(id)).slice(0, 6));
      } catch (e) {
        if (alive) setErr(e?.response?.data?.message || e?.message || "No se pudo cargar el post");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]); // eslint-disable-next-line react-hooks/exhaustive-deps

  const dateStr = useMemo(
    () => post?.createdAt?.slice?.(0, 10) ?? "",
    [post?.createdAt]
  );

  if (loading) return <p className="container" style={{ padding: "24px 0" }}>Cargando…</p>;
  if (err) return <p className="container" style={{ padding: "24px 0", color: "#b42318" }}>{err}</p>;
  if (!post) return <p className="container" style={{ padding: "24px 0" }}>Post no encontrado.</p>;

  return (
    <section className="container" style={{ padding: "24px 0", display: "grid", gap: 24 }}>
      <style>{`
        .post-card{
          background:#fff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;
          box-shadow:0 1px 2px rgba(0,0,0,.04);
        }
        .post-hero{height:320px;background-size:cover;background-position:center;}
        .post-body{padding:16px 18px;display:grid;gap:12px}
        .post-title{font-weight:900;font-size:28px;margin:0;color:#0f172a}
        .badge{display:inline-block;border:1px solid #dbe3ea;background:#f6fbff;
          color:#0f172a;border-radius:999px;padding:4px 10px;font-size:12px;font-weight:700;margin-right:6px}
        .muted{color:#64748b;font-size:13px}
        .btn{
          display:inline-flex;align-items:center;gap:8px;text-decoration:none;font-weight:800;
          border:1px solid #c6e9d6;background:#eff7f2;color:#0f5132;border-radius:10px;padding:8px 14px
        }
        .related-grid{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(220px,1fr))}
        .rel-card{background:#fff;border:1px solid #e5e7eb;border-radius:12px;overflow:hidden;display:grid;grid-template-rows:140px auto}
        .rel-cover{background-size:cover;background-position:center}
        .rel-body{padding:10px;display:grid;gap:8px}
        .rel-title{font-weight:800;line-height:1.2}
      `}</style>

      {/* Card principal */}
      <article className="post-card">
        <div
          className="post-hero"
          style={{ backgroundImage: `url(${post.coverUrl || PLACEHOLDER})` }}
          role="img"
          aria-label={post.title}
        />
        <div className="post-body">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
            <div>
              {post.status ? <span className="badge">{post.status}</span> : null}
              {post.slug ? <span className="badge">{post.slug.replaceAll("-", " ")}</span> : null}
            </div>
            <Link to="/blog" className="btn">← Volver al blog</Link>
          </div>

          <h1 className="post-title">{post.title}</h1>
          {dateStr && <div className="muted">Publicado: {dateStr}</div>}

          <div style={{ whiteSpace: "pre-wrap", color: "#0f172a", lineHeight: 1.6 }}>
            {post.content}
          </div>

          <div>
            <Link to="/blog" className="btn">← Volver</Link>
          </div>
        </div>
      </article>

      {/* Relacionados */}
      {others.length > 0 && (
        <section style={{ display: "grid", gap: 10 }}>
          <h3 style={{ color: "var(--green-medium)", fontWeight: 900, fontSize: 20, margin: 0 }}>
            Artículos relacionados
          </h3>
          <div className="related-grid">
            {others.map((p) => (
              <article key={p.id} className="rel-card">
                <div
                  className="rel-cover"
                  style={{ backgroundImage: `url(${p.coverUrl || PLACEHOLDER})` }}
                  role="img"
                  aria-label={p.title}
                />
                <div className="rel-body">
                  <div className="muted">{p.createdAt?.slice?.(0, 10)}</div>
                  <div className="rel-title">{p.title}</div>
                  <Link to={`/blog/${p.id}`} className="btn">Leer más</Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      )}
    </section>
  );
}
