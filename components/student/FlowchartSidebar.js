"use client";

import React from 'react';
import { Type, MousePointer2, GraduationCap, Touchpad } from 'lucide-react';

export default function FlowchartSidebar({ onAddNodeMobile }) {
  
  const onDragStart = (event, nodeType, label) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.setData('application/label', label);
    event.dataTransfer.effectAllowed = 'move';
    event.target.style.opacity = '0.5';
  };

  const onDragEnd = (event) => {
    event.target.style.opacity = '1';
  };

  // Handler khusus untuk mendeteksi ketukan di HP/Tablet
  const handleNodeClick = (nodeType, label) => {
    if (typeof onAddNodeMobile === 'function') {
      onAddNodeMobile(nodeType, label);
    }
  };

  const symbols = [
    { type: 'start', label: 'Mulai / Selesai', color: 'border-green-500', shape: 'w-14 h-8 rounded-full' },
    { type: 'process', label: 'Proses / Aksi', color: 'border-blue-500', shape: 'w-14 h-8 rounded-none' },
    { type: 'decision', label: 'Percabangan', color: 'border-yellow-500', shape: 'w-8 h-8 rotate-45 my-2' },
    { type: 'input', label: 'Input / Output', color: 'border-purple-500', shape: 'w-14 h-8 -skew-x-12' },
    { type: 'text', label: 'Teks Bebas', color: 'border-slate-500', shape: 'w-14 h-8 border-dashed border-2 bg-transparent', isText: true },
  ];

  return (
    <aside className="w-52 bg-slate-950 border-r border-slate-900 p-6 flex flex-col gap-6 shrink-0 shadow-2xl h-full">
      <div className="flex flex-col gap-3 items-center mb-4">
        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
          <GraduationCap size={18} />
        </div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-center">
          Toolkit Logika
        </p>
        <div className="h-[1px] w-12 bg-slate-800"></div>
      </div>
      
      <div className="flex flex-col gap-10 items-center overflow-y-auto pr-1">
        {symbols.map((symbol) => (
          <div
            key={symbol.type}
            className="group flex flex-col items-center gap-3 cursor-grab active:cursor-grabbing w-full select-none"
            onDragStart={(event) => onDragStart(event, symbol.type, symbol.label)}
            onDragEnd={onDragEnd}
            onClick={() => handleNodeClick(symbol.type, symbol.label)} // Aktif di mobile
            draggable
          >
            <div className="h-12 flex items-center justify-center w-full relative">
              <div 
                className={`border-2 flex items-center justify-center ${symbol.color} bg-slate-900/80 
                ${symbol.shape} transition-all duration-300 group-hover:scale-110 group-hover:bg-slate-800 
                shadow-lg group-hover:shadow-blue-500/20 group-active:scale-95`}
              >
                {symbol.isText && <Type size={14} className="text-slate-500 group-hover:text-blue-400" />}
              </div>
            </div>
            
            <span className="text-[9px] text-slate-500 font-bold group-hover:text-blue-400 transition-colors text-center uppercase tracking-wider">
              {symbol.label}
            </span>
          </div>
        ))}
      </div>

      <div className="mt-auto pt-6">
        <div className="p-4 bg-blue-600/5 rounded-2xl border border-blue-500/10 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-blue-500">
            <MousePointer2 size={12} strokeWidth={3} />
            <span className="text-[10px] font-black uppercase tracking-widest">Petunjuk</span>
          </div>
          <div className="space-y-2 text-[10px] text-slate-500 leading-tight">
            <p><span className="text-slate-300 font-bold">Laptop:</span> Drag simbol ke canvas.</p>
            <p><span className="text-slate-300 font-bold">HP/Tablet:</span> Tap simbol untuk menambah.</p>
            <p><span className="text-slate-300 font-bold">Ubah Teks:</span> Tap/Hold pada teks node.</p>
          </div>
        </div>
      </div>
    </aside>
  );
}