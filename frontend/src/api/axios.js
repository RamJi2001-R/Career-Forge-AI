import axios from "axios";

// Ek hi axios instance poore app me use karenge,
// taaki baseURL aur token attach karne ka logic ek hi jagah ho.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// Interceptor — har request jaane se PEHLE ye chalta hai.
// Kaam: agar localStorage me token saved hai, to use har
// request ke header me automatically attach kar dena.
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
