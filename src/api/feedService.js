const API_URL = "http://127.0.0.1:8000/api";

export async function getPosts() {
  try {
    const res = await fetch(`${API_URL}/posts`);
    if (!res.ok) throw new Error("Erro ao buscar posts");
    
    const data = await res.json();
    return data.dados?.map(post => ({
      id: post.id,
      title: post.title,
      body: post.body,
      user: post.user,
      price: post.price,
      images: post.images || [],
      createdAt: post.createdAt,
      likes: post.likes || 0,
      comments: post.comments || 0
    })) || [];
  } catch (error) {
    console.error("Erro em getPosts:", error);
    return [];
  }
}

export async function getPostById(id) {
  try {
    const res = await fetch(`${API_URL}/posts/${id}`);
    if (!res.ok) throw new Error("Post não encontrado");
    
    const data = await res.json();
    return data.dados;
  } catch (error) {
    console.error("Erro em getPostById:", error);
    return null;
  }
}

export async function createPost(postData, imagens = []) {
  try {
    const token = localStorage.getItem("token");
    
    if (imagens.length > 0) {
      const formData = new FormData();
      formData.append("title", postData.title || "");
      formData.append("body", postData.body || "");
      formData.append("user", postData.user || "Anônimo");
      formData.append("price", postData.price || 0);
      
      imagens.forEach((imagem) => {
        formData.append("imagens", imagem);
      });
      
      const res = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });
      
      if (!res.ok) throw new Error("Erro ao criar post");
      return await res.json();
    } else {
      const res = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });
      
      if (!res.ok) throw new Error("Erro ao criar post");
      return await res.json();
    }
  } catch (error) {
    console.error("Erro em createPost:", error);
    throw error;
  }
}

export async function getNoticias() {
  try {
    const res = await fetch(`${API_URL}/noticias`);
    if (!res.ok) throw new Error("Erro ao buscar notícias");
    
    const data = await res.json();
    return data.dados || [];
  } catch (error) {
    console.error("Erro em getNoticias:", error);
    return [];
  }
}

export async function getNoticiaById(id) {
  try {
    const res = await fetch(`${API_URL}/noticias/${id}`);
    if (!res.ok) throw new Error("Notícia não encontrada");
    
    const data = await res.json();
    return data.dados;
  } catch (error) {
    console.error("Erro em getNoticiaById:", error);
    return null;
  }
}

export async function getHorariosOnibus() {
  try {
    const res = await fetch(`${API_URL}/noticias/onibus/horarios`);
    if (!res.ok) throw new Error("Erro ao buscar horários");
    
    const data = await res.json();
    return data.dados;
  } catch (error) {
    console.error("Erro em getHorariosOnibus:", error);
    return null;
  }
}

export async function getOnibusPorTipo(tipo) {
  try {
    const res = await fetch(`${API_URL}/onibus/${tipo}`);
    if (!res.ok) throw new Error(`Erro ao buscar ônibus ${tipo}`);
    
    const data = await res.json();
    return data.dados;
  } catch (error) {
    console.error(`Erro em getOnibusPorTipo(${tipo}):`, error);
    return [];
  }
}

export async function getUserById(userId) {
  try {
        console.log("Buscando usuário ID:", userId);
    
    const mockUsers = {
      1: {
        id: 1,
        nome: "Carla Evelyn",
        email: "carla@teste.com",
        username: "carla_e",
        avatar: "https://i.pravatar.cc/150?img=1",
        bio: "Estudante",
        idade: 22,
        cidade: "Quixadá",
        empresa: "UFC",
        seguidores: 120,
        seguindo: 85
      },
      2: {
        id: 2,
        nome: "Maria Barros", 
        email: "maria.barros@alu.ufc.br",
        username: "maria_s",
        avatar: "https://i.pravatar.cc/150?img=2",
        bio: "Estudante",
        idade: 21,
        cidade: "Quixadá",
        empresa: "UFC",
        seguidores: 95,
        seguindo: 110
      }
    };
    
    const userData = mockUsers[userId] || {
      id: userId,
      nome: "Usuário Desconhecido",
      email: "usuario@teste.com",
      avatar: "https://i.pravatar.cc/150",
      bio: "Usuário do sistema",
      idade: 25,
      cidade: "Quixadá",
      empresa: "UFC",
      seguidores: 0,
      seguindo: 0
    };
    
    return userData;
    
  } catch (error) {
    console.error("Erro em getUserById:", error);
    return null;
  }
}