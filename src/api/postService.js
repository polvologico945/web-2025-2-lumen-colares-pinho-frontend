const API_URL = "https://jsonplaceholder.typicode.com";

export async function getPosts() {
  const res = await fetch(`${API_URL}/posts?_limit=26`);
  return res.json();
}

export async function getPostById(id) {
  const res = await fetch(`${API_URL}/posts/${id}`);
  return res.json();
}

export async function getUsers() {
  const res = await fetch(`${API_URL}/users`);
  return res.json();
}

export async function getUserById(id) {
  const res = await fetch(`${API_URL}/users/${id}`);
  return res.json();
}
