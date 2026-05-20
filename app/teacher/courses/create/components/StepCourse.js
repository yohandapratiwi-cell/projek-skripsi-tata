"use client";

import { useState } from "react";
import { api } from "@/lib/api"; 

export default function StepCourse({ setStep, setCourseId }) {
  const [form, setForm] = useState({
    title: "",
    instructor: "",
    thumbnail: "",
    description: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    if (!form.title || !form.instructor) {
      return alert("Judul dan Pengajar wajib diisi!");
    }

    setIsSubmitting(true);
    try {
      // ✅ PERBAIKAN: Gunakan prefix /api/teacher/
      const res = await api.post("/api/teacher/courses", form);
      const data = res.data;

      // Mendukung format data langsung atau data.id
      const id = data.id || data.data?.id;

      if (id) {
        setCourseId(id); 
        setStep(2);
      } else {
        throw new Error("Server tidak mengembalikan ID Course.");
      }
    } catch (error) {
      console.error("Error StepCourse:", error.message);
      const errorMessage = error.response?.data?.error || error.message || "Gagal menyimpan course.";
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-slate-900 p-8 rounded-3xl border border-slate-800 shadow-2xl animate-in fade-in duration-500">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white tracking-tight">Informasi Dasar Course</h2>
        <p className="text-sm text-slate-500">Lengkapi detail utama course Anda sebelum menyusun modul.</p>
      </div>
  
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-400 ml-1">Judul Course</label>
          <input
            name="title"
            type="text"
            placeholder="Contoh: Percabangan C++"
            className="bg-slate-800 border border-slate-700 p-4 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all w-full"
            onChange={handleChange}
          />
        </div>
  
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-400 ml-1">Nama Pengajar</label>
          <input
            name="instructor"
            type="text"
            placeholder="Contoh: Yohanda Gita P., S.Pd."
            className="bg-slate-800 border border-slate-700 p-4 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all w-full"
            onChange={handleChange}
          />
        </div>
  
        <div className="md:col-span-2 flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-400 ml-1">URL Gambar Thumbnail</label>
          <input
            name="thumbnail"
            type="text"
            placeholder="https://link-gambar.com/foto.jpg"
            className="bg-slate-800 border border-slate-700 p-4 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all w-full"
            onChange={handleChange}
          />
        </div>
  
        <div className="md:col-span-2 flex flex-col gap-2">
          <label className="text-sm font-medium text-slate-400 ml-1">Deskripsi Singkat</label>
          <textarea
            name="description"
            placeholder="Jelaskan apa yang akan dipelajari di course ini..."
            className="bg-slate-800 border border-slate-700 p-4 rounded-xl text-white outline-none focus:ring-2 focus:ring-blue-500 transition-all h-32 resize-none w-full"
            onChange={handleChange}
          />
        </div>
      </div>
  
      <div className="mt-8 flex justify-end">
        <button 
          onClick={handleSubmit} 
          disabled={isSubmitting}
          className={`w-full md:w-auto md:px-12 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2 ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSubmitting ? "Menyimpan..." : "Simpan & Lanjutkan"}
        </button>
      </div>
    </div>
  );
}