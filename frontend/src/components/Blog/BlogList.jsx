import { useEffect, useState } from "react";
import { listPosts } from "../../api/blog";
import { Link } from "react-router-dom";

export default function BlogList(){
  const [posts,setPosts]=useState([]);
  useEffect(()=>{ (async()=>setPosts(await listPosts()))(); },[]);
  return (
    <div>
      <h2>Blog</h2>
      <ul className="list">
        {posts.map(p=>(
          <li key={p.id}>
            <Link to={`/blog/${p.id}`}>{p.title}</Link>
            <span className="muted" style={{marginLeft:8}}>{p.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
