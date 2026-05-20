"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
// ✅ IMPORT instance api (Axios)
import { api } from "@/lib/api"; 

export default function ModulesPage() {
  const { courseId } = useParams();

  const [modules, setModules] = useState([]);
  const [title, setTitle] = useState("");
  const [order, setOrder] = useState("");

  const fetchModules = async () => {
    try {
      // ✅ PERBAIKAN: Gunakan api.get agar menembak online & kirim cookie
      const res = await api.get(`/teacher/modules/${courseId}`);
      // Axios otomatis melakukan JSON.parse, data ada di res.data
      setModules(res.data);
    } catch (err) {
      console.error("Gagal mengambil modul:", err);
    }
  };

  useEffect(() => {
    if (courseId) fetchModules();
  }, [courseId]);

  const createModule = async () => {
    try {
      // ✅ PERBAIKAN: Gunakan api.post
      await api.post("/teacher/modules", {
        course_id: Number(courseId),
        title,
        module_order: Number(order),
      });

      setTitle("");
      setOrder("");
      fetchModules();
    } catch (err) {
      console.error("Gagal membuat modul:", err);
      alert("Gagal menambahkan modul.");
    }
  };

  const deleteModule = async (id) => {
    if (!confirm("Hapus modul ini?")) return;
    try {
      // ✅ PERBAIKAN: Gunakan api.delete
      await api.delete(`/teacher/modules/${id}`);
      fetchModules();
    } catch (err) {
      console.error("Gagal menghapus modul:", err);
      alert("Gagal menghapus modul.");
    }
  };

  // --- UI TETAP SAMA 100% ---
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Manage Modules (Course {courseId})
      </h1>

      {/* FORM */}
      <div className="flex gap-2">
        <input
          placeholder="Module title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="bg-slate-800 px-3 py-2 rounded-lg text-white outline-none focus:ring-1 focus:ring-blue-500"
        />

        <input
          placeholder="Order"
          value={order}
          onChange={(e) => setOrder(e.target.value)}
          className="bg-slate-800 px-3 py-2 rounded-lg w-24 text-white outline-none focus:ring-1 focus:ring-blue-500"
        />

        <button
          onClick={createModule}
          className="bg-blue-600 hover:bg-blue-700 px-4 rounded-lg text-white font-bold transition-colors"
        >
          Add
        </button>
      </div>

      {/* LIST */}
      <div className="space-y-2">
        {modules.map((m) => (
          <div
            key={m.id}
            className="bg-slate-900 border border-slate-800 p-4 rounded-lg flex justify-between items-center"
          >
            <span className="text-slate-200">
              {m.module_order}. {m.title}
            </span>

            <button
              onClick={() => deleteModule(m.id)}
              className="text-red-400 hover:text-red-300 font-medium transition-colors"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}