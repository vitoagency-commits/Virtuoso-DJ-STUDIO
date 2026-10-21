import React from 'react';
import { DeckState, PadMode } from '../types/dj';
import { Mic, Music2, Disc3, Drum, Sparkles, VolumeX, Volume2 } from 'lucide-react';

interface PerformancePadsProps {
  deck: DeckState;
  onSetPadMode: (mode: PadMode) => void;
  onHotCueTrigger: (index: number) => void;
  onHotCueClear: (index: number) => void;
  onLoopSelect: (beats: number) => void;
  onStemMuteToggle: (stem: 'vocals' | 'melody' | 'bass' | 'drums') => void;
  onStemVolumeChange: (stem: 'vocals' | 'melody' | 'bass' | 'drums', val: number) => void;
  onTriggerSampler: (soundType: string) => void;
  onToggleFx: (fxName: 'echo' | 'flanger' | 'reverb') => void;
  onBeatRoll: (length: number) => void;
  isCompact?: boolean;
}

export const PerformancePads: React.FC<PerformancePadsProps> = ({
  deck,
  onSetPadMode,
  onHotCueTrigger,
  onHotCueClear,
  onLoopSelect,
  onStemMuteToggle,
  onStemVolumeChange,
  onTriggerSampler,
  onToggleFx,
  onBeatRoll,
  isCompact = false,
}) => {
  const padModes: { id: PadMode; label: string }[] = [
    { id: 'hotcue', label: 'HOT CUE' },
    { id: 'loop', label: 'AUTO LOOP' },
    { id: 'stems', label: 'AI STEMS' },
    { id: 'sampler', label: 'SAMPLER' },
    { id: 'fx', label: 'DJ FX' },
  ];

  return (
    <div className={`bg-[#12141c] border border-[#232838] rounded-lg ${isCompact ? 'p-1 gap-1' : 'p-1.5 gap-1.5'} flex flex-col select-none shrink-0`}>
      {/* Pad Mode Selector Tabs */}
      <div className="grid grid-cols-5 gap-0.5 bg-[#0b0d13] p-0.5 rounded-md border border-[#1b1f2b]">
        {padModes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onSetPadMode(mode.id)}
            className={`py-0.5 ${isCompact ? 'text-[8px]' : 'text-[9px]'} font-mono font-bold rounded transition tracking-wider cursor-pointer active:scale-95 touch-manipulation ${
              deck.activePadMode === mode.id
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-xs'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
            }`}
          >
            {mode.label}
          </button>
        ))}
      </div>

      {/* Pad Content Area */}
      <div className={`${isCompact ? 'min-h-[58px]' : 'min-h-[74px]'} flex items-center justify-center`}>
        {/* 1. HOT CUE MODE */}
        {deck.activePadMode === 'hotcue' && (
          <div className="grid grid-cols-4 gap-1 w-full">
            {deck.hotCues.map((cue, idx) => {
              const hasCue = cue !== null;
              return (
                <button
                  key={idx}
                  onClick={() => onHotCueTrigger(idx)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    onHotCueClear(idx);
                  }}
                  className={`${
                    isCompact ? 'h-7 sm:h-7.5' : 'h-8 sm:h-9'
                  } rounded-md font-mono font-bold flex flex-col items-center justify-center transition border active:scale-95 touch-manipulation cursor-pointer ${
                    hasCue
                      ? 'bg-amber-500/25 border-amber-400 text-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.25)]'
                      : 'bg-[#1a1e2a] hover:bg-[#252b3c] border-[#2b3345] text-slate-500 hover:text-slate-300'
                  }`}
                  title={hasCue ? `Cue ${idx + 1}: ${cue.toFixed(1)}s (Right-click to clear)` : `Set Cue ${idx + 1}`}
                >
                  <span className={`${isCompact ? 'text-[10px]' : 'text-[11px]'} leading-tight`}>CUE {idx + 1}</span>
                  <span className="text-[7px] font-normal opacity-80 leading-none">
                    {hasCue ? `${cue.toFixed(1)}s` : 'EMPTY'}
                  </span>
                </button>
              );
            })}
          </div>
        )}

        {/* 2. AUTO LOOP MODE */}
        {deck.activePadMode === 'loop' && (
          <div className="grid grid-cols-4 gap-1 w-full">
            {[0.25, 0.5, 1, 2, 4, 8, 16, 32].map((beats) => {
              const isCurrent = deck.loopActive && deck.loopLengthBeats === beats;
              return (
                <button
                  key={beats}
                  onClick={() => onLoopSelect(beats)}
                  className={`${
                    isCompact ? 'h-7 sm:h-7.5' : 'h-8 sm:h-9'
                  } rounded-md font-mono font-bold flex flex-col items-center justify-center transition border active:scale-95 touch-manipulation cursor-pointer ${
                    isCurrent
                      ? 'bg-emerald-600 border-emerald-400 text-white shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                      : 'bg-[#1a1e2a] hover:bg-[#252b3c] border-[#2b3345] text-emerald-400'
                  }`}
                >
                  <span className={`${isCompact ? 'text-[11px]' : 'text-xs'} leading-tight`}>{beats < 1 ? `1/${1 / beats}` : beats}</span>
                  <span className="text-[7px] opacity-80 leading-none">BEAT</span>
                </button>
              );
            })}
          </div>
        )}

        {/* 3. AI STEMS MODE (VirtualDJ's Breakthrough Signature Feature) */}
        {deck.activePadMode === 'stems' && (
          <div className={`w-full flex flex-col ${isCompact ? 'gap-1' : 'gap-2'}`}>
            <div className={`grid grid-cols-4 ${isCompact ? 'gap-1' : 'gap-2'}`}>
              {/* Stem: Vocals */}
              <div className={`bg-[#181c28] border border-[#2b3245] rounded-md ${isCompact ? 'p-1 gap-0.5' : 'p-1.5 gap-1'} flex flex-col items-center`}>
                <div className="flex items-center justify-between w-full">
                  <Mic className={`${isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-cyan-400`} />
                  <span className={`${isCompact ? 'text-[8px]' : 'text-[9px]'} font-mono text-cyan-300 font-bold`}>VOCAL</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={deck.stems.vocals}
                  onChange={(e) => onStemVolumeChange('vocals', parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-cyan-400"
                />
                <button
                  onClick={() => onStemMuteToggle('vocals')}
                  className={`w-full ${isCompact ? 'py-0.2 text-[8px]' : 'py-0.5 text-[9px]'} font-mono rounded font-bold transition border ${
                    deck.stems.vocalsMuted
                      ? 'bg-red-950/80 border-red-500 text-red-300'
                      : 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300'
                  }`}
                >
                  {deck.stems.vocalsMuted ? 'MUTED' : 'ON'}
                </button>
              </div>

              {/* Stem: Melody / Instruments */}
              <div className={`bg-[#181c28] border border-[#2b3245] rounded-md ${isCompact ? 'p-1 gap-0.5' : 'p-1.5 gap-1'} flex flex-col items-center`}>
                <div className="flex items-center justify-between w-full">
                  <Music2 className={`${isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-purple-400`} />
                  <span className={`${isCompact ? 'text-[8px]' : 'text-[9px]'} font-mono text-purple-300 font-bold`}>MELODY</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={deck.stems.melody}
                  onChange={(e) => onStemVolumeChange('melody', parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-purple-400"
                />
                <button
                  onClick={() => onStemMuteToggle('melody')}
                  className={`w-full ${isCompact ? 'py-0.2 text-[8px]' : 'py-0.5 text-[9px]'} font-mono rounded font-bold transition border ${
                    deck.stems.melodyMuted
                      ? 'bg-red-950/80 border-red-500 text-red-300'
                      : 'bg-purple-950/70 border-purple-500/50 text-purple-300'
                  }`}
                >
                  {deck.stems.melodyMuted ? 'MUTED' : 'ON'}
                </button>
              </div>

              {/* Stem: Bass */}
              <div className={`bg-[#181c28] border border-[#2b3245] rounded-md ${isCompact ? 'p-1 gap-0.5' : 'p-1.5 gap-1'} flex flex-col items-center`}>
                <div className="flex items-center justify-between w-full">
                  <Disc3 className={`${isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-amber-400`} />
                  <span className={`${isCompact ? 'text-[8px]' : 'text-[9px]'} font-mono text-amber-300 font-bold`}>BASS</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={deck.stems.bass}
                  onChange={(e) => onStemVolumeChange('bass', parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-amber-400"
                />
                <button
                  onClick={() => onStemMuteToggle('bass')}
                  className={`w-full ${isCompact ? 'py-0.2 text-[8px]' : 'py-0.5 text-[9px]'} font-mono rounded font-bold transition border ${
                    deck.stems.bassMuted
                      ? 'bg-red-950/80 border-red-500 text-red-300'
                      : 'bg-amber-950/70 border-amber-500/50 text-amber-300'
                  }`}
                >
                  {deck.stems.bassMuted ? 'MUTED' : 'ON'}
                </button>
              </div>

              {/* Stem: Drums */}
              <div className={`bg-[#181c28] border border-[#2b3245] rounded-md ${isCompact ? 'p-1 gap-0.5' : 'p-1.5 gap-1'} flex flex-col items-center`}>
                <div className="flex items-center justify-between w-full">
                  <Drum className={`${isCompact ? 'w-3 h-3' : 'w-3.5 h-3.5'} text-rose-400`} />
                  <span className={`${isCompact ? 'text-[8px]' : 'text-[9px]'} font-mono text-rose-300 font-bold`}>DRUMS</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={deck.stems.drums}
                  onChange={(e) => onStemVolumeChange('drums', parseFloat(e.target.value))}
                  className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-rose-400"
                />
                <button
                  onClick={() => onStemMuteToggle('drums')}
                  className={`w-full ${isCompact ? 'py-0.2 text-[8px]' : 'py-0.5 text-[9px]'} font-mono rounded font-bold transition border ${
                    deck.stems.drumsMuted
                      ? 'bg-red-950/80 border-red-500 text-red-300'
                      : 'bg-rose-950/70 border-rose-500/50 text-rose-300'
                  }`}
                >
                  {deck.stems.drumsMuted ? 'MUTED' : 'ON'}
                </button>
              </div>
            </div>

            {/* Quick Stem Combos */}
            <div className={`flex items-center justify-between gap-1 ${isCompact ? 'text-[8px]' : 'text-[9px]'} font-mono`}>
              <button
                onClick={() => {
                  onStemVolumeChange('vocals', 1);
                  onStemVolumeChange('melody', 0);
                  onStemVolumeChange('bass', 0);
                  onStemVolumeChange('drums', 0);
                }}
                className={`flex-1 ${isCompact ? 'py-0.5' : 'py-1'} rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-slate-700 active:scale-95`}
              >
                SOLO VOCAL
              </button>
              <button
                onClick={() => {
                  onStemVolumeChange('vocals', 0);
                  onStemVolumeChange('melody', 1);
                  onStemVolumeChange('bass', 1);
                  onStemVolumeChange('drums', 1);
                }}
                className={`flex-1 ${isCompact ? 'py-0.5' : 'py-1'} rounded bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 active:scale-95`}
              >
                SOLO INST
              </button>
              <button
                onClick={() => {
                  onStemVolumeChange('vocals', 1);
                  onStemVolumeChange('melody', 1);
                  onStemVolumeChange('bass', 1);
                  onStemVolumeChange('drums', 1);
                }}
                className={`flex-1 ${isCompact ? 'py-0.5' : 'py-1'} rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 active:scale-95`}
              >
                RESET STEMS
              </button>
            </div>
          </div>
        )}

        {/* 4. SAMPLER MODE */}
        {deck.activePadMode === 'sampler' && (
          <div className="grid grid-cols-4 gap-1.5 w-full">
            {[
              { id: 'airhorn', name: 'AIRHORN', color: 'text-amber-400' },
              { id: 'siren', name: 'SIREN', color: 'text-rose-400' },
              { id: 'laser', name: 'LASER', color: 'text-emerald-400' },
              { id: 'subdrop', name: '808 DROP', color: 'text-purple-400' },
              { id: 'scratch', name: 'SCRATCH', color: 'text-cyan-400' },
              { id: 'clap', name: 'CLAP', color: 'text-blue-400' },
              { id: 'subdrop', name: 'BOOM', color: 'text-orange-400' },
              { id: 'airhorn', name: 'HYPE', color: 'text-yellow-400' },
            ].map((sample, idx) => (
              <button
                key={idx}
                onClick={() => onTriggerSampler(sample.id)}
                className={`${
                  isCompact ? 'h-8 sm:h-8.5' : 'h-11'
                } rounded-md font-mono font-bold flex flex-col items-center justify-center transition border bg-[#1a1e2a] hover:bg-[#252b3c] border-[#2b3345] active:scale-95 active:bg-cyan-900 touch-manipulation cursor-pointer ${sample.color}`}
              >
                <span className={`${isCompact ? 'text-[10px]' : 'text-xs'}`}>{sample.name}</span>
                <span className="text-[7px] text-slate-400">PAD {idx + 1}</span>
              </button>
            ))}
          </div>
        )}

        {/* 5. DJ FX & ROLLS MODE */}
        {deck.activePadMode === 'fx' && (
          <div className="grid grid-cols-4 gap-1.5 w-full">
            <button
              onClick={() => onToggleFx('echo')}
              className={`${
                isCompact ? 'h-8 sm:h-8.5' : 'h-11'
              } rounded-md font-mono font-bold flex flex-col items-center justify-center transition border active:scale-95 touch-manipulation cursor-pointer ${
                deck.fx.echo.active
                  ? 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                  : 'bg-[#1a1e2a] hover:bg-[#252b3c] border-[#2b3345] text-cyan-400'
              }`}
            >
              <span className={`${isCompact ? 'text-[10px]' : 'text-xs'}`}>ECHO</span>
              <span className="text-[7px] opacity-80">3/4 BEAT</span>
            </button>

            <button
              onClick={() => onToggleFx('reverb')}
              className={`${
                isCompact ? 'h-8 sm:h-8.5' : 'h-11'
              } rounded-md font-mono font-bold flex flex-col items-center justify-center transition border active:scale-95 touch-manipulation cursor-pointer ${
                deck.fx.reverb.active
                  ? 'bg-purple-600 border-purple-400 text-white shadow-[0_0_10px_rgba(168,85,247,0.5)]'
                  : 'bg-[#1a1e2a] hover:bg-[#252b3c] border-[#2b3345] text-purple-400'
              }`}
            >
              <span className={`${isCompact ? 'text-[10px]' : 'text-xs'}`}>REVERB</span>
              <span className="text-[7px] opacity-80">HALL</span>
            </button>

            <button
              onClick={() => onBeatRoll(0.25)}
              className={`${
                isCompact ? 'h-8 sm:h-8.5' : 'h-11'
              } rounded-md font-mono font-bold flex flex-col items-center justify-center transition border bg-[#1a1e2a] hover:bg-[#252b3c] border-[#2b3345] text-amber-400 active:scale-95 active:bg-amber-600 active:text-white touch-manipulation cursor-pointer`}
            >
              <span className={`${isCompact ? 'text-[10px]' : 'text-xs'}`}>ROLL 1/4</span>
              <span className="text-[7px] opacity-80">GLITCH</span>
            </button>

            <button
              onClick={() => onBeatRoll(0.125)}
              className={`${
                isCompact ? 'h-8 sm:h-8.5' : 'h-11'
              } rounded-md font-mono font-bold flex flex-col items-center justify-center transition border bg-[#1a1e2a] hover:bg-[#252b3c] border-[#2b3345] text-rose-400 active:scale-95 active:bg-rose-600 active:text-white touch-manipulation cursor-pointer`}
            >
              <span className={`${isCompact ? 'text-[10px]' : 'text-xs'}`}>ROLL 1/8</span>
              <span className="text-[7px] opacity-80">STUTTER</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
