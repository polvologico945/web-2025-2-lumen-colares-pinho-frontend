/* eslint-disable no-undef */
/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserById, getUserPosts } from "../api/feedService";

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isOwnProfile, setIsOwnProfile] = useState(false);

  // Função para carregar posts
  const carregarPostsDoUsuario = async (userId) => {
    try {
      const postsData = await getUserPosts(userId);
      console.log("Posts recarregados:", postsData.length);
      setPosts(Array.isArray(postsData) ? postsData : []);
    } catch (error) {
      console.error("Erro ao carregar posts:", error);
    }
  };

  useEffect(() => {
    // Monitorar mudanças no localStorage
    const handleStorageChange = () => {
      if (user && user.id) {
        // Recarregar posts quando houver mudança no localStorage
        carregarPostsDoUsuario(user.id.toString());
      }
    };

    window.addEventListener("storage", handleStorageChange);

    // Também verificar periodicamente
    const interval = setInterval(() => {
      if (user && user.id && isOwnProfile) {
        carregarPostsDoUsuario(user.id.toString());
      }
    }, 5000); // Verificar a cada 5 segundos

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      clearInterval(interval);
    };
  }, [user, isOwnProfile]);

  useEffect(() => {
    async function loadUser() {
      try {
        setLoading(true);
        setError(null);

        console.log("Carregando perfil do usuário ID:", id);

        // PRIMEIRO: Tenta obter o usuário do localStorage
        let userData = null;
        let loggedUser = null;

        try {
          const userStr = localStorage.getItem("user");
          if (userStr) {
            loggedUser = JSON.parse(userStr);
          }
        } catch (parseError) {
          console.error("Erro ao parsear usuário do localStorage:", parseError);
        }

        // Se o ID solicitado for o mesmo do usuário logado, use os dados do localStorage
        if (loggedUser && loggedUser.id && loggedUser.id.toString() === id) {
          console.log("Usuário logado - usando dados do localStorage");
          userData = {
            id: loggedUser.id,
            name: loggedUser.name || loggedUser.nome || "Usuário Lumen",
            email: loggedUser.email || "",
            curso: loggedUser.curso || "Engenharia de Software",
            semestre: loggedUser.semestre || "6",
            cidade: loggedUser.cidade || "Quixadá",
            bio:
              loggedUser.bio ||
              "Bem-vindo ao Lumen! Compartilhe suas experiências e conhecimentos.",
            avatar_url:
              loggedUser.avatar_url ||
              loggedUser.avatar ||
              `https://i.pravatar.cc/150?u=${id}`,
            seguidores: loggedUser.seguidores || 42,
            seguindo: loggedUser.seguindo || 35,
          };

          setUser(userData);
          setIsOwnProfile(true);

          // Carrega posts do usuário
          try {
            const postsData = await getUserPosts(id);
            console.log("Posts carregados do próprio usuário:", postsData);
            setPosts(Array.isArray(postsData) ? postsData : []);
          } catch (postsError) {
            console.error("Erro ao carregar posts:", postsError);
            // Fallback para posts mockados
            const mockPosts = getMockUserPostsForCurrentUser(loggedUser.id);
            setPosts(mockPosts);
          }

          setLoading(false);
          return;
        }

        // Se não for o próprio usuário, tenta buscar da API
        try {
          userData = await getUserById(id);
          console.log("Usuário da API:", userData);

          if (userData) {
            setUser(userData);

            // Verifica se é o próprio perfil
            if (loggedUser && loggedUser.id) {
              setIsOwnProfile(loggedUser.id.toString() === id.toString());
            }

            // Carrega posts
            try {
              const postsData = await getUserPosts(id);
              console.log("Posts do usuário carregados:", postsData);
              setPosts(Array.isArray(postsData) ? postsData : []);
            } catch (postsError) {
              console.error("Erro ao carregar posts:", postsError);
              // Fallback para posts mockados
              const mockPosts = getMockUserPosts(id);
              setPosts(mockPosts);
            }
          } else {
            // Usa mock para IDs conhecidos
            const mockUsers = {
              1: {
                id: 1,
                name: "Leanne Graham",
                email: "leanne.graham@alu.ufc.br",
                curso: "Ciência da Computação",
                semestre: "6",
                cidade: "Quixadá",
                bio: "Testando novos conhecimentos em Web. Buscando alguém para projeto de extensão",
                avatar_url: "https://i.pravatar.cc/150?img=1",
                seguidores: 128,
                seguindo: 89,
              },
              2: {
                id: 2,
                name: "Ervin Howell",
                email: "ervin.howell@alu.ufc.br",
                curso: "Engenharia de Software",
                semestre: "4",
                cidade: "Quixadá",
                bio: "Interessado em desenvolvimento mobile e UX/UI",
                avatar_url: "https://i.pravatar.cc/150?img=2",
                seguidores: 95,
                seguindo: 67,
              },
              3: {
                id: 3,
                name: "Clementine Bauch",
                email: "clementine.bauch@alu.ufc.br",
                curso: "Sistemas de Informação",
                semestre: "8",
                cidade: "Quixadá",
                bio: "Focada em banco de dados e machine learning",
                avatar_url: "https://i.pravatar.cc/150?img=3",
                seguidores: 156,
                seguindo: 42,
              },
            };

            userData = mockUsers[id] || null;

            if (userData) {
              setUser(userData);
              // Carrega posts mockados
              const mockPosts = getMockUserPosts(id);
              setPosts(mockPosts);
            } else {
              setError("Usuário não encontrado");
            }
          }
        } catch (apiError) {
          console.error("Erro na API:", apiError);
          setError("Erro ao carregar dados do usuário");
        }
      } catch (err) {
        console.error("Erro geral ao carregar perfil:", err);
        setError("Erro ao carregar perfil. Tente novamente.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadUser();
    } else {
      setError("ID do usuário não fornecido");
      setLoading(false);
    }
  }, [id]);

  // Função para obter posts mockados do usuário atual
  function getMockUserPostsForCurrentUser(userId) {
    // Pega posts do localStorage se existirem
    const savedPosts = localStorage.getItem(`user_${userId}_posts`);
    if (savedPosts) {
      try {
        return JSON.parse(savedPosts);
      } catch (e) {
        console.error("Erro ao parsear posts salvos:", e);
      }
    }

    // Posts padrão para novo usuário
    return [
      {
        id: Date.now(),
        conteudo:
          "Bem-vindo ao Lumen! Estou pronto para compartilhar minhas experiências.",
        author_id: userId,
        data_criacao: new Date().toISOString(),
        likes: 0,
        comments: 0,
        images: [],
      },
    ];
  }

  // Função para adicionar novo post localmente
  const adicionarPostLocal = (novoPost) => {
    const postCompleto = {
      ...novoPost,
      id: Date.now(),
      data_criacao: new Date().toISOString(),
      likes: 0,
      comments: 0,
      images: [],
    };

    setPosts((prev) => [postCompleto, ...prev]);

    // Salva no localStorage
    const userId = user.id;
    const postsAtualizados = [postCompleto, ...posts];
    localStorage.setItem(
      `user_${userId}_posts`,
      JSON.stringify(postsAtualizados)
    );
  };

  const handleEditarPerfil = () => {
    navigate("/editar-perfil");
  };

  const handleEnviarMensagem = () => {
    if (user) {
      alert(`Iniciando conversa com ${user.name}...`);
    }
  };

  const handleVoltar = () => {
    navigate(-1);
  };

  const handleCriarPost = () => {
    navigate("/feed");
  };

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
          flexDirection: "column",
          gap: "20px",
        }}
      >
        <div
          style={{
            width: "40px",
            height: "40px",
            border: "3px solid var(--primary)",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
          }}
        ></div>
        <p style={{ color: "#8b949e" }}>Carregando perfil...</p>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div
        style={{
          padding: "40px 20px",
          textAlign: "center",
          maxWidth: "500px",
          margin: "0 auto",
        }}
      >
        <button
          onClick={handleVoltar}
          style={{
            background: "none",
            border: "none",
            color: "var(--primary)",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            margin: "0 auto 30px",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          ← Voltar
        </button>

        <div
          style={{
            background: "rgba(255, 87, 87, 0.1)",
            border: "1px solid #ff5757",
            borderRadius: "12px",
            padding: "30px",
          }}
        >
          <div
            style={{
              fontSize: "48px",
              marginBottom: "15px",
              color: "#ff5757",
            }}
          >
            😕
          </div>
          <h3 style={{ color: "#ff5757", marginBottom: "10px" }}>
            {error || "Usuário não encontrado"}
          </h3>
          <p style={{ color: "#8b949e", marginBottom: "20px" }}>
            O usuário que você está procurando não existe.
          </p>
          <button
            onClick={() => navigate("/feed")}
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
            Voltar para o Feed
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: "600px",
        margin: "0 auto",
        padding: "20px",
        minHeight: "100vh",
      }}
    >
      {/* Botão Voltar */}
      <button
        onClick={handleVoltar}
        style={{
          background: "none",
          border: "none",
          color: "var(--primary)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "30px",
          cursor: "pointer",
          fontSize: "16px",
          fontWeight: "500",
        }}
      >
        ← Voltar
      </button>

      {/* Cabeçalho do Perfil */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          borderRadius: "12px",
          padding: "30px",
          marginBottom: "30px",
          border: "1px solid #1d2633",
          textAlign: "center",
        }}
      >
        {/* Avatar */}
        <img
          src={
            user.avatar_url ||
            `https://i.pravatar.cc/150?u=${user.id || user.email}`
          }
          alt={user.name}
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            objectFit: "cover",
            border: "4px solid var(--primary)",
            marginBottom: "25px",
          }}
        />

        {/* Nome */}
        <h1
          style={{
            fontSize: "1.8rem",
            marginBottom: "8px",
            color: "white",
          }}
        >
          {user.name}
        </h1>

        {/* Curso e Semestre */}
        <p
          style={{
            color: "#8b949e",
            marginBottom: "25px",
            fontSize: "1rem",
          }}
        >
          {user.curso} - {user.semestre}º Semestre
        </p>

        {/* Bio */}
        <div
          style={{
            background: "rgba(var(--primary-rgb), 0.1)",
            borderRadius: "8px",
            padding: "20px",
            marginBottom: "30px",
            textAlign: "left",
          }}
        >
          <h3
            style={{
              color: "var(--primary)",
              marginBottom: "10px",
              fontSize: "1rem",
            }}
          >
            Bio
          </h3>
          <p
            style={{
              color: "#c9d1d9",
              lineHeight: "1.6",
              fontSize: "0.95rem",
            }}
          >
            {user.bio}
          </p>
        </div>

        {/* Botões de Ação */}
        <div
          style={{
            display: "flex",
            gap: "15px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {isOwnProfile ? (
            <>
              <button
                onClick={handleEditarPerfil}
                style={{
                  background: "var(--primary)",
                  border: "none",
                  color: "white",
                  padding: "12px 30px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  minWidth: "180px",
                  justifyContent: "center",
                }}
              >
                ✏️ Editar Perfil
              </button>
              <button
                onClick={handleCriarPost}
                style={{
                  background: "transparent",
                  border: "1px solid var(--primary)",
                  color: "var(--primary)",
                  padding: "12px 30px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  minWidth: "180px",
                  justifyContent: "center",
                }}
              >
                📝 Criar Post
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => alert("Funcionalidade em desenvolvimento")}
                style={{
                  background: "transparent",
                  border: "1px solid var(--primary)",
                  color: "var(--primary)",
                  padding: "12px 30px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  minWidth: "180px",
                  justifyContent: "center",
                }}
              >
                👤 Seguir
              </button>
              <button
                onClick={handleEnviarMensagem}
                style={{
                  background: "var(--primary)",
                  border: "none",
                  color: "white",
                  padding: "12px 30px",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "14px",
                  fontWeight: "500",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  minWidth: "180px",
                  justifyContent: "center",
                }}
              >
                💬 Enviar Mensagem
              </button>
            </>
          )}
        </div>
      </div>

      {/* Posts do Usuário */}
      <div style={{ marginBottom: "40px" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >
          <h3
            style={{
              color: "var(--primary)",
              fontSize: "1.2rem",
            }}
          >
            Publicações {posts.length > 0 ? `(${posts.length})` : ""}
          </h3>
          {isOwnProfile && (
            <button
              onClick={handleCriarPost}
              style={{
                background: "rgba(var(--primary-rgb), 0.1)",
                border: "1px solid var(--primary)",
                color: "var(--primary)",
                padding: "8px 16px",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "14px",
                display: "flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              + Nova publicação
            </button>
          )}
        </div>

        {posts.length > 0 ? (
          <div
            style={{ display: "flex", flexDirection: "column", gap: "15px" }}
          >
            {posts.map((post) => (
              <div
                key={post.id}
                style={{
                  background: "rgba(255, 255, 255, 0.03)",
                  borderRadius: "8px",
                  padding: "20px",
                  border: "1px solid #1d2633",
                }}
              >
                <p
                  style={{
                    color: "#c9d1d9",
                    lineHeight: "1.5",
                    marginBottom: "15px",
                    fontSize: "15px",
                  }}
                >
                  {post.conteudo || post.body}
                </p>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    color: "#8b949e",
                    fontSize: "12px",
                  }}
                >
                  <span>
                    {new Date(
                      post.data_criacao || post.createdAt || Date.now()
                    ).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  <div style={{ display: "flex", gap: "15px" }}>
                    <span>❤️ {post.likes || 0}</span>
                    <span>💬 {post.comments || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              background: "rgba(255,255,255,0.02)",
              borderRadius: "12px",
              border: "1px dashed #1d2633",
            }}
          >
            <div style={{ fontSize: "48px", marginBottom: "15px" }}>📝</div>
            <p style={{ color: "#8b949e", marginBottom: "10px" }}>
              {isOwnProfile
                ? "Você ainda não tem publicações."
                : "Este usuário ainda não tem publicações."}
            </p>
            <p
              style={{
                color: "#6e7681",
                fontSize: "14px",
                marginBottom: "20px",
              }}
            >
              {isOwnProfile
                ? "Compartilhe suas experiências com a comunidade!"
                : "Volte mais tarde para ver novidades."}
            </p>
            {isOwnProfile && (
              <button
                onClick={handleCriarPost}
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
            )}
          </div>
        )}
      </div>

      {/* Estatísticas */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          borderRadius: "12px",
          padding: "25px",
          border: "1px solid #1d2633",
          marginBottom: "40px",
        }}
      >
        <h3
          style={{
            color: "var(--primary)",
            marginBottom: "20px",
            fontSize: "1.2rem",
          }}
        >
          Estatísticas
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "20px",
            textAlign: "center",
          }}
        >
          <div>
            <div
              style={{ fontSize: "2rem", fontWeight: "bold", color: "white" }}
            >
              {posts.length}
            </div>
            <div style={{ fontSize: "0.9rem", color: "#8b949e" }}>Posts</div>
          </div>
          <div>
            <div
              style={{ fontSize: "2rem", fontWeight: "bold", color: "white" }}
            >
              {user.seguidores || 0}
            </div>
            <div style={{ fontSize: "0.9rem", color: "#8b949e" }}>
              Seguidores
            </div>
          </div>
          <div>
            <div
              style={{ fontSize: "2rem", fontWeight: "bold", color: "white" }}
            >
              {user.seguindo || 0}
            </div>
            <div style={{ fontSize: "0.9rem", color: "#8b949e" }}>Seguindo</div>
          </div>
        </div>
      </div>

      {/* Informações Adicionais */}
      <div
        style={{
          background: "rgba(255, 255, 255, 0.03)",
          borderRadius: "12px",
          padding: "25px",
          border: "1px solid #1d2633",
        }}
      >
        <h3
          style={{
            color: "var(--primary)",
            marginBottom: "20px",
            fontSize: "1.2rem",
          }}
        >
          Informações
        </h3>
        <div style={{ display: "grid", gap: "15px" }}>
          {user.email && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  background: "rgba(var(--primary-rgb), 0.1)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                📧
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "#8b949e" }}>Email</div>
                <div style={{ color: "#c9d1d9", fontSize: "14px" }}>
                  {user.email}
                </div>
              </div>
            </div>
          )}

          {user.cidade && (
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  background: "rgba(var(--primary-rgb), 0.1)",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                📍
              </div>
              <div>
                <div style={{ fontSize: "12px", color: "#8b949e" }}>
                  Localização
                </div>
                <div style={{ color: "#c9d1d9", fontSize: "14px" }}>
                  {user.cidade}
                </div>
              </div>
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "30px",
                height: "30px",
                background: "rgba(var(--primary-rgb), 0.1)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              🎓
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#8b949e" }}>Curso</div>
              <div style={{ color: "#c9d1d9", fontSize: "14px" }}>
                {user.curso}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div
              style={{
                width: "30px",
                height: "30px",
                background: "rgba(var(--primary-rgb), 0.1)",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              📚
            </div>
            <div>
              <div style={{ fontSize: "12px", color: "#8b949e" }}>Semestre</div>
              <div style={{ color: "#c9d1d9", fontSize: "14px" }}>
                {user.semestre}º Semestre
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Função auxiliar para posts mockados
function getMockUserPosts(userId) {
  const mockUserPosts = {
    1: [
      {
        id: 101,
        conteudo: "Primeiro post de teste no Lumen! 👋",
        author_id: 1,
        data_criacao: "2024-01-15T10:30:00Z",
        likes: 12,
        comments: 3,
        images: [],
      },
      {
        id: 102,
        conteudo: "Estou aprendendo React e estou adorando!",
        author_id: 1,
        data_criacao: "2024-01-10T14:20:00Z",
        likes: 8,
        comments: 2,
        images: [],
      },
    ],
    2: [
      {
        id: 201,
        conteudo: "Alguém interessado em estudar React juntos? 🚀",
        author_id: 2,
        data_criacao: "2024-01-14T15:45:00Z",
        likes: 8,
        comments: 5,
        images: [],
      },
    ],
    3: [
      {
        id: 301,
        conteudo: "Acabei de entregar meu projeto de BD! 🎉",
        author_id: 3,
        data_criacao: "2024-01-13T09:20:00Z",
        likes: 25,
        comments: 7,
        images: [],
      },
      {
        id: 302,
        conteudo: "Precisando de ajuda com consultas SQL complexas...",
        author_id: 3,
        data_criacao: "2024-01-05T11:15:00Z",
        likes: 5,
        comments: 10,
        images: [],
      },
    ],
  };

  return mockUserPosts[userId] || [];
}
