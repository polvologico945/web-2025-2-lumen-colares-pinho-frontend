const API_URL = "http://127.0.0.1:8000/api";

export async function criarSolicitacao(solicitacaoData) {
  try {
    const token = localStorage.getItem("token");
    
    const res = await fetch(`${API_URL}/solicitacoes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(solicitacaoData),
    });
    
    if (!res.ok) throw new Error("Erro ao criar solicitação");
    return await res.json();
  } catch (error) {
    console.error("Erro em criarSolicitacao:", error);
    throw error;
  }
}

export async function getMinhasSolicitacoes() {
  try {
    const token = localStorage.getItem("token");
    
    const res = await fetch(`${API_URL}/solicitacoes/minhas`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });
    
    if (!res.ok) throw new Error("Erro ao buscar solicitações");
    
    const data = await res.json();
    return data.dados || [];
  } catch (error) {
    console.error("Erro em getMinhasSolicitacoes:", error);
    return [];
  }
}

export async function atualizarStatusSolicitacao(id, status) {
  try {
    const token = localStorage.getItem("token");
    
    const res = await fetch(`${API_URL}/solicitacoes/${id}/status`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    
    if (!res.ok) throw new Error("Erro ao atualizar status");
    return await res.json();
  } catch (error) {
    console.error("Erro em atualizarStatusSolicitacao:", error);
    throw error;
  }
}