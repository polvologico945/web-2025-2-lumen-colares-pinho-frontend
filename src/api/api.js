const API_URL = "http://127.0.0.1:8000/api";

export async function login({ email, password }) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
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

export async function testarConexao() {
  try {
    const res = await fetch(`${API_URL}/health`);
    if (!res.ok) throw new Error("Backend offline");
    return await res.json();
  } catch (error) {
    throw new Error(`Falha na conexão: ${error.message}`);
  }
}