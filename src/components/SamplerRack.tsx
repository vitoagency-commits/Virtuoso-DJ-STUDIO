import React from 'react';
import { Volume2, Sparkles, Flame, Zap } from 'lucide-react';
import { audioEngine } from '../audio/audioEngine';

interface SamplerRackProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SamplerRack: React.FC<SamplerRackProps> = ({ isOpen, onClose }) => {
  const [samplerVolume, setSamplerVolume] = React.useState<number>(0.85);

  if (!isOpen) return null;

  const samples = [
    { id: 'airhorn', name: 'AIRHORN', icon: Flame, color: 'text-amber-400 border-amber-500/40' },
    { id: 'siren', name: 'CLUB SIREN', icon: Zap, color: 'text-rose-400 border-rose-500/40' },
    { id: 'laser', name: 'LASER ZAP', icon: Sparkles, color: 'text-emerald-400 border-emerald-500/40' },
    { id: 'subdrop', name: '808 SUB DROP', icon: Flame, color: 'text-purple-400 border-purple-500/40' },
    { id: 'scratch', name: 'SCRATCH CHIRP', icon: Zap, color: 'text-cyan-400 border-cyan-500/40' },
    { id: 'clap', name: 'PERC CLAP', icon: Sparkles, color: 'text-blue-400 border-blue-500/40' },
    { id: 'subdrop', name: 'BASS BOOM', icon: Flame, color: 'text-orange-400 border-orange-500/40' },
    { id: 'airhorn', name: 'FESTIVAL HORN', icon: Zap, color: 'text-yellow-400 border-yellow-500/40' },
  ];

  const handleTrigger = (id: string) => {
    audioEngine.triggerSamplerSound(id, samplerVolume);
  };

  return (
    <div className="bg-[#12151e] border-t border-[#232838] px-3 py-2 select-none">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Flame className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-bold text-white font-mono tracking-wider">
            MASTER SAMPLER RACK
          </span>
        </div>

        {/* Sampler Volume */}
        <div className="flex items-center gap-2">
          <Volume2 className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="range"
            min="0"
            max="1"
            step="0.05"
            value={samplerVolume}
            onChange={(e) => setSamplerVolume(parseFloat(e.target.value))}
            className="w-20 h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-amber-400"
          />
          <button
            onClick={onClose}
            className="text-[10px] font-mono text-slate-400 hover:text-slate-200 ml-2"
          >
            [CLOSE]
          </button>
        </div>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
        {samples.map((s, idx) => {
          const Icon = s.icon;
          return (
            <button
              key={idx}
              onClick={() => handleTrigger(s.id)}
              className={`h-12 rounded-lg bg-[#181c28] hover:bg-[#222838] border p-1.5 flex flex-col items-center justify-center transition active:scale-95 active:bg-amber-600 active:text-white ${s.color}`}
            >
              <Icon className="w-3.5 h-3.5 mb-0.5" />
              <span className="text-[10px] font-mono font-bold">{s.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
