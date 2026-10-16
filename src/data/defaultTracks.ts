import { Track } from '../types/dj';
import { audioEngine } from '../audio/audioEngine';

// Generates pseudo waveform peak array for visual display
function generateWaveformPeaks(seed: number, length: number = 250): number[] {
  const peaks: number[] = [];
  for (let i = 0; i < length; i++) {
    const t = i / length;
    // Energy build-up and drop structure
    const section = Math.sin(t * Math.PI * 4);
    const noise = Math.sin(i * seed * 0.3) * 0.25;
    const base = 0.35 + 0.45 * Math.abs(section) + noise;
    peaks.push(Math.max(0.1, Math.min(1.0, base)));
  }
  return peaks;
}

export interface DefaultTrackDef extends Track {
  synthStyle: 'house' | 'electro' | 'techno' | 'dnb' | 'chill' | 'trap';
}

export const DEFAULT_TRACKS: DefaultTrackDef[] = [
  {
    id: 'track-1',
    title: 'Neon Skyline',
    artist: 'Cyber Pulse',
    bpm: 126,
    key: '8A (Am)',
    camelotCode: '8A',
    duration: 180,
    genre: 'Melodic House',
    energy: 8,
    danceability: 9,
    mood: 'Euphoric Progressive Peak',
    color: '#06b6d4', // Cyan
    cuePoints: [0, 15.2, 30.5, 68.5, 106.6, 152.4],
    idealMixPoints: {
      introIn: 0,
      breakdown: 68.5,
      mainDrop: 106.6,
      outroOut: 152.4,
      phraseBars: 32,
    },
    spectralProfile: {
      bassEnergy: 0.85,
      midEnergy: 0.68,
      highEnergy: 0.72,
      dynamicRange: 0.82,
    },
    harmonicNeighbors: ['7A', '8A', '9A', '8B'],
    waveformData: generateWaveformPeaks(1.4, 250),
    synthStyle: 'house',
  },
  {
    id: 'track-2',
    title: 'Cyber Bassline',
    artist: 'HyperDrive',
    bpm: 128,
    key: '9A (Em)',
    camelotCode: '9A',
    duration: 195,
    genre: 'Peak Electro Tech',
    energy: 9,
    danceability: 9,
    mood: 'High Octane Club Weapon',
    color: '#f97316', // Orange
    cuePoints: [0, 15.0, 30.0, 75.0, 112.5, 165.0],
    idealMixPoints: {
      introIn: 0,
      breakdown: 75.0,
      mainDrop: 112.5,
      outroOut: 165.0,
      phraseBars: 32,
    },
    spectralProfile: {
      bassEnergy: 0.95,
      midEnergy: 0.74,
      highEnergy: 0.81,
      dynamicRange: 0.9,
    },
    harmonicNeighbors: ['8A', '9A', '10A', '9B'],
    waveformData: generateWaveformPeaks(2.1, 250),
    synthStyle: 'electro',
  },
  {
    id: 'track-3',
    title: 'Ibiza Sunset Groove',
    artist: 'Solar Flare',
    bpm: 124,
    key: '7A (Dm)',
    camelotCode: '7A',
    duration: 210,
    genre: 'Deep Afro House',
    energy: 7,
    danceability: 8,
    mood: 'Warm Melodic Sunset',
    color: '#06b6d4', // Cyan
    cuePoints: [0, 15.5, 31.0, 77.4, 116.1, 178.0],
    idealMixPoints: {
      introIn: 0,
      breakdown: 77.4,
      mainDrop: 116.1,
      outroOut: 178.0,
      phraseBars: 32,
    },
    spectralProfile: {
      bassEnergy: 0.78,
      midEnergy: 0.82,
      highEnergy: 0.65,
      dynamicRange: 0.76,
    },
    harmonicNeighbors: ['6A', '7A', '8A', '7B'],
    waveformData: generateWaveformPeaks(3.7, 250),
    synthStyle: 'chill',
  },
  {
    id: 'track-4',
    title: 'Tokyo Velocity',
    artist: 'Kensei Beats',
    bpm: 140,
    key: '4A (Fm)',
    camelotCode: '4A',
    duration: 165,
    genre: 'Future Trap',
    energy: 9,
    danceability: 9,
    mood: 'Heavy 808 Festival Trap',
    color: '#a855f7', // Purple
    cuePoints: [0, 13.7, 27.4, 54.8, 82.2, 137.0],
    idealMixPoints: {
      introIn: 0,
      breakdown: 54.8,
      mainDrop: 82.2,
      outroOut: 137.0,
      phraseBars: 16,
    },
    spectralProfile: {
      bassEnergy: 0.98,
      midEnergy: 0.6,
      highEnergy: 0.85,
      dynamicRange: 0.94,
    },
    harmonicNeighbors: ['3A', '4A', '5A', '4B'],
    waveformData: generateWaveformPeaks(4.2, 250),
    synthStyle: 'trap',
  },
  {
    id: 'track-5',
    title: 'Solar Storm VIP',
    artist: 'Vortex Protocol',
    bpm: 174,
    key: '11A (F#m)',
    camelotCode: '11A',
    duration: 200,
    genre: 'Liquid Neuro DnB',
    energy: 10,
    danceability: 9,
    mood: 'Fast Heavy Neurofunk',
    color: '#ec4899', // Pink
    cuePoints: [0, 11.0, 22.0, 66.2, 99.3, 165.5],
    idealMixPoints: {
      introIn: 0,
      breakdown: 66.2,
      mainDrop: 99.3,
      outroOut: 165.5,
      phraseBars: 32,
    },
    spectralProfile: {
      bassEnergy: 0.92,
      midEnergy: 0.72,
      highEnergy: 0.88,
      dynamicRange: 0.91,
    },
    harmonicNeighbors: ['10A', '11A', '12A', '11B'],
    waveformData: generateWaveformPeaks(5.9, 250),
    synthStyle: 'dnb',
  },
  {
    id: 'track-6',
    title: 'Dark Warehouse Acid',
    artist: 'Klangwerk',
    bpm: 132,
    key: '8A (Am)',
    camelotCode: '8A',
    duration: 220,
    genre: 'Peak Time Techno',
    energy: 9,
    danceability: 8,
    mood: 'Hypnotic Acid Rave',
    color: '#eab308', // Amber
    cuePoints: [0, 14.5, 29.1, 87.3, 116.4, 189.0],
    idealMixPoints: {
      introIn: 0,
      breakdown: 87.3,
      mainDrop: 116.4,
      outroOut: 189.0,
      phraseBars: 32,
    },
    spectralProfile: {
      bassEnergy: 0.89,
      midEnergy: 0.76,
      highEnergy: 0.79,
      dynamicRange: 0.85,
    },
    harmonicNeighbors: ['7A', '8A', '9A', '8B'],
    waveformData: generateWaveformPeaks(6.3, 250),
    synthStyle: 'techno',
  },
];

