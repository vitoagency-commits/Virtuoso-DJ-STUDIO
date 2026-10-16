import React from 'react';
import { Play, Pause, Disc, Lock, Unlock, Plus, Minus, RotateCcw } from 'lucide-react';
import { DeckState } from '../types/dj';

interface DeckControlsProps {
  deck: DeckState;
  onPlayPause: () => void;
  onCueDown: () => void;
  onCueUp: () => void;
  onSync: () => void;
  onPitchChange: (percent: number) => void;
  onPitchReset: () => void;
  onPitchNudge: (deltaPercent: number) => void;
  onToggleKeyLock: () => void;
  onCyclePitchRange: () => void;
  onToggleLoop: () => void;
  onLoopHalve: () => void;
  onLoopDouble: () => void;
  isActiveDeck?: boolean;
  shortcutPlay?: string;
  shortcutCue?: string;
  shortcutSync?: string;
  onToggleQuantize?: () => void;
  onCycleQuantizeResolution?: () => void;
  isCompact?: boolean;
}

export const DeckControls: React.FC<DeckControlsProps> = ({
  deck,
  onPlayPause,
  onCueDown,
  onCueUp,
  onSync,
  onPitchChange,
  onPitchReset,
  onPitchNudge,
  onToggleKeyLock,
  onCyclePitchRange,
  onToggleLoop,
  onLoopHalve,
  onLoopDouble,
  isActiveDeck = false,
  shortcutPlay,
  shortcutCue,
  shortcutSync,
  onToggleQuantize,
  onCycleQuantizeResolution,
  isCompact = false,
}) => {
  return (
    <div className={`flex items-center justify-between ${isCompact ? 'gap-1.5 px-1 py-0.5' : 'gap-3 px-2 py-1'} w-full select-none shrink-0`}>
      {/* Transport Buttons: SYNC, CUE, PLAY */}
      <div className={`flex flex-col ${isCompact ? 'gap-1' : 'gap-1.5'}`}>
        {/* Sync & Master Status Row */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          <button
            onClick={onSync}
            className={`${isCompact ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'} rounded font-bold font-mono tracking-wider transition border active:scale-95 flex items-center gap-1 touch-manipulation cursor-pointer ${
              deck.isSync
                ? 'bg-blue-600 border-blue-400 text-white shadow-[0_0_10px_rgba(59,130,246,0.6)]'
                : 'bg-[#1b202c] hover:bg-[#252c3d] border-[#30384d] text-slate-300'
            }`}
            title={`Instant BPM and Beat Phase Sync (${shortcutSync || 'S'})`}
          >
            <span>SYNC</span>
            {shortcutSync && !isCompact && (
              <kbd className="text-[9px] font-mono px-1 py-0.2 rounded bg-black/50 border border-white/20 text-blue-200">
                {shortcutSync}
              </kbd>
            )}
          </button>

          <span
            className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold border ${
              deck.isMaster
                ? 'bg-emerald-950 border-emerald-500/60 text-emerald-400'
                : 'bg-slate-900 border-slate-700/50 text-slate-500'
            }`}
          >
            M
          </span>

          {/* Magnetic Quantize Toggle Button */}
          {onToggleQuantize && (
            <button
              onClick={onToggleQuantize}
              className={`px-1.5 py-0.5 rounded text-[9px] font-bold font-mono tracking-wider transition border active:scale-95 flex items-center gap-0.5 touch-manipulation cursor-pointer ${
                deck.quantize
                  ? 'bg-rose-950 border-rose-500 text-rose-300 shadow-[0_0_8px_rgba(244,63,94,0.4)]'
                  : 'bg-[#1b202c] hover:bg-[#252c3d] border-[#30384d] text-slate-500'
              }`}
              title={`Snap Magnetico Beatgrid Quantize (${deck.quantize ? 'ATTIVO' : 'DISATTIVATO'}).`}
            >
              <span>Q</span>
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onCycleQuantizeResolution && onCycleQuantizeResolution();
                }}
                className={`text-[8px] font-mono px-1 rounded border transition cursor-pointer ${
                  deck.quantize
                    ? 'bg-rose-900/60 border-rose-400 text-rose-200'
                    : 'bg-slate-900 border-slate-700 text-slate-500'
                }`}
              >
                {deck.quantizeResolution || '1/1'}
              </span>
            </button>
          )}
        </div>

        {/* Large Transport Buttons */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* CUE Button */}
          <button
            onPointerDown={onCueDown}
            onPointerUp={onCueUp}
            className={`${
              isCompact ? 'w-11 sm:w-13 h-8 sm:h-9' : 'w-12 sm:w-14 h-10 sm:h-11'
            } rounded-lg flex flex-col items-center justify-center font-black text-xs sm:text-sm font-mono tracking-wider transition-all border active:scale-95 relative touch-manipulation cursor-pointer ${
              deck.cuePosition === deck.currentTime
                ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.35)]'
                : 'bg-[#222736] hover:bg-[#2b3245] border-[#384159] text-amber-400'
            }`}
            title={`Set / Stutter Cue Point (${shortcutCue || 'C'})`}
          >
            <span className="text-xs sm:text-sm font-bold leading-none">CUE</span>
            {!isCompact && <span className="text-[7px] text-amber-300/80 font-sans mt-0.5">STUTTER</span>}
          </button>

          {/* PLAY / PAUSE Button */}
          <button
            onClick={onPlayPause}
            className={`${
              isCompact ? 'w-12 sm:w-14 h-8 sm:h-9' : 'w-14 sm:w-16 h-10 sm:h-11'
            } rounded-lg flex flex-col items-center justify-center font-black text-xs sm:text-sm font-mono tracking-wider transition-all border active:scale-95 relative touch-manipulation cursor-pointer ${
              deck.isPlaying
                ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_16px_rgba(16,185,129,0.5)] animate-pulse'
                : 'bg-[#1f2824] hover:bg-[#283830] border-emerald-700/60 text-emerald-400'
            }`}
            title={deck.isPlaying ? `Pause Track (${shortcutPlay || 'SPACE'})` : `Play Track (${shortcutPlay || 'SPACE'})`}
          >
            {deck.isPlaying ? (
              <Pause className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current" />
            ) : (
              <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-current ml-0.5" />
            )}
            {!isCompact && (
              <span className="text-[7px] text-emerald-300 font-sans leading-none mt-0.5">
                {deck.isPlaying ? 'PLAYING' : 'PLAY'}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Quick Loop Controls */}
      <div className={`hidden sm:flex flex-col items-center gap-0.5 bg-[#13161f] ${isCompact ? 'p-1' : 'p-1.5'} rounded-md border border-[#222736]`}>
        <span className="text-[8px] font-mono text-slate-400 uppercase tracking-wider">LOOP</span>
        <div className="flex items-center gap-0.5">
          <button
            onClick={onLoopHalve}
            className={`${isCompact ? 'px-1 py-0.5 text-[9px]' : 'px-1.5 py-0.5 text-[10px]'} rounded font-mono bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 active:scale-95 touch-manipulation cursor-pointer`}
            title="Halve loop length"
          >
            1/2
          </button>
          <button
            onClick={onToggleLoop}
            className={`${isCompact ? 'px-1.5 py-0.5 text-[11px]' : 'px-2 py-0.5 text-xs'} rounded font-mono font-bold transition border active:scale-95 touch-manipulation cursor-pointer ${
              deck.loopActive
                ? 'bg-emerald-950 border-emerald-400 text-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.4)]'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300'
            }`}
            title="Toggle Auto Loop"
          >
            {deck.loopLengthBeats}B
          </button>
          <button
            onClick={onLoopDouble}
            className={`${isCompact ? 'px-1 py-0.5 text-[9px]' : 'px-1.5 py-0.5 text-[10px]'} rounded font-mono bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 active:scale-95 touch-manipulation cursor-pointer`}
            title="Double loop length"
          >
            2X
          </button>
        </div>
      </div>

      {/* Pitch / Tempo Fader Section */}
      <div className={`flex items-center ${isCompact ? 'gap-1 p-1' : 'gap-2 p-1.5'} bg-[#13161f] rounded-md border border-[#222736]`}>
        {/* Pitch Range & Key Lock buttons */}
        <div className={`flex flex-col justify-between ${isCompact ? 'h-16' : 'h-20'} text-[8px] font-mono`}>
          <button
            onClick={onCyclePitchRange}
            className="px-1 py-0.5 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 touch-manipulation cursor-pointer"
            title="Change Pitch Range (±8%, ±16%, ±50%)"
          >
            ±{deck.pitchRange}%
          </button>

          <button
            onClick={onToggleKeyLock}
            className={`p-1 rounded transition border touch-manipulation cursor-pointer ${
              deck.keyLock
                ? 'bg-cyan-950 border-cyan-500 text-cyan-300 shadow-sm'
                : 'bg-slate-800 border-slate-700 text-slate-500'
            }`}
            title="Master Tempo / Key Lock"
          >
            {deck.keyLock ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
          </button>

          <button
            onClick={onPitchReset}
            className="p-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-400 hover:text-slate-200 touch-manipulation cursor-pointer"
            title="Reset pitch to 0.0%"
          >
            <RotateCcw className="w-2.5 h-2.5" />
          </button>
        </div>

        {/* Pitch Bend Nudge Buttons */}
        <div className={`flex flex-col justify-between ${isCompact ? 'h-16' : 'h-20'}`}>
          <button
            onClick={() => onPitchNudge(2)}
            className="p-0.5 sm:p-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 active:bg-cyan-700 touch-manipulation cursor-pointer"
            title="Nudge Tempo +"
          >
            <Plus className="w-2.5 h-2.5" />
          </button>
          <span className="text-[7px] font-mono text-slate-500 text-center">BEND</span>
          <button
            onClick={() => onPitchNudge(-2)}
            className="p-0.5 sm:p-1 rounded bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 active:bg-cyan-700 touch-manipulation cursor-pointer"
            title="Nudge Tempo -"
          >
            <Minus className="w-2.5 h-2.5" />
          </button>
        </div>

        {/* Vertical Pitch Slider */}
        <div className="flex flex-col items-center">
          <span className="text-[8px] font-mono text-slate-400 mb-0.5">
            {deck.pitchPercent > 0 ? `+${deck.pitchPercent.toFixed(1)}%` : `${deck.pitchPercent.toFixed(1)}%`}
          </span>
          <div className={`relative ${isCompact ? 'h-16 w-8' : 'h-20 w-8'} flex items-center justify-center`}>
            {/* Center Zero Detent Notch */}
            <div className="absolute w-3 h-0.5 bg-slate-500 pointer-events-none" />
            <input
              type="range"
              min={-deck.pitchRange}
              max={deck.pitchRange}
              step="0.05"
              value={deck.pitchPercent}
              onChange={(e) => onPitchChange(parseFloat(e.target.value))}
              className={`${isCompact ? 'h-16 -rotate-90 w-16' : 'h-20 -rotate-90 w-20'} appearance-none bg-slate-800 rounded-lg cursor-pointer accent-cyan-400 touch-none`}
              title="Tempo / Pitch Fader"
            />
          </div>
          <span className="text-[7px] font-mono text-slate-500 mt-0.5">TEMPO</span>
        </div>
      </div>
    </div>
  );
};
