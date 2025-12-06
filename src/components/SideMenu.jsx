// src/components/SideMenu.jsx
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

// Função para checar se a notícia expirou
function isExpired(dateString) {
  const expireDate = new Date(dateString);
  expireDate.setHours(23, 59, 59, 999);
  return new Date() > expireDate;
}

export default function SideMenu({ open, onClose }) {
  const navigate = useNavigate();

  // Exemplo de notícias (em produção, busque da API)
  const [noticias, setNoticias] = useState([
    { id: 1, titulo: "Nova linha de ônibus", validade: "2025-12-10" },
    { id: 2, titulo: "Promoção bilhete único", validade: "2025-12-04" },
    { id: 3, titulo: "Aviso manutenção", validade: "2025-12-05" },
  ]);

  // Separa notícias em ativas e expiradas
  const noticiasAtivas = noticias.filter(n => !isExpired(n.validade));
  const noticiasExpiradas = noticias.filter(n => isExpired(n.validade));

  if (!open) return null;

  function goTo(path) {
    onClose();      // fecha o menu
    navigate(path); // navega para a rota
  }

  return (
    <>
      {/* Overlay */}
      <div className="side-overlay" onClick={onClose} />

      {/* Menu */}
      <aside className={`side-menu ${open ? "open" : ""}`}>
        <div className="side-header">
          <h3>LUMEN</h3>
          <button className="side-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <nav className="side-nav">
          {/* Ônibus */}
          <button
            className="side-item"
            onClick={() => goTo("/bus")}
          >
            Horários dos Ônibus
          </button>

          {/* Notícias Ativas */}
          <div className="side-section">
            <span className="side-section-title">📰 Notícias</span>

            {noticiasAtivas.length === 0 && (
              <span className="side-muted">Sem notícias ativas</span>
            )}

            {noticiasAtivas.map(noticia => (
              <button
                key={noticia.id}
                className="side-item"
                onClick={() => goTo(`/noticia/${noticia.id}`)}
              >
                {noticia.titulo}
              </button>
            ))}
          </div>

          {/* Notícias Expiradas */}
          <div className="side-section">
            <span className="side-section-title expired">⏳ Expiradas</span>

            {noticiasExpiradas.length === 0 && (
              <span className="side-muted">Nenhuma notícia expirada</span>
            )}

            {noticiasExpiradas.map(noticia => (
              <div key={noticia.id} className="side-item expired-item">
                {noticia.titulo}
              </div>
            ))}
          </div>
        </nav>
      </aside>
    </>
  );
}
