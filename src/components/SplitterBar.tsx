import React from 'react';
import { GripHorizontal, GripVertical, RotateCcw } from 'lucide-react';

interface SplitterBarProps {
  orientation: 'horizontal' | 'vertical';
  isDragging?: boolean;
  onMouseDown: (e: React.MouseEvent) => void;
  onTouchStart?: (e: React.TouchEvent) => void;
  onDoubleClick?: () => void;
  onReset?: () => void;
  label?: string;
  className?: string;
  quickActions?: {
    label: string;
    onClick: () => void;
    active?: boolean;
    title?: string;
  }[];
}

export const SplitterBar: React.FC<SplitterBarProps> = ({
  orientation,
  isDragging = false,
  onMouseDown,
  onTouchStart,
  onDoubleClick,
  onReset,
  label = 'Trascina per ridimensionare • Doppio click per default',
  className = '',
  quickActions,
}) => {
  if (orientation === 'horizontal') {
    return (
      <div
        onMouseDown={onMouseDown}
        onTouchStart={onTouchStart}
        onDoubleClick={onDoubleClick}
        title={label}
        className={`group relative flex items-center justify-between px-3 py-1 bg-[#10131d] hover:bg-[#181d2c] border-y border-[#202636] hover:border-cyan-500/60 cursor-row-resize select-none transition-colors z-20 shrink-0 ${
          isDragging ? 'bg-[#1a2238] border-cyan-400 ring-1 ring-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]' : ''
        } ${className}`}
      >
        {/* Subtle hover line indicator */}
        <div
          className={`absolute inset-x-0 top-1/2 -translate-y-1/2 h-0.5 transition-all ${
            isDragging
              ? 'bg-cyan-400 shadow-[0_0_8px_#06b6d4]'
              : 'bg-transparent group-hover:bg-cyan-500/40'
          }`}
        />

        {/* Left side info / label */}
        <div className="flex items-center gap-1.5 z-10 pointer-events-none">
          <span className="text-[10px] font-mono text-slate-500 group-hover:text-cyan-400 transition-colors uppercase tracking-wider font-semibold">
            SPLITTER
          </span>
          <span className="text-[9px] font-mono text-slate-600 hidden sm:inline">
            ↕ {isDragging ? 'RIDIMENSIONAMENTO ATTIVO...' : 'TRASCINA IN VERTICALE'}
          </span>
        </div>

        {/* Center Pill Grab Handle */}
        <div
          className={`z-10 flex items-center gap-1.5 px-3 py-0.5 rounded-full border transition-all ${
            isDragging
              ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.4)] scale-105'
              : 'bg-[#151926] group-hover:bg-[#1e2538] border-slate-700/70 group-hover:border-cyan-500/50 text-slate-400 group-hover:text-cyan-300'
          }`}
        >
          <GripHorizontal className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[10px] font-mono font-bold tracking-tight">
            {isDragging ? 'RIDIMENSIONA' : 'PANNELLI'}
          </span>
        </div>

        {/* Right side quick actions & Reset */}
        <div className="flex items-center gap-1 z-10">
          {quickActions && quickActions.length > 0 && (
            <div className="flex items-center gap-1 mr-1">
              {quickActions.map((qa, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    qa.onClick();
                  }}
                  className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold border transition cursor-pointer ${
                    qa.active
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                  title={qa.title}
                >
                  {qa.label}
                </button>
              ))}
            </div>
          )}

          {onReset && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onReset();
              }}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-900/90 hover:bg-cyan-950 border border-slate-700 hover:border-cyan-400 text-[9px] font-mono font-bold text-slate-300 hover:text-cyan-300 transition cursor-pointer"
              title="Ripristina altezza predefinita (Doppio click sulla barra)"
            >
              <RotateCcw className="w-2.5 h-2.5 text-cyan-400" />
              <span className="hidden sm:inline">RESET</span>
            </button>
          )}
        </div>
      </div>
    );
  }

  // Vertical Splitter
  return (
    <div
      onMouseDown={onMouseDown}
      onTouchStart={onTouchStart}
      onDoubleClick={onDoubleClick}
      title={label}
      className={`group relative flex flex-col items-center justify-between py-2 px-0.5 bg-[#10131d] hover:bg-[#181d2c] border-x border-[#202636] hover:border-cyan-500/60 cursor-col-resize select-none transition-colors z-20 shrink-0 w-2.5 hover:w-3 ${
        isDragging ? 'bg-[#1a2238] border-cyan-400 ring-1 ring-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.3)] w-3' : ''
      } ${className}`}
    >
      {/* Center line */}
      <div
        className={`absolute inset-y-0 left-1/2 -translate-x-1/2 w-0.5 transition-all ${
          isDragging
            ? 'bg-cyan-400 shadow-[0_0_8px_#06b6d4]'
            : 'bg-transparent group-hover:bg-cyan-500/40'
        }`}
      />

      {/* Top indicator dot */}
      <div
        className={`w-1 h-1 rounded-full transition-colors z-10 ${
          isDragging ? 'bg-cyan-400' : 'bg-slate-600 group-hover:bg-cyan-400'
        }`}
      />

      {/* Center Handle Grip */}
      <div
        className={`z-10 p-0.5 rounded transition-all ${
          isDragging
            ? 'text-cyan-300 bg-cyan-950 shadow-[0_0_8px_rgba(6,182,212,0.5)]'
            : 'text-slate-500 group-hover:text-cyan-300'
        }`}
      >
        <GripVertical className="w-3 h-3" />
      </div>

      {/* Bottom indicator dot */}
      <div
        className={`w-1 h-1 rounded-full transition-colors z-10 ${
          isDragging ? 'bg-cyan-400' : 'bg-slate-600 group-hover:bg-cyan-400'
        }`}
      />
    </div>
  );
};
