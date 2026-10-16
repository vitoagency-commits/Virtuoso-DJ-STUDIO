import React from 'react';
import { Keyboard, X, Play, Disc, ArrowLeftRight, ArrowUpDown, Sparkles, CheckCircle2, LayoutGrid } from 'lucide-react';

interface KeyboardMappingModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDeckId: 'deckA' | 'deckB';
  onSelectDeck: (deckId: 'deckA' | 'deckB') => void;
}

export const KeyboardMappingModal: React.FC<KeyboardMappingModalProps> = ({
  isOpen,
  onClose,
  activeDeckId,
  onSelectDeck,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-2xl bg-[#0f121a] border border-[#262e42] rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#151a26] border-b border-[#232b3d]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white tracking-wide">Mappatura Tasti &amp; Controlli Rapidi (Transport Mapping)</h2>
              <p className="text-[11px] text-slate-400">Controlla la consolle da tastiera fisica su Mac, PC o iPad con Magic Keyboard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Deck Active Selector */}
        <div className="px-4 py-2.5 bg-[#121622] border-b border-[#1f2638] flex items-center justify-between">
          <span className="text-xs text-slate-300 font-medium">Deck Attivo Ricevitore (Focus):</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onSelectDeck('deckA')}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition border ${
                activeDeckId === 'deckA'
                  ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.4)]'
                  : 'bg-[#1a202e] text-slate-400 border-slate-700 hover:text-cyan-300'
              }`}
            >
              DECK 1 (A)
            </button>
            <button
              onClick={() => onSelectDeck('deckB')}
              className={`px-3 py-1 rounded text-xs font-mono font-bold transition border ${
                activeDeckId === 'deckB'
                  ? 'bg-orange-500 text-slate-950 border-orange-400 shadow-[0_0_10px_rgba(249,115,22,0.4)]'
                  : 'bg-[#1a202e] text-slate-400 border-slate-700 hover:text-orange-300'
              }`}
            >
              DECK 2 (B)
            </button>
            <span className="text-[10px] font-mono text-slate-500 ml-1">Premi [TAB] per alternare</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {/* Main Transport Functions */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-cyan-400 font-mono font-bold text-xs uppercase tracking-wider">
              <Play className="w-3.5 h-3.5" />
              <span>Funzioni di Trasporto Principali (Transport)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="p-2.5 rounded-lg bg-[#141824] border border-[#232b3d] flex items-start justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className="text-emerald-400">PLAY / PAUSE</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Avvia o mette in pausa il Deck attivo. Tieni premuto per cue preview.</p>
                </div>
                <kbd className="px-2.5 py-1 rounded bg-slate-800 text-emerald-300 font-mono font-bold text-xs border border-slate-700 shadow-sm shrink-0">
                  SPAZIO
                </kbd>
              </div>

              <div className="p-2.5 rounded-lg bg-[#141824] border border-[#232b3d] flex items-start justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className="text-amber-400">CUE (Stutter Point)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Salta al Cue e mette in pausa. Tenendo premuto suona in anteprima.</p>
                </div>
                <kbd className="px-2.5 py-1 rounded bg-slate-800 text-amber-300 font-mono font-bold text-xs border border-slate-700 shadow-sm shrink-0">
                  C
                </kbd>
              </div>

              <div className="p-2.5 rounded-lg bg-[#141824] border border-[#232b3d] flex items-start justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className="text-blue-400">SYNC (BPM &amp; Phase)</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Allinea all'istante il BPM e la fase della battuta con il Master.</p>
                </div>
                <kbd className="px-2.5 py-1 rounded bg-slate-800 text-blue-300 font-mono font-bold text-xs border border-slate-700 shadow-sm shrink-0">
                  S
                </kbd>
              </div>

              <div className="p-2.5 rounded-lg bg-[#141824] border border-[#232b3d] flex items-start justify-between">
                <div>
                  <div className="font-bold text-white flex items-center gap-1.5">
                    <span className="text-purple-400">CAMBIA DECK ATTIVO</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-0.5">Alterna il comando di Spazio/C/S tra Deck 1 (Cyan) e Deck 2 (Orange).</p>
                </div>
                <kbd className="px-2.5 py-1 rounded bg-slate-800 text-purple-300 font-mono font-bold text-xs border border-slate-700 shadow-sm shrink-0">
                  TAB
                </kbd>
              </div>
            </div>
          </div>

          {/* Direct Controls for Deck 2 */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-orange-400 font-mono font-bold text-xs uppercase tracking-wider">
              <Disc className="w-3.5 h-3.5" />
              <span>Controlli Diretti Simultanei per Deck 2 (Senza cambiare Deck)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="p-2 rounded bg-[#141824] border border-[#232b3d] flex items-center justify-between">
                <span className="text-slate-300 text-[11px]">Play/Pause Deck 2:</span>
                <div className="flex gap-1 font-mono text-[10px]">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-orange-300 border border-slate-700">INVIO</kbd>
                  <span className="text-slate-500">o</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-orange-300 border border-slate-700">⇧+Spazio</kbd>
                </div>
              </div>
              <div className="p-2 rounded bg-[#141824] border border-[#232b3d] flex items-center justify-between">
                <span className="text-slate-300 text-[11px]">CUE Deck 2:</span>
                <div className="flex gap-1 font-mono text-[10px]">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">,</kbd>
                  <span className="text-slate-500">o</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700">⇧+C</kbd>
                </div>
              </div>
              <div className="p-2 rounded bg-[#141824] border border-[#232b3d] flex items-center justify-between">
                <span className="text-slate-300 text-[11px]">SYNC Deck 2:</span>
                <div className="flex gap-1 font-mono text-[10px]">
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-blue-300 border border-slate-700">.</kbd>
                  <span className="text-slate-500">o</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-blue-300 border border-slate-700">⇧+S</kbd>
                </div>
              </div>
            </div>
          </div>

          {/* Tempo, Nudge & Performance */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold text-xs uppercase tracking-wider">
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Pitch Bend, Nudge e Hot Cues</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="p-2 bg-[#141824] rounded border border-[#232b3d] flex items-center justify-between">
                <span className="text-slate-300">Pitch Bend / Nudge (Rallenta o Accelera):</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">← / →</kbd>
              </div>
              <div className="p-2 bg-[#141824] rounded border border-[#232b3d] flex items-center justify-between">
                <span className="text-slate-300">Regolazione Cursore Pitch Tempo (±0.5%):</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono">↑ / ↓</kbd>
              </div>
              <div className="p-2 bg-[#141824] rounded border border-[#232b3d] flex items-center justify-between">
                <span className="text-slate-300">Richiama Hot Cue 1, 2, 3, 4:</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-amber-300 font-mono">1, 2, 3, 4</kbd>
              </div>
              <div className="p-2 bg-[#141824] rounded border border-[#232b3d] flex items-center justify-between">
                <span className="text-slate-300">Lancia Transizione AI AutoMix:</span>
                <kbd className="px-2 py-0.5 rounded bg-slate-800 text-pink-300 font-mono">A</kbd>
              </div>
            </div>
          </div>

          {/* Dynamic Panels & Viewports Hotkeys */}
          <div className="space-y-2">
            <div className="flex items-center gap-1.5 text-cyan-400 font-mono font-bold text-xs uppercase tracking-wider">
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Gestione Pannelli, Splitter &amp; Ingrandimento Dinamico</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-[11px]">
              <div className="p-2 bg-[#141824] rounded border border-[#232b3d] flex flex-col justify-between gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Mixer Virtuale</span>
                  <kbd className="px-2 py-0.5 rounded bg-slate-800 text-purple-300 font-mono font-bold">M</kbd>
                </div>
                <p className="text-[10px] text-slate-400">
                  Nasconde il mixer e allarga i Deck al 100% di larghezza.
                </p>
              </div>

              <div className="p-2 bg-[#141824] rounded border border-[#232b3d] flex flex-col justify-between gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Waveform Superiori</span>
                  <kbd className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono font-bold">W</kbd>
                </div>
                <p className="text-[10px] text-slate-400">
                  Nasconde o mostra le waveform impilate in cima.
                </p>
              </div>

              <div className="p-2 bg-[#141824] rounded border border-[#232b3d] flex flex-col justify-between gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Libreria / Browser</span>
                  <kbd className="px-2 py-0.5 rounded bg-slate-800 text-emerald-300 font-mono font-bold">B</kbd>
                </div>
                <p className="text-[10px] text-slate-400">
                  Cicla tra Standard, Massimizzato, Compatto e Nascosto.
                </p>
              </div>

              <div className="p-2 bg-[#141824] rounded border border-[#232b3d] flex flex-col justify-between gap-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">Reset Dimensioni</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono font-bold">Alt + R</kbd>
                </div>
                <p className="text-[10px] text-slate-400">
                  Ripristina tutte le dimensioni degli splitter e pannelli al default.
                </p>
              </div>
            </div>
          </div>

          {/* Splitters & Drag & Drop Tip */}
          <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/40 flex flex-col sm:flex-row items-start sm:items-center gap-2.5 text-cyan-200 text-[11px]">
            <Disc className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 sm:mt-0" />
            <div className="space-y-0.5">
              <div>
                <strong className="text-white">Splitter Ridimensionabili:</strong> Puoi afferrare e trascinare le comode barre splitter orizzontali (tra Decks e Browser) e verticali (tra Deck 1, Mixer e Deck 2, o nella colonna Crates) per calibrare lo spazio. Fai <strong>doppio click</strong> su qualunque splitter o premi <strong>Alt+R</strong> per tornare istantaneamente alle dimensioni di default.
              </div>
              <div className="text-cyan-300">
                <strong className="text-white">Caricamento rapido sui Piatti:</strong> Trascina qualunque brano dall'elenco in basso direttamente sopra il piatto / jog wheel di Deck 1 o Deck 2 per caricarlo!
              </div>
              <div className="text-cyan-200">
                <strong className="text-white">Piatti Grandi per iPad:</strong> Usa il selettore rapido <em>"IPAD GRANDE"</em> nella barra superiore o direttamente sopra il piatto per ingrandire i jog wheel (da 200px a 270px o 330px Maxi), offrendo la massima precisione ed ergonomia per lo scratch con le dita.
              </div>
            </div>
          </div>

          {/* Safety Notice */}
          <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-700/80 flex items-center gap-2 text-slate-300 text-[11px]">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>
              I tasti sono protetti: quando digiti nella barra di ricerca delle tracce o salvi una scaletta, le lettere non attivano i comandi musicali.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-4 py-2.5 bg-[#151a26] border-t border-[#232b3d] flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition"
          >
            Chiudi &amp; Inizia a Suonare
          </button>
        </div>
      </div>
    </div>
  );
};
