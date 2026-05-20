"use client";

import { useState, useEffect } from "react";
import { 
  Upload, Save, FileText, CheckCircle2, Trash2, 
  Image as ImageIcon, Download, Info, Check, Loader2, 
  ClipboardCheck 
} from "lucide-react";
import { createTest, uploadDocx } from "@/app/services/testService";
import { getAvailableCourses } from "@/app/services/courseService";
// ✅ IMPORT instance api (huruf kecil) dari lib
import { api } from "@/lib/api"; 

export default function PretestPage() {
  const [file, setFile] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [title, setTitle] = useState("");
  const [courseId, setCourseId] = useState("");
  const [availableCourses, setAvailableCourses] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchCoursesData = async () => {
      try {
        // ✅ Pastikan di dalam courseService juga sudah menggunakan 'api' (kecil)
        const data = await getAvailableCourses("pretest");
        setAvailableCourses(data || []);
      } catch (error) {
        console.error("Gagal mengambil daftar course:", error);
      }
    };
    fetchCoursesData();
  }, []);

  const downloadTemplate = () => {
    const link = document.createElement("a");
    link.href = "/templates/template_soal_lms.docx"; 
    link.download = "Template_Soal_Pretest.docx";
    link.click();
  };

  // Cari fungsi handleUpload di page.js Bapak, ganti isinya dengan ini:
