import React, { useState } from 'react';
import {
  BookOpen,
  GraduationCap,
  X,
  Play,
  Disc3,
  Sliders,
  Sparkles,
  Layers,
  Activity,
  CheckCircle2,
  HelpCircle,
  ArrowRight,
  Flame,
  Volume2,
  Keyboard,
  Smartphone,
  Laptop,
  Music,
  Zap,
  Target,
  Clock,
  Radio,
  Headphones,
  Cable,
  SlidersHorizontal,
  Info,
  Check,
  RefreshCw,
} from 'lucide-react';
import { audioEngine } from '../audio/audioEngine';

interface InteractiveDjManualModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRunInteractiveExercise?: (exerciseId: string) => void;
}

type TabType =
  | 'remix_points'
  | 'audio_routing'
  | 'quantize_beatgrid'
  | 'web_midi'
  | 'lessons'
  | 'controls'
  | 'shortcuts'
  | 'quiz';

export const InteractiveDjManualModal: React.FC<InteractiveDjManualModalProps> = ({
  isOpen,
  onClose,
  onRunInteractiveExercise,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('remix_points');
  const [selectedRemixStyle, setSelectedRemixStyle] = useState<
    'bass_swap' | 'mashup_acapella' | 'riser_drop' | 'harmonic_energy'
  >('bass_swap');
  const [selectedLesson, setSelectedLesson] = useState<number>(0);

  // Quiz state
  const [quizScore, setQuizScore] = useState<number | null>(null);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});

  if (!isOpen) return null;

  // I 4 Scenari Intuitivi del "Punto Esatto di Remix"
  const remixScenarios = {
    bass_swap: {
      title: '1. Il Bass-Swap Perfetto sul Drop (Transizione Club & Festival)',
      exactPointTimeA: '02:08 (Inizio Outro Frase 64)',
      exactPointTimeB: '00:00 (Battuta 1 della Cassa di B)',
      description:
        'La tecnica principe della musica dance mondiale: passare dalla traccia corrente alla nuova senza perdere un millisecondo di ritmo e senza impastare i bassi.',
      visualTimeline: {
        trackA: [
          { label: 'INTRO', color: 'bg-blue-900/50 text-blue-300', width: '20%' },
          { label: 'STROFA & MELODIA', color: 'bg-cyan-900/50 text-cyan-300', width: '35%' },
          { label: 'RITORNELLO PEAK', color: 'bg-emerald-900/50 text-emerald-300', width: '25%' },
          {
            label: 'OUTRO FADE ⚡',
            color: 'bg-amber-900/70 text-amber-300 border-2 border-amber-400 font-bold',
            width: '20%',
          },
        ],
        trackB: [
          {
            label: '⚡ INGRESSO BEAT 1',
            color: 'bg-rose-900/70 text-rose-300 border-2 border-rose-400 font-bold',
            width: '25%',
          },
          { label: 'BUILD-UP RITMICO', color: 'bg-purple-900/50 text-purple-300', width: '30%' },
          { label: 'MAIN DROP EXPLOSION', color: 'bg-rose-600/70 text-white font-bold', width: '45%' },
        ],
      },
      whyExplanation: [
        {
          title: '🧠 La Quadratura delle 32 Battute (Psicoacustica del Cervello)',
          text: 'Il cervello di chi balla conta inconsciamente in cicli simmetrici da 16 e 32 battute. Se inserisci la nuova traccia a battuta 17 o 23, la pista avverte un "inciampo" ritmico. Entrando sul primo quarto della battuta 32 o 64, il pubblico percepisce la transizione come naturale, fluida ed emozionante.',
        },
        {
          title: '🔊 Lo Spazio Acustico per il Subwoofer (Zero Fango Sonoro)',
          text: 'A questo punto esatto la melodia principale della Traccia A si è conclusa e si spoglia. È il millisecondo in cui tagli il basso di A (Low Kill) e apri il basso di B: tutta l\'energia delle basse frequenze viene trasferita alla nuova traccia senza sovrapposizione o distorsione!',
        },
        {
          title: '🎶 Compatibilità Armonica Camelot',
          text: 'Se Traccia A è in 8A e Traccia B è in 9A, il momento in cui scambi il basso produce un balzo di energia (+1 Step) che carica la pista per il ritornello successivo.',
        },
      ],
      exerciseId: 'bass_swap',
      exerciseButtonText: 'Ascolta e Prova il Bass-Swap a Tempo (Simulatore Live)',
    },
    mashup_acapella: {
      title: '2. Il Mashup Acapella Live (Voce di A sopra il Beat di B)',
      exactPointTimeA: '01:08 (Inizio Breakdown Vocale)',
      exactPointTimeB: '00:15 (Intro Strumentale Groovy)',
      description:
        'Isolare la voce cantante e farla atterrare sopra la linea di basso e cassa di un altro brano usando la tecnologia AI Stems.',
      visualTimeline: {
        trackA: [
          { label: 'BEAT DI APERTURA', color: 'bg-blue-900/50 text-blue-300', width: '25%' },
          {
            label: '⚡ BREAKDOWN VOCALE ISOLATO',
            color: 'bg-purple-900/80 text-purple-300 border-2 border-purple-400 font-bold',
            width: '40%',
          },
          { label: 'DROP SECONDARIO', color: 'bg-cyan-900/50 text-cyan-300', width: '35%' },
        ],
        trackB: [
          {
            label: '⚡ CASSA & BASSO STRUMENTALE',
            color: 'bg-emerald-900/80 text-emerald-300 border-2 border-emerald-400 font-bold',
            width: '40%',
          },
          { label: 'ACCENTI PERCUSSIVI', color: 'bg-amber-900/50 text-amber-300', width: '30%' },
          { label: 'CORO', color: 'bg-rose-900/50 text-rose-300', width: '30%' },
        ],
      },
      whyExplanation: [
        {
          title: '🎤 Spazio Vocale Libero (Zero Conflitti di Testo)',
          text: 'Durante il breakdown di Traccia A, la batteria si ferma e rimane solo la voce cantante. Se Traccia B in quel punto è puramente ritmica (senza cantato), la voce di A si appoggia perfettamente sul groove di B, creando un remix inedito dal vivo.',
        },
        {
          title: '🎛️ Il Ruolo degli AI Stems in Tempo Reale',
          text: 'Con il tasto SOLO VOCALS su Deck A, eliminiamo anche i residui di synth o riverberi secondari: la voce galleggia con purezza cristallina sopra il beat potente del Deck B.',
        },
      ],
      exerciseId: 'stems_mashup',
      exerciseButtonText: 'Ascolta il Mashup Live Acapella (Simulatore Live)',
    },
    riser_drop: {
      title: '3. Transizione ad Alta Tensione con AI Riser Build (Cambio di Ritmo)',
      exactPointTimeA: '01:45 (8 Battute prima del cambio)',
      exactPointTimeB: '00:00 (Drop Esplosivo Diretto)',
      description:
        'Come passare da un genere all\'altro o cambiare velocità BPM usando il crescendo e il taglio secco prima della cassa.',
      visualTimeline: {
        trackA: [
          { label: 'PROGRESSIONE', color: 'bg-blue-900/50 text-blue-300', width: '40%' },
          {
            label: '⚡ 8 BATTUTE DI RISER SWEEP',
            color: 'bg-amber-950 text-amber-300 border-2 border-amber-400 font-bold animate-pulse',
            width: '35%',
          },
          { label: 'CUT!', color: 'bg-slate-900 text-slate-500', width: '25%' },
        ],
        trackB: [
          { label: 'SILENZIO IN CUE', color: 'bg-slate-900 text-slate-500', width: '75%' },
          {
            label: '⚡ DROP BOMBA!',
            color: 'bg-rose-600 text-white font-black border-2 border-rose-300',
            width: '25%',
          },
        ],
      },
      whyExplanation: [
        {
          title: '🔥 La Tensione Crescente (Filtro Passa-Alto Esponenziale)',
          text: 'Nelle 8 battute che precedono il punto esatto, attivando AI Riser Build il filtro taglia i bassi e alza le frequenze medie/alte in risonanza mentre il riverbero si espande. Questo crea un senso di caduta e attesa spasmodica nel pubblico.',
        },
        {
          title: '💥 Il Taglio Secco (Drop Impact)',
          text: 'Sull\'ultimo millisecondo della battuta, fermi Traccia A e rilasci la cassa di Traccia B sul Beat 1. Il contrasto tra il vuoto di tensione e la pienezza della nuova cassa fa esplodere l\'adrenalina sulla pista!',
        },
      ],
      exerciseId: 'riser_macro',
      exerciseButtonText: 'Ascolta e Prova il Riser Build Drop (Simulatore Live)',
    },
    harmonic_energy: {
      title: '4. Transizione Energetica Armonica (+1 Camelot Wheel Step)',
      exactPointTimeA: '02:30 (Chiusura Frase Outro)',
      exactPointTimeB: '00:00 (Battuta 1)',
      description:
        'Aumentare l\'energia psicologica del dancefloor muovendosi di una posizione in senso orario sulla ruota Camelot (es. 8A → 9A).',
      visualTimeline: {
        trackA: [
          { label: 'PROGRESSIONE TONALE (8A)', color: 'bg-indigo-900/50 text-indigo-300', width: '60%' },
          {
            label: 'OUTRO RITMICO (8A)',
            color: 'bg-indigo-950 text-indigo-300 border-r border-indigo-700',
            width: '40%',
          },
        ],
        trackB: [
          {
            label: '⚡ ENERGIA SUPERIORE (+1 STEP 9A)',
            color: 'bg-emerald-600 text-white font-bold border-2 border-emerald-300',
            width: '40%',
          },
          { label: 'ESPLOSIONE ARMONICA', color: 'bg-emerald-900/60 text-emerald-300', width: '60%' },
        ],
      },
      whyExplanation: [
        {
          title: '🎼 Perché il +1 Step stimola il cervello?',
          text: 'Nella teoria musicale occidentale, salire di una quinta perfetta (+1 Camelot) aggiunge brillantezza e tensione positiva all\'accordo di fondo. Gli ascoltatori avvertono una sensazione fisica di ascesa emotiva.',
        },
        {
          title: '🚫 Evitare i Salti Dissonanti (es. 8A → 2A)',
          text: 'Un salto di 6 step equivale a una tonalità a semitono di distanza, producendo un tremendo "scontro di accordi" sgradevole per l\'udito umano.',
        },
      ],
      exerciseId: 'harmonic_match',
      exerciseButtonText: 'Ascolta il Match Armonico Camelot (Simulatore Live)',
    },
  };

  const currentScenario = remixScenarios[selectedRemixStyle];

  // Lezioni classiche e avanzate
  const lessons = [
    {
      id: 'fundamentals',
      title: '1. I Fondamentali del DJing & Cue Point',
      category: 'LIVELLO BASE',
      badgeColor: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40',
      summary: 'Come caricare le tracce, impostare il marcatore CUE, usare PLAY e contare le 4 battute.',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            Il compito principale di un DJ è creare un flusso continuo di musica. Per farlo senza interruzioni:
          </p>
          <div className="bg-[#161a26] p-3 rounded-lg border border-[#262f44] space-y-2">
            <div className="font-bold text-white flex items-center gap-1.5">
              <Disc3 className="w-4 h-4 text-cyan-400" />
              Il tasto CUE: Il tuo punto di partenza
            </div>
            <p>
              • <strong>A traccia ferma:</strong> Premendo <code>CUE</code> imposti il marcatore di partenza nel punto esatto del playhead (solitamente sulla prima cassa del brano).
            </p>
            <p>
              • <strong>In riproduzione:</strong> Premendo <code>CUE</code> la traccia si ferma istantaneamente e torna al marcatore memorizzato.
            </p>
            <p>
              • <strong>Stutter Cue (Tieni premuto):</strong> Tenendo premuto <code>CUE</code> ascolti la traccia; rilasciando il tasto il brano si ferma tornando al punto CUE. Questo ti permette di "battere il tempo" a tempo con la musica!
            </p>
          </div>
        </div>
      ),
      exerciseId: 'cue_stutter',
      exerciseLabel: 'Prova Esercizio: Stutter Cue & Partenza a Tempo',
    },
    {
      id: 'audio_routing_lesson',
      title: '2. Audio Routing & Preascolto in Cuffia (PFL Ch 3-4)',
      category: 'AUDIO & HARDWARE',
      badgeColor: 'text-purple-400 border-purple-500/40 bg-purple-950/40',
      summary: 'Come ascoltare in cuffia senza che il pubblico in pista senta nulla prima del mix.',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            In discoteca, il pubblico ascolta solo i <strong>Canali 1-2 (Master)</strong>. Il DJ ascolta in anteprima i <strong>Canali 3-4 (Cuffie / PFL)</strong> per mettere a tempo la traccia prima di aprire il fader.
          </p>
          <div className="bg-[#161a26] p-3 rounded-lg border border-[#262f44] space-y-2">
            <p>
              • <strong>Tasto CUE / PFL sul canale:</strong> Invia l'audio del deck alle cuffie prima del fader del volume (Pre-Fade Listen).
            </p>
            <p>
              • <strong>CUE MIX Knob:</strong> Regola la percentuale tra ciò che stai preparando (Cue) e ciò che suona in pista (Master).
            </p>
            <p>
              • <strong>SPLIT CUE:</strong> Divide le cuffie in due: Orecchio Sinistro = Traccia in preparazione, Orecchio Destro = Traccia in pista. Fondamentale nei club rumorosi!
            </p>
          </div>
        </div>
      ),
      exerciseId: 'audio_routing_demo',
      exerciseLabel: 'Prova Esercizio: Attiva Preascolto PFL Cuffie',
    },
    {
      id: 'quantize_beatgrid_lesson',
      title: '3. Quantize Magnetico & Beatgrid Matematico',
      category: 'PRECISIONE RITMICA',
      badgeColor: 'text-emerald-400 border-emerald-500/40 bg-emerald-950/40',
      summary: 'Come agganciare Hot Cues, Loop e tagli ritmici senza mai sbagliare millisecondo.',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            Anche i DJ più esperti hanno una latenza umana di 20-50ms quando premono un pulsante. Il <strong>Quantize Magnetico</strong> corregge istantaneamente il tocco agganciandolo alla griglia metrica (Beatgrid).
          </p>
          <div className="bg-[#161a26] p-3 rounded-lg border border-[#262f44] space-y-2">
            <p>
              • <strong>Quantize 1/1:</strong> Ideale per far partire la traccia o saltare tra strofe e drop: la cassa entra perfetta sul quarto!
            </p>
            <p>
              • <strong>Quantize 1/4:</strong> Ideale per roll veloci e beat juggling con i pad.
            </p>
            <p>
              • <strong>Offset Beatgrid:</strong> Corregge le tracce in cui il primo battito non coincide con l'inizio del file audio.
            </p>
          </div>
        </div>
      ),
      exerciseId: 'quantize_demo',
      exerciseLabel: 'Prova Esercizio: Snap Magnetico 1/1 & Auto-Loop',
    },
    {
      id: 'harmonic',
      title: '4. Il Mix Armonico & Camelot Wheel',
      category: 'TEORIA MUSICALE',
      badgeColor: 'text-amber-400 border-amber-500/40 bg-amber-950/40',
      summary: 'Come mixare le tonalità senza dissonanze usando la ruota di Camelot e alzare l\'energia della pista.',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            Due canzoni con lo stesso BPM possono suonare sgradevoli insieme se le loro tonalità musicali sono in disaccordo. Il <strong>Mix Armonico</strong> risolve questo problema grazie alla ruota <strong>Camelot</strong>.
          </p>
          <div className="bg-[#161a26] p-3 rounded-lg border border-[#262f44] space-y-2">
            <p>1. <strong>Stessa Tonalità (es. 8A → 8A):</strong> Zero dissonanze armoniche.</p>
            <p>2. <strong>Step di Energia +1 (es. 8A → 9A):</strong> Aumenta la carica energetica sulla pista.</p>
            <p>3. <strong>Cambio di Mood (es. 8A → 8B):</strong> Passa dalla tonalità minore alla maggiore relativa.</p>
          </div>
        </div>
      ),
      exerciseId: 'harmonic_match',
      exerciseLabel: 'Prova Esercizio: Verifica Compatibilità Camelot',
    },
    {
      id: 'eq_bass_swap',
      title: '5. Equalizzazione & Il "Bass-Swap"',
      category: 'TECNICA DI MIXAGGIO',
      badgeColor: 'text-rose-400 border-rose-500/40 bg-rose-950/40',
      summary: 'La tecnica regina dei festival: mai due linee di basso insieme! Come eseguire lo swap perfetto.',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            L'errore più comune dei principianti è lasciare i bassi di entrambi i brani al massimo durante la transizione.
          </p>
          <div className="bg-[#161a26] p-3 rounded-lg border border-[#262f44] space-y-2">
            <p>1. <strong>Prepara Deck B:</strong> Attiva <code>LOW KILL</code> prima di avviare.</p>
            <p>2. <strong>Inserisci Medie e Alte:</strong> Alza gradualmente il fader.</p>
            <p>3. <strong>Sul Drop:</strong> Scambia istantaneamente i bassi (taglia A, apri B).</p>
          </div>
        </div>
      ),
      exerciseId: 'bass_swap',
      exerciseLabel: 'Prova Esercizio: Esegui il Bass-Swap Guidato',
    },
    {
      id: 'web_midi_lesson',
      title: '6. Controller Fisici USB & Web MIDI',
      category: 'HARDWARE & LIVE',
      badgeColor: 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40',
      summary: 'Come collegare Pioneer DDJ, Traktor o Denon via USB e mappare manopole e piatti al volo.',
      content: (
        <div className="space-y-3 text-xs text-slate-300">
          <p>
            Virtuoso DJ Studio include un driver Web MIDI nativo integrato. Basta collegare il controller alla porta USB del computer o Mac:
          </p>
          <div className="bg-[#161a26] p-3 rounded-lg border border-[#262f44] space-y-2">
            <p>• <strong>Riconoscimento Automatico:</strong> I modelli più diffusi (DDJ-FLX4, DDJ-400, SB3, Traktor S2) si configurano istantaneamente.</p>
            <p>• <strong>MIDI Learn:</strong> Puoi rimappare qualunque tasto o manopola toccando "Learn" e muovendo il controllo fisico.</p>
            <p>• <strong>Scratch a Bassa Latenza:</strong> I piatti jog rispondono con risoluzione a 14-bit per uno scratch vinile autentico.</p>
          </div>
        </div>
      ),
      exerciseId: 'midi_guide',
      exerciseLabel: 'Apri Gestione Controller Web MIDI',
    },
  ];

  const controlsGuide = [
    {
      name: 'Jog Wheel Platter',
      desc: 'Piatto vinile interattivo: tocca al centro per scratchare autenticamente; tocca il bordo esterno per fare pitch bend (+/- tempo).',
    },
    {
      name: 'Headphone Cue Monitor (Ch 3-4)',
      desc: 'Sezione monitoraggio preascolto dedicata: controllo volume cuffie, manopola CUE MIX, Master Cue e Split Cue per discoteca.',
    },
    {
      name: 'Magnetic Quantize (1/1, 1/2, 1/4, 1/8)',
      desc: 'Snap magnetico sulla griglia beatgrid. Assicura che Hot Cues, loops e partenze cadano matematicamente sul tempo.',
    },
    {
      name: 'Web MIDI Controller Engine',
      desc: 'Integrazione plug-and-play per controller DJ USB fisici (Pioneer, Denon, Traktor, Hercules) con MIDI Learn e feedback LED.',
    },
    {
      name: 'CUE Button',
      desc: 'Memorizza o richiama la posizione di partenza. Tenendo premuto esegui lo stuttering a tempo.',
    },
    {
      name: 'PLAY / PAUSE',
      desc: 'Avvia o ferma la riproduzione del deck con indicatore LED pulsante verde.',
    },
    {
      name: 'SYNC Button',
      desc: 'Allinea all\'istante il BPM e la fase delle battute (beat phase) al Deck Master.',
    },
    {
      name: 'Pitch / Tempo Slider',
      desc: 'Slider verticale del tempo regolabile a ±8%, ±16% o ±50% con tasto Master Tempo per bloccare la tonalità.',
    },
    {
      name: '3-Band EQ & Kills',
      desc: 'Equalizzatore per Alti (HI), Medi (MID) e Bassi (LOW) con interruttori KILL dedicati.',
    },
    {
      name: 'Sound Color Filter',
      desc: 'Filtro a manopola duale: verso sinistra filtro passa-basso (LPF), verso destra filtro passa-alto (HPF).',
    },
    {
      name: 'Crossfader & Curve',
      desc: 'Miscelatore orizzontale tra Deck A e Deck B con curve Smooth (blend da club), Linear e Scratch (taglio secco).',
    },
    {
      name: 'Performance Pads & AI Stems',
      desc: '8 pad silicone per Hot Cues, Auto Beat Loops (1/8 a 32 battute), AI Stems in tempo reale, Sampler e FX Glitch.',
    },
  ];

  const keyboardShortcuts = [
    { key: 'SPAZIO', action: 'Play / Pause sul Deck attivo' },
    { key: 'C', action: 'CUE (Stutter e Ritorno al punto di Cue)' },
    { key: 'S', action: 'SYNC automatico al Deck Master' },
    { key: 'TAB', action: 'Alterna Deck Attivo (Deck 1 ↔ Deck 2)' },
    { key: 'INVIO o ⇧+SPAZIO', action: 'Play / Pause Deck 2 diretto' },
    { key: ', (virgola) o ⇧+C', action: 'CUE Deck 2 diretto' },
    { key: '. (punto) o ⇧+S', action: 'SYNC Deck 2 diretto' },
    { key: '← / →', action: 'Micro pitch-bend / nudge (rallenta / accelera)' },
    { key: '↑ / ↓', action: 'Regola cursore Pitch Tempo (±0.5%)' },
    { key: '1, 2, 3, 4', action: 'Richiama Hot Cues 1-4 sul Deck attivo' },
    { key: 'M', action: 'Mostra / Nascondi Mixer Virtuale Centrale' },
    { key: 'B', action: 'Mostra / Nascondi Browser Libreria Tracce' },
    { key: 'A', action: 'Lancia transizione AI AutoMix' },
    { key: '?', action: 'Mappa completa scorciatoie da tastiera' },
  ];

  const quizQuestions = [
    {
      question:
        'A cosa serve il routing audio indipendente su Canali 3-4 (PFL Cuffie)?',
      options: [
        'A far sentire le cuffie anche al pubblico in pista',
        'A consentire al DJ di preascoltare e sincronizzare il prossimo brano senza che il pubblico senta nulla dal Master (Ch 1-2)',
        'A raddoppiare il volume delle casse',
        'A consumare meno batteria sul computer',
      ],
      correct: 1,
      explanation:
        'In qualsiasi consolle professionale, i Canali 1-2 alimentano il Main Master, mentre i Canali 3-4 alimentano l\'amplificatore cuffie per il PFL (Pre-Fade Listen).',
    },
    {
      question:
        'Cosa fa la funzione Quantize con risoluzione 1/1 quando viene premuto un Hot Cue?',
      options: [
        'Avvia il brano a caso',
        'Aggancia magneticamente il punto di partenza esattamente sulla prima cassa della battuta intera più vicina',
        'Aumenta il volume del master',
        'Disattiva i bassi',
      ],
      correct: 1,
      explanation:
        'Il Quantize calcola la griglia metrica (Beatgrid) e corregge la latenza del tocco umano, garantendo sincronismo nanometrico a tempo di musica.',
    },
    {
      question:
        'Perché il punto esatto di remixaggio deve trovarsi sull\'inizio di una frase (es. battuta 32 o 64)?',
      options: [
        'Perché il computer altrimenti va in blocco',
        'Perché il cervello umano percepisce simmetria e cambio di energia naturale solo all\'inizio frase',
        'Perché i vinili sono rotondi',
        'Non c\'è alcuna ragione, si può entrare a qualsiasi battuta',
      ],
      correct: 1,
      explanation:
        'La musica dance è costruita su cicli di 16/32 battute. Rispettare la quadratura garantisce che la melodia precedente si chiuda proprio mentre inizia la nuova.',
    },
    {
      question:
        'Se stai suonando un brano in chiave Camelot 8A, quale chiave alzerà l\'energia sulla pista?',
      options: ['Chiave 4B', 'Chiave 9A (+1 Step di Energia)', 'Chiave 2A', 'Chiave 12B'],
      correct: 1,
      explanation:
        'Sulla ruota di Camelot, muoversi in avanti di un numero (+1, es. da 8A a 9A) produce una spinta di energia tonale percepita dal pubblico.',
    },
    {
      question:
        'Cosa devi fare con i bassi sul punto esatto di arrivo del Drop?',
      options: [
        'Lasciare entrambi i bassi al 100%',
        'Eseguire il Bass-Swap: tagliare il basso del brano vecchio e liberare il basso del nuovo',
        'Chiudere il volume master',
        'Accendere tutti gli echi contemporaneamente',
      ],
      correct: 1,
      explanation:
        'Il Bass-Swap evita la sovrapposizione e cancellazione di fase nelle basse frequenze, garantendo l\'impatto pulito del nuovo subwoofer.',
    },
  ];

  const handleSelectQuizAnswer = (qIdx: number, aIdx: number) => {
    setSelectedAnswers((prev) => ({ ...prev, [qIdx]: aIdx }));
  };

  const handleCalculateScore = () => {
    let score = 0;
    quizQuestions.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correct) score += 1;
    });
    setQuizScore(score);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/85 backdrop-blur-xs select-none">
      <div className="bg-[#12151f] border border-[#2b3347] rounded-xl w-full max-w-5xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#212739] bg-[#161a28]">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-cyan-950/80 border border-cyan-500/40 text-cyan-400">
              <GraduationCap className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-wide flex items-center gap-2">
                <span>MANUALE INTERATTIVO &amp; VIRTUOSO DJ ACADEMY</span>
                <span className="text-[10px] px-2 py-0.5 rounded font-mono bg-cyan-950 border border-cyan-500/60 text-cyan-300">
                  VERSIONE PRO CLUB
                </span>
              </h2>
              <p className="text-[11px] text-slate-400">
                Guida completa a Remix Point, Audio Routing Ch 3-4, Quantize Magnetico, Web MIDI e Mixaggio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-xs px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer"
          >
            CHIUDI [ESC]
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#212739] bg-[#0e111a] px-3 gap-1 overflow-x-auto text-xs scrollbar-none">
          {[
            { id: 'remix_points', label: '⚡ Il Punto Esatto di Remix', icon: Target },
            { id: 'audio_routing', label: '🎧 Audio Routing Cuffie Ch 3-4', icon: Headphones },
            { id: 'quantize_beatgrid', label: '🧲 Quantize & Beatgrid', icon: Zap },
            { id: 'web_midi', label: '🎹 Controller Web MIDI', icon: Sliders },
            { id: 'lessons', label: '🎓 Corso di Mixaggio (Lezioni)', icon: BookOpen },
            { id: 'controls', label: '🎛️ Guida ai Controlli', icon: SlidersHorizontal },
            { id: 'shortcuts', label: '⌨️ Tasti Rapidi Mac & iOS', icon: Keyboard },
            { id: 'quiz', label: '❓ Test del DJ (Quiz)', icon: HelpCircle },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-1.5 px-3 py-2.5 font-semibold whitespace-nowrap border-b-2 transition cursor-pointer text-xs ${
                  isActive
                    ? 'border-cyan-400 text-cyan-300 bg-cyan-950/30'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Body Content */}
        <div className="p-4 overflow-y-auto flex-1 space-y-4">
          {/* TAB 1: IL PUNTO ESATTO DI REMIXAGGIO */}
          {activeTab === 'remix_points' && (
            <div className="space-y-4">
              {/* Selettore Stili di Remix Intuitivi */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'bass_swap', label: '1. Bass-Swap sul Drop', subtitle: 'La tecnica regina dei club' },
                  { id: 'mashup_acapella', label: '2. Mashup Acapella Live', subtitle: 'Voce pura sul beat' },
                  { id: 'riser_drop', label: '3. Riser Build & Cut', subtitle: 'Tensione prima dell\'esplosione' },
                  { id: 'harmonic_energy', label: '4. Energia Armonica +1', subtitle: 'Salto di tonalità Camelot' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedRemixStyle(item.id as any)}
                    className={`p-2.5 rounded-lg border text-left transition flex flex-col gap-0.5 cursor-pointer ${
                      selectedRemixStyle === item.id
                        ? 'bg-cyan-950/70 border-cyan-400 text-white shadow-sm ring-1 ring-cyan-500/40'
                        : 'bg-[#151924] hover:bg-[#1c2230] border-slate-800 text-slate-400'
                    }`}
                  >
                    <span className="font-bold text-xs text-white">{item.label}</span>
                    <span className="text-[10px] text-slate-400">{item.subtitle}</span>
                  </button>
                ))}
              </div>

              {/* Box Titolo Scenario */}
              <div className="bg-[#171b26] border border-[#272f42] rounded-lg p-3.5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#242b3d] pb-2">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                      TECNICA SELEZIONATA:
                    </span>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-cyan-400" />
                      {currentScenario.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2 font-mono text-xs">
                    <span className="bg-[#0f121a] px-2.5 py-1 rounded border border-cyan-500/40 text-cyan-300">
                      Deck A: <strong>{currentScenario.exactPointTimeA}</strong>
                    </span>
                    <span className="text-slate-500">↔</span>
                    <span className="bg-[#0f121a] px-2.5 py-1 rounded border border-orange-500/40 text-orange-300">
                      Deck B: <strong>{currentScenario.exactPointTimeB}</strong>
                    </span>
                  </div>
                </div>

                {/* DIAGRAMMA TEMPORALE VISIVO AD ALTO IMPATTO */}
                <div className="space-y-2 bg-[#0e111a] p-3 rounded-lg border border-[#212738]">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                    ALLINEAMENTO VISIVO DELLE TRACCE: DOVE AVVIENE IL CONTATTO ⚡
                  </span>

                  {/* Barra Traccia A */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-cyan-400">
                      <span>TRACCIA ATTUALE (DECK 1 - CYANO)</span>
                      <span>PUNTO DI USCITA: {currentScenario.exactPointTimeA}</span>
                    </div>
                    <div className="h-6 bg-[#161a26] rounded flex overflow-hidden text-[9px] font-mono font-bold">
                      {currentScenario.visualTimeline.trackA.map((sec, idx) => (
                        <div
                          key={idx}
                          className={`h-full flex items-center justify-center border-r border-slate-800 ${sec.color}`}
                          style={{ width: sec.width }}
                        >
                          {sec.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Freccia e Target Punto Esatto */}
                  <div className="flex items-center justify-center gap-2 py-1 text-amber-400 text-xs font-mono font-bold animate-pulse">
                    <Zap className="w-4 h-4" />
                    <span>⚡ IL PUNTO ESATTO DI REMIXAGGIO SI TROVA QUI (ALLINEAMENTO DI FASE) ⚡</span>
                    <Zap className="w-4 h-4" />
                  </div>

                  {/* Barra Traccia B */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-orange-400">
                      <span>TRACCIA IN ENTRATA (DECK 2 - ARANCIONE)</span>
                      <span>PUNTO DI INGRESSO: {currentScenario.exactPointTimeB}</span>
                    </div>
                    <div className="h-6 bg-[#161a26] rounded flex overflow-hidden text-[9px] font-mono font-bold">
                      {currentScenario.visualTimeline.trackB.map((sec, idx) => (
                        <div
                          key={idx}
                          className={`h-full flex items-center justify-center border-r border-slate-800 ${sec.color}`}
                          style={{ width: sec.width }}
                        >
                          {sec.label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* SEZIONE: IL PERCHÉ IN QUEL PUNTO? */}
                <div className="space-y-2 pt-1">
                  <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    PERCHÉ PROPRIO IN QUEL PUNTO? (La spiegazione scientifica e musicale)
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    {currentScenario.whyExplanation.map((expl, idx) => (
                      <div
                        key={idx}
                        className="bg-[#121622] p-2.5 rounded-lg border border-[#22293b] space-y-1"
                      >
                        <span className="font-bold text-xs text-cyan-300 block">
                          {expl.title}
                        </span>
                        <p className="text-[11px] text-slate-300 leading-relaxed">
                          {expl.text}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* PULSANTE SIMULATORE LIVE */}
                <div className="pt-2 border-t border-[#242b3d] flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Il simulatore prepara le tracce 5 secondi prima del punto critico per farti sentire il mix live.</span>
                  </div>

                  <button
                    onClick={() => {
                      if (onRunInteractiveExercise) {
                        onRunInteractiveExercise(currentScenario.exerciseId);
                      }
                      audioEngine.triggerSamplerSound('laser', 0.5);
                      onClose();
                    }}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:from-emerald-500 hover:to-cyan-500 text-white font-mono font-bold text-xs transition active:scale-95 flex items-center gap-2 shadow-lg cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{currentScenario.exerciseButtonText}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: AUDIO ROUTING & CUFFIE CH 3-4 */}
          {activeTab === 'audio_routing' && (
            <div className="space-y-4">
              <div className="bg-[#171b26] border border-[#272f42] rounded-lg p-3.5 space-y-3">
                <div className="flex items-center justify-between border-b border-[#242b3d] pb-2">
                  <div>
                    <span className="text-[10px] font-mono text-purple-400 font-bold uppercase tracking-wider block">
                      ARCHITETTURA AUDIO PROFESSIONALE DA CLUB:
                    </span>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Headphones className="w-4 h-4 text-purple-400" />
                      Come Funziona il Preascolto (PFL) su Canali 3-4
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      if (onRunInteractiveExercise) {
                        onRunInteractiveExercise('audio_hardware_guide');
                      }
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-purple-950 border border-purple-500/60 hover:bg-purple-900 text-purple-200 text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Apri Matrice Hardware Audio</span>
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  In una consolle da DJ professionale, il segnale audio è diviso rigorosamente in due rami separati:
                  la <strong>Diffusione Principale al Pubblico (Master)</strong> e il <strong>Preascolto Segreto del DJ (Cue / PFL)</strong>.
                </p>

                {/* DIAGRAMMA VISIVO MATRICE 4 CANALI */}
                <div className="bg-[#0e111a] p-3 rounded-lg border border-[#222839] space-y-3">
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                    SCHEMA DI SMISTAMENTO FISICO:
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {/* Master Ch 1-2 */}
                    <div className="bg-[#131722] p-3 rounded-lg border-2 border-emerald-500/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                          <Volume2 className="w-4 h-4" />
                          CANALI 1 &amp; 2: MASTER DIFFUSION
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-500/40 font-bold">
                          PUBBLICO / CASSE
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Riceve la somma dei fader di Deck 1 e Deck 2 dopo il crossfader, l'equalizzazione e i filtri. È ciò che esce dalle casse dell'impianto PA.
                      </p>
                      <div className="text-[10px] font-mono text-emerald-300 bg-emerald-950/40 p-1.5 rounded border border-emerald-900">
                        Destinazione: Impianto Club, Monitor da Spia, Casse da Studio USB.
                      </div>
                    </div>

                    {/* Headphone Ch 3-4 */}
                    <div className="bg-[#131722] p-3 rounded-lg border-2 border-purple-500/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                          <Headphones className="w-4 h-4" />
                          CANALI 3 &amp; 4: HEADPHONE CUE (PFL)
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-500/40 font-bold">
                          SOLO CUFFIE DJ
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Riceve l'audio del brano <em>prima</em> del fader del volume (Pre-Fade Listen). Consente al DJ di sentire la traccia, metterla a tempo e verificare la tonalità senza che nessuno la senta in sala!
                      </p>
                      <div className="text-[10px] font-mono text-purple-300 bg-purple-950/40 p-1.5 rounded border border-purple-900">
                        Destinazione: Uscita Cuffie Jack 3.5mm o Ch 3-4 Scheda Audio DJ.
                      </div>
                    </div>
                  </div>
                </div>

                {/* LE 4 MODALITÀ DI CONNESSIONE HARDWARE */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <Cable className="w-4 h-4 text-cyan-400" />
                    Le 4 Configurazioni Hardware Supportate da Virtuoso:
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    <div className="bg-[#121622] p-2.5 rounded-lg border border-slate-800 space-y-1">
                      <span className="font-bold text-cyan-300 block">
                        1. Scheda Audio 4 Canali (Consolle DJ / Club)
                      </span>
                      <p className="text-[11px] text-slate-300">
                        Ideale per console come Pioneer DDJ-FLX4, Traktor S2/S4, Focusrite 4i4. Il browser instrada nativamente i canali 1-2 alle casse e 3-4 alle cuffie.
                      </p>
                    </div>

                    <div className="bg-[#121622] p-2.5 rounded-lg border border-slate-800 space-y-1">
                      <span className="font-bold text-cyan-300 block">
                        2. Dual Audio Interface (Due Schede Separate)
                      </span>
                      <p className="text-[11px] text-slate-300">
                        Consente di selezionare due dispositivi audio distinti via Web Audio API <code>setSinkId</code>: ad es. casse USB per il Master e Jack cuffie del laptop per il Cue.
                      </p>
                    </div>

                    <div className="bg-[#121622] p-2.5 rounded-lg border border-slate-800 space-y-1">
                      <span className="font-bold text-cyan-300 block">
                        3. Split-Cable DJ (Cavo a Y da Viaggio)
                      </span>
                      <p className="text-[11px] text-slate-300">
                        Per suonare ovunque con una sola uscita stereo: il canale Sinistro (L) diventa il Master mono per la cassa, il canale Destro (R) diventa il Cue mono per le cuffie.
                      </p>
                    </div>

                    <div className="bg-[#121622] p-2.5 rounded-lg border border-slate-800 space-y-1">
                      <span className="font-bold text-cyan-300 block">
                        4. Stereo Preview (Ascolto Diretto a Monitor)
                      </span>
                      <p className="text-[11px] text-slate-300">
                        Modalità di test per laptop senza cuffie collegate: il Cue viene miscelato a volume regolabile direttamente nell'uscita principale.
                      </p>
                    </div>
                  </div>
                </div>

                {/* LE MANOPOLE ESSENZIALI DEL CUE MONITOR */}
                <div className="bg-[#0e111a] p-3 rounded-lg border border-[#212739] space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <Sliders className="w-4 h-4 text-purple-400" />
                    I Controlli della Barra "Headphone Cue Monitor":
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                    <div className="bg-[#141824] p-2 rounded border border-purple-900/40">
                      <strong className="text-purple-300 block mb-1">CUE MIX (Manopola Rotante):</strong>
                      <span className="text-[11px] text-slate-300">
                        A sinistra (0%) senti solo la traccia in cuffia. Al centro (50%) senti entrambi a pari volume per mixare a orecchio. A destra (100%) senti il Master.
                      </span>
                    </div>

                    <div className="bg-[#141824] p-2 rounded border border-purple-900/40">
                      <strong className="text-purple-300 block mb-1">MASTER CUE (Pulsante MST):</strong>
                      <span className="text-[11px] text-slate-300">
                        Invia istantaneamente l'audio del Master alle cuffie per verificare l'effetto finale del pubblico prima di toccare il crossfader.
                      </span>
                    </div>

                    <div className="bg-[#141824] p-2 rounded border border-purple-900/40">
                      <strong className="text-purple-300 block mb-1">SPLIT CUE (Pulsante SPLIT):</strong>
                      <span className="text-[11px] text-slate-300">
                        Divide il padiglione sinistro delle cuffie (Cue Deck) e il padiglione destro (Master Sala). La tecnica migliore nei festival rumorosi!
                      </span>
                    </div>
                  </div>
                </div>

                {/* PULSANTE TEST PRATICO */}
                <div className="pt-2 border-t border-[#242b3d] flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Verifica il funzionamento del PFL con il simulatore acustico
                  </span>
                  <button
                    onClick={() => {
                      if (onRunInteractiveExercise) {
                        onRunInteractiveExercise('audio_routing_demo');
                      }
                      onClose();
                    }}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-mono font-bold text-xs transition active:scale-95 flex items-center gap-2 shadow-lg cursor-pointer"
                  >
                    <Headphones className="w-4 h-4 fill-current" />
                    <span>Attiva Preascolto PFL sul Mixer</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: QUANTIZE MAGNETICO & BEATGRID */}
          {activeTab === 'quantize_beatgrid' && (
            <div className="space-y-4">
              <div className="bg-[#171b26] border border-[#272f42] rounded-lg p-3.5 space-y-3">
                <div className="flex items-center justify-between border-b border-[#242b3d] pb-2">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider block">
                      PRECISIONE RITMICA CDJ / REKORDBOX GRADE:
                    </span>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Zap className="w-4 h-4 text-emerald-400" />
                      Quantize Magnetico su Beatgrid: Zero Errori di Tempo
                    </h3>
                  </div>
                  <div className="px-2.5 py-1 rounded bg-emerald-950 border border-emerald-500/50 text-emerald-300 text-xs font-mono font-bold">
                    SNAP MAGNETICO ATTIVO
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Il <strong>Quantize Magnetico</strong> è il sistema che aggancia qualsiasi comando manuale del DJ
                  (premere un Hot Cue, attivare un Loop, premere CUE o avviare la riproduzione) al punto matematico esatto
                  della griglia ritmica (Beatgrid).
                </p>

                {/* DIAGRAMMA VISIVO DELLO SNAP */}
                <div className="bg-[#0e111a] p-3 rounded-lg border border-[#222839] space-y-3">
                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span>COME FUNZIONA LO SNAP NANOMETRICO:</span>
                    <span className="text-emerald-400">Tolleranza umana (±40ms) → Snap perfetto (0ms)</span>
                  </div>

                  {/* Griglia visiva dei battiti */}
                  <div className="space-y-1">
                    <div className="h-10 bg-[#161a28] rounded border border-slate-800 flex relative overflow-hidden">
                      {/* Beat markers */}
                      {[1, 2, 3, 4].map((beat) => (
                        <div
                          key={beat}
                          className="flex-1 border-r border-slate-700/80 flex flex-col justify-between p-1 relative"
                        >
                          <div className="flex items-center justify-between text-[9px] font-mono font-bold text-emerald-400">
                            <span>BEAT {beat}.1</span>
                            <span className="text-[8px] text-slate-500">{(beat - 1) * 0.468}s</span>
                          </div>
                          <div className="w-0.5 h-3 bg-emerald-500 mx-auto" />
                        </div>
                      ))}

                      {/* Tocco umano imperfetto */}
                      <div className="absolute top-1 left-[28%] bg-rose-500 text-white text-[8px] px-1 rounded font-bold">
                        Tocco umano (In ritardo di 35ms)
                      </div>
                      {/* Freccia di snap verso Beat 2.1 */}
                      <div className="absolute bottom-1 left-[28%] text-emerald-400 text-[10px] font-bold flex items-center gap-0.5">
                        <ArrowRight className="w-3 h-3 text-emerald-400 animate-pulse" />
                        <span>Snap Magnetico istantaneo a Beat 2.1</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* LE 4 RISOLUZIONI DI QUANTIZZAZIONE */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-emerald-400" />
                    Quale Risoluzione Scegliere in Console?
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                    <div className="bg-[#121622] p-2.5 rounded-lg border border-emerald-900/50 space-y-1">
                      <div className="font-bold text-emerald-300 font-mono flex items-center justify-between">
                        <span>1/1 BATTUTA</span>
                        <span className="text-[10px] px-1 rounded bg-emerald-950">CONSIGLIATA</span>
                      </div>
                      <p className="text-[11px] text-slate-300">
                        Aggancia sul battito intero (quarto). Perfetta per drop, partenze della cassa e transizioni pulite. Impossibile steccare!
                      </p>
                    </div>

                    <div className="bg-[#121622] p-2.5 rounded-lg border border-slate-800 space-y-1">
                      <div className="font-bold text-cyan-300 font-mono">1/2 BATTUTA</div>
                      <p className="text-[11px] text-slate-300">
                        Aggancia ogni 2 quarti. Ideale per richiami rapidi di Hot Cues o cambi di melodia a mezza battuta.
                      </p>
                    </div>

                    <div className="bg-[#121622] p-2.5 rounded-lg border border-slate-800 space-y-1">
                      <div className="font-bold text-cyan-300 font-mono">1/4 BATTUTA</div>
                      <p className="text-[11px] text-slate-300">
                        Aggancia a ogni quarto. Ottima per finger drumming con i pad e per creare rullate di cassa sincrone.
                      </p>
                    </div>

                    <div className="bg-[#121622] p-2.5 rounded-lg border border-slate-800 space-y-1">
                      <div className="font-bold text-amber-300 font-mono">1/8 BATTUTA</div>
                      <p className="text-[11px] text-slate-300">
                        Aggancia a ottavi di battuta. Per glitch ritmici rapidi, roll ad alta frequenza e stutter estremi.
                      </p>
                    </div>
                  </div>
                </div>

                {/* PHASE LOCK AL MASTER */}
                <div className="bg-[#121622] p-3 rounded-lg border border-[#22293b] space-y-1.5">
                  <h4 className="text-xs font-bold text-cyan-300 font-mono flex items-center gap-1.5">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    Che cos'è il Phase Lock (Allineamento di Fase)?
                  </h4>
                  <p className="text-[11px] text-slate-300 leading-relaxed">
                    Avere lo stesso BPM non basta se i due brani battono la cassa in momenti sfasati (ad esempio uno all'inizio del secondo e l'altro 100ms dopo). Il motore Beatgrid di Virtuoso allinea la <strong>fase angolare dei due deck</strong> in modo che ogni cassa si sovrapponga con precisione assoluta a quella del Deck Master.
                  </p>
                </div>

                {/* PULSANTE PROVA QUANTIZE */}
                <div className="pt-2 border-t border-[#242b3d] flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-mono">
                    Metti alla prova lo snap magnetico sul Deck 1
                  </span>
                  <button
                    onClick={() => {
                      if (onRunInteractiveExercise) {
                        onRunInteractiveExercise('quantize_demo');
                      }
                      onClose();
                    }}
                    className="px-4 py-2 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono font-bold text-xs transition active:scale-95 flex items-center gap-2 shadow-lg cursor-pointer"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    <span>Prova Quantize Magnetico 1/1 + Loop</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: CONTROLLER FISICI WEB MIDI */}
          {activeTab === 'web_midi' && (
            <div className="space-y-4">
              <div className="bg-[#171b26] border border-[#272f42] rounded-lg p-3.5 space-y-3">
                <div className="flex items-center justify-between border-b border-[#242b3d] pb-2">
                  <div>
                    <span className="text-[10px] font-mono text-cyan-400 font-bold uppercase tracking-wider block">
                      SUPPORTO CONSOLLE FISICHE USB:
                    </span>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-cyan-400" />
                      Come Collegare e Mappare un Controller DJ Reale
                    </h3>
                  </div>
                  <button
                    onClick={() => {
                      if (onRunInteractiveExercise) {
                        onRunInteractiveExercise('midi_guide');
                      }
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-cyan-950 border border-cyan-500/60 hover:bg-cyan-900 text-cyan-200 text-xs font-mono font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Apri Pannello Web MIDI</span>
                  </button>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Virtuoso DJ Studio include un driver hardware nativo basato sulla specifica <strong>W3C Web MIDI API</strong>.
                  Puoi collegare qualsiasi consolle DJ USB al tuo Mac, PC o Chromebook e suonare come su Rekordbox o Serato senza installare alcun driver o software aggiuntivo!
                </p>

                {/* MODELLI COMPATIBILI PLUG & PLAY */}
                <div className="bg-[#0e111a] p-3 rounded-lg border border-[#212739] space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Preset Hardware Riconosciuti Automaticamente:
                  </h4>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2 text-center text-xs font-mono">
                    {[
                      { name: 'Pioneer DDJ-FLX4', brand: 'PIONEER DJ', color: 'border-orange-500/50 text-orange-300' },
                      { name: 'Pioneer DDJ-400', brand: 'PIONEER DJ', color: 'border-orange-500/50 text-orange-300' },
                      { name: 'Pioneer DDJ-SB3', brand: 'PIONEER DJ', color: 'border-orange-500/50 text-orange-300' },
                      { name: 'Traktor Kontrol S2', brand: 'NATIVE INST.', color: 'border-blue-500/50 text-blue-300' },
                      { name: 'Denon MC4000', brand: 'DENON DJ', color: 'border-cyan-500/50 text-cyan-300' },
                      { name: 'Hercules Inpulse', brand: 'HERCULES', color: 'border-emerald-500/50 text-emerald-300' },
                    ].map((item, idx) => (
                      <div key={idx} className={`p-2 rounded bg-[#131722] border ${item.color}`}>
                        <div className="text-[9px] text-slate-500">{item.brand}</div>
                        <div className="font-bold text-[11px] truncate">{item.name}</div>
                        <div className="text-[8px] text-emerald-400 mt-0.5">Plug &amp; Play</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* COME FUNZIONA IL MIDI LEARN */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    Funzione MIDI Learn (Mappatura Personalizzata in 3 Passaggi):
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
                    <div className="bg-[#121622] p-2.5 rounded-lg border border-slate-800 space-y-1">
                      <span className="font-bold text-amber-300 font-mono block">Passo 1: Clicca su LEARN</span>
                      <p className="text-[11px] text-slate-300">
                        Apri il pannello MIDI e clicca sul pulsante "Impara" accanto al controllo desiderato (es. Crossfader o Volume Deck A).
                      </p>
                    </div>

                    <div className="bg-[#121622] p-2.5 rounded-lg border border-slate-800 space-y-1">
                      <span className="font-bold text-amber-300 font-mono block">Passo 2: Muovi il Controllo Fisico</span>
                      <p className="text-[11px] text-slate-300">
                        Muovi il fader reale, premi il tasto sul controller o gira la manopola fisica della tua console.
                      </p>
                    </div>

                    <div className="bg-[#121622] p-2.5 rounded-lg border border-slate-800 space-y-1">
                      <span className="font-bold text-amber-300 font-mono block">Passo 3: Mappato e Salvato!</span>
                      <p className="text-[11px] text-slate-300">
                        Il canale MIDI e il numero CC vengono associati all'istante e salvati permanentemente nel browser.
                      </p>
                    </div>
                  </div>
                </div>

                {/* JOG WHEEL E FEEDBACK LED */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                  <div className="bg-[#121622] p-2.5 rounded-lg border border-slate-800 space-y-1">
                    <strong className="text-cyan-300 block font-mono">Sensibilità Jog Wheel &amp; Scratch:</strong>
                    <p className="text-[11px] text-slate-300">
                      I piatti capacitivi fisici inviano messaggi di Pitch Bend o CC a 14 bit ad altissima frequenza. La funzione Vinyl Mode distingue il tocco della piastra centrale (Scratch) dalla rotazione laterale (Nudge / Pitch Bend).
                    </p>
                  </div>

                  <div className="bg-[#121622] p-2.5 rounded-lg border border-slate-800 space-y-1">
                    <strong className="text-cyan-300 block font-mono">Feedback LED Bidirezionale:</strong>
                    <p className="text-[11px] text-slate-300">
                      Virtuoso rimanda segnali MIDI OUT alla tua console fisica per far illuminare i pulsanti PLAY (verde fisso quando in riproduzione, lampeggiante in pausa) e CUE (ambra pulsante).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: CORSO DI MIXAGGIO STEP-BY-STEP */}
          {activeTab === 'lessons' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
              <div className="md:col-span-5 space-y-1.5">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
                  INDICE LEZIONI PRATICHE:
                </span>
                {lessons.map((lesson, idx) => (
                  <button
                    key={lesson.id}
                    onClick={() => setSelectedLesson(idx)}
                    className={`w-full text-left p-2.5 rounded-lg border transition flex flex-col gap-0.5 cursor-pointer ${
                      selectedLesson === idx
                        ? 'bg-[#181d2c] border-cyan-500/60 shadow-sm ring-1 ring-cyan-500/30'
                        : 'bg-[#131620] hover:bg-[#1a1e2b] border-[#222838]'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[9px] font-mono px-1.5 py-0.2 rounded border font-bold ${lesson.badgeColor}`}
                      >
                        {lesson.category}
                      </span>
                      {selectedLesson === idx && (
                        <ArrowRight className="w-3 h-3 text-cyan-400" />
                      )}
                    </div>
                    <span className="font-bold text-xs text-white mt-1">{lesson.title}</span>
                    <span className="text-[10px] text-slate-400 line-clamp-1">{lesson.summary}</span>
                  </button>
                ))}
              </div>

              <div className="md:col-span-7 bg-[#171b26] border border-[#272f42] rounded-lg p-3.5 flex flex-col justify-between space-y-3">
                <div>
                  <div className="flex items-center justify-between border-b border-[#252c3d] pb-2 mb-2">
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <GraduationCap className="w-4 h-4 text-cyan-400" />
                      {lessons[selectedLesson].title}
                    </h3>
                  </div>

                  {lessons[selectedLesson].content}
                </div>

                <div className="pt-2 border-t border-[#252c3d] flex items-center justify-between">
                  <span className="text-[10px] text-slate-400 font-mono">
                    Pratica sul campo direttamente nel mixer
                  </span>
                  <button
                    onClick={() => {
                      if (onRunInteractiveExercise) {
                        onRunInteractiveExercise(lessons[selectedLesson].exerciseId);
                      }
                      audioEngine.triggerSamplerSound('laser', 0.5);
                      onClose();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-mono font-bold text-xs transition active:scale-95 flex items-center gap-1.5 shadow-md cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{lessons[selectedLesson].exerciseLabel}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: MAPPA DEI CONTROLLI */}
          {activeTab === 'controls' && (
            <div className="space-y-3">
              <div className="bg-[#171b26] border border-[#272f42] rounded-lg p-3">
                <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider mb-2 flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  Guida Dettagliata all'Hardware Virtuale &amp; Reale
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {controlsGuide.map((item, idx) => (
                    <div
                      key={idx}
                      className="bg-[#10131d] p-2.5 rounded-md border border-slate-800 space-y-1"
                    >
                      <span className="font-bold text-xs text-cyan-300 font-mono block">
                        {item.name}
                      </span>
                      <p className="text-[11px] text-slate-300 leading-tight">
                        {item.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 7: TASTI RAPIDI & GESTURE */}
          {activeTab === 'shortcuts' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="bg-[#171b26] border border-[#272f42] rounded-lg p-3 space-y-2">
                <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Laptop className="w-4 h-4 text-cyan-400" />
                  Scorciatoie da Tastiera Rapide (Mac &amp; PC)
                </h4>
                <div className="space-y-1">
                  {keyboardShortcuts.map((sc, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-1.5 bg-[#0e111a] rounded border border-slate-800 text-xs"
                    >
                      <kbd className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[10px] font-bold border border-slate-700">
                        {sc.key}
                      </kbd>
                      <span className="text-[11px] text-slate-300">{sc.action}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[#171b26] border border-[#272f42] rounded-lg p-3 space-y-2">
                <h4 className="text-xs font-bold text-white font-mono uppercase tracking-wider flex items-center gap-1.5">
                  <Smartphone className="w-4 h-4 text-orange-400" />
                  Gesture Multitouch Ottimizzate per iPad &amp; iPhone (iOS)
                </h4>
                <div className="space-y-2 text-xs text-slate-300">
                  <div className="p-2 bg-[#0e111a] rounded border border-slate-800">
                    <strong className="text-orange-400 block mb-0.5">Scratch Multitouch Reale:</strong>
                    Tocca e trascina con il dito al centro del piatto per muovere il vinile con attrito acustico autentico.
                  </div>
                  <div className="p-2 bg-[#0e111a] rounded border border-slate-800">
                    <strong className="text-orange-400 block mb-0.5">Crossfader Swipe:</strong>
                    Trascina il fader orizzontale verso destra o sinistra con precisione millimetrica.
                  </div>
                  <div className="p-2 bg-[#0e111a] rounded border border-slate-800">
                    <strong className="text-orange-400 block mb-0.5">Pulsanti Ingranditi &amp; Haptic Touch:</strong>
                    I pulsanti CUE e PLAY offrono risposta rapida e feedback visivo ad alta visibilità sotto i riflettori.
                  </div>
                  <div className="p-2 bg-[#0e111a] rounded border border-slate-800">
                    <strong className="text-orange-400 block mb-0.5">Layout Dinamico Responsive:</strong>
                    Su schermi piccoli, usa il pulsante [M] o [B] per nascondere momentaneamente mixer o browser ed espandere i controlli del deck.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: QUIZ INTERATTIVO */}
          {activeTab === 'quiz' && (
            <div className="bg-[#171b26] border border-[#272f42] rounded-lg p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    Test di Verifica: Quanto ne sai di Mixaggio Professionale?
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Mettiti alla prova su punti esatti, audio routing Ch 3-4, quantize e compatibilità armonica
                  </p>
                </div>

                {quizScore !== null && (
                  <div className="px-3 py-1 rounded bg-emerald-950 border border-emerald-500 text-emerald-300 font-mono font-bold text-xs">
                    Punteggio: {quizScore} / {quizQuestions.length}
                    {quizScore === quizQuestions.length ? ' ★ DJ PRO CERTIFICATO!' : ' (Riprova!)'}
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {quizQuestions.map((q, qIdx) => {
                  const selected = selectedAnswers[qIdx];
                  const hasAnswered = selected !== undefined;
                  const isCorrect = selected === q.correct;

                  return (
                    <div
                      key={qIdx}
                      className="bg-[#10131d] p-3 rounded-md border border-slate-800 space-y-2 text-xs"
                    >
                      <span className="font-bold text-white block">
                        {qIdx + 1}. {q.question}
                      </span>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {q.options.map((opt, optIdx) => {
                          const isOptionSelected = selected === optIdx;
                          let btnStyle = 'bg-[#151924] hover:bg-[#1d2232] border-slate-700 text-slate-300';
                          if (quizScore !== null) {
                            if (optIdx === q.correct) {
                              btnStyle = 'bg-emerald-950 border-emerald-500 text-emerald-300 font-bold';
                            } else if (isOptionSelected && !isCorrect) {
                              btnStyle = 'bg-red-950 border-red-500 text-red-300';
                            }
                          } else if (isOptionSelected) {
                            btnStyle = 'bg-cyan-950 border-cyan-400 text-cyan-300 font-bold';
                          }

                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleSelectQuizAnswer(qIdx, optIdx)}
                              className={`p-2 rounded text-left border transition text-[11px] cursor-pointer ${btnStyle}`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>

                      {quizScore !== null && (
                        <p className="text-[10px] text-slate-400 bg-[#0a0c12] p-2 rounded border border-slate-800">
                          <strong>Spiegazione: </strong>
                          {q.explanation}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={handleCalculateScore}
                  disabled={Object.keys(selectedAnswers).length < quizQuestions.length}
                  className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-mono font-bold text-xs transition active:scale-95 disabled:opacity-50 shadow-md cursor-pointer"
                >
                  Verifica Risposte Quiz
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
