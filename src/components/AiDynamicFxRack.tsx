import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  Activity,
  Sliders,
  Volume2,
  Disc3,
  Layers,
  Wand2,
  RefreshCw,
  Flame,
} from 'lucide-react';
import { DeckState } from '../types/dj';
import { audioEngine } from '../audio/audioEngine';

interface AiDynamicFxRackProps {
  deckA: DeckState;
  deckB: DeckState;
  onDeckFxChange: (deckId: 'deckA' | 'deckB', fxState: any) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const AiDynamicFxRack: React.FC<AiDynamicFxRackProps> = ({
  deckA,
  deckB,
  isOpen,
  onClose,
}) => {
  const [selectedDeckId, setSelectedDeckId] = useState<'deckA' | 'deckB'>('deckA');
  const [isAiAdaptive, setIsAiAdaptive] = useState<boolean>(true);
  const [echoSubdivision, setEchoSubdivision] = useState<'1/8' | '1/4' | '1/2' | '3/4' | '1/1'>('3/4');
  const [echoFeedback, setEchoFeedback] = useState<number>(0.55);
  const [activeMacro, setActiveMacro] = useState<string | null>(null);
  const [macroProgress, setMacroProgress] = useState<number>(0);

  // Real-time spectral intensity monitoring
  const [spectralReadout, setSpectralReadout] = useState({
    intensity: 0,
    bass: 0,
    mid: 0,
    high: 0,
  });

  const activeDeck = selectedDeckId === 'deckA' ? deckA : deckB;

  // Real-time animation loop for intensity monitoring
  useEffect(() => {
    if (!isOpen) return;
    let animId: number;

    const updateMetrics = () => {
      const data = audioEngine.getSpectralIntensity(selectedDeckId);
      setSpectralReadout(data);

      // In AI Adaptive mode, auto-modulate echo feedback and filter resonance with intensity
      if (isAiAdaptive && activeDeck.isPlaying) {
        if (data.intensity > 0.8) {
          // high energy: shorten echo for punch
          audioEngine.setDynamicRhythmEcho(
            selectedDeckId,
            activeDeck.fx.echo.active,
            activeDeck.bpm,
            '1/4',
            0.4
          );
        }
      }

      animId = requestAnimationFrame(updateMetrics);
    };

    animId = requestAnimationFrame(updateMetrics);
    return () => cancelAnimationFrame(animId);
  }, [isOpen, selectedDeckId, isAiAdaptive, activeDeck.isPlaying, activeDeck.bpm, activeDeck.fx.echo.active]);

  if (!isOpen) return null;

  // Macro 1: Riser Build
  const handleTriggerRiserBuild = () => {
    setActiveMacro('riser_build');
    setMacroProgress(0);
    audioEngine.triggerAiRiserBuild(selectedDeckId, 4.0, (progress) => {
      setMacroProgress(progress);
      if (progress >= 100) {
        setTimeout(() => setActiveMacro(null), 500);
      }
    });
  };

  // Macro 2: Washout
  const handleTriggerWashout = () => {
    setActiveMacro('washout');
    setMacroProgress(0);
    audioEngine.triggerAiWashout(selectedDeckId, 3.5);
    let p = 0;
    const interval = setInterval(() => {
      p += 10;
      setMacroProgress(Math.min(100, p));
      if (p >= 100) {
        clearInterval(interval);
        setTimeout(() => setActiveMacro(null), 400);
      }
    }, 350);
  };

  // Macro 3: Vinyl Brake
  const handleTriggerVinylBrake = () => {
    setActiveMacro('vinyl_brake');
    setMacroProgress(0);
    audioEngine.triggerAiVinylBrake(selectedDeckId, 1.8, () => {
      setActiveMacro(null);
    });
  };

  // Toggle Rhythm Echo
  const handleToggleDynamicEcho = () => {
    const nextActive = !activeDeck.fx.echo.active;
    audioEngine.setDynamicRhythmEcho(
      selectedDeckId,
      nextActive,
      activeDeck.bpm,
      echoSubdivision,
      echoFeedback
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs select-none">
      <div className="bg-[#12151f] border border-[#2c344a] rounded-xl w-full max-w-2xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#212739] bg-[#161a28]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-950/80 border border-orange-500/40 text-orange-400">
              <Zap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>AI DYNAMIC FX &amp; MACRO ENGINE</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-cyan-950 border border-cyan-500/60 text-cyan-300">
                  REAL-TIME DSP
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Effects that automatically adapt to rhythm, musical structure, and dancefloor intensity
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
          >
            CHIUDI
          </button>
        </div>

        {/* Deck Selector & AI Adaptive Toggle Bar */}
        <div className="flex items-center justify-between px-4 py-2 border-b border-[#1f2536] bg-[#0e111a] text-xs">
          <div className="flex items-center gap-1.5 bg-[#171b26] p-1 rounded-md border border-[#272f42]">
            <button
              onClick={() => setSelectedDeckId('deckA')}
              className={`px-3 py-1 rounded font-mono font-bold transition ${
                selectedDeckId === 'deckA'
                  ? 'bg-cyan-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              DECK 1 (CYAN)
            </button>
            <button
              onClick={() => setSelectedDeckId('deckB')}
              className={`px-3 py-1 rounded font-mono font-bold transition ${
                selectedDeckId === 'deckB'
                  ? 'bg-orange-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              DECK 2 (ORANGE)
            </button>
          </div>

          {/* AI Adaptive Toggle */}
          <button
            onClick={() => setIsAiAdaptive((prev) => !prev)}
            className={`flex items-center gap-1.5 px-3 py-1 rounded-md border transition font-mono font-bold text-xs ${
              isAiAdaptive
                ? 'bg-cyan-950/90 border-cyan-400 text-cyan-300 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>AI ADAPTIVE: {isAiAdaptive ? 'ON' : 'OFF'}</span>
          </button>
        </div>

        {/* Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Live Intensity Radar & Meters */}
          <div className="bg-[#171b26] border border-[#272f42] rounded-lg p-3 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-emerald-400" />
                Live Musical Spectral Intensity (Web Audio DSP Analyser)
              </span>
              <span className="font-mono text-cyan-400 font-bold text-[11px]">
                {activeDeck.track ? activeDeck.track.title : 'No Track'} ({activeDeck.bpm.toFixed(1)} BPM)
              </span>
            </div>

            {/* 3-Band Spectral Intensity Meters */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-[10px] font-mono">
              <div className="bg-[#0f121a] p-2 rounded border border-slate-800 flex flex-col gap-1">
                <div className="flex justify-between text-rose-400">
                  <span>BASS TRANSIENT</span>
                  <span>{Math.round(spectralReadout.bass * 100)}%</span>
                </div>
                <div className="h-2 bg-slate-900 rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-rose-500 transition-all duration-75"
                    style={{ width: `${Math.min(100, spectralReadout.bass * 100)}%` }}
                  />
                </div>
              </div>

              <div className="bg-[#0f121a] p-2 rounded border border-slate-800 flex flex-col gap-1">
                <div className="flex justify-between text-amber-400">
                  <span>MID HARMONICS</span>
                  <span>{Math.round(spectralReadout.mid * 100)}%</span>
                </div>
                <div className="h-2 bg-slate-900 rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-amber-500 transition-all duration-75"
                    style={{ width: `${Math.min(100, spectralReadout.mid * 100)}%` }}
                  />
                </div>
              </div>

              <div className="bg-[#0f121a] p-2 rounded border border-slate-800 flex flex-col gap-1">
                <div className="flex justify-between text-cyan-400">
                  <span>HIGH AIR / HI-HATS</span>
                  <span>{Math.round(spectralReadout.high * 100)}%</span>
                </div>
                <div className="h-2 bg-slate-900 rounded-sm overflow-hidden">
                  <div
                    className="h-full bg-cyan-400 transition-all duration-75"
                    style={{ width: `${Math.min(100, spectralReadout.high * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: AI One-Touch Performance Macros */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              AI Dynamic Macro Builds (One-Touch Execution)
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Macro 1: Riser Build */}
              <button
                onClick={handleTriggerRiserBuild}
                disabled={activeMacro !== null}
                className={`p-3 rounded-lg border text-left flex flex-col justify-between transition active:scale-95 ${
                  activeMacro === 'riser_build'
                    ? 'bg-amber-950/80 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.5)]'
                    : 'bg-[#181d2a] hover:bg-[#202738] border-[#2c364d]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-amber-400">AI RISER BUILD</span>
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <p className="text-[11px] text-slate-300 leading-tight">
                    Crescendo esponenziale di 4 secondi con sweep HPF e riverbero wash prima del drop.
                  </p>
                </div>
                {activeMacro === 'riser_build' && (
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-amber-400 h-full transition-all duration-75"
                      style={{ width: `${macroProgress}%` }}
                    />
                  </div>
                )}
              </button>

              {/* Macro 2: Washout */}
              <button
                onClick={handleTriggerWashout}
                disabled={activeMacro !== null}
                className={`p-3 rounded-lg border text-left flex flex-col justify-between transition active:scale-95 ${
                  activeMacro === 'washout'
                    ? 'bg-purple-950/80 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.5)]'
                    : 'bg-[#181d2a] hover:bg-[#202738] border-[#2c364d]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-purple-400">AI WASHOUT</span>
                    <Wand2 className="w-3.5 h-3.5 text-purple-400" />
                  </div>
                  <p className="text-[11px] text-slate-300 leading-tight">
                    Coda spaziale di eco e riverbero con abbassamento progressivo del volume per transizioni pulite.
                  </p>
                </div>
                {activeMacro === 'washout' && (
                  <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                    <div
                      className="bg-purple-400 h-full transition-all duration-75"
                      style={{ width: `${macroProgress}%` }}
                    />
                  </div>
                )}
              </button>

              {/* Macro 3: Vinyl Brake */}
              <button
                onClick={handleTriggerVinylBrake}
                disabled={activeMacro !== null}
                className={`p-3 rounded-lg border text-left flex flex-col justify-between transition active:scale-95 ${
                  activeMacro === 'vinyl_brake'
                    ? 'bg-rose-950/80 border-rose-400 shadow-[0_0_12px_rgba(244,63,94,0.5)]'
                    : 'bg-[#181d2a] hover:bg-[#202738] border-[#2c364d]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-xs text-rose-400">VINYL BRAKE</span>
                    <Disc3 className="w-3.5 h-3.5 text-rose-400" />
                  </div>
                  <p className="text-[11px] text-slate-300 leading-tight">
                    Decelerazione organica da spegnimento piatto vinile con fisica di attrito autentica.
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Section 2: AI Dynamic Rhythm Echo */}
          <div className="bg-[#171b26] border border-[#272f42] rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-white block">
                  AI Rhythm-Adaptive Echo (Sincronizzato al BPM)
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  BPM Target: {activeDeck.bpm.toFixed(1)} · Ritardo calcolato in tempo reale
                </span>
              </div>

              <button
                onClick={handleToggleDynamicEcho}
                className={`px-3 py-1.5 rounded font-mono font-bold text-xs transition border ${
                  activeDeck.fx.echo.active
                    ? 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_10px_rgba(6,182,212,0.5)]'
                    : 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white'
                }`}
              >
                {activeDeck.fx.echo.active ? 'ACTIVE' : 'ENGAGE ECHO'}
              </button>
            </div>

            {/* Subdivisions */}
            <div className="flex items-center gap-1.5 pt-1">
              {(['1/8', '1/4', '1/2', '3/4', '1/1'] as const).map((sub) => (
                <button
                  key={sub}
                  onClick={() => {
                    setEchoSubdivision(sub);
                    if (activeDeck.fx.echo.active) {
                      audioEngine.setDynamicRhythmEcho(selectedDeckId, true, activeDeck.bpm, sub, echoFeedback);
                    }
                  }}
                  className={`flex-1 py-1.5 rounded text-xs font-mono font-bold border transition ${
                    echoSubdivision === sub
                      ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-sm'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {sub}
                </button>
              ))}
            </div>

            {/* Echo Feedback Slider */}
            <div className="flex items-center gap-3">
              <span className="text-[10px] font-mono text-slate-400 w-24">FEEDBACK / TAIL:</span>
              <input
                type="range"
                min="0.1"
                max="0.85"
                step="0.05"
                value={echoFeedback}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setEchoFeedback(val);
                  if (activeDeck.fx.echo.active) {
                    audioEngine.setDynamicRhythmEcho(selectedDeckId, true, activeDeck.bpm, echoSubdivision, val);
                  }
                }}
                className="flex-1 h-1 bg-slate-700 rounded appearance-none cursor-pointer accent-cyan-400"
              />
              <span className="text-[10px] font-mono text-cyan-300 w-10 text-right">
                {Math.round(echoFeedback * 100)}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
