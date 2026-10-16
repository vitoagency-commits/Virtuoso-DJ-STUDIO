import React, { useState } from 'react';
import {
  Sparkles,
  Disc,
  Clock,
  Layers,
  ArrowRight,
  Flame,
  Activity,
  CheckCircle2,
  Wand2,
  Zap,
  Music,
} from 'lucide-react';
import { Track, TrackStructurePoints } from '../types/dj';

interface AiTrackAnalyzerModalProps {
  isOpen: boolean;
  onClose: () => void;
  tracks: Track[];
  onSetHotCuesFromStructure: (deckId: 'deckA' | 'deckB', points: TrackStructurePoints) => void;
  onLoadTrackToDeck: (deckId: 'deckA' | 'deckB', track: Track) => void;
}

export const AiTrackAnalyzerModal: React.FC<AiTrackAnalyzerModalProps> = ({
  isOpen,
  onClose,
  tracks,
  onSetHotCuesFromStructure,
  onLoadTrackToDeck,
}) => {
  const [selectedTrackId, setSelectedTrackId] = useState<string>(tracks[0]?.id || '');
  const [isReanalyzing, setIsReanalyzing] = useState<boolean>(false);
  const [analyzedTrack, setAnalyzedTrack] = useState<Track | null>(tracks[0] || null);

  if (!isOpen) return null;

  const currentTrack = tracks.find((t) => t.id === selectedTrackId) || analyzedTrack || tracks[0];

  const handleSelectTrack = (track: Track) => {
    setSelectedTrackId(track.id);
    setAnalyzedTrack(track);
  };

  const handleRunAiDeepAnalysis = async () => {
    if (!currentTrack) return;
    setIsReanalyzing(true);
    try {
      const res = await fetch('/api/ai/deep-track-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: currentTrack.title,
          artist: currentTrack.artist,
          duration: currentTrack.duration,
          rawBpm: currentTrack.bpm,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const updated: Track = {
          ...currentTrack,
          bpm: data.bpm || currentTrack.bpm,
          key: data.key || currentTrack.key,
          camelotCode: data.camelotCode || currentTrack.camelotCode,
          genre: data.genre || currentTrack.genre,
          energy: data.energy || currentTrack.energy,
          danceability: data.danceability || 8,
          mood: data.mood || 'High Energy Club',
          idealMixPoints: data.idealMixPoints || currentTrack.idealMixPoints,
          spectralProfile: data.spectralProfile || currentTrack.spectralProfile,
          harmonicNeighbors: data.harmonicNeighbors || currentTrack.harmonicNeighbors,
        };
        setAnalyzedTrack(updated);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsReanalyzing(false);
    }
  };

  // Find harmonically compatible next tracks from library
  const getHarmoniousNextTracks = () => {
    if (!currentTrack) return [];
    const baseCode = currentTrack.camelotCode || '8A';
    const num = parseInt(baseCode.replace(/\D/g, ''), 10) || 8;
    const letter = baseCode.replace(/\d/g, '') || 'A';
    const oppositeLetter = letter === 'A' ? 'B' : 'A';

    const compatibleCodes = [
      `${num}${letter}`, // Same key
      `${num === 12 ? 1 : num + 1}${letter}`, // +1 energy
      `${num === 1 ? 12 : num - 1}${letter}`, // -1 mellow
      `${num}${oppositeLetter}`, // Relative major/minor
    ];

    return tracks
      .filter((t) => t.id !== currentTrack.id)
      .map((t) => {
        const isHarmonic = compatibleCodes.includes(t.camelotCode || '');
        const bpmDelta = Math.abs(t.bpm - currentTrack.bpm);
        const bpmScore = Math.max(0, 100 - bpmDelta * 5);
        const score = isHarmonic ? bpmScore : bpmScore * 0.6;
        return { track: t, score: Math.round(score), isHarmonic };
      })
      .sort((a, b) => b.score - a.score);
  };

  const harmoniousList = getHarmoniousNextTracks();
  const formatTime = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const points = currentTrack?.idealMixPoints || {
    introIn: 0,
    breakdown: Math.round(currentTrack.duration * 0.38),
    mainDrop: Math.round(currentTrack.duration * 0.52),
    outroOut: Math.round(currentTrack.duration * 0.82),
    phraseBars: 32,
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs select-none">
      <div className="bg-[#12151f] border border-[#2c344a] rounded-xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#212739] bg-[#161a28]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Sparkles className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>AI MUSICAL ANALYSIS &amp; HARMONIC MATCHER</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-cyan-950 border border-cyan-500/60 text-cyan-300">
                  DEEP AUDIO ENGINE
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Automatic extraction of BPM, Camelot Key, Ideal Mix Points, and Harmonic Transitions
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

        {/* Track Selector Bar */}
        <div className="px-4 py-2 border-b border-[#1f2536] bg-[#0e111a] flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] font-mono text-slate-400 uppercase shrink-0">SELECT TRACK:</span>
          {tracks.map((t) => (
            <button
              key={t.id}
              onClick={() => handleSelectTrack(t)}
              className={`px-3 py-1 rounded text-xs font-semibold whitespace-nowrap transition border ${
                t.id === currentTrack.id
                  ? 'bg-cyan-950 border-cyan-400 text-cyan-300 shadow-sm'
                  : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              {t.title}
            </button>
          ))}
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4">
          {/* Track Main Specs Card */}
          <div className="bg-[#171b26] border border-[#272f42] rounded-lg p-3 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Music className="w-4 h-4 text-cyan-400" />
                  {currentTrack.title}
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  {currentTrack.artist} · {currentTrack.genre} · {formatTime(currentTrack.duration)}
                </span>
              </div>

              <button
                onClick={handleRunAiDeepAnalysis}
                disabled={isReanalyzing}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs transition active:scale-95 disabled:opacity-50"
              >
                <Wand2 className={`w-3.5 h-3.5 ${isReanalyzing ? 'animate-spin' : ''}`} />
                <span>{isReanalyzing ? 'Analyzing with AI...' : 'Run Deep AI Analysis'}</span>
              </button>
            </div>

            {/* Metric Badges */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
              <div className="bg-[#0f121a] p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 block">EXACT BPM</span>
                <span className="text-sm font-bold text-cyan-300">{currentTrack.bpm.toFixed(1)}</span>
              </div>

              <div className="bg-[#0f121a] p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 block">KEY &amp; CAMELOT</span>
                <span className="text-sm font-bold text-amber-300">
                  {currentTrack.key} [{currentTrack.camelotCode}]
                </span>
              </div>

              <div className="bg-[#0f121a] p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 block">DANCE ENERGY</span>
                <span className="text-sm font-bold text-rose-300">{currentTrack.energy}/10</span>
              </div>

              <div className="bg-[#0f121a] p-2 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 block">DANCEABILITY</span>
                <span className="text-sm font-bold text-emerald-300">
                  {currentTrack.danceability || 8}/10
                </span>
              </div>
            </div>
          </div>

          {/* Section: Ideal Mix Points & Structural Timeline */}
          <div className="bg-[#171b26] border border-[#272f42] rounded-lg p-3 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-400" />
                  Punti di Mixaggio Ideali (AI Structural Cues)
                </h4>
                <p className="text-[11px] text-slate-400">
                  Punti strategici per ingressi, breakdown, drop e uscita verso la prossima traccia
                </p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => onSetHotCuesFromStructure('deckA', points)}
                  className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-mono text-[10px] font-bold transition active:scale-95"
                >
                  SET TO DECK 1 CUES
                </button>
                <button
                  onClick={() => onSetHotCuesFromStructure('deckB', points)}
                  className="px-2.5 py-1 rounded bg-orange-950 hover:bg-orange-900 border border-orange-500/50 text-orange-300 font-mono text-[10px] font-bold transition active:scale-95"
                >
                  SET TO DECK 2 CUES
                </button>
              </div>
            </div>

            {/* Interactive Visual Structure Bar */}
            <div className="space-y-1">
              <div className="relative h-6 bg-[#0c0e14] rounded-md overflow-hidden flex border border-slate-800 text-[10px] font-mono font-bold">
                {/* Intro Section */}
                <div
                  className="h-full bg-blue-900/60 border-r border-blue-400/50 flex items-center justify-center text-blue-300"
                  style={{ width: `${(points.breakdown / currentTrack.duration) * 100}%` }}
                >
                  INTRO MIX-IN
                </div>

                {/* Breakdown Section */}
                <div
                  className="h-full bg-purple-900/60 border-r border-purple-400/50 flex items-center justify-center text-purple-300"
                  style={{
                    width: `${((points.mainDrop - points.breakdown) / currentTrack.duration) * 100}%`,
                  }}
                >
                  BREAKDOWN
                </div>

                {/* Peak Drop Section */}
                <div
                  className="h-full bg-rose-900/60 border-r border-rose-400/50 flex items-center justify-center text-rose-300"
                  style={{
                    width: `${((points.outroOut - points.mainDrop) / currentTrack.duration) * 100}%`,
                  }}
                >
                  PEAK DROP
                </div>

                {/* Outro Mix-Out Section */}
                <div
                  className="h-full bg-amber-900/60 flex items-center justify-center text-amber-300 flex-1"
                >
                  OUTRO TRANSITION
                </div>
              </div>

              {/* Timestamp Markers */}
              <div className="grid grid-cols-4 gap-2 pt-1 font-mono text-[10px]">
                <div className="bg-[#0f121a] p-1.5 rounded border border-slate-800">
                  <span className="text-blue-400 font-bold block">1. INTRO IN</span>
                  <span className="text-white">{formatTime(points.introIn)}</span>
                </div>
                <div className="bg-[#0f121a] p-1.5 rounded border border-slate-800">
                  <span className="text-purple-400 font-bold block">2. BREAKDOWN</span>
                  <span className="text-white">{formatTime(points.breakdown)}</span>
                </div>
                <div className="bg-[#0f121a] p-1.5 rounded border border-slate-800">
                  <span className="text-rose-400 font-bold block">3. MAIN DROP</span>
                  <span className="text-white">{formatTime(points.mainDrop)}</span>
                </div>
                <div className="bg-[#0f121a] p-1.5 rounded border border-slate-800">
                  <span className="text-amber-400 font-bold block">4. OUTRO MIX-OUT</span>
                  <span className="text-white">{formatTime(points.outroOut)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Next Harmonious Songs Suggestion List */}
          <div className="bg-[#171b26] border border-[#272f42] rounded-lg p-3 space-y-2">
            <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              Prossime Canzoni Suggerite (Transizioni Armoniose)
            </h4>
            <p className="text-[11px] text-slate-400">
              Tracce ordinate per compatibilità di chiave Camelot e vicinanza di BPM per un mix senza scontri
            </p>

            <div className="space-y-1.5 pt-1">
              {harmoniousList.slice(0, 4).map(({ track, score, isHarmonic }) => (
                <div
                  key={track.id}
                  className="bg-[#0f121a] p-2 rounded border border-slate-800 flex items-center justify-between gap-3 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ backgroundColor: track.color }}
                    />
                    <div>
                      <div className="font-bold text-white">{track.title}</div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {track.artist} · {track.bpm} BPM · Key {track.key}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 font-mono">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-bold ${
                        isHarmonic
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/50'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {score}% HARMONIC MATCH
                    </span>

                    <button
                      onClick={() => onLoadTrackToDeck('deckB', track)}
                      className="px-2.5 py-1 rounded bg-orange-600 hover:bg-orange-500 text-white font-bold text-[10px] transition active:scale-95"
                    >
                      LOAD DECK 2
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
