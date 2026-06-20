import React, { useState, useEffect } from 'react';
import { Handle, Position } from 'reactflow';

const EditableLabel = ({ label, onChange, placeholder, className }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState(label || "");

  useEffect(() => { setValue(label || ""); }, [label]);

  const handleBlur = () => {
    setIsEditing(false);
    if (typeof onChange === 'function') onChange(value);
  };

  if (isEditing) {
    return (
      <textarea
        autoFocus
        className={`nodrag nowheel bg-transparent outline-none resize-none text-center w-full p-0 m-0 leading-tight focus:ring-0 border-none ${className}`}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onBlur={handleBlur}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleBlur();
          }
          e.stopPropagation();
        }}
        rows={1}
      />
    );
  }

  return (
    <div 
      onDoubleClick={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }} 
      onTouchStart={(e) => {
        e.stopPropagation();
        setIsEditing(true);
      }}
      className={`cursor-text select-none min-w-[20px] min-h-[1em] flex items-center justify-center text-center w-full h-full leading-tight ${className}`}
    >
      {value || <span className="opacity-30 italic">{placeholder}</span>}
    </div>
  );
};

// MULTI-HANDLE SENSITIF MOBILE (Ukuran lingkaran disesuaikan menjadi 10x10px agar ramah sentuhan)
const NodeWrapper = ({ children, colorClass, onDelete }) => (
  <div className="relative group p-2">
    
    {/* Tombol X Hapus Manual untuk Pengguna Smartphone */}
    {onDelete && (
      <button 
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        onTouchStart={(e) => { e.stopPropagation(); onDelete(); }}
        className="absolute -top-1 -right-1 w-6 h-6 bg-red-600 hover:bg-red-500 text-white rounded-full flex items-center justify-center text-[10px] font-black z-[100] shadow-xl border border-slate-900 active:scale-75"
      >
        ✕
      </button>
    )}

    {/* Konektor Source (Lingkaran Output Garis) - Tampak Terang dan Jelas di Layar Sentuh HP */}
    <Handle type="source" position={Position.Top} id="t" className={`!w-2.5 !h-2.5 !bg-blue-500 !border-2 !border-white z-50 shadow-md`} />
    <Handle type="source" position={Position.Bottom} id="b" className={`!w-2.5 !h-2.5 !bg-blue-500 !border-2 !border-white z-50 shadow-md`} />
    <Handle type="source" position={Position.Left} id="l" className={`!w-2.5 !h-2.5 !bg-blue-500 !border-2 !border-white z-50 shadow-md`} />
    <Handle type="source" position={Position.Right} id="r" className={`!w-2.5 !h-2.5 !bg-blue-500 !border-2 !border-white z-50 shadow-md`} />
    
    {/* Konektor Target (Titik Penerima Garis Masuk) */}
    <Handle type="target" position={Position.Top} id="t_t" className="!w-2.5 !h-2.5 !bg-slate-700 !border !border-slate-500 z-40" />
    <Handle type="target" position={Position.Bottom} id="b_t" className="!w-2.5 !h-2.5 !bg-slate-700 !border !border-slate-500 z-40" />
    <Handle type="target" position={Position.Left} id="l_t" className="!w-2.5 !h-2.5 !bg-slate-700 !border !border-slate-500 z-40" />
    <Handle type="target" position={Position.Right} id="r_t" className="!w-2.5 !h-2.5 !bg-slate-700 !border !border-slate-500 z-40" />
    
    {children}
  </div>
);

export const StartNode = ({ data }) => (
  <NodeWrapper colorClass="green-400" onDelete={data?.onDeleteMobile}>
    <div className="px-6 py-2 rounded-full border-2 border-green-500 bg-slate-900/90 text-green-400 shadow-[0_0_15px_rgba(34,197,94,0.3)] min-w-[120px]">
      <EditableLabel 
        label={data.label} 
        onChange={(val) => data?.onChange?.(val)} 
        className="text-xs font-bold uppercase tracking-wider"
        placeholder="START/END"
      />
    </div>
  </NodeWrapper>
);

export const ProcessNode = ({ data }) => (
  <NodeWrapper colorClass="blue-400" onDelete={data?.onDeleteMobile}>
    <div className="px-4 py-4 border-2 border-blue-500 bg-slate-900/90 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.3)] min-w-[140px]">
      <EditableLabel 
        label={data.label} 
        onChange={(val) => data?.onChange?.(val)} 
        className="text-xs font-bold uppercase"
        placeholder="PROSES"
      />
    </div>
  </NodeWrapper>
);

export const DecisionNode = ({ data }) => (
  <NodeWrapper colorClass="yellow-400" onDelete={data?.onDeleteMobile}>
    <div className="flex items-center justify-center p-4">
      <div className="relative w-20 h-20 flex items-center justify-center">
        <div className="absolute inset-0 border-2 border-yellow-500 bg-slate-900/90 rotate-45 shadow-[0_0_15px_rgba(234,179,8,0.3)]"></div>
        <div className="relative z-10 p-2 text-center w-full">
          <EditableLabel 
            label={data.label} 
            onChange={(val) => data?.onChange?.(val)} 
            className="text-[9px] font-bold text-yellow-500 leading-tight"
            placeholder="KONDISI?"
          />
        </div>
      </div>
    </div>
  </NodeWrapper>
);

export const InputOutputNode = ({ data }) => (
  <NodeWrapper colorClass="purple-400" onDelete={data?.onDeleteMobile}>
    <div className="relative py-3 px-8 bg-transparent overflow-visible">
      <div className="absolute inset-0 border-2 border-purple-500 bg-slate-900/90 shadow-[0_0_15px_rgba(168,85,247,0.3)]"
           style={{ transform: 'skewX(-20deg)' }}></div>
      
      <div className="relative z-10">
        <EditableLabel 
          label={data.label} 
          onChange={(val) => data?.onChange?.(val)} 
          className="text-xs font-bold text-purple-400"
          placeholder="INPUT/OUTPUT"
        />
      </div>
    </div>
  </NodeWrapper>
);

export const TextNode = ({ data }) => (
  <div className="p-2 bg-transparent text-slate-300 min-w-[80px]">
    <EditableLabel 
      label={data.label} 
      onChange={(val) => data?.onChange?.(val)} 
      className="text-sm font-medium"
      placeholder="Ketik teks..."
    />
  </div>
);