// In-memory cache for synthesized audio buffers
const audioBufferCache = new Map<string, AudioBuffer>();

export async function getTrackAudioBuffer(track: DefaultTrackDef | Track): Promise<AudioBuffer> {
  if (track.audioBuffer) {
    return track.audioBuffer;
  }

  if (audioBufferCache.has(track.id)) {
    return audioBufferCache.get(track.id)!;
  }

  const def = DEFAULT_TRACKS.find((t) => t.id === track.id);
  const style = def ? def.synthStyle : 'house';
  const duration = track.duration || 120;
  const bpm = track.bpm || 128;

  const buffer = audioEngine.generateClubAudioBuffer(bpm, duration, style);
  audioBufferCache.set(track.id, buffer);
  return buffer;
}

// Decode user-imported audio file (MP3/WAV/AAC) into Track with AI Deep Analysis
export async function decodeCustomAudioFile(file: File): Promise<Track> {
  audioEngine.init();
  const ctx = audioEngine.getContext();
  if (!ctx) throw new Error('Web Audio not initialized');

  const arrayBuffer = await file.arrayBuffer();
  const audioBuffer = await ctx.decodeAudioData(arrayBuffer);

  // Analyze waveform
  const channelData = audioBuffer.getChannelData(0);
  const step = Math.floor(channelData.length / 250);
  const waveformPeaks: number[] = [];
  for (let i = 0; i < 250; i++) {
    let sum = 0;
    const start = i * step;
    for (let j = 0; j < step; j += 16) {
      sum += Math.abs(channelData[start + j] || 0);
    }
    waveformPeaks.push(Math.min(1.0, (sum / (step / 16)) * 2.5));
  }

  const duration = Math.round(audioBuffer.duration);
  const cleanTitle = file.name.replace(/\.[^/.]+$/, '');

  let aiAnalysis: any = null;
  try {
    const res = await fetch('/api/ai/deep-track-analysis', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: cleanTitle,
        duration,
        rawBpm: 126,
      }),
    });
    if (res.ok) {
      aiAnalysis = await res.json();
    }
  } catch (err) {
    console.error('AI track analysis fallback:', err);
  }

  const bpm = aiAnalysis?.bpm || 126;
  const key = aiAnalysis?.key || '8A (Am)';
  const camelotCode = aiAnalysis?.camelotCode || '8A';
  const genre = aiAnalysis?.genre || 'Custom Club Audio';
  const energy = aiAnalysis?.energy || 8;
  const idealMixPoints = aiAnalysis?.idealMixPoints || {
    introIn: 0,
    breakdown: Math.round(duration * 0.38),
    mainDrop: Math.round(duration * 0.52),
    outroOut: Math.round(duration * 0.82),
    phraseBars: 32,
  };

  const track: Track = {
    id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    title: cleanTitle,
    artist: 'User Library',
    bpm,
    key,
    camelotCode,
    duration,
    genre,
    energy,
    danceability: aiAnalysis?.danceability || 8,
    mood: aiAnalysis?.mood || 'Energetic Groove',
    color: '#06b6d4',
    cuePoints: [idealMixPoints.introIn, idealMixPoints.breakdown, idealMixPoints.mainDrop, idealMixPoints.outroOut],
    idealMixPoints,
    spectralProfile: aiAnalysis?.spectralProfile || {
      bassEnergy: 0.8,
      midEnergy: 0.7,
      highEnergy: 0.7,
      dynamicRange: 0.85,
    },
    harmonicNeighbors: aiAnalysis?.harmonicNeighbors || ['7A', '8A', '9A', '8B'],
    waveformData: waveformPeaks,
    audioBuffer,
    isCustom: true,
  };

  audioBufferCache.set(track.id, audioBuffer);
  return track;
}
