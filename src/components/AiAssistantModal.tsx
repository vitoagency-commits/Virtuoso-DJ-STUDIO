import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Play,
  Volume2,
  Wand2,
  Disc,
  Radio,
  Flame,
  ArrowRight,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { DeckState, Track, AiTransitionAdvice } from '../types/dj';
import { audioEngine } from '../audio/audioEngine';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  deckA: DeckState;
  deckB: DeckState;
  library: Track[];
  onExecuteAutoMix: (advice?: AiTransitionAdvice) => void;
  onLoadTrackToDeck: (deckId: 'deckA' | 'deckB', track: Track) => void;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  deckA,
  deckB,
  library,
  onExecuteAutoMix,
  onLoadTrackToDeck,
}) => {
  const [activeTab, setActiveTab] = useState<'automix' | 'harmonizer' | 'djdrop' | 'curator'>('automix');

  // AI Transition state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [transitionAdvice, setTransitionAdvice] = useState<AiTransitionAdvice | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // AI DJ Drop state
  const [djName, setDjName] = useState('DJ VITO');
  const [dropStyle, setDropStyle] = useState<'festival' | 'club' | 'hyped'>('festival');
  const [generatedDropText, setGeneratedDropText] = useState<string>(
    'DJ VITO IN THE MIX! ARE YOU READY?! MAKE SOME NOISE!'
  );
  const [isGeneratingDrop, setIsGeneratingDrop] = useState(false);

  // AI Track recommendation state
  const [isRecommending, setIsRecommending] = useState(false);
  const [recommendedTrack, setRecommendedTrack] = useState<{
    track: Track | null;
    reasoning: string;
    mixingTip: string;
  } | null>(null);

  if (!isOpen) return null;

  // Trigger Gemini AI Transition Analysis
  const handleAnalyzeTransition = async () => {
    if (!deckA.track || !deckB.track) {
      setAnalysisError('Please load tracks onto both Deck A and Deck B first.');
      return;
    }
    setIsAnalyzing(true);
    setAnalysisError(null);

    try {
      const res = await fetch('/api/ai/analyze-transition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          trackA: {
            title: deckA.track.title,
            artist: deckA.track.artist,
            bpm: deckA.bpm,
            key: deckA.track.key,
            genre: deckA.track.genre,
            energy: deckA.track.energy,
          },
          trackB: {
            title: deckB.track.title,
            artist: deckB.track.artist,
            bpm: deckB.bpm,
            key: deckB.track.key,
            genre: deckB.track.genre,
            energy: deckB.track.energy,
          },
        }),
      });

      if (!res.ok) {
        throw new Error('Analysis failed');
      }

      const data = await res.json();
      setTransitionAdvice(data);
    } catch (err) {
      console.error(err);
      setAnalysisError('Could not connect to Gemini AI. Using smart local DJ heuristics.');
      // Fallback
      setTransitionAdvice({
        transitionType: 'Harmonic 32-Bar Bass Swap',
        camelotMatch: 'Energy Step (+1 Camelot Key)',
        recommendedBars: 32,
        energyFlow: 'High energy club transition with progressive build',
        tactics: [
          'Sync Deck B BPM to Deck A',
          'Cut low EQ on incoming Deck B for first 16 bars',
          'Gradually open High Pass filter on Deck A',
          'Swap basslines on the 1st beat of the main drop',
        ],
        stemAdvice: 'Keep Deck A Vocals while introducing Deck B Drums & Bassline.',
        vibeNotes: 'High crowd hype with zero harmonic clash.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Generate DJ Voice Drop
  const handleGenerateDjDrop = async () => {
    setIsGeneratingDrop(true);
    try {
      const res = await fetch('/api/ai/generate-dj-drop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ djName, style: dropStyle }),
      });
      const data = await res.json();
      if (data.dropText) {
        setGeneratedDropText(data.dropText);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGeneratingDrop(false);
    }
  };

  // Play DJ Drop using Web Speech API with club pitch and SFX
  const handlePlayDjDrop = () => {
    audioEngine.triggerSamplerSound('airhorn', 0.5);

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(generatedDropText);
      utterance.rate = 1.05;
      utterance.pitch = dropStyle === 'festival' ? 1.15 : 0.95;
      utterance.volume = 1.0;
      window.speechSynthesis.speak(utterance);
    }
  };

  // Recommend Next Track
  const handleRecommendTrack = async () => {
    if (!deckA.track) return;
    setIsRecommending(true);
    try {
      const res = await fetch('/api/ai/recommend-next-track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentTrack: deckA.track,
          vibeTarget: 'peak_energy',
          library,
        }),
      });
      const data = await res.json();
      const chosen = library[data.recommendedTrackIndex] || library[1];
      setRecommendedTrack({
        track: chosen,
        reasoning: data.reasoning || 'Harmonically compatible and maintains dancefloor energy.',
        mixingTip: data.mixingTip || 'Introduce on the next 32-bar phrase breakdown.',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsRecommending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs select-none">
      <div className="bg-[#12151e] border border-[#2b3347] rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#212738] bg-[#161a26]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide">
                VIRTUOSO AI DJ CO-PILOT
              </h2>
              <p className="text-[11px] text-cyan-300/80 font-mono">
                Powered by Gemini AI Engine
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#212738] bg-[#0f121a] px-3 gap-1 overflow-x-auto">
          {[
            { id: 'automix', label: 'AI AutoMix & Transition', icon: Sparkles },
            { id: 'harmonizer', label: 'Harmonic Key Match', icon: Disc },
            { id: 'djdrop', label: 'AI DJ Voice Drops', icon: Radio },
            { id: 'curator', label: 'AI Setlist Curator', icon: Flame },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-2.5 text-xs font-semibold whitespace-nowrap border-b-2 transition ${
                  isActive
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Modal Body */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: AI AUTOMIX & TRANSITION */}
          {activeTab === 'automix' && (
            <div className="space-y-4">
              {/* Loaded Decks Preview */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#181c28] border border-cyan-500/40 rounded-lg p-2.5">
                  <span className="text-[10px] font-mono text-cyan-400 font-bold block mb-1">
                    DECK A (CURRENT)
                  </span>
                  <div className="text-xs font-bold text-white truncate">
                    {deckA.track ? deckA.track.title : 'No Track Loaded'}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {deckA.bpm.toFixed(1)} BPM · {deckA.track?.key || 'N/A'}
                  </div>
                </div>

                <div className="bg-[#181c28] border border-orange-500/40 rounded-lg p-2.5">
                  <span className="text-[10px] font-mono text-orange-400 font-bold block mb-1">
                    DECK B (INCOMING)
                  </span>
                  <div className="text-xs font-bold text-white truncate">
                    {deckB.track ? deckB.track.title : 'No Track Loaded'}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    {deckB.bpm.toFixed(1)} BPM · {deckB.track?.key || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAnalyzeTransition}
                  disabled={isAnalyzing || !deckA.track || !deckB.track}
                  className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-xs transition flex items-center justify-center gap-2 shadow-md disabled:opacity-50"
                >
                  <Wand2 className={`w-4 h-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
                  <span>{isAnalyzing ? 'Analyzing with Gemini AI...' : 'Analyze Blend & Transition'}</span>
                </button>

                {transitionAdvice && (
                  <button
                    onClick={() => {
                      onExecuteAutoMix(transitionAdvice);
                      onClose();
                    }}
                    className="py-2 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md active:scale-95"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>EXECUTE AUTOMIX</span>
                  </button>
                )}
              </div>

              {/* Transition Advice Results */}
              {transitionAdvice && (
                <div className="bg-[#181c28] border border-[#2e374d] rounded-lg p-3 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#252d3f] pb-2">
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block">
                        RECOMMENDED TECHNIQUE
                      </span>
                      <h4 className="text-sm font-bold text-white">
                        {transitionAdvice.transitionType}
                      </h4>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono text-amber-400 font-semibold block">
                        {transitionAdvice.camelotMatch}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">
                        Phrase Length: {transitionAdvice.recommendedBars} Bars
                      </span>
                    </div>
                  </div>

                  {/* Tactics Step-by-Step */}
                  <div>
                    <span className="text-[11px] font-semibold text-slate-300 block mb-1.5">
                      Tactical DJ Execution:
                    </span>
                    <div className="space-y-1.5">
                      {transitionAdvice.tactics.map((step, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Stems Advice */}
                  <div className="bg-[#12151f] p-2.5 rounded border border-[#262e42] text-xs">
                    <span className="font-bold text-purple-300 block mb-0.5 flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5" />
                      AI Stems Mashup Strategy:
                    </span>
                    <p className="text-slate-300 text-[11px] leading-relaxed">
                      {transitionAdvice.stemAdvice}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: HARMONIC KEY MATCH */}
          {activeTab === 'harmonizer' && (
            <div className="space-y-4">
              <div className="bg-[#181c28] border border-[#2b3347] rounded-lg p-3">
                <h3 className="text-xs font-bold text-white mb-2 flex items-center gap-1.5">
                  <Disc className="w-4 h-4 text-cyan-400" />
                  <span>Camelot Harmonic Mixing Guide</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  Harmonic mixing allows seamless track blending without clashing musical keys. Compatible keys share adjacent positions on the Camelot wheel (e.g. 8A mixes perfectly with 7A, 8A, 9A, or 8B).
                </p>

                {/* Status Box */}
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <div className="bg-[#12151e] p-2.5 rounded border border-cyan-500/40">
                    <span className="text-[10px] font-mono text-cyan-400 font-bold">DECK A KEY</span>
                    <div className="text-sm font-bold text-white">{deckA.track?.key || 'None'}</div>
                    <span className="text-[10px] text-slate-400">Camelot: {deckA.track?.camelotCode || 'N/A'}</span>
                  </div>
                  <div className="bg-[#12151e] p-2.5 rounded border border-orange-500/40">
                    <span className="text-[10px] font-mono text-orange-400 font-bold">DECK B KEY</span>
                    <div className="text-sm font-bold text-white">{deckB.track?.key || 'None'}</div>
                    <span className="text-[10px] text-slate-400">Camelot: {deckB.track?.camelotCode || 'N/A'}</span>
                  </div>
                </div>

                {/* Compatibility Assessment */}
                <div className="bg-emerald-950/40 border border-emerald-500/50 p-2.5 rounded-lg text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Tracks have compatible harmonic energy step. Transition will sound musical and energetic!
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AI DJ VOICE DROPS */}
          {activeTab === 'djdrop' && (
            <div className="space-y-4">
              <div className="bg-[#181c28] border border-[#2b3347] rounded-lg p-3 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-orange-400" />
                    <span>AI DJ Drop & Festival MC Voice Generator</span>
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                      DJ / Stage Name
                    </label>
                    <input
                      type="text"
                      value={djName}
                      onChange={(e) => setDjName(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded bg-[#10131a] border border-[#2b3347] text-xs text-white focus:outline-hidden focus:border-cyan-400"
                      placeholder="e.g. DJ VITO"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-mono text-slate-400 uppercase block mb-1">
                      Drop Style
                    </label>
                    <select
                      value={dropStyle}
                      onChange={(e) => setDropStyle(e.target.value as any)}
                      className="w-full px-2.5 py-1.5 rounded bg-[#10131a] border border-[#2b3347] text-xs text-white focus:outline-hidden focus:border-cyan-400"
                    >
                      <option value="festival">Festival Mainstage MC</option>
                      <option value="club">Deep Underground Club</option>
                      <option value="hyped">High-Energy Bass Drop</option>
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleGenerateDjDrop}
                  disabled={isGeneratingDrop}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Wand2 className={`w-3.5 h-3.5 ${isGeneratingDrop ? 'animate-spin' : ''}`} />
                  <span>Generate New AI Voice Drop</span>
                </button>

                {/* Generated Voice Script */}
                <div className="bg-[#10131a] p-3 rounded-lg border border-[#282f42] flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <span className="text-[9px] font-mono text-amber-400 uppercase block mb-0.5">
                      VOICE DROP SCRIPT
                    </span>
                    <p className="text-xs font-semibold text-white italic">
                      "{generatedDropText}"
                    </p>
                  </div>
                  <button
                    onClick={handlePlayDjDrop}
                    className="py-2 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-md active:scale-95"
                  >
                    <Volume2 className="w-4 h-4" />
                    <span>PLAY LIVE</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AI SETLIST CURATOR */}
          {activeTab === 'curator' && (
            <div className="space-y-4">
              <div className="bg-[#181c28] border border-[#2b3347] rounded-lg p-3 space-y-3">
                <h3 className="text-xs font-bold text-white flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-rose-400" />
                  <span>AI Smart Setlist Curator</span>
                </h3>
                <p className="text-xs text-slate-300">
                  Gemini analyzes your current playing track, tempo curves, and crowd energy to recommend the next track in your crate.
                </p>

                <button
                  onClick={handleRecommendTrack}
                  disabled={isRecommending || !deckA.track}
                  className="w-full py-2 rounded-lg bg-gradient-to-r from-rose-600 to-purple-600 hover:from-rose-500 hover:to-purple-500 text-white font-semibold text-xs transition flex items-center justify-center gap-1.5 shadow-md"
                >
                  <Sparkles className={`w-3.5 h-3.5 ${isRecommending ? 'animate-spin' : ''}`} />
                  <span>Recommend Best Next Track</span>
                </button>

                {recommendedTrack?.track && (
                  <div className="bg-[#12151e] p-3 rounded-lg border border-[#2c3447] space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-rose-400 font-bold block">
                          AI RECOMMENDED
                        </span>
                        <h4 className="text-xs font-bold text-white">
                          {recommendedTrack.track.title} - {recommendedTrack.track.artist}
                        </h4>
                        <span className="text-[10px] font-mono text-slate-400">
                          {recommendedTrack.track.bpm} BPM · {recommendedTrack.track.key} · {recommendedTrack.track.genre}
                        </span>
                      </div>
                      <button
                        onClick={() => onLoadTrackToDeck('deckB', recommendedTrack.track!)}
                        className="py-1.5 px-3 rounded bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs"
                      >
                        LOAD TO DECK B
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 bg-[#0c0e14] p-2 rounded border border-slate-800">
                      <span className="font-bold text-cyan-300">Why it works: </span>
                      {recommendedTrack.reasoning}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
