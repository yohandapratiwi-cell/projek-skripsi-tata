import axios from "axios";

export const api = axios.create({
  // URL Backend Railway Bapak
  baseURL: "https://projek-skripsi-tata-backend-production.up.railway.app",
  // HAPUS withCredentials karena kita menggunakan Bearer Token di Header
});

// Interceptor untuk menyisipkan Token di setiap request setelah login
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});