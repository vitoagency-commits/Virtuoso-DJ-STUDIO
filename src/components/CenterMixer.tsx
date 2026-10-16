import React from 'react';
import { DeckState, MixerState, DjMode } from '../types/dj';
import { Headphones, SlidersHorizontal, Activity, EyeOff, Volume2, Cable } from 'lucide-react';

interface CenterMixerProps {
  deckA: DeckState;
  deckB: DeckState;
  mixer: MixerState;
  djMode?: DjMode;
  onEqChange: (deckId: 'deckA' | 'deckB', band: 'high' | 'mid' | 'low', val: number) => void;
  onEqKill: (deckId: 'deckA' | 'deckB', band: 'high' | 'mid' | 'low') => void;
  onFilterChange: (deckId: 'deckA' | 'deckB', val: number) => void;
  onGainChange: (deckId: 'deckA' | 'deckB', val: number) => void;
  onVolumeChange: (deckId: 'deckA' | 'deckB', val: number) => void;
  onHeadphoneCue: (deckId: 'deckA' | 'deckB') => void;
  onHeadphoneVolumeChange?: (vol: number) => void;
  onHeadphoneCueMixChange?: (mix: number) => void;
  onToggleMasterCue?: () => void;
  onToggleSplitCue?: () => void;
  onOpenHardwareModal?: () => void;
  onCrossfaderChange: (val: number) => void;
  onCrossfaderCurveChange: (curve: 'smooth' | 'linear' | 'scratch') => void;
  onHideMixer?: () => void;
  isCompact?: boolean;
}

