"use client";

import { useState, useEffect, useRef } from "react";
import { LogOut, User, Settings, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
// ✅ IMPORT instance api agar sinkron dengan baseURL Railway
import { api } from "@/lib/api";

export default function TeacherNavbar() {
  const [open, setOpen] = useState(false);
  // ✅ State untuk menampung data user asli dari database
  const [user, setUser] = useState({ name: "Loading...", email: "" });
  const dropdownRef = useRef(null);
  const router = useRouter();

  // 🔒 Close dropdown jika klik di luar
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // 👤 Ambil Data Guru dari Backend
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // ✅ Menggunakan prefix /api/auth/me sesuai rute backend online
        const res = await api.get("/api/auth/me");
        if (res.data) {
          setUser({
            name: res.data.name,
            email: res.data.email,
          });
        }
      } catch (error) {
        console.error("Gagal mengambil data guru:", error.message);
        setUser({ name: "Teacher", email: "teacher@email.com" });
      }
    };
    fetchUserData();
  }, []);

  // 🚪 Logout handler
  const handleLogout = async () => {
    try {
      // ✅ Bersihkan storage lokal
      localStorage.clear();
      
      // ✅ Hapus cookie token secara manual untuk keamanan
      document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;";

      // ✅ Panggil API logout backend (Gunakan /api/)
      await api.post("/api/auth/logout").catch(() => {});
      
      // ✅ Redirect ke landing page menggunakan window.location agar bersih
      window.location.href = "/";
    } catch (error) {
      window.location.href = "/";
    }
  };

  return (
    <nav className="sticky top-0 z-50 h-16 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 flex items-center justify-between px-6">

      {/* Title */}
      <div className="flex items-center gap-6">
        {/* Konten Title Bapak tetap di sini */}
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4 relative" ref={dropdownRef}>

        {/* Profile */}
        <div
          onClick={() => setOpen(!open)}
          className={`flex items-center gap-2 hover:bg-slate-800 px-2 py-1 rounded-lg cursor-pointer transition ${open ? 'bg-slate-800' : ''}`}
        >
          <img
            src={`https://ui-avatars.com/api/?name=${user.name}&background=6366f1&color=fff`}
            className="w-8 h-8 rounded-full border border-slate-700"
            alt="Avatar"
          />
          <div className="text-sm">
            {/* ✅ NAMA DINAMIS */}
            <p className="font-medium text-white">{user.name}</p>
            <p className="text-gray-400 text-xs flex items-center gap-1">
               <ShieldCheck size={10} className="text-indigo-400" /> Teacher
            </p>
          </div>
        </div>

        {/* 🔽 DROPDOWN */}
        {open && (
          <div className="absolute right-0 top-14 w-56 bg-slate-900 border border-slate-700 rounded-xl shadow-lg overflow-hidden animate-fadeIn">

            <div className="px-4 py-3 border-b border-slate-800 bg-slate-950/30">
              {/* ✅ NAMA & EMAIL DINAMIS */}
              <p className="text-sm font-semibold text-white">{user.name}</p>
              <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                <Mail size={10} /> {user.email}
              </p>
            </div>

            <div className="p-1">
              <button className="flex items-center gap-2 w-full px-4 py-2 hover:bg-slate-800 text-sm text-slate-300 rounded-lg transition">
                <User size={16} className="text-indigo-400" /> Profile Settings
              </button>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-4 py-2 hover:bg-red-600/10 text-sm text-red-400 hover:text-red-300 transition rounded-lg mt-1 font-bold"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>
        )}

      </div>
    </nav>
  );
}