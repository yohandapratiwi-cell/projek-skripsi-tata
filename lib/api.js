import axios from "axios";

export const api = axios.create({
  // URL Backend Vercel Baru Bapak
  baseURL: "https://projek-skripsi-tata-backend-two.vercel.app",
  // Aktifkan kembali withCredentials agar Cookie/Session bisa lewat jika diperlukan
  withCredentials: true, 
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