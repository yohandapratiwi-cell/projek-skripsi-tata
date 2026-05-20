"use client";

import { useState, useEffect } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  CartesianGrid
} from "recharts";
import { 
  BookOpen, Users, Layout, Loader2, ChevronDown, 
  LayoutDashboard 
} from "lucide-react";
import { api } from "@/lib/api";
import ClassCompetencyRadar from "@/components/teacher/ClassCompetencyRadar";

export default function TeacherDashboard() {
  const [loading, setLoading] = useState(true);
  const [chartLoading, setChartLoading] = useState(false);
  const [stats, setStats] = useState({
    courses: 0,
    students: 0,
    modules: 0,
  });

  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const res = await api.get("/api/teacher/dashboard-stats");
        const data = res.data; 

        setStats({
          courses: data.totalCourses || 0,
          students: data.totalStudents || 0,
          modules: data.totalModules || 0,
        });
        
        setCourses(data.courseList || []);
        
        if (data.courseList && data.courseList.length > 0) {
          setSelectedCourse(data.courseList[0].id);
        }
      } catch (err) {
        console.error("Gagal mengambil data dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!selectedCourse) return;

    const fetchChartData = async () => {
      setChartLoading(true);
      try {
        const res = await api.get(`/api/teacher/course-progress/${selectedCourse}`);
        const result = res.data?.data || res.data || [];
        setChartData(Array.isArray(result) ? result : []);
      } catch (err) {
        console.error("Gagal mengambil data grafik:", err);
        setChartData([]);
      } finally {
        setChartLoading(false);
      }
    };

    fetchChartData();
  }, [selectedCourse]);

  if (loading) {
    return (
      <div className="h-screen bg-slate-950 flex flex-col items-center justify-center text-blue-500 gap-4">
        <Loader2 className="animate-spin" size={40} />
        <p className="text-slate-500 text-sm font-black uppercase tracking-[0.3em] italic opacity-50">Loading Teacher Center...</p>
      </div>
    );
  }

  const cards = [
    { title: "Total Courses", value: stats.courses, icon: BookOpen, color: "text-blue-500", bg: "bg-blue-500/10" },
    { title: "Total Students", value: stats.students, icon: Users, color: "text-green-500", bg: "bg-green-500/10" },
    { title: "Total Modules", value: stats.modules, icon: Layout, color: "text-purple-500", bg: "bg-purple-500/10" },
  ];

  return (
    <div className="p-4 space-y-10 bg-slate-950 min-h-screen text-slate-200">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-900 pb-8">
        <div>
          <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-4 text-white italic">
            <LayoutDashboard className="text-blue-500" size={40} /> Teacher Center
          </h1>
          <p className="text-slate-500 mt-2 font-medium tracking-wide">Monitoring real-time progres dan kompetensi siswa.</p>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {cards.map((card, i) => (
          <div key={i} className="bg-slate-900 border border-slate-800 p-8 rounded-[48px] hover:border-blue-500/30 transition-all shadow-2xl relative overflow-hidden group">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 blur-3xl rounded-full"></div>
            <div className="flex justify-between items-start relative z-10">
              <div>
                <h2 className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mb-1">{card.title}</h2>
                <p className={`text-5xl font-black ${card.color} tracking-tighter mt-2 italic`}>{card.value}</p>
              </div>
              <div className={`p-5 rounded-3xl ${card.bg} ${card.color} group-hover:scale-110 transition-transform shadow-lg`}><card.icon size={26} /></div>
            </div>
          </div>
        ))}
      </div>

      {/* SECTION 1: PROGRES MODUL */}
      <div className="bg-slate-900/40 border border-slate-800 p-10 rounded-[56px] shadow-sm backdrop-blur-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-12 gap-6">
          <div>
            <h2 className="font-black text-xl text-white uppercase tracking-tight italic underline decoration-blue-500 underline-offset-8">Module Completion Progres</h2>
            <p className="text-slate-500 text-[10px] mt-4 uppercase tracking-widest font-bold">Trend penyelesaian modul per kursus</p>
          </div>

          <div className="relative group">
            <select 
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="appearance-none bg-slate-800 border border-slate-700 text-white px-10 py-4 pr-16 rounded-2xl text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-blue-500 transition-all cursor-pointer shadow-2xl hover:bg-slate-700"
            >
              {courses.map((course) => (<option key={course.id} value={course.id}>{course.title}</option>))}
            </select>
            <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover:text-white transition-colors" size={18} />
          </div>
        </div>

        <div className="h-[380px] w-full relative">
          {chartLoading && (
            <div className="absolute inset-0 bg-slate-950/60 z-20 flex items-center justify-center rounded-[40px] backdrop-blur-sm">
              <Loader2 className="animate-spin text-blue-500" size={32} />
            </div>
          )}
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/><stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} opacity={0.5} />
              <XAxis dataKey="module_name" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} dy={15} fontWeight="900" textTransform="uppercase"/>
              <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} dx={-10} fontWeight="900"/>
              <Tooltip 
                contentStyle={{ backgroundColor: "#020617", border: "1px solid #1e293b", borderRadius: "24px", padding: "16px" }}
                itemStyle={{ color: "#3b82f6", fontWeight: "900", textTransform: "uppercase", fontSize: "10px" }}
              />
              <Area type="monotone" dataKey="completed_count" stroke="#3b82f6" strokeWidth={6} fillOpacity={1} fill="url(#colorStudents)" dot={{ r: 6, fill: "#3b82f6", stroke: "#020617", strokeWidth: 3 }} activeDot={{ r: 10, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* SECTION 2: CLASS COMPETENCY RADAR */}
      <ClassCompetencyRadar />

    </div>
  );
}