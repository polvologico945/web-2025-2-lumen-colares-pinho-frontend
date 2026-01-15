/* eslint-disable no-unreachable */
/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// ========== CONSTANTES DE STORAGE ==========
const STORAGE_KEYS = {
  POSTS: 'lumen_posts',
  USER: 'user',
  TOKEN: 'token'
};

// ========== FUNÇÕES DE STORAGE ==========

// Obter posts do localStorage
export function getLocalPosts() {
  try {
    const postsStr = localStorage.getItem(STORAGE_KEYS.POSTS);
    if (postsStr) {
      return JSON.parse(postsStr);
    }
  } catch (error) {
    console.error('Erro ao ler posts do localStorage:', error);
  }
  return [];
}

// Salvar posts no localStorage
export function saveLocalPosts(posts) {
  try {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  } catch (error) {
    console.error('Erro ao salvar posts no localStorage:', error);
  }
}

// Adicionar novo post ao localStorage
export function addLocalPost(post) {
  try {
    const posts = getLocalPosts();
    // Verifica se o post já existe pelo ID ou conteúdo similar
    const postExists = posts.some(p => 
      p.id === post.id || 
      (p.conteudo === post.conteudo && p.author_id === post.author_id)
    );
    
    if (!postExists) {
      posts.unshift(post); // Adiciona no início
      saveLocalPosts(posts);
      console.log('Post salvo localmente:', post.id);
      return true;
    } else {
      console.log('Post já existe localmente:', post.id);
    }
  } catch (error) {
    console.error('Erro ao adicionar post ao localStorage:', error);
  }
  return false;
}

