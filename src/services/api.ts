import axios from "axios";

// Ajuste a URL base de acordo com a porta que o seu server.js está rodando (ex: 3000 ou 5000)
export const api = axios.create({
  baseURL: "http://localhost:3000/api", 
});

// Interceptor para injetar o token de autenticação em todas as requisições
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});