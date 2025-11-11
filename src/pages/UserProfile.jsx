import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserById } from "../api/feedService";
import "../styles/Profile.css";

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    getUserById(id).then(setUser);
  }, [id]);

  if (!user) return <p>Carregando...</p>;

  const interests = ["UI/UX", "Acessibilidade", "Frontend"];

  return (
    <div className="profile-page">
      <button className="back-btn" onClick={() => navigate(-1)}>← Voltar</button>

      <div className="profile-card">
        <div className="profile-left">
          <div className="avatar">{user.name[0]}</div>
          <div>
            <h3>{user.name}</h3>
            <p>Ciência da Computação - 6º</p>
            <p><strong>Bio</strong><br/>Testando novos conhecimentos em Web. Buscando alguém para projeto de extensão.</p>
          </div>
        </div>

        <div className="profile-right">
          <h4>Interesses</h4>
          <div className="tags">
            {interests.map(i => (
              <span key={i} className="tag">{i}</span>
            ))}
          </div>

          <div className="profile-actions">
            <button className="btn-edit">Editar Perfil</button>
            <button className="btn-message">Enviar Mensagem</button>
          </div>
        </div>
      </div>
    </div>
  );
}