// Limpar posts duplicados
function deduplicatePosts(posts) {
  const seen = new Set();
  return posts.filter(post => {
    // Usar ID se disponível, caso contrário criar hash do conteúdo
    const key = post.id || `${post.conteudo}_${post.author_id}_${post.data_criacao}`;
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
}

// ========== FUNÇÕES PRINCIPAIS ==========

// Testar conexão
export async function testarConexao() {
  try {
    const res = await fetch(`${API_URL}/health`);
    if (!res.ok) throw new Error("Backend offline");
    return await res.json();
  } catch (error) {
    throw new Error(`Falha na conexão: ${error.message}`);
  }
}

// Obter todos os posts (combinando API e localStorage)
export async function getPosts() {
  try {
    console.log("Buscando posts...");
    
    let apiPosts = [];
    try {
      const res = await fetch(`${API_URL}/api/posts`);
      if (res.ok) {
        const data = await res.json();
        apiPosts = data.dados || data || [];
        console.log("Posts da API:", apiPosts.length);
      } else {
        console.warn(`Erro ${res.status} ao buscar posts da API`);
      }
    } catch (apiError) {
      console.warn("Erro na conexão com API:", apiError.message);
    }
    
    // Obter posts do localStorage
    const localPosts = getLocalPosts();
    console.log("Posts locais:", localPosts.length);
    
    // Combinar todos os posts
    const allPosts = [...localPosts, ...apiPosts];
    
    // Remover duplicatas
    const uniquePosts = deduplicatePosts(allPosts);
    
    // Ordenar por data (mais recentes primeiro)
    uniquePosts.sort((a, b) => {
      const dateA = new Date(a.data_criacao || a.createdAt || a.created_at || 0);
      const dateB = new Date(b.data_criacao || b.createdAt || b.created_at || 0);
      return dateB - dateA;
    });
    
    console.log("Total de posts únicos:", uniquePosts.length);
    
    // Salvar versão combinada no localStorage
    if (uniquePosts.length > 0) {
      saveLocalPosts(uniquePosts);
    }
    
    return uniquePosts;
    
  } catch (error) {
    console.error("Erro em getPosts:", error);
    // Retornar posts do localStorage em caso de erro
    const localPosts = getLocalPosts();
    if (localPosts.length > 0) {
      return localPosts;
    }
    return getMockPosts();
  }
}

// Criar post
export async function createPost(formData) {
  try {
    console.log("Criando post...");
    
    const user = getCurrentUser();
    if (!user) {
      throw new Error("Usuário não autenticado");
    }
    
    const conteudo = formData.get("conteudo") || formData.get("body") || "";
    if (!conteudo.trim()) {
      throw new Error("O conteúdo do post não pode estar vazio");
    }
    
    // Criar objeto do post localmente PRIMEIRO
    const localPost = {
      id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      conteudo: conteudo.trim(),
      body: conteudo.trim(),
      author_id: user.id,
      author_name: user.name || user.nome || "Usuário",
      author_avatar: user.avatar_url || user.avatar || `https://i.pravatar.cc/150?u=${user.id}`,
      curso: user.curso || "Ciência da Computação",
      data_criacao: new Date().toISOString(),
      created_at: new Date().toISOString(),
      likes: 0,
      comments: 0,
      images: []
    };
    
    console.log("Post local criado:", localPost);
    
    // Salvar localmente IMEDIATAMENTE
    addLocalPost(localPost);
    
    // Tentar enviar para a API (em segundo plano)
    try {
      const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
      if (token) {
        const res = await fetch(`${API_URL}/api/posts`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`,
          },
          body: formData
        });
        
        if (res.ok) {
          const data = await res.json();
          console.log("Post enviado para API com sucesso:", data);
          
          // Atualizar o post local com ID da API se disponível
          if (data.dados && data.dados.id) {
            // Marcar post local para remoção futura
            localPost.sync_id = data.dados.id;
          }
        } else {
          console.warn("API retornou erro, mantendo post local");
        }
      }
    } catch (apiError) {
      console.warn("Erro ao enviar para API, mantendo post local:", apiError.message);
    }
    
    return {
      sucesso: true,
      mensagem: "Post criado com sucesso",
      post: localPost
    };
    
  } catch (error) {
    console.error("Erro em createPost:", error);
    return {
      sucesso: false,
      mensagem: error.message || "Erro ao criar post",
      post: null
    };
  }
}

// Obter posts de um usuário específico
export async function getUserPosts(userId) {
  try {
    console.log(`Buscando posts do usuário ${userId}...`);
    
    // Primeiro, obter todos os posts
    const allPosts = await getPosts();
    
    // Filtrar posts do usuário
    const userPosts = allPosts.filter(post => 
      post.author_id && post.author_id.toString() === userId.toString()
    );
    
    console.log(`Posts do usuário ${userId} encontrados:`, userPosts.length);
    
    if (userPosts.length === 0) {
      return getMockUserPosts(userId);
    }
    
    return userPosts;
    
  } catch (error) {
    console.error("Erro em getUserPosts:", error);
    
    // Tentar obter do localStorage
    const localPosts = getLocalPosts();
    const userLocalPosts = localPosts.filter(post => 
      post.author_id && post.author_id.toString() === userId.toString()
    );
    
    if (userLocalPosts.length > 0) {
      return userLocalPosts;
    }
    
    return getMockUserPosts(userId);
  }
}

// Curtir post
export async function curtirPost(postId) {
  try {
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (!token) {
      console.warn("Token não encontrado, atualizando localmente");
      return updateLocalPostLikes(postId);
    }
    
    const res = await fetch(`${API_URL}/api/posts/${postId}/like`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    });
    
    if (!res.ok) {
      throw new Error(`Erro ${res.status} ao curtir post`);
    }
    
    const data = await res.json();
    
    // Atualizar também localmente
    updateLocalPostLikes(postId);
    
    return data;
  } catch (error) {
    console.error("Erro em curtirPost:", error);
    return updateLocalPostLikes(postId);
  }
}

// Atualizar curtidas localmente
function updateLocalPostLikes(postId) {
  try {
    const posts = getLocalPosts();
    const postIndex = posts.findIndex(p => p.id === postId);
    
    if (postIndex !== -1) {
      posts[postIndex].likes = (posts[postIndex].likes || 0) + 1;
      saveLocalPosts(posts);
    }
    
    return { sucesso: true, likes: 1 };
  } catch (error) {
    console.error("Erro ao atualizar curtidas localmente:", error);
    return { sucesso: true, likes: 1 };
  }
}

// Obter usuário por ID
export async function getUserById(userId) {
  try {
    console.log(`Buscando usuário ${userId}...`);
    const res = await fetch(`${API_URL}/api/users/${userId}`);
    
    if (res.ok) {
      const data = await res.json();
      console.log(`Usuário ${userId} encontrado:`, data);
      return data.dados || data;
    }
    
    console.warn(`Erro ${res.status} ao buscar usuário ${userId}, usando fallback`);
    return getMockUserById(userId);
  } catch (error) {
    console.error("Erro em getUserById:", error);
    return getMockUserById(userId);
  }
}

// Obter todos os usuários
export async function getUsers() {
  try {
    const res = await fetch(`${API_URL}/api/users`);
    
    if (res.ok) {
      const data = await res.json();
      return data.dados || data || [];
    }
    
    return getMockUsers();
  } catch (error) {
    console.error("Erro em getUsers:", error);
    return getMockUsers();
  }
}

// Obter limites de upload
export async function getUploadLimits() {
  try {
    const res = await fetch(`${API_URL}/api/posts/upload-limits`);
    
    if (!res.ok) {
      return {
        sucesso: true,
        limites: {
          max_imagens: 5,
          max_tamanho_mb: 5,
          tipos_permitidos: ['jpg', 'jpeg', 'png', 'gif', 'webp']
        }
      };
    }
    
    return await res.json();
  } catch (error) {
    return {
      sucesso: false,
      limites: {
        max_imagens: 5,
        max_tamanho_mb: 5,
        tipos_permitidos: ['jpg', 'jpeg', 'png', 'gif', 'webp']
      }
    };
  }
}

// ========== FUNÇÕES AUXILIARES ==========

// Verificar se o usuário está autenticado
export function isAuthenticated() {
  return !!localStorage.getItem(STORAGE_KEYS.TOKEN);
}

// Obter usuário atual
export function getCurrentUser() {
  const userStr = localStorage.getItem(STORAGE_KEYS.USER);
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error("Erro ao parsear usuário do localStorage:", error);
    return null;
  }
}

// Logout
export function logout() {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
}

// Login
export async function login({ email, senha }) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha })
  });

  if (!res.ok) throw new Error("Credenciais inválidas");
  
  const data = await res.json();
  
  if (data.token) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, data.token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(data.usuario));
  }
  
  return {
    user: data.usuario,
    token: data.token
  };
}

// Limpar posts locais (para debug)
export function clearLocalPosts() {
  localStorage.removeItem(STORAGE_KEYS.POSTS);
  console.log("Posts locais limpos");
}

// ========== DADOS MOCKADOS ==========

function getMockPosts() {
  return [
    {
      id: 1,
      conteudo: "Primeiro post de teste no Lumen! 👋 Estou animado para compartilhar conhecimento com todos.",
      author_id: 1,
      author_name: "Leanne Graham",
      author_avatar: "https://i.pravatar.cc/150?img=1",
      curso: "Ciência da Computação",
      data_criacao: "2024-01-15T10:30:00Z",
      likes: 12,
      comments: 3,
      images: []
    },
    {
      id: 2,
      conteudo: "Alguém interessado em estudar React juntos? 🚀 Podemos formar um grupo de estudos!",
      author_id: 2,
      author_name: "Ervin Howell",
      author_avatar: "https://i.pravatar.cc/150?img=2",
      curso: "Engenharia de Software",
      data_criacao: "2024-01-14T15:45:00Z",
      likes: 8,
      comments: 5,
      images: []
    }
  ];
}

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
        images: []
      }
    ],
    2: [
      {
        id: 201,
        conteudo: "Alguém interessado em estudar React juntos? 🚀",
        author_id: 2,
        data_criacao: "2024-01-14T15:45:00Z",
        likes: 8,
        comments: 5,
        images: []
      }
    ]
  };
  
  return mockUserPosts[userId] || [];
}

function getMockUserById(userId) {
  const mockUsers = {
    1: {
      id: 1,
      name: "Leanne Graham",
      email: "leanne.graham@alu.ufc.br",
      curso: "Ciência da Computação",
      semestre: "6",
      cidade: "Quixadá",
      bio: "Testando novos conhecimentos em Web. Buscando alguém para projeto de extensão.",
      avatar_url: "https://i.pravatar.cc/150?img=1",
      seguidores: 128,
      seguindo: 89
    }
  };
  
  return mockUsers[userId] || null;
}

function getMockUsers() {
  return [
    {
      id: 1,
      name: "Leanne Graham",
      avatar_url: "https://i.pravatar.cc/150?img=1",
      curso: "Ciência da Computação"
    }
  ];
}

// ========== OUTROS SERVIÇOS ==========

export async function getNoticias() {
  try {
    const res = await fetch(`${API_URL}/noticias`);
    if (!res.ok) return [];
    const data = await res.json();
    return data.dados || data || [];
  } catch (error) {
    console.error("Erro em getNoticias:", error);
    return [];
  }
}

export async function getHorariosOnibus() {
  try {
    const res = await fetch(`${API_URL}/noticias/onibus/horarios`);
    if (!res.ok) return getMockHorariosOnibus();
    const data = await res.json();
    return data.dados || data;
  } catch (error) {
    console.error("Erro em getHorariosOnibus:", error);
    return getMockHorariosOnibus();
  }
}

export const getOnibusPorTipo = async (tipo) => {
  try {
    const res = await fetch(`${API_URL}/onibus/${tipo}`);
    if (!res.ok) return getMockOnibusPorTipo(tipo);
    const data = await res.json();
    return data.dados || data || [];
  } catch (error) {
    console.error("Erro em getOnibusPorTipo:", error);
    return getMockOnibusPorTipo(tipo);
  }
};

function getMockHorariosOnibus() {
  return {
    campus_rodoviaria: [
      { hora: "07h10", onibus: "A", origem: "Rodoviária", destino: "Campus" }
    ]
  };
}

function getMockOnibusPorTipo(tipo) {
  const horarios = {
    campus_rodoviaria: [
      { hora: "07h10", onibus: "A", origem: "Rodoviária", destino: "Campus" }
    ]
  };
  return horarios[tipo] || [];
}