import { useEffect, useState } from "react";
import { getPosts } from "../api/postService";
import { Link } from "react-router-dom";

export default function Feed() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    getPosts().then(setPosts);
  }, []);

  return (
    <div className="feed-container">
      <h2>Feed</h2>

      {posts.map(post => (
        <div className="card" key={post.id}>
          <h3>{post.title}</h3>
          <p>{post.body}</p>

          <Link to={`/post/${post.id}`} className="btn">
            Ver detalhes
          </Link>
        </div>
      ))}
    </div>
  );
}