const handleUpload = async () => {
  if (!file) return alert("Silakan pilih file .docx!");
  setIsLoading(true);
  try {
    const formData = new FormData();
    formData.append("file", file);
    
    // ✅ Panggil service
    const response = await uploadDocx(formData);
    
    // ✅ SINKRONISASI DATA: 
    // Backend Bapak mengirim { status: "success", data: { questions: [...] } }
    // Maka cara ambilnya adalah: response.data.questions
    const extractedQuestions = response.data?.questions || response.questions;

    if (extractedQuestions && Array.isArray(extractedQuestions)) {
      setQuestions(extractedQuestions);
      alert("✅ Dokumen berhasil dianalisis!");
    } else {
      alert("⚠️ File terbaca, tapi tidak ada soal yang terdeteksi. Cek format template!");
    }
  } catch (err) { 
    console.error("Detail Error:", err);
    alert("Gagal menganalisis file: " + (err.response?.data?.error || err.message)); 
  } finally { 
    setIsLoading(false); 
  }
};

  // ... (Bagian handleImageUpload diperbaiki prefixnya)
  const handleImageUpload = async (e, type, qIndex, optIndex = null) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    try {
      // ✅ Tambahkan prefix /api/
      const res = await api.post("/api/tests/upload-image", formData);
      const imageUrl = res.data.url;
      const updatedQuestions = [...questions];
      if (type === "question") updatedQuestions[qIndex].question_image = imageUrl;
      else updatedQuestions[qIndex].options[optIndex].option_image = imageUrl;
      setQuestions(updatedQuestions);
    } catch (err) { alert("Gagal mengunggah gambar."); }
  };

  const handleCreate = async () => {
    if (!courseId || !title || questions.length === 0) return alert("Lengkapi data!");
    setIsSaving(true);
    try {
      // ✅ Pastikan di dalam testService.createTest juga menggunakan 'api' (kecil)
      await createTest({ course_id: courseId, type: "pretest", title, duration: 30, questions });
      alert("🎉 Tersimpan!");
      setQuestions([]); setTitle(""); setFile(null); setCourseId("");
    } catch (err) { 
      console.error(err);
      alert("Gagal menyimpan."); 
    }
    finally { setIsSaving(false); }
  };

  // --- UI TETAP SAMA 100% ---
  return (
    <div className="flex flex-col gap-8 p-2 min-h-screen bg-slate-950 text-white selection:bg-blue-500/30">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-slate-800 pb-8 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2.5 bg-blue-600 rounded-2xl shadow-lg shadow-blue-900/40">
              <ClipboardCheck size={22} className="text-white" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter uppercase text-white">Input Pre-test</h1>
          </div>
          <p className="text-slate-500 mt-2">Pratinjau ekstraksi otomatis soal dari dokumen Microsoft Word.</p>
        </div>
        <button onClick={handleCreate} disabled={isSaving} className="flex items-center gap-3 bg-green-600 hover:bg-blue-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 shadow-xl shadow-blue-900/20">
          {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Simpan Pre-test
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        
        {/* Kolom Kiri: Panel Informasi & Config */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-blue-600/5 border border-blue-500/20 p-8 rounded-[40px] space-y-5">
            <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-blue-400 flex items-center gap-2">
              <Info size={35} /> Panduan Input
            </h3>
            <div className="space-y-4">
               {[
                 "Gunakan angka (1., 2., dst) untuk nomor soal.",
                 "Gunakan huruf kapital (A., B., dst) untuk opsi.",
                 "Kunci jawaban wajib ditulis ANS: A.",
                 "Jangan gunakan bullet and numbering pada word."
               ].map((text, i) => (
                 <div key={i} className="flex gap-4 items-start">
                    <div className="mt-1 h-5 w-5 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center shrink-0">
                        <Check size={10} className="text-blue-400" />
                    </div>
                    <span className="text-[13px] text-slate-300 leading-relaxed font-medium">{text}</span>
                 </div>
               ))}
            </div>
            <button onClick={downloadTemplate} className="w-full mt-4 flex items-center justify-center gap-3 bg-slate-900 border border-slate-800 hover:border-blue-500 text-white p-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-inner">
              <Download size={14} /> Unduh Template .Docx
            </button>
          </div>

          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[40px] space-y-6 shadow-2xl">
            <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-500">Konfigurasi</h3>
            <div className="space-y-5">
              <select className="w-full bg-slate-950 p-4 rounded-2xl border border-slate-800 focus:border-blue-500 outline-none text-sm font-bold text-white transition-all appearance-none" onChange={(e) => setCourseId(e.target.value)} value={courseId}>
                <option value="">Pilih Mata Pelajaran...</option>
                {availableCourses?.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
              <input className="w-full bg-slate-950 p-4 rounded-2xl border border-slate-800 focus:border-blue-500 outline-none text-sm font-bold transition-all text-white" placeholder="Judul Pre-test..." value={title} onChange={(e) => setTitle(e.target.value)} />
              <label htmlFor="pretestUpload" className="w-full flex flex-col items-center justify-center gap-4 bg-slate-950 border-2 border-dashed border-slate-800 p-10 rounded-[32px] cursor-pointer hover:border-blue-500 hover:bg-blue-600/5 transition-all">
                  <Upload className="text-slate-500" />
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest text-center">{file ? file.name : "Upload File Word"}</span>
                  <input type="file" accept=".docx" onChange={(e) => setFile(e.target.files[0])} className="hidden" id="pretestUpload" />
              </label>
              <button onClick={handleUpload} disabled={isLoading} className="w-full py-5 rounded-[24px] font-black text-[10px] uppercase tracking-[0.3em] bg-white text-slate-950 hover:bg-blue-600 hover:text-white transition-all shadow-xl disabled:opacity-50">
                {isLoading ? "Analyzing..." : "Generate Preview"}
              </button>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Preview Area */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center px-4">
            <h3 className="text-[12px] font-black uppercase tracking-[0.2em] text-slate-500 italic">Pratinjau Hasil ({questions.length})</h3>
          </div>

          {questions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-40 bg-slate-900/10 border-2 border-dashed border-slate-900 rounded-[56px] text-slate-800">
              <FileText size={80} className="mb-6 opacity-5" />
              <p className="font-black uppercase tracking-[0.4em] text-[10px]">Belum ada soal terdeteksi</p>
            </div>
          ) : (
            questions.map((q, i) => {
              const lines = q.questionText.split("\n").filter(l => l.trim() !== "");
              
              return (
                <div key={i} className="bg-slate-900/40 border border-slate-800 p-10 rounded-[48px] relative hover:border-slate-700 transition-all mb-6">
                  
                  <div className="flex justify-between items-center mb-8">
                    <span className="bg-blue-600 text-white text-[10px] font-black px-5 py-2 rounded-xl uppercase tracking-widest italic shadow-lg">
                       Soal #{i + 1}
                    </span>
                  </div>

                  <div className="mb-10 flex flex-col gap-2">
                    {lines.map((line, idx) => (
                      <p 
                        key={idx} 
                        className={`text-lg leading-relaxed tracking-tight ${
                          idx === 0 || idx === lines.length - 1 
                          ? "text-blue-300 font-bold" 
                          : "text-slate-200 font-medium ml-1"
                        }`}
                      >
                        {line}
                      </p>
                    ))}
                  </div>
                  
                  {q.question_image && (
                    <div className="mb-8 rounded-2xl overflow-hidden border-2 border-slate-800 bg-black/20 inline-block shadow-2xl">
                      <img src={q.question_image} className="max-h-80 w-auto object-contain" alt="Visual" />
                    </div>
                  )}
                  
                  <label className="mb-8 flex items-center gap-3 bg-slate-950 border border-slate-800 px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest text-slate-500 cursor-pointer hover:text-blue-400 transition-all w-fit shadow-lg">
                    <ImageIcon size={16} /> {q.question_image ? "Ganti Gambar Soal" : "Tambah Gambar Soal"}
                    <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, "question", i)} />
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {q.options.map((opt, j) => (
                      <div key={j} className={`p-6 rounded-[32px] border-2 flex flex-col gap-4 transition-all ${opt.label === q.answer ? "bg-green-500/5 border-green-500/30 shadow-inner" : "bg-slate-950 border-slate-900"}`}>
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex gap-4 text-sm font-bold items-center">
                            <span className={`h-8 w-8 shrink-0 rounded-lg flex items-center justify-center font-black ${opt.label === q.answer ? "bg-green-500 text-white" : "bg-slate-800 text-slate-700"}`}>
                              {opt.label}
                            </span>
                            <span className={`leading-relaxed whitespace-pre-line ${opt.label === q.answer ? "text-green-400" : "text-slate-400"}`}>{opt.text}</span>
                          </div>
                          <label className="cursor-pointer text-slate-700 hover:text-blue-500 p-2 bg-slate-900 rounded-xl block hover:scale-110 transition-all group relative">
                            <ImageIcon size={18} />
                            <input type="file" className="hidden" onChange={(e) => handleImageUpload(e, "option", i, j)} />
                            <div className="absolute right-0 bottom-full mb-2 hidden group-hover:block bg-blue-600 text-white text-[8px] px-2 py-1 rounded whitespace-nowrap z-10">Opsi Gambar</div>
                          </label>
                        </div>
                        {opt.option_image && <img src={opt.option_image} className="rounded-xl border border-slate-800 mt-2 w-full object-cover" alt="Opsi" />}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}