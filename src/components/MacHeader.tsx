import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Disc3,
  Sliders,
  Smartphone,
  Maximize2,
  Minimize2,
  Volume2,
  Download,
  Flame,
  Radio,
  Music,
  Activity,
  GraduationCap,
  Cable,
  Keyboard,
  ChevronDown,
  Check,
  Zap,
  Layers,
  LayoutGrid,
  Eye,
  EyeOff,
  RotateCcw,
  Tablet,
  Wrench,
} from 'lucide-react';
import {
  UiLayout,
  MixerState,
  DjMode,
  PanelVisibilityState,
  BrowserViewMode,
  PlatterSize,
} from '../types/dj';

export const DJ_MODES: {
  id: DjMode;
  label: string;
  badge: string;
  tagline: string;
  description: string;
  color: string;
}[] = [
  {
    id: 'starter',
    label: 'STARTER',
    badge: 'Principiante',
    tagline: 'Interfaccia semplificata anti-errore',
    description: 'Deck essenziali, pulsanti Play/Cue/Sync grandi, zero manopole superflue o kill switch.',
    color: '#10b981',
  },
  {
    id: 'essential',
    label: 'ESSENTIAL',
    badge: 'Standard Club',
    tagline: 'Il classico 2-deck bilanciato e pulito',
    description: 'Mixer 3 bande EQ, Sound Color Filter, Hot Cue, Loop rapido e browser spazioso.',
    color: '#06b6d4',
  },
  {
    id: 'pro',
    label: 'PRO',
    badge: 'Esperto / DJM',
    tagline: 'Console professionale con Gain & EQ Kill',
    description: 'Gain dedicati, tasti Hi/Mid/Low Kill, Pitch Range 8/16/50%, Slip Mode e opzione 4 Decks.',
    color: '#a855f7',
  },
  {
    id: 'performance',
    label: 'PERFORMANCE',
    badge: 'Live Remix',
    tagline: 'Pads 8-slot, AI Stems isolation e Sampler',
    description: 'Massimo focus sui Performance Pads, Stems Vocals/Bass/Drums, Loop Roll e visualizzatore rapido.',
    color: '#f97316',
  },
];

interface MacHeaderProps {
  layout: UiLayout;
  onLayoutChange: (layout: UiLayout) => void;
  djMode: DjMode;
  onDjModeChange: (mode: DjMode) => void;
  panelVisibility: PanelVisibilityState;
  onTogglePanel: (panel: 'waveforms' | 'mixer' | 'advisor') => void;
  onSetBrowserViewMode: (mode: BrowserViewMode) => void;
  onApplyLayoutPreset: (
    preset: 'standard' | 'max-browser' | 'external-mixer' | 'waveform-focus' | 'live-stage' | 'minimalist-device'
  ) => void;
  mixer: MixerState;
  onMasterVolumeChange: (vol: number) => void;
  onStartRecording: () => void;
  onStopRecording: () => void;
  onOpenAiAssistant: () => void;
  onOpenDynamicFx: () => void;
  onOpenTrackAnalyzer: () => void;
  onOpenManual: () => void;
  onOpenHardware: () => void;
  hardwareDeviceCount: number;
  onOpenMidiConfig?: () => void;
  midiDeviceCount?: number;
  onTriggerAutoMix: () => void;
  onToggleSampler: () => void;
  showSampler: boolean;
  isTouchDevice?: boolean;
  isOffline?: boolean;
  onOpenPresentation?: () => void;
  onOpenKeyboardShortcuts?: () => void;
  onResetDimensions?: () => void;
  platterSize?: PlatterSize;
  onPlatterSizeChange?: (size: PlatterSize) => void;
}

