import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { listPosts } from "../../api/blog";

// ✅ Placeholder directo (no HTML)
const PLACEHOLDER = "https://place-hold.it/1200x800?text=GreenScape";

// --- Helpers ---
function hashCode(str = "") {
  let h = 0;
  for (let i = 0; i < str.length; i++) { h = (h << 5) - h + str.charCodeAt(i); h |= 0; }
  return Math.abs(h);
}

/* ============== AIC (Art Institute of Chicago) ============== */
/** Queries temáticas de plantas para el buscador */
const AIC_QUERIES = [
  "plant", "plants", "flower", "flowers", "leaf", "leaves",
  "botany", "garden", "cactus", "succulent", "fern", "orchid"
];

/** Cache simple en memoria para no spamear la API */
const aicCache = new Map(); // key: query -> array de URLs IIIF

/** Construye URL IIIF de AIC con ancho deseado */
function aicBuildUrl(iiifBase, imageId, w = 1200) {
  // Formato IIIF: {iiif}/2/{image_id}/full/{w},/0/default.jpg
  // Docs AIC: iiif_url viene en "config.iiif_url"
  const base = iiifBase || "https://www.artic.edu/iiif/2";
  return `${base}/${imageId}/full/${w},/0/default.jpg`;
}

/** Busca en AIC por una query y devuelve una lista de URLs IIIF (solo con image_id) */
async function aicFetchUrlsByQuery(query, w = 1200, limit = 40) {
  if (aicCache.has(query)) return aicCache.get(query);
  const url = `https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(
    query
  )}&fields=id,title,image_id&limit=${limit}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("AIC fetch error");
  const json = await res.json();
  const iiifBase = json?.config?.iiif_url || "https://www.artic.edu/iiif/2";
  const items = Array.isArray(json?.data) ? json.data : [];
  const urls = items
    .filter((x) => x?.image_id)
    .map((x) => aicBuildUrl(iiifBase, x.image_id, w));
  aicCache.set(query, urls);
  return urls;
}

/** Devuelve UNA URL de AIC en base al seed (estable) */
async function getAicUrl(seed, w = 1200) {
  const h = hashCode(String(seed));
  const q = AIC_QUERIES[h % AIC_QUERIES.length];
  const urls = await aicFetchUrlsByQuery(q, w, 40);
  if (!urls.length) return null;
  return urls[h % urls.length];
}

/** Dadas las entradas, devuelve una lista de URLs en orden de intento (sin AIC, que es async) */
function staticCandidates({ coverUrl, seed, w = 1200, h = 800 }) {
  const s = Math.abs(hashCode(String(seed)));
  // Proveedor 1: loremflickr con tags de plantas (si falla, salta al siguiente)
  const flickr = `https://loremflickr.com/${w}/${h}/plant,leaf,garden,flower,fern?lock=${s % 5000}`;
  // Proveedor 2: place-hold.it (siempre responde)
  const placehold = `https://place-hold.it/${w}x${h}?text=GreenScape`;
  // Orden sincrónico: cover -> flickr -> placehold -> placeholder
  return [coverUrl, flickr, placehold, PLACEHOLDER].filter(Boolean);
}

/** Imagen con reintentos + inserta AIC (async) como candidato prioritario */
function Cover({ title, coverUrl, seed, height = 200 }) {
  const w = Math.round(height * 1.5) || 1200; // 3:2 aprox
  const h = height || 800;

  const [aicSrc, setAicSrc] = useState(null);
  const baseSources = useMemo(
    () => staticCandidates({ coverUrl, seed, w, h }),
    [coverUrl, seed, w, h]
  );

  // Cuando llega AIC, lo metemos en segunda posición (tras coverUrl)
  const sources = useMemo(() => {
    if (aicSrc) {
      const arr = [...baseSources];
      // Inserta AIC después de coverUrl si hay coverUrl, en caso contrario al inicio
      const insertAt = baseSources[0] === coverUrl && coverUrl ? 1 : 0;
      arr.splice(insertAt, 0, aicSrc);
      return arr;
    }
    return baseSources;
  }, [aicSrc, baseSources, coverUrl]);

  const [idx, setIdx] = useState(0);
  const src = sources[idx] || PLACEHOLDER;

  // Reinicia índice al cambiar fuentes
  useEffect(() => { setIdx(0); }, [sources.join("|")]);

  // Busca una imagen AIC con seed estable (async)
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const url = await getAicUrl(seed, w);
        if (alive && url) setAicSrc(url);
      } catch {
        // si falla AIC, seguimos con flickr/placehold
      }
    })();
    return () => { alive = false; };
  }, [seed, w]);

  return (
    <div className="blog-cover" style={{ position: "relative", height }}>
      <img
        src={src}
        alt={title}
        loading="lazy"
        onError={() => setIdx((i) => (i + 1 < sources.length ? i + 1 : i))}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
      {/* Overlay para contraste */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,.35), rgba(0,0,0,.15) 40%, rgba(0,0,0,0))",
        }}
      />
      <h4
        className="blog-title"
        style={{
          position: "absolute",
          left: 12,
          right: 12,
          bottom: 12,
          color: "#fff",
          fontWeight: 800,
          fontSize: 20,
          lineHeight: 1.2,
          textShadow: "0 1px 2px rgba(0,0,0,.5)",
          margin: 0,
        }}
      >
        {title}
      </h4>
    </div>
  );
}

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
        const rows = Array.isArray(data) ? data : data?.content || [];
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
      {/* estilos locales */}
      <style>{`
        .blog-grid { display: grid; gap: 16px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
        .blog-card { background: #fff; border: 1px solid #e5e7eb; border-radius: 12px; overflow: hidden; display: grid; grid-template-rows: 200px auto; box-shadow: 0 1px 2px rgba(0,0,0,.04);}
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
          Disfruta del Blog de GreenScape
        </h1>
        <p className="section-sub">
          Te damos la bienvenida al blog de plantas, flores, y jardinería. Un espacio para compartir nuestra experiencia y pasión por la naturaleza a través de
          consejos e ideas para disfrutar plenamente de tu hogar y tu jardín.
        </p>
      </header>

      {/* Últimos Post */}
      <div>
        <h3 className="section-title" style={{ fontSize: 20, marginBottom: 6 }}>
          Últimos Post
        </h3>
        <hr className="divider" />
      </div>

      {/* Grid de tarjetas */}
      <div className="blog-grid">
        {posts.map((p, i) => {
          const date = p.createdAt?.slice?.(0, 10);
          const seed = p.id ?? p.slug ?? p.title ?? i;
          const coverUrl = p.coverUrl || null; // si viene, se usa primero

          return (
            <article key={p.id ?? i} className="blog-card">
              {/* Portada con reintentos (cover -> AIC -> Flickr -> place-hold -> placeholder) */}
              <div style={{ position: "relative" }}>
                {/* Chips */}
                <div style={{ position: "absolute", top: 10, left: 10, zIndex: 2, display: "flex", gap: 6 }}>
                  {p.status ? <span className="chip">{p.status}</span> : null}
                  {p.slug ? <span className="chip">{p.slug.replaceAll("-", " ")}</span> : null}
                </div>

                <Cover title={p.title} coverUrl={coverUrl} seed={seed} height={200} />
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
