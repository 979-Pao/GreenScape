import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getPost } from "../../api/blog";

export default function BlogPost(){
  const { id } = useParams();
  const [post,setPost]=useState(null);
  useEffect(()=>{ (async()=>setPost(await getPost(id)))(); },[id]);
  if (!post) return <p>Cargando...</p>;
  return (
    <article>
      <h2>{post.title}</h2>
      <p className="muted">{post.slug}</p>
      <div style={{whiteSpace:"pre-wrap"}}>{post.content}</div>
    </article>
  );
}
