"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  Users,
  Menu,
  ChevronDown,
  Star,
  GraduationCap,
} from "lucide-react";

export default function TeacherSidebar({ isOpen, setIsOpen }) {
  const pathname = usePathname();
  
  // State terpisah untuk setiap dropdown
  const [openTest, setOpenTest] = useState(false);
  const [openGrades, setOpenGrades] = useState(false);

  // ✅ PERBAIKAN LOGIKA: Otomatis buka dropdown berdasarkan pathname saat ini
  useEffect(() => {
    if (pathname.startsWith("/teacher/test")) {
      setOpenTest(true);
    }
    if (pathname.startsWith("/teacher/results") || pathname.startsWith("/teacher/grading")) {
      setOpenGrades(true);
    }
  }, [pathname]);

  const menu = [
    { name: "Dashboard", href: "/teacher/dashboard", icon: LayoutDashboard },
    { name: "Courses", href: "/teacher/courses", icon: BookOpen },
    { 
      name: "Test Management", 
      href: "/teacher/test", 
      icon: FileText, 
      isDropdown: true,
      isOpenState: openTest,
      setOpenState: setOpenTest,
      subItems: [
        { name: "Pretest Soal", href: "/teacher/test/pretest" },
        { name: "Posttest Soal", href: "/teacher/test/posttest" },
      ]
    },
    { 
      name: "Student Grades", 
      href: "/teacher/results", 
      icon: GraduationCap, 
      isDropdown: true,
      isOpenState: openGrades,
      setOpenState: setOpenGrades,
      subItems: [
        { name: "Nilai Pretest", href: "/teacher/results/pretest" },
        { name: "Nilai Posttest", href: "/teacher/results/posttest" },
        { name: "Nilai Tugas", href: "/teacher/grading" },
      ]
    },
    { name: "Students", href: "/teacher/students", icon: Users },
  ];

  return (
    <aside
      className={`h-screen bg-slate-900 border-r border-slate-800 p-4 fixed z-50
      transition-all duration-300 ease-in-out
      ${isOpen ? "w-64" : "w-20"}`}
    >
      {/* Header */}
      <div className={`flex items-center mb-10 ${isOpen ? "justify-between" : "justify-center"}`}>
        {isOpen && (
          <h2 className="text-xl font-bold text-blue-500 animate-in fade-in duration-500 uppercase tracking-tighter italic">
            Teacher Panel
          </h2>
        )}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
        >
          <Menu size={24} />
        </button>
      </div>

      {/* Menu List */}
      <ul className="space-y-3">
        {menu.map((item) => {
          const Icon = item.icon;
          // ✅ PERBAIKAN: Pengecekan Active State yang lebih akurat
          const isActive = pathname === item.href || (item.subItems?.some(sub => pathname === sub.href));

          if (item.isDropdown) {
            return (
              <li key={item.name} className="relative group">
                <button
                  onClick={() => {
                    if (!isOpen) setIsOpen(true);
                    item.setOpenState(!item.isOpenState);
                  }}
                  className={`w-full flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200
                  ${isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
                >
                  <div className="min-w-[24px] flex justify-center">
                    <Icon size={22} />
                  </div>
                  {isOpen && (
                    <div className="flex items-center justify-between w-full animate-in slide-in-from-left-2 duration-300">
                      <span className="font-medium text-sm">{item.name}</span>
                      <ChevronDown size={16} className={`transition-transform duration-300 ${item.isOpenState ? "rotate-180" : ""}`} />
                    </div>
                  )}
                </button>

                {/* Submenu Items */}
                {item.isOpenState && isOpen && (
                  <ul className="mt-2 ml-10 space-y-2 animate-in slide-in-from-top-2 duration-300">
                    {item.subItems.map((sub) => {
                      const isSubActive = pathname === sub.href;
                      return (
                        <li key={sub.href}>
                          <Link
                            href={sub.href}
                            className={`block py-2 px-3 rounded-lg text-xs font-bold transition-all uppercase tracking-wider ${
                              isSubActive ? "text-blue-400 bg-blue-400/5" : "text-slate-500 hover:text-white"
                            }`}
                          >
                            {sub.name}
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
                
                {!isOpen && (
                  <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-md shadow-xl invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all z-[60] border border-slate-700 whitespace-nowrap">
                    {item.name}
                  </div>
                )}
              </li>
            );
          }

          return (
            <li key={item.href} className="relative group">
              <Link
                href={item.href}
                className={`flex items-center gap-4 px-3 py-3 rounded-xl transition-all duration-200
                ${isActive ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" : "text-slate-400 hover:bg-slate-800 hover:text-white"}`}
              >
                <div className="min-w-[24px] flex justify-center">
                  <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                </div>
                {isOpen && (
                  <span className="font-medium text-sm whitespace-nowrap animate-in slide-in-from-left-2 duration-300">
                    {item.name}
                  </span>
                )}
              </Link>

              {!isOpen && (
                <div className="absolute left-14 top-1/2 -translate-y-1/2 bg-slate-800 text-white text-[10px] font-black uppercase tracking-widest px-3 py-2 rounded-md shadow-xl invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all z-[60] whitespace-nowrap border border-slate-700">
                  {item.name}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </aside>
  );
}