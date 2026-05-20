"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { 
  Trophy, CheckCircle2, HelpCircle, ArrowRight, 
  Loader2, Lock, Sparkles, BookOpen
} from "lucide-react";

export default function ChallengePage() {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChallengesData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/student/challenges");
        setChallenges(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("Error fetching challenges:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchChallengesData();
  }, []);

  if (loading) return (
    <div className="h-screen bg-slate-950 flex items-center justify-center text-blue-500">
      <Loader2 className="animate-spin" size={40} />
    </div>
  );

  return (
    <div className="p-8 text-white space-y-12 bg-slate-950 min-h-screen">
      <header className="max-w-4xl">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-blue-500/10 rounded-2xl border border-blue-500/20">
            <Trophy className="text-blue-500" size={32} />
          </div>
          <h1 className="text-4xl font-black uppercase tracking-tighter italic">Knowledge Challenges</h1>
        </div>
        <p className="text-slate-500 text-sm italic font-medium">Uji pemahamanmu melalui asesmen awal dan akhir untuk mengukur progres belajarmu.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {challenges.length > 0 ? (
          challenges.map((item) => {
            const isLocked = !item.is_unlocked;
            
            return (
              <div 
                key={item.test_id} 
                className={`bg-slate-900/40 border rounded-[48px] p-3 transition-all group relative overflow-hidden ${
                  isLocked ? 'border-slate-800 opacity-60' : 'border-slate-800 hover:border-blue-500/50'
                }`}
              >
                <div className="relative h-56 w-full rounded-[40px] overflow-hidden">
                  <img 
                    src={item.thumbnail || "/placeholder-course.jpg"} 
                    alt={item.course_title}
                    className={`w-full h-full object-cover transition-transform duration-700 ${!isLocked && 'group-hover:scale-110'}`}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                  
                  {/* Badge Tipe Test */}
                  <div className={`absolute top-5 left-5 px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl ${
                    item.test_type === 'pretest' ? 'bg-blue-600' : 'bg-orange-600'
                  }`}>
                    {item.test_type === 'pretest' ? 'Asesmen Awal' : 'Asesmen Akhir'}
                  </div>

                  {/* Status Overlay */}
                  {isLocked ? (
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3">
                      <Lock className="text-slate-400" size={40} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Selesaikan Materi & Tugas</span>
                    </div>
                  ) : item.is_completed && (
                    <div className="absolute top-5 right-5 bg-green-500 p-2.5 rounded-full shadow-lg">
                      <CheckCircle2 size={20} className="text-white" />
                    </div>
                  )}
                </div>

                <div className="p-8">
                  <h3 className="text-2xl font-black mb-4 line-clamp-1 italic uppercase tracking-tighter">
                    {item.course_title}
                  </h3>
                  
                  <div className="flex items-center gap-6 mb-10">
                    <div className="flex items-center gap-2 text-slate-400">
                      <HelpCircle size={16} className="text-blue-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{item.total_questions} Questions</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <BookOpen size={16} className="text-emerald-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{item.duration} Min</span>
                    </div>
                  </div>

                  {isLocked ? (
                    <div className="w-full py-5 rounded-3xl bg-slate-800/50 border border-slate-700/50 text-slate-500 text-center text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-center gap-3">
                       Post-test Locked
                    </div>
                  ) : (
                    <Link href={item.is_completed ? `/student/test/review/${item.test_id}` : `/student/test/${item.course_id}/${item.test_type}/${item.test_id}`}>
                      <button className={`w-full py-5 rounded-[28px] font-black uppercase tracking-[0.3em] text-[10px] flex items-center justify-center gap-3 transition-all active:scale-95 ${
                        item.is_completed 
                        ? 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700' 
                        : 'bg-blue-600 text-white hover:bg-blue-500 shadow-xl shadow-blue-900/20'
                      }`}>
                        {item.is_completed ? "Review Result" : "Start Challenge"}
                        <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full py-40 text-center bg-slate-900/20 border-4 border-dashed border-slate-900 rounded-[60px]">
            <Trophy size={64} className="mx-auto mb-6 text-slate-800" />
            <p className="font-black text-xs uppercase tracking-[0.5em] text-slate-700 italic">No Challenges Available Yet</p>
          </div>
        )}
      </div>
    </div>
  );
}