"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, LogOut, ChevronDown, ShieldCheck, Mail, Sparkles } from "lucide-react";
// 1. Import instance api yang sudah kita buat sebelumnya
import { api } from "@/lib/api"; 

export default function StudentNavbar({ collapsed }) {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState({ name: "Loading...", email: "" });
  const dropdownRef = useRef(null);
  const router = useRouter();

  // 2. Ambil Data User menggunakan instance API (Bukan fetch localhost)
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Menggunakan api.get agar interceptor Bearer Token otomatis bekerja
        const res = await api.get("/api/auth/me");
        
        if (res.status === 200) {
          console.log("User Data Received:", res.data); 
          setUser({
            name: res.data.name,
            email: res.data.email,
          });
        }
      } catch (error) {
        console.error("Gagal mengambil data user:", error.message);
        setUser({ name: "User", email: "Error fetching data" });
      }
    };
    fetchUserData();
  }, []);

  // 3. Handle Logout
  const handleLogout = async () => {
    try {
      // Hapus data lokal terlebih dahulu agar cepat
      localStorage.clear();
      
      // Panggil backend untuk hapus cookie (opsional jika backend ada rutenya)
      await api.post("/api/auth/logout");
      
      // Redirect ke Landing Page
      window.location.href = "/";
    } catch (error) {
      console.error("Logout failed:", error);
      window.location.href = "/";
    }
  };

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  return (
    <nav 
      className={`fixed top-0 right-0 h-20 bg-slate-950/40 backdrop-blur-xl border-b border-slate-800 flex items-center justify-end px-10 z-40 transition-all duration-500
      ${collapsed ? "left-20" : "left-64"}`}
    >
      <div className="flex items-center gap-6">
        <div className="relative" ref={dropdownRef}>
          <button 
            className={`flex items-center gap-3 p-1.5 pr-4 rounded-2xl transition-all border
            ${open ? "bg-slate-900 border-slate-700 shadow-2xl scale-[1.02]" : "bg-transparent border-transparent hover:bg-slate-900/50"}`}
            onClick={() => setOpen(!open)}
          >
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 group-hover:text-blue-500 transition-all">
                <User size={20} strokeWidth={2.5} />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 border-2 border-slate-950 rounded-full shadow-lg"></div>
            </div>

            <div className="hidden md:block text-left">
              <p className="text-sm font-bold uppercase text-white mb-0.5">{user.name}</p>
              <p className="text-[10px] uppercase tracking-widest font-black text-blue-500 flex items-center gap-1">
                <Sparkles size={8} /> Student
              </p>
            </div>

            <ChevronDown size={16} className={`text-slate-600 transition-transform duration-300 ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <div className="absolute right-0 top-full mt-4 w-64 bg-slate-900 border border-slate-800 rounded-3xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)] z-[999] overflow-hidden animate-in fade-in zoom-in-95 duration-300">
              <div className="p-5 border-b border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950">
                <div className="flex items-center gap-3 mb-3">
                   <div className="p-2 bg-blue-600/10 rounded-lg text-blue-500">
                      <ShieldCheck size={18} />
                   </div>
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Verified Student</span>
                </div>
                <p className="text-sm text-slate-400 flex items-center gap-2">
                  <Mail size={14} /> {user.email}
                </p>
              </div>
              <div className="p-3">
                <button className="flex items-center gap-2 w-full px-4 py-3 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white rounded-2xl transition-all group">
                  <User size={18} className="text-slate-500 group-hover:text-blue-500" />
                  Lihat Profil
                </button>
                <hr className="my-2 border-slate-800" />
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-500/10 rounded-2xl transition-all group"
                >
                  <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}