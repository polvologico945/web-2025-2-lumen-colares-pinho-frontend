import React from "react";
import "./PostCard.css";

const PostCard = ({ post }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatImageCount = (images) => {
    if (!images || images.length === 0) return "";
    if (images.length === 1) return "1 imagem";
    return `${images.length} imagens`;
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="user-info">
          <img
            src={post.user?.avatar || "https://i.pravatar.cc/150"}
            alt={post.user?.username}
            className="user-avatar"
          />
          <div className="user-details">
            <h4 className="username">{post.user?.username || "Anônimo"}</h4>
            <span className="post-date">{formatDate(post.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="post-content">
        {post.title && <h3 className="post-title">{post.title}</h3>}

        {post.body && <p className="post-body">{post.body}</p>}

        {/* Galeria de Imagens */}
        {post.imagens && post.imagens.length > 0 && (
          <div className="post-images">
            <div className="images-header">
              <span className="images-count">
                {formatImageCount(post.imagens)}
              </span>
            </div>

            <div
              className={`image-grid grid-${Math.min(post.imagens.length, 4)}`}
            >
              {post.imagens.slice(0, 4).map((img, index) => (
                <div key={index} className="image-container">
                  <img
                    src={
                      img.startsWith("/uploads/")
                        ? `http://localhost:8000${img}`
                        : img
                    }
                    alt={`Imagem ${index + 1} do post`}
                    className="post-image"
                    loading="lazy"
                  />

                  {index === 3 && post.imagens.length > 4 && (
                    <div className="more-images-overlay">
                      +{post.imagens.length - 4}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="post-footer">
        <div className="post-stats">
          <button className="stat-btn like-btn">👍 {post.likes || 0}</button>
          <button className="stat-btn comment-btn">
            💬 {post.comments || 0}
          </button>
        </div>

        <div className="post-actions">
          <button className="action-btn">Curtir</button>
          <button className="action-btn">Comentar</button>
          <button className="action-btn">Compartilhar</button>
        </div>
      </div>
    </div>
  );
};

export default PostCard;
