"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback, useMemo } from "react";
import Link from "next/link";
import { 
  FileText, ArrowRight, ArrowLeft, 
  Loader2, X, BrainCircuit, Save, Code as CodeIcon,
  MessageSquareQuote, ChevronDown, ChevronRight, Lock, Terminal,
  CheckCircle2 
} from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm'; 
import { api } from "@/lib/api";
import { getFullCourses } from "@/app/services/courseService";

// INTEGRASI EDITOR & FLOWCHART
import Editor from "@monaco-editor/react";
import ReactFlow, { ReactFlowProvider, addEdge, useNodesState, useEdgesState, Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';

import { StartNode, ProcessNode, DecisionNode, InputOutputNode, TextNode } from "@/components/student/FlowchartNodes";
import FlowchartSidebar from "@/components/student/FlowchartSidebar";

export default function MateriPage() {
  const params = useParams();
  const router = useRouter();
  
  const nodeTypes = useMemo(() => ({ 
    start: StartNode, 
    process: ProcessNode, 
    decision: DecisionNode, 
    input: InputOutputNode,
    text: TextNode 
  }), []);

  const [course, setCourse] = useState(null);
  const [modules, setModules] = useState([]);
  const [materi, setMateri] = useState(null);
  const [loading, setLoading] = useState(true);

  const [openModules, setOpenModules] = useState({});
  const [timeLeft, setTimeLeft] = useState(5);
  const [canGoNext, setCanGoNext] = useState(false);

  const [prevMateriId, setPrevMateriId] = useState(null);
  const [nextMateriId, setNextMateriId] = useState(null);
  const [posttestId, setPosttestId] = useState(null);
  const [isPosttestDone, setIsPosttestDone] = useState(false);
  const [showWorkspace, setShowWorkspace] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);
  const [userCode, setUserCode] = useState("");
  const [terminalOutput, setTerminalOutput] = useState("");
  const [isCompiling, setIsCompiling] = useState(false);
  const [userReflection, setUserReflection] = useState("");
  const [runCount, setRunCount] = useState(0);
  const [userInput, setUserInput] = useState("");

  // ✅ STATE: Tujuan Pembelajaran yang dicentang
  const [selectedObjectives, setSelectedObjectives] = useState([]);

  const toggleModule = (modId) => {
    setOpenModules(prev => ({ ...prev, [modId]: !prev[modId] }));
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const accessRes = await api.get(`/api/student/course-access/${params.id}`);
        const accessStatus = accessRes.data;

        if (accessStatus.posttestId) setPosttestId(accessStatus.posttestId);
        setIsPosttestDone(accessStatus.posttestDone || false);

        if (accessStatus.hasPretest && !accessStatus.pretestDone) {
          router.push(`/student/test/${params.id}/pretest/${accessStatus.pretestId}`);
          return;
        }

        const allDataRes = await getFullCourses();
        const allData = allDataRes.data || allDataRes; 
        const currentCourse = allData.find(c => Number(c.id) === Number(params.id));
        
        if (currentCourse) {
          setCourse(currentCourse);
          setModules(currentCourse.modules || []);
          const allMateri = currentCourse.modules.flatMap(m => m.materi || []);
          const currentIndex = allMateri.findIndex(m => Number(m.id) === Number(params.materiId));
          const currentMateri = allMateri[currentIndex];
          
          if (!currentMateri) return;
          setMateri(currentMateri);

          const currentMod = currentCourse.modules.find(mod => mod.materi?.some(mat => mat.id === currentMateri.id));
          if (currentMod) setOpenModules(prev => ({ ...prev, [currentMod.id]: true }));

          // Reset status default
          setIsSubmitted(false);
          setShowWorkspace(false);
          setCanGoNext(false);
          setTimeLeft(5);
          setUserReflection("");
          setSelectedObjectives([]); // Reset centang sebelum restore
          setRunCount(0);
          setUserInput("");
          setUserCode(currentMateri.assignment?.starter_code || "// Tulis kodemu di sini...");
          setNodes([]);
          setEdges([]);
          setTerminalOutput("");

          // RESTORE DATA DARI DATABASE
          try {
            const subRes = await api.get(`/api/student/submission/${params.materiId}`);
            const subData = subRes.data;

            if (subData.exists) {
              const savedContent = typeof subData.data.content === 'string' 
                ? JSON.parse(subData.data.content) 
                : subData.data.content;

              setIsSubmitted(true);
              setCanGoNext(true);
              setUserReflection(savedContent.reflection || "");
              
              // ✅ RESTORE DATA CENTANG
              if (savedContent.achieved_objectives) {
                setSelectedObjectives(savedContent.achieved_objectives);
              }
              
              setRunCount(subData.data.run_count || 0);

              if (currentMateri.assignment?.type === 'code') {
                setUserCode(savedContent.task?.code || "");
                setTerminalOutput(savedContent.task?.output || "");
              } else if (currentMateri.assignment?.type === 'flowchart') {
                const restoredNodes = (savedContent.task?.nodes || []).map((node) => ({
                  ...node,
                  data: {
                    ...node.data,
                    onChange: (newLabel) => {
                      setNodes((nds) =>
                        nds.map((n) => (n.id === node.id ? { ...n, data: { ...n.data, label: newLabel } } : n))
                      );
                    }
                  }
                }));
                setNodes(restoredNodes);
                setEdges(savedContent.task?.edges || []);
              }
            }
          } catch (err) { console.error("Restore error:", err); }

          if (currentIndex > 0) setPrevMateriId(allMateri[currentIndex - 1].id);
          if (currentIndex < allMateri.length - 1) setNextMateriId(allMateri[currentIndex + 1].id);
        }
      } catch (err) { console.error("Loading error:", err); } finally { setLoading(false); }
    };
    
    if (params?.id && params?.materiId) fetchData();
  }, [params.id, params.materiId]);

  useEffect(() => {
    if (!materi) return;
    const hasTask = materi.assignment || materi.has_reflection;
    if (!hasTask) {
      if (timeLeft > 0) {
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
      } else { setCanGoNext(true); }
    } else { setCanGoNext(isSubmitted); }
  }, [timeLeft, materi, isSubmitted]);

  // LOG ACTIVITY
  useEffect(() => {
    const logActivity = async () => {
      try {
        await api.post("/api/student/log-activity");
      } catch (err) {
        console.error("Gagal mencatat durasi belajar");
      }
    };
    if (params?.materiId) {
      logActivity();
      const interval = setInterval(logActivity, 60000); 
      return () => clearInterval(interval);
    }
  }, [params?.materiId]);

  // HANDLER CHECKBOX
  const handleObjectiveTick = (objectiveText) => {
    //if (isSubmitted) return;
    setSelectedObjectives(prev => 
      prev.includes(objectiveText) 
      ? prev.filter(item => item !== objectiveText) 
      : [...prev, objectiveText]
    );
  };

  const onConnect = useCallback((params) => {
    if (isSubmitted) return;
    setEdges((eds) => addEdge(params, eds));
  }, [setEdges, isSubmitted]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    if (isSubmitted) return;
    event.dataTransfer.dropEffect = 'move';
  }, [isSubmitted]);
  
  const onDrop = useCallback((event) => {
    event.preventDefault();
    if (isSubmitted || !reactFlowInstance) return;
    const type = event.dataTransfer.getData('application/reactflow');
    const label = event.dataTransfer.getData('application/label');
    const position = reactFlowInstance.screenToFlowPosition({ x: event.clientX, y: event.clientY });
    
    const newNodeId = `node_${Date.now()}`;
    const newNode = { 
      id: newNodeId, type, position, 
      data: { 
        label,
        onChange: (newLabel) => {
          setNodes((nds) =>
            nds.map((n) => (n.id === newNodeId ? { ...n, data: { ...n.data, label: newLabel } } : n))
          );
        }
      } 
    };
    setNodes((nds) => nds.concat(newNode));
  }, [reactFlowInstance, setNodes, isSubmitted]);

  const handleRunCode = async () => {
    if (isCompiling || isSubmitted) return;
    setIsCompiling(true);
    setRunCount(prev => prev + 1);
    setTerminalOutput("System: Compiling... ⏳");
    try {
      const res = await api.post("/api/student/run-code", { 
        materi_id: materi.id, 
        code: userCode,
        stdin: userInput 
      });
      const data = res.data;
      setTerminalOutput(data.stderr ? `❌ Error:\n${data.stderr}` : `✅ Output:\n${data.stdout}`);
    } catch (err) { 
      setTerminalOutput("❌ Connection Error"); 
    } finally { 
      setIsCompiling(false); 
    }
  };

  const handleSendAssignment = async () => {
    if (materi?.has_reflection && !userReflection.trim()) return alert("Harap isi respon refleksi!");
    
    const taskContent = materi.assignment?.type === 'code' 
      ? { code: userCode, output: terminalOutput } 
      : { nodes, edges };
    
    try {
      const res = await api.post("/api/student/submit-assignment", { 
        materi_id: materi.id, 
        content: { 
            task: taskContent, 
            reflection: userReflection,
            achieved_objectives: selectedObjectives // Kirim data centang
        },
        run_count: runCount
      });
  
      if (res.status === 200 || res.status === 201) {
        setIsSubmitted(true);
        setCanGoNext(true);
        alert("🎉 Berhasil dikirim!");
      }
    } catch (err) { alert("Gagal mengirim."); }
  };

  if (loading) return (
    <div className="h-screen bg-slate-950 flex flex-col items-center justify-center text-blue-500">
      <Loader2 className="animate-spin mb-4" size={40} />
      <p className="uppercase tracking-widest text-xs font-black">Syncing Workspace...</p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 text-slate-200 flex flex-col overflow-hidden">
      <header className="h-16 bg-slate-900 border-b border-slate-800 px-8 flex items-center shrink-0">
        <button onClick={() => router.push('/student/courses')} className="p-2 hover:bg-slate-800 rounded-xl mr-4"><X size={20}/></button>
        <h2 className="text-2xl font-black tracking-tight uppercase text-white italic">{course?.title}</h2>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-80 bg-slate-900/50 border-r border-slate-800 flex flex-col shrink-0 overflow-y-auto p-6 space-y-4 font-black italic">
          {modules.map((module, mIdx) => (
            <div key={module.id} className="space-y-2">
              <button onClick={() => toggleModule(module.id)} className="w-full flex items-center justify-between p-4 rounded-xl bg-slate-800/40 hover:bg-slate-800 transition-all border border-slate-700/50">
                <span className="text-sm font-black text-white uppercase tracking-tight text-left">{mIdx + 1}. {module.title}</span>
                {openModules[module.id] ? <ChevronDown size={18}/> : <ChevronRight size={18}/>}
              </button>
              {openModules[module.id] && (
                <div className="pl-4 space-y-1">
                  {module.materi?.map((item) => (
                    <div key={item.id} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-bold transition-all ${item.id == params.materiId ? "bg-blue-600 text-white shadow-lg" : "text-slate-500 hover:bg-slate-800/50 cursor-pointer"}`} onClick={() => router.push(`/student/courses/${params.id}/materi/${item.id}`)}><FileText size={14} /><span className="truncate">{item.title}</span></div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </aside>

        <main className="flex-1 overflow-y-auto bg-slate-950 flex flex-col relative custom-scrollbar">
          <div className="w-full px-12 py-12 flex-1">
            <h1 className="text-4xl font-black text-white mb-8 tracking-tighter uppercase italic">{materi?.title}</h1>

            {materi?.video_url && (
              <div className="mb-12 aspect-video rounded-[40px] overflow-hidden border-8 border-slate-900 shadow-2xl bg-black">
                <iframe width="100%" height="100%" src={materi.video_url.includes('watch?v=') ? materi.video_url.replace('watch?v=', 'embed/') : materi.video_url} title="Video" frameBorder="0" allowFullScreen />
              </div>
            )}

            <div className="text-slate-300 text-lg leading-relaxed mb-20 bg-slate-900/30 p-10 rounded-[48px] border border-slate-800 font-sans">
              <article className="prose prose-invert prose-slate max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{materi?.content}</ReactMarkdown>
              </article>
            </div>

            {/* SEKSI REFLEKSI & SELF-ASSESSMENT */}
            {materi?.has_reflection && (
              <div className="mt-16 p-10 rounded-[40px] bg-purple-600/5 border border-purple-500/20 shadow-2xl relative">
                <div className="flex items-center gap-3 mb-6">
                  <MessageSquareQuote className="text-purple-400" size={28} />
                  <span className="text-xs font-black text-purple-400 uppercase tracking-widest italic">Refleksi & Evaluasi Mandiri</span>
                </div>

                {/* ✅ UI CHECKBOX TUJUAN PEMBELAJARAN */}
                {materi?.learning_objectives && Array.isArray(materi.learning_objectives) && materi.learning_objectives.length > 0 && (
                    <div className="mb-10 p-8 bg-slate-950/50 border border-slate-800 rounded-[32px]">
                        <label className="block text-[10px] font-black uppercase tracking-widest text-blue-500 mb-6 italic">
                             Capaian Pembelajaran: Apa saja yang sudah kamu pahami?
                        </label>
                        <div className="grid grid-cols-1 gap-3">
                            {materi.learning_objectives.map((obj, index) => (
                                <div 
                                    key={index} 
                                    onClick={() => handleObjectiveTick(obj)}
                                    className={`flex items-center gap-4 p-5 rounded-2xl border transition-all duration-300 ${
                                        selectedObjectives.includes(obj) 
                                        ? "bg-blue-600/10 border-blue-500/50 text-white shadow-[0_0_20px_rgba(37,99,235,0.05)]" 
                                        : "bg-slate-900/50 border-slate-800 text-slate-500"
                                    } ${!isSubmitted ? "cursor-pointer hover:border-slate-600" : "opacity-80 cursor-default"}`}
                                >
                                    <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${
                                        selectedObjectives.includes(obj) ? "bg-blue-500 border-blue-500" : "border-slate-700"
                                    }`}>
                                        {selectedObjectives.includes(obj) && <CheckCircle2 size={16} className="text-white" />}
                                    </div>
                                    <span className="text-sm font-bold italic tracking-tight">{obj}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <h5 className="text-white font-bold text-2xl mb-6">{materi.reflection_question}</h5>
                <textarea className="w-full bg-slate-950 border border-slate-800 p-8 rounded-[32px] text-white text-lg h-40 outline-none" value={userReflection} onChange={(e) => setUserReflection(e.target.value)} placeholder="Tulis responmu..." readOnly={false} />
                <div className="mt-8 flex justify-end">
                  <button onClick={handleSendAssignment} className="bg-purple-600 text-white px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 transition-all active:scale-95">
                    <Save size={18} /> {isSubmitted ? "Perbarui" : "Kirim"}
                  </button>
                </div>
              </div>
            )}

            {/* SEKSI TUGAS */}
            {materi?.assignment && (
              <div className="mt-16 p-10 rounded-[40px] bg-blue-600/5 border border-blue-500/20 shadow-2xl flex flex-col md:flex-row items-center gap-10">
                <div className={`p-8 rounded-[32px] ${isSubmitted ? "bg-green-500/10 text-green-500" : "bg-blue-500/10 text-blue-400 animate-pulse"}`}>
                  {materi.assignment.type === 'code' ? <CodeIcon size={48}/> : <BrainCircuit size={48}/>}
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-black text-3xl uppercase tracking-tighter mb-2 italic">Assignment: {materi.assignment.type}</h4>
                  <p className="text-slate-400 text-lg mb-8 italic">"{materi.assignment.instruction}"</p>
                  <button onClick={() => setShowWorkspace(!showWorkspace)} className="px-10 py-4 bg-blue-600 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-xl transition-all active:scale-95">
                    {showWorkspace ? "Tutup Workspace" : "Buka Workspace"}
                  </button>
                </div>
              </div>
            )}

            {/* WORKSPACE AREA */}
            {showWorkspace && materi?.assignment && (
              <div className="mt-10 bg-slate-900 border border-slate-800 rounded-[40px] overflow-hidden flex flex-col h-[800px] shadow-2xl relative">
                {isSubmitted && (
                  <div className="absolute top-16 inset-0 bg-slate-950/20 z-50 flex items-center justify-center pointer-events-none">
                    <div className="bg-slate-900/90 border border-slate-700 px-6 py-3 rounded-2xl flex items-center gap-3">
                      <Lock className="text-orange-500" size={20} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">ReadOnly - Tugas Sudah Terkirim</span>
                    </div>
                  </div>
                )}
                <div className="h-16 bg-slate-800/50 border-b border-slate-700 px-10 flex justify-between items-center z-[51]">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{materi.assignment.type} Editor</span>
                  <div className="flex gap-4">
                    {materi.assignment.type === 'code' && !isSubmitted && (
                      <button onClick={handleRunCode} className="bg-blue-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">Run</button>
                    )}
                    {!isSubmitted && <button onClick={handleSendAssignment} className="bg-green-600 text-white px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest">Submit</button>}
                  </div>
                </div>
                
                <div className="flex-1 flex overflow-hidden">
                  {materi.assignment.type === 'flowchart' ? (
                    <ReactFlowProvider>
                      <div className="flex flex-1 overflow-hidden bg-slate-950">
                        {!isSubmitted && <FlowchartSidebar />}
                        <div className="flex-1 relative">
                          <ReactFlow
                            nodes={nodes}
                            edges={edges}
                            onNodesChange={onNodesChange}
                            onEdgesChange={onEdgesChange}
                            onConnect={onConnect}
                            onInit={setReactFlowInstance}
                            onDrop={onDrop}
                            onDragOver={onDragOver}
                            nodeTypes={nodeTypes}
                            connectionMode="loose" 
                            deleteKeyCode={isSubmitted ? null : ["Backspace", "Delete"]}
                            fitView
                          >
                            <Background color="#334155" variant="dots"/>
                            <Controls className="!bg-slate-800 !border-slate-700 !fill-white"/>
                          </ReactFlow>
                        </div>
                      </div>
                    </ReactFlowProvider>
                  ) : (
                    <div className="flex-1 flex overflow-hidden font-mono text-white">
                      <div className="flex-1 border-r border-slate-800">
                        <Editor height="100%" defaultLanguage="cpp" theme="vs-dark" value={userCode} onChange={(v) => setUserCode(v)} options={{ fontSize: 16, minimap: { enabled: false }, readOnly: isSubmitted }} />
                      </div>
                      <div className="w-96 bg-black p-8 text-sm text-green-400 italic flex flex-col gap-6 custom-scrollbar overflow-y-auto">
                        <div className="flex flex-col gap-1 border-b border-white/5 pb-4">
                            <span className="text-[9px] font-black uppercase text-blue-500 tracking-widest">Total Compile</span>
                            <span className="text-xl text-white font-black">{runCount} <span className="text-[10px] text-slate-600">Times</span></span>
                        </div>
                        {!isSubmitted && (
                          <div className="flex flex-col gap-2">
                            <label className="text-[9px] font-black uppercase text-orange-500 tracking-widest flex items-center gap-2">
                              <Terminal size={12} /> Standard Input (stdin)
                            </label>
                            <textarea value={userInput} onChange={(e) => setUserInput(e.target.value)} placeholder="Masukkan angka input di sini (misal: 1)" className="w-full bg-slate-900 border border-slate-800 rounded-2xl p-4 text-white font-mono text-xs focus:outline-none focus:border-blue-500 transition-all" rows={3}/>
                          </div>
                        )}
                        <div className="flex-1 pt-4 border-t border-white/5">
                            <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest block mb-4">Console Output</span>
                            <pre className="whitespace-pre-wrap font-mono leading-relaxed">{terminalOutput || "> Console Ready..."}</pre>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* FOOTER NAVIGASI */}
            <div className="mt-32 mb-20 flex justify-between items-center border-t border-slate-900 pt-16">
              {prevMateriId ? <Link href={`/student/courses/${params.id}/materi/${prevMateriId}`} className="text-slate-500 hover:text-white font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 transition-all"><ArrowLeft size={20} /> Back</Link> : <div/>}
              {nextMateriId ? (
                <button disabled={!canGoNext} onClick={() => router.push(`/student/courses/${params.id}/materi/${nextMateriId}`)} className={`font-black text-xs uppercase tracking-widest flex items-center gap-3 px-12 py-5 rounded-[24px] shadow-2xl transition-all ${!canGoNext ? "bg-slate-900 text-slate-700 opacity-50 cursor-not-allowed" : "bg-blue-600 text-white"}`}>Next Materi <ArrowRight size={20} /></button>
              ) : (
                <button onClick={() => isPosttestDone || !posttestId ? router.push('/student/courses') : router.push(`/student/test/${params.id}/posttest/${posttestId}`)} className={`px-12 py-5 rounded-[24px] font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl transition-all ${isPosttestDone || !posttestId ? "bg-slate-800 text-white" : "bg-orange-600 text-white animate-bounce"}`}>
                  {isPosttestDone || !posttestId ? "Exit Course" : "Post-test Final"} <ArrowRight size={20} />
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}