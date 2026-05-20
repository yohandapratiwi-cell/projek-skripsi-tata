"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { 
  ChevronLeft, Layers, ChevronDown, ChevronRight, 
  Loader2, FileCode, GitGraph
} from "lucide-react";

export default function ModuleGradingSelector() {
  const params = useParams();
  const router = useRouter();
  const [groupedModules, setGroupedModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModuleIndex, setOpenModuleIndex] = useState(null);

  useEffect(() => {
    const fetchGradingData = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/api/teacher/grading/course/${params.courseId}`);
        const rawData = res.data?.data || [];
        
        // Mengelompokkan materi berdasarkan nama modul asli dari DB
        const groups = rawData.reduce((acc, item) => {
          const key = item.module_name;
          if (!acc[key]) {
            acc[key] = {
              moduleName: key,
              materiList: [],
              // ✅ Indikator apakah di dalam modul ini ada tugas yang belum dinilai
              hasPendingTask: false 
            };
          }
          acc[key].materiList.push(item);
          
          // ✅ Jika ada satu saja materi yang pending > 0, tandai modulnya
          if (parseInt(item.pending_count) > 0) {
            acc[key].hasPendingTask = true;
          }
          
          return acc;
        }, {});

        setGroupedModules(Object.values(groups));
      } catch (err) {
        console.error("Fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    if (params.courseId) fetchGradingData();
  }, [params.courseId]);

  if (loading) return (
    <div className="h-screen bg-slate-950 flex flex-col items-center justify-center text-blue-500">
      <Loader2 className="animate-spin mb-4" size={48} />
      <p className="uppercase tracking-[0.3em] text-[10px] font-black italic opacity-50">Syncing Modules...</p>
    </div>
  );

  return (
    <div className="p-10 bg-slate-950 min-h-screen text-white font-sans selection:bg-blue-500/30">
      <button 
        onClick={() => router.push("/teacher/grading")}
        className="flex items-center gap-3 text-slate-500 hover:text-white transition-all mb-10 group"
      >
        <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
        <span className="text-[10px] font-black uppercase tracking-widest">Kembali</span>
      </button>

      <header className="mb-14">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2 italic">Penilaian Per Modul</h1>
        <p className="text-slate-500 text-sm font-medium">Pilih modul dengan indikator notifikasi untuk menilai tugas siswa.</p>
      </header>

      <div className="space-y-6">
        {groupedModules.length > 0 ? (
          groupedModules.map((mod, idx) => (
            <div key={idx} className="bg-slate-900/20 border border-slate-800 rounded-[40px] overflow-hidden transition-all shadow-xl">
              {/* HEADER MODUL (DROPDOWN TRIGGER) */}
              <button 
                onClick={() => setOpenModuleIndex(openModuleIndex === idx ? null : idx)}
                className={`w-full flex items-center justify-between p-8 transition-all ${openModuleIndex === idx ? "bg-slate-800/40" : "hover:bg-slate-800/20"}`}
              >
                <div className="flex items-center gap-6 relative">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${openModuleIndex === idx ? "bg-blue-600 text-white shadow-lg" : "bg-slate-800 text-slate-500"}`}>
                    <Layers size={28} />
                  </div>
                  
                  {/* ✅ TITIK NOTIFIKASI KUNING/ORANYE */}
                  {mod.hasPendingTask && (
                    <span className="absolute -top-1 -left-1 flex h-4 w-4">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-4 w-4 bg-orange-500 border-2 border-slate-950"></span>
                    </span>
                  )}

                  <div className="flex flex-col items-start">
                    <h3 className="text-2xl font-black uppercase italic tracking-tight text-left">{mod.moduleName}</h3>
                    {mod.hasPendingTask && (
                        <span className="text-[8px] font-black text-orange-500 uppercase tracking-widest mt-1 italic animate-pulse">
                          ● Ada tugas baru masuk
                        </span>
                    )}
                  </div>
                </div>
                
                <div className={`p-2 rounded-full transition-transform duration-300 ${openModuleIndex === idx ? "rotate-180 bg-blue-600 text-white" : "bg-slate-800 text-slate-500"}`}>
                  <ChevronDown size={24} />
                </div>
              </button>

              {/* LIST MATERI DALAM MODUL */}
              {openModuleIndex === idx && (
                <div className="px-8 pb-8 space-y-3 animate-in fade-in slide-in-from-top-4 duration-500">
                  <div className="h-px bg-slate-800 w-full mb-6 opacity-50"></div>
                  {mod.materiList.map((materi) => (
                    <div 
                      key={materi.id}
                      onClick={() => router.push(`/teacher/grading/${params.courseId}/${materi.id}`)}
                      className="flex items-center justify-between p-6 bg-slate-950/40 border border-slate-800 rounded-3xl hover:border-blue-500 hover:bg-slate-900/60 cursor-pointer group transition-all"
                    >
                      <div className="flex items-center gap-5">
                        <div className={`p-3 rounded-xl ${materi.type === 'code' ? 'bg-blue-500/10 text-blue-400' : 'bg-purple-500/10 text-purple-400'}`}>
                          {materi.type === 'code' ? <FileCode size={20} /> : <GitGraph size={20} />}
                        </div>
                        <span className="text-base font-bold text-slate-300 group-hover:text-white uppercase tracking-tight italic transition-colors">
                          {materi.title}
                        </span>
                      </div>

                      <div className="flex items-center gap-6">
                        {parseInt(materi.pending_count) > 0 && (
                          <div className="flex flex-col items-end">
                            <span className="bg-orange-600 text-white text-[9px] font-black px-4 py-1.5 rounded-full shadow-lg shadow-orange-900/20 uppercase tracking-widest italic animate-bounce">
                              {materi.pending_count} Pending
                            </span>
                          </div>
                        )}
                        <ChevronRight size={20} className="text-slate-700 group-hover:text-white group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="p-20 bg-slate-900/10 border-2 border-dashed border-slate-800 rounded-[40px] text-center opacity-30">
            <Layers size={48} className="mx-auto mb-4 text-slate-800" />
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">Tidak ada materi praktik yang ditemukan.</p>
          </div>
        )}
      </div>
    </div>
  );
}