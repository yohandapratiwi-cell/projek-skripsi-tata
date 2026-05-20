"use client";

import { useEffect, useState } from "react";
import { Search, User, ArrowRight, LayoutGrid, BookOpen } from "lucide-react";
import Link from "next/link";
// ✅ IMPORT instance api agar sinkron dengan baseURL Railway
import { api } from "@/lib/api";

export default function CoursesPage() {
  const [courses, setCourses] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/courses");
        
        // Sesuaikan dengan format response controller (biasanya res.data.data atau res.data)
        const dataResult = res.data?.data || res.data || [];
        setCourses(Array.isArray(dataResult) ? dataResult : []);
      } catch (error) {
        console.error("Failed to fetch courses:", error);
        setCourses([]); // Jaga-jaga agar tidak error .filter
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter((course) =>
    course.title?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="">
      <div className="p-2 space-y-8 bg-slate-950 min-h-screen text-slate-200">
        <div className="mt-3 mb-3">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>              
              <h1 className="text-3xl font-black tracking-tight text-white mb-1 uppercase">
                Course Tersedia
              </h1>
              <p className="text-slate-500 text-sm font-medium">
                Pilih materi yang ingin kamu pelajari hari ini.
              </p>
            </div>

            {/* SEARCH BAR */}
            <div className="relative group w-full md:w-80">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={16} />
              <input
                type="text"
                placeholder="Cari Materi"
                className="w-full bg-slate-900/40 border border-slate-800 text-sm text-white pl-11 pr-4 py-3 rounded-2xl outline-none focus:border-blue-500/50 transition-all shadow-inner"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* COURSE GRID */}
        <div className="pb-10">
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map((n) => (
                <div key={n} className="bg-slate-900/40 border border-slate-800 rounded-[32px] h-80 animate-pulse" />
              ))}
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredCourses.map((course) => (
                <div
                  key={course.id}
                  className="group bg-slate-900/30 border border-slate-800/60 rounded-[32px] overflow-hidden hover:border-blue-500/40 transition-all duration-500 flex flex-col hover:-translate-y-2 shadow-sm hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]"
                >
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={course.thumbnail || "/course-default.jpg"}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      alt={course.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/20 to-transparent" />
                  </div>

                  <div className="p-7 flex flex-col flex-grow">
                    <h2 className="font-bold text-xl text-white mb-2 line-clamp-2 group-hover:text-blue-400 transition-colors tracking-tight uppercase italic">
                      {course.title}
                    </h2>

                    <div className="flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase tracking-widest mb-8">
                      <div className="w-5 h-5 rounded-lg bg-slate-800 flex items-center justify-center">
                        <User size={10} className="text-blue-500" />
                      </div>
                      <span>{course.instructor || "Administrator"}</span>
                    </div>

                    <div className="mt-auto">
                      <Link
                        href={`/student/courses/${course.id}`}
                        className="flex items-center justify-center gap-2 w-full bg-slate-800/40 hover:bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all group/btn border border-slate-700/50 hover:border-blue-500 shadow-lg"
                      >
                        Mulai Belajar
                        <ArrowRight size={16} className="group-hover/btn:translate-x-1 transition-transform" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-32 border-2 border-dashed border-slate-900 rounded-[40px] opacity-40">
              <BookOpen className="mx-auto text-slate-800 mb-4" size={64} />
              <p className="text-slate-600 font-black uppercase tracking-widest text-xs">Materi tidak ditemukan.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}