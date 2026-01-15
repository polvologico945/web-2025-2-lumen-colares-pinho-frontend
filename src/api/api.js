/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
const API_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

// Headers com autenticação
const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Authorization": `Bearer ${token}`,
  };
};

// Login (já existe)
export async function login({ email, senha }) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, senha })
  });

  if (!res.ok) throw new Error("Credenciais inválidas");
  
  const data = await res.json();
  
  if (data.token) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("user", JSON.stringify(data.usuario));
  }
  
  return {
    user: data.usuario,
    token: data.token
  };
}

// Testar conexão (já existe)
export async function testarConexao() {
  try {
    const res = await fetch(`${API_URL}/health`);
    if (!res.ok) throw new Error("Backend offline");
    return await res.json();
  } catch (error) {
    throw new Error(`Falha na conexão: ${error.message}`);
  }
}

// ========== POSTS COM IMAGENS ==========

// Obter todos os posts
export async function getPosts() {
  const res = await fetch(`${API_URL}/api/posts`);
  
  if (!res.ok) {
    throw new Error(`Erro ao buscar posts: ${res.statusText}`);
  }
  
  const data = await res.json();
  return data.dados || [];
}

// Criar post com imagens
export async function createPost(formData) {
  const res = await fetch(`${API_URL}/api/posts`, {
    method: "POST",
    headers: getAuthHeaders(), // Não definir Content-Type para FormData!
    body: formData
  });
  
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.mensagem || `Erro ${res.status}: ${res.statusText}`);
  }
  
  return data;
}

// Atualizar post
export async function updatePost(postId, formData) {
  const res = await fetch(`${API_URL}/api/posts/${postId}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: formData
  });
  
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.mensagem || `Erro ao atualizar post`);
  }
  
  return data;
}

// Deletar post
export async function deletePost(postId) {
  const res = await fetch(`${API_URL}/api/posts/${postId}`, {
    method: "DELETE",
    headers: getAuthHeaders()
  });
  
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.mensagem || `Erro ao deletar post`);
  }
}

// Deletar imagem específica de um post
export async function deletePostImage(postId, imageUrl) {
  const res = await fetch(`${API_URL}/api/posts/${postId}/imagens`, {
    method: "DELETE",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ imagemUrl: imageUrl })
  });
  
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.mensagem || `Erro ao deletar imagem`);
  }
  
  return data;
}

// Obter limites de upload
export async function getUploadLimits() {
  try {
    const res = await fetch(`${API_URL}/api/posts/upload-limits`);
    
    if (!res.ok) {
      // Se a rota não existir, retornar valores padrão
      return {
        sucesso: true,
        limites: {
          max_imagens: 5,
          max_tamanho_mb: 5,
          tipos_permitidos: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
          pasta_uploads: '/uploads'
        }
      };
    }
    
    return await res.json();
  } catch (error) {
    // Em caso de erro, retornar valores padrão
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

// Adicionar comentário a um post
export async function addComment(postId, conteudo) {
  const res = await fetch(`${API_URL}/api/posts/${postId}/comentarios`, {
    method: "POST",
    headers: {
      ...getAuthHeaders(),
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ conteudo })
  });
  
  const data = await res.json();
  
  if (!res.ok) {
    throw new Error(data.mensagem || `Erro ao adicionar comentário`);
  }
  
  return data;
}

// Curtir post (se seu backend tiver essa funcionalidade)
export async function likePost(postId) {
  // Esta é uma implementação exemplo
  // Você precisa adaptar para sua API real
  const res = await fetch(`${API_URL}/api/posts/${postId}/like`, {
    method: "POST",
    headers: getAuthHeaders()
  });
  
  if (res.ok) {
    return await res.json();
  }
  
  // Se não tiver rota de like, simular
  return { sucesso: true, likes: 1 };
}

// ========== FUNÇÕES AUXILIARES ==========

// Criar FormData para enviar post
export function createPostFormData({ title, body, images, user }) {
  const formData = new FormData();
  
  if (title) formData.append('title', title);
  if (body) formData.append('body', body);
  if (user) formData.append('user', user);
  
  // Adicionar imagens
  if (images && images.length > 0) {
    images.forEach((image, index) => {
      if (image instanceof File) {
        formData.append('imagens', image);
      }
    });
  }
  
  return formData;
}

// Verificar se o usuário está autenticado
export function isAuthenticated() {
  return !!localStorage.getItem("token");
}

// Obter usuário atual
export function getCurrentUser() {
  const userStr = localStorage.getItem("user");
  return userStr ? JSON.parse(userStr) : null;
}

// Logout
export function logout() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}

// Verificar se uma imagem é do upload local
export function isLocalUploadImage(url) {
  return url && (url.startsWith('/uploads/') || url.startsWith('blob:'));
}

// Obter URL completa da imagem
export function getFullImageUrl(url) {
  if (!url) return '';
  
  if (url.startsWith('/uploads/')) {
    return `${API_URL}${url}`;
  }
  
  return url;
}