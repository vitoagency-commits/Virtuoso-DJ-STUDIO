import React, { useState, useEffect, useRef } from 'react';
import {
  DeckState,
  MixerState,
  UiLayout,
  DjMode,
  Track,
  AiTransitionAdvice,
  TrackStructurePoints,
  PanelVisibilityState,
  BrowserViewMode,
  PlatterSize,
  AudioRoutingMode,
} from './types/dj';
import { DEFAULT_TRACKS, getTrackAudioBuffer } from './data/defaultTracks';
import { audioEngine } from './audio/audioEngine';
import { BeatgridManager } from './audio/beatgridManager';
import { indexedDbLibrary } from './data/indexedDbLibrary';
import { MacHeader } from './components/MacHeader';
import { WaveformDisplay } from './components/WaveformDisplay';
import { JogWheel } from './components/JogWheel';
import { DeckControls } from './components/DeckControls';
import { PerformancePads } from './components/PerformancePads';
import { CenterMixer } from './components/CenterMixer';
import { TrackBrowser } from './components/TrackBrowser';
import { AiAssistantModal } from './components/AiAssistantModal';
import { SamplerRack } from './components/SamplerRack';
import { AiDynamicFxRack } from './components/AiDynamicFxRack';
import { AiTrackAnalyzerModal } from './components/AiTrackAnalyzerModal';
import { AiSmartMixAdvisor } from './components/AiSmartMixAdvisor';
import { InteractiveDjManualModal } from './components/InteractiveDjManualModal';
import {
  Cable,
  ArrowRight,
  Sliders,
  Folder,
  Eye,
  EyeOff,
  LayoutGrid,
  Minimize2,
  Maximize2,
  Play,
  RotateCcw,
  Disc3,
} from 'lucide-react';
import { AudioHardwareModal } from './components/AudioHardwareModal';
import { hardwareDetector, DetectedAudioDevice } from './audio/hardwareDetector';
import { PresentationScreen } from './components/PresentationScreen';
import { KeyboardMappingModal } from './components/KeyboardMappingModal';
import { SplitterBar } from './components/SplitterBar';
import { WebMidiConfigModal } from './components/WebMidiConfigModal';
import { webMidiManager } from './audio/webMidiManager';
import { MidiAction } from './types/midi';

