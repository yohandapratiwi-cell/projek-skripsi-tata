"use client";

import dynamic from "next/dynamic";
import React from "react";

// Import Editor secara dinamis untuk mencegah error SSR (Server Side Rendering)
const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { 
    ssr: false,
    loading: () => (
      <div className="h-[400px] w-full bg-slate-900/50 animate-pulse rounded-[32px] border border-slate-800 flex items-center justify-center text-[10px] text-slate-500 font-black uppercase tracking-widest italic">
        Initializing Workspace...
      </div>
    )
  }
);

export default function MarkdownEditor({ value, onChange }) {
  return (
    <div data-color-mode="dark" className="w-full space-y-2">
      {/* Menggunakan rel="stylesheet" di sini sudah benar untuk mengatasi masalah build, 
         tapi saya tambahkan wrapper div dengan kustomisasi CSS agar UI @uiw tidak "menabrak" 
         border-radius 32px milik Bapak.
      */}
      <link rel="stylesheet" href="https://unpkg.com/@uiw/react-md-editor@4.1.0/dist/mdeditor.css" />
      <link rel="stylesheet" href="https://unpkg.com/@uiw/react-markdown-preview@5.2.0/dist/markdown.css" />
      
      <style jsx global>{`
        .w-md-editor {
          border: none !important;
          background-color: transparent !important;
          box-shadow: none !important;
        }
        .w-md-editor-toolbar {
          background-color: #0f172a !important; /* Slate 900 */
          border-bottom: 1px solid #1e293b !important; /* Slate 800 */
          border-radius: 32px 32px 0 0 !important;
          padding: 8px 20px !important;
        }
        .w-md-editor-content {
          background-color: #020617 !important; /* Slate 950 */
        }
        .w-md-editor-preview {
          box-shadow: inset 1px 0 0 0 #1e293b !important;
          background-color: #020617 !important;
        }
        /* Mengatur Scrollbar Editor agar tidak kaku */
        .w-md-editor-content::-webkit-scrollbar {
          width: 4px;
        }
        .w-md-editor-content::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
      `}</style>
      
      <div className="rounded-[32px] overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl transition-all duration-500 hover:border-blue-500/30">
        <MDEditor
          value={value}
          onChange={onChange}
          height={400}
          preview="live"
          hideToolbar={false}
          enableScroll={true}
          visibleDragbar={false} // Dimatikan agar border-radius bawah tetap rapi
        />
      </div>

      <div className="flex justify-between px-6">
        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest italic">
          Markdown Supported
        </p>
        <p className="text-[10px] text-blue-500/50 font-black uppercase tracking-widest">
          Semantic Wave Editor v4.0
        </p>
      </div>
    </div>
  );
}