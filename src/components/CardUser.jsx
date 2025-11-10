import { Link } from "react-router-dom";

export default function CardUser({ user }) {
  return (
    <article className="card">
      <div className="card-avatar">
        {user.name.split(" ").map(s => s[0]).slice(0,2).join("")}
      </div>
      <div className="card-body">
        <h3>{user.name}</h3>
        <p className="muted">{user.course} • {user.interests.join(" · ")}</p>
        <p className="bio">{user.bio}</p>
      </div>
      <div className="card-actions">
        <Link to={`/perfil?id=${user.id}`} className="btn-small">Ver perfil</Link>
      </div>
    </article>
  );
}
