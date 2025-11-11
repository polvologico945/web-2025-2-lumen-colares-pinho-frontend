// frontend/src/api/api.js
import axios from "axios";

export const api = axios.create({
  baseURL: "https://github.com/polvologico945/web-2025-2-lumen-colares-pinho-backend", // 👈 endereço do backend
  headers: {
    "Content-Type": "application/json",
  },
});
