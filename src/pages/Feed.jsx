import { useState } from "react";
import { postsMock } from "../api/mock";

export default function Feed() {
  const [posts, setPosts] = useState(postsMock);

  function apoiar(id) {
    console.log("Apoiado:", id);
    alert("✅ Apoio registrado em privado.");
  }

  return (
    <div className="feed-container">
      <h2>Feed</h2>

      {posts.map((p) => (
        <div key={p.id} className="card">
          <h3>{p.nome}</h3>
          <span className="tag">{p.curso}</span>
          <p>{p.mensagem}</p>

          <button className="btn" onClick={() => apoiar(p.id)}>
            Apoiar 🤝
          </button>
        </div>
      ))}
    </div>
  );
}
