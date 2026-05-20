"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api } from "@/lib/api"; 
import { Loader2, FileText, ArrowRight, Code, BrainCircuit, BarChart3, CheckCircle2 } from "lucide-react"; 

export default function LandingPage() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/api/courses"); 
        if (res.data && res.data.status === "success") {
          setCourses(res.data.data.slice(0, 3)); 
        }
      } catch (err) {
        console.error("Gagal sinkronisasi data modul:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="relative min-h-screen bg-slate-950 text-white overflow-hidden pt-5 font-sans">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 left-0 w-full z-50 flex justify-between items-center px-10 py-6 border-b border-slate-800 bg-slate-950/80 backdrop-blur-lg">
        <Link href="/">
          <h1 className="text-2xl font-black text-blue-400 cursor-pointer italic tracking-tighter uppercase">
            Semantic Wave
          </h1>
        </Link>
        <div className="flex gap-8 items-center font-bold text-xs uppercase tracking-widest">
          <Link href="/login">
            <button className="bg-blue-600 px-6 py-2 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20">
              Login
            </button>
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="text-center py-40 px-6 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="inline-block px-4 py-1 border border-blue-500/30 rounded-full bg-blue-500/10 text-blue-400 text-[10px] font-black uppercase tracking-[0.3em] mb-8 animate-pulse">
          Interactive Learning Environment
        </div>
        <h1 className="text-6xl md:text-7xl font-black leading-[0.9] tracking-tighter uppercase italic mb-8">
          Mastering <span className="text-blue-400">Logic</span> <br />
          Beyond The Code
        </h1>
        <p className="mt-6 text-slate-400 max-w-2xl mx-auto text-lg italic leading-relaxed">
          Platform pembelajaran pemrograman C.
        </p>
        <p className="text-slate-400 max-w-2xl mx-auto text-lg italic leading-relaxed">
          Asah kemampuan berpikir logis melalui modul interaktif, visualisasi flowchart, dan tantangan coding.
        </p>
        <div className="mt-12 flex justify-center gap-6">
          <Link href="/register">
            <button className="bg-blue-600 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 transition-all hover:scale-105">
              Get Started
            </button>
          </Link>
          <a href="#courses">
            <button className="border border-slate-700 px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all">
              See Modules
            </button>
          </a>
        </div>
      </section>

      {/* FEATURED COURSES */}
      <section id="courses" className="py-32 px-10 bg-slate-900 border-y border-slate-800/50">
        <div className="text-center mb-20">
          <h2 className="text-4xl font-black text-white uppercase italic tracking-tighter mb-4">
            Available Modules
          </h2>
          <div className="h-1.5 w-20 bg-blue-600 mx-auto rounded-full"></div>
        </div>
        
        <div className="flex flex-wrap justify-center gap-10 w-full max-w-7xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center text-blue-500 italic py-20">
               <Loader2 className="animate-spin mb-4" size={40} />
               <span className="text-xs font-black uppercase tracking-widest">Loading from database...</span>
            </div>
          ) : (
            courses.map((course) => (
              <Link href="/login" key={course.id}>
                <div className="bg-slate-900/40 p-8 rounded-[40px] border border-slate-800 hover:border-blue-500 hover:scale-105 transition-all duration-500 w-full md:w-[380px] h-full flex flex-col justify-between group shadow-2xl relative">
                  <div>
                    <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-8 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                       <FileText size={32} />
                    </div>
                    <h3 className="text-3xl font-black text-white uppercase tracking-tight italic mb-4 line-clamp-1">
                      {course.title}
                    </h3>
                    <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 italic font-medium">
                      {course.description || `Mulai pelajari konsep ${course.title} dengan kurikulum terstruktur.`}
                    </p>
                  </div>
                  <div className="mt-10 flex items-center gap-3 text-blue-500 font-black text-[10px] uppercase tracking-[0.3em]">
                    EXPLORE NOW <ArrowRight size={18} />
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>
      </section>

      {/* LEARNING EXPERIENCE */}
      <section id="features" className="py-32 px-10 bg-slate-950">
        <h2 className="text-3xl font-black text-center mb-20 uppercase italic tracking-tighter">
          Key Features
        </h2>
        <div className="grid md:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {[
            { t: "Logic-First", d: "Fokus pada algoritma sebelum sintaks.", i: <CheckCircle2 /> },
            { t: "Live Code", d: "Compile kode C langsung tanpa instalasi.", i: <Code /> },
            { t: "Visual Flow", d: "Visualisasi logika menggunakan flowchart.", i: <BrainCircuit /> },
            { t: "Assessment", d: "Evaluasi terukur di setiap akhir materi.", i: <BarChart3 /> },
          ].map((f, i) => (
            <div key={i} className="bg-slate-800/40 p-8 rounded-[32px] border border-slate-700/50 hover:bg-slate-800 transition-all group text-center md:text-left">
              <div className="text-blue-500 mb-6 group-hover:scale-110 transition-transform flex justify-center md:justify-start">{f.i}</div>
              <h3 className="text-lg font-black uppercase italic mb-3 text-white">{f.t}</h3>
              <p className="text-slate-500 text-sm italic font-medium leading-relaxed">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="text-center py-32 bg-gradient-to-r from-blue-700 to-indigo-800 relative">
        <div className="relative z-10 px-6">
          <h2 className="text-4xl md:text-5xl font-black mb-8 italic tracking-tighter uppercase">
            Ready to Build Your <br /> Programming Logic?
          </h2>
          <Link href="/register">
            <button className="bg-white text-black px-12 py-5 rounded-[24px] font-black text-xs uppercase tracking-[0.2em] hover:bg-slate-100 transition-all active:scale-95">
              Get Started for Free
            </button>
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="text-center py-12 border-t border-slate-900 bg-slate-950 text-slate-600 text-[10px] font-black uppercase tracking-[0.4em] italic">
        © 2026 Semantic Wave — Yohanda Gita Pratiwi
      </footer>
    </div>
  );
}