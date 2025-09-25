import { useEffect, useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { getPost, listPosts } from "../../api/blog";

const PLACEHOLDER = "/img/placeholder-plant.png"; // local y confiable

// --- Helpers ---
function hashCode(str = "") {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = (h << 5) - h + str.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}

/* ============== AIC (Art Institute of Chicago) ============== */
const AIC_QUERIES = [
  "plant","plants","flower","flowers","leaf","leaves",
  "botany","garden","cactus","succulent","fern","orchid"
];

const aicCache = new Map(); // query -> array de URLs IIIF

function aicBuildUrl(iiifBase, imageId, w = 1200) {
  const base = iiifBase || "https://www.artic.edu/iiif/2";
  return `${base}/${imageId}/full/${w},/0/default.jpg`;
}

async function aicFetchUrlsByQuery(query, w = 1200, limit = 40) {
  if (aicCache.has(query)) return aicCache.get(query);
  const url = `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(query)}&fields=id,title,image_id&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) return []; // si falla, seguimos con los estáticos
  const json = await res.json();
  const iiifBase = json?.config?.iiif_url || "https://www.artic.edu/iiif/2";
  const items = Array.isArray(json?.data) ? json.data : [];
  const urls = items.filter(x => x?.image_id).map(x => aicBuildUrl(iiifBase, x.image_id, w));
  aicCache.set(query, urls);
  return urls;
}

async function getAicUrl(seed, w = 1200) {
  const h = hashCode(String(seed));
  const q = AIC_QUERIES[h % AIC_QUERIES.length];
  const urls = await aicFetchUrlsByQuery(q, w, 40);
  if (!urls.length) return null;
  return urls[h % urls.length] || null;
}

/* ============== Fuentes síncronas (sin fetch) ============== */
function staticCandidates({ coverUrl, seed, w = 1200, h = 800 }) {
  const s = Math.abs(hashCode(String(seed)));
  const flickr = `https://loremflickr.com/${w}/${h}/plant,leaf,garden,flower,fern?lock=${s % 5000}`;
  const placehold = `https://place-hold.it/${w}x${h}?text=GreenScape`;
  // Orden: cover -> flickr -> place-hold -> placeholder local
  return [coverUrl, flickr, placehold, PLACEHOLDER].filter(Boolean);
}

/* ============== Cover con AIC (async) + estáticos (sync) ============== */
function Cover({ title, coverUrl, seed, height = 200, className }) {
  const w = Math.round(height * 1.5) || 1200; // 3:2 aprox
  const h = height || 800;

  const [aicSrc, setAicSrc] = useState(null);
  const baseSources = useMemo(
    () => staticCandidates({ coverUrl, seed, w, h }),
    [coverUrl, seed, w, h]
  );

  // Inserta AIC tras coverUrl (si existe); si no hay coverUrl, al inicio
  const sources = useMemo(() => {
    if (!aicSrc) return baseSources;
    const arr = [...baseSources];
    const insertAt = baseSources[0] === coverUrl && coverUrl ? 1 : 0;
    arr.splice(insertAt, 0, aicSrc);
    return arr;
  }, [aicSrc, baseSources, coverUrl]);

  const [idx, setIdx] = useState(0);
  const src = sources[idx] || PLACEHOLDER;

  useEffect(() => { setIdx(0); }, [sources.join("|")]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const url = await getAicUrl(seed, w);
        if (alive && url) setAicSrc(url);
      } catch {
        // si AIC falla, seguimos con flickr/place-hold
      }
    })();
    return () => { alive = false; };
  }, [seed, w]);

  return (
    <div className={className} style={{ position: "relative", height }}>
      <img
        src={src}
        alt={title}
        loading="lazy"
        onError={() => setIdx(i => (i + 1 < sources.length ? i + 1 : i))}
        style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", display: "block" }}
      />
    </div>
  );
}

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
        setOthers(arr.filter(p => String(p.id) !== String(id)).slice(0, 6));
      } catch (e) {
        if (alive) setErr(e?.response?.data?.message || e?.message || "No se pudo cargar el post");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [id]); // eslint-disable-next-line react-hooks/exhaustive-deps

  const dateStr = useMemo(() => post?.createdAt?.slice?.(0, 10) ?? "", [post?.createdAt]);

  if (loading) return <p className="container" style={{ padding: "24px 0" }}>Cargando…</p>;
  if (err) return <p className="container" style={{ padding: "24px 0", color: "#b42318" }}>{err}</p>;
  if (!post) return <p className="container" style={{ padding: "24px 0" }}>Post no encontrado.</p>;

  const heroSeed = post.id ?? post.slug ?? post.title ?? "hero";

  return (
    <section className="container" style={{ padding: "24px 0", display: "grid", gap: 24 }}>
      <style>{`
        .post-card{
          background:#fff;border:1px solid #e5e7eb;border-radius:14px;overflow:hidden;
          box-shadow:0 1px 2px rgba(0,0,0,.04);
        }
        .post-hero{position:relative;height:320px;}
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
        .rel-cover{position:relative;height:140px;}
        .rel-body{padding:10px;display:grid;gap:8px}
        .rel-title{font-weight:800;line-height:1.2}
      `}</style>

      {/* Card principal */}
      <article className="post-card">
        <Cover
          className="post-hero"
          title={post.title}
          coverUrl={post.coverUrl || null}
          seed={heroSeed}
          height={320}
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
            {others.map((p) => {
              const seed = p.id ?? p.slug ?? p.title ?? "rel";
              return (
                <article key={p.id} className="rel-card">
                  <Cover
                    className="rel-cover"
                    title={p.title}
                    coverUrl={p.coverUrl || null}
                    seed={seed}
                    height={140}
                  />
                  <div className="rel-body">
                    <div className="muted">{p.createdAt?.slice?.(0, 10)}</div>
                    <div className="rel-title">{p.title}</div>
                    <Link to={`/blog/${p.id}`} className="btn">Leer más</Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      )}
    </section>
  );
}
