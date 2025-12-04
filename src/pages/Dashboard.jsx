import { useNavigate } from "react-router-dom";
import Logo from "../components/Logo";

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      
      <div className="dashboard-header">
        <Logo size={70} />
        <h2>Bem-vindo(a) de volta, Usuário 👋</h2>
        <p className="dashboard-tagline">Seu espaço pessoal na Lumen • Conexões que importam</p>
      </div>

      <div className="dashboard-grid">

        {/* Perfil */}
        <div className="dash-card">
          <h3>Seu Perfil</h3>
          <p><strong>Nome:</strong> Usuário Demo</p>
          <p><strong>Interesses:</strong> Cinema, Arte, Desenvolvimento</p>

          <button className="btn" onClick={() => navigate("/perfil")}>
            Editar Perfil
          </button>
        </div>

        {/* Atividade */}
        <div className="dash-card">
          <h3>Atividade Recente</h3>
          <p>Nenhuma postagem ainda.</p>
          <small style={{ opacity: 0.6 }}>Compartilhe algo para começar ✨</small>

          <button className="btn" onClick={() => navigate("/feed")}>
            Ver Feed
          </button>
        </div>

        {/* Ações */}
        <div classname="dash-card">
          <h3>Ações Rápidas</h3>
          <button className="btn" onClick={() => navigate("/feed")}>
            Criar Nova Publicação
          </button>
        </div>

      </div>

    </div>
  );
}
