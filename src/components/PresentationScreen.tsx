import React, { useState, useEffect } from 'react';

interface PresentationScreenProps {
  onEnter: () => void;
}

export const PresentationScreen: React.FC<PresentationScreenProps> = ({ onEnter }) => {
  const [isExiting, setIsExiting] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const handleEnter = () => {
    if (isExiting) return;
    setIsExiting(true);
    // Smooth transition
    setTimeout(() => {
      onEnter();
    }, 450);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
        handleEnter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div
      onClick={handleEnter}
      onTouchStart={() => setIsPressed(true)}
      onTouchEnd={() => {
        setIsPressed(false);
        handleEnter();
      }}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#07090e] cursor-pointer select-none overflow-hidden transition-all duration-500 ease-out ${
        isExiting ? 'opacity-0 scale-105 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      style={{ touchAction: 'manipulation' }}
    >
      {/* Subtle Ambient Radial Glow */}
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.12)_0%,rgba(99,102,241,0.05)_40%,transparent_70%)]" />

      {/* Main Presentation Content */}
      <div className="relative flex flex-col items-center justify-center gap-10 z-10 px-6 max-w-xl text-center">
        {/* DJ Turntable / Vinyl Representation */}
        <div
          className={`relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 rounded-full flex items-center justify-center transition-transform duration-300 ${
            isPressed ? 'scale-95' : 'hover:scale-105'
          }`}
        >
          {/* External Ambient Aura Ring */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/20 via-sky-400/10 to-orange-500/20 blur-xl animate-pulse" />

          {/* Vinyl Outer Edge with Strobe Dots */}
          <div className="relative w-full h-full rounded-full bg-gradient-to-b from-[#1c2230] to-[#0a0d14] p-3 shadow-[0_0_50px_rgba(0,0,0,0.8),inset_0_2px_4px_rgba(255,255,255,0.1)] border border-slate-800">
            {/* Vinyl Body with Grooves */}
            <div className="relative w-full h-full rounded-full bg-[#0c0f17] overflow-hidden flex items-center justify-center border border-slate-900 shadow-inner">
              {/* Rotating Vinyl Grooves Sheen */}
              <div
                className="absolute inset-0 rounded-full animate-spin"
                style={{
                  animationDuration: '16s',
                  animationTimingFunction: 'linear',
                  background:
                    'repeating-radial-gradient(circle at 50% 50%, #111520 0px, #111520 2px, #0b0e15 3px, #0b0e15 5px)',
                }}
              />

              {/* Dynamic Light Reflection Across Grooves */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none opacity-40 mix-blend-screen"
                style={{
                  background:
                    'conic-gradient(from 45deg at 50% 50%, transparent 0deg, rgba(255,255,255,0.18) 45deg, transparent 90deg, transparent 180deg, rgba(255,255,255,0.18) 225deg, transparent 270deg)',
                }}
              />

              {/* Concentric Sound Waves Pulse Rings */}
              <div className="absolute w-44 h-44 sm:w-56 sm:h-56 rounded-full border border-cyan-500/20 animate-ping opacity-30" style={{ animationDuration: '3s' }} />

              {/* Center Vinyl Label */}
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full bg-gradient-to-tr from-[#0f172a] via-[#1e293b] to-[#0f172a] border-2 border-cyan-400/40 shadow-[0_0_25px_rgba(6,182,212,0.35)] flex items-center justify-center">
                {/* Metallic Spindle Ring */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-b from-slate-700 via-slate-900 to-slate-800 border border-slate-600/50 flex items-center justify-center shadow-lg">
                  {/* Glowing Play Icon Center */}
                  <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-cyan-500/20 border border-cyan-400/80 flex items-center justify-center text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.6)]">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 translate-x-0.5 fill-current text-cyan-300"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>

                {/* Spindle hole */}
                <div className="absolute w-2.5 h-2.5 rounded-full bg-[#05070a] border border-slate-700" />
              </div>
            </div>
          </div>
        </div>

        {/* The ONLY text on the presentation screen (MASSIMA UNA SCRITTA) */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-[0.22em] uppercase bg-gradient-to-r from-slate-100 via-cyan-200 to-slate-100 bg-clip-text text-transparent drop-shadow-[0_2px_12px_rgba(6,182,212,0.4)]">
          Virtuoso DJ Studio
        </h1>
      </div>
    </div>
  );
};
