const API_URL = "http://127.0.0.1:8000/api";

export async function getComentarios(postId) {
  try {
    const res = await fetch(`${API_URL}/posts/${postId}/comentarios`);
    if (!res.ok) throw new Error("Erro ao buscar comentários");
    
    const data = await res.json();
    return data.dados || [];
  } catch (error) {
    console.error("Erro em getComentarios:", error);
    return [];
  }
}

export async function addComentario(postId, conteudo) {
  try {
    const token = localStorage.getItem("token");
    
    const res = await fetch(`${API_URL}/posts/${postId}/comentarios`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ conteudo }),
    });
    
    if (!res.ok) throw new Error("Erro ao adicionar comentário");
    return await res.json();
  } catch (error) {
    console.error("Erro em addComentario:", error);
    throw error;
  }
}

export async function curtirPost(postId) {
  try {
    const token = localStorage.getItem("token");
    
    const res = await fetch(`${API_URL}/posts/${postId}/curtir`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    
    if (!res.ok) throw new Error("Erro ao curtir post");
    return await res.json();
  } catch (error) {
    console.error("Erro em curtirPost:", error);
    throw error;
  }
}