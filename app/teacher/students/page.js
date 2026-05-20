"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation"; // ✅ Import router
import { api } from "@/lib/api";
import { Users, BookOpen, Loader2, BarChart2, ArrowRight } from "lucide-react"; // ✅ Ikon baru

export default function StudentMonitor() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter(); // ✅ Inisialisasi router

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const resMonitor = await api.get("/api/teacher/students-monitor").catch(() => null);
        const finalData = resMonitor?.data?.data || resMonitor?.data || [];
        setStudents(Array.isArray(finalData) ? finalData : []);
      } catch (err) {
        setError(err.message || "Gagal mengambil data");
        setStudents([]);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  if (loading) {
    return (
      <div className="h-screen bg-slate-950 flex flex-col items-center justify-center text-blue-500">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="uppercase tracking-[0.3em] text-xs font-black italic">Syncing Student Data...</p>
      </div>
    );
  }

  return (
    <div className="p-2 bg-slate-950 min-h-screen text-white selection:bg-blue-500/30">
      <header className="mb-10">
        <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-4 text-white">
          <Users className="text-blue-500" size={40} /> Student Management
        </h1>
        <p className="text-slate-500 mt-2 font-medium">Pantau progres belajar dan materi terakhir yang diakses siswa secara real-time.</p>
      </header>

      {error && (
        <div className="mb-6 p-6 bg-red-500/5 border border-red-500/20 rounded-[32px] text-red-500 text-xs font-black uppercase tracking-widest">
          ⚠️ System Alert: {error}
        </div>
      )}

      <div className="bg-slate-900/40 border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl backdrop-blur-md">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-800/50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">
              <th className="p-8">Nama Siswa</th>
              <th className="p-8">Tugas Terkirim</th>
              <th className="p-8">Skor Rata-rata</th>
              <th className="p-8">Status</th>
              <th className="p-8 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {students.length > 0 ? (
              students.map((s) => (
                <tr key={s.id} className="hover:bg-blue-600/5 transition-all group">
                  <td className="p-8">
                    <span className="text-lg font-black text-white group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                      {s.name}
                    </span>
                  </td>
                  <td className="p-8">
                    <div className="flex items-center gap-3 text-slate-300">
                      <div className="bg-blue-500/10 p-2 rounded-xl text-blue-500"><BookOpen size={16} /></div>
                      <span className="font-black text-sm uppercase">{s.tasks_sent || 0} <span className="text-[10px] text-slate-600 ml-1">Files</span></span>
                    </div>
                  </td>
                  <td className="p-8 text-2xl font-black text-blue-500 tracking-tighter">
                    {s.avg_score ? Math.round(s.avg_score) : "—"}
                  </td>
                  <td className="p-8 text-xs font-black uppercase tracking-widest text-emerald-500">
                    Streak: {s.current_streak || 0} Days 🔥
                  </td>
                  {/* ✅ TOMBOL AKSI BARU */}
                  <td className="p-8 text-right">
                    <button 
                      onClick={() => router.push(`/teacher/students/${s.id}/analytics`)}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-3 ml-auto transition-all active:scale-95 shadow-lg shadow-blue-600/20"
                    >
                      <BarChart2 size={16} /> Analytics <ArrowRight size={14} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr><td colSpan="5" className="p-32 text-center opacity-20"><Users size={64} className="mb-6 mx-auto" /><p className="font-black uppercase tracking-widest text-[10px]">Data Stream Empty</p></td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}