export interface TrackStructurePoints {
  introIn: number; // in seconds
  breakdown: number; // in seconds
  mainDrop: number; // in seconds
  outroOut: number; // in seconds
  phraseBars?: number; // 16 or 32
}

export interface TrackSpectralProfile {
  bassEnergy: number; // 0 to 1
  midEnergy: number; // 0 to 1
  highEnergy: number; // 0 to 1
  dynamicRange: number; // 0 to 1
}

export interface Track {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  key: string; // e.g. "8A (Am)"
  camelotCode: string; // e.g. "8A"
  duration: number; // in seconds
  genre: string;
  energy: number; // 1 to 10
  color: string;
  cuePoints?: number[];
  waveformData?: number[];
  idealMixPoints?: TrackStructurePoints;
  spectralProfile?: TrackSpectralProfile;
  harmonicNeighbors?: string[];
  danceability?: number;
  mood?: string;
  audioBuffer?: AudioBuffer;
  audioUrl?: string;
  isCustom?: boolean;
}

export interface StemState {
  vocals: number; // 0 to 1
  melody: number; // 0 to 1
  bass: number; // 0 to 1
  drums: number; // 0 to 1
  vocalsMuted: boolean;
  melodyMuted: boolean;
  bassMuted: boolean;
  drumsMuted: boolean;
}

export type PadMode = 'hotcue' | 'loop' | 'stems' | 'sampler' | 'fx';

export interface DeckFxState {
  echo: { active: boolean; wet: number; beats: number };
  flanger: { active: boolean; wet: number };
  reverb: { active: boolean; wet: number };
  roll: { active: boolean; length: number; isEngaged: boolean };
  // AI Dynamic FX
  aiAdaptive: boolean;
  aiFilterSweep: { active: boolean; intensity: number };
  aiRiserBuild: { active: boolean; progress: number };
  aiWashout: { active: boolean; wet: number };
  aiVinylBrake: { active: boolean; progress: number };
}

export interface DeckState {
  id: 'deckA' | 'deckB' | 'deckC' | 'deckD';
  deckNumber: 1 | 2 | 3 | 4;
  name: string;
  themeColor: string; // CSS neon color
  track: Track | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  bpm: number;
  originalBpm: number;
  pitchPercent: number; // e.g. -2.5% to +2.5%
  pitchRange: 8 | 16 | 50;
  keyLock: boolean;
  isSync: boolean;
  isMaster: boolean;
  cuePosition: number;
  hotCues: (number | null)[]; // 8 slots
  loopActive: boolean;
  loopStart: number;
  loopLengthBeats: number;
  slipMode: boolean;
  vinylMode: boolean;
  eqHigh: number; // dB, -15 to +15
  eqMid: number; // dB, -15 to +15
  eqLow: number; // dB, -15 to +15
  highKill: boolean;
  midKill: boolean;
  lowKill: boolean;
  filter: number; // -100 (LPF) to 0 (bypass) to +100 (HPF)
  gain: number; // 0 to 1.5
  volume: number; // 0 to 1.0
  headphoneCue: boolean;
  vuLevel: number; // 0 to 1
  stems: StemState;
  fx: DeckFxState;
  activePadMode: PadMode;
  jogAngle: number; // 0 to 360 deg
  quantize: boolean; // Magnetic Quantize active
  quantizeResolution: '1/1' | '1/2' | '1/4' | '1/8'; // Beatgrid snap resolution
  beatgridOffset: number; // Downbeat offset in seconds (beat 1.1)
}

export type AudioRoutingMode = 'multi_channel_4ch' | 'dual_device' | 'split_mono' | 'stereo_preview';

export interface MixerState {
  crossfader: number; // -1 (Deck A) to 0 (Center) to 1 (Deck B)
  crossfaderCurve: 'smooth' | 'linear' | 'scratch';
  masterVolume: number; // 0 to 1.2
  headphoneVolume: number; // 0 to 1.5
  headphoneCueMix: number; // 0 (100% Cue) to 0.5 (50/50) to 1 (100% Master)
  masterCue: boolean; // Route master mix to headphones
  splitCue: boolean; // Mono Cue Left ear, Mono Master Right ear
  boothVolume: number;
  masterVuLeft: number;
  masterVuRight: number;
  cueVuLeft: number;
  cueVuRight: number;
  audioRoutingMode: AudioRoutingMode;
  masterAudioDeviceId: string;
  cueAudioDeviceId: string;
  isRecording: boolean;
  recordedDuration: number;
  isAutoMixing: boolean;
  autoMixProgress: number; // 0 to 100%
}

export type UiLayout = 'mac-studio' | 'mac-quad' | 'ios-touch';

export type BrowserViewMode = 'standard' | 'maximized' | 'compact' | 'hidden';

export type PlatterSize = 'compact' | 'standard' | 'large' | 'maxi';

export interface PanelVisibilityState {
  waveforms: boolean;
  mixer: boolean;
  browser: BrowserViewMode;
  advisor: boolean;
}

export type DjMode = 'starter' | 'essential' | 'pro' | 'performance';

export interface DjModeConfig {
  id: DjMode;
  label: string;
  badge: string;
  tagline: string;
  description: string;
  color: string;
}

export interface AiTransitionAdvice {
  transitionType: string;
  camelotMatch: string;
  recommendedBars: number;
  energyFlow: string;
  tactics: string[];
  stemAdvice: string;
  vibeNotes: string;
}

export interface AiRealtimeMixSuggestion {
  targetDeckId: 'deckA' | 'deckB';
  suggestedTrack: Track;
  matchScore: number; // 0-100%
  harmonicCompatibility: string;
  tempoDifference: number; // in BPM
  pitchAdjustment: number; // in %
  idealCrossfadeTimeSeconds: number;
  secondsUntilCrossfade: number;
  barsUntilCrossfade: number;
  recommendedFx: {
    name: string;
    timing: string;
    description: string;
    macroType: 'riser_build' | 'washout' | 'echo_freeze' | 'vinyl_brake' | 'stutter_roll';
  };
  stemAction: string;
  reasoning: string;
}

export interface SamplerPad {
  id: string;
  name: string;
  category: 'horn' | 'voice' | 'siren' | 'laser' | 'drop' | 'scratch' | 'percussion';
  color: string;
  keyTrigger: string;
}

export interface SavedPlaylist {
  id: string;
  name: string;
  createdAt: number;
  trackIds: string[];
  trackCount: number;
  notes?: string;
}

