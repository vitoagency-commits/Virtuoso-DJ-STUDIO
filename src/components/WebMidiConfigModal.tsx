import React, { useState, useEffect } from 'react';
import {
  Cable,
  X,
  Disc3,
  Sliders,
  Play,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Zap,
  Activity,
  Plus,
  Trash2,
  HelpCircle,
  Radio,
  RefreshCw,
  Cpu,
  Layers,
} from 'lucide-react';
import {
  webMidiManager,
} from '../audio/webMidiManager';
import {
  MidiAction,
  MidiMappingRule,
  MidiActivityEvent,
  DEFAULT_MIDI_PROFILES,
} from '../types/midi';

interface WebMidiConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSimulateMidiAction?: (action: MidiAction, val: number) => void;
}

const ACTION_GROUPS: {
  category: string;
  items: { action: MidiAction; label: string; type: 'button' | 'fader' | 'encoder' }[];
}[] = [
  {
    category: 'DECK 1 (A) - CONTROLLI TRASPORTO',
    items: [
      { action: 'play_pause_deckA', label: 'Play / Pause Deck 1', type: 'button' },
      { action: 'cue_deckA', label: 'CUE Deck 1', type: 'button' },
      { action: 'sync_deckA', label: 'SYNC Tempo Deck 1', type: 'button' },
      { action: 'headphone_cue_deckA', label: 'Pre-ascolto Cuffie (PFL 1)', type: 'button' },
      { action: 'hotcue_1_deckA', label: 'Hot Cue Pad 1 (Deck 1)', type: 'button' },
      { action: 'hotcue_2_deckA', label: 'Hot Cue Pad 2 (Deck 1)', type: 'button' },
      { action: 'hotcue_3_deckA', label: 'Hot Cue Pad 3 (Deck 1)', type: 'button' },
      { action: 'hotcue_4_deckA', label: 'Hot Cue Pad 4 (Deck 1)', type: 'button' },
      { action: 'loop_auto_deckA', label: 'Auto Loop 4 Beats Deck 1', type: 'button' },
      { action: 'loop_in_deckA', label: 'Loop In (Start) Deck 1', type: 'button' },
      { action: 'loop_out_deckA', label: 'Loop Out (End) Deck 1', type: 'button' },
      { action: 'tempo_fader_deckA', label: 'Pitch / Tempo Slider Deck 1', type: 'fader' },
      { action: 'jog_scratch_deckA', label: 'Jog Wheel Scratch / Bend Deck 1', type: 'encoder' },
    ],
  },
  {
    category: 'DECK 1 (A) - MIXER & EQ',
    items: [
      { action: 'volume_deckA', label: 'Fader Volume Canale 1', type: 'fader' },
      { action: 'gain_deckA', label: 'Trim / Gain Canale 1', type: 'fader' },
      { action: 'eq_high_deckA', label: 'EQ Alti (High Treble) 1', type: 'fader' },
      { action: 'eq_mid_deckA', label: 'EQ Medi (Mid Range) 1', type: 'fader' },
      { action: 'eq_low_deckA', label: 'EQ Bassi (Low Sub) 1', type: 'fader' },
      { action: 'filter_deckA', label: 'Sound Color Filter LPF/HPF 1', type: 'fader' },
    ],
  },
  {
    category: 'DECK 2 (B) - CONTROLLI TRASPORTO',
    items: [
      { action: 'play_pause_deckB', label: 'Play / Pause Deck 2', type: 'button' },
      { action: 'cue_deckB', label: 'CUE Deck 2', type: 'button' },
      { action: 'sync_deckB', label: 'SYNC Tempo Deck 2', type: 'button' },
      { action: 'headphone_cue_deckB', label: 'Pre-ascolto Cuffie (PFL 2)', type: 'button' },
      { action: 'hotcue_1_deckB', label: 'Hot Cue Pad 1 (Deck 2)', type: 'button' },
      { action: 'hotcue_2_deckB', label: 'Hot Cue Pad 2 (Deck 2)', type: 'button' },
      { action: 'hotcue_3_deckB', label: 'Hot Cue Pad 3 (Deck 2)', type: 'button' },
      { action: 'hotcue_4_deckB', label: 'Hot Cue Pad 4 (Deck 2)', type: 'button' },
      { action: 'loop_auto_deckB', label: 'Auto Loop 4 Beats Deck 2', type: 'button' },
      { action: 'loop_in_deckB', label: 'Loop In Deck 2', type: 'button' },
      { action: 'loop_out_deckB', label: 'Loop Out Deck 2', type: 'button' },
      { action: 'tempo_fader_deckB', label: 'Pitch / Tempo Slider Deck 2', type: 'fader' },
      { action: 'jog_scratch_deckB', label: 'Jog Wheel Scratch / Bend Deck 2', type: 'encoder' },
    ],
  },
  {
    category: 'DECK 2 (B) - MIXER & EQ',
    items: [
      { action: 'volume_deckB', label: 'Fader Volume Canale 2', type: 'fader' },
      { action: 'gain_deckB', label: 'Trim / Gain Canale 2', type: 'fader' },
      { action: 'eq_high_deckB', label: 'EQ Alti (High Treble) 2', type: 'fader' },
      { action: 'eq_mid_deckB', label: 'EQ Medi (Mid Range) 2', type: 'fader' },
      { action: 'eq_low_deckB', label: 'EQ Bassi (Low Sub) 2', type: 'fader' },
      { action: 'filter_deckB', label: 'Sound Color Filter LPF/HPF 2', type: 'fader' },
    ],
  },
  {
    category: 'MASTER & CROSSFADER',
    items: [
      { action: 'crossfader', label: 'Crossfader (Ch A <-> Ch B)', type: 'fader' },
      { action: 'master_volume', label: 'Master Volume Principale', type: 'fader' },
      { action: 'headphone_volume', label: 'Volume Cuffie Monitor', type: 'fader' },
      { action: 'browser_load_deckA', label: 'Tasto Load su Deck 1', type: 'button' },
      { action: 'browser_load_deckB', label: 'Tasto Load su Deck 2', type: 'button' },
      { action: 'sampler_1', label: 'Trigger Sampler 1 (Airhorn)', type: 'button' },
      { action: 'sampler_2', label: 'Trigger Sampler 2 (Laser)', type: 'button' },
      { action: 'sampler_3', label: 'Trigger Sampler 3 (Drop Siren)', type: 'button' },
      { action: 'sampler_4', label: 'Trigger Sampler 4 (Rewind FX)', type: 'button' },
    ],
  },
];

