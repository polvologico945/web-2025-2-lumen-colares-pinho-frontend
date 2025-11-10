const mockUsers = [
  { id: 1, name: "João Silva", course: "Sistemas", interests: ["Cálculo", "React"], bio: "Estudo à noite, gosto de música." },
  { id: 2, name: "Ana Costa", course: "Engenharia", interests: ["Física", "Arduino"], bio: "Projeto de robótica." },
  { id: 3, name: "Marcos P.", course: "Matemática", interests: ["Álgebra", "Piano"], bio: "Procuro grupo para cálculo." },
];

export function fetchUsers() {
  return new Promise((resolve) => {
    setTimeout(() => resolve([...mockUsers]), 400);
  });
}

export function fetchUserById(id) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const u = mockUsers.find((x) => x.id === Number(id));
      if (u) resolve(u);
      else reject(new Error("Usuário não encontrado"));
    }, 300);
  });
}

export function loginMock({ email, password }) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (!email || !password) return reject(new Error("Credenciais inválidas"));
      if (/@/.test(email) && password.length >= 4) {
        resolve({ ok: true, token: "mock-token", user: { id: 1, name: "João Silva", course: "Sistemas" } });
      } else reject(new Error("Email ou senha inválidos"));
    }, 500);
  });
}
