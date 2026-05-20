"use client";

import { useEffect, useState } from "react";
import { getCourses } from "@/app/services/courseService";
import { api } from "@/lib/api"; 
import Calendar from "react-calendar";
import "./CalendarCustom.css"; 
import { 
  BookOpen, CheckCircle2, TrendingUp, Clock, 
  ArrowUpRight, Calendar as CalendarIcon, Award, Timer,
  Zap, Target, Code2
} from "lucide-react";

export default function Dashboard() {
  const [userName, setUserName] = useState("");
  const [activeDays, setActiveDays] = useState([]);
  const [totalStudyMinutes, setTotalStudyMinutes] = useState(0); 
  const [streak, setStreak] = useState(0); 
  const [loading, setLoading] = useState(true);
  
  // State Baru untuk Statistik Dinamis
  const [summary, setSummary] = useState({
    logicMastery: 0,
    tasksCompleted: 0,
    totalEnrolled: 0
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [userRes, statsRes, activityRes, durationRes, streakRes] = await Promise.all([
          api.get("/api/auth/me"),
          api.get("/api/student/stats-summary"), // Fungsi baru kita
          api.get("/api/student/activity-calendar").catch(() => ({ data: [] })),
          api.get("/api/student/study-duration").catch(() => ({ data: { totalMinutes: 0 } })),
          api.get("/api/student/learning-streak").catch(() => ({ data: { currentStreak: 0 } }))
        ]);

        if (userRes.data) setUserName(userRes.data.name);
        setSummary({
          logicMastery: statsRes.data?.logicMastery || 0,
          tasksCompleted: statsRes.data?.tasksCompleted || 0,
          totalEnrolled: statsRes.data?.enrolled || 0
        });
        setActiveDays(activityRes.data || []);
        setTotalStudyMinutes(durationRes.data?.totalMinutes || 0);
        setStreak(streakRes.data?.currentStreak || 0);

      } catch (error) {
        console.error("Dashboard Sync Error:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  const getTileClass = ({ date, view }) => {
    if (view === "month") {
      const dateString = date.toLocaleDateString('en-CA'); // YYYY-MM-DD
      if (Array.isArray(activeDays) && activeDays.includes(dateString)) {
        return "active-day-highlight";
      }
    }
    return null;
  };

  // UI BOX INFORMASI YANG DI-UPGRADE
  const cards = [
    { 
        title: "Logic Mastery", 
        value: summary.logicMastery, 
        icon: Zap, 
        color: "text-yellow-400", 
        bg: "bg-yellow-400/10", 
        unit: "AVG SCORE",
        desc: "Kualitas logika coding & flowchart" 
    },
    { 
        title: "Tasks Finished", 
        value: summary.tasksCompleted, 
        icon: Code2, 
        color: "text-blue-400", 
        bg: "bg-blue-400/10", 
        unit: "PRACTICE",
        desc: "Tantangan praktek yang diselesaikan" 
    },
    { 
        title: "Class Active", 
        value: summary.totalEnrolled, 
        icon: Target, 
        color: "text-emerald-400", 
        bg: "bg-emerald-400/10", 
        unit: "COURSES",
        desc: "Kursus pemrograman yang diikuti" 
    },
  ];

  const formatStudyTime = (totalMinutes) => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return (
      <>
        {hours > 0 && <>{hours} <span className="text-lg text-blue-500 mx-1 italic">Jam</span></>}
        {minutes} <span className="text-lg text-blue-500 ml-1 italic">Menit</span>
      </>
    );
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-950 text-white">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="font-black tracking-[0.3em] uppercase animate-pulse text-blue-400 text-xs">Syncing Performance...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans selection:bg-blue-500/30">
      <div className="p-4 space-y-10 max-w-7xl mx-auto">
        
        {/* HEADER SECTION */}
        <div className="mt-3 mb-12">
          <h1 className="text-l font-black text-slate-600 uppercase tracking-tighter mb-2 leading-none select-none">Student Dashboard</h1>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Welcome, {userName}</h2>
          <div className="w-24 h-2 bg-blue-600 mt-6 rounded-full shadow-[0_0_25px_rgba(37,99,235,0.4)]"></div>
        </div>

        {/* STREAK SECTION (TETAP) */}
        <div className="group relative overflow-hidden rounded-[48px] border border-orange-500/20 bg-orange-500/5 p-10 shadow-2xl transition-all hover:border-orange-500/40">
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
            <div className="flex h-24 w-24 items-center justify-center rounded-[38px] bg-gradient-to-br from-orange-400 to-orange-600 shadow-[0_0_50px_rgba(249,115,22,0.3)] transition-transform duration-700 group-hover:rotate-[360deg]">
              <span className="text-5xl">🔥</span>
            </div>
            <div className="text-center md:text-left">
              <h4 className="mb-2 text-[10px] font-black uppercase tracking-[0.5em] text-orange-500">Learning Streak</h4>
              <div className="flex items-baseline justify-center md:justify-start gap-4">
                <span className="text-7xl font-black tracking-tighter text-white">{streak}</span>
                <span className="text-2xl font-black uppercase italic tracking-tighter text-orange-200/20">Days Streak</span>
              </div>
              <p className="mt-2 text-[11px] font-bold text-slate-500 uppercase tracking-widest italic opacity-70">
                {streak > 0 ? "Momentum terdeteksi! Lanjutkan konsistensi belajarmu." : "Nyalakan api belajarmu dengan mengerjakan modul hari ini."}
              </p>
            </div>
          </div>
          <div className="absolute -right-20 -bottom-20 h-80 w-80 rounded-full bg-orange-600/10 blur-[100px]"></div>
        </div>

        {/* BOX INFORMASI UPGRADED */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {cards.map((card, i) => (
            <div key={i} className="group relative bg-slate-900/40 border border-slate-800/80 p-8 rounded-[48px] overflow-hidden transition-all duration-500 hover:bg-slate-900 hover:border-slate-600 hover:-translate-y-1 shadow-xl">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div className={`p-4 rounded-3xl ${card.bg} ${card.color} group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                        <card.icon size={24} strokeWidth={2.5} />
                    </div>
                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{card.unit}</span>
                </div>
                <h3 className="text-5xl font-black text-white tracking-tighter mb-2 leading-none">{card.value}</h3>
                <p className="text-sm font-black text-white/90 uppercase tracking-tight mb-1">{card.title}</p>
                <p className="text-[10px] text-slate-500 font-medium italic">{card.desc}</p>
              </div>
              {/* Glow Effect */}
              <div className={`absolute -right-10 -bottom-10 w-40 h-40 blur-[80px] opacity-10 rounded-full ${card.bg}`}></div>
            </div>
          ))}
        </div>

        {/* BOTTOM SECTION: CALENDAR (TETAP) */}
        <div className="grid grid-cols-1 xl:grid-cols-5 gap-10">
          <div className="xl:col-span-3 bg-slate-900/40 border border-slate-800 p-10 rounded-[48px] shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Activity Logs</h3>
                <p className="text-slate-500 text-[10px] font-black tracking-[0.2em] uppercase mt-1">Kalender Keaktifan Belajar</p>
              </div>
              <div className="p-4 bg-slate-800 rounded-2xl text-slate-400">
                <CalendarIcon size={24} />
              </div>
            </div>
            
            <div className="flex justify-center bg-slate-950/40 p-8 rounded-[40px] border border-slate-800/50 shadow-inner">
              <Calendar tileClassName={getTileClass} locale="id-ID" prev2Label={null} next2Label={null} />
            </div>

            <div className="mt-10 pt-8 border-t border-slate-800/60 flex justify-between items-end">
              <div className="flex flex-col">
                <span className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2 italic">Total Waktu</span>
                <span className="text-4xl font-black text-white tracking-tighter leading-none shadow-blue-500/20 drop-shadow-lg">
                  {formatStudyTime(totalStudyMinutes)}
                </span>
              </div>
              <Award className="text-slate-800" size={48} />
            </div>
          </div>

          {/* CTA SECTION */}
          <div className="xl:col-span-2 flex flex-col gap-8">
            <div className="flex-1 bg-gradient-to-br from-blue-600 to-indigo-900 rounded-[56px] p-12 relative overflow-hidden shadow-2xl group flex flex-col justify-center border border-white/10">
                <div className="relative z-10">
                  <div className="w-20 h-20 bg-white/10 rounded-[32px] flex items-center justify-center mb-10 backdrop-blur-xl border border-white/10 group-hover:scale-110 transition-transform duration-700">
                     <Timer className="text-white" size={40} />
                  </div>
                  <h3 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter leading-tight">Mari<br/>Lanjutkan Belajar</h3>
                  <p className="text-blue-100 text-xs mb-10 opacity-60 leading-relaxed font-bold uppercase tracking-widest italic">
                    Belajar dengan konsisten adalah kunci untuk menguasai pemrograman. Klik tombol di bawah untuk melanjutkan perjalanan belajarmu dan raih pencapaian baru!
                  </p>
                  <button onClick={() => window.location.href='/student/courses'} className="bg-white text-blue-900 px-10 py-5 rounded-[24px] font-black uppercase tracking-[0.2em] text-[10px] flex items-center gap-4 transition-all hover:bg-blue-50 shadow-2xl active:scale-95 w-fit">
                    Lanjutkan Belajar <ArrowUpRight size={18} strokeWidth={4} />
                  </button>
                </div>
                <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-blue-400/20 rounded-full blur-[120px]"></div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}