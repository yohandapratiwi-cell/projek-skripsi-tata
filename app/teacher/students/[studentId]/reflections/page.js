"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { 
  ArrowLeft, MessageSquare, BookOpen, Loader2, XCircle, FileText, Send, Save
} from "lucide-react";

export default function StudentReflections() {
  const params = useParams();
  const studentId = params.studentId;
  const router = useRouter();
  
  const [reflections, setReflections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ✅ STATE BARU: Menyimpan teks feedback guru berdasarkan submission_id
  const [feedbacks, setFeedbacks] = useState({});
  const [submittingId, setSubmittingId] = useState(null);

  const fetchReflections = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/teacher/reflections/${studentId}`);
      if (res.data && res.data.status === "success") {
        const data = res.data.data || [];
        setReflections(data);
        
        // ✅ AUTOMATIC RESTORE: Mengisi teks lama dari database ke dalam form input guru
        const initialFeedbacks = {};
        data.forEach(item => {
          initialFeedbacks[item.submission_id] = item.teacher_feedback || "";
        });
        setFeedbacks(initialFeedbacks);
      } else {
        setError("Data tidak ditemukan atau format salah");
      }
    } catch (err) {
      setError(err.response?.data?.error || "Gagal menghubungi server");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (studentId) fetchReflections();
  }, [studentId]);

  // ✅ HANDLER BARU: Aksi mengirim data umpan balik ke backend murni lewat submissionId
  const handleSendFeedback = async (submissionId) => {
    const textToSend = feedbacks[submissionId]?.trim();
    if (!textToSend) return alert("Harap isi teks umpan balik sebelum mengirim!");

    try {
      setSubmittingId(submissionId);
      const res = await api.put(`/api/teacher/reflections/feedback/${submissionId}`, {
        feedback: textToSend
      });

      if (res.data && res.data.status === "success") {
        alert("🎉 Umpan balik berhasil disimpan!");
        fetchReflections(); // Refresh data tampilan
      }
    } catch (err) {
      alert(err.response?.data?.error || "Gagal mengirim umpan balik");
    } finally {
      setSubmittingId(null);
    }
  };

  const handleFeedbackChange = (submissionId, value) => {
    setFeedbacks(prev => ({
      ...prev,
      [submissionId]: value
    }));
  };

  if (loading) return (
    <div className="h-screen bg-slate-950 flex flex-col items-center justify-center text-purple-500">
      <Loader2 className="animate-spin mb-4" size={48} />
      <p className="uppercase tracking-[0.3em] text-xs font-black italic text-white">Loading Student Responses...</p>
    </div>
  );

  if (error) return (
    <div className="h-screen bg-slate-950 flex flex-col items-center justify-center p-8 text-center">
      <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-[40px] max-w-md">
        <XCircle size={48} className="text-red-500 mx-auto mb-4" />
        <h2 className="text-xl font-black text-white uppercase mb-2">Fetch Failed</h2>
        <p className="text-slate-500 text-sm mb-6">{error}</p>
        <button onClick={() => router.back()} className="bg-slate-800 text-white px-8 py-3 rounded-2xl font-bold text-xs uppercase">Kembali</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8 custom-scrollbar">
      {/* HEADER */}
      <div className="flex items-center justify-between mb-12">
        <button onClick={() => router.back()} className="p-4 bg-slate-900 border border-slate-800 rounded-3xl hover:bg-slate-800 transition-all text-slate-400 hover:text-white">
          <ArrowLeft size={24} />
        </button>
        <div className="text-right">
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">Student Reflection Logs</h1>
          <p className="text-purple-500 text-xs font-black uppercase tracking-[0.2em]">Qualitative Feedback Review</p>
        </div>
      </div>

      {/* DETAILED REFLECTION BREAKDOWN */}
      <div className="space-y-6">
        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-slate-500 mb-6 flex items-center gap-3">
           <MessageSquare size={16} /> Detailed Reflection Breakdown
        </h3>
        
        {reflections.length > 0 ? (
          reflections.map((item) => (
            <div key={item.submission_id} className="bg-slate-900/50 border border-slate-800 p-8 rounded-[48px] hover:border-purple-500/30 transition-all group shadow-xl">
              
              {/* Bagian Judul Bab */}
              <div className="flex flex-col md:flex-row justify-between gap-6 mb-6">
                <div className="flex-1">
                  <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest italic flex items-center gap-2 mb-2">
                    <BookOpen size={12} /> {item.module_title}
                  </span>
                  <h4 className="text-2xl font-black text-white uppercase tracking-tight italic">{item.materi_title}</h4>
                </div>
                <div className="text-right">
                  <span className="px-4 py-1.5 bg-slate-950 text-slate-500 border border-slate-800 rounded-full text-[9px] font-black uppercase tracking-widest block">
                    Submitted Logs
                  </span>
                </div>
              </div>

              {/* Box Wadah Teks Respon Siswa */}
              <div className="bg-slate-950/70 p-6 rounded-[32px] border border-slate-850 relative overflow-hidden group-hover:border-purple-500/10 transition-all mb-6">
                <div className="absolute right-6 top-6 text-slate-900 pointer-events-none">
                  <FileText size={40} />
                </div>
                <p className="text-[9px] font-black uppercase text-purple-500/60 mb-3 tracking-widest italic flex items-center gap-1">
                  Respon Refleksi Siswa:
                </p>
                <p className="text-sm text-slate-300 font-medium leading-relaxed italic">
                  "{item.reflection}"
                </p>
              </div>

              {/* ✅ COMPONENT BARU: Form Input Umpan Balik Guru Berdesain Cyberpunk-Dark */}
              <div className="mt-6 pt-6 border-t border-slate-800/60 flex flex-col gap-3">
                <label className="text-[9px] font-black uppercase text-blue-500 tracking-widest italic">
                  Berikan Tanggapan / Umpan Balik Guru:
                </label>
                <div className="relative">
                  <textarea
                    value={feedbacks[item.submission_id] || ""}
                    onChange={(e) => handleFeedbackChange(item.submission_id, e.target.value)}
                    placeholder="Tulis koreksi, apresiasi, atau penguatan konsep di sini..."
                    className="w-full bg-slate-950/40 border border-slate-800 p-5 rounded-2xl text-slate-300 text-xs font-medium h-24 outline-none focus:border-blue-500/50 transition-all custom-scrollbar resize-none placeholder:text-slate-700 placeholder:italic"
                  />
                  <div className="absolute bottom-4 right-4">
                    <button
                      onClick={() => handleSendFeedback(item.submission_id)}
                      disabled={submittingId === item.submission_id}
                      className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95 shadow-md disabled:opacity-50"
                    >
                      {submittingId === item.submission_id ? (
                        <Loader2 className="animate-spin" size={12} />
                      ) : item.teacher_feedback ? (
                        <Save size={12} />
                      ) : (
                        <Send size={12} />
                      )}
                      {item.teacher_feedback ? "Perbarui" : "Kirim Respon"}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          ))
        ) : (
          <div className="p-20 text-center bg-slate-900/30 rounded-[40px] border border-dashed border-slate-800">
             <p className="text-slate-600 font-black uppercase tracking-widest text-[10px]">No reflection responses submitted by this student yet</p>
          </div>
        )}
      </div>
    </div>
  );
}