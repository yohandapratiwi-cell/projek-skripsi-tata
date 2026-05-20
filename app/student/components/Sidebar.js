"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar({ collapsed, setCollapsed }) {

  const pathname = usePathname();

  const menu = [
    { name: "Dashboard", icon: "🏠︎", path: "/student/dashboard" },
    { name: "Courses", icon: "✎", path: "/student/courses" },
    { name: "Challenge", icon: "📝", path: "/student/challenge" },
    { name: "Progress", icon: "✔", path: "/student/progress" },
    { name: "Settings", icon: "⚙", path: "/student/settings" },
  ];

  return (
    <aside
      className={`fixed top-16 left-0 h-full bg-gray-900 text-white transition-all duration-300
      ${collapsed ? "w-14" : "w-64"}`}
    >

      <div className="p-4 flex justify-end">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-white text-lg"
        >
          ☰
        </button>
      </div>

      <ul className="space-y-3 px-3">

        {menu.map((item) => {

          const active = pathname === item.path;

          return (
            <li key={item.name}>
              <Link
                href={item.path}
                className={`flex items-center gap-3 p-2 rounded-lg transition
                ${active ? "bg-blue-600" : "hover:bg-gray-700"}`}
              >
                <span className="text-lg">{item.icon}</span>

                {!collapsed && <span>{item.name}</span>}

              </Link>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}