"use client";

import React from 'react';
import { Type, MousePointer2, GraduationCap } from 'lucide-react';

export default function FlowchartSidebar() {
  // Fungsi Drag & Drop yang lebih stabil
  const onDragStart = (event, nodeType, label) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/label', label);
    event.dataTransfer.effectAllowed = 'move';
    
    // Memberikan sedikit transparansi pada elemen yang sedang ditarik
    event.target.style.opacity = '0.5';
  };

  const onDragEnd = (event) => {
    event.target.style.opacity = '1';
  };

  const symbols = [
    { 
      type: 'start', 
      label: 'Mulai / Selesai', 
      color: 'border-green-500', 
      shape: 'w-14 h-8 rounded-full' 
    },
    { 
      type: 'process', 
      label: 'Proses / Aksi', 
      color: 'border-blue-500', 
      shape: 'w-14 h-8 rounded-none' 
    },
    { 
      type: 'decision', 
      label: 'Percabangan', 
      color: 'border-yellow-500', 
      // Diamond: Ukuran diatur agar pas di container sidebar
      shape: 'w-8 h-8 rotate-45 my-2' 
    },
    { 
      type: 'input', 
      label: 'Input / Output', 
      color: 'border-purple-500', 
      shape: 'w-14 h-8 -skew-x-12' 
    },
    { 
      type: 'text', 
      label: 'Teks Bebas', 
      color: 'border-slate-500', 
      shape: 'w-14 h-8 border-dashed border-2 bg-transparent', 
      isText: true 
    },
  ];

  return (
    <aside className="w-52 bg-slate-950 border-r border-slate-900 p-6 flex flex-col gap-6 shrink-0 shadow-2xl h-full">
      {/* Header Sidebar Mini */}
      <div className="flex flex-col gap-3 items-center mb-4">
        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
          <GraduationCap size={18} />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">
          Toolkit Logika
        </p>
        <div className="h-[1px] w-12 bg-slate-800"></div>
      </div>
      
      {/* Container Simbol */}
      <div className="flex flex-col gap-10 items-center overflow-y-auto pr-1">
        {symbols.map((symbol) => (
          <div
            key={symbol.type}
            className="group flex flex-col items-center gap-3 cursor-grab active:cursor-grabbing w-full"
            onDragStart={(event) => onDragStart(event, symbol.type, symbol.label)}
            onDragEnd={onDragEnd}
            draggable
          >
            {/* Area Visual Simbol */}
            <div className="h-12 flex items-center justify-center w-full relative">
              <div 
                className={`border-2 flex items-center justify-center ${symbol.color} bg-slate-900/80 
                ${symbol.shape} transition-all duration-300 group-hover:scale-110 group-hover:bg-slate-800 
                shadow-lg group-hover:shadow-${symbol.color.split('-')[1]}-500/20 group-active:scale-95`}
              >
                {symbol.isText && <Type size={14} className="text-slate-500 group-hover:text-blue-400" />}
              </div>
            </div>
            
            {/* Label dengan Tracking yang lebih terbaca */}
            <span className="text-[9px] text-slate-500 font-bold group-hover:text-blue-400 transition-colors text-center uppercase tracking-wider">
              {symbol.label}
            </span>
          </div>
        ))}
      </div>

      {/* Panel Instruksi */}
      <div className="mt-auto pt-6">
        <div className="p-4 bg-blue-600/5 rounded-2xl border border-blue-500/10 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-blue-500">
            <MousePointer2 size={12} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-widest">Petunjuk</span>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] text-slate-500 leading-tight">
              <span className="text-slate-300 font-bold">Drag</span> simbol ke area kerja.
            </p>
            <p className="text-[10px] text-slate-500 leading-tight">
              <span className="text-slate-300 font-bold">Double Click</span> untuk mengubah teks.
            </p>
            <p className="text-[10px] text-slate-500 leading-tight">
              <span className="text-slate-300 font-bold">Backspace</span> untuk menghapus node.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}