export const CenterMixer: React.FC<CenterMixerProps> = ({
  deckA,
  deckB,
  mixer,
  djMode = 'essential',
  onEqChange,
  onEqKill,
  onFilterChange,
  onGainChange,
  onVolumeChange,
  onHeadphoneCue,
  onHeadphoneVolumeChange,
  onHeadphoneCueMixChange,
  onToggleMasterCue,
  onToggleSplitCue,
  onOpenHardwareModal,
  onCrossfaderChange,
  onCrossfaderCurveChange,
  onHideMixer,
  isCompact = false,
}) => {
  return (
    <div className={`bg-[#10131a] border border-[#232733] rounded-lg ${isCompact ? 'p-1' : 'p-1.5 sm:p-2'} flex flex-col justify-between select-none shadow-xl min-w-0 h-full overflow-hidden shrink-0`}>
      {/* Top Mixer Strip Label */}
      <div className={`flex items-center justify-between ${isCompact ? 'pb-0.5' : 'pb-1'} border-b border-[#1c202a] text-[10px] font-mono text-slate-400`}>
        <span className="text-cyan-400 font-bold">CH 1</span>
        <div className="flex items-center gap-1">
          <span className="font-semibold text-slate-300 text-[8.5px] sm:text-[10px]">
            {djMode === 'starter'
              ? 'MIXER ESSENZIALE'
              : djMode === 'pro'
              ? 'PRO CLUB MIXER'
              : djMode === 'performance'
              ? 'LIVE MIXER'
              : 'STUDIO MIXER'}
          </span>
          {onHideMixer && (
            <button
              onClick={onHideMixer}
              className="p-0.5 rounded hover:bg-slate-800 text-slate-500 hover:text-amber-300 transition cursor-pointer"
              title="Nascondi Mixer virtuale per allargare i Deck 1 e 2 al 100% [M]"
            >
              <EyeOff className="w-3 h-3" />
            </button>
          )}
        </div>
        <span className="text-orange-400 font-bold">CH 2</span>
      </div>

      {/* Dual Channel Strips */}
      <div className={`grid grid-cols-2 ${isCompact ? 'gap-1 py-0.5' : 'gap-2 py-1'} flex-1 min-h-0`}>
        {/* Channel 1 (Deck A) Strip */}
        <ChannelStrip
          deck={deckA}
          deckId="deckA"
          djMode={djMode}
          accentColor="#06b6d4"
          onEqChange={(band, val) => onEqChange('deckA', band, val)}
          onEqKill={(band) => onEqKill('deckA', band)}
          onFilterChange={(val) => onFilterChange('deckA', val)}
          onGainChange={(val) => onGainChange('deckA', val)}
          onVolumeChange={(val) => onVolumeChange('deckA', val)}
          onHeadphoneCue={() => onHeadphoneCue('deckA')}
          isCompact={isCompact}
        />

        {/* Channel 2 (Deck B) Strip */}
        <ChannelStrip
          deck={deckB}
          deckId="deckB"
          djMode={djMode}
          accentColor="#f97316"
          onEqChange={(band, val) => onEqChange('deckB', band, val)}
          onEqKill={(band) => onEqKill('deckB', band)}
          onFilterChange={(val) => onFilterChange('deckB', val)}
          onGainChange={(val) => onGainChange('deckB', val)}
          onVolumeChange={(val) => onVolumeChange('deckB', val)}
          onHeadphoneCue={() => onHeadphoneCue('deckB')}
          isCompact={isCompact}
        />
      </div>

      {/* Headphone Cue & Audio Routing Monitor Bar (Ch 3-4 PFL) */}
      <div className={`bg-[#0b0e16] border border-[#1d2332] rounded-md ${isCompact ? 'p-1 gap-1 my-0.5' : 'p-1.5 gap-1.5 my-1'} flex flex-col font-mono shrink-0`}>
        <div className="flex items-center justify-between text-[9px]">
          <div className="flex items-center gap-1 text-amber-400 font-bold">
            <Headphones className="w-3 h-3" />
            <span>{isCompact ? 'PFL CH 3-4' : 'CUFFIE (CH 3-4)'}</span>
          </div>
          {onOpenHardwareModal && (
            <button
              onClick={onOpenHardwareModal}
              className="px-1.5 py-0.5 rounded bg-emerald-950 hover:bg-emerald-900 border border-emerald-500/50 text-[8px] text-emerald-300 font-bold flex items-center gap-0.5 transition cursor-pointer"
              title="Apri matrice di routing Ch 1-2 e Ch 3-4"
            >
              <Cable className="w-2.5 h-2.5" />
              <span>ROUTING</span>
            </button>
          )}
        </div>

        {/* Headphone Level & Cue Mix Controls */}
        <div className="grid grid-cols-2 gap-1.5 text-[8px] text-slate-400">
          {/* Headphone Volume */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center justify-between">
              <span>VOL</span>
              <span className="text-amber-400 font-bold">{Math.round((mixer.headphoneVolume ?? 0.85) * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1.5"
              step="0.02"
              value={mixer.headphoneVolume ?? 0.85}
              onChange={(e) => onHeadphoneVolumeChange && onHeadphoneVolumeChange(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-400"
              title="Volume Pre-ascolto Cuffie (Ch 3-4)"
            />
          </div>

          {/* Cue Mix (Cue <-> Master) */}
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center justify-between">
              <span>CUE MIX</span>
              <span className="text-cyan-400 font-bold">
                {(mixer.headphoneCueMix ?? 0.5) <= 0.05
                  ? 'CUE'
                  : (mixer.headphoneCueMix ?? 0.5) >= 0.95
                  ? 'MST'
                  : '50/50'}
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.02"
              value={mixer.headphoneCueMix ?? 0.5}
              onChange={(e) => onHeadphoneCueMixChange && onHeadphoneCueMixChange(parseFloat(e.target.value))}
              className="w-full h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
              title="Cue / Master Blend in Cuffia (PFL <-> Master)"
            />
          </div>
        </div>

        {/* Toggles: Master Cue & Split Cue */}
        <div className="flex items-center justify-between gap-1 pt-0.5 border-t border-slate-900">
          {onToggleMasterCue && (
            <button
              onClick={onToggleMasterCue}
              className={`flex-1 py-0.5 rounded text-[8px] font-bold transition border text-center cursor-pointer ${
                mixer.masterCue
                  ? 'bg-cyan-950 border-cyan-400 text-cyan-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
              title="Invia Master in Cuffia"
            >
              MST CUE
            </button>
          )}
          {onToggleSplitCue && (
            <button
              onClick={onToggleSplitCue}
              className={`flex-1 py-0.5 rounded text-[8px] font-bold transition border text-center cursor-pointer ${
                mixer.splitCue
                  ? 'bg-amber-950 border-amber-400 text-amber-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
              }`}
              title="Split Cue (Orecchio Sx: CUE, Orecchio Dx: MASTER)"
            >
              SPLIT CUE
            </button>
          )}
          {/* Mini Cue VU meter */}
          <div className="h-3 w-8 bg-slate-950 rounded-xs overflow-hidden flex gap-0.5 p-0.5 border border-slate-800 shrink-0" title="Livello Audio Cuffie Ch 3-4">
            <div
              className="h-full bg-amber-400 rounded-xs transition-all duration-75"
              style={{ width: `${Math.min(100, (mixer.cueVuLeft ?? 0) * 100)}%` }}
            />
            <div
              className="h-full bg-amber-400 rounded-xs transition-all duration-75"
              style={{ width: `${Math.min(100, (mixer.cueVuRight ?? 0) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Bottom Crossfader Section */}
      <div className={`bg-[#0b0d13] ${isCompact ? 'p-1 gap-1 mt-0.5' : 'p-2 gap-1.5 mt-1'} rounded-md border border-[#1b1f2b] flex flex-col shrink-0`}>
        <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
          <button
            onClick={() => onCrossfaderChange(-1)}
            className="hover:text-cyan-400 transition"
          >
            ◄ CH 1
          </button>

          {/* Curve Selector */}
          <div className="flex items-center gap-0.5 sm:gap-1">
            <span className="text-slate-500 text-[8px]">CURVE:</span>
            {(['smooth', 'linear', 'scratch'] as const).map((curve) => (
              <button
                key={curve}
                onClick={() => onCrossfaderCurveChange(curve)}
                className={`px-1 py-0.5 rounded text-[7.5px] uppercase font-bold transition ${
                  mixer.crossfaderCurve === curve
                    ? 'bg-slate-700 text-cyan-300'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                {curve}
              </button>
            ))}
          </div>

          <button
            onClick={() => onCrossfaderChange(1)}
            className="hover:text-orange-400 transition"
          >
            CH 2 ►
          </button>
        </div>

        {/* Horizontal Crossfader Slider */}
        <div className="relative flex items-center justify-center">
          {/* Center Detent Notch */}
          <div className="absolute top-0 bottom-0 w-0.5 bg-slate-600 pointer-events-none" />
          <input
            type="range"
            min="-1"
            max="1"
            step="0.01"
            value={mixer.crossfader}
            onChange={(e) => onCrossfaderChange(parseFloat(e.target.value))}
            className={`w-full ${isCompact ? 'h-2' : 'h-2.5'} bg-slate-800 rounded-lg appearance-none cursor-pointer accent-white touch-none`}
            title="Crossfader (Left Deck A / Right Deck B)"
          />
        </div>

        <div className="flex items-center justify-center">
          <button
            onClick={() => onCrossfaderChange(0)}
            className="text-[7.5px] font-mono text-slate-500 hover:text-slate-300 px-2 py-0.2"
            title="Center crossfader"
          >
            [ CENTER 0.0 ]
          </button>
        </div>
      </div>
    </div>
  );
};

// Reusable Channel Strip with Knobs & Fader
interface ChannelStripProps {
  deck: DeckState;
  deckId: 'deckA' | 'deckB';
  djMode?: DjMode;
  accentColor: string;
  onEqChange: (band: 'high' | 'mid' | 'low', val: number) => void;
  onEqKill: (band: 'high' | 'mid' | 'low') => void;
  onFilterChange: (val: number) => void;
  onGainChange: (val: number) => void;
  onVolumeChange: (val: number) => void;
  onHeadphoneCue: () => void;
  isCompact?: boolean;
}

const ChannelStrip: React.FC<ChannelStripProps> = ({
  deck,
  djMode = 'essential',
  accentColor,
  onEqChange,
  onEqKill,
  onFilterChange,
  onGainChange,
  onVolumeChange,
  onHeadphoneCue,
  isCompact = false,
}) => {
  const isStarter = djMode === 'starter';
  const isPro = djMode === 'pro';

  return (
    <div className={`flex flex-col items-center ${isCompact ? 'gap-1' : 'gap-2'}`}>
      {/* GAIN TRIM KNOB (Hidden in STARTER mode to avoid distortion for beginners) */}
      {!isStarter && (
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-1">
            <span className="text-[9px] font-mono text-slate-400 uppercase">GAIN</span>
            {isPro && (
              <span className="text-[8px] font-mono text-purple-400 font-bold">
                {deck.gain === 1 ? '0 dB' : deck.gain > 1 ? `+${((deck.gain - 1) * 6).toFixed(1)}dB` : `${((deck.gain - 1) * 6).toFixed(1)}dB`}
              </span>
            )}
          </div>
          <input
            type="range"
            min="0"
            max="1.5"
            step="0.02"
            value={deck.gain}
            onChange={(e) => onGainChange(parseFloat(e.target.value))}
            className="w-16 h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-slate-300"
          />
          <span className="text-[8px] font-mono text-slate-500">{(deck.gain * 100).toFixed(0)}%</span>
        </div>
      )}

      {/* 3-BAND EQ KNOBS + OPTIONAL KILL BUTTONS */}
      {/* High EQ */}
      <div className="flex items-center gap-1.5 w-full justify-between px-1">
        <div className="flex flex-col flex-1">
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
            <span>HI</span>
            <span className="text-[8px] text-slate-500">{deck.eqHigh > 0 ? `+${deck.eqHigh}` : deck.eqHigh}dB</span>
          </div>
          <input
            type="range"
            min="-15"
            max="15"
            step="0.5"
            value={deck.highKill ? -15 : deck.eqHigh}
            onChange={(e) => onEqChange('high', parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-cyan-400"
          />
        </div>
        {!isStarter && (
          <button
            onClick={() => onEqKill('high')}
            className={`px-1 py-0.5 rounded text-[8px] font-mono font-bold transition border shrink-0 ${
              deck.highKill
                ? 'bg-red-950 border-red-500 text-red-300 shadow-[0_0_6px_rgba(239,68,68,0.5)]'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Kill High Frequencies"
          >
            KILL
          </button>
        )}
      </div>

      {/* Mid EQ */}
      <div className="flex items-center gap-1.5 w-full justify-between px-1">
        <div className="flex flex-col flex-1">
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
            <span>MID</span>
            <span className="text-[8px] text-slate-500">{deck.eqMid > 0 ? `+${deck.eqMid}` : deck.eqMid}dB</span>
          </div>
          <input
            type="range"
            min="-15"
            max="15"
            step="0.5"
            value={deck.midKill ? -15 : deck.eqMid}
            onChange={(e) => onEqChange('mid', parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-cyan-400"
          />
        </div>
        {!isStarter && (
          <button
            onClick={() => onEqKill('mid')}
            className={`px-1 py-0.5 rounded text-[8px] font-mono font-bold transition border shrink-0 ${
              deck.midKill
                ? 'bg-red-950 border-red-500 text-red-300 shadow-[0_0_6px_rgba(239,68,68,0.5)]'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Kill Mid Frequencies"
          >
            KILL
          </button>
        )}
      </div>

      {/* Low EQ */}
      <div className="flex items-center gap-1.5 w-full justify-between px-1">
        <div className="flex flex-col flex-1">
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400">
            <span>LOW</span>
            <span className="text-[8px] text-slate-500">{deck.eqLow > 0 ? `+${deck.eqLow}` : deck.eqLow}dB</span>
          </div>
          <input
            type="range"
            min="-15"
            max="15"
            step="0.5"
            value={deck.lowKill ? -15 : deck.eqLow}
            onChange={(e) => onEqChange('low', parseFloat(e.target.value))}
            className="w-full h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-cyan-400"
          />
        </div>
        {!isStarter && (
          <button
            onClick={() => onEqKill('low')}
            className={`px-1 py-0.5 rounded text-[8px] font-mono font-bold transition border shrink-0 ${
              deck.lowKill
                ? 'bg-red-950 border-red-500 text-red-300 shadow-[0_0_6px_rgba(239,68,68,0.5)]'
                : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Kill Bass / Low Frequencies"
          >
            KILL
          </button>
        )}
      </div>

      {/* SOUND COLOR FILTER (-100 LPF to +100 HPF) */}
      <div className="flex flex-col items-center w-full px-1 py-1 border-t border-[#1c202a]">
        <div className="flex items-center justify-between w-full text-[9px] font-mono">
          <span className="text-blue-400">LPF</span>
          <span className="text-slate-300 font-bold">FILTER</span>
          <span className="text-rose-400">HPF</span>
        </div>
        <input
          type="range"
          min="-100"
          max="100"
          step="1"
          value={deck.filter}
          onChange={(e) => onFilterChange(parseFloat(e.target.value))}
          className="w-full h-1.5 bg-slate-700 rounded appearance-none cursor-pointer accent-amber-400 mt-1"
        />
        <button
          onClick={() => onFilterChange(0)}
          className="text-[8px] font-mono text-slate-500 hover:text-slate-300 mt-0.5"
          title="Reset filter to center"
        >
          {deck.filter === 0 ? 'NEUTRAL' : `${deck.filter > 0 ? '+' : ''}${deck.filter}`}
        </button>
      </div>

      {/* HEADPHONE CUE (PFL) */}
      <button
        onClick={onHeadphoneCue}
        className={`px-3 py-1 rounded text-[10px] font-mono font-bold flex items-center gap-1 transition border active:scale-95 ${
          deck.headphoneCue
            ? 'bg-amber-500 border-amber-400 text-slate-950 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
            : 'bg-slate-800 border-slate-700 text-slate-400 hover:text-slate-200'
        }`}
        title="Headphone Monitor Cue"
      >
        <Headphones className="w-3 h-3" />
        <span>CUE</span>
      </button>

      {/* CHANNEL LEVEL FADER & DUAL VU METER */}
      <div className={`flex items-center ${isCompact ? 'gap-1.5' : 'gap-2'} pt-0.5`}>
        {/* Vertical Channel Volume Fader */}
        <div className="flex flex-col items-center">
          <div className={`relative ${isCompact ? 'w-7 h-16' : 'w-8 h-20'} flex items-center justify-center overflow-visible`}>
            <input
              type="range"
              min="0"
              max="1.0"
              step="0.01"
              value={deck.volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className={`${
                isCompact ? 'w-16 h-1.5' : 'w-20 h-2'
              } -rotate-90 appearance-none bg-slate-800 rounded-lg cursor-pointer accent-white origin-center touch-none`}
              title="Channel Volume Fader"
            />
          </div>
          <span className="text-[7.5px] font-mono text-slate-400 mt-0.5">
            {Math.round(deck.volume * 100)}%
          </span>
        </div>

        {/* LED Peak VU Meter Bar */}
        <div className={`${isCompact ? 'h-16 w-1.5' : 'h-20 w-1.5 sm:w-2'} bg-slate-950 rounded-xs overflow-hidden flex flex-col-reverse p-0.5 border border-slate-800`}>
          <div
            className="w-full rounded-xs transition-all duration-75"
            style={{
              height: `${Math.min(100, deck.vuLevel * 100)}%`,
              backgroundColor: deck.vuLevel > 0.85 ? '#ef4444' : deck.vuLevel > 0.65 ? '#f59e0b' : '#10b981',
            }}
          />
        </div>
      </div>
    </div>
  );
};
