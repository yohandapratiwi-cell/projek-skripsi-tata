"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ChevronLeft, Search, Loader2, Trophy, User } from "lucide-react";

export default function DetailedTestResults() {
  const params = useParams();
  const router = useRouter();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        // ✅ PERBAIKAN: Pastikan mengarah ke /api/tests/...
        const res = await api.get(`/api/tests/results/${params.testType}/${params.courseId}`);
        
        // Unwrapping data sesuai format backend { status, data }
        const dataResult = res.data?.data || res.data || [];
        setResults(Array.isArray(dataResult) ? dataResult : []);
      } catch (err) {
        console.error("Error fetching results:", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    if (params.testType && params.courseId) {
      fetchResults();
    }
  }, [params.testType, params.courseId]);

  // Filter pencarian berdasarkan nama siswa
  const filtered = results.filter(r => 
    r.student_name?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-500" size={40} />
    </div>
  );

  return (
    <div className="p-10 bg-slate-950 min-h-screen text-white">
      <button 
        onClick={() => router.push(`/teacher/results/${params.testType}`)}
        className="flex items-center gap-2 text-slate-500 hover:text-white mb-8 group transition-all text-xs font-black uppercase tracking-widest"
      >
        <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" /> Kembali
      </button>

      <header className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">
            Rekap Nilai {params.testType}
          </h1>
          <p className="text-slate-500 italic mt-1 font-medium">Data pengerjaan otomatis oleh sistem.</p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" placeholder="Cari Siswa..." 
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </header>

      <div className="bg-slate-900/40 border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl backdrop-blur-sm">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-800/50 text-slate-500 text-[10px] font-black uppercase tracking-widest">
              <th className="p-8">Nama Siswa</th>
              <th className="p-8">Judul Test</th>
              <th className="p-8">Tanggal Selesai</th>
              <th className="p-8 text-center">Skor</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filtered.length > 0 ? (
              filtered.map((r) => (
                <tr key={r.submission_id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-8">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                        <User size={20} />
                      </div>
                      <div>
                        <p className="font-bold text-white leading-none mb-1">{r.student_name}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{r.student_email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-8 text-sm text-slate-400 font-medium">{r.test_title}</td>
                  <td className="p-8 text-xs text-slate-500 font-mono italic">{r.submitted_at}</td>
                  <td className="p-8 text-center">
                    <div className="inline-flex items-center gap-3 bg-slate-950 px-5 py-2 rounded-2xl border border-slate-800">
                      <Trophy size={16} className={r.score >= 75 ? "text-yellow-500" : "text-slate-600"} />
                      <span className={`text-xl font-black ${r.score >= 75 ? "text-white" : "text-slate-500"}`}>
                        {r.score}
                      </span>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="p-20 text-center text-slate-600 italic font-medium uppercase text-xs tracking-widest opacity-30">
                  Belum ada data nilai siswa.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}