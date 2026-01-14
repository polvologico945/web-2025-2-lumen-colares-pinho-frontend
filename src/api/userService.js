const API_URL = "http://127.0.0.1:8000/api";

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function getUsers() {
  try {
    const res = await fetch(`${API_URL}/users`);
    
    if (res.ok) {
      const data = await res.json();
      return data.dados || [];
    }
    
    return [
      {
        id: 1,
        nome: "Carla Evelyn",
        idade: randomInt(18, 35),
        cidade: "Quixadá",
        bio: "Estudante",
        avatar: "https://i.pravatar.cc/300?img=1",
        empresa: "Lumen Colares",
        seguidores: randomInt(50, 1200),
        seguindo: randomInt(30, 600),
      },
      {
        id: 2,
        nome: "Maria Barros",
        idade: randomInt(18, 35),
        cidade: "Quixadá",
        bio: "Estudante",
        avatar: "https://i.pravatar.cc/300?img=2",
        empresa: "UFC",
        seguidores: randomInt(50, 1200),
        seguindo: randomInt(30, 600),
      },
    ];
  } catch (error) {
    console.error("Erro em getUsers:", error);
    return [];
  }
}

export async function getUserById(id) {
  try {
    const res = await fetch(`${API_URL}/users/${id}`);
    
    if (res.ok) {
      const data = await res.json();
      return data.dados;
    }
    
    const users = await getUsers();
    return users.find(user => user.id === id) || null;
  } catch (error) {
    console.error("Erro em getUserById:", error);
    return null;
  }
}