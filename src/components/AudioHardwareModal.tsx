import React, { useState } from 'react';
import {
  Cable,
  X,
  Volume2,
  Headphones,
  Sliders,
  CheckCircle2,
  Activity,
  Trash2,
  RefreshCw,
  Zap,
  SlidersHorizontal,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';
import { DetectedAudioDevice, hardwareDetector } from '../audio/hardwareDetector';
import { audioEngine } from '../audio/audioEngine';
import { AudioRoutingMode } from '../types/dj';

interface AudioHardwareModalProps {
  isOpen: boolean;
  onClose: () => void;
  devices: DetectedAudioDevice[];
  routingMode?: AudioRoutingMode;
  onRoutingModeChange?: (mode: AudioRoutingMode) => void;
  masterDeviceId?: string;
  onMasterDeviceChange?: (id: string) => void;
  cueDeviceId?: string;
  onCueDeviceChange?: (id: string) => void;
  headphoneVolume?: number;
  onHeadphoneVolumeChange?: (vol: number) => void;
  headphoneCueMix?: number;
  onHeadphoneCueMixChange?: (mix: number) => void;
  masterCue?: boolean;
  onToggleMasterCue?: () => void;
  splitCue?: boolean;
  onToggleSplitCue?: () => void;
  masterVuLeft?: number;
  masterVuRight?: number;
  cueVuLeft?: number;
  cueVuRight?: number;
}

export const AudioHardwareModal: React.FC<AudioHardwareModalProps> = ({
  isOpen,
  onClose,
  devices,
  routingMode = 'multi_channel_4ch',
  onRoutingModeChange,
  masterDeviceId = 'default',
  onMasterDeviceChange,
  cueDeviceId = 'default',
  onCueDeviceChange,
  headphoneVolume = 0.85,
  onHeadphoneVolumeChange,
  headphoneCueMix = 0.5,
  onHeadphoneCueMixChange,
  masterCue = false,
  onToggleMasterCue,
  splitCue = false,
  onToggleSplitCue,
  masterVuLeft = 0,
  masterVuRight = 0,
  cueVuLeft = 0,
  cueVuRight = 0,
}) => {
  const [testingChannel, setTestingChannel] = useState<'master' | 'cue' | null>(null);

  if (!isOpen) return null;

  const outputDevices = devices.filter((d) => d.kind === 'audiooutput' || d.kind === 'midi_controller');
  const maxHardwareChannels = audioEngine.getContext()?.destination.maxChannelCount || 2;

  const handleTestSignal = (target: 'master' | 'cue') => {
    setTestingChannel(target);
    audioEngine.playTestTone(target);
    setTimeout(() => {
      setTestingChannel(null);
    }, 600);
  };

  const handleSimulateDevice = (preset: any) => {
    hardwareDetector.simulateHardwareConnection(preset);
  };

  const handleDisconnect = (id: string) => {
    hardwareDetector.disconnectDevice(id);
  };

  const handleModeSelect = (mode: AudioRoutingMode) => {
    if (onRoutingModeChange) {
      onRoutingModeChange(mode);
    } else {
      audioEngine.setAudioRoutingMode(mode);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs select-none">
      <div className="bg-[#12151f] border border-[#2c344a] rounded-xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#212739] bg-[#161a28]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-950/80 border border-emerald-500/40 text-emerald-400">
              <Cable className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>AUDIO ROUTING CUFFIE &amp; HARDWARE 4-CANALI</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-emerald-950 border border-emerald-500/60 text-emerald-300">
                  CH 1-2 / CH 3-4 ATTIVI
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Routing professionale per Master (Ch 1-2) e Pre-ascolto Cuffie DJ PFL (Ch 3-4)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
          >
            CHIUDI
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {/* MATRICE AUDIO FISICA 4-CANALI (Visual Diagram) */}
          <div className="bg-gradient-to-r from-[#0d1624] via-[#10192a] to-[#0f1422] border border-cyan-500/30 rounded-xl p-3.5 space-y-3 shadow-lg">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <div className="p-1 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/50">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white tracking-wider font-mono uppercase">
                    Matrice di Routing Uscite Audio (Pioneer FLX4 / Traktor / Scarlett Standard)
                  </h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    Canali hardware fisici rilevati:{' '}
                    <strong className="text-emerald-400">
                      {maxHardwareChannels >= 4 ? `${maxHardwareChannels} Canali (Supporto 4-Ch Nativo OK)` : `${maxHardwareChannels} Canali (Preview Virtuale Attiva)`}
                    </strong>
                  </span>
                </div>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 font-bold">
                LATENZA HARDWARE: &lt; 2.5 ms
              </span>
            </div>

            {/* 4-Channel Matrix Visualizer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {/* MASTER SECTION (Channels 1 & 2) */}
              <div className="bg-[#0b101b] border border-cyan-500/40 rounded-lg p-3 space-y-2 relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-cyan-300 font-bold font-mono text-[11px]">
                    <Volume2 className="w-4 h-4 text-cyan-400" />
                    <span>MASTER OUT: CANALE 1 &amp; 2 (L/R)</span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/50 text-cyan-300 font-bold">
                    CH 1-2 MAIN
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Inviato direttamente all'impianto casse, al mixer da club o ai monitor spia della console.
                </p>

                {/* Master VU Meter Bar */}
                <div className="space-y-1 pt-1 font-mono">
                  <div className="flex items-center justify-between text-[9px] text-slate-400">
                    <span>LIVE VU (CH 1-2)</span>
                    <span className="text-cyan-400 font-bold">
                      {Math.round(masterVuLeft * 100)}% / {Math.round(masterVuRight * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-900 rounded overflow-hidden flex gap-0.5 p-0.5 border border-slate-800">
                    <div
                      className="h-full rounded-xs transition-all duration-75"
                      style={{
                        width: `${Math.min(100, masterVuLeft * 100)}%`,
                        backgroundColor: masterVuLeft > 0.85 ? '#ef4444' : masterVuLeft > 0.65 ? '#f59e0b' : '#06b6d4',
                      }}
                    />
                    <div
                      className="h-full rounded-xs transition-all duration-75"
                      style={{
                        width: `${Math.min(100, masterVuRight * 100)}%`,
                        backgroundColor: masterVuRight > 0.85 ? '#ef4444' : masterVuRight > 0.65 ? '#f59e0b' : '#06b6d4',
                      }}
                    />
                  </div>
                </div>

                {/* Master Output Device Select */}
                <div className="space-y-1 pt-1">
                  <label className="text-[9px] font-mono text-slate-400 block">DISPOSITIVO DIFFUSIONE:</label>
                  <select
                    value={masterDeviceId}
                    onChange={(e) => onMasterDeviceChange && onMasterDeviceChange(e.target.value)}
                    className="w-full bg-[#141926] border border-[#2b364e] rounded px-2 py-1 text-xs text-white font-mono"
                  >
                    <option value="default">Uscita di Sistema Predefinita (Ch 1-2)</option>
                    {outputDevices.map((d) => (
                      <option key={d.id} value={d.id}>
                        [{d.brand}] {d.name} (Ch 1-2)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Test Master Button */}
                <button
                  onClick={() => handleTestSignal('master')}
                  className={`w-full py-1.5 rounded font-mono font-bold text-[10px] flex items-center justify-center gap-1.5 transition border active:scale-95 ${
                    testingChannel === 'master'
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.6)]'
                      : 'bg-cyan-950/80 hover:bg-cyan-900 border-cyan-500/50 text-cyan-300'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>{testingChannel === 'master' ? 'SEGNALE INVIATO SU CH 1-2!' : 'TEST SUONO MASTER (CH 1-2)'}</span>
                </button>
              </div>

              {/* HEADPHONE CUE SECTION (Channels 3 & 4) */}
              <div className="bg-[#120f1b] border border-amber-500/40 rounded-lg p-3 space-y-2 relative overflow-hidden group">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-amber-300 font-bold font-mono text-[11px]">
                    <Headphones className="w-4 h-4 text-amber-400" />
                    <span>PRE-ASCOLTO CUFFIE: CANALE 3 &amp; 4 (L/R)</span>
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-950 border border-amber-500/50 text-amber-300 font-bold">
                    CH 3-4 CUE PFL
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 leading-tight">
                  Inviato alla presa jack frontale cuffie del controller per ascoltare la traccia prima di alzarla!
                </p>

                {/* Cue VU Meter Bar */}
                <div className="space-y-1 pt-1 font-mono">
                  <div className="flex items-center justify-between text-[9px] text-slate-400">
                    <span>LIVE VU CUFFIE (CH 3-4)</span>
                    <span className="text-amber-400 font-bold">
                      {Math.round(cueVuLeft * 100)}% / {Math.round(cueVuRight * 100)}%
                    </span>
                  </div>
                  <div className="h-2 bg-slate-900 rounded overflow-hidden flex gap-0.5 p-0.5 border border-slate-800">
                    <div
                      className="h-full rounded-xs transition-all duration-75"
                      style={{
                        width: `${Math.min(100, cueVuLeft * 100)}%`,
                        backgroundColor: cueVuLeft > 0.85 ? '#ef4444' : cueVuLeft > 0.65 ? '#f59e0b' : '#f59e0b',
                      }}
                    />
                    <div
                      className="h-full rounded-xs transition-all duration-75"
                      style={{
                        width: `${Math.min(100, cueVuRight * 100)}%`,
                        backgroundColor: cueVuRight > 0.85 ? '#ef4444' : cueVuRight > 0.65 ? '#f59e0b' : '#f59e0b',
                      }}
                    />
                  </div>
                </div>

                {/* Cue Output Device Select */}
                <div className="space-y-1 pt-1">
                  <label className="text-[9px] font-mono text-slate-400 block">PRESA JACK CUFFIE DJ:</label>
                  <select
                    value={cueDeviceId}
                    onChange={(e) => onCueDeviceChange && onCueDeviceChange(e.target.value)}
                    className="w-full bg-[#181423] border border-[#3b2d4f] rounded px-2 py-1 text-xs text-white font-mono"
                  >
                    <option value="default">Canale Cuffie Hardware Controller (Ch 3-4)</option>
                    {outputDevices.map((d) => (
                      <option key={d.id} value={d.id}>
                        [{d.brand}] {d.name} (Ch 3-4 Cuffie)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Test Cue Button */}
                <button
                  onClick={() => handleTestSignal('cue')}
                  className={`w-full py-1.5 rounded font-mono font-bold text-[10px] flex items-center justify-center gap-1.5 transition border active:scale-95 ${
                    testingChannel === 'cue'
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.6)]'
                      : 'bg-amber-950/80 hover:bg-amber-900 border-amber-500/50 text-amber-300'
                  }`}
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span>{testingChannel === 'cue' ? 'CHIME INVIATO SU CH 3-4 CUFFIE!' : 'TEST SUONO CUFFIE (CH 3-4)'}</span>
                </button>
              </div>
            </div>

            {/* MODALITÀ DI ROUTING SELEZIONABILI */}
            <div className="space-y-2 pt-1 border-t border-[#232c40]">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                Modalità di Routing Attiva:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono">
                {/* Mode 1: 4-Channel Independent */}
                <button
                  onClick={() => handleModeSelect('multi_channel_4ch')}
                  className={`p-2 rounded text-left transition border flex flex-col gap-0.5 cursor-pointer ${
                    routingMode === 'multi_channel_4ch'
                      ? 'bg-emerald-950/80 border-emerald-400 text-emerald-300 shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                      : 'bg-[#10141e] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[10px]">4-CH HARDWARE</span>
                    {routingMode === 'multi_channel_4ch' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                  </div>
                  <span className="text-[8px] text-slate-400">Ch 1-2 Master + Ch 3-4 Cuffie</span>
                </button>

                {/* Mode 2: Dual USB Devices */}
                <button
                  onClick={() => handleModeSelect('dual_device')}
                  className={`p-2 rounded text-left transition border flex flex-col gap-0.5 cursor-pointer ${
                    routingMode === 'dual_device'
                      ? 'bg-purple-950/80 border-purple-400 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.3)]'
                      : 'bg-[#10141e] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[10px]">DUAL SCHEDE USB</span>
                    {routingMode === 'dual_device' && <CheckCircle2 className="w-3 h-3 text-purple-400" />}
                  </div>
                  <span className="text-[8px] text-slate-400">2 Schede Audio Separate</span>
                </button>

                {/* Mode 3: Split Cable */}
                <button
                  onClick={() => handleModeSelect('split_mono')}
                  className={`p-2 rounded text-left transition border flex flex-col gap-0.5 cursor-pointer ${
                    routingMode === 'split_mono'
                      ? 'bg-amber-950/80 border-amber-400 text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)]'
                      : 'bg-[#10141e] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[10px]">SPLIT-CABLE DJ</span>
                    {routingMode === 'split_mono' && <CheckCircle2 className="w-3 h-3 text-amber-400" />}
                  </div>
                  <span className="text-[8px] text-slate-400">Mono L: Master / R: Cuffie</span>
                </button>

                {/* Mode 4: Stereo Preview */}
                <button
                  onClick={() => handleModeSelect('stereo_preview')}
                  className={`p-2 rounded text-left transition border flex flex-col gap-0.5 cursor-pointer ${
                    routingMode === 'stereo_preview'
                      ? 'bg-blue-950/80 border-blue-400 text-blue-300 shadow-[0_0_10px_rgba(59,130,246,0.3)]'
                      : 'bg-[#10141e] border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[10px]">PREVIEW TEST</span>
                    {routingMode === 'stereo_preview' && <CheckCircle2 className="w-3 h-3 text-blue-400" />}
                  </div>
                  <span className="text-[8px] text-slate-400">Cuffie &amp; Master combinati</span>
                </button>
              </div>
            </div>

            {/* HEADPHONE MONITORING MIXER CONTROLS */}
            <div className="bg-[#0b0e17] border border-[#1e2638] rounded-lg p-3 space-y-2">
              <span className="text-[10px] font-mono text-slate-400 uppercase font-bold flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-amber-400" />
                Controlli di Monitoraggio Cuffie (PFL Master / Cue Mix):
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1 font-mono">
                {/* Volume Cuffie */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-300">
                    <span>VOLUME CUFFIE (HEADPHONE LEVEL)</span>
                    <span className="text-amber-400 font-bold">{Math.round(headphoneVolume * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.5"
                    step="0.02"
                    value={headphoneVolume}
                    onChange={(e) => onHeadphoneVolumeChange && onHeadphoneVolumeChange(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-amber-400"
                  />
                  <div className="flex items-center justify-between text-[8px] text-slate-500">
                    <span>MIN (0%)</span>
                    <span>NOMINALE (100%)</span>
                    <span>BOOST (+6dB)</span>
                  </div>
                </div>

                {/* Cue / Master Mix knob */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-300">
                    <span>CUE / MASTER BLEND (HEADPHONE MIX)</span>
                    <span className="text-cyan-400 font-bold">
                      {headphoneCueMix <= 0.05
                        ? '100% CUE (PFL)'
                        : headphoneCueMix >= 0.95
                        ? '100% MASTER'
                        : `${Math.round((1 - headphoneCueMix) * 100)}% CUE / ${Math.round(headphoneCueMix * 100)}% MST`}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="1.0"
                    step="0.02"
                    value={headphoneCueMix}
                    onChange={(e) => onHeadphoneCueMixChange && onHeadphoneCueMixChange(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
                  />
                  <div className="flex items-center justify-between text-[8px] text-slate-500">
                    <span>◄ SOLO CUE (PFL)</span>
                    <span>50/50 BLEND</span>
                    <span>SOLO MASTER ►</span>
                  </div>
                </div>
              </div>

              {/* Toggles: Master Cue & Split Cue */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                <button
                  onClick={onToggleMasterCue}
                  className={`px-3 py-1.5 rounded font-mono font-bold text-[10px] flex items-center gap-1.5 transition border cursor-pointer ${
                    masterCue
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.5)]'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>MASTER CUE IN CUFFIA: {masterCue ? 'ATTIVO' : 'SPENTO'}</span>
                </button>

                <button
                  onClick={onToggleSplitCue}
                  className={`px-3 py-1.5 rounded font-mono font-bold text-[10px] flex items-center gap-1.5 transition border cursor-pointer ${
                    splitCue
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                      : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
                  }`}
                  title="Invia segnale PFL all'orecchio sinistro e segnale Master all'orecchio destro"
                >
                  <Headphones className="w-3.5 h-3.5" />
                  <span>SPLIT CUE (L: CUE / R: MASTER): {splitCue ? 'ATTIVO' : 'DISATTIVATO'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Sezione: Dispositivi Riconosciuti Attualmente */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Apparecchi Hardware Riconosciuti ({devices.length})
              </h3>
              <button
                onClick={() => hardwareDetector.scanAudioDevices()}
                className="px-2.5 py-1 rounded bg-emerald-900/60 hover:bg-emerald-800 border border-emerald-500/50 text-[10px] font-mono font-bold shrink-0 flex items-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-3 h-3" />
                <span>RI-SCANSIONA PORTE</span>
              </button>
            </div>

            {devices.length === 0 ? (
              <div className="p-4 rounded-lg bg-[#151924] border border-slate-800 text-center text-slate-400">
                Nessun controller USB o scheda audio rilevata. Collega il controller con cavo USB o prova la simulazione qui sotto!
              </div>
            ) : (
              <div className="space-y-2">
                {devices.map((dev) => (
                  <div
                    key={dev.id}
                    className="bg-[#161a26] border border-[#262f44] p-3 rounded-lg flex flex-wrap items-center justify-between gap-3 shadow-xs"
                  >
                    <div className="flex items-start gap-2.5">
                      <div
                        className="w-3 h-3 rounded-full mt-1 shrink-0 shadow-sm"
                        style={{ backgroundColor: dev.brandColor }}
                      />
                      <div>
                        {/* Marca & Tipologia Badge */}
                        <div className="flex flex-wrap items-center gap-1.5 mb-1">
                          <span
                            className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border"
                            style={{
                              backgroundColor: `${dev.brandColor}20`,
                              borderColor: `${dev.brandColor}60`,
                              color: dev.brandColor,
                            }}
                          >
                            MARCA: {dev.brand.toUpperCase()}
                          </span>
                          <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 font-semibold">
                            {dev.categoryLabel}
                          </span>
                          <span
                            className={`text-[9px] font-mono px-1.5 py-0.5 rounded border font-bold ${
                              dev.kind === 'audioinput'
                                ? 'bg-amber-950/70 border-amber-500/50 text-amber-300'
                                : dev.kind === 'midi_controller'
                                ? 'bg-purple-950/70 border-purple-500/50 text-purple-300'
                                : 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300'
                            }`}
                          >
                            {dev.kind === 'audioinput'
                              ? 'ENTRATA (IN)'
                              : dev.kind === 'midi_controller'
                              ? 'SUPERFICIE MIDI'
                              : 'USCITA DIFFUSIONE (OUT)'}
                          </span>
                          {dev.channels >= 4 && (
                            <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-500 text-cyan-300 font-bold">
                              4-CANALI I/O (CH 1-2 &amp; CH 3-4)
                            </span>
                          )}
                        </div>

                        {/* Nome Dispositivo */}
                        <div className="font-bold text-white text-xs sm:text-sm">
                          {dev.name}
                        </div>

                        {/* Parametri Audio */}
                        <div className="text-[10px] text-slate-400 font-mono mt-1 flex flex-wrap items-center gap-3">
                          <span className="text-slate-300">⚡ {dev.channels} Canali I/O</span>
                          <span>• {dev.sampleRate / 1000} kHz / 24-bit Hi-Res</span>
                          <span className="text-emerald-400">● Latenza Ultra-Bassa: {dev.latencyMs} ms</span>
                          <span className="text-cyan-400 font-bold">● Riconoscimento Plug &amp; Play OK</span>
                        </div>
                      </div>
                    </div>

                    {/* Azioni: Scollega */}
                    <div className="flex items-center gap-1.5 font-mono">
                      {dev.isSimulated && (
                        <button
                          onClick={() => handleDisconnect(dev.id)}
                          className="p-1.5 rounded bg-red-950 hover:bg-red-900 border border-red-500/50 text-red-300 transition cursor-pointer"
                          title="Scollega hardware"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sezione: Simulatore Rapido Mixer per Testare il Riconoscimento */}
          <div className="bg-[#171b26] border border-[#272f42] rounded-lg p-3 space-y-2">
            <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Simulatore Hardware DJ con Scheda 4-Canali Integrata
            </h4>
            <p className="text-[11px] text-slate-400">
              Clicca per testare come l'app assegna automaticamente i canali 1-2 al Master e 3-4 alle cuffie:
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono">
              <button
                onClick={() => handleSimulateDevice('pioneer_flx4')}
                className="p-2 rounded bg-[#0f121a] hover:bg-[#1a1e2b] border border-cyan-500/40 text-left transition flex flex-col gap-0.5 active:scale-95 group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-cyan-300 group-hover:underline">Pioneer FLX4</span>
                  <span className="text-[8px] px-1 py-0.2 rounded bg-cyan-950 text-cyan-400 border border-cyan-500/40">4-CANALI</span>
                </div>
                <span className="text-[9px] text-slate-400">Pioneer DJ • Ch 1-2 MST / Ch 3-4 CUE</span>
              </button>

              <button
                onClick={() => handleSimulateDevice('allen_xone96')}
                className="p-2 rounded bg-[#0f121a] hover:bg-[#1a1e2b] border border-orange-500/40 text-left transition flex flex-col gap-0.5 active:scale-95 group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-orange-300 group-hover:underline">A&amp;H Xone:96</span>
                  <span className="text-[8px] px-1 py-0.2 rounded bg-orange-950 text-orange-400 border border-orange-500/40">DUAL USB</span>
                </div>
                <span className="text-[9px] text-slate-400">Allen &amp; Heath • 32-bit Dual Soundcard</span>
              </button>

              <button
                onClick={() => handleSimulateDevice('focusrite_scarlett')}
                className="p-2 rounded bg-[#0f121a] hover:bg-[#1a1e2b] border border-rose-500/40 text-left transition flex flex-col gap-0.5 active:scale-95 group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-rose-300 group-hover:underline">Focusrite 4i4</span>
                  <span className="text-[8px] px-1 py-0.2 rounded bg-rose-950 text-rose-400 border border-rose-500/40">4-OUT</span>
                </div>
                <span className="text-[9px] text-slate-400">Focusrite • Out 1-2 MST / Out 3-4 CUE</span>
              </button>

              <button
                onClick={() => handleSimulateDevice('denon_prime4')}
                className="p-2 rounded bg-[#0f121a] hover:bg-[#1a1e2b] border border-blue-500/40 text-left transition flex flex-col gap-0.5 active:scale-95 group cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[11px] text-blue-300 group-hover:underline">Denon Prime 4</span>
                  <span className="text-[8px] px-1 py-0.2 rounded bg-blue-950 text-blue-400 border border-blue-500/40">CONSOLE</span>
                </div>
                <span className="text-[9px] text-slate-400">Denon DJ • Standalone 4-Deck Engine</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
