"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  FileText, Save, Plus, Trash2, Code, 
  BrainCircuit, MessageSquareQuote, X, Target 
} from "lucide-react";
import { api } from "@/lib/api";
import MarkdownEditor from "@/components/teacher/MarkdownEditor";

export default function StepMateri({ modules, initialMateri = null }) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [materiMap, setMateriMap] = useState({});
  const lastItemRef = useRef(null);
  const [shouldScroll, setShouldScroll] = useState(false);

  useEffect(() => {
    if (initialMateri) {
      const newMap = {};
      initialMateri.forEach(m => {
        if (!newMap[m.module_id]) newMap[m.module_id] = [];
        newMap[m.module_id].push({
          ...m,
          tempId: m.id,
          has_assignment: !!m.assignment,
          assignment_type: m.assignment ? m.assignment.type : "flowchart",
          assignment_instruction: m.assignment ? m.assignment.instruction : "",
          starter_code: m.assignment ? m.assignment.starter_code : "",
          has_reflection: m.has_reflection || false,
          reflection_question: m.reflection_question || "",
          // ✅ SINKRONISASI: Ambil data learning_objectives dari DB
          learning_objectives: m.learning_objectives || []
        });
      });
      setMateriMap(newMap);
    }
  }, [initialMateri]);

  const addNewMateriRow = (moduleId) => {
    const currentMateri = materiMap[moduleId] || [];
    setShouldScroll(true);
    setMateriMap({
      ...materiMap,
      [moduleId]: [
        ...currentMateri,
        { 
            tempId: Date.now(), 
            isNew: true, 
            title: "", 
            type: "text", 
            content: "", 
            video_url: "", 
            has_assignment: false, 
            assignment_type: "flowchart",
            assignment_instruction: "",
            starter_code: "",
            has_reflection: false,
            reflection_question: "",
            // ✅ INISIALISASI: Poin tujuan kosong untuk materi baru
            learning_objectives: [""]
        }
      ]
    });
  };

  useEffect(() => {
    if (shouldScroll && lastItemRef.current) {
      lastItemRef.current.scrollIntoView({ behavior: "smooth", block: "center" });
      setShouldScroll(false);
    }
  }, [materiMap, shouldScroll]);

  const handleMateriChange = (moduleId, tempId, field, value) => {
    setMateriMap((prevMap) => {
      const currentMateriList = prevMap[moduleId] || [];
      const updatedList = currentMateriList.map((m) =>
        m.tempId === tempId ? { ...m, [field]: value } : m
      );
      return { ...prevMap, [moduleId]: updatedList };
    });
  };

  // ✅ LOGIKA BARU: Kelola array Tujuan Pembelajaran
  const handleObjectiveChange = (moduleId, tempId, objIndex, value) => {
    setMateriMap((prevMap) => {
      const currentMateriList = prevMap[moduleId] || [];
      const updatedList = currentMateriList.map((m) => {
        if (m.tempId === tempId) {
          const newObjectives = [...(m.learning_objectives || [])];
          newObjectives[objIndex] = value;
          return { ...m, learning_objectives: newObjectives };
        }
        return m;
      });
      return { ...prevMap, [moduleId]: updatedList };
    });
  };

  const addObjectiveRow = (moduleId, tempId) => {
    setMateriMap((prevMap) => {
      const currentMateriList = prevMap[moduleId] || [];
      const updatedList = currentMateriList.map((m) => {
        if (m.tempId === tempId) {
          return { ...m, learning_objectives: [...(m.learning_objectives || []), ""] };
        }
        return m;
      });
      return { ...prevMap, [moduleId]: updatedList };
    });
  };

  const removeObjectiveRow = (moduleId, tempId, objIndex) => {
    setMateriMap((prevMap) => {
      const currentMateriList = prevMap[moduleId] || [];
      const updatedList = currentMateriList.map((m) => {
        if (m.tempId === tempId) {
          const filtered = m.learning_objectives.filter((_, i) => i !== objIndex);
          return { ...m, learning_objectives: filtered };
        }
        return m;
      });
      return { ...prevMap, [moduleId]: updatedList };
    });
  };

  const removeMateriRow = (moduleId, tempId) => {
    if(confirm("Hapus materi ini?")) {
      const filtered = materiMap[moduleId].filter((m) => m.tempId !== tempId);
      setMateriMap({ ...materiMap, [moduleId]: filtered });
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      for (let module of modules) {
        const daftarMateri = materiMap[module.id] || [];
        for (let [index, item] of daftarMateri.entries()) {
          if (!item.title) continue;

          const materiPayload = {
            module_id: module.id,
            title: item.title,
            type: item.type,
            content: item.content,
            video_url: item.video_url,
            order_number: index + 1,
            has_reflection: item.has_reflection,
            reflection_question: item.reflection_question,
            // ✅ PAYLOAD: Kirim array tujuan pembelajaran ke backend
            learning_objectives: (item.learning_objectives || []).filter(o => o.trim() !== "")
          };

          let resMateri;
          if (item.isNew || !item.id) {
            resMateri = await api.post("/api/teacher/materi", materiPayload);
          } else {
            resMateri = await api.put(`/api/teacher/materi/${item.id}`, materiPayload);
          }

          const savedData = resMateri.data?.data || resMateri.data;
          const materiId = item.id || savedData.id;

          if (item.has_assignment && materiId) {
            await api.post("/api/teacher/assignments/upsert", {
              materi_id: materiId,
              instruction: item.assignment_instruction,
              type: item.assignment_type,
              starter_code: item.starter_code || ""
            });
          } else if (!item.isNew && item.id) {
            await api.delete(`/api/teacher/assignments/${materiId}`);
          }
        }
      }

      alert("🎉 Materi & tugas berhasil disimpan!");
      window.location.href = "/teacher/courses";
    } catch (err) {
      console.error("Submit Error:", err);
      const msg = err.response?.data?.error || err.message;
      alert("Terjadi kesalahan: " + msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-slate-900 p-8 rounded-[40px] border border-slate-800 shadow-2xl font-sans animate-in fade-in duration-500">
      <div className="mb-10">
        <h2 className="text-3xl font-black text-white flex items-center gap-4 italic tracking-tighter uppercase">
          <FileText className="text-blue-500" size={32} /> Manajemen Konten
        </h2>
        <p className="text-sm text-slate-500 font-medium mt-1">Susun materi belajar, sesi refleksi, dan tantangan praktek.</p>
      </div>

      <div className="space-y-12">
        {modules.map((module, idx) => (
          <div key={module.id || idx} className="bg-slate-800/20 border border-slate-700/50 p-8 rounded-[38px] relative overflow-hidden transition-all">
            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600"></div>
            
            <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-600 text-white w-10 h-10 rounded-2xl flex items-center justify-center font-black italic shadow-lg shadow-blue-900/40">
                  {idx + 1}
                </div>
                <h3 className="font-black text-white text-xl uppercase tracking-tight italic">{module.title}</h3>
              </div>
              <button onClick={() => addNewMateriRow(module.id)} className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-[20px] text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-all active:scale-95 shadow-xl shadow-blue-900/20">
                <Plus size={18} /> Tambah Materi
              </button>
            </div>

            <div className="space-y-8">
              {(materiMap[module.id] || []).map((m, mIdx) => (
                <div key={m.tempId} ref={mIdx === (materiMap[module.id].length - 1) ? lastItemRef : null} className="bg-slate-950/40 p-8 rounded-[32px] border border-slate-800/60 relative group animate-in slide-in-from-bottom-4 transition-all hover:border-blue-500/30">
                  
                  <button onClick={() => removeMateriRow(module.id, m.tempId)} className="absolute top-6 right-6 bg-red-600/10 text-red-500 hover:bg-red-600 hover:text-white p-2.5 rounded-2xl transition-all z-10 border border-red-500/20">
                    <Trash2 size={18} />
                  </button>

                  <div className="flex flex-col gap-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Judul Materi</label>
                        <input placeholder="Contoh: Dasar-dasar Percabangan IF" className="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl text-white outline-none focus:border-blue-500 font-bold text-base transition-all" value={m.title} onChange={(e) => handleMateriChange(module.id, m.tempId, "title", e.target.value)} />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Tipe Media</label>
                        <select className="w-full bg-slate-900 border border-slate-700 p-4 rounded-2xl text-white outline-none text-sm font-bold cursor-pointer focus:border-blue-500 transition-all" value={m.type} onChange={(e) => handleMateriChange(module.id, m.tempId, "type", e.target.value)}>
                          <option value="text">Normal Teks</option>
                          <option value="video">Media Pembelajaran</option>
                        </select>
                      </div>
                    </div>

                    {m.type === "video" && (
                      <div className="space-y-2 animate-in slide-in-from-top-2">
                        <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em] ml-1">URL Media</label>
                        <input placeholder="https://www.youtube.com/watch?v=..." className="w-full bg-slate-900 border border-blue-500/30 p-4 rounded-2xl text-white outline-none focus:border-blue-500 text-sm" value={m.video_url} onChange={(e) => handleMateriChange(module.id, m.tempId, "video_url", e.target.value)} />
                      </div>
                    )}

                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                        Isi Materi Pembelajaran <span className="text-blue-500 font-medium normal-case tracking-normal italic">(Markdown Editor)</span>
                      </label>
                      <MarkdownEditor 
                        value={m.content} 
                        onChange={(val) => handleMateriChange(module.id, m.tempId, "content", val)} 
                      />
                    </div>

                    {/* ✅ SECTION BARU: Tujuan Pembelajaran (Self-Assessment) */}
                    <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-[32px] space-y-4">
                        <div className="flex items-center gap-3 mb-2">
                             <Target size={20} className="text-blue-500" />
                             <label className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Tujuan Pembelajaran / Indikator Capaian</label>
                        </div>
                        
                        <div className="space-y-3">
                            {(m.learning_objectives || []).map((obj, oIdx) => (
                                <div key={oIdx} className="flex gap-3 animate-in fade-in slide-in-from-left-2 duration-300">
                                    <input 
                                        type="text" 
                                        placeholder="Contoh: Siswa mampu mendefinisikan variabel dengan benar" 
                                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-5 py-3 text-sm text-slate-200 outline-none focus:border-blue-500 transition-all"
                                        value={obj}
                                        onChange={(e) => handleObjectiveChange(module.id, m.tempId, oIdx, e.target.value)}
                                    />
                                    <button 
                                        onClick={() => removeObjectiveRow(module.id, m.tempId, oIdx)}
                                        className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition-all"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <button 
                            onClick={() => addObjectiveRow(module.id, m.tempId)}
                            className="mt-4 w-full py-3 border-2 border-dashed border-slate-800 rounded-xl text-slate-600 hover:text-blue-500 hover:border-blue-500/40 transition-all font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2"
                        >
                            <Plus size={14} /> Tambah Indikator Tujuan
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6 border-t border-slate-800/50">
                      <div className={`p-6 rounded-[28px] border transition-all ${m.has_reflection ? "bg-purple-600/5 border-purple-500/40 shadow-inner" : "bg-slate-900/30 border-slate-800"}`}>
                        <div className="flex items-center gap-4 mb-4">
                          <input type="checkbox" id={`reflect-${m.tempId}`} checked={m.has_reflection} onChange={(e) => handleMateriChange(module.id, m.tempId, "has_reflection", e.target.checked)} className="w-6 h-6 accent-purple-500 cursor-pointer" />
                          <label htmlFor={`reflect-${m.tempId}`} className="flex flex-col cursor-pointer">
                            <span className={`text-xs font-black uppercase tracking-widest ${m.has_reflection ? "text-purple-400" : "text-slate-500"}`}>Aktifkan Kotak Refleksi</span>
                            <span className="text-[10px] text-slate-600 font-medium italic">Siswa akan diminta menuliskan pemahaman mereka.</span>
                          </label>
                        </div>
                        {m.has_reflection && (
                          <input placeholder="Tulis instruksi refleksi..." className="w-full bg-slate-950 border border-purple-500/20 p-4 rounded-xl text-white text-sm outline-none focus:border-purple-500 animate-in zoom-in-95" value={m.reflection_question || ""} onChange={(e) => handleMateriChange(module.id, m.tempId, "reflection_question", e.target.value)} />
                        )}
                      </div>

                      <div className={`p-6 rounded-[28px] border transition-all ${m.has_assignment ? "bg-blue-600/5 border-blue-500/40 shadow-inner" : "bg-slate-900/30 border-slate-800"}`}>
                         <div className="flex items-center justify-between mb-4">
                            <span className={`text-xs font-black uppercase tracking-widest ${m.has_assignment ? "text-blue-400" : "text-slate-500"}`}>Aktivitas Tugas</span>
                            <select className="bg-slate-800 text-[10px] border border-slate-700 rounded-xl px-4 py-2 outline-none text-white font-black cursor-pointer uppercase tracking-tighter" value={m.has_assignment ? (m.assignment_type || 'flowchart') : 'none'} onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'none') {
                                    handleMateriChange(module.id, m.tempId, "has_assignment", false);
                                } else {
                                    handleMateriChange(module.id, m.tempId, "has_assignment", true);
                                    handleMateriChange(module.id, m.tempId, "assignment_type", val);
                                }
                            }}>
                                <option value="none">🚫 Tanpa Tugas</option>
                                <option value="flowchart">📐 Pembuatan Flowchart</option>
                                <option value="code">💻 Pemrograman (C Code)</option>
                            </select>
                         </div>
                         {m.has_assignment && (
                            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                                <textarea placeholder={`Tulis instruksi pengerjaan tugas ${m.assignment_type}...`} className="w-full bg-slate-950 border border-blue-500/20 p-4 rounded-xl text-white text-sm h-24 outline-none focus:border-blue-500 resize-none" value={m.assignment_instruction} onChange={(e) => handleMateriChange(module.id, m.tempId, "assignment_instruction", e.target.value)} />
                                {m.assignment_type === 'code' && (
                                    <textarea placeholder="// Tuliskan starter code untuk membantu siswa..." className="w-full bg-slate-950 border border-slate-800 p-4 rounded-xl text-blue-400 font-mono text-[10px] h-20 outline-none resize-none italic" value={m.starter_code || ""} onChange={(e) => handleMateriChange(module.id, m.tempId, "starter_code", e.target.value)} />
                                )}
                            </div>
                         )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-16 flex justify-end">
        <button onClick={handleSubmit} disabled={isSubmitting} className="bg-green-600 hover:bg-green-500 text-white font-black px-16 py-6 rounded-[28px] shadow-2xl shadow-green-950/40 flex gap-4 disabled:opacity-50 transition-all active:scale-95 uppercase text-sm tracking-[0.3em] items-center">
          {isSubmitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <Save size={24} />} 
          {isSubmitting ? "Processing..." : "Simpan Materi"}
        </button>
      </div>
    </div>
  );
}