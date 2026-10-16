import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Zap,
  ArrowRight,
  Clock,
  Wand2,
  Play,
  Layers,
  Flame,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import { DeckState, Track, AiRealtimeMixSuggestion } from '../types/dj';
import { audioEngine } from '../audio/audioEngine';

interface AiSmartMixAdvisorProps {
  deckA: DeckState;
  deckB: DeckState;
  library: Track[];
  onLoadTrackToDeck: (deckId: 'deckA' | 'deckB', track: Track) => void;
  onExecuteTimedTransition: (targetDeckId: 'deckA' | 'deckB') => void;
  onClose?: () => void;
}

export const AiSmartMixAdvisor: React.FC<AiSmartMixAdvisorProps> = ({
  deckA,
  deckB,
  library,
  onLoadTrackToDeck,
  onExecuteTimedTransition,
  onClose,
}) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(true);
  const [suggestion, setSuggestion] = useState<AiRealtimeMixSuggestion | null>(null);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  // Active playing deck (or default Deck A)
  const masterDeck = deckA.isPlaying ? deckA : deckB.isPlaying ? deckB : deckA;
  const targetDeckId = masterDeck.id === 'deckA' ? 'deckB' : 'deckA';
  const oppositeDeck = masterDeck.id === 'deckA' ? deckB : deckA;

  // Real-time calculation of countdown to outro mix point
  const currentPos = masterDeck.currentTime;
  const duration = masterDeck.duration || 180;
  const outroPoint = masterDeck.track?.idealMixPoints?.outroOut || Math.round(duration * 0.82);
  const secondsUntilCrossfade = Math.max(0, Math.round(outroPoint - currentPos));
  const secondsPerBeat = 60 / (masterDeck.bpm || 128);
  const barsUntilCrossfade = Math.max(0, Math.round(secondsUntilCrossfade / (secondsPerBeat * 4)));

  // Fetch or refresh AI smart mix suggestions
  useEffect(() => {
    if (!masterDeck.track) return;

    let isMounted = true;
    const fetchSuggestions = async () => {
      setIsFetching(true);
      try {
        const res = await fetch('/api/ai/smart-mix-suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            currentTrack: masterDeck.track,
            currentDeckId: masterDeck.id,
            currentPosition: masterDeck.currentTime,
            library,
            listeningHistory: [],
          }),
        });

        if (res.ok && isMounted) {
          const data = await res.json();
          const found = library[data.suggestedTrackIndex] || library.find((t) => t.id !== masterDeck.track?.id) || library[0];
          setSuggestion({
            ...data,
            suggestedTrack: found,
          });
        }
      } catch (err) {
        console.error('Failed to get mix suggestions', err);
      } finally {
        if (isMounted) setIsFetching(false);
      }
    };

    fetchSuggestions();

    return () => {
      isMounted = false;
    };
  }, [masterDeck.track?.id]);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // If no track is playing or loaded
  if (!masterDeck.track) return null;

  return (
    <div className="bg-[#11141e] border-y border-[#202738] px-3 py-1.5 select-none text-slate-200">
      <div className="flex items-center justify-between">
        {/* Left: AI Advisor Status & Timing Banner */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="p-1 rounded bg-cyan-950/80 border border-cyan-500/50 text-cyan-400">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            </span>
            <span className="text-xs font-bold text-white font-mono">
              AI SMART MIX ADVISOR
            </span>
          </div>

          {/* Real-time Crossfade Countdown Badge */}
          <div className="flex items-center gap-2 bg-[#171b26] px-2.5 py-0.5 rounded border border-[#272f42] text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">MIX-OUT WINDOW:</span>
            <span
              className={`font-bold ${
                secondsUntilCrossfade <= 15
                  ? 'text-rose-400 animate-pulse'
                  : secondsUntilCrossfade <= 35
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {formatCountdown(secondsUntilCrossfade)} ({barsUntilCrossfade} BARS)
            </span>
          </div>

          {/* Recommended FX at Current Point */}
          {suggestion?.recommendedFx && (
            <div className="hidden lg:flex items-center gap-1.5 bg-[#171b26] px-2.5 py-0.5 rounded border border-[#272f42] text-xs font-mono">
              <Zap className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-slate-400">REC FX:</span>
              <span className="text-cyan-300 font-bold truncate max-w-[220px]">
                {suggestion.recommendedFx.name}
              </span>
            </div>
          )}
        </div>

        {/* Right: Quick Action & Expand Toggle */}
        <div className="flex items-center gap-2">
          {suggestion?.suggestedTrack && (
            <button
              onClick={() => onLoadTrackToDeck(targetDeckId, suggestion.suggestedTrack)}
              className="px-2.5 py-1 rounded bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-mono text-[11px] font-bold transition active:scale-95 flex items-center gap-1.5 shadow-sm"
              title={`Load suggested track: ${suggestion.suggestedTrack.title} to ${targetDeckId.toUpperCase()}`}
            >
              <Flame className="w-3 h-3" />
              <span>LOAD NEXT TO {targetDeckId === 'deckA' ? 'DECK 1' : 'DECK 2'}</span>
            </button>
          )}

          <button
            onClick={() => onExecuteTimedTransition(targetDeckId)}
            className="px-2.5 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-[11px] font-bold transition active:scale-95 flex items-center gap-1 shadow-sm"
            title="Execute timed crossfade into incoming track"
          >
            <Play className="w-3 h-3 fill-current" />
            <span>CROSSFADE NOW</span>
          </button>

          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition"
            title={isExpanded ? 'Riduci dettagli' : 'Espandi dettagli'}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded hover:bg-slate-800 text-slate-500 hover:text-rose-400 transition"
              title="Nascondi banner AI Advisor per recuperare spazio verticale"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Expanded Details Drawer */}
      {isExpanded && suggestion && (
        <div className="mt-2 pt-2 border-t border-[#1d2333] grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs animate-in fade-in duration-150">
          {/* Card 1: Next Song Recommendation */}
          <div className="bg-[#161a26] border border-[#262f44] p-2.5 rounded-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold block mb-0.5">
                SUGGESTED NEXT TRACK ({suggestion.matchScore}% MATCH)
              </span>
              <div className="font-bold text-white text-xs truncate max-w-[200px]">
                {suggestion.suggestedTrack?.title}
              </div>
              <div className="text-[10px] text-slate-400 font-mono">
                {suggestion.suggestedTrack?.bpm} BPM · Key {suggestion.suggestedTrack?.key} · {suggestion.harmonicCompatibility}
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] font-mono text-emerald-400 block font-bold">
                Pitch Adj: {suggestion.pitchAdjustment >= 0 ? `+${suggestion.pitchAdjustment}%` : `${suggestion.pitchAdjustment}%`}
              </span>
            </div>
          </div>

          {/* Card 2: Recommended Real-Time FX & Timing */}
          <div className="bg-[#161a26] border border-[#262f44] p-2.5 rounded-lg">
            <span className="text-[10px] font-mono text-amber-400 font-bold block mb-0.5">
              TIMED FX TRANSITION RECIPE
            </span>
            <div className="text-xs text-white font-semibold">
              {suggestion.recommendedFx?.name}
            </div>
            <div className="text-[10px] text-slate-300 leading-tight mt-0.5">
              {suggestion.recommendedFx?.description}
            </div>
          </div>

          {/* Card 3: Stem & Crossfade Strategy */}
          <div className="bg-[#161a26] border border-[#262f44] p-2.5 rounded-lg">
            <span className="text-[10px] font-mono text-purple-400 font-bold block mb-0.5">
              AI STEM STRATEGY
            </span>
            <div className="text-xs text-slate-200">
              {suggestion.stemAction}
            </div>
            <div className="text-[10px] text-slate-400 italic mt-0.5">
              "{suggestion.reasoning}"
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
