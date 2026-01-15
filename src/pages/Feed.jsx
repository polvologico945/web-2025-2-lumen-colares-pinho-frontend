/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from "react";
import { getPosts, createPost } from "../api/feedService";
import { curtirPost } from "../api/comentarioService";
import { getUsers } from "../api/userService";
import { useNavigate } from "react-router-dom";

const Feed = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [novoPost, setNovoPost] = useState({ body: "" });
  const [imagens, setImagens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");
  const [usuarioLogado, setUsuarioLogado] = useState(null);

  // Chave para salvar posts no localStorage
  const POSTS_STORAGE_KEY = "lumen_posts_com_imagens";

  // Função para salvar posts no localStorage
  const salvarPostsNoStorage = (postsParaSalvar) => {
    try {
      // Limitar o tamanho salvando apenas informações essenciais
      const postsParaStorage = postsParaSalvar.map((post) => ({
        id: post.id,
        conteudo: post.conteudo || post.body || post.content,
        author_name: post.author_name,
        author_avatar: post.author_avatar,
        curso: post.curso || "Engenharia de Software",
        data_criacao: post.data_criacao || post.createdAt,
        likes: post.likes || 0,
        comments: post.comments || 0,
        author_id: post.author_id,
        images: post.images ? post.images.slice(0, 2) : [],
      }));

      localStorage.setItem(POSTS_STORAGE_KEY, JSON.stringify(postsParaStorage));
    } catch (error) {
      console.error("Erro ao salvar posts no localStorage:", error);
    }
  };

  // Função para carregar posts do localStorage
  const carregarPostsDoStorage = () => {
    try {
      const postsSalvos = localStorage.getItem(POSTS_STORAGE_KEY);
      if (postsSalvos) {
        return JSON.parse(postsSalvos);
      }
    } catch (error) {
      console.error("Erro ao carregar posts do localStorage:", error);
    }
    return [];
  };

  // Função para limpar posts duplicados
  const limparPostsDuplicados = (postsArray) => {
    const postsUnicos = [];
    const idsVistos = new Set();

    postsArray.forEach((post) => {
      if (!idsVistos.has(post.id)) {
        idsVistos.add(post.id);
        postsUnicos.push(post);
      }
    });

    return postsUnicos;
  };

  // Função para mesclar posts da API com posts do localStorage
  const mesclarPostsComImagens = (postsDaApi, postsDoStorage) => {
    const postsMesclados = [...postsDaApi];

    // Criar mapa de posts do storage por ID
    const storageMap = new Map();
    postsDoStorage.forEach((post) => {
      storageMap.set(post.id, post);
    });

    // Para cada post da API, verificar se tem imagens no storage
    postsMesclados.forEach((post, index) => {
      const postDoStorage = storageMap.get(post.id);
      if (
        postDoStorage &&
        (postDoStorage.images?.length > 0 || postDoStorage.imagens?.length > 0)
      ) {
        // Manter as imagens do storage se o post da API não tiver imagens
        if (!post.images || post.images.length === 0) {
          postsMesclados[index] = {
            ...post,
            images: postDoStorage.images || [],
            imagens: postDoStorage.imagens || [],
            imagePreviews: postDoStorage.imagePreviews || [],
          };
        }
      }
    });

    return postsMesclados;
  };

  // Função principal para carregar o feed
  const carregarFeed = async () => {
    try {
      setCarregando(true);
      setErro("");
      const [postsData, usuariosData] = await Promise.all([
        getPosts(),
        getUsers(),
      ]);

      // Garante que os dados sejam arrays e remove duplicatas
      const postsFiltrados = limparPostsDuplicados(
        Array.isArray(postsData) ? postsData : []
      );

      // CORREÇÃO: Alterar todos os cursos para Engenharia de Software
      const postsComCursoCorrigido = postsFiltrados.map((post) => ({
        ...post,
        curso: "Engenharia de Software",
      }));

      // Carregar posts do localStorage
      const postsDoStorage = carregarPostsDoStorage();

      // Mesclar posts da API com posts do localStorage (para manter imagens)
      const postsMesclados = mesclarPostsComImagens(
        postsComCursoCorrigido,
        postsDoStorage
      );

      setPosts(postsMesclados);
      setUsuarios(Array.isArray(usuariosData) ? usuariosData : []);

      // Salvar os posts mesclados no localStorage
      salvarPostsNoStorage(postsMesclados);
    } catch (error) {
      console.error("Erro ao carregar feed:", error);
      setErro("Erro ao carregar o feed. Verifique sua conexão.");

      // Tentar carregar posts do localStorage em caso de erro
      const postsDoStorage = carregarPostsDoStorage();
      if (postsDoStorage.length > 0) {
        setPosts(postsDoStorage);
        alert("Carregando posts salvos localmente...");
      }

      setUsuarios([]);
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarFeed();

    // Carrega usuário logado
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUsuarioLogado(JSON.parse(userStr));
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
      }
    }
  }, []);

  const handleCurtir = async (postId) => {
    try {
      await curtirPost(postId);
      const novosPosts = posts.map((post) =>
        post.id === postId ? { ...post, likes: (post.likes || 0) + 1 } : post
      );
      setPosts(novosPosts);
      salvarPostsNoStorage(novosPosts);
    } catch (error) {
      console.error("Erro ao curtir:", error);
      alert("Erro ao curtir o post.");
    }
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 5) {
      alert("Máximo 5 imagens permitidas");
      return;
    }

    // Valida tamanho das imagens (5MB máximo)
    const tamanhoMaximo = 5 * 1024 * 1024; // 5MB
    for (const file of files) {
      if (file.size > tamanhoMaximo) {
        alert(`A imagem ${file.name} excede o tamanho máximo de 5MB`);
        return;
      }
    }

    setImagens(files);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setErro("");

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    if (!user || !user.id) {
      alert("Erro: Usuário não identificado. Faça login novamente.");
      setEnviando(false);
      return;
    }

    if (!novoPost.body.trim()) {
      alert("Escreva algo para publicar!");
      setEnviando(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("conteudo", novoPost.body.trim());
      formData.append("author_id", user.id);

      // Criar URLs permanentes para preview em base64
      const imagePreviews = [];
      for (const img of imagens) {
        const reader = new FileReader();
        const base64Promise = new Promise((resolve) => {
          reader.onload = () => resolve(reader.result);
          reader.readAsDataURL(img);
        });
        const base64 = await base64Promise;
        imagePreviews.push(base64);
      }

      imagens.forEach((img) => {
        formData.append("imagens[]", img);
      });

      const resultado = await createPost(formData);

      if (resultado.sucesso && resultado.post) {
        // Adicionar o post à lista IMEDIATAMENTE com previews
        const novoPostObj = {
          ...resultado.post,
          author_name: user.name || "Você",
          author_avatar:
            user.avatar_url ||
            user.avatar ||
            `https://i.pravatar.cc/150?u=${user.id}`,
          curso: "Engenharia de Software",
          // Garantir que as imagens apareçam IMEDIATAMENTE
          images: imagePreviews,
          imagens: imagePreviews,
          imagePreviews: imagePreviews,
        };

        const novosPosts = [novoPostObj, ...posts];
        setPosts(novosPosts);

        // Salvar IMEDIATAMENTE no localStorage
        salvarPostsNoStorage(novosPosts);

        alert("✅ Post criado com sucesso!");
        setNovoPost({ body: "" });
        setImagens([]);

        // Atualizar da API após 2 segundos (sem perder as imagens)
        setTimeout(() => {
          carregarFeed();
        }, 2000);
      } else {
        throw new Error(resultado.mensagem || "Erro ao criar post");
      }
    } catch (error) {
      console.error("Erro ao criar post:", error);
      alert(`❌ Erro: ${error.message}`);
      setErro(error.message);
    } finally {
      setEnviando(false);
    }
  };

  const formatarData = (dataString) => {
    try {
      const data = new Date(dataString);
      const agora = new Date();
      const diffMs = agora - data;
      const diffMin = Math.floor(diffMs / (1000 * 60));
      const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

      if (diffMin < 1) return "Agora mesmo";
      if (diffMin < 60) return `${diffMin} min atrás`;
      if (diffHrs < 24) return `${diffHrs} h atrás`;
      if (diffDias === 1) return "Ontem";
      if (diffDias < 7) return `${diffDias} dias atrás`;

      return data.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch (e) {
      return "Data desconhecida";
    }
  };

  // Função SIMPLES para extrair imagens de um post
  const extrairImagensDoPost = (post) => {
    // Verificar em várias propriedades
    const possiveisImagens = [];

    // Propriedade principal
    if (post.images && Array.isArray(post.images)) {
      possiveisImagens.push(...post.images);
    }

    // Propriedade em português
    if (post.imagens && Array.isArray(post.imagens)) {
      possiveisImagens.push(...post.imagens);
    }

    // Backup
    if (post.imagePreviews && Array.isArray(post.imagePreviews)) {
      possiveisImagens.push(...post.imagePreviews);
    }

    // Media/attachments
    if (post.media && Array.isArray(post.media)) {
      post.media.forEach((item) => {
        if (typeof item === "string") {
          possiveisImagens.push(item);
        } else if (item && typeof item === "object") {
          const url = item.url || item.image_url || item.src;
          if (url) possiveisImagens.push(url);
        }
      });
    }

    // Filtrar apenas strings válidas
    return possiveisImagens.filter(
      (img) => img && typeof img === "string" && img.trim() !== ""
    );
  };

  if (carregando) {
    return (
      <div
        className="muted"
        style={{
          marginTop: "100px",
          textAlign: "center",
          padding: "20px",
          minHeight: "60vh",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: "50px",
            height: "50px",
            border: "3px solid var(--primary)",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            marginBottom: "20px",
          }}
        ></div>
        <p style={{ color: "#8b949e" }}>Carregando feed da comunidade...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div
      className="feed-wrapper"
      style={{ padding: "20px", maxWidth: "800px", margin: "0 auto" }}
    >
      <header className="dashboard-header" style={{ marginBottom: "30px" }}>
        <h2
          className="logo-text"
          style={{
            color: "var(--primary)",
            fontSize: "2rem",
            marginBottom: "10px",
          }}
        >
          LUMEN
        </h2>
        <p className="dashboard-tagline" style={{ color: "#8b949e" }}>
          Conectando estudantes da UFC Quixadá
        </p>
      </header>

      {erro && (
        <div
          style={{
            background: "rgba(255, 87, 87, 0.1)",
            border: "1px solid #ff5757",
            borderRadius: "8px",
            padding: "12px",
            marginBottom: "20px",
            color: "#ff5757",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          ⚠️ {erro}
          <button
            onClick={carregarFeed}
            style={{
              marginLeft: "auto",
              background: "rgba(255, 87, 87, 0.2)",
              border: "1px solid #ff5757",
              color: "#ff5757",
              padding: "4px 12px",
              borderRadius: "4px",
              fontSize: "12px",
              cursor: "pointer",
            }}
          >
            Tentar novamente
          </button>
        </div>
      )}

      {/* Formulário para novo post */}
      <div
        className="dash-card"
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "30px",
          border: "1px solid #1d2633",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            marginBottom: "15px",
            gap: "12px",
          }}
        >
          <img
            src={
              usuarioLogado?.avatar_url ||
              usuarioLogado?.avatar ||
              `https://i.pravatar.cc/150?u=${usuarioLogado?.id || "user"}`
            }
            alt="Seu avatar"
            style={{
              width: "50px",
              height: "50px",
              borderRadius: "50%",
              objectFit: "cover",
              border: "2px solid var(--primary)",
            }}
          />
          <div>
            <strong
              style={{ display: "block", color: "white", fontSize: "16px" }}
            >
              {usuarioLogado?.name || usuarioLogado?.nome || "Usuário"}
            </strong>
            <span style={{ color: "#8b949e", fontSize: "12px" }}>
              {usuarioLogado?.curso || "Engenharia de Software"}
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="form">
          <textarea
            placeholder="No que você está pensando? Compartilhe com a comunidade..."
            value={novoPost.body}
            onChange={(e) => setNovoPost({ body: e.target.value })}
            rows="3"
            required
            disabled={enviando}
            style={{
              width: "100%",
              background: "#0a1118",
              border: "1px solid #1d2633",
              borderRadius: "8px",
              color: "white",
              padding: "12px",
              boxSizing: "border-box",
              fontSize: "14px",
              resize: "vertical",
              minHeight: "80px",
              fontFamily: "inherit",
            }}
          />

          {imagens.length > 0 && (
            <div style={{ marginTop: "15px" }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "10px",
                }}
              >
                <span
                  className="muted"
                  style={{ fontSize: "14px", color: "#8b949e" }}
                >
                  {imagens.length} {imagens.length === 1 ? "imagem" : "imagens"}{" "}
                  selecionada{imagens.length > 1 ? "s" : ""}
                </span>
                <button
                  type="button"
                  onClick={() => setImagens([])}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#ff5757",
                    cursor: "pointer",
                    fontSize: "12px",
                    textDecoration: "underline",
                  }}
                >
                  Remover todas
                </button>
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                {imagens.map((img, index) => (
                  <div key={index} style={{ position: "relative" }}>
                    <img
                      src={URL.createObjectURL(img)}
                      alt={`Pré-visualização ${index + 1}`}
                      style={{
                        width: "80px",
                        height: "80px",
                        borderRadius: "6px",
                        objectFit: "cover",
                        border: "1px solid #1d2633",
                      }}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setImagens(imagens.filter((_, i) => i !== index))
                      }
                      style={{
                        position: "absolute",
                        top: "-5px",
                        right: "-5px",
                        background: "#ff5757",
                        border: "none",
                        borderRadius: "50%",
                        width: "20px",
                        height: "20px",
                        color: "white",
                        fontSize: "12px",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: "15px",
              flexWrap: "wrap",
              gap: "10px",
            }}
          >
            <div style={{ display: "flex", gap: "10px" }}>
              <label
                className="nav-item"
                style={{
                  cursor: enviando ? "not-allowed" : "pointer",
                  border: "1px solid var(--primary)",
                  fontSize: "14px",
                  padding: "8px 12px",
                  borderRadius: "4px",
                  opacity: enviando ? 0.6 : 1,
                  background: "rgba(var(--primary-rgb), 0.1)",
                  color: "var(--primary)",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  style={{ display: "none" }}
                  disabled={enviando}
                />
                📷 Imagens
              </label>
            </div>

            <button
              type="submit"
              className="btn"
              disabled={enviando}
              style={{
                margin: 0,
                width: "140px",
                opacity: enviando ? 0.7 : 1,
                cursor: enviando ? "not-allowed" : "pointer",
                background: "var(--primary)",
                border: "none",
                color: "white",
                padding: "10px 20px",
                borderRadius: "6px",
                fontSize: "14px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              {enviando ? (
                <>
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      border: "2px solid white",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 1s linear infinite",
                    }}
                  ></div>
                  Publicando...
                </>
              ) : (
                "Publicar"
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Lista de posts */}
      <div className="dashboard-list">
        {posts.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              background: "rgba(255,255,255,0.02)",
              borderRadius: "12px",
              border: "1px dashed #1d2633",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "15px" }}>📭</div>
            <p
              style={{
                color: "#8b949e",
                marginBottom: "10px",
                fontSize: "16px",
              }}
            >
              Nenhuma publicação ainda
            </p>
            <p
              style={{
                color: "#6e7681",
                fontSize: "14px",
                marginBottom: "20px",
              }}
            >
              Seja o primeiro a compartilhar algo com a comunidade!
            </p>
            <button
              onClick={() => document.querySelector("textarea")?.focus()}
              style={{
                background: "var(--primary)",
                border: "none",
                color: "white",
                padding: "10px 20px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Criar primeira publicação
            </button>
          </div>
        ) : (
          posts.map((post) => {
            // Extrair imagens SIMPLES
            const imagensDoPost = extrairImagensDoPost(post);

            return (
              <div
                key={post.id}
                className="feed-card"
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  borderRadius: "12px",
                  padding: "20px",
                  marginBottom: "20px",
                  border: "1px solid #1d2633",
                  transition: "transform 0.2s, box-shadow 0.2s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 4px 12px rgba(0, 0, 0, 0.15)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <div
                  className="feed-header"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    marginBottom: "15px",
                  }}
                >
                  <img
                    src={
                      post.author_avatar ||
                      post.avatar ||
                      `https://i.pravatar.cc/150?u=${post.author_id || post.id}`
                    }
                    alt="Avatar"
                    className="feed-avatar"
                    style={{
                      width: "50px",
                      height: "50px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      marginRight: "12px",
                      border: "2px solid var(--primary)",
                      cursor: "pointer",
                    }}
                    onClick={() => navigate(`/perfil/${post.author_id}`)}
                  />
                  <div className="feed-user" style={{ flex: 1 }}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div>
                        <strong
                          style={{
                            display: "block",
                            color: "white",
                            fontSize: "16px",
                            cursor: "pointer",
                          }}
                          onClick={() => navigate(`/perfil/${post.author_id}`)}
                        >
                          {post.author_name || post.nome || "Usuário Lumen"}
                        </strong>
                        <span
                          style={{
                            color: "#8b949e",
                            fontSize: "12px",
                          }}
                        >
                          Engenharia de Software •{" "}
                          {formatarData(post.data_criacao || post.createdAt)}
                        </span>
                      </div>
                      {post.author_id === usuarioLogado?.id && (
                        <span
                          style={{
                            background: "rgba(var(--primary-rgb), 0.1)",
                            color: "var(--primary)",
                            fontSize: "11px",
                            padding: "2px 8px",
                            borderRadius: "10px",
                            border: "1px solid rgba(var(--primary-rgb), 0.3)",
                          }}
                        >
                          Você
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="feed-content" style={{ marginBottom: "15px" }}>
                  <p
                    style={{
                      color: "#e6edf3",
                      lineHeight: "1.6",
                      fontSize: "15px",
                      whiteSpace: "pre-wrap",
                      wordBreak: "break-word",
                    }}
                  >
                    {post.conteudo || post.body || post.content}
                  </p>
                </div>

                {/* Renderização de imagens - DIRETA E SIMPLES */}
                {imagensDoPost.length > 0 && (
                  <div
                    className="feed-images"
                    style={{
                      display: "flex",
                      gap: "8px",
                      marginTop: "12px",
                      flexWrap: "wrap",
                      marginBottom: "15px",
                    }}
                  >
                    {imagensDoPost
                      .map((imgUrl, index) => {
                        if (!imgUrl || imgUrl.trim() === "") return null;

                        return (
                          <div key={index} style={{ position: "relative" }}>
                            <img
                              src={imgUrl}
                              alt={`Imagem ${index + 1}`}
                              style={{
                                width: "150px",
                                height: "150px",
                                borderRadius: "8px",
                                objectFit: "cover",
                                border: "1px solid #1d2633",
                                cursor: "pointer",
                                transition: "transform 0.2s",
                              }}
                              onClick={() => {
                                if (
                                  imgUrl.startsWith("http") ||
                                  imgUrl.startsWith("data:")
                                ) {
                                  window.open(imgUrl, "_blank");
                                }
                              }}
                              onError={(e) => {
                                console.log(
                                  `Erro ao carregar imagem ${index + 1}`
                                );
                                e.target.style.display = "none";
                              }}
                              onMouseOver={(e) =>
                                (e.currentTarget.style.transform =
                                  "scale(1.05)")
                              }
                              onMouseOut={(e) =>
                                (e.currentTarget.style.transform = "scale(1)")
                              }
                            />
                          </div>
                        );
                      })
                      .filter(Boolean)}
                  </div>
                )}

                <div
                  className="feed-divider"
                  style={{
                    height: "1px",
                    background: "#1d2633",
                    margin: "15px 0",
                  }}
                ></div>

                <div
                  className="feed-actions"
                  style={{
                    display: "flex",
                    gap: "20px",
                    alignItems: "center",
                  }}
                >
                  <button
                    onClick={() => handleCurtir(post.id)}
                    className="feed-action"
                    style={{
                      background: "none",
                      border: "none",
                      color: post.liked ? "#ff6b6b" : "#8b949e",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      fontSize: "14px",
                      padding: "5px 10px",
                      borderRadius: "4px",
                      transition: "all 0.2s",
                    }}
                    onMouseOver={(e) =>
                      (e.target.style.background = "rgba(255, 107, 107, 0.1)")
                    }
                    onMouseOut={(e) => (e.target.style.background = "none")}
                  >
                    {post.liked ? "❤️" : "🤍"} Curtir ({post.likes || 0})
                  </button>
                  <button
                    className="feed-action"
                    style={{
                      background: "none",
                      border: "none",
                      color: "#8b949e",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      fontSize: "14px",
                      padding: "5px 10px",
                      borderRadius: "4px",
                      transition: "all 0.2s",
                    }}
                    onClick={() => alert("Comentários em desenvolvimento")}
                    onMouseOver={(e) =>
                      (e.target.style.background = "rgba(255,255,255,0.05)")
                    }
                    onMouseOut={(e) => (e.target.style.background = "none")}
                  >
                    💬 Comentários ({post.comments || 0})
                  </button>
                  <button
                    className="feed-action"
                    style={{
                      background: "none",
                      border: "none",
                      color: "#8b949e",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "5px",
                      fontSize: "14px",
                      padding: "5px 10px",
                      borderRadius: "4px",
                      transition: "all 0.2s",
                      marginLeft: "auto",
                    }}
                    onClick={() => alert("Compartilhar em desenvolvimento")}
                    onMouseOver={(e) =>
                      (e.target.style.background = "rgba(255,255,255,0.05)")
                    }
                    onMouseOut={(e) => (e.target.style.background = "none")}
                  >
                    🔗 Compartilhar
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Membros Recentes */}
      <div
        className="dashboard-section"
        style={{
          marginTop: "40px",
          padding: "20px",
          background: "rgba(255,255,255,0.03)",
          borderRadius: "12px",
          border: "1px solid #1d2633",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "15px",
          }}
        >
          <h3
            style={{
              fontSize: "1.1rem",
              color: "var(--primary)",
              margin: 0,
            }}
          >
            👥 Estudantes na Rede
          </h3>
          <button
            onClick={() => navigate("/usuarios")}
            style={{
              background: "none",
              border: "none",
              color: "#8b949e",
              cursor: "pointer",
              fontSize: "12px",
              textDecoration: "underline",
            }}
          >
            Ver todos
          </button>
        </div>
        <div
          style={{
            display: "flex",
            gap: "12px",
            overflowX: "auto",
            paddingBottom: "10px",
            scrollbarWidth: "thin",
            scrollbarColor: "var(--primary) #1d2633",
          }}
        >
          {usuarios.length === 0 ? (
            <p style={{ color: "#8b949e", fontSize: "14px", padding: "10px" }}>
              Nenhum usuário encontrado.
            </p>
          ) : (
            usuarios.slice(0, 15).map((u) => (
              <div
                key={u.id}
                style={{
                  textAlign: "center",
                  minWidth: "60px",
                  cursor: "pointer",
                }}
                onClick={() => navigate(`/perfil/${u.id}`)}
              >
                <img
                  src={
                    u.avatar_url ||
                    u.avatar ||
                    `https://i.pravatar.cc/150?u=${u.id}`
                  }
                  alt={u.name || u.nome}
                  title={u.name || u.nome}
                  style={{
                    width: "45px",
                    height: "45px",
                    borderRadius: "50%",
                    border: "2px solid var(--primary)",
                    objectFit: "cover",
                    marginBottom: "5px",
                  }}
                />
                <p
                  style={{
                    fontSize: "10px",
                    color: "#8b949e",
                    maxWidth: "45px",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    margin: 0,
                  }}
                >
                  {u.name?.split(" ")[0] || u.nome?.split(" ")[0] || "User"}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Botão para carregar mais */}
      {posts.length > 0 && (
        <div style={{ textAlign: "center", marginTop: "30px" }}>
          <button
            onClick={carregarFeed}
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid #1d2633",
              color: "#8b949e",
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            🔄 Atualizar feed
          </button>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        ::-webkit-scrollbar {
          height: 6px;
        }
        
        ::-webkit-scrollbar-track {
          background: #1d2633;
          border-radius: 3px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: var(--primary);
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
};

export default Feed;
