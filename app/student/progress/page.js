"use client";

import { useEffect, useState } from "react";
// ✅ IMPORT instance api (Axios) yang sudah membawa baseURL & credentials
import { api } from "@/lib/api";
import { 
  BookOpen, CheckCircle2, Clock, AlertCircle, 
  Trophy, Loader2, ChevronDown, Layout
} from "lucide-react";

export default function StudentProgressPage() {
  const [progressData, setProgressData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCourseId, setSelectedCourseId] = useState("");

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        setLoading(true);
        // ✅ Menembak API Progress
        const res = await api.get("/api/student/overall-progress");
        const data = res.data; 
        
        const results = Array.isArray(data) ? data : [];
        setProgressData(results);
        
        if (results.length > 0) {
          const initialId = results[0].course_id || results[0].id;
          setSelectedCourseId(String(initialId)); 
        }
      } catch (err) {
        console.error("Error load progress:", err);
        setProgressData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  const selectedCourse = progressData.find(c => 
    String(c.course_id || c.id) === String(selectedCourseId)
  );

  if (loading) return (
    <div className="h-screen bg-slate-950 flex items-center justify-center text-blue-500">
      <Loader2 className="animate-spin" size={40} />
    </div>
  );

  return (
    <div className="p-2 space-y-10 bg-slate-950 min-h-screen text-slate-200 selection:bg-blue-500/30">
      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-white mb-1 uppercase">Learning Progress</h1>
          <p className="text-slate-500 text-sm font-medium">Pilih kursus untuk melihat laporan capaian belajarmu.</p>
        </div>

        {/* DROPDOWN SELECTOR */}
        <div className="relative w-full md:w-80 group">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-500">
            <Layout size={18} />
          </div>
          <select 
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 text-white text-xs font-black uppercase tracking-widest rounded-2xl py-4 pl-12 pr-10 appearance-none outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-pointer shadow-xl"
          >
            <option value="" disabled>Pilih Kursus...</option>
            {progressData.map((course) => (
              <option key={course.course_id || course.id} value={course.course_id || course.id}>
                {course.course_title}
              </option>
            ))}
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
            <ChevronDown size={18} />
          </div>
        </div>
      </header>

      {selectedCourse ? (
        <div key={selectedCourseId} className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="bg-slate-900/40 border border-slate-800 rounded-[40px] p-8 shadow-2xl backdrop-blur-md">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-6">
              <div className="flex items-center gap-5">
                <div className="bg-blue-600/20 p-5 rounded-3xl shadow-inner">
                  <BookOpen className="text-blue-500" size={30} />
                </div>
                <div>
                  <h2 className="text-2xl font-black tracking-tight uppercase text-white">{selectedCourse.course_title}</h2>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Laporan Belajar Aktif</p>
                </div>
              </div>
              
              <div className="flex gap-4 w-full md:w-auto">
                <TestBadge label="Pre-test" data={selectedCourse.pretest} color="blue" />
                <TestBadge label="Post-test" data={selectedCourse.posttest} color="orange" />
              </div>
            </div>

            <div className="h-px bg-slate-800/50 mb-10" />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedCourse.assignments_progress && selectedCourse.assignments_progress.length > 0 ? (
                selectedCourse.assignments_progress.map((task, idx) => (
                  <div key={idx} className="bg-slate-950/50 border border-slate-800 p-6 rounded-[35px] flex flex-col justify-between hover:border-blue-500/50 transition-all group shadow-lg">
                    <div className="mb-6">
                      {/* ✅ PERBAIKAN: Menggunakan module_title dari database */}
                      <p className="text-[16px] font-black uppercase tracking-tighter text-blue-500 mb-2 truncate">
                        {task.module_title || "MODUL PELATIHAN"}
                      </p>
                      <h3 className="font-bold text-slate-200 text-lg leading-tight group-hover:text-white transition-colors uppercase italic">
                        {task.materi_title}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-800/50">
                      <StatusIndicator status={task.submission_status} score={task.submission_score} />
                      {task.submission_score !== null && task.submission_score !== undefined && (
                        <div className="text-2xl font-black text-blue-500 italic">
                          {task.submission_score}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full py-20 text-center opacity-30 italic font-black uppercase tracking-[0.3em] text-xs">
                  <p>Tidak ada tugas praktek terdeteksi.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="h-[50vh] flex flex-col items-center justify-center text-slate-700">
          <p className="italic font-black text-xs uppercase tracking-[0.3em]">Pilih salah satu kursus di atas</p>
        </div>
      )}
    </div>
  );
}

// Sub-komponen tetap sama sesuai permintaan (Jangan ubah UI)
function TestBadge({ label, data, color }) {
  const hasScore = data?.score !== null && data?.score !== undefined;
  return (
    <div className={`flex-1 md:w-36 px-6 py-4 rounded-[25px] border transition-all ${color === "blue" ? 'border-blue-500/20 bg-blue-500/5' : 'border-orange-500/20 bg-orange-500/5'}`}>
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">{label}</p>
      <div className="flex items-center gap-3">
        <Trophy size={16} className={hasScore ? (color === "blue" ? 'text-blue-500' : 'text-orange-500') : 'text-slate-800'} />
        <span className={`font-black text-2xl ${hasScore ? 'text-white' : 'text-slate-800'}`}>
          {hasScore ? data.score : "—"}
        </span>
      </div>
    </div>
  );
}

function StatusIndicator({ status, score }) {
  if (!status) return (
    <div className="flex items-center gap-2 text-slate-600 text-[9px] font-black uppercase italic">
      <AlertCircle size={12} /> <span>Belum Dikerjakan</span>
    </div>
  );
  if (status === 'submitted' && (score === null || score === undefined)) return (
    <div className="flex items-center gap-2 text-orange-500 text-[9px] font-black uppercase italic animate-pulse">
      <Clock size={12} /> <span>Menunggu Nilai</span>
    </div>
  );
  return (
    <div className="flex items-center gap-2 text-green-500 text-[9px] font-black uppercase italic">
      <CheckCircle2 size={12} /> <span>Sudah Dinilai</span>
    </div>
  );
}