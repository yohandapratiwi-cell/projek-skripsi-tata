"use client";

import { useEffect, useState } from "react";
import CreateCoursePage from "./create/page"; 
import { 
  Plus, ChevronLeft, Trash2, Edit3, FileText, Package, Save, X, 
  MessageSquareQuote, BookOpen, Target 
} from "lucide-react";
// ✅ PERBAIKAN: Gunakan api (huruf kecil) agar sinkron dengan lib/api.js
import { api } from "@/lib/api";
import { getFullCourses, updateCourse, updateModule, updateMateri, deleteCourse } from "@/app/services/courseService";

export default function CoursePage() {
  const [courses, setCourses] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [expandedCourse, setExpandedCourse] = useState(null);
  const [loading, setLoading] = useState(true); 
  
  // STATE UNTUK EDIT
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editType, setEditType] = useState(""); // 'course', 'module', atau 'materi'
  const [editData, setEditData] = useState(null);

  // STATE KHUSUS TUGAS (ASSIGNMENT)
  const [hasAssignment, setHasAssignment] = useState(false);
  const [assignmentType, setAssignmentType] = useState("flowchart");
  const [assignmentInstruction, setAssignmentInstruction] = useState("");
  const [starterCode, setStarterCode] = useState("");

  // STATE KHUSUS REFLEKSI
  const [hasReflection, setHasReflection] = useState(false);
  const [reflectionQuestion, setReflectionQuestion] = useState("");

  // ✅ STATE KHUSUS TUJUAN PEMBELAJARAN
  const [learningObjectives, setLearningObjectives] = useState([]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await getFullCourses();
      setCourses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  // FUNGSI UNTUK MEMBUKA MODAL EDIT
  const openEditModal = (type, data) => {
    setEditType(type);
    setEditData({ ...data }); 
    
    if (type === "materi") {
      const task = data.assignment;
      setHasAssignment(!!task);
      setAssignmentType(task?.type || "flowchart");
      setAssignmentInstruction(task?.instruction || "");
      setStarterCode(task?.starter_code || "");

      setHasReflection(data.has_reflection || false);
      setReflectionQuestion(data.reflection_question || "");
      
      // ✅ SINKRONISASI: Ambil data tujuan pembelajaran
      setLearningObjectives(data.learning_objectives || []);
    }
    
    setIsModalOpen(true);
  };

  // ✅ FUNGSI MANAJEMEN TUJUAN PEMBELAJARAN (MODAL)
  const handleObjectiveChange = (index, value) => {
    const newObjectives = [...learningObjectives];
    newObjectives[index] = value;
    setLearningObjectives(newObjectives);
  };

  const addObjectiveRow = () => setLearningObjectives([...learningObjectives, ""]);
  
  const removeObjectiveRow = (index) => {
    setLearningObjectives(learningObjectives.filter((_, i) => i !== index));
  };

  // FUNGSI SIMPAN PERUBAHAN
  const handleSaveEdit = async () => {
    try {
      if (editType === "course") {
        await updateCourse(editData.id, editData);
      } else if (editType === "module") {
        const payload = { 
          ...editData, 
          module_order: parseInt(editData.module_order) || 0 
        };
        await updateModule(editData.id, payload);
      } else if (editType === "materi") {
        const payload = { 
          ...editData, 
          order_number: parseInt(editData.order_number) || 0,
          has_reflection: hasReflection,
          reflection_question: reflectionQuestion,
          // ✅ PAYLOAD: Kirim tujuan pembelajaran yang sudah dibersihkan
          learning_objectives: learningObjectives.filter(o => o.trim() !== "")
        };
        await updateMateri(editData.id, payload);

        if (hasAssignment) {
          await api.post("/api/teacher/assignments/upsert", {
            materi_id: editData.id,
            instruction: assignmentInstruction,
            type: assignmentType,
            starter_code: assignmentType === "code" ? starterCode : ""
          });
        } else {
          await api.delete(`/api/teacher/assignments/${editData.id}`).catch(() => {});
        }
      }
      
      alert("✅ Perubahan berhasil disimpan!");
      setIsModalOpen(false);
      fetchCourses(); 
    } catch (error) {
      console.error("Save error:", error);
      const msg = error.response?.data?.error || error.message;
      alert("Gagal menyimpan perubahan: " + msg);
    }
  };

  const handleDelete = async (type, id, name) => {
    const confirmDelete = confirm(`Hapus ${type}: "${name}"?`);
    if (!confirmDelete) return;

    try {
      if (type === 'course') {
        await deleteCourse(id); 
      } else {
        const endpoint = `/api/teacher/${type === 'module' ? 'modules' : 'materi'}/${id}`;
        await api.delete(endpoint);
      }

      alert(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} berhasil dihapus!`);
      fetchCourses(); 
    } catch (error) { 
      const msg = error.response?.data?.error || error.message;
      alert("Error: " + msg); 
    }
  };

  return (
    <div className="flex flex-col gap-6 p-2 min-h-screen bg-slate-950 text-white relative font-sans">
      
      {/* MODAL EDIT UNIVERSAL */}
      {isModalOpen && editData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-[32px] p-8 shadow-2xl animate-in zoom-in-95 duration-200 overflow-y-auto max-h-[90vh] custom-scrollbar">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold uppercase tracking-widest text-blue-400 italic">Edit {editType}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors"><X size={20}/></button>
            </div>

            <div className="space-y-5">
              {editType === "course" && (
                <div className="space-y-4">
                  <input placeholder="Judul Course" className="w-full bg-slate-800 p-3 rounded-xl border border-slate-700 text-sm" value={editData.title || ""} onChange={(e) => setEditData({...editData, title: e.target.value})} />
                  <input placeholder="Pengajar" className="w-full bg-slate-800 p-3 rounded-xl border border-slate-700 text-sm" value={editData.instructor || ""} onChange={(e) => setEditData({...editData, instructor: e.target.value})} />
                  <input placeholder="Thumbnail URL" className="w-full bg-slate-800 p-3 rounded-xl border border-slate-700 text-sm" value={editData.thumbnail || ""} onChange={(e) => setEditData({...editData, thumbnail: e.target.value})} />
                  <textarea placeholder="Deskripsi" className="w-full bg-slate-800 p-3 rounded-xl border border-slate-700 h-24 resize-none text-sm" value={editData.description || ""} onChange={(e) => setEditData({...editData, description: e.target.value})} />
                </div>
              )}

              {editType === "module" && (
                <div className="space-y-4">
                  <input placeholder="Judul Module" className="w-full bg-slate-800 p-3 rounded-xl border border-slate-700 text-sm" value={editData.title || ""} onChange={(e) => setEditData({...editData, title: e.target.value})} />
                  <input type="number" placeholder="Urutan" className="w-full bg-slate-800 p-3 rounded-xl border border-slate-700 text-sm" value={editData.module_order || 0} onChange={(e) => setEditData({...editData, module_order: e.target.value})} />
                </div>
              )}

              {editType === "materi" && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <input placeholder="Judul Materi" className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-sm font-bold" value={editData.title || ""} onChange={(e) => setEditData({...editData, title: e.target.value})} />
                    <input type="number" placeholder="Urutan" className="bg-slate-800 p-3 rounded-xl border border-slate-700 text-sm" value={editData.order_number || 0} onChange={(e) => setEditData({...editData, order_number: e.target.value})} />
                  </div>
                  
                  <select className="w-full bg-slate-800 p-3 rounded-xl border border-slate-700 text-sm" value={editData.type || "text"} onChange={(e) => setEditData({...editData, type: e.target.value})}>
                    <option value="text">Normal Teks</option>
                    <option value="video">Media Pembelajaran</option>
                  </select>

                  <input className="w-full bg-slate-800 p-3 rounded-xl border border-slate-700 text-sm" placeholder="URL Media" value={editData.video_url || ""} onChange={(e) => setEditData({...editData, video_url: e.target.value})} />
                  <textarea className="w-full bg-slate-800 p-4 rounded-xl border border-slate-700 text-sm h-32 resize-none" placeholder="Isi materi..." value={editData.content || ""} onChange={(e) => setEditData({...editData, content: e.target.value})} />

                  {/* ✅ SECTION BARU: Tujuan Pembelajaran di Modal */}
                  <div className="p-5 bg-slate-950/50 border border-slate-800 rounded-3xl space-y-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Target size={18} className="text-blue-500" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-500">Tujuan Pembelajaran</span>
                    </div>
                    <div className="space-y-2">
                      {learningObjectives.map((obj, oIdx) => (
                        <div key={oIdx} className="flex gap-2">
                          <input 
                            className="flex-1 bg-slate-900 border border-slate-800 p-2.5 rounded-xl text-xs text-white outline-none focus:border-blue-500 transition-all"
                            value={obj}
                            onChange={(e) => handleObjectiveChange(oIdx, e.target.value)}
                            placeholder="Contoh: Memahami algoritma..."
                          />
                          <button onClick={() => removeObjectiveRow(oIdx)} className="p-2 text-red-500 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={14}/></button>
                        </div>
                      ))}
                    </div>
                    <button onClick={addObjectiveRow} className="w-full py-2 border border-dashed border-slate-700 rounded-xl text-[9px] font-black uppercase tracking-tighter text-slate-500 hover:text-blue-400 hover:border-blue-400/40 transition-all">+ Tambah Poin Tujuan</button>
                  </div>

                  <div className={`p-4 rounded-2xl border transition-all ${hasReflection ? "bg-purple-600/10 border-purple-500/50" : "bg-slate-900 border-slate-800"}`}>
                    <div className="flex items-center gap-3 mb-3">
                      <input type="checkbox" id="modal-reflect" checked={hasReflection} onChange={(e) => setHasReflection(e.target.checked)} className="w-4 h-4 accent-purple-600 cursor-pointer" />
                      <label htmlFor="modal-reflect" className="flex items-center gap-2 cursor-pointer">
                        <MessageSquareQuote size={18} className={hasReflection ? "text-purple-400" : "text-slate-500"} />
                        <span className={`text-[11px] font-black uppercase ${hasReflection ? "text-purple-400" : "text-slate-500"}`}>Aktifkan Respon Siswa</span>
                      </label>
                    </div>
                    {hasReflection && (
                      <input placeholder="Instruksi respon (Apa pemahamanmu?)" className="w-full bg-slate-950 p-2 rounded-lg border border-purple-500/30 text-xs text-white outline-none" value={reflectionQuestion} onChange={(e) => setReflectionQuestion(e.target.value)} />
                    )}
                  </div>

                  <div className={`p-4 rounded-2xl border transition-all ${hasAssignment ? "bg-blue-600/10 border-blue-500/50" : "bg-slate-900 border-slate-800"}`}>
                    <div className="flex items-center justify-between mb-4">
                      <label className="text-[10px] font-black text-blue-500 uppercase tracking-widest pl-1">Tugas Praktek</label>
                      <select 
                        className="bg-slate-800 text-[11px] border border-slate-700 rounded-lg px-3 py-1 outline-none text-white cursor-pointer"
                        value={hasAssignment ? assignmentType : "none"}
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === "none") { setHasAssignment(false); } 
                          else { setHasAssignment(true); setAssignmentType(val); }
                        }}
                      >
                        <option value="none">🚫 Tanpa Tugas</option>
                        <option value="flowchart">📐 Flowchart Maker</option>
                        <option value="code">💻 Code Editor</option>
                      </select>
                    </div>

                    {hasAssignment && (
                      <div className="space-y-3 animate-in slide-in-from-top-2">
                        <textarea placeholder={`Instruksi pengerjaan ${assignmentType}...`} className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl text-white text-xs h-20 outline-none" value={assignmentInstruction} onChange={(e) => setAssignmentInstruction(e.target.value)} />
                        {assignmentType === "code" && (
                          <textarea placeholder="# Template kode..." className="w-full bg-slate-950 border border-blue-900/30 p-3 rounded-xl text-blue-400 font-mono text-[10px] h-28 outline-none" value={starterCode} onChange={(e) => setStarterCode(e.target.value)} />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <button onClick={handleSaveEdit} className="w-full mt-8 bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg uppercase text-xs tracking-widest">
              <Save size={18} /> Simpan Perubahan
            </button>
          </div>
        </div>
      )}

      {/* --- LIST KONTEN --- */}
      {showCreate ? (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button onClick={() => setShowCreate(false)} className="flex items-center gap-2 text-slate-400 hover:text-blue-400 mb-6 transition-colors group">
            <ChevronLeft className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Daftar Course
          </button>
          <CreateCoursePage onComplete={() => { setShowCreate(false); fetchCourses(); }} />
        </div>
      ) : (
        <div className="animate-in fade-in duration-500">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-4xl font-black uppercase tracking-tighter flex items-center gap-4">
                <BookOpen className="text-blue-500" size={40} />Daftar Course
              </h1>
              <p className="text-slate-500 mt-2">Manajemen konten pembelajaran siswa</p>
            </div>
            <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-lg active:scale-95"><Plus size={18}/> Tambah Course</button>
          </div>

          <div className="flex flex-col gap-4">
            {loading ? (
              <div className="text-center py-20 text-slate-600 font-black uppercase tracking-widest animate-pulse italic opacity-20">Syncing Database...</div>
            ) : courses.length === 0 ? (
              <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-2xl text-slate-600 uppercase font-black text-xl opacity-20 italic">Belum Ada Course</div>
            ) : (
              courses.map((course) => (
                <div key={course.id} className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:border-slate-700 transition-all">
                  <div className="flex items-center justify-between p-5 group">
                    <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}>
                      <img src={course.thumbnail || "/placeholder.png"} className="w-16 h-16 rounded-2xl object-cover border border-slate-800 group-hover:border-blue-500 transition-all" alt={course.title} />
                      <div>
                        <h3 className="font-black text-lg group-hover:text-blue-400 transition-colors uppercase tracking-tight">{course.title}</h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">👤 {course.instructor}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditModal("course", course)} className="p-2.5 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-xl transition-all"><Edit3 size={18} /></button>
                      <button onClick={() => handleDelete('course', course.id, course.title)} className="p-2.5 text-slate-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"><Trash2 size={18} /></button>
                      <button onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)} className={`ml-2 w-10 h-10 flex items-center justify-center rounded-full transition-all ${expandedCourse === course.id ? 'bg-blue-600 text-white rotate-180' : 'bg-slate-800 text-slate-400'}`}>
                        {expandedCourse === course.id ? "−" : "+"}
                      </button>
                    </div>
                  </div>

                  {expandedCourse === course.id && (
                    <div className="bg-slate-950/40 border-t border-slate-800 p-6 animate-in slide-in-from-top-2 duration-300">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {course.modules && course.modules.length > 0 ? course.modules.map((module) => (
                          <div key={module.id} className="bg-slate-900/50 border border-slate-800 p-5 rounded-[24px] relative group/mod hover:border-blue-500/30 transition-all">
                            <div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover/mod:opacity-100 transition-opacity">
                              <button onClick={() => openEditModal("module", module)} className="p-1.5 text-slate-500 hover:text-blue-400"><Edit3 size={14}/></button>
                              <button onClick={() => handleDelete('module', module.id, module.title)} className="p-1.5 text-slate-500 hover:text-red-500"><Trash2 size={14}/></button>
                            </div>
                            <h4 className="font-black text-blue-500 mb-4 flex items-center gap-2 uppercase text-[10px] tracking-[0.2em] italic"><Package size={14} /> {module.title}</h4>
                            
                            <ul className="space-y-2 border-l-2 border-slate-800 ml-2 pl-4">
                              {module.materi && module.materi.length > 0 ? module.materi.map((m) => (
                                <li key={m.id} className="group/item flex items-center justify-between text-slate-400 hover:text-white transition-colors py-1 cursor-default">
                                  <span className="flex items-center gap-2 text-[13px] font-bold"><FileText size={14} className="text-slate-600" /> {m.title}</span>
                                  <div className="flex gap-2 opacity-0 group-hover/item:opacity-100 transition-all">
                                    <button onClick={() => openEditModal("materi", m)} className="hover:text-blue-400"><Edit3 size={12}/></button>
                                    <button onClick={() => handleDelete('materi', m.id, m.title)} className="hover:text-red-500"><Trash2 size={12}/></button>
                                  </div>
                                </li>
                              )) : <li className="text-[10px] text-slate-600 italic">Belum ada materi</li>}
                            </ul>
                          </div>
                        )) : (
                          <div className="col-span-full py-4 text-center text-slate-600 text-[10px] font-black uppercase tracking-widest italic opacity-50">
                            Struktur Modul Belum Dibuat
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}