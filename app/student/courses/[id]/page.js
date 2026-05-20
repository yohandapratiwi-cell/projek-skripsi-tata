"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Loader2, BookOpen, AlertCircle } from "lucide-react";
// ✅ IMPORT instance api (Axios) yang sudah membawa baseURL Railway & Credentials
import { api } from "@/lib/api"; 

export default function CourseRedirect() {
  const router = useRouter();
  const rawParams = useParams(); // Mengambil params mentah
  const [error, setError] = useState(false);

  useEffect(() => {
    const goToFirstMateri = async () => {
      try {
        // Pastikan params sudah tersedia sebelum eksekusi
        if (!rawParams || !rawParams.id) return;

        // ✅ SINKRONISASI: Gunakan rute yang benar /api/courses/courses-full
        const res = await api.get("/api/courses/courses-full");
        
        // Unwrapping data: Axios (res.data) -> Backend Wrap (res.data.data atau res.data)
        const allCourses = res.data?.data || res.data || [];
        
        // Cari course yang spesifik berdasarkan ID dari URL
        const currentCourse = allCourses.find(c => String(c.id) === String(rawParams.id));

        // Validasi: Apakah kursus ditemukan dan punya modul?
        if (!currentCourse || !currentCourse.modules || currentCourse.modules.length === 0) {
          setError(true);
          return;
        }
        
        // Ambil materi pertama dari modul pertama (urutan terkecil)
        const firstModule = currentCourse.modules[0];
        if (!firstModule.materi || firstModule.materi.length === 0) {
          setError(true);
          return;
        }
        
        const firstMateriId = firstModule.materi[0].id;

        if (firstMateriId) {
          // Redirect ke halaman detail materi pertama
          router.push(`/student/courses/${rawParams.id}/materi/${firstMateriId}`);
        } else {
          setError(true);
        }
      } catch (err) {
        console.error("Redirect Error:", err);
        setError(true);
      }
    };

    goToFirstMateri();
  }, [rawParams, router]);

  // UI ERROR (Tidak Berubah)
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-slate-400 p-6 text-center">
        <AlertCircle size={48} className="text-red-500 mb-4 opacity-50" />
        <h2 className="text-xl font-bold text-white mb-2 uppercase italic tracking-tight">Ups! Kursus Kosong</h2>
        <p className="max-w-xs text-sm">Belum ada materi yang diunggah untuk kursus ini oleh Bapak/Ibu Guru.</p>
        <button 
          onClick={() => router.push("/student/courses")}
          className="mt-8 px-8 py-3 bg-slate-900 border border-slate-800 hover:border-blue-500 text-white font-black uppercase text-[10px] tracking-widest rounded-2xl transition-all active:scale-95"
        >
          Kembali ke Katalog
        </button>
      </div>
    );
  }

  // UI LOADING (Tidak Berubah)
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950">
      <div className="relative flex flex-col items-center">
        <div className="relative">
          <Loader2 className="text-blue-500 animate-spin" size={64} strokeWidth={1} />
          <BookOpen className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400/50" size={24} />
        </div>
        
        <div className="mt-8 text-center animate-pulse">
          <h2 className="text-xl font-black text-white tracking-tighter uppercase italic">Menyiapkan Ruang Belajar</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-2">Sesaat lagi kamu akan diarahkan ke materi...</p>
        </div>
      </div>
      
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-blue-600/10 blur-[120px] rounded-full -z-10"></div>
    </div>
  );
}