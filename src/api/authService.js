/* eslint-disable no-undef */
const API_URL = "http://127.0.0.1:8000/api";

export async function login({ email, senha }) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, senha }),
  });

  if (!res.ok) {
    throw new Error("Credenciais inválidas");
  }

  const data = await res.json();

  // adapta a resposta do backend para o formato que o Login.jsx espera
  return {
    user: data.usuario,
    token: data.token,
  };
}

// mantém o register para o Register.jsx funcionar
export async function register({ email, password }) {
  // mock simples por enquanto
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (!email || !password) {
    throw new Error("Erro ao registrar");
  }

  return { message: "Conta criada com sucesso" };
}
