"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
// ✅ Menggunakan api (Axios instance) yang sudah mendukung base URL & credentials
import { api } from "@/lib/api";
import { BookOpen, ChevronRight, Loader2, Award } from "lucide-react";

export default function SelectCourseResults() {
  const params = useParams(); // Mengambil 'pretest' atau 'posttest' dari URL
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cek tipe test untuk styling (UI tetap sama)
  const isPretest = params.testType === "pretest";

  useEffect(() => {
    const fetchCoursesForResults = async () => {
      try {
        setLoading(true);
        // ✅ PERBAIKAN: Menembak rute yang konsisten /api/teacher/courses 
        // agar mendapatkan daftar ID kursus yang valid untuk rekapitulasi.
        const res = await api.get("/api/teacher/courses");
        
        // Menangani unwrapping data dari Axios dan format backend { data: [...] }
        const dataResult = res.data?.data || res.data || [];
        setCourses(Array.isArray(dataResult) ? dataResult : []);
      } catch (err) {
        console.error("Gagal mengambil daftar kursus untuk nilai:", err);
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCoursesForResults();
  }, []);

  if (loading) return (
    <div className="h-screen bg-slate-950 flex items-center justify-center">
      <Loader2 className="animate-spin text-blue-500" size={40} />
    </div>
  );

  return (
    <div className="flex flex-col gap-8 p-2 bg-slate-950 min-h-screen text-white">
      <header className="mb-4">
        <div className="flex items-center gap-4 mb-2">
          <div className={`p-3 rounded-2xl ${isPretest ? "bg-blue-500/10 text-blue-500" : "bg-orange-500/10 text-orange-500"}`}>
            <Award size={28} />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter">
             Nilai {params.testType}
          </h1>
        </div>
        <p className="text-slate-500 mt-2">Pilih kursus untuk melihat rekapitulasi nilai siswa.</p>
      </header>

      {courses.length === 0 ? (
        <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-[40px] text-slate-600 uppercase font-black italic">
          Belum ada data kursus untuk dinilai
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {courses.map((course) => (
            <Link href={`/teacher/results/${params.testType}/${course.id}`} key={course.id}>
              <div className="group bg-slate-900/40 border border-slate-800 p-8 rounded-[40px] hover:border-blue-500 transition-all cursor-pointer relative overflow-hidden">
                <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-500/5 blur-2xl rounded-full group-hover:bg-blue-500/10 transition-all"></div>
                
                <BookOpen className={`mb-6 transition-colors ${isPretest ? "text-slate-600 group-hover:text-blue-500" : "text-slate-600 group-hover:text-orange-500"}`} size={32} />
                <h3 className="text-xl font-bold mb-6 leading-tight uppercase tracking-tight">{course.title}</h3>
                
                <div className={`flex items-center justify-between text-[10px] font-black uppercase tracking-widest pt-4 border-t border-slate-800/50 ${isPretest ? "text-blue-500" : "text-orange-500"}`}>
                  <span>Lihat Rekapitulasi</span>
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}