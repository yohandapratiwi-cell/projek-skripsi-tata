"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { 
  ChevronLeft, User, Search, 
  X, Send, Loader2, Award, FileCode, Terminal
} from "lucide-react";

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactFlow, { ReactFlowProvider, Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';

// ✅ Import komponen node agar flowchart di modal tampil dengan bentuk yang benar
import { StartNode, ProcessNode, DecisionNode, InputOutputNode, TextNode } from "@/components/student/FlowchartNodes";

const nodeTypes = { 
  start: StartNode, 
  process: ProcessNode, 
  decision: DecisionNode, 
  input: InputOutputNode,
  text: TextNode 
};

export default function StudentListPage() {
  const params = useParams();
  const router = useRouter();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  
  const [selectedSub, setSelectedSub] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchSubmissions();
  }, [params.materiId]);

  const fetchSubmissions = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/teacher/grading/materi/${params.materiId}`);
      setSubmissions(res.data?.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openGradingModal = (submission) => {
    setSelectedSub(submission);
    setIsModalOpen(true);
  };

  const handleSaveGrade = async (e) => {
    e.preventDefault();
    const score = e.target.score.value;
    const feedback = e.target.feedback.value;

    setIsSaving(true);
    try {
      await api.put(`/api/teacher/grading/submit/${selectedSub.submission_id}`, {
        score: parseInt(score),
        feedback
      });
      setIsModalOpen(false);
      fetchSubmissions(); 
    } catch (err) {
      alert("Gagal simpan nilai");
    } finally {
      setIsSaving(false);
    }
  };

  // ✅ FUNGSI RENDERER DI DALAM MODUL
  const renderStudentWork = (content) => {
    if (!content) return <p className="text-slate-500 italic text-xs">Tidak ada jawaban.</p>;

    try {
      const parsed = typeof content === 'string' ? JSON.parse(content) : content;
      
      // 1. JIKA DATA ADALAH FLOWCHART
      if (parsed?.task?.nodes || parsed?.nodes) {
        const flowData = parsed.task || parsed;
        return (
          <div className="h-[450px] w-full bg-slate-950 rounded-[32px] border border-slate-800 relative overflow-hidden shadow-inner">
             <ReactFlowProvider>
                <ReactFlow
                  nodes={flowData.nodes || []}
                  edges={flowData.edges || []}
                  nodeTypes={nodeTypes}
                  fitView
                  nodesDraggable={false}
                  nodesConnectable={false}
                  elementsSelectable={false}
                  panOnDrag={true}
                  zoomOnScroll={true}
                >
                  <Background color="#1e293b" variant="dots" />
                  <Controls showInteractive={false} />
                </ReactFlow>
             </ReactFlowProvider>
          </div>
        );
      }

      // 2. JIKA DATA ADALAH CODING
      const code = parsed?.task?.code || parsed?.code || "";
      const output = parsed?.task?.output || parsed?.output || "No output recorded.";

      if (code) {
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase text-blue-500 tracking-widest flex items-center gap-2">
                <FileCode size={14} /> Source Code
              </p>
              <div className="rounded-2xl overflow-hidden border border-slate-800 text-xs">
                <SyntaxHighlighter 
                  language="cpp" 
                  style={vscDarkPlus}
                  customStyle={{ margin: 0, padding: '20px', fontSize: '13px', backgroundColor: '#020617' }}
                >
                  {code}
                </SyntaxHighlighter>
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] font-black uppercase text-green-500 tracking-widest flex items-center gap-2">
                <Terminal size={14} /> Console Output
              </p>
              <div className="bg-black p-4 rounded-2xl border border-slate-800 font-mono text-xs text-green-400">
                <pre className="whitespace-pre-wrap">{output.replace("✅ Output:\n", "").replace("❌ Error:\n", "")}</pre>
              </div>
            </div>
          </div>
        );
      }
      
      return <pre className="text-xs text-slate-400">{JSON.stringify(parsed, null, 2)}</pre>;
    } catch (e) {
      return <pre className="bg-slate-950 p-6 rounded-3xl text-green-400 text-sm whitespace-pre-wrap font-mono">{content}</pre>;
    }
  };

  const filteredStudents = submissions.filter(s => 
    s.student_name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="h-screen bg-slate-950 flex items-center justify-center text-blue-500"><Loader2 className="animate-spin" size={40} /></div>;

  return (
    <div className="p-10 bg-slate-950 min-h-screen text-white font-sans selection:bg-blue-500/30">
      <div className="flex justify-between items-end mb-10">
        <div>
          <button onClick={() => router.push(`/teacher/grading/${params.courseId}`)} className="flex items-center gap-2 text-slate-500 hover:text-white mb-4 text-xs font-black uppercase tracking-widest transition-all group">
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Materi
          </button>
          <h1 className="text-4xl font-black uppercase italic tracking-tighter">Daftar Pengumpulan</h1>
        </div>
        <div className="relative w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" placeholder="Cari nama siswa..." 
            className="w-full bg-slate-900 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm outline-none focus:ring-2 focus:ring-blue-500 text-white transition-all"
            value={search} onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-[40px] overflow-hidden shadow-2xl">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-slate-800/50 text-slate-500 text-[10px] font-black uppercase tracking-widest">
              <th className="p-8">Siswa</th>
              <th className="p-8">Status</th>
              <th className="p-8">Skor</th>
              <th className="p-8 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {filteredStudents.map((s) => (
              <tr key={s.submission_id} className="hover:bg-blue-600/5 transition-all group">
                <td className="p-8">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-slate-800 rounded-xl flex items-center justify-center text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all"><User size={20} /></div>
                    <div>
                        <p className="font-bold text-white uppercase italic tracking-tight leading-none mb-1">{s.student_name}</p>
                        <p className="text-[10px] text-slate-600 font-bold uppercase tracking-tighter">{s.student_email || "Active Learner"}</p>
                    </div>
                  </div>
                </td>
                <td className="p-8">
                  <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border shadow-sm ${s.status === 'graded' ? 'bg-green-500/10 text-green-500 border-green-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                    {s.status === 'graded' ? "Finished" : "Waiting"}
                  </span>
                </td>
                <td className="p-8 font-black text-2xl italic text-blue-500 tracking-tighter">{s.score || "—"}</td>
                <td className="p-8 text-right">
                  <button onClick={() => openGradingModal(s)} className="bg-slate-800 hover:bg-blue-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95">
                    {s.status === 'graded' ? "Edit Nilai" : "Beri Nilai"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* CUSTOM MODAL PENILAIAN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-6 md:p-12 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative bg-slate-900 border border-slate-800 w-full max-w-6xl h-full max-h-[90vh] rounded-[50px] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-300">
            
            <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/30"><Award className="text-white" size={24} /></div>
                <div>
                  <h2 className="text-2xl font-black uppercase italic tracking-tighter text-white">Penilaian: {selectedSub.student_name}</h2>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest italic">Reviewing Submission #SUB-{selectedSub.submission_id}</p>
                </div>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-3 bg-slate-800 hover:bg-red-500/20 text-slate-500 hover:text-red-500 rounded-2xl transition-all"><X size={24} /></button>
            </div>

            <div className="flex-1 overflow-y-auto p-10 flex flex-col lg:flex-row gap-12 custom-scrollbar">
              {/* ✅ SISI KIRI: RENDERER HASIL KERJA */}
              <div className="flex-1 space-y-6">
                 <div className="flex items-center gap-3">
                    <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">Student Work Result</h4>
                 </div>
                 
                 {/* Panggil fungsi renderer */}
                 <div className="w-full">
                    {renderStudentWork(selectedSub.content)}
                 </div>

                 {/* Refleksi (jika ada) */}
                 {(() => {
                    const parsed = JSON.parse(selectedSub.content);
                    if (parsed.reflection) {
                      return (
                        <div className="bg-slate-950/50 p-6 rounded-3xl border border-slate-800 italic">
                          <p className="text-[10px] font-black uppercase text-slate-600 mb-2 tracking-widest italic">Respon Refleksi:</p>
                          <p className="text-sm text-slate-400 font-medium">"{parsed.reflection}"</p>
                        </div>
                      );
                    }
                 })()}
              </div>

              {/* SISI KANAN: FORM NILAI */}
              <form onSubmit={handleSaveGrade} className="w-full lg:w-80 space-y-10">
                <div className="space-y-4">
                   <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block text-center italic">Assign Final Score</label>
                   <div className="relative group">
                     <input 
                      name="score" type="number" max="100" min="0" required
                      defaultValue={selectedSub.score || ""}
                      className="w-full bg-slate-950 border border-slate-800 rounded-[40px] py-12 text-7xl font-black text-center text-blue-500 outline-none focus:ring-4 focus:ring-blue-600/20 transition-all shadow-inner"
                      placeholder="0"
                     />
                     <span className="absolute bottom-4 right-8 text-slate-800 font-black text-xs uppercase">/ 100</span>
                   </div>
                </div>

                <button disabled={isSaving} type="submit" className="w-full bg-blue-600 hover:bg-blue-500 py-6 rounded-[30px] font-black text-xs uppercase tracking-[0.3em] shadow-2xl shadow-blue-900/30 flex items-center justify-center gap-3 active:scale-95 transition-all text-white">
                  {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />} Save & Close
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}