export const MacHeader: React.FC<MacHeaderProps> = ({
  layout,
  onLayoutChange,
  djMode,
  onDjModeChange,
  panelVisibility,
  onTogglePanel,
  onSetBrowserViewMode,
  onApplyLayoutPreset,
  mixer,
  onMasterVolumeChange,
  onStartRecording,
  onStopRecording,
  onOpenAiAssistant,
  onOpenDynamicFx,
  onOpenTrackAnalyzer,
  onOpenManual,
  onOpenHardware,
  hardwareDeviceCount,
  onOpenMidiConfig,
  midiDeviceCount = 0,
  onTriggerAutoMix,
  onToggleSampler,
  showSampler,
  isTouchDevice = false,
  isOffline = false,
  onOpenPresentation,
  onOpenKeyboardShortcuts,
  onResetDimensions,
  platterSize = 'standard',
  onPlatterSizeChange,
}) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isModeDropdownOpen, setIsModeDropdownOpen] = useState(false);
  const [isPanelsDropdownOpen, setIsPanelsDropdownOpen] = useState(false);
  const [isAiToolsOpen, setIsAiToolsOpen] = useState(false);
  const [recordingTimer, setRecordingTimer] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (mixer.isRecording) {
      interval = setInterval(() => {
        setRecordingTimer((prev) => prev + 1);
      }, 1000);
    } else {
      setRecordingTimer(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [mixer.isRecording]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentMode = DJ_MODES.find((m) => m.id === djMode) || DJ_MODES[1];

  return (
    <header className="bg-[#10121a] border-b border-[#212636] select-none text-slate-200 shrink-0 z-30">
      {/* Sleek, Single-Row Responsive Unified Pro DJ Bar */}
      <div className="flex items-center justify-between px-2.5 py-1.5 h-11 sm:h-12 gap-2 text-xs">
        {/* LEFT SECTION: Mac Dots + Brand Logo + Layout Mode & Panels */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Mac Traffic Lights */}
          <div className="hidden sm:flex items-center gap-1.5 mr-1">
            <span
              className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] border border-[#e0443e] inline-block shadow-xs hover:opacity-80 cursor-pointer"
              title="Chiudi"
            />
            <span
              className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] border border-[#dea123] inline-block shadow-xs hover:opacity-80 cursor-pointer"
              title="Riduci"
            />
            <span
              className="w-2.5 h-2.5 rounded-full bg-[#27c93f] border border-[#1aab29] inline-block shadow-xs hover:opacity-80 cursor-pointer"
              onClick={toggleFullscreen}
              title="Schermo Intero"
            />
          </div>

          {/* Logo & Title */}
          <div
            onClick={onOpenPresentation}
            className="flex items-center gap-1.5 font-bold tracking-wider text-slate-100 cursor-pointer hover:opacity-90 transition group mr-1"
            title="Virtuoso DJ Pro Studio 2026"
          >
            <Disc3 className="w-4 h-4 text-cyan-400 group-hover:rotate-45 transition-transform" />
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-orange-400 bg-clip-text text-transparent font-black text-xs sm:text-sm">
              VIRTUOSO
            </span>
            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-cyan-950 border border-cyan-500/40 text-cyan-300 hidden md:inline">
              PRO
            </span>
          </div>

          {/* Layout Mode Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => {
                setIsModeDropdownOpen((v) => !v);
                setIsPanelsDropdownOpen(false);
                setIsAiToolsOpen(false);
              }}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#161a25] hover:bg-[#1e2332] border border-[#2b3346] text-xs font-bold text-slate-200 transition shadow-xs active:scale-95 cursor-pointer"
              title="Cambia modalità console (Starter, Essential, Pro, Live)"
            >
              <span
                className="w-2 h-2 rounded-full shrink-0 shadow-xs"
                style={{ backgroundColor: currentMode.color }}
              />
              <span className="tracking-wide text-white font-extrabold text-[11px]">
                {currentMode.label}
              </span>
              <ChevronDown
                className={`w-3 h-3 text-slate-400 transition-transform ${
                  isModeDropdownOpen ? 'rotate-180 text-cyan-400' : ''
                }`}
              />
            </button>

            {/* Layout Mode Dropdown Menu */}
            {isModeDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsModeDropdownOpen(false)}
                />
                <div className="absolute top-full left-0 mt-1 w-72 sm:w-80 bg-[#121520] border-2 border-slate-700/80 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-2 py-1 mb-1 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider font-bold">
                      MODALITÀ CONSOLE
                    </span>
                    <span className="text-[9px] text-cyan-400 font-mono">Virtuoso Pro</span>
                  </div>

                  <div className="space-y-1">
                    {DJ_MODES.map((mode) => {
                      const isSelected = djMode === mode.id;
                      return (
                        <button
                          key={mode.id}
                          onClick={() => {
                            onDjModeChange(mode.id);
                            setIsModeDropdownOpen(false);
                          }}
                          className={`w-full text-left p-2 rounded-lg transition border flex items-start gap-2.5 cursor-pointer ${
                            isSelected
                              ? 'bg-slate-800/90 border-slate-500 shadow-sm'
                              : 'bg-transparent hover:bg-slate-800/40 border-transparent text-slate-300'
                          }`}
                        >
                          <div
                            className="w-2.5 h-2.5 rounded-full mt-1 shrink-0"
                            style={{ backgroundColor: mode.color }}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span
                                className="font-bold text-xs tracking-wider"
                                style={{ color: isSelected ? mode.color : '#f1f5f9' }}
                              >
                                {mode.label}
                              </span>
                              <span
                                className="text-[8px] font-mono px-1 py-0.2 rounded font-semibold"
                                style={{
                                  backgroundColor: `${mode.color}20`,
                                  color: mode.color,
                                  border: `1px solid ${mode.color}40`,
                                }}
                              >
                                {mode.badge}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">
                              {mode.tagline}
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="w-3.5 h-3.5 shrink-0 mt-0.5 text-cyan-400" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Panels Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => {
                setIsPanelsDropdownOpen((v) => !v);
                setIsModeDropdownOpen(false);
                setIsAiToolsOpen(false);
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#161a25] hover:bg-[#1e2332] border border-[#2b3346] text-xs font-bold text-slate-300 transition shadow-xs active:scale-95 cursor-pointer"
              title="Organizzazione pannelli & viste console"
            >
              <LayoutGrid className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden lg:inline text-[10px] font-mono text-slate-400">PANNELLI:</span>
              <span className="text-white font-mono text-[10px] sm:text-[11px] font-bold">
                {panelVisibility.browser === 'maximized'
                  ? 'MAX BROWSER'
                  : !panelVisibility.mixer
                  ? 'NO MIXER'
                  : !panelVisibility.waveforms
                  ? 'NO WAVE'
                  : 'COMPLETO'}
              </span>
              <ChevronDown
                className={`w-3 h-3 text-slate-400 transition-transform ${
                  isPanelsDropdownOpen ? 'rotate-180 text-cyan-400' : ''
                }`}
              />
            </button>

            {/* Panels & Views Dropdown Menu */}
            {isPanelsDropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsPanelsDropdownOpen(false)}
                />
                <div className="absolute top-full left-0 mt-1 w-76 sm:w-84 bg-[#121520] border-2 border-slate-700/80 rounded-xl shadow-2xl p-2.5 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="px-1 pb-1 mb-2 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider font-bold">
                      PANNELLI &amp; LAYOUT
                    </span>
                    {onResetDimensions && (
                      <button
                        onClick={() => {
                          onResetDimensions();
                          setIsPanelsDropdownOpen(false);
                        }}
                        className="text-[9px] text-cyan-300 hover:text-white font-mono flex items-center gap-1 cursor-pointer"
                      >
                        <RotateCcw className="w-2.5 h-2.5" />
                        <span>RESET PROPORTIONS</span>
                      </button>
                    )}
                  </div>

                  {/* Quick Layout Presets */}
                  <div className="grid grid-cols-2 gap-1.5 mb-2.5">
                    <button
                      onClick={() => {
                        onApplyLayoutPreset('minimalist-device');
                        setIsPanelsDropdownOpen(false);
                      }}
                      className="col-span-2 p-2 rounded-lg border text-left text-xs bg-cyan-950/70 border-cyan-500/60 hover:bg-cyan-900/80 text-cyan-200 cursor-pointer shadow-xs transition"
                    >
                      <div className="font-bold text-[11px] flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Tablet className="w-3.5 h-3.5 text-cyan-400" />
                          <span>📱 Minimalista Device (iPad / Mac 13"-16")</span>
                        </span>
                        <span className="text-[8.5px] px-1.5 py-0.2 rounded bg-cyan-400 text-slate-950 font-black tracking-wider">
                          ZERO OVERFLOW
                        </span>
                      </div>
                      <div className="text-[9.5px] text-cyan-300/80 mt-0.5">
                        Riquadri 100% visibili, proporzioni perfette, zero scroll, console ultra-pulita
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        onApplyLayoutPreset('standard');
                        setIsPanelsDropdownOpen(false);
                      }}
                      className="p-1.5 rounded-lg border text-left text-xs bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200 cursor-pointer"
                    >
                      <div className="font-bold text-[11px]">🌟 Bilanciato</div>
                      <div className="text-[9px] text-slate-400">Wave + Decks + Mixer + Browser</div>
                    </button>
                    <button
                      onClick={() => {
                        onApplyLayoutPreset('max-browser');
                        setIsPanelsDropdownOpen(false);
                      }}
                      className="p-1.5 rounded-lg border text-left text-xs bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200 cursor-pointer"
                    >
                      <div className="font-bold text-[11px]">🔍 Max Libreria [B]</div>
                      <div className="text-[9px] text-slate-400">Browser a tutto schermo</div>
                    </button>
                    <button
                      onClick={() => {
                        onApplyLayoutPreset('external-mixer');
                        setIsPanelsDropdownOpen(false);
                      }}
                      className="p-1.5 rounded-lg border text-left text-xs bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200 cursor-pointer"
                    >
                      <div className="font-bold text-[11px]">🎧 Mixer Esterno [M]</div>
                      <div className="text-[9px] text-slate-400">Deck 50/50 ingranditi</div>
                    </button>
                    <button
                      onClick={() => {
                        onApplyLayoutPreset('live-stage');
                        setIsPanelsDropdownOpen(false);
                      }}
                      className="p-1.5 rounded-lg border text-left text-xs bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-200 cursor-pointer"
                    >
                      <div className="font-bold text-[11px]">⚡ Live Stage</div>
                      <div className="text-[9px] text-slate-400">Zero browser, solo DJ console</div>
                    </button>
                  </div>

                  {/* Individual Panel Toggles */}
                  <div className="space-y-1 pt-1.5 border-t border-slate-800 text-xs">
                    <div className="flex items-center justify-between py-1 px-1.5 rounded bg-slate-900/60">
                      <span className="text-[11px] font-medium text-slate-300">Waveforms Superiori [W]</span>
                      <button
                        onClick={() => onTogglePanel('waveforms')}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                          panelVisibility.waveforms
                            ? 'bg-cyan-600 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {panelVisibility.waveforms ? 'ON' : 'OFF'}
                      </button>
                    </div>

                    <div className="flex items-center justify-between py-1 px-1.5 rounded bg-slate-900/60">
                      <span className="text-[11px] font-medium text-slate-300">Mixer Virtuale [M]</span>
                      <button
                        onClick={() => onTogglePanel('mixer')}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold transition cursor-pointer ${
                          panelVisibility.mixer
                            ? 'bg-purple-600 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {panelVisibility.mixer ? 'ON' : 'OFF'}
                      </button>
                    </div>

                    {/* Platter Size Quick Switch */}
                    {onPlatterSizeChange && (
                      <div className="flex items-center justify-between py-1 px-1.5 rounded bg-slate-900/60">
                        <span className="text-[11px] font-medium text-slate-300">Piatti Jog Wheel</span>
                        <div className="flex items-center gap-1 font-mono text-[9px]">
                          {(['compact', 'standard', 'large', 'maxi'] as const).map((sz) => (
                            <button
                              key={sz}
                              onClick={() => onPlatterSizeChange(sz)}
                              className={`px-1.5 py-0.5 rounded uppercase font-bold transition cursor-pointer ${
                                platterSize === sz
                                  ? 'bg-cyan-600 text-white shadow-xs'
                                  : 'bg-slate-800 text-slate-400 hover:text-white'
                              }`}
                            >
                              {sz === 'compact' ? 'MINI' : sz === 'standard' ? 'NORM' : sz === 'large' ? 'IPAD' : 'MAX'}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Quick Minimalist Device Mode Direct Toggle */}
          <button
            onClick={() => onApplyLayoutPreset(layout === 'ios-touch' ? 'standard' : 'minimalist-device')}
            className={`flex items-center gap-1 px-2 py-1 rounded-md border text-xs font-bold transition shadow-xs active:scale-95 cursor-pointer touch-manipulation ${
              layout === 'ios-touch'
                ? 'bg-cyan-600 border-cyan-400 text-white shadow-[0_0_8px_rgba(6,182,212,0.5)]'
                : 'bg-[#161a25] hover:bg-[#1e2332] border-[#2b3346] text-slate-300'
            }`}
            title="Attiva modalità Minimalista Device (ottimizzata per iPad 13 e MacBook 13-16 senza elementi tagliati)"
          >
            <Tablet className={`w-3.5 h-3.5 ${layout === 'ios-touch' ? 'text-white' : 'text-cyan-400'}`} />
            <span className="hidden xl:inline text-[10px] font-mono text-slate-400">VISTA:</span>
            <span className="text-[10px] sm:text-[11px] font-black tracking-wider">
              {layout === 'ios-touch' ? 'MINIMAL' : 'STUDIO'}
            </span>
          </button>
        </div>

        {/* CENTER SECTION: AI AutoMix + Tools Popover + Hardware Status */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* AI AutoMix Quick Action */}
          {mixer.isAutoMixing ? (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-950/80 border border-cyan-500/50 text-cyan-300 animate-pulse text-xs font-mono">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>MIXING {mixer.autoMixProgress}%</span>
            </div>
          ) : (
            <button
              onClick={onTriggerAutoMix}
              className="group flex items-center gap-1 px-2.5 py-1 rounded-md bg-gradient-to-r from-cyan-950/90 to-blue-900/80 hover:from-cyan-900 hover:to-blue-800 border border-cyan-500/40 text-cyan-300 text-xs font-bold transition shadow-xs active:scale-95 cursor-pointer"
              title="Transizione automatica a tempo AI tra Deck 1 e Deck 2 [A]"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 group-hover:rotate-12 transition-transform" />
              <span className="hidden sm:inline">AUTOMIX</span>
            </button>
          )}

          {/* AI & Studio Tools Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => {
                setIsAiToolsOpen((v) => !v);
                setIsModeDropdownOpen(false);
                setIsPanelsDropdownOpen(false);
              }}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#161a25] hover:bg-[#1e2332] border border-[#2b3346] text-xs font-bold text-amber-300 transition shadow-xs active:scale-95 cursor-pointer"
              title="Strumenti AI, Effetti Dinamici, Analisi e Manuale"
            >
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">STUDIO TOOLS</span>
              <ChevronDown
                className={`w-3 h-3 text-slate-400 transition-transform ${
                  isAiToolsOpen ? 'rotate-180 text-amber-400' : ''
                }`}
              />
            </button>

            {/* AI Tools Popover */}
            {isAiToolsOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsAiToolsOpen(false)}
                />
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1 w-64 sm:w-72 bg-[#121520] border-2 border-slate-700/80 rounded-xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 space-y-1">
                  <button
                    onClick={() => {
                      onOpenDynamicFx();
                      setIsAiToolsOpen(false);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-800/80 flex items-center gap-2.5 text-xs text-amber-300 transition cursor-pointer"
                  >
                    <Flame className="w-4 h-4 text-amber-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white">AI Dynamic FX &amp; Macros</div>
                      <div className="text-[9px] text-slate-400">Riser build, washout, filter sweeps</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onOpenTrackAnalyzer();
                      setIsAiToolsOpen(false);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-800/80 flex items-center gap-2.5 text-xs text-cyan-300 transition cursor-pointer"
                  >
                    <Activity className="w-4 h-4 text-cyan-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white">Analisi Musicale &amp; Struttura</div>
                      <div className="text-[9px] text-slate-400">Key Camelot, drop, breakdown, intro</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onOpenAiAssistant();
                      setIsAiToolsOpen(false);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-800/80 flex items-center gap-2.5 text-xs text-orange-300 transition cursor-pointer"
                  >
                    <Radio className="w-4 h-4 text-orange-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white">AI DJ Co-Pilot</div>
                      <div className="text-[9px] text-slate-400">Suggerimenti di transizione in tempo reale</div>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      onOpenManual();
                      setIsAiToolsOpen(false);
                    }}
                    className="w-full text-left p-2 rounded-lg hover:bg-slate-800/80 flex items-center gap-2.5 text-xs text-blue-300 transition cursor-pointer border-t border-slate-800"
                  >
                    <GraduationCap className="w-4 h-4 text-blue-400 shrink-0" />
                    <div>
                      <div className="font-bold text-white">Manuale &amp; DJ Academy</div>
                      <div className="text-[9px] text-slate-400">Punti esatti, routing Ch 3-4, beatgrid</div>
                    </div>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Combined Hardware & MIDI Pro Pill */}
          <div className="flex items-center gap-1 bg-[#151926] p-0.5 rounded-md border border-[#2b3346]">
            {/* Audio Hardware Modal Trigger */}
            <button
              onClick={onOpenHardware}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-emerald-400 hover:bg-emerald-950/60 transition cursor-pointer"
              title="Audio Routing Matrice: Canali 1-2 Master, Canali 3-4 Cuffie (PFL)"
            >
              <Cable className="w-3 h-3 text-emerald-400" />
              <span className="hidden sm:inline">AUDIO</span>
              <span className="text-[8px] px-1 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40">
                CH 1-4
              </span>
            </button>

            {/* Web MIDI Trigger */}
            {onOpenMidiConfig && (
              <button
                onClick={onOpenMidiConfig}
                className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono font-bold text-cyan-400 hover:bg-cyan-950/60 transition cursor-pointer border-l border-slate-800"
                title="Controller Fisici USB (Pioneer, Traktor, Denon) & MIDI Learn"
              >
                <Disc3 className={`w-3 h-3 ${midiDeviceCount > 0 ? 'text-cyan-400 animate-spin' : 'text-slate-400'}`} />
                <span className="hidden sm:inline">MIDI</span>
                {midiDeviceCount > 0 && (
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                )}
              </button>
            )}
          </div>
        </div>

        {/* RIGHT SECTION: Master Volume, VU Meter, REC, Sampler, Shortcuts, Fullscreen */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Master Volume & Peak VU Meter */}
          <div className="hidden sm:flex items-center gap-2 bg-[#151926] px-2 py-1 rounded-md border border-[#272d3d]">
            <Volume2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <input
              type="range"
              min="0"
              max="1.2"
              step="0.01"
              value={mixer.masterVolume}
              onChange={(e) => onMasterVolumeChange(parseFloat(e.target.value))}
              className="w-14 sm:w-18 h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              title="Volume Master Principale"
            />
            {/* Mini Stereo VU meter */}
            <div className="flex flex-col gap-0.5 w-6 shrink-0">
              <div className="h-1 bg-slate-900 rounded-xs overflow-hidden flex">
                <div
                  className="h-full transition-all duration-75"
                  style={{
                    width: `${Math.min(100, mixer.masterVuLeft * 100)}%`,
                    backgroundColor:
                      mixer.masterVuLeft > 0.85
                        ? '#ef4444'
                        : mixer.masterVuLeft > 0.65
                        ? '#f59e0b'
                        : '#10b981',
                  }}
                />
              </div>
              <div className="h-1 bg-slate-900 rounded-xs overflow-hidden flex">
                <div
                  className="h-full transition-all duration-75"
                  style={{
                    width: `${Math.min(100, mixer.masterVuRight * 100)}%`,
                    backgroundColor:
                      mixer.masterVuRight > 0.85
                        ? '#ef4444'
                        : mixer.masterVuRight > 0.65
                        ? '#f59e0b'
                        : '#10b981',
                  }}
                />
              </div>
            </div>
          </div>

          {/* Recording (REC) Button */}
          {mixer.isRecording ? (
            <button
              onClick={onStopRecording}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-red-950 border border-red-500 text-red-300 text-xs font-mono font-bold animate-pulse cursor-pointer shadow-xs"
              title="Ferma e salva la registrazione del mix"
            >
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
              <span>{formatTimer(recordingTimer)}</span>
              <Download className="w-3 h-3" />
            </button>
          ) : (
            <button
              onClick={onStartRecording}
              className="flex items-center gap-1 px-2 py-1 rounded-md bg-[#181b26] hover:bg-red-950/40 border border-[#2b3346] hover:border-red-500/50 text-slate-300 hover:text-red-400 text-xs font-mono font-bold transition cursor-pointer"
              title="Registra il Master Mix in alta qualità WAV"
            >
              <span className="w-2 h-2 rounded-full bg-red-600 inline-block" />
              <span className="hidden sm:inline">REC</span>
            </button>
          )}

          {/* Sampler Rack Toggle */}
          <button
            onClick={onToggleSampler}
            className={`p-1.5 rounded-md text-xs transition border cursor-pointer ${
              showSampler
                ? 'bg-amber-950 border-amber-500 text-amber-300 shadow-xs'
                : 'bg-[#181b26] hover:bg-[#202534] border-[#2b3346] text-slate-300'
            }`}
            title="Toggle DJ Sampler Pads"
          >
            <Flame className="w-3.5 h-3.5 text-amber-400" />
          </button>

          {/* Keyboard Shortcuts Trigger */}
          {onOpenKeyboardShortcuts && (
            <button
              onClick={onOpenKeyboardShortcuts}
              className="p-1.5 rounded-md bg-[#181b26] hover:bg-[#202534] border border-[#2b3346] text-slate-400 hover:text-cyan-300 transition cursor-pointer"
              title="Scorciatoie da Tastiera [?]"
            >
              <Keyboard className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Fullscreen Button */}
          <button
            onClick={toggleFullscreen}
            className="p-1.5 rounded-md hover:bg-[#181b26] text-slate-400 hover:text-slate-200 transition cursor-pointer"
            title="Schermo Intero [F11]"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>
    </header>
  );
};
