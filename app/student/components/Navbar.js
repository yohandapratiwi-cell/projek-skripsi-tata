"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
// ✅ IMPORT instance api (Axios)
import { api } from "@/lib/api"; 

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  const handleLogout = async () => {
    try {
      // ✅ PERBAIKAN: Gunakan api.post (Otomatis menembak URL online & kirim cookie)
      await api.post("/auth/logout");
      
      // ✅ Bersihkan sisa-sisa localStorage jika ada
      localStorage.clear();

      // Pindah ke halaman awal setelah logout
      router.push("/");
      
      // ✅ Paksa reload sedikit agar state benar-benar bersih
      window.location.reload();
    } catch (error) {
      console.error("Logout gagal:", error);
      // Tetap tendang ke halaman awal jika terjadi error sistem
      router.push("/");
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full h-16 bg-slate-950 shadow-md flex items-center justify-between px-6 z-50">      
      <h1 className="text-xl font-bold text-blue-600">
        LMS Learning
      </h1>
      <div className="flex items-center gap-4 relative" ref={dropdownRef}>        
        <button className="bg-gray-100 px-3 py-1 rounded-lg hover:bg-gray-200">
          🔔
        </button>

        {/* Profile */}
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => setOpen(!open)}
        >
          <img
            src="https://i.pravatar.cc/4"
            className="w-8 h-8 rounded-full"
            alt="Avatar"
          />
          <span className="text-sm font-medium text-slate-200">Student</span>
        </div>

        {/* Dropdown */}
        {open && (
          <div className="absolute right-0 top-12 w-40 bg-white border rounded-lg shadow-md overflow-hidden">
            <button className="block w-full text-left px-4 py-2 text-slate-700 hover:bg-gray-100 transition-colors">
              Profile
            </button>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-red-500 font-semibold hover:bg-red-50 transition-colors"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}