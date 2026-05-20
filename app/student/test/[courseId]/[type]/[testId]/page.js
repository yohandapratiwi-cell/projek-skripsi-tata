"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  Loader2, Send, ArrowRight, CheckCircle2, 
  ClipboardCheck, ChevronRight, ChevronLeft, Award 
} from "lucide-react";
// ✅ SINKRONISASI: Menggunakan instance api (Axios) agar cookie & baseURL online terbawa
import { api } from "@/lib/api";

export default function TestPage() {
  const params = useParams();
  const router = useRouter();
  
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0); 
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFinished, setIsFinished] = useState(false);

  const isPostTest = params.type === 'posttest';
  const themeColor = isPostTest ? "bg-orange-600" : "bg-blue-600";
  const themeText = isPostTest ? "text-white" : "text-white";
  const themeBorder = isPostTest ? "border-orange-500/50" : "border-blue-500/50";

  const STORAGE_KEY = `test_progress_${params.testId}`;

  useEffect(() => {
    const fetchTestData = async () => {
      setLoading(true); 
      try {
        // ✅ PERBAIKAN: Gunakan rute /api/student/...
        const res = await api.get(`/api/student/test-data/${params.testId}`);
        const data = res.data; 
        setQuestions(Array.isArray(data) ? data : []);
  
        const savedProgress = localStorage.getItem(STORAGE_KEY);
        if (savedProgress) {
          const parsedProgress = JSON.parse(savedProgress);
          setAnswers(parsedProgress);
        }
      } catch (err) {
        console.error("Gagal load data:", err);
        alert("Gagal memuat soal. Silakan refresh halaman.");
      } finally {
        setLoading(false);
      }
    };
    if (params.testId) fetchTestData();
  }, [params.testId, STORAGE_KEY]);

  const handleSelectOption = (qId, label) => {
    if (isFinished) return;
    const newAnswers = { ...answers, [qId]: label };
    setAnswers(newAnswers);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAnswers));
  };

  const handleSubmit = async () => {
    const answeredCount = Object.keys(answers).length;
    const totalQuestions = questions.length;

    if (answeredCount < totalQuestions) {
      const firstEmptyIndex = questions.findIndex(q => !answers[q.id]);
      alert(`Maaf, Anda belum menyelesaikan semua soal. (${answeredCount}/${totalQuestions} terjawab). Silakan lengkapi jawaban Anda.`);
      if (firstEmptyIndex !== -1) {
        setCurrentIndex(firstEmptyIndex);
      }
      return; 
    }

    setIsSubmitting(true);
    try {
      // ✅ PERBAIKAN: Gunakan api.post menuju rute yang benar
      const res = await api.post("/api/student/submit-test", {
        test_id: params.testId,
        course_id: params.courseId,
        test_type: params.type,
        answers: answers
      });

      if (res.status === 200 || res.status === 201) {
        setIsFinished(true);
        localStorage.removeItem(STORAGE_KEY); 
      } else {
        alert("Gagal mengirim jawaban. Silakan coba lagi.");
      }
    } catch (err) {
      alert("Gagal mengirim hasil tes. Periksa koneksi Anda.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = async () => {
    if (isPostTest) {
      router.push(`/student/courses`); 
      return;
    }
    setLoading(true);
    try {
      // ✅ PERBAIKAN: Gunakan prefix /api/courses/courses-full
      const res = await api.get("/api/courses/courses-full");
      const allData = res.data?.data || res.data || [];
      const currentCourse = allData.find(c => Number(c.id) === Number(params.courseId));
      
      // Ambil materi pertama dari modul pertama
      const firstMateriId = currentCourse?.modules?.[0]?.materi?.[0]?.id;

      if (firstMateriId) {
        router.push(`/student/courses/${params.courseId}/materi/${firstMateriId}`);
      } else {
        router.push(`/student/courses/${params.courseId}`);
      }
    } catch (err) {
      console.error("Gagal mendapatkan data materi:", err);
      router.push(`/student/courses/${params.courseId}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 999999, backgroundColor: '#020617', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: isPostTest ? '#f59e0b' : '#3b82f6' }}>
      <Loader2 className="animate-spin mb-4" size={32} />
      <p className="uppercase tracking-[0.3em] text-[10px] font-black italic">Syncing Soal...</p>
    </div>
  );

  const currentQ = questions[currentIndex];

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 9999999, backgroundColor: '#020617', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* HEADER BAR */}
      <nav className="shrink-0 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 px-10 py-5 shadow-2xl z-[10001]">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-5">
            <div className={`${themeColor} p-2.5 rounded-2xl shadow-lg shadow-black/50`}>
              {isPostTest ? <Award size={24} className="text-white" /> : <ClipboardCheck size={24} className="text-white" />}
            </div>
            <h2 className="text-2xl font-black text-white uppercase italic tracking-tighter">{params.type}</h2>
          </div>

          <div className="flex items-center gap-6">
             <div className="hidden lg:flex items-center gap-2 px-4 border-l border-slate-800 ml-4">
             {questions.map((_, idx) => (
                <button 
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-9 h-9 shrink-0 rounded-xl text-[11px] font-black transition-all border ${
                    currentIndex === idx 
                      ? `${themeColor} border-white/20 text-white shadow-lg` 
                      : answers[questions[idx].id] 
                        ? "bg-green-500/20 border-green-500/50 text-green-500" 
                        : "bg-slate-800 border-slate-700 text-slate-500" 
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
             </div>
          </div>
        </div>
      </nav>

      {/* CONTENT AREA */}
      <div className="flex-1 overflow-y-auto bg-slate-950 scroll-smooth">
        <main className="max-w-4xl mx-auto py-12 px-6">
          {currentQ && (
            <div className="animate-in fade-in slide-in-from-bottom-8 duration-500">
              <div className="bg-slate-900/40 border border-slate-800 p-8 md:p-12 rounded-[48px] backdrop-blur-md mb-8 shadow-2xl">
                <div className="flex items-start gap-8">
                  <div className={`h-14 w-14 shrink-0 ${themeColor} text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-xl`}>
                    {currentIndex + 1}
                  </div>
                  <div className="flex-1">
                    
                    <div className="mb-10 flex flex-col gap-2">
                      {(() => {
                        const lines = (currentQ.question_text || "").split("\n").filter(l => l.trim() !== "");
                        const totalLines = lines.length;
                        return lines.map((line, idx) => (
                          <h3 
                            key={idx} 
                            className={`text-xl md:text-lg leading-relaxed tracking-tight ${
                              idx === 0 || idx === totalLines - 1 
                                ? "text-white font-bold" 
                                : "text-white font-medium opacity-90 ml-1"
                            }`}
                          >
                            {line}
                          </h3>
                        ));
                      })()}
                    </div>

                    {currentQ.question_image && (
                      <div className="mb-6 flex justify-center">
                        <div className="overflow-hidden">
                          <img 
                            src={currentQ.question_image} 
                            alt="Visual Soal"
                            className="w-44 h-auto mb-6 rounded-xl" 
                          />
                        </div>
                      </div>
                    )}

                    <div className="grid grid-cols-1 gap-5">
                      {currentQ.options?.map((opt, idx) => {
                        const label = opt.option_label || opt.label;
                        const text = opt.option_text || opt.text;
                        const image = opt.option_image;

                        return (
                          <button
                            key={idx}
                            onClick={() => handleSelectOption(currentQ.id, label)}
                            className={`group flex flex-col p-5 rounded-[32px] border-2 transition-all duration-300 text-left relative overflow-hidden ${
                              answers[currentQ.id] === label 
                              ? `${themeColor} ${themeBorder} text-white shadow-2xl scale-[1.02] z-10` 
                              : "bg-slate-900/50 border-slate-800/80 text-slate-400 hover:border-slate-600 hover:bg-slate-800/80 hover:-translate-y-1"
                            }`}
                          >
                            <div className="flex items-center w-full">
                              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-lg shrink-0 transition-all duration-300 ${
                                answers[currentQ.id] === label 
                                ? "bg-white text-blue-600 shadow-inner" 
                                : "bg-slate-800 text-slate-500 group-hover:text-slate-300 group-hover:bg-slate-700"
                              }`}>
                                {label}
                              </div>

                              <span className={`ml-10 text-base md:text-lg font-semibold leading-snug transition-colors ${
                                   answers[currentQ.id] === label ? "text-white" : "text-slate-300 group-hover:text-white"
                              }`}>
                                {text}
                              </span>
                            </div>

                            {image && (
                              <div className="mt-5 ml-22 rounded-2xl overflow-hidden border-2 border-slate-800 bg-slate-950 shadow-lg inline-block self-start">
                                <img 
                                  src={image.startsWith('http') ? image : `https://projek-skripsi-tata-backend.vercel.app/uploads/${image}`} 
                                  alt={`Opsi ${label}`} 
                                  className="max-h-48 w-40 object-contain"
                                  onError={(e) => { e.target.style.display = 'none'; }} 
                                />
                              </div>
                            )}

                            {answers[currentQ.id] === label && (
                              <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent pointer-events-none"></div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8 flex justify-between items-center bg-slate-900/50 p-6 rounded-[32px] border border-slate-800/50 backdrop-blur-sm">
            <button 
              disabled={currentIndex === 0}
              onClick={() => setCurrentIndex(prev => prev - 1)}
              className="flex items-center gap-3 px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-slate-500 hover:text-white disabled:opacity-20 transition-all group"
            >
              <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" /> Sebelumnya
            </button>

            {currentIndex < questions.length - 1 ? (
              <button 
                onClick={() => setCurrentIndex(prev => prev + 1)}
                className={`flex items-center gap-4 ${themeColor} hover:opacity-90 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg group shadow-black/40`}
              >
                Selanjutnya <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>
            ) : (
              <button 
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-500 text-white px-12 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all shadow-lg shadow-green-900/40"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <Send size={18} />} Selesai
              </button>
            )}
          </div>
        </main>
      </div>

      {isFinished && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/90 backdrop-blur-lg flex items-center justify-center p-8 animate-in fade-in duration-300">
          <div className="relative text-center bg-slate-900 border border-slate-800/80 p-14 rounded-[56px] shadow-[0_0_100px_rgba(0,0,0,0.9)] max-w-lg w-full overflow-hidden group animate-in zoom-in-95 duration-500">
            <div className="absolute -top-20 -right-20 w-60 h-60 bg-green-500/10 blur-[100px] rounded-full"></div>
            <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-blue-500/10 blur-[100px] rounded-full"></div>

            <div className="relative z-10 inline-flex items-center justify-center mb-10">
              <div className="relative bg-gradient-to-b from-green-400 to-green-600 text-white p-7 rounded-full inline-flex items-center justify-center border-4 border-slate-900 shadow-[0_0_50px_rgba(34,197,94,0.3)] group-hover:scale-105 transition-transform duration-500">
                <CheckCircle2 size={72} strokeWidth={3} />
              </div>
            </div>

            <h4 className="relative z-10 text-4xl font-black text-white uppercase italic tracking-tighter mb-5 drop-shadow-sm select-none">
              Success <span className="text-green-500">!</span>
            </h4>

            <p className="relative z-10 text-slate-400 text-base font-medium mb-12 leading-relaxed px-4 select-none">
              {isPostTest
                ? "Ujian Akhir berhasil diselesaikan! Pencapaian Anda telah tercatat dalam sistem."
                : "Pre-test berhasil dikirim. Sekarang Anda bisa mengakses materi pembelajaran!"}
            </p>

            <button
              onClick={handleFinish}
              className="relative z-10 w-full bg-gradient-to-r from-green-600 to-green-500 hover:from-green-500 hover:to-green-400 text-white py-5 rounded-[28px] font-black text-xs uppercase tracking-[0.4em] flex items-center justify-center gap-4 transition-all duration-300 shadow-xl shadow-green-950/30 active:scale-95 group/btn"
            >
              <span className="relative flex items-center justify-center gap-4">
                {isPostTest ? "Selesai & Keluar" : "Masuk ke Materi"}
                <ArrowRight size={20} className="group-hover/btn:translate-x-2 transition-transform duration-300" strokeWidth={3} />
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}