export const WebMidiConfigModal: React.FC<WebMidiConfigModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [isSupported, setIsSupported] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
  const [devices, setDevices] = useState<{ id: string; name: string; manufacturer: string; state: string }[]>([]);
  const [activeProfile, setActiveProfile] = useState<string>(webMidiManager.getActiveProfileId());
  const [mappings, setMappings] = useState<MidiMappingRule[]>([]);
  const [learnState, setLearnState] = useState(webMidiManager.getLearnState());
  const [recentLogs, setRecentLogs] = useState<MidiActivityEvent[]>([]);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'mappings' | 'learn' | 'monitor' | 'presets'>('mappings');

  useEffect(() => {
    if (!isOpen) return;

    setIsSupported(webMidiManager.getIsSupported());

    // Request MIDI access immediately
    webMidiManager.init().then((success) => {
      setIsInitialized(success);
      setDevices(webMidiManager.getConnectedDevices());
      setMappings(webMidiManager.getActiveMappings());
    });

    const unsubConn = webMidiManager.onConnectionChange(() => {
      setDevices(webMidiManager.getConnectedDevices());
    });

    const unsubActivity = webMidiManager.onActivity((event) => {
      setRecentLogs([...webMidiManager.getRecentLogs()]);
      setLearnState(webMidiManager.getLearnState());
      setMappings(webMidiManager.getActiveMappings());
    });

    return () => {
      unsubConn();
      unsubActivity();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleStartLearn = (action: MidiAction, label: string) => {
    webMidiManager.startLearn(action, label);
    setLearnState(webMidiManager.getLearnState());
    setActiveTab('learn');
  };

  const handleCancelLearn = () => {
    webMidiManager.cancelLearn();
    setLearnState(webMidiManager.getLearnState());
  };

  const handleApplyPreset = (profileId: string) => {
    webMidiManager.resetToProfile(profileId);
    setActiveProfile(profileId);
    setMappings(webMidiManager.getActiveMappings());
  };

  const handleSimulateHardwareMessage = (type: 'noteon' | 'cc', ch: number, ctrl: number, val: number) => {
    webMidiManager.simulateMidiInput(type, ch, ctrl, val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-xs select-none">
      <div className="bg-[#10131d] border border-[#232a3d] rounded-2xl w-full max-w-4xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#1c2233] bg-[#141926]">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-cyan-950/90 border border-cyan-500/50 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.25)]">
              <Cable className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-wide">
                  WEB MIDI CONTROLLER ENGINE
                </h2>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 border border-cyan-500/60 text-cyan-300">
                  PLUG &amp; PLAY 1:1
                </span>
                {devices.length > 0 && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 border border-emerald-500/60 text-emerald-300 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    {devices.length} HARDWARE ATTIVO
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                Supporto diretto controller fisici USB/Bluetooth: Pioneer DDJ, Traktor, Numark, Roland, Akai &amp; MIDI Learn personalizzato
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Live Controller Connection Bar */}
        <div className="px-5 py-2.5 bg-[#0c0e17] border-b border-[#1a2030] flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-mono text-[11px]">DISPOSITIVI RICONOSCIUTI:</span>
            {devices.length === 0 ? (
              <span className="text-amber-400 font-mono text-[11px] flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                In attesa di controller USB/MIDI... (Collega la consolle o usa la simulazione)
              </span>
            ) : (
              <div className="flex items-center gap-2 flex-wrap">
                {devices.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 font-mono text-[11px]"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="font-bold text-white">{d.name}</span>
                    <span className="text-slate-400 text-[10px]">({d.manufacturer || 'MIDI'})</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                webMidiManager.init();
                setDevices(webMidiManager.getConnectedDevices());
              }}
              className="px-2.5 py-1 rounded bg-[#161c2b] hover:bg-[#20273c] border border-slate-700 text-slate-300 font-mono text-[11px] flex items-center gap-1 transition"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Rileva Porte</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-5 pt-3 bg-[#111420] border-b border-[#1c2233] flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveTab('mappings')}
              className={`px-3.5 py-2 rounded-t-lg font-mono text-xs font-bold transition flex items-center gap-2 border-t border-x ${
                activeTab === 'mappings'
                  ? 'bg-[#161b29] border-[#2b354d] text-cyan-300 border-b-2 border-b-transparent'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Mappatura Comandi ({mappings.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('presets')}
              className={`px-3.5 py-2 rounded-t-lg font-mono text-xs font-bold transition flex items-center gap-2 border-t border-x ${
                activeTab === 'presets'
                  ? 'bg-[#161b29] border-[#2b354d] text-cyan-300 border-b-2 border-b-transparent'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Disc3 className="w-3.5 h-3.5" />
              <span>Profili Hardware Preconfigurati</span>
            </button>

            <button
              onClick={() => setActiveTab('learn')}
              className={`px-3.5 py-2 rounded-t-lg font-mono text-xs font-bold transition flex items-center gap-2 border-t border-x ${
                activeTab === 'learn'
                  ? 'bg-[#161b29] border-[#2b354d] text-cyan-300 border-b-2 border-b-transparent'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>MIDI Learn Mode</span>
              {learnState.isActive && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>

            <button
              onClick={() => setActiveTab('monitor')}
              className={`px-3.5 py-2 rounded-t-lg font-mono text-xs font-bold transition flex items-center gap-2 border-t border-x ${
                activeTab === 'monitor'
                  ? 'bg-[#161b29] border-[#2b354d] text-cyan-300 border-b-2 border-b-transparent'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5 text-emerald-400" />
              <span>Live Hex/CC Monitor</span>
            </button>
          </div>

          <div className="pb-2">
            <span className="text-[10px] font-mono text-slate-400">
              Profilo Attivo: <strong className="text-white">{DEFAULT_MIDI_PROFILES.find((p) => p.id === activeProfile)?.name || activeProfile}</strong>
            </span>
          </div>
        </div>

        {/* Tab Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* TAB 1: MAPPINGS LIST */}
          {activeTab === 'mappings' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <input
                  type="text"
                  placeholder="Filtra azione (es: play, eq, crossfader, fader)..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-[#0e111a] border border-[#232b3d] text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-72"
                />

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400 font-mono">
                    Clicca su <strong>MIDI LEARN</strong> per assegnare un tasto/manopola
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                {ACTION_GROUPS.map((group) => {
                  const filteredItems = group.items.filter((item) =>
                    !searchFilter ||
                    item.label.toLowerCase().includes(searchFilter.toLowerCase()) ||
                    item.action.toLowerCase().includes(searchFilter.toLowerCase())
                  );

                  if (filteredItems.length === 0) return null;

                  return (
                    <div key={group.category} className="space-y-2">
                      <div className="text-[11px] font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                        <span>{group.category}</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {filteredItems.map((item) => {
                          const currentRule = mappings.find((m) => m.action === item.action);
                          return (
                            <div
                              key={item.action}
                              className={`p-2.5 rounded-xl border flex items-center justify-between transition ${
                                currentRule
                                  ? 'bg-[#141926] border-[#222a3d] hover:border-cyan-500/50'
                                  : 'bg-[#10131c] border-dashed border-slate-800'
                              }`}
                            >
                              <div className="space-y-0.5">
                                <div className="text-xs font-semibold text-white flex items-center gap-1.5">
                                  <span>{item.label}</span>
                                  <span className="text-[10px] px-1.5 py-0.2 rounded font-mono bg-slate-800 text-slate-400">
                                    {item.type}
                                  </span>
                                </div>
                                <div className="text-[10px] font-mono text-slate-400 flex items-center gap-2">
                                  {currentRule ? (
                                    <>
                                      <span className="text-emerald-400 font-bold">
                                        {currentRule.statusType.toUpperCase()}
                                      </span>
                                      <span>Ch: {currentRule.channel + 1}</span>
                                      <span>N°: {currentRule.controlNumber}</span>
                                      {currentRule.isRelative && (
                                        <span className="text-cyan-400">(Relative Encoder)</span>
                                      )}
                                    </>
                                  ) : (
                                    <span className="text-slate-500 italic">Non mappato</span>
                                  )}
                                </div>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <button
                                  onClick={() => handleStartLearn(item.action, item.label)}
                                  className="px-2.5 py-1 rounded-lg bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-mono text-[10px] font-bold transition flex items-center gap-1 shadow-sm active:scale-95"
                                  title="Assegna muovendo un controllo sul controller fisico"
                                >
                                  <Zap className="w-3 h-3 text-cyan-400" />
                                  <span>LEARN</span>
                                </button>
                                {currentRule && (
                                  <button
                                    onClick={() => {
                                      webMidiManager.removeMapping(currentRule.id);
                                      setMappings(webMidiManager.getActiveMappings());
                                    }}
                                    className="p-1 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-950/40 transition"
                                    title="Rimuovi mappatura"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: MIDI LEARN MODE IN ACTION */}
          {activeTab === 'learn' && (
            <div className="space-y-6 max-w-xl mx-auto py-6 text-center">
              {learnState.isActive ? (
                <div className="p-8 rounded-2xl bg-[#161c2b] border-2 border-amber-500/60 shadow-[0_0_30px_rgba(245,158,11,0.2)] space-y-4">
                  <div className="w-16 h-16 mx-auto rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center text-amber-400 animate-bounce">
                    <Zap className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-wide">
                      IN ASCOLTO DEL CONTROLLER FISICO...
                    </h3>
                    <p className="text-xs text-amber-300 mt-1">
                      Muovi il fader, ruota la manopola o premi il pad sul tuo mixer per assegnare:
                    </p>
                    <div className="mt-3 px-4 py-2 rounded-xl bg-[#0d1017] border border-amber-500/40 inline-block font-mono font-bold text-sm text-cyan-300">
                      🎯 {learnState.targetName || learnState.targetAction}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 font-mono">
                    Il primo messaggio MIDI rilevato (Note On o CC) verrà associato istantaneamente.
                  </p>

                  <div className="pt-2">
                    <button
                      onClick={handleCancelLearn}
                      className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono font-bold transition"
                    >
                      Annulla Ascolto
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-8 rounded-2xl bg-[#131722] border border-[#232b3d] space-y-4">
                  <div className="w-14 h-14 mx-auto rounded-full bg-slate-800/80 flex items-center justify-center text-slate-400">
                    <Zap className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white">
                      Nessun comando in ascolto attivo
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Vai nella scheda <strong>Mappatura Comandi</strong> e premi il pulsante <strong>LEARN</strong> accanto alla funzione desiderata (es. Play Deck 1, Crossfader, EQ Alti).
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('mappings')}
                    className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs transition"
                  >
                    Torna alla lista comandi
                  </button>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: HARDWARE PROFILES PRESETS */}
          {activeTab === 'presets' && (
            <div className="space-y-4">
              <p className="text-xs text-slate-300">
                Seleziona il modello del tuo controller per caricare la mappatura di fabbrica istantanea:
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {DEFAULT_MIDI_PROFILES.map((profile) => {
                  const isCurrent = activeProfile === profile.id;
                  return (
                    <div
                      key={profile.id}
                      className={`p-4 rounded-xl border flex flex-col justify-between gap-3 transition ${
                        isCurrent
                          ? 'bg-[#151c2c] border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                          : 'bg-[#121622] border-[#22293a] hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="text-xs font-mono text-cyan-400 font-bold uppercase">
                            {profile.brand}
                          </div>
                          <div className="text-sm font-bold text-white mt-0.5">
                            {profile.name}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1 font-mono">
                            {profile.mappings.length} funzioni mappate (Jog Wheel, Fader, EQ 3-band, Loop, CUE)
                          </div>
                        </div>

                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 border border-cyan-500/60 text-cyan-300 shrink-0">
                            IN USO
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-[#1c2233]">
                        <span className="text-[10px] text-slate-500 font-mono">
                          Mappatura standard USB-MIDI
                        </span>

                        <button
                          onClick={() => handleApplyPreset(profile.id)}
                          disabled={isCurrent}
                          className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition ${
                            isCurrent
                              ? 'bg-slate-800 text-slate-500 cursor-default'
                              : 'bg-cyan-600 hover:bg-cyan-500 text-slate-950 shadow-sm active:scale-95'
                          }`}
                        >
                          {isCurrent ? 'Profilo Attivo' : 'Carica Profilo'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Hardware Quick Simulator Test */}
              <div className="p-4 rounded-xl bg-[#111624] border border-[#20293d] space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>TEST SIMULAZIONE SEGNALI HARDWARE MIDI (SENZA CAVO)</span>
                  </h4>
                  <span className="text-[10px] font-mono text-slate-400">
                    Verifica il comportamento del mixer e dei deck
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  <button
                    onClick={() => handleSimulateHardwareMessage('noteon', 0, 11, 127)}
                    className="p-2 rounded-lg bg-[#182030] hover:bg-cyan-950/60 border border-slate-700 hover:border-cyan-500/50 text-left transition"
                  >
                    <div className="text-xs font-bold text-white">Play/Pause D1</div>
                    <div className="text-[10px] font-mono text-cyan-400">Note 11 (Ch 1)</div>
                  </button>

                  <button
                    onClick={() => handleSimulateHardwareMessage('noteon', 1, 11, 127)}
                    className="p-2 rounded-lg bg-[#182030] hover:bg-orange-950/60 border border-slate-700 hover:border-orange-500/50 text-left transition"
                  >
                    <div className="text-xs font-bold text-white">Play/Pause D2</div>
                    <div className="text-[10px] font-mono text-orange-400">Note 11 (Ch 2)</div>
                  </button>

                  <button
                    onClick={() => handleSimulateHardwareMessage('cc', 0, 31, 0)}
                    className="p-2 rounded-lg bg-[#182030] hover:bg-slate-700 border border-slate-700 text-left transition"
                  >
                    <div className="text-xs font-bold text-white">Crossfader Deck A</div>
                    <div className="text-[10px] font-mono text-slate-400">CC 31 (Val 0)</div>
                  </button>

                  <button
                    onClick={() => handleSimulateHardwareMessage('cc', 0, 31, 127)}
                    className="p-2 rounded-lg bg-[#182030] hover:bg-slate-700 border border-slate-700 text-left transition"
                  >
                    <div className="text-xs font-bold text-white">Crossfader Deck B</div>
                    <div className="text-[10px] font-mono text-slate-400">CC 31 (Val 127)</div>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: LIVE MONITOR / HEX SNIFFER */}
          {activeTab === 'monitor' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-xs text-slate-300 font-mono flex items-center gap-2">
                  <Activity className="w-4 h-4 text-emerald-400 animate-pulse" />
                  <span>MONITOR SERIALE MIDI IN TEMPO REALE</span>
                  <span className="text-[10px] text-slate-500">({recentLogs.length} eventi registrati)</span>
                </div>

                <button
                  onClick={() => {
                    webMidiManager.clearRecentLogs();
                    setRecentLogs([]);
                  }}
                  className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-[10px] font-mono text-slate-300 transition"
                >
                  Svuota Registro
                </button>
              </div>

              {recentLogs.length === 0 ? (
                <div className="p-8 rounded-xl bg-[#0c0e17] border border-[#1b2233] text-center font-mono text-xs text-slate-500">
                  Nessun pacchetto MIDI ricevuto finora. Collega un controller fisico o premi i tasti del test di simulazione!
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[#090b12] border border-[#1b2233] max-h-80 overflow-y-auto font-mono text-[11px] space-y-1">
                  {recentLogs.map((log, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-1.5 rounded bg-[#10141f] border border-[#192030] hover:bg-[#161c2b] text-slate-300"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] text-slate-500">
                          {new Date(log.timestamp).toLocaleTimeString()}.{String(log.timestamp % 1000).padStart(3, '0')}
                        </span>
                        <span
                          className={`px-1.5 py-0.2 rounded font-bold text-[10px] ${
                            log.statusType === 'noteon'
                              ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                              : log.statusType === 'noteoff'
                              ? 'bg-slate-800 text-slate-400'
                              : 'bg-cyan-950 text-cyan-300 border border-cyan-500/50'
                          }`}
                        >
                          {log.statusType.toUpperCase()}
                        </span>
                        <span className="text-slate-400">Canale: {log.channel + 1}</span>
                        <span className="text-white font-bold">N°: {log.controlNumber}</span>
                        <span className="text-amber-300">Val: {log.value} ({(log.value / 127).toFixed(2)})</span>
                      </div>

                      {log.matchedAction ? (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/40">
                          🎯 {log.matchedAction}
                        </span>
                      ) : (
                        <span className="text-slate-600 text-[10px] italic">Non associato</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3 border-t border-[#1c2233] bg-[#141926] flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <span>
              Latenza hardware stimata: <strong className="text-emerald-400">&lt; 1.5ms (Web MIDI Event Loop)</strong>
            </span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs transition active:scale-95 shadow-md shadow-cyan-500/20"
          >
            SALVA E CHIUDI
          </button>
        </div>
      </div>
    </div>
  );
};
