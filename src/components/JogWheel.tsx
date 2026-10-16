import React, { useRef, useState, useEffect } from 'react';
import { DeckState, PlatterSize } from '../types/dj';
import { Hand, MousePointer, Disc, Tablet, Maximize2 } from 'lucide-react';

interface JogWheelProps {
  deck: DeckState;
  onScratch: (velocity: number) => void;
  onNudge: (deltaPercent: number) => void;
  onToggleVinyl: () => void;
  onToggleSlip: () => void;
  isTouchDevice?: boolean;
  platterSize?: PlatterSize;
  onCyclePlatterSize?: () => void;
  onSetPlatterSize?: (size: PlatterSize) => void;
}

export const JogWheel: React.FC<JogWheelProps> = ({
  deck,
  onScratch,
  onNudge,
  onToggleVinyl,
  onToggleSlip,
  isTouchDevice = false,
  platterSize = 'standard',
  onCyclePlatterSize,
  onSetPlatterSize,
}) => {
  const wheelRef = useRef<HTMLDivElement | null>(null);
  const [rotation, setRotation] = useState(0);
  const [isInteracting, setIsInteracting] = useState(false);
  const [isTouchActive, setIsTouchActive] = useState(false);
  const lastAngleRef = useRef<number>(0);
  const lastTimeRef = useRef<number>(0);

  // Time format
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Continuous rotation when playing
  useEffect(() => {
    if (!deck.isPlaying || isInteracting) return;

    let animId: number;
    let lastTimestamp = performance.now();

    const animate = (timestamp: number) => {
      const dt = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      // 33.3 RPM base speed scaled by playbackRate
      const rpm = 33.33 * (deck.bpm / (deck.originalBpm || deck.bpm));
      const degPerSec = rpm * 6; // 360 deg / 60s * rpm
      setRotation((prev) => (prev + degPerSec * dt) % 360);

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [deck.isPlaying, deck.bpm, deck.originalBpm, isInteracting]);

  // Calculate pointer angle from center of jog wheel
  const getCoordAngle = (clientX: number, clientY: number): number => {
    if (!wheelRef.current) return 0;
    const rect = wheelRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    let rad = Math.atan2(dy, dx);
    let deg = (rad * 180) / Math.PI;
    if (deg < 0) deg += 360;
    return deg;
  };

  // Helper for angular delta and scratch velocity
  const handleInteractionMove = (clientX: number, clientY: number) => {
    const now = performance.now();
    const currentAngle = getCoordAngle(clientX, clientY);
    let deltaAngle = currentAngle - lastAngleRef.current;

    // Handle 360 wrap-around
    if (deltaAngle > 180) deltaAngle -= 360;
    if (deltaAngle < -180) deltaAngle += 360;

    const dt = Math.max(1, now - lastTimeRef.current) / 1000;
    const angularVelocity = deltaAngle / dt / 360; // revolutions per sec

    setRotation((prev) => (prev + deltaAngle) % 360);

    if (deck.vinylMode) {
      // Authentic Vinyl Scratch
      onScratch(angularVelocity);
    } else {
      // Pitch Bend / Nudge
      onNudge(angularVelocity * 8);
    }

    lastAngleRef.current = currentAngle;
    lastTimeRef.current = now;
  };

  // Pointer event handlers (Desktop mice + trackpads + general pointers)
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') {
      setIsTouchActive(true);
    }
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    setIsInteracting(true);

    const angle = getCoordAngle(e.clientX, e.clientY);
    lastAngleRef.current = angle;
    lastTimeRef.current = performance.now();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isInteracting) return;
    handleInteractionMove(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
    setIsInteracting(false);
  };

  // Native Touch event handlers for iOS Safari & iPadOS (Zero lag, multi-touch capable)
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // Prevent iOS page bouncing while scratching
    if (e.touches.length > 0) {
      const touch = e.touches[0];
      setIsInteracting(true);
      setIsTouchActive(true);
      const angle = getCoordAngle(touch.clientX, touch.clientY);
      lastAngleRef.current = angle;
      lastTimeRef.current = performance.now();
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isInteracting || e.touches.length === 0) return;
    // Prevent default scroll behavior
    if (e.cancelable) {
      e.preventDefault();
    }
    const touch = e.touches[0];
    handleInteractionMove(touch.clientX, touch.clientY);
  };

  const handleTouchEnd = () => {
    setIsInteracting(false);
  };

  // Platter size configurations
  const platterSizeClasses =
    platterSize === 'compact'
      ? 'w-28 h-28 sm:w-32 sm:h-32 md:w-36 md:h-36 max-h-[140px] max-w-[140px]'
      : platterSize === 'maxi'
      ? 'w-56 h-56 sm:w-64 sm:h-64 md:w-72 md:h-72 max-h-[280px] max-w-[280px]'
      : platterSize === 'large'
      ? 'w-44 h-44 sm:w-50 sm:h-50 md:w-56 md:h-56 max-h-[220px] max-w-[220px]'
      : 'w-34 h-34 sm:w-38 sm:h-38 md:w-42 md:h-42 max-h-[168px] max-w-[168px]';

  const labelSizeClasses =
    platterSize === 'compact'
      ? 'w-14 h-14 sm:w-16 sm:h-16'
      : platterSize === 'maxi'
      ? 'w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32'
      : platterSize === 'large'
      ? 'w-20 h-20 sm:w-22 sm:h-22 md:w-24 md:h-24'
      : 'w-16 h-16 sm:w-18 sm:h-18 md:w-20 md:h-20';

  const bpmTextClass =
    platterSize === 'compact'
      ? 'text-[10px] sm:text-xs font-mono font-bold'
      : platterSize === 'maxi'
      ? 'text-sm sm:text-base md:text-lg font-mono font-black'
      : platterSize === 'large'
      ? 'text-xs sm:text-sm font-mono font-bold'
      : 'text-xs sm:text-sm font-mono font-bold';

  return (
    <div className="flex flex-col items-center select-none py-1 w-full">
      {/* Vinyl / Slip Mode Switches + Touch Adaptive Badge + Platter Size Selector */}
      <div className="flex items-center justify-between w-full px-2 mb-1.5 text-[10px] font-mono gap-1">
        <button
          onClick={onToggleVinyl}
          className={`px-2 py-0.5 rounded transition border cursor-pointer active:scale-95 ${
            deck.vinylMode
              ? 'bg-cyan-950/80 border-cyan-500/70 text-cyan-300 font-bold shadow-[0_0_8px_rgba(6,182,212,0.3)]'
              : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Vinyl Scratch Mode"
        >
          VINYL {deck.vinylMode ? 'ON' : 'OFF'}
        </button>

        {/* Versatile Mode indicator (Touch on iPad / Mouse on Mac) */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-black/40 border border-slate-800 text-[9px] text-slate-400">
          {isTouchDevice || isTouchActive ? (
            <span className="flex items-center gap-1 text-cyan-400 font-semibold">
              <Hand className="w-3 h-3 text-cyan-400 animate-pulse" />
              <span>IPAD</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-slate-400">
              <MousePointer className="w-3 h-3" />
              <span>MAC</span>
            </span>
          )}
          <span className="text-slate-500">|</span>
          <span className="font-mono text-slate-200">
            {deck.pitchPercent >= 0 ? `+${deck.pitchPercent.toFixed(2)}%` : `${deck.pitchPercent.toFixed(2)}%`}
          </span>
        </div>

        {/* Platter Size Quick Switcher */}
        {onSetPlatterSize ? (
          <div className="flex items-center bg-[#0d0f17] p-0.5 rounded border border-[#2b3345]">
            <button
              onClick={() => onSetPlatterSize('compact')}
              className={`px-1.5 py-0.5 rounded text-[8px] font-mono transition cursor-pointer ${
                platterSize === 'compact'
                  ? 'bg-emerald-600 text-white font-bold shadow-xs'
                  : 'text-emerald-400/80 hover:text-emerald-300'
              }`}
              title="Mini / Compatto: massimizza lo spazio per controlli e pads su schermi 13 pollici"
            >
              MINI
            </button>
            <button
              onClick={() => onSetPlatterSize('standard')}
              className={`px-1.5 py-0.5 rounded text-[8px] font-mono transition cursor-pointer ${
                platterSize === 'standard'
                  ? 'bg-slate-700 text-white font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Dimensione standard bilanciata"
            >
              NORM
            </button>
            <button
              onClick={() => onSetPlatterSize('large')}
              className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[8px] font-mono transition cursor-pointer ${
                platterSize === 'large'
                  ? 'bg-cyan-600 text-white font-bold shadow-xs'
                  : 'text-cyan-400/80 hover:text-cyan-300'
              }`}
              title="Dimensione Grande consigliata per iPad touch"
            >
              <Tablet className="w-2.5 h-2.5" />
              <span>IPAD</span>
            </button>
            <button
              onClick={() => onSetPlatterSize('maxi')}
              className={`px-1.5 py-0.5 rounded text-[8px] font-mono transition cursor-pointer ${
                platterSize === 'maxi'
                  ? 'bg-purple-600 text-white font-bold shadow-xs'
                  : 'text-purple-400/80 hover:text-purple-300'
              }`}
              title="Dimensione Maxi Scratch"
            >
              MAXI
            </button>
          </div>
        ) : onCyclePlatterSize ? (
          <button
            onClick={onCyclePlatterSize}
            className={`px-2 py-0.5 rounded transition border cursor-pointer active:scale-95 flex items-center gap-1 ${
              platterSize !== 'standard'
                ? 'bg-cyan-950/80 border-cyan-500 text-cyan-300 font-bold'
                : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
            }`}
            title="Ingrandisci piatto per iPad / Touch"
          >
            <Tablet className="w-3 h-3" />
            <span>{platterSize === 'maxi' ? 'MAXI' : platterSize === 'large' ? 'IPAD' : 'NORM'}</span>
          </button>
        ) : null}

        <button
          onClick={onToggleSlip}
          className={`px-2 py-0.5 rounded transition border cursor-pointer active:scale-95 ${
            deck.slipMode
              ? 'bg-amber-950/80 border-amber-500/70 text-amber-300 font-bold shadow-[0_0_8px_rgba(245,158,11,0.3)]'
              : 'bg-slate-900 border-slate-700 text-slate-400 hover:text-slate-200'
          }`}
          title="Toggle Slip Mode (resumes on-beat after scratch/loop)"
        >
          SLIP {deck.slipMode ? 'ON' : 'OFF'}
        </button>
      </div>

      {/* Realistic Vinyl Jog Wheel Platter with Dual Touch & Pointer Listeners */}
      <div
        ref={wheelRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className={`relative ${platterSizeClasses} rounded-full bg-gradient-to-br from-[#1e232e] via-[#12151c] to-[#0c0e14] p-1.5 shadow-[0_6px_28px_rgba(0,0,0,0.85),inset_0_1px_2px_rgba(255,255,255,0.18)] border-2 border-[#2b3242] cursor-grab active:cursor-grabbing touch-none select-none group transition-all duration-200`}
        style={{
          touchAction: 'none',
          WebkitUserSelect: 'none',
        }}
      >
        {/* Outer Knurled Rim with Strobe Markings */}
        <div className="absolute inset-1 rounded-full border border-slate-700/60 pointer-events-none" />

        {/* Textured Vinyl Grooves Platter */}
        <div
          className="relative w-full h-full rounded-full flex items-center justify-center transition-transform"
          style={{
            transform: `rotate(${rotation}deg)`,
            background:
              'radial-gradient(circle, #1a1e27 0%, #10131a 45%, #181c25 50%, #0d0f14 85%, #1a1d25 100%)',
          }}
        >
          {/* Subtle Vinyl Grooves Rings */}
          <div className="absolute inset-2 rounded-full border border-slate-800/80 pointer-events-none" />
          <div className="absolute inset-4 rounded-full border border-slate-800/60 pointer-events-none" />
          <div className="absolute inset-6 rounded-full border border-slate-800/50 pointer-events-none" />
          <div className="absolute inset-8 rounded-full border border-slate-800/40 pointer-events-none" />
          {platterSize !== 'standard' && (
            <>
              <div className="absolute inset-10 rounded-full border border-slate-800/35 pointer-events-none" />
              <div className="absolute inset-12 rounded-full border border-slate-800/30 pointer-events-none" />
            </>
          )}

          {/* Strobe Ring Dot Indicators */}
          <div className="absolute top-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#06b6d4]" />
          <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-slate-600" />
          <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-600" />
          <div className="absolute right-1 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-slate-600" />

          {/* Illuminated Platter Needle Position Line */}
          <div className="absolute top-2 bottom-1/2 w-0.5 bg-gradient-to-t from-cyan-400 to-transparent pointer-events-none" />

          {/* Center Vinyl Label Disc */}
          <div
            className={`${labelSizeClasses} rounded-full bg-[#161a24] border-2 border-[#2c3344] flex flex-col items-center justify-center p-1 text-center shadow-inner pointer-events-none transition-all duration-200`}
            style={{
              // Keep text upright by counter-rotating center label
              transform: `rotate(${-rotation}deg)`,
            }}
          >
            {/* Center Spindle Dot */}
            <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-tr from-slate-400 to-slate-200 border border-slate-900 mb-0.5 shadow-sm" />

            {/* Deck Indicator */}
            <span
              className="text-[11px] font-bold font-mono tracking-wider leading-none"
              style={{ color: deck.themeColor }}
            >
              {deck.name}
            </span>

            {/* Live BPM */}
            <span className={`${bpmTextClass} text-slate-100 tracking-tight leading-tight mt-0.5`}>
              {deck.bpm.toFixed(1)}
            </span>

            {/* Current Position */}
            <span className="text-[9px] sm:text-[10px] font-mono text-slate-400 leading-none">
              {formatTime(deck.currentTime)}
            </span>

            {/* Mode Badge */}
            <span className="text-[8px] font-mono text-cyan-400 mt-0.5">
              {deck.vinylMode ? 'VINYL' : 'CDJ BEND'}
            </span>
          </div>
        </div>

        {/* Drag / Touch Glow Ring */}
        {isInteracting && (
          <div className="absolute inset-0 rounded-full border-2 border-cyan-400 shadow-[0_0_18px_rgba(6,182,212,0.6)] pointer-events-none animate-pulse" />
        )}
      </div>

      {/* Helpful Hint on Scratch / Touch Interaction */}
      <div className="mt-1 text-[9px] font-mono text-slate-500 text-center flex items-center gap-1.5">
        <Disc className="w-3 h-3 text-slate-500 shrink-0" />
        <span>
          {isTouchDevice
            ? 'Touch iPad: tocca e gira con le dita per scratchare'
            : 'Trascina o tocca per scratchare & pitch bend'}
        </span>
        {platterSize !== 'standard' && (
          <span className="text-cyan-400 font-bold bg-cyan-950/70 px-1 rounded border border-cyan-500/40">
            {platterSize === 'maxi' ? 'MAXI PIATTI' : 'PIATTI IPAD'}
          </span>
        )}
      </div>
    </div>
  );
};
