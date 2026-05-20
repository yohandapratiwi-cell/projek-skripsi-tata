"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/teacher/Navbar";
import Sidebar from "@/components/teacher/Sidebar";
import { api } from "@/lib/api"; 

export default function TeacherLayout({ children }) {
  const router = useRouter();

  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  // 🔒 CHECK AUTH (Sinkron dengan sistem Middleware & Axios terbaru)
  useEffect(() => {
    const checkAuth = async () => {
      // 1. Cek secara lokal dulu untuk kecepatan
      const token = localStorage.getItem("token");
      const role = localStorage.getItem("userRole");

      if (!token || role !== "teacher") {
        console.warn("Satpam Teacher: Akses ditolak secara lokal.");
        window.location.href = "/login";
        return;
      }

      try {
        // 2. Verifikasi ke Backend Railway (Gunakan rute lengkap /api/auth/me)
        const res = await api.get("/api/auth/me");
        
        // Pastikan role dari database benar-benar Teacher
        if (res.data.role === "teacher") {
          setLoading(false); // Lolos verifikasi
        } else {
          console.warn("Akses ditolak: Role tidak sesuai di database.");
          localStorage.clear();
          window.location.href = "/login";
        }
      } catch (err) {
        console.error("Auth check failed:", err.message);
        
        // Jika error 401 (Unauthorized), tendang ke login
        if (err.response?.status === 401) {
          localStorage.clear();
          window.location.href = "/login";
        } else {
          // Jika error jaringan/server lambat, berikan toleransi (izinkan masuk sementara)
          // agar user tidak terjebak loop login saat Railway sedang cold start
          setLoading(false);
        }
      }
    };
  
    checkAuth();
  }, []);

  // 💾 Sidebar state (localStorage) - Sinkronisasi UI
  useEffect(() => {
    const saved = localStorage.getItem("sidebar_teacher");
    if (saved !== null) {
      setIsOpen(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("sidebar_teacher", JSON.stringify(isOpen));
  }, [isOpen]);

  // ⏳ Loading screen - UI Futuristik Bapak
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-white">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4 shadow-[0_0_15px_rgba(99,102,241,0.3)]"></div>
        <p className="font-black uppercase tracking-[0.3em] text-[10px] text-indigo-400 animate-pulse">
          Authenticating Administrator...
        </p>
      </div>
    );
  }

  // ✅ UI TETAP SAMA 100% (Hanya ganti margin agar pas dengan sidebar)
  return (
    <div className="flex bg-slate-950 min-h-screen">
      {/* Sidebar */}
      <Sidebar isOpen={isOpen} setIsOpen={setIsOpen} />

      {/* Content Area */}
      <div className={`flex-1 flex flex-col transition-all duration-500 min-h-screen
        ${isOpen ? "ml-64" : "ml-20"}`}
      >
        <Navbar />

        <main className="p-8 overflow-y-auto">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}