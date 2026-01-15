/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ImageUpload from "../components/ImageUpload/ImageUpload";
import { createPost } from "../api/feedService";
import "./CreatePostPage.css";

const CreatePostPage = () => {
  const navigate = useNavigate();
  const [body, setBody] = useState("");
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Verificar se usuário está logado
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) {
      navigate("/login");
      return;
    }

    try {
      const user = JSON.parse(userStr);
      if (!user || !user.id) {
        navigate("/login");
      }
    } catch (error) {
      navigate("/login");
    }
  }, [navigate]);

  const handleImagesChange = (newImages, imageToRemove) => {
    if (imageToRemove) {
      console.log("Imagem para remover:", imageToRemove);
    } else {
      setImages(newImages || []);
    }
  };

  // Validar formulário
  const validateForm = () => {
    if (!body.trim() && images.length === 0) {
      return "Post deve conter texto ou pelo menos uma imagem";
    }

    if (body.trim().length < 1 && images.length === 0) {
      return "Conteúdo muito curto (mínimo 1 caractere)";
    }

    return null;
  };

  // Enviar post
  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) {
        setError("Usuário não autenticado");
        setLoading(false);
        return;
      }

      const user = JSON.parse(userStr);

      // Criar FormData
      const formData = new FormData();
      formData.append("conteudo", body);
      formData.append("author_id", user.id);

      // Adicionar imagens
      images.forEach((img) => {
        formData.append("imagens[]", img);
      });

      // Enviar post
      const response = await createPost(formData);

      if (response && response.sucesso !== false) {
        setSuccess("Post criado com sucesso! Redirecionando...");

        setTimeout(() => {
          navigate("/feed");
        }, 1500);
      } else {
        setError(response?.mensagem || "Erro ao criar post");
      }
    } catch (err) {
      setError(err.message || "Erro de conexão com o servidor");
      console.error("Erro ao criar post:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-post-page">
      <div className="create-post-container">
        <header className="page-header">
          <h1>Criar Novo Post</h1>
          <p className="page-subtitle">
            Compartilhe suas ideias, notícias ou experiências com a comunidade
          </p>
        </header>

        <form onSubmit={handleSubmit} className="post-form">
          {/* Campo Conteúdo */}
          <div className="form-group">
            <label htmlFor="body">
              Conteúdo <span className="required">*</span>
            </label>
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="O que você gostaria de compartilhar?"
              className="content-textarea"
              rows={6}
              maxLength={5000}
              required
            />
            <div className="char-counter">{body.length}/5000 caracteres</div>
          </div>

          {/* Componente de Upload de Imagens */}
          <div className="form-group">
            <label>Imagens (opcional)</label>
            <ImageUpload
              onImagesChange={handleImagesChange}
              maxImages={5}
              maxSizeMB={5}
            />
            <div className="form-hint">
              Você pode adicionar até 5 imagens de 5MB cada
            </div>
          </div>

          {/* Mensagens de Status */}
          {error && <div className="message error">⚠️ {error}</div>}
          {success && <div className="message success">✅ {success}</div>}

          {/* Ações */}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary"
              disabled={loading}
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="btn-primary"
              disabled={loading || (!body.trim() && images.length === 0)}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Criando...
                </>
              ) : (
                "Publicar Post"
              )}
            </button>
          </div>

          {/* Dicas */}
          <div className="form-tips">
            <h4>💡 Dicas para um bom post:</h4>
            <ul>
              <li>Seja claro e objetivo</li>
              <li>Use parágrafos para organizar o conteúdo</li>
              <li>Adicione imagens relevantes para ilustrar</li>
              <li>Revise antes de publicar</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostPage;
