"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Star, BookOpen, ChevronRight, Loader2, GraduationCap } from "lucide-react";

export default function GradingDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoursesForGrading = async () => {
      try {
        setLoading(true);
        // ✅ PERBAIKAN RUTE: Gunakan /api/teacher/dashboard-stats
        // Rute ini di backend sekarang me-return objek stats yang berisi courseList
        const res = await api.get("/api/teacher/dashboard-stats");
        
        // Unwrapping data: Axios (res.data) -> Backend Wrap (res.data.courseList)
        // Kita sesuaikan dengan teacherController: res.json({ status: "success", ..., courseList: [...] })
        const dataResult = res.data?.courseList || [];
        
        setCourses(Array.isArray(dataResult) ? dataResult : []);
      } catch (err) {
        console.error("Gagal memuat kursus untuk penilaian:", err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    
    fetchCoursesForGrading();
  }, []);

  if (loading) return (
    <div className="h-screen bg-slate-950 flex flex-col items-center justify-center text-blue-500">
      <Loader2 className="animate-spin mb-4" size={40} />
      <p className="uppercase tracking-[0.3em] text-[10px] font-black italic opacity-50">Mengakses Database Pelatihan...</p>
    </div>
  );

  return (
    <div className="p-2 bg-slate-950 min-h-screen text-white font-sans">
      <header className="mb-12">
        <div className="flex items-center gap-4 mb-2">
          <div className="bg-yellow-500/10 p-3 rounded-2xl border border-yellow-500/20">
            <Star className="text-yellow-500" size={28} />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">Grading Center</h1>
        </div>
        <p className="text-slate-500 mt-2">Pilih kursus untuk mulai melakukan penilaian tugas mandiri siswa.</p>
      </header>

      {/* GRID KURSUS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.length > 0 ? (
          courses.map((course) => (
            <Link 
              href={`/teacher/grading/${course.id}`} 
              key={course.id}
              className="group relative bg-slate-900/40 border border-slate-800 rounded-[40px] p-8 transition-all hover:bg-slate-900 hover:border-blue-500/50 hover:-translate-y-2 shadow-2xl overflow-hidden"
            >
              {/* Dekorasi Background */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/5 blur-3xl group-hover:bg-blue-500/10 transition-all rounded-full"></div>

              <div className="relative z-10">
                <div className="mb-6 bg-slate-800 w-14 h-14 rounded-2xl flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-lg">
                  <BookOpen size={28} />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-4 leading-tight group-hover:text-blue-400 transition-colors uppercase tracking-tight">
                  {course.title}
                </h3>

                <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-800/50">
                  <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    <GraduationCap size={16} />
                    <span>Buka Penilaian</span>
                  </div>
                  <div className="bg-slate-800 p-2 rounded-full group-hover:bg-blue-500 transition-all">
                    <ChevronRight size={18} className="text-white group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-20 bg-slate-900/10 border-2 border-dashed border-slate-900 rounded-[40px] flex flex-col items-center justify-center opacity-40">
            <BookOpen size={48} className="mb-4 text-slate-700" />
            <p className="font-black uppercase tracking-widest text-xs text-slate-600">Belum ada kursus yang dibuat.</p>
          </div>
        )}
      </div>
    </div>
  );
}