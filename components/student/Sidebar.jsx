"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  BookOpen, 
  Trophy, 
  LineChart, 
  Menu,
  ChevronLeft,
  GraduationCap
} from "lucide-react";

export default function Sidebar({ collapsed, setCollapsed }) {
  const pathname = usePathname();

  // Pastikan path di sini sesuai dengan struktur folder app/student/...
  const menu = [
    { name: "Dashboard", icon: LayoutDashboard, path: "/student/dashboard" },
    { name: "Challenge", icon: Trophy, path: "/student/challenge" },
    { name: "Courses", icon: BookOpen, path: "/student/courses" },
    { name: "Progress", icon: LineChart, path: "/student/progress" }
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-slate-950 text-white transition-all duration-500 z-50 border-r border-slate-900 flex flex-col
      ${collapsed ? "w-20" : "w-64"}`}
    >
      {/* Header: Logo */}
      <div className="h-20 flex items-center justify-between px-5 border-b border-slate-900/50">
        {!collapsed && (
          <div className="flex items-center gap-3 animate-in fade-in duration-700">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
              <GraduationCap size={20} className="text-white" />
            </div>
            <h1 className="text-lg font-bold tracking-tight">
              SW <span className="text-blue-500">LEARN</span>
            </h1>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className={`text-slate-500 hover:text-white p-2.5 rounded-xl hover:bg-slate-900 transition-all ${collapsed ? "mx-auto" : ""}`}
        >
          {collapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Main Menu */}
      <nav className="flex-grow mt-8 px-3">
        <ul className="space-y-2">
          {menu.map((item) => {
            // Logika aktif yang lebih akurat (juga menangkap sub-path)
            const active = pathname === item.path || pathname.startsWith(`${item.path}/`);
            const Icon = item.icon;
            
            return (
              <li key={item.name}>
                <Link
                  href={item.path}
                  className={`group relative flex items-center gap-4 p-3.5 rounded-2xl transition-all duration-300
                  ${active 
                    ? "bg-blue-600/10 text-blue-400 shadow-[inset_0_0_20px_rgba(37,99,235,0.05)]" 
                    : "hover:bg-slate-900 text-slate-500 hover:text-slate-200"}`}
                >
                  {active && (
                    <div className="absolute left-0 w-1.5 h-6 bg-blue-500 rounded-r-full shadow-[0_0_10px_#3b82f6]" />
                  )}
                  
                  <Icon size={22} className={`${active ? "scale-110" : "group-hover:scale-110 transition-transform"}`} />
                  
                  {!collapsed && (
                    <span className="font-semibold tracking-wide animate-in slide-in-from-left-2">
                      {item.name}
                    </span>
                  )}

                  {/* Tooltip saat Sidebar mengecil */}
                  {collapsed && (
                    <div className="absolute left-16 bg-slate-800 text-white text-[10px] uppercase tracking-widest font-bold px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all shadow-xl z-50 border border-slate-700 whitespace-nowrap">
                      {item.name}
                    </div>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}