export default function App() {
  const [layout, setLayout] = useState<UiLayout>('mac-studio');
  const [djMode, setDjMode] = useState<DjMode>(() => {
    try {
      return (localStorage.getItem('virtuoso_dj_mode') as DjMode) || 'essential';
    } catch {
      return 'essential';
    }
  });
  const [playedTrackIds, setPlayedTrackIds] = useState<string[]>([]);
  const [tracks, setTracks] = useState<Track[]>(DEFAULT_TRACKS);
  const [showAiModal, setShowAiModal] = useState<boolean>(false);
  const [showDynamicFxModal, setShowDynamicFxModal] = useState<boolean>(false);
  const [showTrackAnalyzerModal, setShowTrackAnalyzerModal] = useState<boolean>(false);
  const [showManualModal, setShowManualModal] = useState<boolean>(false);
  const [showHardwareModal, setShowHardwareModal] = useState<boolean>(false);
  const [showMidiModal, setShowMidiModal] = useState<boolean>(false);
  const [midiDeviceCount, setMidiDeviceCount] = useState<number>(0);
  const [hardwareDevices, setHardwareDevices] = useState<DetectedAudioDevice[]>([]);
  const [hardwareToast, setHardwareToast] = useState<{
    brand: string;
    name: string;
    categoryLabel: string;
    kind: 'audioinput' | 'audiooutput' | 'midi_controller';
    brandColor: string;
    channels: number;
    sampleRate: number;
    latencyMs: number;
    action: 'connected' | 'disconnected';
    timestamp: number;
  } | null>(null);
  const [showSampler, setShowSampler] = useState<boolean>(false);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(() => {
    return typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
  });
  const [isOffline, setIsOffline] = useState<boolean>(() => {
    return typeof navigator !== 'undefined' ? !navigator.onLine : false;
  });
  const [hasEntered, setHasEntered] = useState<boolean>(false);
  const [activeDeckId, setActiveDeckId] = useState<'deckA' | 'deckB'>('deckA');
  const [showKeyboardShortcutsModal, setShowKeyboardShortcutsModal] = useState<boolean>(false);

  // Dynamic Main Panel Visibility States (User customizable & collapsibles)
  const [showWaveforms, setShowWaveforms] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('virtuoso_show_waveforms');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [showCenterMixer, setShowCenterMixer] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('virtuoso_show_mixer');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [showAdvisor, setShowAdvisor] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('virtuoso_show_advisor');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  const [browserViewMode, setBrowserViewMode] = useState<BrowserViewMode>(() => {
    try {
      return (localStorage.getItem('virtuoso_browser_view') as BrowserViewMode) || 'standard';
    } catch {
      return 'standard';
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('virtuoso_show_waveforms', String(showWaveforms));
    } catch {}
  }, [showWaveforms]);

  useEffect(() => {
    try {
      localStorage.setItem('virtuoso_show_mixer', String(showCenterMixer));
    } catch {}
  }, [showCenterMixer]);

  useEffect(() => {
    try {
      localStorage.setItem('virtuoso_show_advisor', String(showAdvisor));
    } catch {}
  }, [showAdvisor]);

  useEffect(() => {
    try {
      localStorage.setItem('virtuoso_browser_view', browserViewMode);
    } catch {}
  }, [browserViewMode]);

  // Platter Size state (compact ~130px for iPad & laptops, standard ~170px, large ~220px, maxi ~280px)
  const [platterSize, setPlatterSize] = useState<PlatterSize>(() => {
    try {
      const saved = localStorage.getItem('virtuoso_platter_size') as PlatterSize;
      if (saved && (saved === 'standard' || saved === 'large' || saved === 'maxi' || saved === 'compact')) {
        return saved;
      }
    } catch {}
    // Compact ensures zero-overflow and perfect visibility of all boxes on 13" iPad and MacBooks
    return 'compact';
  });

  useEffect(() => {
    try {
      localStorage.setItem('virtuoso_platter_size', platterSize);
    } catch {}
  }, [platterSize]);

  const panelVisibility: PanelVisibilityState = {
    waveforms: showWaveforms,
    mixer: showCenterMixer,
    browser: browserViewMode,
    advisor: showAdvisor,
  };

  // Resizable Panel Dimensions State & Handlers
  const [panelDimensions, setPanelDimensions] = useState<{
    browserHeight: number;
    waveformHeight: number;
    mixerWidth: number;
    browserSidebarWidth: number;
  }>(() => {
    try {
      const saved = localStorage.getItem('virtuoso_panel_dimensions_v3') || localStorage.getItem('virtuoso_panel_dimensions_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          browserHeight: typeof parsed.browserHeight === 'number' ? Math.max(90, Math.min(600, parsed.browserHeight)) : 120,
          waveformHeight: typeof parsed.waveformHeight === 'number' ? Math.max(55, Math.min(200, parsed.waveformHeight)) : 68,
          mixerWidth: typeof parsed.mixerWidth === 'number' ? Math.max(160, Math.min(340, parsed.mixerWidth)) : 195,
          browserSidebarWidth: typeof parsed.browserSidebarWidth === 'number' ? Math.max(130, Math.min(360, parsed.browserSidebarWidth)) : 160,
        };
      }
    } catch {}
    const isCompact = typeof window !== 'undefined' && (
      'ontouchstart' in window ||
      navigator.maxTouchPoints > 0 ||
      window.innerHeight <= 850 ||
      window.innerWidth <= 1366
    );
    return {
      browserHeight: isCompact ? 120 : 160,
      waveformHeight: isCompact ? 68 : 80,
      mixerWidth: isCompact ? 195 : 210,
      browserSidebarWidth: isCompact ? 160 : 180,
    };
  });

  // Dynamic minimalist check for iPad 13" and MacBook Pro 13"-16"
  const isMinimalist = layout === 'ios-touch' || isTouchDevice || (typeof window !== 'undefined' && (window.innerWidth <= 1280 || window.innerHeight <= 850));

  useEffect(() => {
    try {
      localStorage.setItem('virtuoso_panel_dimensions', JSON.stringify(panelDimensions));
    } catch {}
  }, [panelDimensions]);

  const [activeSplitter, setActiveSplitter] = useState<'browser-height' | 'waveform-height' | 'mixer-left' | 'mixer-right' | null>(null);
  const [resetToast, setResetToast] = useState<string | null>(null);

  // Splitter Drag Handlers
  const handleBrowserSplitterMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveSplitter('browser-height');
    const startY = e.clientY;
    const startH = panelDimensions.browserHeight;

    const onMouseMove = (moveEvt: MouseEvent) => {
      const deltaY = startY - moveEvt.clientY;
      const maxH = Math.max(300, window.innerHeight - 250);
      const newH = Math.max(110, Math.min(maxH, Math.round(startH + deltaY)));
      setPanelDimensions((prev) => ({ ...prev, browserHeight: newH }));
    };

    const onMouseUp = () => {
      setActiveSplitter(null);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleBrowserSplitterTouchStart = (e: React.TouchEvent) => {
    if (!e.touches[0]) return;
    setActiveSplitter('browser-height');
    const startY = e.touches[0].clientY;
    const startH = panelDimensions.browserHeight;

    const onTouchMove = (moveEvt: TouchEvent) => {
      if (!moveEvt.touches[0]) return;
      const deltaY = startY - moveEvt.touches[0].clientY;
      const maxH = Math.max(300, window.innerHeight - 250);
      const newH = Math.max(110, Math.min(maxH, Math.round(startH + deltaY)));
      setPanelDimensions((prev) => ({ ...prev, browserHeight: newH }));
    };

    const onTouchEnd = () => {
      setActiveSplitter(null);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };

    window.addEventListener('touchmove', onTouchMove);
    window.addEventListener('touchend', onTouchEnd);
  };

  const handleWaveformSplitterMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setActiveSplitter('waveform-height');
    const startY = e.clientY;
    const startH = panelDimensions.waveformHeight;

    const onMouseMove = (moveEvt: MouseEvent) => {
      const deltaY = moveEvt.clientY - startY;
      const newH = Math.max(80, Math.min(250, Math.round(startH + deltaY)));
      setPanelDimensions((prev) => ({ ...prev, waveformHeight: newH }));
    };

    const onMouseUp = () => {
      setActiveSplitter(null);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleMixerSplitterMouseDown = (e: React.MouseEvent, side: 'left' | 'right') => {
    e.preventDefault();
    setActiveSplitter(side === 'left' ? 'mixer-left' : 'mixer-right');
    const startX = e.clientX;
    const startW = panelDimensions.mixerWidth;

    const onMouseMove = (moveEvt: MouseEvent) => {
      const deltaX = moveEvt.clientX - startX;
      const adjustedDelta = side === 'right' ? deltaX : -deltaX;
      const newW = Math.max(170, Math.min(420, Math.round(startW + adjustedDelta)));
      setPanelDimensions((prev) => ({ ...prev, mixerWidth: newW }));
    };

    const onMouseUp = () => {
      setActiveSplitter(null);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  const handleResetSplitter = (type: 'browser-height' | 'waveform-height' | 'mixer-width') => {
    if (type === 'browser-height') {
      setPanelDimensions((prev) => ({ ...prev, browserHeight: 280 }));
    } else if (type === 'waveform-height') {
      setPanelDimensions((prev) => ({ ...prev, waveformHeight: 135 }));
    } else if (type === 'mixer-width') {
      setPanelDimensions((prev) => ({ ...prev, mixerWidth: 240 }));
    }
  };

  const handleResetDefaultDimensions = () => {
    const defaultDims = {
      browserHeight: 175,
      waveformHeight: 85,
      mixerWidth: 210,
      browserSidebarWidth: 180,
    };
    setPanelDimensions(defaultDims);
    setShowWaveforms(true);
    setShowCenterMixer(true);
    setShowAdvisor(true);
    setBrowserViewMode('standard');
    const defaultPlatter: PlatterSize = 'standard';
    setPlatterSize(defaultPlatter);
    try {
      localStorage.setItem('virtuoso_panel_dimensions_v2', JSON.stringify(defaultDims));
      localStorage.setItem('virtuoso_browser_sidebar_width', '180');
      localStorage.setItem('virtuoso_show_waveforms', 'true');
      localStorage.setItem('virtuoso_show_mixer', 'true');
      localStorage.setItem('virtuoso_show_advisor', 'true');
      localStorage.setItem('virtuoso_browser_view', 'standard');
      localStorage.setItem('virtuoso_platter_size', defaultPlatter);
    } catch {}
    setResetToast('📐 Dimensioni di default e splitter ripristinati con successo!');
    setTimeout(() => {
      setResetToast(null);
    }, 2800);
  };

  // Drag and drop track from Browser onto Decks
  const [draggedTrack, setDraggedTrack] = useState<Track | null>(null);
  const [dragOverDeckId, setDragOverDeckId] = useState<'deckA' | 'deckB' | 'deckC' | 'deckD' | null>(null);

  const handleTogglePanel = (panel: 'waveforms' | 'mixer' | 'advisor') => {
    if (panel === 'waveforms') setShowWaveforms((v) => !v);
    if (panel === 'mixer') setShowCenterMixer((v) => !v);
    if (panel === 'advisor') setShowAdvisor((v) => !v);
  };

  const handleApplyLayoutPreset = (
    preset: 'standard' | 'max-browser' | 'external-mixer' | 'waveform-focus' | 'live-stage' | 'minimalist-device'
  ) => {
    if (preset === 'minimalist-device') {
      setShowWaveforms(true);
      setShowCenterMixer(true);
      setShowAdvisor(false); // remove advisor banner to preserve vertical space
      setBrowserViewMode('standard');
      setPlatterSize('compact'); // 130px compact jog wheel
      setPanelDimensions({
        browserHeight: 120, // 120px clean browser (3 visible track rows)
        waveformHeight: 65,  // 65px clean waveforms
        mixerWidth: 195,     // 195px compact mixer
        browserSidebarWidth: 160,
      });
      setLayout('ios-touch');
    } else if (preset === 'standard') {
      setShowWaveforms(true);
      setShowCenterMixer(true);
      setShowAdvisor(true);
      setBrowserViewMode('standard');
      setLayout('mac-studio');
    } else if (preset === 'max-browser') {
      setShowWaveforms(false);
      setShowCenterMixer(false);
      setShowAdvisor(false);
      setBrowserViewMode('maximized');
    } else if (preset === 'external-mixer') {
      setShowWaveforms(true);
      setShowCenterMixer(false);
      setShowAdvisor(true);
      if (browserViewMode === 'maximized') setBrowserViewMode('standard');
    } else if (preset === 'waveform-focus') {
      setShowWaveforms(true);
      setShowCenterMixer(true);
      setShowAdvisor(false);
      setBrowserViewMode('compact');
    } else if (preset === 'live-stage') {
      setShowWaveforms(true);
      setShowCenterMixer(true);
      setShowAdvisor(false);
      setBrowserViewMode('hidden');
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem('virtuoso_dj_mode', djMode);
    } catch (e) {
      console.warn('Failed to save djMode', e);
    }
  }, [djMode]);

  // Deck States Helper
  const createInitialDeck = (
    id: 'deckA' | 'deckB' | 'deckC' | 'deckD',
    deckNumber: 1 | 2 | 3 | 4,
    name: string,
    themeColor: string,
    initialTrack: Track | null
  ): DeckState => ({
    id,
    deckNumber,
    name,
    themeColor,
    track: initialTrack,
    isPlaying: false,
    currentTime: 0,
    duration: initialTrack?.duration || 180,
    bpm: initialTrack?.bpm || 128,
    originalBpm: initialTrack?.bpm || 128,
    pitchPercent: 0,
    pitchRange: 8,
    keyLock: true,
    isSync: false,
    isMaster: id === 'deckA',
    cuePosition: 0,
    hotCues: initialTrack?.cuePoints?.slice(0, 8) || [0, 15, 30, 60, null, null, null, null],
    loopActive: false,
    loopStart: 0,
    loopLengthBeats: 4,
    slipMode: false,
    vinylMode: true,
    eqHigh: 0,
    eqMid: 0,
    eqLow: 0,
    highKill: false,
    midKill: false,
    lowKill: false,
    filter: 0,
    gain: 1.0,
    volume: 0.85,
    headphoneCue: false,
    vuLevel: 0,
    stems: {
      vocals: 1,
      melody: 1,
      bass: 1,
      drums: 1,
      vocalsMuted: false,
      melodyMuted: false,
      bassMuted: false,
      drumsMuted: false,
    },
    fx: {
      echo: { active: false, wet: 0.5, beats: 0.75 },
      flanger: { active: false, wet: 0.5 },
      reverb: { active: false, wet: 0.5 },
      roll: { active: false, length: 0.25, isEngaged: false },
      aiAdaptive: true,
      aiFilterSweep: { active: false, intensity: 0 },
      aiRiserBuild: { active: false, progress: 0 },
      aiWashout: { active: false, wet: 0 },
      aiVinylBrake: { active: false, progress: 0 },
    },
    activePadMode: 'hotcue',
    jogAngle: 0,
    quantize: true,
    quantizeResolution: '1/1',
    beatgridOffset: 0,
  });

  const [deckA, setDeckA] = useState<DeckState>(() =>
    createInitialDeck('deckA', 1, 'DECK 1', '#06b6d4', DEFAULT_TRACKS[0])
  );
  const [deckB, setDeckB] = useState<DeckState>(() =>
    createInitialDeck('deckB', 2, 'DECK 2', '#f97316', DEFAULT_TRACKS[1])
  );
  const [deckC, setDeckC] = useState<DeckState>(() =>
    createInitialDeck('deckC', 3, 'DECK 3', '#10b981', DEFAULT_TRACKS[2])
  );
  const [deckD, setDeckD] = useState<DeckState>(() =>
    createInitialDeck('deckD', 4, 'DECK 4', '#a855f7', DEFAULT_TRACKS[3])
  );

  const [mixer, setMixer] = useState<MixerState>({
    crossfader: 0,
    crossfaderCurve: 'smooth',
    masterVolume: 0.9,
    headphoneVolume: 0.85,
    headphoneCueMix: 0.5,
    masterCue: false,
    splitCue: false,
    boothVolume: 0.8,
    masterVuLeft: 0,
    masterVuRight: 0,
    cueVuLeft: 0,
    cueVuRight: 0,
    audioRoutingMode: 'multi_channel_4ch',
    masterAudioDeviceId: 'default',
    cueAudioDeviceId: 'default',
    isRecording: false,
    recordedDuration: 0,
    isAutoMixing: false,
    autoMixProgress: 0,
  });

  // Fresh State & Transport Refs for Keyboard Listener (avoids stale closures)
  const activeDeckIdRef = useRef<'deckA' | 'deckB'>(activeDeckId);
  activeDeckIdRef.current = activeDeckId;

  const deckARef = useRef(deckA);
  deckARef.current = deckA;
  const deckBRef = useRef(deckB);
  deckBRef.current = deckB;
  const deckCRef = useRef(deckC);
  deckCRef.current = deckC;
  const deckDRef = useRef(deckD);
  deckDRef.current = deckD;

  const hasEnteredRef = useRef(hasEntered);
  hasEnteredRef.current = hasEntered;

  const isCuePressedRef = useRef<{ [deckId: string]: boolean }>({});

  // Pre-load audio buffers for initial tracks
  useEffect(() => {
    const loadInit = async () => {
      try {
        if (DEFAULT_TRACKS[0]) {
          const bufA = await getTrackAudioBuffer(DEFAULT_TRACKS[0]);
          audioEngine.setDeckBuffer('deckA', bufA);
        }
        if (DEFAULT_TRACKS[1]) {
          const bufB = await getTrackAudioBuffer(DEFAULT_TRACKS[1]);
          audioEngine.setDeckBuffer('deckB', bufB);
        }
        if (DEFAULT_TRACKS[2]) {
          const bufC = await getTrackAudioBuffer(DEFAULT_TRACKS[2]);
          audioEngine.setDeckBuffer('deckC', bufC);
        }
        if (DEFAULT_TRACKS[3]) {
          const bufD = await getTrackAudioBuffer(DEFAULT_TRACKS[3]);
          audioEngine.setDeckBuffer('deckD', bufD);
        }

        // Load persistent custom tracks from IndexedDB library
        const savedTracks = await indexedDbLibrary.getAllSavedTracks();
        if (savedTracks && savedTracks.length > 0) {
          setTracks((prev) => {
            const existingIds = new Set(prev.map((t) => t.id));
            const newTracks: Track[] = savedTracks
              .filter((r) => !existingIds.has(r.id))
              .map((r) => ({
                id: r.id,
                title: r.title,
                artist: r.artist,
                bpm: r.bpm,
                key: r.key,
                camelotCode: r.camelot || '8A',
                genre: r.genre,
                energy: 7,
                duration: r.duration,
                waveformData: r.waveformData || [],
                cuePoints: r.cuePoints || [],
                color: '#06b6d4',
              }));
            return [...newTracks, ...prev];
          });
        }
      } catch (err) {
        console.error('Failed to init audio buffers', err);
      }
    };
    loadInit();
  }, []);

  // Versatile Touch Screen & Offline Connectivity Listeners
  useEffect(() => {
    // Check touch support on mount and whenever first touch event occurs
    const checkTouch = () => {
      const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      setIsTouchDevice(hasTouch);
      // Auto-adapt default layout to 'ios-touch' if running on iPad / tablet and in touch mode
      if (hasTouch && window.innerWidth <= 1024) {
        setLayout((curr) => (curr === 'mac-quad' ? 'mac-quad' : 'ios-touch'));
      }
    };
    checkTouch();

    const handleFirstTouch = () => {
      setIsTouchDevice(true);
      window.removeEventListener('touchstart', handleFirstTouch);
    };
    window.addEventListener('touchstart', handleFirstTouch, { passive: true });

    // Online & Offline listeners
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('touchstart', handleFirstTouch);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Automatic Audio & MIDI Hardware Detector & Hot-Plug Listener
  useEffect(() => {
    hardwareDetector.init();
    const unsubscribe = hardwareDetector.subscribe((devices, lastEvent) => {
      setHardwareDevices([...devices]);
      if (lastEvent) {
        setHardwareToast({
          brand: lastEvent.device.brand,
          name: lastEvent.device.name,
          categoryLabel: lastEvent.device.categoryLabel,
          kind: lastEvent.device.kind,
          brandColor: lastEvent.device.brandColor,
          channels: lastEvent.device.channels,
          sampleRate: lastEvent.device.sampleRate,
          latencyMs: lastEvent.device.latencyMs,
          action: lastEvent.action,
          timestamp: Date.now(),
        });

        // Trigger pleasant sound chime confirmation when hardware connects
        if (lastEvent.action === 'connected') {
          audioEngine.triggerSamplerSound('laser', 0.25);
        }

        setTimeout(() => {
          setHardwareToast((curr) =>
            curr && Date.now() - curr.timestamp >= 5800 ? null : curr
          );
        }, 6000);
      }
    });

    return () => unsubscribe();
  }, []);

  // Web MIDI DJ Controller Integration (Pioneer DDJ, Traktor, Numark, Akai, Roland)
  useEffect(() => {
    webMidiManager.init().then(() => {
      setMidiDeviceCount(webMidiManager.getConnectedDevices().length);
    });

    const unsubConn = webMidiManager.onConnectionChange(() => {
      const devs = webMidiManager.getConnectedDevices();
      setMidiDeviceCount(devs.length);
      if (devs.length > 0) {
        setExerciseNotification(`🎛️ Controller MIDI connesso: ${devs[0].name}`);
        setTimeout(() => setExerciseNotification(null), 4000);
      }
    });

    const unsubAction = webMidiManager.onAction((action: MidiAction, value: number, isRelative?: boolean) => {
      // Direct Hardware Actions Routing
      switch (action) {
        // --- DECK A TRANSPORT ---
        case 'play_pause_deckA':
          handlePlayPause('deckA');
          break;
        case 'cue_deckA':
          if (value > 0) {
            handleCueDown('deckA');
          } else {
            handleCueUp('deckA');
          }
          break;
        case 'sync_deckA':
          handleSync('deckA');
          break;
        case 'headphone_cue_deckA':
          if (value > 0) handleHeadphoneCue('deckA');
          break;
        case 'hotcue_1_deckA':
          if (value > 0) handleHotCueTrigger('deckA', 0);
          break;
        case 'hotcue_2_deckA':
          if (value > 0) handleHotCueTrigger('deckA', 1);
          break;
        case 'hotcue_3_deckA':
          if (value > 0) handleHotCueTrigger('deckA', 2);
          break;
        case 'hotcue_4_deckA':
          if (value > 0) handleHotCueTrigger('deckA', 3);
          break;
        case 'loop_auto_deckA':
          if (value > 0) handleToggleLoop('deckA');
          break;
        case 'loop_in_deckA':
          if (value > 0) {
            setDeckA((d) => ({ ...d, loopStart: d.currentTime, loopActive: true }));
          }
          break;
        case 'loop_out_deckA':
          if (value > 0) {
            setDeckA((d) => ({ ...d, loopActive: true }));
          }
          break;
        case 'tempo_fader_deckA': {
          // value is 0.0 to 1.0 -> map to -8% to +8%
          const percent = (value - 0.5) * 16;
          handlePitchChange('deckA', percent);
          break;
        }
        case 'jog_scratch_deckA':
        case 'jog_pitch_deckA': {
          const delta = isRelative ? value : (value - 0.5) * 4;
          if (deckARef.current.isPlaying) {
            handlePitchNudge('deckA', delta * 0.8);
          } else {
            handleScratch('deckA', delta * 0.6);
          }
          break;
        }

        // --- DECK A MIXER & EQ ---
        case 'volume_deckA':
          handleVolumeChange('deckA', value);
          break;
        case 'gain_deckA':
          handleGainChange('deckA', value * 1.5);
          break;
        case 'eq_high_deckA':
          handleEqChange('deckA', 'high', (value - 0.5) * 30);
          break;
        case 'eq_mid_deckA':
          handleEqChange('deckA', 'mid', (value - 0.5) * 30);
          break;
        case 'eq_low_deckA':
          handleEqChange('deckA', 'low', (value - 0.5) * 30);
          break;
        case 'filter_deckA':
          handleFilterChange('deckA', (value - 0.5) * 200);
          break;

        // --- DECK B TRANSPORT ---
        case 'play_pause_deckB':
          handlePlayPause('deckB');
          break;
        case 'cue_deckB':
          if (value > 0) {
            handleCueDown('deckB');
          } else {
            handleCueUp('deckB');
          }
          break;
        case 'sync_deckB':
          handleSync('deckB');
          break;
        case 'headphone_cue_deckB':
          if (value > 0) handleHeadphoneCue('deckB');
          break;
        case 'hotcue_1_deckB':
          if (value > 0) handleHotCueTrigger('deckB', 0);
          break;
        case 'hotcue_2_deckB':
          if (value > 0) handleHotCueTrigger('deckB', 1);
          break;
        case 'hotcue_3_deckB':
          if (value > 0) handleHotCueTrigger('deckB', 2);
          break;
        case 'hotcue_4_deckB':
          if (value > 0) handleHotCueTrigger('deckB', 3);
          break;
        case 'loop_auto_deckB':
          if (value > 0) handleToggleLoop('deckB');
          break;
        case 'loop_in_deckB':
          if (value > 0) {
            setDeckB((d) => ({ ...d, loopStart: d.currentTime, loopActive: true }));
          }
          break;
        case 'loop_out_deckB':
          if (value > 0) {
            setDeckB((d) => ({ ...d, loopActive: true }));
          }
          break;
        case 'tempo_fader_deckB': {
          const percent = (value - 0.5) * 16;
          handlePitchChange('deckB', percent);
          break;
        }
        case 'jog_scratch_deckB':
        case 'jog_pitch_deckB': {
          const delta = isRelative ? value : (value - 0.5) * 4;
          if (deckBRef.current.isPlaying) {
            handlePitchNudge('deckB', delta * 0.8);
          } else {
            handleScratch('deckB', delta * 0.6);
          }
          break;
        }

        // --- DECK B MIXER & EQ ---
        case 'volume_deckB':
          handleVolumeChange('deckB', value);
          break;
        case 'gain_deckB':
          handleGainChange('deckB', value * 1.5);
          break;
        case 'eq_high_deckB':
          handleEqChange('deckB', 'high', (value - 0.5) * 30);
          break;
        case 'eq_mid_deckB':
          handleEqChange('deckB', 'mid', (value - 0.5) * 30);
          break;
        case 'eq_low_deckB':
          handleEqChange('deckB', 'low', (value - 0.5) * 30);
          break;
        case 'filter_deckB':
          handleFilterChange('deckB', (value - 0.5) * 200);
          break;

        // --- MASTER & CROSSFADER ---
        case 'crossfader': {
          // value 0 to 1 -> -1 to +1
          const xVal = value * 2 - 1;
          handleCrossfaderChange(xVal);
          break;
        }
        case 'master_volume':
          audioEngine.setMasterVolume(value * 1.2);
          setMixer((m) => ({ ...m, masterVolume: value * 1.2 }));
          break;
        case 'headphone_volume':
          handleHeadphoneVolumeChange(value * 1.5);
          break;
        case 'headphone_cue_mix':
          handleHeadphoneCueMixChange(value);
          break;
        case 'master_cue':
          if (value > 0) handleToggleMasterCue();
          break;
        case 'browser_load_deckA':
          if (value > 0 && tracks[0]) {
            handleLoadTrack('deckA', tracks[0]);
          }
          break;
        case 'browser_load_deckB':
          if (value > 0 && tracks[1]) {
            handleLoadTrack('deckB', tracks[1]);
          }
          break;
        case 'sampler_1':
          if (value > 0) audioEngine.triggerSamplerSound('airhorn', 0.7);
          break;
        case 'sampler_2':
          if (value > 0) audioEngine.triggerSamplerSound('laser', 0.6);
          break;
        case 'sampler_3':
          if (value > 0) audioEngine.triggerSamplerSound('siren', 0.6);
          break;
        case 'sampler_4':
          if (value > 0) audioEngine.triggerSamplerSound('rewind', 0.7);
          break;
      }
    });

    return () => {
      unsubConn();
      unsubAction();
    };
  }, [tracks]);

  // Track which tracks have been played in this session for history crate and ON AIR badges
  useEffect(() => {
    const markPlayed = (deck: DeckState) => {
      if (deck.isPlaying && deck.track) {
        setPlayedTrackIds((prev) =>
          prev.includes(deck.track!.id) ? prev : [...prev, deck.track!.id]
        );
      }
    };
    markPlayed(deckA);
    markPlayed(deckB);
    markPlayed(deckC);
    markPlayed(deckD);
  }, [
    deckA.isPlaying,
    deckB.isPlaying,
    deckC.isPlaying,
    deckD.isPlaying,
    deckA.track,
    deckB.track,
    deckC.track,
    deckD.track,
  ]);

  // Animation frame loop to update current playback times and VU meters
  useEffect(() => {
    let animId: number;

    const tick = () => {
      // Read current times from audio engine
      const timeA = audioEngine.getCurrentTime('deckA');
      const timeB = audioEngine.getCurrentTime('deckB');
      const timeC = audioEngine.getCurrentTime('deckC');
      const timeD = audioEngine.getCurrentTime('deckD');

      const vuA = audioEngine.getDeckLevel('deckA');
      const vuB = audioEngine.getDeckLevel('deckB');
      const vuC = audioEngine.getDeckLevel('deckC');
      const vuD = audioEngine.getDeckLevel('deckD');

      const masterVu = audioEngine.getMasterLevel();
      const cueVu = audioEngine.getCueLevel();

      setDeckA((prev) => ({ ...prev, currentTime: timeA, vuLevel: vuA }));
      setDeckB((prev) => ({ ...prev, currentTime: timeB, vuLevel: vuB }));
      setDeckC((prev) => ({ ...prev, currentTime: timeC, vuLevel: vuC }));
      setDeckD((prev) => ({ ...prev, currentTime: timeD, vuLevel: vuD }));

      setMixer((prev) => ({
        ...prev,
        masterVuLeft: masterVu.left,
        masterVuRight: masterVu.right,
        cueVuLeft: cueVu.left,
        cueVuRight: cueVu.right,
      }));

      animId = requestAnimationFrame(tick);
    };

    animId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Universal Deck State Setter Helper
  const setDeckById = (
    deckId: 'deckA' | 'deckB' | 'deckC' | 'deckD',
    updater: (prev: DeckState) => DeckState
  ) => {
    if (deckId === 'deckA') setDeckA(updater);
    else if (deckId === 'deckB') setDeckB(updater);
    else if (deckId === 'deckC') setDeckC(updater);
    else if (deckId === 'deckD') setDeckD(updater);
  };

  // Play / Pause Handlers
  const handlePlayPause = (deckId: 'deckA' | 'deckB' | 'deckC' | 'deckD') => {
    const deck =
      deckId === 'deckA'
        ? deckARef.current
        : deckId === 'deckB'
        ? deckBRef.current
        : deckId === 'deckC'
        ? deckCRef.current
        : deckDRef.current;

    if (deck.isPlaying) {
      const offset = audioEngine.pause(deckId);
      setDeckById(deckId, (d) => ({ ...d, isPlaying: false, currentTime: offset }));
    } else {
      let targetTime = deck.currentTime;
      if (deck.quantize) {
        targetTime = BeatgridManager.snapToBeatgrid(deck, targetTime, deck.quantizeResolution);
      }
      audioEngine.seek(deckId, targetTime);
      audioEngine.play(deckId, targetTime);
      setDeckById(deckId, (d) => ({ ...d, isPlaying: true, currentTime: targetTime }));
    }
  };

  // Cue Buttons
  const handleCueDown = (deckId: 'deckA' | 'deckB' | 'deckC' | 'deckD') => {
    const deck =
      deckId === 'deckA'
        ? deckARef.current
        : deckId === 'deckB'
        ? deckBRef.current
        : deckId === 'deckC'
        ? deckCRef.current
        : deckDRef.current;

    if (deck.isPlaying) {
      audioEngine.pause(deckId);
      audioEngine.seek(deckId, deck.cuePosition);
      setDeckById(deckId, (d) => ({ ...d, isPlaying: false, currentTime: d.cuePosition }));
    } else {
      // Set new cue or preview stutter
      setDeckById(deckId, (d) => ({ ...d, cuePosition: d.currentTime }));
      audioEngine.play(deckId, deck.cuePosition);
      setDeckById(deckId, (d) => ({ ...d, isPlaying: true }));
    }
  };

  const handleCueUp = (deckId: 'deckA' | 'deckB' | 'deckC' | 'deckD') => {
    const deck =
      deckId === 'deckA'
        ? deckARef.current
        : deckId === 'deckB'
        ? deckBRef.current
        : deckId === 'deckC'
        ? deckCRef.current
        : deckDRef.current;

    if (deck.isPlaying) {
      audioEngine.pause(deckId);
      audioEngine.seek(deckId, deck.cuePosition);
      setDeckById(deckId, (d) => ({ ...d, isPlaying: false, currentTime: d.cuePosition }));
    }
  };

  // Sync to Master
  const handleSync = (deckId: 'deckA' | 'deckB' | 'deckC' | 'deckD') => {
    const masterDeck = deckARef.current.isMaster ? deckARef.current : deckBRef.current;
    const targetBpm = masterDeck.bpm;

    setDeckById(deckId, (d) => {
      const original = d.originalBpm || d.bpm;
      const neededRate = targetBpm / original;
      const pitchPercent = (neededRate - 1) * 100;
      audioEngine.setPlaybackRate(deckId, neededRate);

      return {
        ...d,
        bpm: targetBpm,
        pitchPercent,
        isSync: true,
      };
    });
  };

  // Physical Keyboard Transport Mapping Listener (Space, C, Sync, Tab, Arrows, etc.)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Protect inputs: ignore if user is typing in search, title, or textareas
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.getAttribute('role') === 'textbox')
      ) {
        return;
      }

      // Do not intercept browser/system commands (Cmd+R, Ctrl+C, etc.)
      if (e.metaKey || e.ctrlKey) return;

      // If presentation screen is active, do not intercept deck transport
      if (!hasEnteredRef.current) return;

      const currentActive = activeDeckIdRef.current;
      const oppositeDeck = currentActive === 'deckA' ? 'deckB' : 'deckA';

      // 1. SPACEBAR: Play / Pause Transport Toggle
      if (e.code === 'Space') {
        e.preventDefault();
        if (e.repeat) return;
        audioEngine.init();
        const targetDeck = e.shiftKey ? oppositeDeck : currentActive;
        handlePlayPause(targetDeck);
        return;
      }

      // 2. ENTER: Direct Play / Pause for Deck B
      if (e.code === 'Enter') {
        e.preventDefault();
        if (e.repeat) return;
        audioEngine.init();
        handlePlayPause('deckB');
        return;
      }

      // 3. 'C' KEY: Cue Transport Button (Stutter & Jump to Cue)
      if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        if (e.repeat) return;
        audioEngine.init();
        const targetDeck = e.shiftKey ? oppositeDeck : currentActive;
        isCuePressedRef.current[targetDeck] = true;
        handleCueDown(targetDeck);
        return;
      }

      // 4. ',' (COMMA): Direct Cue Transport for Deck B
      if (e.key === ',') {
        e.preventDefault();
        if (e.repeat) return;
        audioEngine.init();
        isCuePressedRef.current['deckB'] = true;
        handleCueDown('deckB');
        return;
      }

      // 5. 'S' KEY: Sync Button (BPM & Beat Phase Match)
      if (e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (e.repeat) return;
        const targetDeck = e.shiftKey ? oppositeDeck : currentActive;
        handleSync(targetDeck);
        return;
      }

      // 6. '.' (PERIOD): Direct Sync Button for Deck B
      if (e.key === '.') {
        e.preventDefault();
        if (e.repeat) return;
        handleSync('deckB');
        return;
      }

      // 7. TAB: Switch Active Deck Focus (Deck 1 ↔ Deck 2)
      if (e.key === 'Tab') {
        e.preventDefault();
        if (e.repeat) return;
        setActiveDeckId((prev) => (prev === 'deckA' ? 'deckB' : 'deckA'));
        return;
      }

      // 8. NUMBERS 1 - 4: Hot Cue Triggers on Active Deck
      if (['1', '2', '3', '4'].includes(e.key) && !e.shiftKey && !e.altKey) {
        e.preventDefault();
        if (e.repeat) return;
        const cueIdx = parseInt(e.key, 10) - 1;
        handleHotCueTrigger(currentActive, cueIdx);
        return;
      }

      // 9. ARROW LEFT / RIGHT: Pitch Bend / Nudge
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePitchNudge(currentActive, -0.7);
        return;
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handlePitchNudge(currentActive, 0.7);
        return;
      }

      // 10. ARROW UP / DOWN: Tempo Pitch Slider Adjust (±0.5%)
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const currentPitch = (currentActive === 'deckA' ? deckARef.current : deckBRef.current).pitchPercent;
        const newPitch = Math.min(16, currentPitch + 0.5);
        handlePitchChange(currentActive, newPitch);
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        const currentPitch = (currentActive === 'deckA' ? deckARef.current : deckBRef.current).pitchPercent;
        const newPitch = Math.max(-16, currentPitch - 0.5);
        handlePitchChange(currentActive, newPitch);
        return;
      }

      // 11. '?' or '/': Toggle Keyboard Shortcuts Cheatsheet Modal
      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        setShowKeyboardShortcutsModal((prev) => !prev);
        return;
      }

      // 12. 'A' KEY: Trigger AI AutoMix
      if (e.key.toLowerCase() === 'a' && !e.shiftKey) {
        e.preventDefault();
        if (e.repeat) return;
        handleExecuteAutoMix();
        return;
      }

      // 13. 'M' KEY: Toggle Center Mixer (Hides Mixer to enlarge Decks A & B to 100%)
      if (e.key.toLowerCase() === 'm' && !e.shiftKey) {
        e.preventDefault();
        if (e.repeat) return;
        setShowCenterMixer((prev) => !prev);
        return;
      }

      // 14. 'W' KEY: Toggle Waveforms Display (Enlarges decks and browser vertically)
      if (e.key.toLowerCase() === 'w' && !e.shiftKey) {
        e.preventDefault();
        if (e.repeat) return;
        setShowWaveforms((prev) => !prev);
        return;
      }

      // 15. 'B' KEY: Cycle Track Browser Mode (Standard -> Maximized -> Compact -> Hidden)
      if (e.key.toLowerCase() === 'b' && !e.shiftKey) {
        e.preventDefault();
        if (e.repeat) return;
        setBrowserViewMode((prev) => {
          if (prev === 'standard') return 'maximized';
          if (prev === 'maximized') return 'compact';
          if (prev === 'compact') return 'hidden';
          return 'standard';
        });
        return;
      }

      // 16. 'Alt+R' KEY: Reset all panel dimensions and splitters to default
      if (e.altKey && e.key.toLowerCase() === 'r') {
        e.preventDefault();
        handleResetDefaultDimensions();
        return;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          target.getAttribute('role') === 'textbox')
      ) {
        return;
      }

      if (e.metaKey || e.ctrlKey) return;

      // Cue Release (hardware stutter behaviour)
      if (e.key.toLowerCase() === 'c') {
        if (isCuePressedRef.current['deckA']) {
          isCuePressedRef.current['deckA'] = false;
          handleCueUp('deckA');
        }
        if (isCuePressedRef.current['deckB']) {
          isCuePressedRef.current['deckB'] = false;
          handleCueUp('deckB');
        }
      }

      if (e.key === ',') {
        if (isCuePressedRef.current['deckB']) {
          isCuePressedRef.current['deckB'] = false;
          handleCueUp('deckB');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Pitch Fader & Nudge
  const handlePitchChange = (
    deckId: 'deckA' | 'deckB' | 'deckC' | 'deckD',
    percent: number
  ) => {
    setDeckById(deckId, (d) => {
      const rate = 1 + percent / 100;
      const newBpm = (d.originalBpm || d.bpm) * rate;
      audioEngine.setPlaybackRate(deckId, rate);
      return { ...d, pitchPercent: percent, bpm: newBpm };
    });
  };

  const handlePitchReset = (deckId: 'deckA' | 'deckB' | 'deckC' | 'deckD') => {
    handlePitchChange(deckId, 0);
  };

  const handlePitchNudge = (
    deckId: 'deckA' | 'deckB' | 'deckC' | 'deckD',
    delta: number
  ) => {
    audioEngine.nudge(deckId, delta);
  };

  // Seek
  const handleSeek = (
    deckId: 'deckA' | 'deckB' | 'deckC' | 'deckD',
    seconds: number
  ) => {
    audioEngine.seek(deckId, seconds);
    setDeckById(deckId, (d) => ({ ...d, currentTime: seconds }));
  };

  // Scratch
  const handleScratch = (
    deckId: 'deckA' | 'deckB' | 'deckC' | 'deckD',
    velocity: number
  ) => {
    audioEngine.scratch(deckId, velocity);
    // seek forward or backward depending on velocity
    const deck =
      deckId === 'deckA' ? deckA : deckId === 'deckB' ? deckB : deckId === 'deckC' ? deckC : deckD;
    const newPos = Math.max(0, Math.min(deck.duration, deck.currentTime + velocity * 0.4));
    handleSeek(deckId, newPos);
  };

  // Stems Controls
  const handleStemVolumeChange = (
    deckId: 'deckA' | 'deckB',
    stem: 'vocals' | 'melody' | 'bass' | 'drums',
    val: number
  ) => {
    setDeckById(deckId, (d) => {
      const newStems = { ...d.stems, [stem]: val };
      audioEngine.setStems(
        deckId,
        {
          vocals: newStems.vocals,
          melody: newStems.melody,
          bass: newStems.bass,
          drums: newStems.drums,
        },
        {
          vocals: newStems.vocalsMuted,
          melody: newStems.melodyMuted,
          bass: newStems.bassMuted,
          drums: newStems.drumsMuted,
        }
      );
      return { ...d, stems: newStems };
    });
  };

  const handleStemMuteToggle = (
    deckId: 'deckA' | 'deckB',
    stem: 'vocals' | 'melody' | 'bass' | 'drums'
  ) => {
    setDeckById(deckId, (d) => {
      const muteKey = `${stem}Muted` as keyof typeof d.stems;
      const newMutes = { ...d.stems, [muteKey]: !d.stems[muteKey] };
      audioEngine.setStems(
        deckId,
        {
          vocals: d.stems.vocals,
          melody: d.stems.melody,
          bass: d.stems.bass,
          drums: d.stems.drums,
        },
        {
          vocals: newMutes.vocalsMuted,
          melody: newMutes.melodyMuted,
          bass: newMutes.bassMuted,
          drums: newMutes.drumsMuted,
        }
      );
      return { ...d, stems: newMutes };
    });
  };

  // EQ & Filter
  const handleEqChange = (
    deckId: 'deckA' | 'deckB',
    band: 'high' | 'mid' | 'low',
    val: number
  ) => {
    setDeckById(deckId, (d) => {
      const newHigh = band === 'high' ? val : d.eqHigh;
      const newMid = band === 'mid' ? val : d.eqMid;
      const newLow = band === 'low' ? val : d.eqLow;
      audioEngine.setEQ(deckId, newHigh, newMid, newLow, {
        high: d.highKill,
        mid: d.midKill,
        low: d.lowKill,
      });
      return {
        ...d,
        eqHigh: newHigh,
        eqMid: newMid,
        eqLow: newLow,
      };
    });
  };

  const handleEqKill = (deckId: 'deckA' | 'deckB', band: 'high' | 'mid' | 'low') => {
    setDeckById(deckId, (d) => {
      const killProp = `${band}Kill` as 'highKill' | 'midKill' | 'lowKill';
      const isKilled = !d[killProp];
      audioEngine.setEQ(deckId, d.eqHigh, d.eqMid, d.eqLow, {
        high: band === 'high' ? isKilled : d.highKill,
        mid: band === 'mid' ? isKilled : d.midKill,
        low: band === 'low' ? isKilled : d.lowKill,
      });
      return { ...d, [killProp]: isKilled };
    });
  };

  const handleFilterChange = (deckId: 'deckA' | 'deckB', val: number) => {
    audioEngine.setFilter(deckId, val);
    setDeckById(deckId, (d) => ({ ...d, filter: val }));
  };

  const handleGainChange = (deckId: 'deckA' | 'deckB', val: number) => {
    audioEngine.setGain(deckId, val);
    setDeckById(deckId, (d) => ({ ...d, gain: val }));
  };

  const handleVolumeChange = (deckId: 'deckA' | 'deckB', val: number) => {
    audioEngine.setVolume(deckId, val);
    setDeckById(deckId, (d) => ({ ...d, volume: val }));
  };

  const handleCrossfaderChange = (val: number) => {
    audioEngine.updateCrossfader(val, mixer.crossfaderCurve);
    setMixer((m) => ({ ...m, crossfader: val }));
  };

  const handleCrossfaderCurveChange = (curve: 'smooth' | 'linear' | 'scratch') => {
    audioEngine.updateCrossfader(mixer.crossfader, curve);
    setMixer((m) => ({ ...m, crossfaderCurve: curve }));
  };

  // Headphone Cue (PFL) & Audio Routing Handlers (Ch 1-2 & Ch 3-4)
  const handleHeadphoneCue = (deckId: 'deckA' | 'deckB' | 'deckC' | 'deckD') => {
    setDeckById(deckId, (d) => {
      const next = !d.headphoneCue;
      audioEngine.setHeadphoneCue(deckId, next);
      return { ...d, headphoneCue: next };
    });
  };

  const handleHeadphoneVolumeChange = (vol: number) => {
    audioEngine.setHeadphoneVolume(vol);
    setMixer((m) => ({ ...m, headphoneVolume: vol }));
  };

  const handleHeadphoneCueMixChange = (mix: number) => {
    audioEngine.setHeadphoneCueMix(mix);
    setMixer((m) => ({ ...m, headphoneCueMix: mix }));
  };

  const handleToggleMasterCue = () => {
    setMixer((m) => {
      const next = !m.masterCue;
      audioEngine.setMasterCue(next);
      return { ...m, masterCue: next };
    });
  };

  const handleToggleSplitCue = () => {
    setMixer((m) => {
      const next = !m.splitCue;
      audioEngine.setSplitCue(next);
      return { ...m, splitCue: next };
    });
  };

  const handleRoutingModeChange = (mode: AudioRoutingMode) => {
    audioEngine.setAudioRoutingMode(mode, {
      masterDeviceId: mixer.masterAudioDeviceId,
      cueDeviceId: mixer.cueAudioDeviceId,
    });
    setMixer((m) => ({ ...m, audioRoutingMode: mode }));
  };

  const handleMasterDeviceChange = (id: string) => {
    setMixer((m) => ({ ...m, masterAudioDeviceId: id }));
    audioEngine.setAudioRoutingMode(mixer.audioRoutingMode, {
      masterDeviceId: id,
      cueDeviceId: mixer.cueAudioDeviceId,
    });
  };

  const handleCueDeviceChange = (id: string) => {
    setMixer((m) => ({ ...m, cueAudioDeviceId: id }));
    audioEngine.setAudioRoutingMode(mixer.audioRoutingMode, {
      masterDeviceId: mixer.masterAudioDeviceId,
      cueDeviceId: id,
    });
  };

  // Hot Cues
  const handleHotCueTrigger = (
    deckId: 'deckA' | 'deckB',
    index: number
  ) => {
    const deck = deckId === 'deckA' ? deckARef.current : deckBRef.current;
    const cueTime = deck.hotCues[index];

    if (cueTime !== null) {
      handleSeek(deckId, cueTime);
      if (!deck.isPlaying) {
        audioEngine.play(deckId, cueTime);
        setDeckById(deckId, (d) => ({ ...d, isPlaying: true }));
      }
    } else {
      // Set cue point at current position
      setDeckById(deckId, (d) => {
        const nextCues = [...d.hotCues];
        nextCues[index] = d.currentTime;
        return { ...d, hotCues: nextCues };
      });
    }
  };

  const handleHotCueClear = (deckId: 'deckA' | 'deckB', index: number) => {
    setDeckById(deckId, (d) => {
      const nextCues = [...d.hotCues];
      nextCues[index] = null;
      return { ...d, hotCues: nextCues };
    });
  };

  // Loops
  const handleLoopSelect = (deckId: 'deckA' | 'deckB', beats: number) => {
    const deck = deckId === 'deckA' ? deckA : deckB;
    setDeckById(deckId, (d) => ({
      ...d,
      loopActive: true,
      loopStart: d.currentTime,
      loopLengthBeats: beats,
    }));
  };

  const handleToggleLoop = (deckId: 'deckA' | 'deckB') => {
    setDeckById(deckId, (d) => ({
      ...d,
      loopActive: !d.loopActive,
      loopStart: d.currentTime,
    }));
  };

  // Load Track into Deck
  const handleLoadTrack = async (
    deckId: 'deckA' | 'deckB' | 'deckC' | 'deckD',
    track: Track
  ) => {
    try {
      const buf = await getTrackAudioBuffer(track);
      audioEngine.setDeckBuffer(deckId, buf);

      setDeckById(deckId, (d) => ({
        ...d,
        track,
        duration: track.duration,
        bpm: track.bpm,
        originalBpm: track.bpm,
        pitchPercent: 0,
        currentTime: 0,
        isPlaying: false,
        hotCues: track.cuePoints?.slice(0, 8) || [0, null, null, null, null, null, null, null],
      }));
    } catch (err) {
      console.error('Failed to load track buffer', err);
    }
  };

  // Drop Track on Deck (via Drag and Drop from Browser onto Turntables/Decks)
  const handleDropTrackOnDeck = (
    e: React.DragEvent,
    targetDeckId: 'deckA' | 'deckB' | 'deckC' | 'deckD'
  ) => {
    e.preventDefault();
    e.stopPropagation();
    setDragOverDeckId(null);

    let trackToLoad: Track | null = draggedTrack;
    if (!trackToLoad) {
      try {
        const rawJson = e.dataTransfer.getData('application/json');
        if (rawJson) {
          trackToLoad = JSON.parse(rawJson);
        } else {
          const trackId = e.dataTransfer.getData('text/plain') || e.dataTransfer.getData('track-id');
          if (trackId) {
            trackToLoad = tracks.find((t) => t.id === trackId) || null;
          }
        }
      } catch (err) {
        console.warn('Error reading dropped track data:', err);
      }
    }

    if (trackToLoad) {
      handleLoadTrack(targetDeckId, trackToLoad);
      audioEngine.triggerSamplerSound('laser', 0.2);
      const deckName =
        targetDeckId === 'deckA'
          ? 'DECK 1'
          : targetDeckId === 'deckB'
          ? 'DECK 2'
          : targetDeckId === 'deckC'
          ? 'DECK 3'
          : 'DECK 4';
      setExerciseNotification(`Brano «${trackToLoad.title}» caricato su ${deckName}!`);
      setTimeout(() => setExerciseNotification(null), 3500);
    }
    setDraggedTrack(null);
  };

  // Intelligent AI AutoMix Transition Automation
  const handleExecuteAutoMix = async (advice?: AiTransitionAdvice) => {
    if (mixer.isAutoMixing) return;

    // Start AutoMix execution
    setMixer((m) => ({ ...m, isAutoMixing: true, autoMixProgress: 0 }));

    // Ensure incoming deck (Deck B) is playing and beat-matched
    if (!deckB.isPlaying) {
      handlePlayPause('deckB');
    }
    handleSync('deckB');

    // Smooth automated crossfade, EQ low cut on incoming deck, then bass swap
    const totalSteps = 40;
    const intervalTime = 120; // ~4.8 seconds transition
    let step = 0;

    // Initially cut low on Deck B for clean blend
    handleEqKill('deckB', 'low');

    const autoMixInterval = setInterval(() => {
      step++;
      const progress = Math.min(100, Math.round((step / totalSteps) * 100));
      // Crossfader moves smoothly from -1 (Deck A) to +1 (Deck B)
      const newCrossfader = -1 + (step / totalSteps) * 2;
      handleCrossfaderChange(newCrossfader);

      // Mid-point: swap bass (re-enable Deck B bass, kill Deck A bass)
      if (step === Math.floor(totalSteps / 2)) {
        handleEqKill('deckB', 'low'); // restore bass on B
        handleEqKill('deckA', 'low'); // cut bass on A
      }

      setMixer((m) => ({ ...m, autoMixProgress: progress }));

      if (step >= totalSteps) {
        clearInterval(autoMixInterval);
        // Complete transition: stop Deck A and restore neutrality
        audioEngine.pause('deckA');
        setDeckA((d) => ({ ...d, isPlaying: false }));
        handleCrossfaderChange(1); // fully on Deck B
        setMixer((m) => ({ ...m, isAutoMixing: false, autoMixProgress: 100 }));
      }
    }, intervalTime);
  };

  // Recording Handlers
  const handleStartRecording = () => {
    const success = audioEngine.startRecording();
    if (success) {
      setMixer((m) => ({ ...m, isRecording: true }));
    }
  };

  const handleStopRecording = () => {
    const blob = audioEngine.stopRecording();
    setMixer((m) => ({ ...m, isRecording: false }));

    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `virtuoso-dj-set-${new Date().toISOString().slice(0, 10)}.webm`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Set Deck Hot Cues directly from AI Structural Points
  const handleSetHotCuesFromStructure = (
    deckId: 'deckA' | 'deckB',
    points: TrackStructurePoints
  ) => {
    setDeckById(deckId, (d) => {
      const nextCues = [...d.hotCues];
      nextCues[0] = points.introIn;
      nextCues[1] = points.breakdown;
      nextCues[2] = points.mainDrop;
      nextCues[3] = points.outroOut;
      return { ...d, hotCues: nextCues };
    });
  };

  const [exerciseNotification, setExerciseNotification] = useState<string | null>(null);

  // Interactive DJ Academy Practice Simulator
  const handleRunInteractiveExercise = (exerciseId: string) => {
    if (exerciseId === 'cue_stutter') {
      audioEngine.pause('deckA');
      handleSeek('deckA', 0);
      setDeckA((d) => ({ ...d, isPlaying: false, currentTime: 0 }));
      setExerciseNotification('🎯 Esercizio CUE: Tieni premuto CUE su Deck 1 per ascoltare e rilascia per tornare indietro!');
    } else if (exerciseId === 'harmonic_match') {
      if (tracks[0]) handleLoadTrack('deckA', tracks[0]);
      if (tracks[1]) handleLoadTrack('deckB', tracks[1]);
      setExerciseNotification('🎯 Esercizio Camelot: Brano A (8A) e Brano B (9A) pronti! Step di energia +1!');
    } else if (exerciseId === 'bass_swap') {
      // Seek Deck A 5 seconds before the exact remix point (e.g. 02:03)
      if (tracks[0] && deckA.track?.id !== tracks[0].id) handleLoadTrack('deckA', tracks[0]);
      if (tracks[1] && deckB.track?.id !== tracks[1].id) handleLoadTrack('deckB', tracks[1]);
      handleSeek('deckA', 123); // ~02:03
      handleSeek('deckB', 0);
      if (!deckA.isPlaying) handlePlayPause('deckA');
      handleEqKill('deckB', 'low');
      handleCrossfaderChange(-0.8);
      setExerciseNotification('⚡ SIMULAZIONE PUNTO ESATTO: Deck A a 5s dal cambio! Deck B ha i bassi tagliati: preparati allo swap!');

      // Timed automated swap after 5 seconds
      setTimeout(() => {
        if (!deckB.isPlaying) handlePlayPause('deckB');
        handleCrossfaderChange(0);
        handleEqKill('deckA', 'low'); // cut A bass
        handleEqKill('deckB', 'low'); // restore B bass
        audioEngine.triggerSamplerSound('laser', 0.6);
        setExerciseNotification('🔥 PUNTO ESATTO RAGGIUNTO! Bass-Swap eseguito! Ascolta la pulizia acustica del nuovo subwoofer!');
      }, 5000);
    } else if (exerciseId === 'stems_mashup') {
      handleSeek('deckA', 65); // ~01:05 (Breakdown vocale)
      handleSeek('deckB', 15);
      if (!deckA.isPlaying) handlePlayPause('deckA');
      if (!deckB.isPlaying) handlePlayPause('deckB');
      handleStemVolumeChange('deckA', 'vocals', 1);
      handleStemVolumeChange('deckA', 'melody', 0);
      handleStemVolumeChange('deckA', 'bass', 0);
      handleStemVolumeChange('deckA', 'drums', 0);
      handleCrossfaderChange(0);
      setExerciseNotification('🎤 PUNTO ESATTO MASHUP: Voce isolata di Deck 1 sovrapposta al groove ritmico del Deck 2!');
    } else if (exerciseId === 'riser_macro') {
      if (!deckA.isPlaying) handlePlayPause('deckA');
      audioEngine.triggerAiRiserBuild('deckA', 4.0);
      setExerciseNotification('⚡ PUNTO ESATTO RISER: AI Riser Build attivo per 4s! Senti il crescendo di tensione prima del taglio!');
    } else if (exerciseId === 'structure_mix') {
      if (!deckA.isPlaying) handlePlayPause('deckA');
      const outro = deckA.track?.idealMixPoints?.outroOut || 120;
      handleSeek('deckA', Math.max(0, outro - 10));
      setExerciseNotification('🎯 PUNTO ESATTO MIX-OUT: 10 secondi alla chiusura della frase! Guarda il countdown sul mixer!');
    } else if (exerciseId === 'audio_routing_demo') {
      audioEngine.setHeadphoneCue('deckB', true);
      audioEngine.setHeadphoneCueMix(0.5);
      audioEngine.setHeadphoneVolume(1.0);
      setDeckB((d) => ({ ...d, headphoneCue: true }));
      setMixer((m) => ({ ...m, headphoneCueMix: 0.5, headphoneVolume: 1.0 }));
      audioEngine.triggerSamplerSound('laser', 0.5);
      setExerciseNotification('🎧 Preascolto PFL Cuffie Ch 3-4 Attivato su Deck B! Cue Mix al 50%: ascolti in cuffia senza trasmettere al Master!');
    } else if (exerciseId === 'quantize_demo') {
      setDeckA((d) => ({ ...d, quantize: true, quantizeResolution: '1/1' }));
      handleLoopSelect('deckA', 4);
      audioEngine.triggerSamplerSound('chime', 0.6);
      setExerciseNotification('🧲 Quantize Magnetico Attivo a 1/1 Battuta! Loop di 4 battute agganciato con precisione assoluta sul Beatgrid!');
    } else if (exerciseId === 'midi_guide') {
      setShowMidiModal(true);
      setExerciseNotification('🎹 Pannello Controller Web MIDI Aperto! Connetti la tua console USB o mappa i tasti con MIDI Learn!');
    } else if (exerciseId === 'audio_hardware_guide') {
      setShowHardwareModal(true);
      setExerciseNotification('🎛️ Matrice Audio Hardware Aperta! Assegna Ch 1-2 al Master e Ch 3-4 alle Cuffie (PFL)!');
    }

    setTimeout(() => {
      setExerciseNotification(null);
    }, 8000);
  };

  return (
    <div className="flex flex-col h-screen h-[100dvh] max-h-[100dvh] w-screen bg-[#0d0f15] text-slate-100 overflow-hidden font-sans pb-[env(safe-area-inset-bottom,0px)] pl-[env(safe-area-inset-left,0px)] pr-[env(safe-area-inset-right,0px)] select-none">
      {/* Top macOS Style Pro Bar */}
      <MacHeader
        layout={layout}
        onLayoutChange={setLayout}
        djMode={djMode}
        onDjModeChange={setDjMode}
        panelVisibility={panelVisibility}
        onTogglePanel={handleTogglePanel}
        onSetBrowserViewMode={setBrowserViewMode}
        onApplyLayoutPreset={handleApplyLayoutPreset}
        mixer={mixer}
        onMasterVolumeChange={(vol) => {
          audioEngine.setMasterVolume(vol);
          setMixer((m) => ({ ...m, masterVolume: vol }));
        }}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        onOpenAiAssistant={() => setShowAiModal(true)}
        onOpenDynamicFx={() => setShowDynamicFxModal(true)}
        onOpenTrackAnalyzer={() => setShowTrackAnalyzerModal(true)}
        onOpenManual={() => setShowManualModal(true)}
        onOpenHardware={() => setShowHardwareModal(true)}
        hardwareDeviceCount={hardwareDevices.length}
        onOpenMidiConfig={() => setShowMidiModal(true)}
        midiDeviceCount={midiDeviceCount}
        onTriggerAutoMix={() => handleExecuteAutoMix()}
        onToggleSampler={() => setShowSampler((s) => !s)}
        showSampler={showSampler}
        isTouchDevice={isTouchDevice}
        isOffline={isOffline}
        onOpenPresentation={() => setHasEntered(false)}
        onOpenKeyboardShortcuts={() => setShowKeyboardShortcutsModal(true)}
        onResetDimensions={handleResetDefaultDimensions}
        platterSize={platterSize}
        onPlatterSizeChange={setPlatterSize}
      />

      {/* Main Dual Stacked Running Waveforms Section (Collapsible & Resizable) */}
      {showWaveforms ? (
        <>
          <WaveformDisplay
            deckA={deckA}
            deckB={deckB}
            deckC={deckC}
            deckD={deckD}
            isQuad={layout === 'mac-quad'}
            onSeek={handleSeek}
            onClose={() => setShowWaveforms(false)}
            height={panelDimensions.waveformHeight}
          />
          {/* Horizontal Splitter below Waveforms */}
          <SplitterBar
            orientation="horizontal"
            isDragging={activeSplitter === 'waveform-height'}
            onMouseDown={handleWaveformSplitterMouseDown}
            onDoubleClick={() => handleResetSplitter('waveform-height')}
            onReset={() => handleResetSplitter('waveform-height')}
            label="Trascina in verticale per l'altezza delle Waveform • Doppio click per default (135px)"
          />
        </>
      ) : (
        /* Waveforms Hidden Notice Bar */
        <div className="bg-[#0e1017] border-b border-[#1c202a] px-3 py-1 flex items-center justify-between text-[11px] font-mono text-slate-400 select-none">
          <span className="flex items-center gap-1.5 text-cyan-400">
            <EyeOff className="w-3.5 h-3.5" />
            <span>WAVEFORM SUPERIORI NASCOSTE (Spazio verticale massimizzato per i Deck)</span>
          </span>
          <button
            onClick={() => setShowWaveforms(true)}
            className="flex items-center gap-1 px-2 py-0.5 rounded bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 font-bold transition active:scale-95 cursor-pointer"
            title="Ripristina la visualizzazione delle Waveform [W]"
          >
            <Eye className="w-3 h-3" />
            <span>MOSTRA WAVEFORM [W]</span>
          </button>
        </div>
      )}

      {/* AI Smart Mix Advisor Live Banner (Countdown, Recommended FX & Timed Transition) */}
      {showAdvisor && (
        <AiSmartMixAdvisor
          deckA={deckA}
          deckB={deckB}
          library={tracks}
          onLoadTrackToDeck={(deckId, track) => handleLoadTrack(deckId, track)}
          onExecuteTimedTransition={() => handleExecuteAutoMix()}
          onClose={() => setShowAdvisor(false)}
        />
      )}

      {/* Sampler Rack Soundboard (Collapsible) */}
      <SamplerRack
        isOpen={showSampler}
        onClose={() => setShowSampler(false)}
      />

      {/* Main Performance Section: Either Mini-Deck Transport HUD (if Browser Maximized) or Full Decks Grid */}
      {browserViewMode === 'maximized' ? (
        /* Compact Mini-Deck Transport HUD (VirtualDJ Full Library Mode) */
        <div className="bg-[#10131d] border-b border-[#212738] px-3 py-2 flex flex-wrap items-center justify-between gap-3 text-xs select-none shrink-0 shadow-md">
          {/* Deck 1 Mini Transport */}
          <div
            onClick={() => setActiveDeckId('deckA')}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'copy';
              if (dragOverDeckId !== 'deckA') setDragOverDeckId('deckA');
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setDragOverDeckId(null);
              }
            }}
            onDrop={(e) => handleDropTrackOnDeck(e, 'deckA')}
            className={`flex items-center gap-2 bg-[#0c0e14] px-3 py-1.5 rounded-lg border transition cursor-pointer relative ${
              dragOverDeckId === 'deckA'
                ? 'border-cyan-400 ring-2 ring-cyan-400 bg-cyan-950/70 shadow-[0_0_15px_rgba(6,182,212,0.6)]'
                : activeDeckId === 'deckA'
                ? 'border-cyan-400 ring-1 ring-cyan-500/40 shadow-sm'
                : 'border-[#22293a]'
            }`}
            title="Deck 1 • Trascina qui un brano per caricarlo"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="font-mono font-black text-cyan-400 text-xs">DECK 1</span>
            <div className="flex flex-col min-w-[130px] max-w-[200px]">
              <span className="font-bold text-slate-100 truncate text-[11px]">
                {deckA.track ? deckA.track.title : 'Empty Deck'}
              </span>
              <span className="text-[10px] font-mono text-cyan-300">
                {deckA.bpm.toFixed(1)} BPM • {Math.floor(deckA.currentTime / 60)}:
                {Math.floor(deckA.currentTime % 60).toString().padStart(2, '0')}
              </span>
            </div>
            {/* Transport Mini Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayPause('deckA');
                }}
                className={`px-2.5 py-1 rounded font-mono font-bold text-xs transition cursor-pointer ${
                  deckA.isPlaying
                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                    : 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
                }`}
              >
                {deckA.isPlaying ? 'PAUSE' : 'PLAY'}
              </button>
              <button
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleCueDown('deckA');
                }}
                onMouseUp={(e) => {
                  e.stopPropagation();
                  handleCueUp('deckA');
                }}
                className="px-2.5 py-1 rounded bg-slate-800 text-amber-400 hover:bg-slate-700 font-mono font-bold text-xs transition cursor-pointer"
              >
                CUE
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSync('deckA');
                }}
                className={`px-2 py-1 rounded font-mono font-bold text-xs transition cursor-pointer ${
                  deckA.isSync
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 text-cyan-400 hover:bg-slate-700'
                }`}
              >
                SYNC
              </button>
            </div>
          </div>

          {/* Center Mini Crossfader & Restore Button */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 bg-[#0c0e14] px-2.5 py-1 rounded border border-[#22293a]">
              <span className="text-[10px] font-mono text-cyan-400 font-bold">CH 1</span>
              <input
                type="range"
                min="-1"
                max="1"
                step="0.05"
                value={mixer.crossfader}
                onChange={(e) => handleCrossfaderChange(parseFloat(e.target.value))}
                className="w-24 h-1 bg-slate-700 rounded appearance-none accent-purple-400 cursor-pointer"
              />
              <span className="text-[10px] font-mono text-orange-400 font-bold">CH 2</span>
            </div>

            <button
              onClick={() => setBrowserViewMode('standard')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs shadow-md transition active:scale-95 cursor-pointer"
              title="Ripristina visualizzazione standard con deck e jog wheel [B]"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>RIDUCI LIBRERIA A NORMALE [B]</span>
            </button>
          </div>

          {/* Deck 2 Mini Transport */}
          <div
            onClick={() => setActiveDeckId('deckB')}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'copy';
              if (dragOverDeckId !== 'deckB') setDragOverDeckId('deckB');
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setDragOverDeckId(null);
              }
            }}
            onDrop={(e) => handleDropTrackOnDeck(e, 'deckB')}
            className={`flex items-center gap-2 bg-[#0c0e14] px-3 py-1.5 rounded-lg border transition cursor-pointer relative ${
              dragOverDeckId === 'deckB'
                ? 'border-orange-400 ring-2 ring-orange-400 bg-orange-950/70 shadow-[0_0_15px_rgba(249,115,22,0.6)]'
                : activeDeckId === 'deckB'
                ? 'border-orange-400 ring-1 ring-orange-500/40 shadow-sm'
                : 'border-[#22293a]'
            }`}
            title="Deck 2 • Trascina qui un brano per caricarlo"
          >
            <div className="w-2.5 h-2.5 rounded-full bg-orange-400 animate-pulse" />
            <span className="font-mono font-black text-orange-400 text-xs">DECK 2</span>
            <div className="flex flex-col min-w-[130px] max-w-[200px]">
              <span className="font-bold text-slate-100 truncate text-[11px]">
                {deckB.track ? deckB.track.title : 'Empty Deck'}
              </span>
              <span className="text-[10px] font-mono text-orange-300">
                {deckB.bpm.toFixed(1)} BPM • {Math.floor(deckB.currentTime / 60)}:
                {Math.floor(deckB.currentTime % 60).toString().padStart(2, '0')}
              </span>
            </div>
            {/* Transport Mini Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handlePlayPause('deckB');
                }}
                className={`px-2.5 py-1 rounded font-mono font-bold text-xs transition cursor-pointer ${
                  deckB.isPlaying
                    ? 'bg-emerald-500 text-slate-950 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                    : 'bg-slate-800 text-emerald-400 hover:bg-slate-700'
                }`}
              >
                {deckB.isPlaying ? 'PAUSE' : 'PLAY'}
              </button>
              <button
                onMouseDown={(e) => {
                  e.stopPropagation();
                  handleCueDown('deckB');
                }}
                onMouseUp={(e) => {
                  e.stopPropagation();
                  handleCueUp('deckB');
                }}
                className="px-2.5 py-1 rounded bg-slate-800 text-amber-400 hover:bg-slate-700 font-mono font-bold text-xs transition cursor-pointer"
              >
                CUE
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleSync('deckB');
                }}
                className={`px-2 py-1 rounded font-mono font-bold text-xs transition cursor-pointer ${
                  deckB.isSync
                    ? 'bg-orange-500 text-slate-950'
                    : 'bg-slate-800 text-orange-400 hover:bg-slate-700'
                }`}
              >
                SYNC
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Center Performance & Decks Area */
        <div className={`flex-1 flex flex-col md:flex-row ${isMinimalist ? 'gap-1.5 p-1.5' : 'gap-2 p-2'} overflow-hidden min-h-0`}>
          {/* DECK 1 (Cyan Theme) */}
          <div
            onClick={() => setActiveDeckId('deckA')}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'copy';
              if (dragOverDeckId !== 'deckA') setDragOverDeckId('deckA');
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setDragOverDeckId(null);
              }
            }}
            onDrop={(e) => handleDropTrackOnDeck(e, 'deckA')}
            style={{
              flex: '1 1 0%',
              minWidth: 0,
            }}
            className={`flex-1 min-w-0 bg-[#12141c] border ${
              dragOverDeckId === 'deckA'
                ? 'border-cyan-400 ring-4 ring-cyan-400/80 shadow-[0_0_35px_rgba(6,182,212,0.7)]'
                : activeDeckId === 'deckA'
                ? 'border-cyan-400 ring-2 ring-cyan-500/25 shadow-cyan-500/10'
                : 'border-cyan-500/30'
            } rounded-lg ${isMinimalist ? 'p-1.5 sm:p-2' : 'p-2 sm:p-2.5'} flex flex-col justify-between shadow-lg relative transition-all cursor-pointer overflow-hidden`}
          >
            {/* Visual Drop Overlay when dragging a track over Deck 1 */}
            {dragOverDeckId === 'deckA' && (
              <div className="absolute inset-0 z-40 bg-[#07131f]/90 backdrop-blur-xs rounded-lg border-2 border-cyan-400 flex flex-col items-center justify-center p-4 text-center animate-in fade-in zoom-in-95 pointer-events-none shadow-[0_0_35px_rgba(6,182,212,0.6)]">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-cyan-500/20 border-2 border-cyan-400 flex items-center justify-center mb-2 animate-bounce shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                  <Disc3 className="w-8 h-8 sm:w-10 sm:h-10 text-cyan-300 animate-spin" />
                </div>
                <span className="text-xs sm:text-sm font-mono font-black text-cyan-300 tracking-wider uppercase mb-1">
                  RILASCIA SUL PIATTO PER CARICARE SU DECK 1
                </span>
                {draggedTrack && (
                  <div className="text-white font-bold text-xs truncate max-w-[280px] bg-slate-900/90 px-3 py-1.5 rounded-lg border border-cyan-500/40 shadow-sm mt-1">
                    🎵 {draggedTrack.title} • <span className="text-cyan-300 font-mono">{draggedTrack.bpm} BPM</span>
                  </div>
                )}
              </div>
            )}

            {/* Deck Header */}
            <div className="flex items-center justify-between border-b border-[#1f2433] pb-1 mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-950/80 border border-cyan-500/50 flex items-center gap-1.5">
                  <span>DECK 1</span>
                  {activeDeckId === 'deckA' && (
                    <span className="text-[9px] bg-cyan-400 text-slate-950 px-1 rounded font-extrabold uppercase tracking-tight">
                      ACTIVE [TAB]
                    </span>
                  )}
                </span>
                <span className="text-xs font-bold text-slate-100 truncate max-w-[160px]">
                  {deckA.track ? deckA.track.title : 'Empty Deck'}
                </span>
              </div>
              <span className="text-xs font-mono text-cyan-300 font-bold">
                {deckA.bpm.toFixed(1)} BPM
              </span>
            </div>

            {/* Jog Wheel Platter */}
            <JogWheel
              deck={deckA}
              onScratch={(vel) => handleScratch('deckA', vel)}
              onNudge={(delta) => handlePitchNudge('deckA', delta)}
              onToggleVinyl={() => setDeckA((d) => ({ ...d, vinylMode: !d.vinylMode }))}
              onToggleSlip={() => setDeckA((d) => ({ ...d, slipMode: !d.slipMode }))}
              isTouchDevice={isTouchDevice}
              platterSize={platterSize}
              onSetPlatterSize={setPlatterSize}
            />

            {/* Transport & Pitch Controls */}
            <DeckControls
              deck={deckA}
              onPlayPause={() => handlePlayPause('deckA')}
              onCueDown={() => handleCueDown('deckA')}
              onCueUp={() => handleCueUp('deckA')}
              onSync={() => handleSync('deckA')}
              isActiveDeck={activeDeckId === 'deckA'}
              shortcutPlay={activeDeckId === 'deckA' ? 'SPACE' : 'Shift+SPACE'}
              shortcutCue={activeDeckId === 'deckA' ? 'C' : 'Shift+C'}
              shortcutSync={activeDeckId === 'deckA' ? 'S' : 'Shift+S'}
              onPitchChange={(p) => handlePitchChange('deckA', p)}
              onPitchReset={() => handlePitchReset('deckA')}
              onPitchNudge={(d) => handlePitchNudge('deckA', d)}
              onToggleKeyLock={() => setDeckA((d) => ({ ...d, keyLock: !d.keyLock }))}
              onCyclePitchRange={() =>
                setDeckA((d) => ({
                  ...d,
                  pitchRange: d.pitchRange === 8 ? 16 : d.pitchRange === 16 ? 50 : 8,
                }))
              }
              onToggleLoop={() => handleToggleLoop('deckA')}
              onLoopHalve={() =>
                setDeckA((d) => ({
                  ...d,
                  loopLengthBeats: Math.max(0.125, d.loopLengthBeats / 2),
                }))
              }
              onLoopDouble={() =>
                setDeckA((d) => ({
                  ...d,
                  loopLengthBeats: Math.min(32, d.loopLengthBeats * 2),
                }))
              }
              isCompact={isMinimalist}
            />

            {/* Performance Pads (Hot Cue, Loop, AI Stems, Sampler, FX) */}
            <PerformancePads
              deck={deckA}
              onSetPadMode={(mode) => setDeckA((d) => ({ ...d, activePadMode: mode }))}
              onHotCueTrigger={(idx) => handleHotCueTrigger('deckA', idx)}
              onHotCueClear={(idx) => handleHotCueClear('deckA', idx)}
              onLoopSelect={(beats) => handleLoopSelect('deckA', beats)}
              onStemMuteToggle={(stem) => handleStemMuteToggle('deckA', stem)}
              onStemVolumeChange={(stem, val) => handleStemVolumeChange('deckA', stem, val)}
              onTriggerSampler={(type) => audioEngine.triggerSamplerSound(type)}
              onToggleFx={(fx) => {
                const active = !deckA.fx[fx].active;
                setDeckA((d) => ({
                  ...d,
                  fx: { ...d.fx, [fx]: { ...d.fx[fx], active } },
                }));
                if (fx === 'echo') audioEngine.setEcho('deckA', active, 0.6, 0.375);
                if (fx === 'reverb') audioEngine.setReverb('deckA', active, 0.7);
              }}
              onBeatRoll={(len) => {
                handleLoopSelect('deckA', len);
              }}
              isCompact={isMinimalist}
            />
          </div>

          {/* Left Vertical Splitter: between Deck 1 and Center Mixer */}
          {showCenterMixer && layout !== 'mac-quad' && (
            <SplitterBar
              orientation="vertical"
              isDragging={activeSplitter === 'mixer-left'}
              onMouseDown={(e) => handleMixerSplitterMouseDown(e, 'left')}
              onDoubleClick={() => handleResetSplitter('mixer-width')}
              onReset={() => handleResetSplitter('mixer-width')}
              label="Trascina in orizzontale per ridimensionare il Mixer • Doppio click per default (210px)"
            />
          )}

          {/* CENTER MIXER (2 or 4 Channels + Crossfader) or Restore Banner */}
          {showCenterMixer ? (
            <div
              style={{
                width: layout !== 'mac-quad' ? `${panelDimensions.mixerWidth}px` : undefined,
                maxWidth: layout !== 'mac-quad' ? '30vw' : undefined,
                flex: layout === 'mac-quad' ? '1 1 0%' : '0 0 auto',
                minWidth: 0,
              }}
              className="flex flex-col justify-between shrink-0 min-w-0"
            >
              <CenterMixer
                deckA={deckA}
                deckB={deckB}
                mixer={mixer}
                djMode={djMode}
                onEqChange={handleEqChange}
                onEqKill={handleEqKill}
                onFilterChange={handleFilterChange}
                onGainChange={handleGainChange}
                onVolumeChange={handleVolumeChange}
                onHeadphoneCue={handleHeadphoneCue}
                onHeadphoneVolumeChange={handleHeadphoneVolumeChange}
                onHeadphoneCueMixChange={handleHeadphoneCueMixChange}
                onToggleMasterCue={handleToggleMasterCue}
                onToggleSplitCue={handleToggleSplitCue}
                onOpenHardwareModal={() => setShowHardwareModal(true)}
                onCrossfaderChange={handleCrossfaderChange}
                onCrossfaderCurveChange={handleCrossfaderCurveChange}
                onHideMixer={() => setShowCenterMixer(false)}
                isCompact={isMinimalist}
              />
            </div>
          ) : (
            /* Restore Mixer Chip */
            <div className="w-full flex items-center justify-center -my-1 py-0.5">
              <button
                onClick={() => setShowCenterMixer(true)}
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#161a26]/90 border border-purple-500/50 hover:border-purple-400 text-purple-300 text-xs font-mono font-bold shadow-lg hover:bg-[#1f2438] transition active:scale-95 cursor-pointer"
                title="Ripristina il mixer virtuale [M]"
              >
                <Sliders className="w-3.5 h-3.5 text-purple-400" />
                <span>MIXER VIRTUALE NASCOSTO (Deck ingranditi 50/50 per mixer esterno) • CLICCA PER MOSTRARE [M]</span>
              </button>
            </div>
          )}

          {/* Right Vertical Splitter: between Center Mixer and Deck 2 */}
          {showCenterMixer && layout !== 'mac-quad' && (
            <SplitterBar
              orientation="vertical"
              isDragging={activeSplitter === 'mixer-right'}
              onMouseDown={(e) => handleMixerSplitterMouseDown(e, 'right')}
              onDoubleClick={() => handleResetSplitter('mixer-width')}
              onReset={() => handleResetSplitter('mixer-width')}
              label="Trascina in orizzontale per ridimensionare il Mixer • Doppio click per default (210px)"
            />
          )}

          {/* DECK 2 (Orange Theme) */}
          <div
            onClick={() => setActiveDeckId('deckB')}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'copy';
              if (dragOverDeckId !== 'deckB') setDragOverDeckId('deckB');
            }}
            onDragLeave={(e) => {
              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                setDragOverDeckId(null);
              }
            }}
            onDrop={(e) => handleDropTrackOnDeck(e, 'deckB')}
            style={{
              flex: '1 1 0%',
              minWidth: 0,
            }}
            className={`flex-1 min-w-0 bg-[#12141c] border ${
              dragOverDeckId === 'deckB'
                ? 'border-orange-400 ring-4 ring-orange-400/80 shadow-[0_0_35px_rgba(249,115,22,0.7)]'
                : activeDeckId === 'deckB'
                ? 'border-orange-400 ring-2 ring-orange-500/25 shadow-orange-500/10'
                : 'border-orange-500/30'
            } rounded-lg ${isMinimalist ? 'p-1.5 sm:p-2' : 'p-2 sm:p-2.5'} flex flex-col justify-between shadow-lg relative transition-all cursor-pointer overflow-hidden`}
          >
            {/* Visual Drop Overlay when dragging a track over Deck 2 */}
            {dragOverDeckId === 'deckB' && (
              <div className="absolute inset-0 z-40 bg-[#211107]/90 backdrop-blur-xs rounded-lg border-2 border-orange-400 flex flex-col items-center justify-center p-4 text-center animate-in fade-in zoom-in-95 pointer-events-none shadow-[0_0_35px_rgba(249,115,22,0.6)]">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-orange-500/20 border-2 border-orange-400 flex items-center justify-center mb-2 animate-bounce shadow-[0_0_20px_rgba(249,115,22,0.5)]">
                  <Disc3 className="w-8 h-8 sm:w-10 sm:h-10 text-orange-300 animate-spin" />
                </div>
                <span className="text-xs sm:text-sm font-mono font-black text-orange-300 tracking-wider uppercase mb-1">
                  RILASCIA SUL PIATTO PER CARICARE SU DECK 2
                </span>
                {draggedTrack && (
                  <div className="text-white font-bold text-xs truncate max-w-[280px] bg-slate-900/90 px-3 py-1.5 rounded-lg border border-orange-500/40 shadow-sm mt-1">
                    🎵 {draggedTrack.title} • <span className="text-orange-300 font-mono">{draggedTrack.bpm} BPM</span>
                  </div>
                )}
              </div>
            )}

            {/* Deck Header */}
            <div className="flex items-center justify-between border-b border-[#1f2433] pb-1 mb-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-black text-orange-400 px-1.5 py-0.5 rounded bg-orange-950/80 border border-orange-500/50 flex items-center gap-1.5">
                  <span>DECK 2</span>
                  {activeDeckId === 'deckB' && (
                    <span className="text-[9px] bg-orange-400 text-slate-950 px-1 rounded font-extrabold uppercase tracking-tight">
                      ACTIVE [TAB]
                    </span>
                  )}
                </span>
                <span className="text-xs font-bold text-slate-100 truncate max-w-[160px]">
                  {deckB.track ? deckB.track.title : 'Empty Deck'}
                </span>
              </div>
              <span className="text-xs font-mono text-orange-300 font-bold">
                {deckB.bpm.toFixed(1)} BPM
              </span>
            </div>

            {/* Jog Wheel Platter */}
            <JogWheel
              deck={deckB}
              onScratch={(vel) => handleScratch('deckB', vel)}
              onNudge={(delta) => handlePitchNudge('deckB', delta)}
              onToggleVinyl={() => setDeckB((d) => ({ ...d, vinylMode: !d.vinylMode }))}
              onToggleSlip={() => setDeckB((d) => ({ ...d, slipMode: !d.slipMode }))}
              isTouchDevice={isTouchDevice}
              platterSize={platterSize}
              onSetPlatterSize={setPlatterSize}
            />

            {/* Transport & Pitch Controls */}
            <DeckControls
              deck={deckB}
              onPlayPause={() => handlePlayPause('deckB')}
              onCueDown={() => handleCueDown('deckB')}
              onCueUp={() => handleCueUp('deckB')}
              onSync={() => handleSync('deckB')}
              isActiveDeck={activeDeckId === 'deckB'}
              shortcutPlay={activeDeckId === 'deckB' ? 'SPACE' : 'INVIO'}
              shortcutCue={activeDeckId === 'deckB' ? 'C' : ','}
              shortcutSync={activeDeckId === 'deckB' ? 'S' : '.'}
              onPitchChange={(p) => handlePitchChange('deckB', p)}
              onPitchReset={() => handlePitchReset('deckB')}
              onPitchNudge={(d) => handlePitchNudge('deckB', d)}
              onToggleKeyLock={() => setDeckB((d) => ({ ...d, keyLock: !d.keyLock }))}
              onCyclePitchRange={() =>
                setDeckB((d) => ({
                  ...d,
                  pitchRange: d.pitchRange === 8 ? 16 : d.pitchRange === 16 ? 50 : 8,
                }))
              }
              onToggleLoop={() => handleToggleLoop('deckB')}
              onLoopHalve={() =>
                setDeckB((d) => ({
                  ...d,
                  loopLengthBeats: Math.max(0.125, d.loopLengthBeats / 2),
                }))
              }
              onLoopDouble={() =>
                setDeckB((d) => ({
                  ...d,
                  loopLengthBeats: Math.min(32, d.loopLengthBeats * 2),
                }))
              }
              isCompact={isMinimalist}
            />

            {/* Performance Pads (Hot Cue, Loop, AI Stems, Sampler, FX) */}
            <PerformancePads
              deck={deckB}
              onSetPadMode={(mode) => setDeckB((d) => ({ ...d, activePadMode: mode }))}
              onHotCueTrigger={(idx) => handleHotCueTrigger('deckB', idx)}
              onHotCueClear={(idx) => handleHotCueClear('deckB', idx)}
              onLoopSelect={(beats) => handleLoopSelect('deckB', beats)}
              onStemMuteToggle={(stem) => handleStemMuteToggle('deckB', stem)}
              onStemVolumeChange={(stem, val) => handleStemVolumeChange('deckB', stem, val)}
              onTriggerSampler={(type) => audioEngine.triggerSamplerSound(type)}
              onToggleFx={(fx) => {
                const active = !deckB.fx[fx].active;
                setDeckB((d) => ({
                  ...d,
                  fx: { ...d.fx, [fx]: { ...d.fx[fx], active } },
                }));
                if (fx === 'echo') audioEngine.setEcho('deckB', active, 0.6, 0.375);
                if (fx === 'reverb') audioEngine.setReverb('deckB', active, 0.7);
              }}
              onBeatRoll={(len) => {
                handleLoopSelect('deckB', len);
              }}
              isCompact={isMinimalist}
            />
          </div>
        </div>
      )}

      {/* Horizontal Splitter between Performance Decks and Bottom Browser */}
      {browserViewMode !== 'maximized' && browserViewMode !== 'hidden' && (
        <SplitterBar
          orientation="horizontal"
          isDragging={activeSplitter === 'browser-height'}
          onMouseDown={handleBrowserSplitterMouseDown}
          onTouchStart={handleBrowserSplitterTouchStart}
          onDoubleClick={() => handleResetSplitter('browser-height')}
          onReset={() => handleResetSplitter('browser-height')}
          label="Trascina in verticale per l'altezza del Browser dei Brani • Doppio click per default (175px)"
          quickActions={[
            {
              label: '120px',
              title: 'Ultra Compatto (iPad)',
              onClick: () => setPanelDimensions((prev) => ({ ...prev, browserHeight: 120 })),
              active: panelDimensions.browserHeight === 120,
            },
            {
              label: '175px',
              title: 'Default Bilanciato',
              onClick: () => setPanelDimensions((prev) => ({ ...prev, browserHeight: 175 })),
              active: panelDimensions.browserHeight === 175,
            },
            {
              label: '280px',
              title: 'Esteso',
              onClick: () => setPanelDimensions((prev) => ({ ...prev, browserHeight: 280 })),
              active: panelDimensions.browserHeight === 280,
            },
          ]}
        />
      )}

      {/* Bottom Track Browser and Crates */}
      <TrackBrowser
        tracks={tracks}
        height={panelDimensions.browserHeight}
        sidebarWidth={panelDimensions.browserSidebarWidth}
        onSidebarWidthChange={(w) =>
          setPanelDimensions((prev) => ({ ...prev, browserSidebarWidth: w }))
        }
        onLoadTrack={handleLoadTrack}
        onAddCustomTrack={(newTrack) => {
          setTracks((prev) => [newTrack, ...prev]);
        }}
        onAddMultipleTracks={(newTracks) => {
          setTracks((prev) => [...newTracks, ...prev]);
        }}
        onUpdateTracksOrder={(reordered) => {
          setTracks(reordered);
        }}
        onOpenTrackAnalysis={() => setShowTrackAnalyzerModal(true)}
        isQuad={layout === 'mac-quad'}
        activeDeckTrack={(activeDeckId === 'deckA' ? deckA : deckB).track}
        activeDeckId={activeDeckId}
        playedTrackIds={playedTrackIds}
        onTriggerAutoMix={() => handleExecuteAutoMix()}
        onStartRecording={handleStartRecording}
        onStopRecording={handleStopRecording}
        isRecording={mixer.isRecording}
        onOpenKeyboardShortcuts={() => setShowKeyboardShortcutsModal(true)}
        djMode={djMode}
        browserViewMode={browserViewMode}
        onSetBrowserViewMode={setBrowserViewMode}
        onDragTrackStart={(track) => setDraggedTrack(track)}
        onDragTrackEnd={() => {
          setDraggedTrack(null);
          setDragOverDeckId(null);
        }}
      />

      {/* Restore Track Browser Bar (Visible only when browser is completely hidden) */}
      {browserViewMode === 'hidden' && (
        <div className="bg-[#0e1017] border-t border-[#1f2538] px-4 py-1.5 flex items-center justify-between text-xs select-none">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-slate-300 font-medium">Libreria Tracce Nascosta (Massimo Focus Performance Live sui Deck)</span>
          </div>
          <button
            onClick={() => setBrowserViewMode('standard')}
            className="flex items-center gap-1.5 px-3 py-1 rounded bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs transition active:scale-95 cursor-pointer shadow-sm"
            title="Mostra la libreria delle tracce [B]"
          >
            <Folder className="w-3.5 h-3.5" />
            <span>MOSTRA LIBRERIA TRACCE [B]</span>
          </button>
        </div>
      )}

      {/* AI Assistant Modal (Gemini AutoMix, Harmonizer, DJ Drops, Setlist Curator) */}
      <AiAssistantModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        deckA={deckA}
        deckB={deckB}
        library={tracks}
        onExecuteAutoMix={handleExecuteAutoMix}
        onLoadTrackToDeck={(deckId, track) => handleLoadTrack(deckId, track)}
      />

      {/* AI Dynamic FX & Macro Console */}
      <AiDynamicFxRack
        deckA={deckA}
        deckB={deckB}
        isOpen={showDynamicFxModal}
        onClose={() => setShowDynamicFxModal(false)}
        onDeckFxChange={(deckId, fxState) => {
          setDeckById(deckId, (d) => ({ ...d, fx: { ...d.fx, ...fxState } }));
        }}
      />

      {/* AI Musical Analysis & Harmonizer Modal */}
      <AiTrackAnalyzerModal
        isOpen={showTrackAnalyzerModal}
        onClose={() => setShowTrackAnalyzerModal(false)}
        tracks={tracks}
        onSetHotCuesFromStructure={handleSetHotCuesFromStructure}
        onLoadTrackToDeck={(deckId, track) => handleLoadTrack(deckId, track)}
      />

      {/* Interactive DJ Manual & Academy Modal */}
      <InteractiveDjManualModal
        isOpen={showManualModal}
        onClose={() => setShowManualModal(false)}
        onRunInteractiveExercise={handleRunInteractiveExercise}
      />

      {/* Automatic Hardware Detection & Sound Diffusion Matrix Modal */}
      <AudioHardwareModal
        isOpen={showHardwareModal}
        onClose={() => setShowHardwareModal(false)}
        devices={hardwareDevices}
        routingMode={mixer.audioRoutingMode}
        onRoutingModeChange={handleRoutingModeChange}
        masterDeviceId={mixer.masterAudioDeviceId}
        onMasterDeviceChange={handleMasterDeviceChange}
        cueDeviceId={mixer.cueAudioDeviceId}
        onCueDeviceChange={handleCueDeviceChange}
        headphoneVolume={mixer.headphoneVolume}
        onHeadphoneVolumeChange={handleHeadphoneVolumeChange}
        headphoneCueMix={mixer.headphoneCueMix}
        onHeadphoneCueMixChange={handleHeadphoneCueMixChange}
        masterCue={mixer.masterCue}
        onToggleMasterCue={handleToggleMasterCue}
        splitCue={mixer.splitCue}
        onToggleSplitCue={handleToggleSplitCue}
        masterVuLeft={mixer.masterVuLeft}
        masterVuRight={mixer.masterVuRight}
        cueVuLeft={mixer.cueVuLeft}
        cueVuRight={mixer.cueVuRight}
      />

      {/* Floating Automatic Hardware Recognition Toast Banner */}
      {hardwareToast && (
        <div
          className="fixed top-14 right-3 sm:right-6 z-50 bg-[#141824] border-2 rounded-xl shadow-2xl p-3 max-w-sm sm:max-w-md animate-in fade-in slide-in-from-top-4 flex items-start gap-3 select-none"
          style={{ borderColor: `${hardwareToast.brandColor}99` }}
        >
          <div
            className="p-2 rounded-lg shrink-0 mt-0.5 shadow-md flex items-center justify-center"
            style={{
              backgroundColor: `${hardwareToast.brandColor}25`,
              color: hardwareToast.brandColor,
            }}
          >
            <Cable className="w-5 h-5 animate-pulse" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1 mb-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span
                  className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border"
                  style={{
                    backgroundColor: `${hardwareToast.brandColor}20`,
                    borderColor: `${hardwareToast.brandColor}60`,
                    color: hardwareToast.brandColor,
                  }}
                >
                  MARCA: {hardwareToast.brand.toUpperCase()}
                </span>
                <span
                  className={`text-[9px] font-mono px-1.5 py-0.5 rounded border font-bold ${
                    hardwareToast.action === 'connected'
                      ? 'bg-emerald-950 border-emerald-500/60 text-emerald-300'
                      : 'bg-rose-950 border-rose-500/60 text-rose-300'
                  }`}
                >
                  {hardwareToast.action === 'connected' ? '● COLLEGATO & RICONOSCIUTO' : '○ SCOLLEGATO'}
                </span>
              </div>
              <button
                onClick={() => setHardwareToast(null)}
                className="text-slate-400 hover:text-white text-xs px-1"
              >
                ✕
              </button>
            </div>

            <div className="font-bold text-white text-xs truncate">
              {hardwareToast.name}
            </div>
            <div className="text-[11px] text-slate-300 mt-0.5">
              {hardwareToast.categoryLabel}
            </div>

            <div className="text-[10px] text-slate-400 font-mono mt-1 flex items-center gap-2">
              <span>
                {hardwareToast.kind === 'audioinput'
                  ? 'Entrata (IN)'
                  : hardwareToast.kind === 'midi_controller'
                  ? 'Superficie MIDI'
                  : 'Uscita Diffusione (OUT)'}
              </span>
              <span>• {hardwareToast.channels} Canali I/O</span>
              <span>• Latenza: {hardwareToast.latencyMs} ms</span>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <button
                onClick={() => {
                  setShowHardwareModal(true);
                  setHardwareToast(null);
                }}
                className="px-2.5 py-1 rounded bg-[#21283c] hover:bg-[#2b3550] border border-[#3b476b] text-cyan-300 text-[10px] font-mono font-bold transition flex items-center gap-1 active:scale-95"
              >
                <span>CONFIGURA MATRICE ROUTING</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Practice Guide Toast Banner */}
      {exerciseNotification && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-[#161a28] border border-cyan-400/80 px-4 py-2.5 rounded-xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2 text-xs">
          <div className="p-1 rounded-md bg-cyan-950 text-cyan-400 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block animate-ping" />
          </div>
          <span className="font-bold text-white tracking-wide">
            {exerciseNotification}
          </span>
          <button
            onClick={() => setExerciseNotification(null)}
            className="text-slate-400 hover:text-white ml-2 text-sm font-bold"
          >
            ✕
          </button>
        </div>
      )}

      {/* Keyboard Transport Mapping & Shortcuts Modal */}
      <KeyboardMappingModal
        isOpen={showKeyboardShortcutsModal}
        onClose={() => setShowKeyboardShortcutsModal(false)}
        activeDeckId={activeDeckId}
        onSelectDeck={setActiveDeckId}
      />

      {/* Web MIDI DJ Controller & Hardware Mappings Modal */}
      <WebMidiConfigModal
        isOpen={showMidiModal}
        onClose={() => setShowMidiModal(false)}
      />

      {/* Intro Presentation Screen (Before entering the app) */}
      {!hasEntered && (
        <PresentationScreen
          onEnter={() => {
            audioEngine.init();
            setHasEntered(true);
          }}
        />
      )}

      {/* Reset Dimensions Toast */}
      {resetToast && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-cyan-950/95 border-2 border-cyan-400 text-cyan-100 text-xs font-mono font-bold shadow-2xl flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom-3">
          <RotateCcw className="w-4 h-4 text-cyan-400 animate-spin" />
          <span>{resetToast}</span>
        </div>
      )}
    </div>
  );
}
