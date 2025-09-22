import { useEffect } from "react";
import { Link } from "react-router-dom";
import BlogList from "../Blog/BlogList";

export default function BlogPage() {
  useEffect(() => { document.title = "Blog | GreenScape"; }, []);

  return (
    <section className="container" style={{ padding: "24px 0", display: "grid", gap: 16 }}>


      {/* Lista pública */}
      <BlogList />
    </section>
  );
}