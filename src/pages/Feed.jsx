import { useEffect, useState } from "react";
import { getUsers } from "../api/feedService";
import { useNavigate } from "react-router-dom";
import "../styles/feed.css";

export default function Feed() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [postText, setPostText] = useState("");
  const [posts, setPosts] = useState([]);

  // Pega usuários da API
  useEffect(() => {
    getUsers().then(setUsers);
  }, []);

  // Posta temporariamente na sessão
  function handlePost() {
    if (!postText.trim()) return;
    const newPost = { id: Date.now(), body: postText };
    setPosts([newPost, ...posts]);
    setPostText("");
  }

  function handleLogout() {
    navigate("/");
  }

  return (
    <div className="feed-page">
      <header className="feed-header">
        <h2>Descobrir</h2>
        <p>Conecte-se com pessoas e projetos do campus</p>
        <button className="btn-logout" onClick={handleLogout}>Sair</button>
      </header>

      <section className="post-box">
        <textarea
          placeholder="Compartilhe suas novidades..."
          value={postText}
          onChange={(e) => setPostText(e.target.value)}
        />
        <button className="btn-post" onClick={handlePost}>Postar</button>
      </section>

      {/* POSTS TEMPORÁRIOS */}
      {posts.length > 0 && (
        <div className="temp-posts">
          {posts.map(post => (
            <div className="card" key={post.id}>
              <p>{post.body}</p>
            </div>
          ))}
        </div>
      )}

      <section className="people-section">
        <h3>Pessoas que você pode conhecer</h3>
        {users.slice(0, 5).map(user => (
          <div className="user-card" key={user.id}>
            <div className="user-avatar">{user.name[0]}</div>
            <div className="user-info">
              <strong>{user.name}</strong>
              <p>{user.company?.bs || "Profissional do campus"}</p>
            </div>
            <div className="user-actions">
              <button
                className="btn-open"
                onClick={() => navigate(`/user/${user.id}`)}
              >
                Abrir
              </button>
              <button className="btn-support">Apoiar</button>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
