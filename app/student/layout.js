"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";

import Navbar from "@/components/student/Navbar";
import Sidebar from "@/components/student/Sidebar";

export default function StudentLayout({ children }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      // 1. Cek dulu secara lokal, jangan langsung tembak API
      const localToken = localStorage.getItem("token");
      const localRole = localStorage.getItem("userRole");

      if (!localToken || localRole !== "student") {
        console.warn("Satpam: Data lokal tidak ditemukan.");
        window.location.href = "/login";
        return;
      }

      try {
        // 2. Verifikasi ke Backend Railway
        // Jika api.js Bapak sudah pakai Interceptor Authorization: Bearer, ini akan lancar
        const res = await api.get("/api/auth/me");
        
        if (res.data.role === "student") {
          setAuthorized(true);
        } else {
          // Jika role di database ternyata bukan student, hapus data lokal dan tendang
          localStorage.clear();
          window.location.href = "/login";
        }
      } catch (err) {
        console.error("Satpam: Gagal verifikasi ke server.", err.message);
        
        // JANGAN LANGSUNG TENDANG JIKA SERVER HANYA LAGI LAMBAT (Timeout)
        // Tendang hanya jika statusnya memang 401 (Unauthorized)
        if (err.response?.status === 401) {
          localStorage.clear();
          window.location.href = "/login";
        } else {
          // Jika server down/error lain, kita izinkan masuk dulu berdasarkan token lokal
          // agar user tidak stres terjebak loop login
          setAuthorized(true); 
        }
      }
    };

    checkAuth();
  }, []);

  // UI Loading saat verifikasi
  if (!authorized) {
    return (
      <div className="h-screen bg-slate-950 text-white flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="font-black uppercase tracking-widest animate-pulse text-blue-400">
          MEMVERIFIKASI AKSES...
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-slate-950 min-h-screen">
      <Sidebar collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className={`flex-1 flex flex-col transition-all duration-300 ${collapsed ? "ml-16" : "ml-64"}`}>
        <Navbar collapsed={collapsed} />
        <main className="mt-16 p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}