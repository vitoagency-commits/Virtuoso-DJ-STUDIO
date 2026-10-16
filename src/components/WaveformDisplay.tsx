import React, { useRef, useEffect } from 'react';
import { DeckState } from '../types/dj';
import { ZoomIn, ZoomOut, EyeOff } from 'lucide-react';

interface WaveformDisplayProps {
  deckA: DeckState;
  deckB: DeckState;
  deckC?: DeckState;
  deckD?: DeckState;
  isQuad?: boolean;
  onSeek: (deckId: 'deckA' | 'deckB' | 'deckC' | 'deckD', seconds: number) => void;
  onClose?: () => void;
  height?: number;
}

export const WaveformDisplay: React.FC<WaveformDisplayProps> = ({
  deckA,
  deckB,
  deckC,
  deckD,
  isQuad = false,
  onSeek,
  onClose,
  height,
}) => {
  const [zoom, setZoom] = React.useState<number>(1.2);
  const isCompact = (height ?? 85) <= 80;
  // Calculate canvas height so total rendered height stays within allocated bounds
  const trackCanvasHeight = height
    ? Math.max(16, Math.min(84, Math.floor((height - (isQuad ? 48 : isCompact ? 22 : 30)) / (isQuad ? 4 : 2))))
    : 32;

  // Helper to format mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Phase meter calculation: difference in fractional beat between Deck A and Deck B
  const calculatePhaseDiff = () => {
    if (!deckA.track || !deckB.track) return 0;
    const beatSecA = 60 / deckA.bpm;
    const beatSecB = 60 / deckB.bpm;
    const phaseA = (deckA.currentTime % beatSecA) / beatSecA;
    const phaseB = (deckB.currentTime % beatSecB) / beatSecB;
    let diff = phaseA - phaseB;
    if (diff > 0.5) diff -= 1;
    if (diff < -0.5) diff += 1;
    return diff; // -0.5 to +0.5
  };

  const phaseDiff = calculatePhaseDiff();

  return (
    <div
      style={height ? { height: `${height}px`, maxHeight: `${height}px` } : undefined}
      className={`bg-[#0e1017] border-b border-[#1f2430] select-none px-2 py-0.5 relative overflow-hidden flex flex-col justify-between shrink-0 ${
        isCompact ? 'text-[9px]' : 'text-[10px]'
      }`}
    >
      {/* Beat Phase Alignment Bar (VirtualDJ signature top phase meter) */}
      <div className={`flex items-center justify-between px-1.5 font-mono text-slate-400 ${isCompact ? 'mb-0.5 text-[9px]' : 'mb-1 text-[10px]'}`}>
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 font-bold">DECK A</span>
          <span className="text-slate-300">
            {deckA.track ? `${deckA.track.title} (${deckA.bpm.toFixed(1)} BPM)` : 'NO TRACK'}
          </span>
        </div>

        {/* Phase Alignment Visualizer */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400 uppercase text-[9px] tracking-wider">BEAT PHASE</span>
          <div className="relative w-40 sm:w-64 h-3 bg-slate-900 border border-slate-700 rounded-sm overflow-hidden flex items-center justify-center">
            {/* Center target lock line */}
            <div className="absolute w-0.5 h-full bg-emerald-400 z-10 shadow-[0_0_6px_#10b981]" />
            {/* Moving phase marker */}
            <div
              className="absolute w-2.5 h-2.5 rounded-full transition-transform duration-75"
              style={{
                transform: `translateX(${phaseDiff * 160}px)`,
                backgroundColor: Math.abs(phaseDiff) < 0.05 ? '#10b981' : '#f59e0b',
                boxShadow: Math.abs(phaseDiff) < 0.05 ? '0 0 8px #10b981' : 'none',
              }}
            />
          </div>
          {Math.abs(phaseDiff) < 0.05 && deckA.isPlaying && deckB.isPlaying ? (
            <span className="text-[10px] text-emerald-400 font-bold animate-pulse">IN SYNC</span>
          ) : (
            <span className="text-[10px] text-slate-400">PHASE</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-300">
            {deckB.track ? `${deckB.track.title} (${deckB.bpm.toFixed(1)} BPM)` : 'NO TRACK'}
          </span>
          <span className="text-orange-400 font-bold">DECK B</span>

          {/* Zoom & Collapse controls */}
          <div className="flex items-center gap-1 ml-2 border-l border-slate-700 pl-2">
            <button
              onClick={() => setZoom((z) => Math.max(0.6, z - 0.2))}
              className="p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              title="Zoom Out Waveform"
            >
              <ZoomOut className="w-3 h-3" />
            </button>
            <button
              onClick={() => setZoom((z) => Math.min(2.5, z + 0.2))}
              className="p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
              title="Zoom In Waveform"
            >
              <ZoomIn className="w-3 h-3" />
            </button>
            {onClose && (
              <button
                onClick={onClose}
                className="p-0.5 ml-1 rounded hover:bg-slate-800 text-slate-400 hover:text-rose-300 transition flex items-center gap-1 text-[9px] font-mono"
                title="Nascondi Waveforms [W] per massimizzare lo spazio dei Deck e Mixer"
              >
                <EyeOff className="w-3 h-3" />
                <span className="hidden md:inline">NASCONDI [W]</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stacked Running Waveforms */}
      <div className={isCompact ? 'space-y-0.5' : 'space-y-1'}>
        <DeckRunningWaveform
          deck={deckA}
          zoom={zoom}
          height={trackCanvasHeight}
          accentColor="#06b6d4"
          onSeek={(sec) => onSeek('deckA', sec)}
          isCompact={isCompact}
        />
        <DeckRunningWaveform
          deck={deckB}
          zoom={zoom}
          height={trackCanvasHeight}
          accentColor="#f97316"
          onSeek={(sec) => onSeek('deckB', sec)}
          isCompact={isCompact}
        />

        {isQuad && deckC && (
          <DeckRunningWaveform
            deck={deckC}
            zoom={zoom}
            height={trackCanvasHeight}
            accentColor="#10b981"
            onSeek={(sec) => onSeek('deckC', sec)}
          />
        )}

        {isQuad && deckD && (
          <DeckRunningWaveform
            deck={deckD}
            zoom={zoom}
            height={trackCanvasHeight}
            accentColor="#a855f7"
            onSeek={(sec) => onSeek('deckD', sec)}
          />
        )}
      </div>
    </div>
  );
};

// Canvas-based Running Waveform Component for high 60fps rendering
interface DeckRunningWaveformProps {
  deck: DeckState;
  zoom: number;
  height?: number;
  accentColor: string;
  onSeek: (seconds: number) => void;
  isCompact?: boolean;
}

const DeckRunningWaveform: React.FC<DeckRunningWaveformProps> = ({
  deck,
  zoom,
  height = 48,
  accentColor,
  onSeek,
  isCompact = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const overviewRef = useRef<HTMLDivElement | null>(null);

  // Time formatting
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const remaining = deck.duration > 0 ? Math.max(0, deck.duration - deck.currentTime) : 0;

  // Running canvas rendering loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      // Background
      ctx.fillStyle = '#11141c';
      ctx.fillRect(0, 0, width, height);

      const centerPlayhead = width / 2;
      const peaks = deck.track?.waveformData || [];
      const duration = deck.duration || 180;
      const bpm = deck.bpm || 128;
      const secondsPerBeat = 60 / bpm;

      if (peaks.length > 0) {
        const totalPeaks = peaks.length;
        const pxPerSecond = (24 * zoom);

        // Draw running waveform slices around current time
        const visibleHalfSeconds = centerPlayhead / pxPerSecond;
        const startSec = deck.currentTime - visibleHalfSeconds;
        const endSec = deck.currentTime + visibleHalfSeconds;

        for (let x = 0; x < width; x += 3) {
          const secAtX = deck.currentTime + (x - centerPlayhead) / pxPerSecond;
          if (secAtX >= 0 && secAtX <= duration) {
            const peakIndex = Math.floor((secAtX / duration) * totalPeaks);
            const peakVal = peaks[peakIndex] || 0.2;
            const barHeight = peakVal * (height * 0.85);

            // Multiband color styling (VirtualDJ aesthetic: bass orange/red, mids green, highs cyan)
            let fillColor = accentColor;
            if (peakVal > 0.75) {
              fillColor = '#f43f5e'; // punchy transient
            } else if (peakVal > 0.45) {
              fillColor = accentColor;
            } else {
              fillColor = '#3b82f6';
            }

            ctx.fillStyle = fillColor;
            ctx.fillRect(x, (height - barHeight) / 2, 2, barHeight);
          }
        }

        // Draw Beat Grid Lines
        ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
        const firstBeat = Math.floor(startSec / secondsPerBeat) * secondsPerBeat;
        for (let beatTime = firstBeat; beatTime <= endSec; beatTime += secondsPerBeat) {
          if (beatTime >= 0) {
            const beatX = centerPlayhead + (beatTime - deck.currentTime) * pxPerSecond;
            if (beatX >= 0 && beatX <= width) {
              const beatIndex = Math.round(beatTime / secondsPerBeat);
              const isBar = beatIndex % 4 === 0;

              ctx.fillStyle = isBar ? 'rgba(255, 255, 255, 0.7)' : 'rgba(255, 255, 255, 0.25)';
              ctx.fillRect(beatX, isBar ? 0 : height * 0.25, 1, isBar ? height : height * 0.5);

              if (isBar && beatX > 15 && beatX < width - 15) {
                ctx.font = '8px monospace';
                ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
                ctx.fillText(String(Math.floor(beatIndex / 4) + 1), beatX + 3, 10);
              }
            }
          }
        }

        // Draw Active Loop Region if loop is on
        if (deck.loopActive) {
          const loopEndSec = deck.loopStart + deck.loopLengthBeats * secondsPerBeat;
          const loopStartX = centerPlayhead + (deck.loopStart - deck.currentTime) * pxPerSecond;
          const loopEndX = centerPlayhead + (loopEndSec - deck.currentTime) * pxPerSecond;

          ctx.fillStyle = 'rgba(16, 185, 129, 0.25)';
          ctx.fillRect(loopStartX, 0, loopEndX - loopStartX, height);
          ctx.strokeStyle = '#10b981';
          ctx.lineWidth = 1;
          ctx.strokeRect(loopStartX, 0, loopEndX - loopStartX, height);
        }

        // Draw Cue markers
        if (deck.hotCues) {
          deck.hotCues.forEach((cueSec, idx) => {
            if (cueSec !== null) {
              const cueX = centerPlayhead + (cueSec - deck.currentTime) * pxPerSecond;
              if (cueX >= 0 && cueX <= width) {
                ctx.fillStyle = '#eab308';
                ctx.fillRect(cueX - 1, 0, 2, height);
                ctx.fillStyle = '#000';
                ctx.fillRect(cueX - 6, 2, 12, 10);
                ctx.font = 'bold 8px sans-serif';
                ctx.fillStyle = '#eab308';
                ctx.fillText(`${idx + 1}`, cueX - 3, 10);
              }
            }
          });
        }

        // Draw AI Structural Mix Points Flags (Breakdown, Drop, Outro)
        const struct = deck.track?.idealMixPoints;
        if (struct) {
          const drawStructFlag = (timeSec: number, label: string, color: string) => {
            const flagX = centerPlayhead + (timeSec - deck.currentTime) * pxPerSecond;
            if (flagX >= 0 && flagX <= width) {
              ctx.fillStyle = color;
              ctx.fillRect(flagX - 1, 0, 2, height);
              ctx.fillStyle = color;
              ctx.fillRect(flagX - 2, 0, 36, 12);
              ctx.font = 'bold 8px sans-serif';
              ctx.fillStyle = '#000000';
              ctx.fillText(label, flagX + 2, 9);
            }
          };

          if (struct.breakdown) drawStructFlag(struct.breakdown, 'BREAK', '#a855f7');
          if (struct.mainDrop) drawStructFlag(struct.mainDrop, 'DROP', '#f43f5e');
          if (struct.outroOut) drawStructFlag(struct.outroOut, 'MIX-OUT', '#eab308');
        }
      }

      // Draw Center Playhead Needle
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(centerPlayhead, 0);
      ctx.lineTo(centerPlayhead, height);
      ctx.stroke();

      // Top triangle needle marker
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(centerPlayhead - 4, 0);
      ctx.lineTo(centerPlayhead + 4, 0);
      ctx.lineTo(centerPlayhead, 6);
      ctx.fill();

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [deck.currentTime, deck.isPlaying, deck.track, deck.bpm, deck.loopActive, deck.hotCues, zoom, accentColor]);

  // Handle overview seek click
  const handleOverviewClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!overviewRef.current || !deck.duration) return;
    const rect = overviewRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, clickX / rect.width));
    onSeek(ratio * deck.duration);
  };

  return (
    <div className="bg-[#141721] rounded border border-[#222736] overflow-hidden">
      {/* Running Main Waveform Canvas */}
      <div className="relative w-full" style={{ height: `${height}px` }}>
        <canvas
          ref={canvasRef}
          width={900}
          height={height}
          className="w-full h-full block cursor-ew-resize"
          onClick={(e) => {
            // Drag or click to scrub
            const rect = e.currentTarget.getBoundingClientRect();
            const clickX = e.clientX - rect.left;
            const center = rect.width / 2;
            const deltaSec = (clickX - center) / (24 * zoom);
            onSeek(Math.max(0, Math.min(deck.duration, deck.currentTime + deltaSec)));
          }}
        />

        {/* Deck Badge on Left */}
        <div className="absolute top-1 left-2 flex items-center gap-1.5 pointer-events-none">
          <span
            className="text-[10px] font-bold px-1.5 py-0.2 rounded font-mono"
            style={{
              backgroundColor: `${accentColor}25`,
              color: accentColor,
              border: `1px solid ${accentColor}60`,
            }}
          >
            {deck.name}
          </span>
          <span className="text-[10px] font-mono text-slate-300 font-medium">
            {formatTime(deck.currentTime)}
          </span>
        </div>

        {/* Remaining Time on Right */}
        <div className="absolute top-1 right-2 pointer-events-none flex items-center gap-1.5">
          <span className="text-[10px] font-mono text-slate-400">
            -{formatTime(remaining)}
          </span>
          {deck.loopActive && (
            <span className="text-[9px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-500/50 px-1 rounded">
              LOOP {deck.loopLengthBeats}B
            </span>
          )}
        </div>
      </div>

      {/* Mini Overview Scrubber Bar */}
      <div
        ref={overviewRef}
        onClick={handleOverviewClick}
        className={`relative ${isCompact ? 'h-1.5' : 'h-2'} bg-[#0c0e14] cursor-pointer hover:h-2.5 transition-all overflow-hidden border-t border-[#1b1f2b]`}
        title="Click to seek anywhere in the track"
      >
        {/* Full Track Mini Waveform Bars */}
        <div className="absolute inset-0 flex items-center gap-[1px] opacity-40 px-0.5">
          {(deck.track?.waveformData || []).slice(0, 100).map((peak, idx) => (
            <div
              key={idx}
              className="flex-1 rounded-xs"
              style={{
                height: `${Math.max(20, peak * 100)}%`,
                backgroundColor: accentColor,
              }}
            />
          ))}
        </div>

        {/* Progress Fill */}
        <div
          className="absolute top-0 bottom-0 left-0 bg-white/20 pointer-events-none"
          style={{
            width: `${deck.duration > 0 ? (deck.currentTime / deck.duration) * 100 : 0}%`,
          }}
        />

        {/* AI Structural Markers (Breakdown, Drop, Outro) on Mini Scrubber */}
        {deck.duration > 0 && deck.track?.idealMixPoints && (
          <>
            {deck.track.idealMixPoints.breakdown && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-purple-400 pointer-events-none z-10 opacity-70"
                style={{ left: `${(deck.track.idealMixPoints.breakdown / deck.duration) * 100}%` }}
                title="Breakdown"
              />
            )}
            {deck.track.idealMixPoints.mainDrop && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-rose-400 pointer-events-none z-10 opacity-70"
                style={{ left: `${(deck.track.idealMixPoints.mainDrop / deck.duration) * 100}%` }}
                title="Peak Drop"
              />
            )}
            {deck.track.idealMixPoints.outroOut && (
              <div
                className="absolute top-0 bottom-0 w-0.5 bg-amber-400 pointer-events-none z-10 opacity-70"
                style={{ left: `${(deck.track.idealMixPoints.outroOut / deck.duration) * 100}%` }}
                title="Mix-Out Window"
              />
            )}
          </>
        )}

        {/* Playhead Needle Marker */}
        <div
          className="absolute top-0 bottom-0 w-1 bg-white shadow-sm pointer-events-none z-20"
          style={{
            left: `${deck.duration > 0 ? (deck.currentTime / deck.duration) * 100 : 0}%`,
          }}
        />
      </div>
    </div>
  );
};
