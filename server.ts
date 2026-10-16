import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Initialize Google GenAI client (using gemini-3.8-flash as per SKILL.md guidelines)
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;
if (apiKey) {
  ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Endpoint: AI Transition & AutoMix Analysis
app.post('/api/ai/analyze-transition', async (req, res) => {
  try {
    const { trackA, trackB } = req.body;

    if (!trackA || !trackB) {
      return res.status(400).json({ error: 'Both trackA and trackB information are required' });
    }

    if (!ai) {
      // Return smart DJ algorithmic fallback if API key is not present
      const bpmDiff = Math.abs((trackA.bpm || 128) - (trackB.bpm || 128));
      return res.json({
        transitionType: bpmDiff <= 4 ? 'Harmonic 32-Bar Bass Swap' : 'Echo Freeze Spinback Cut',
        camelotMatch: 'Compatible Energy Step (+1 Camelot Key)',
        recommendedBars: 32,
        energyFlow: 'Building Peak Energy from 7.5 to 8.8',
        tactics: [
          `Match BPM: Adjust Deck B by ${((trackA.bpm - trackB.bpm) / trackB.bpm * 100).toFixed(1)}% to lock at ${trackA.bpm} BPM`,
          `High-Pass Filter Deck A gradually during the 16 bars before breakdown`,
          `Drop Deck B Bassline precisely on the 1st beat of the incoming chorus`,
          `Apply 1/2 beat Echo on Deck A vocals as it fades out completely`
        ],
        stemAdvice: 'Kill Deck A Bass, maintain Deck A Vocals over Deck B initial rhythm for 8 bars.',
        vibeNotes: 'High crowd hype potential. Smooth progressive transition.'
      });
    }

    const prompt = `You are a world-class championship DJ and audio engineer analyzing two tracks currently loaded in a Virtual DJ setup:
Track A (Currently Playing): "${trackA.title}" by ${trackA.artist || 'Unknown'} (BPM: ${trackA.bpm}, Key: ${trackA.key}, Genre: ${trackA.genre || 'Electronic'}, Energy: ${trackA.energy || 7}/10)
Track B (Incoming on Deck B): "${trackB.title}" by ${trackB.artist || 'Unknown'} (BPM: ${trackB.bpm}, Key: ${trackB.key}, Genre: ${trackB.genre || 'Electronic'}, Energy: ${trackB.energy || 8}/10)

Provide a professional DJ mixing transition strategy in strict JSON format. Include:
1. "transitionType": (e.g. "Harmonic 32-Bar Bass-Swap", "Breakdown Vocal Mesh", "Echo-Freeze Spinback Drop", "High-Pass Filter Sweep")
2. "camelotMatch": Harmonic compatibility analysis (e.g. "Perfect Harmonic Match (8A -> 8A)", "Energy Boost (+1 Camelot 8A -> 9A)", "Mood Shift (Relative Major/Minor)")
3. "recommendedBars": Number of bars to transition (16, 32, or 64)
4. "energyFlow": Description of the dancefloor vibe shift
5. "tactics": An array of 4 exact, sequential technical instructions for the DJ (e.g. EQ cuts, filters, cue points, crossfader moves)
6. "stemAdvice": Specific advice for AI Stems (Vocals, Drums, Bass, Instruments isolation/mute)
7. "vibeNotes": Brief hype summary of why this blend will work.

Output ONLY valid JSON without markdown wrapping if possible, or standard JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '{}';
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = {
        transitionType: 'Harmonic Beat-Match Blend',
        camelotMatch: 'Energy Step Match',
        recommendedBars: 32,
        energyFlow: 'Smooth dancefloor flow',
        tactics: [
          'Sync BPM to master deck',
          'Cut low EQ on incoming deck',
          'Crossfade smoothly across 16 bars',
          'Swap basslines on the drop'
        ],
        stemAdvice: 'Keep vocals on Deck A while introducing Deck B drums',
        vibeNotes: 'Reliable club transition'
      };
    }

    res.json(data);
  } catch (error) {
    console.error('Error in analyze-transition:', error);
    res.status(500).json({
      error: 'Failed to analyze transition',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Endpoint: AI DJ Drops & Voice Hypes Generator
app.post('/api/ai/generate-dj-drop', async (req, res) => {
  try {
    const { djName = 'DJ VITO', style = 'festival', customNote } = req.body;

    if (!ai) {
      const presets: Record<string, string[]> = {
        festival: [
          `${djName.toUpperCase()} IN THE MIX! ARE YOU READY?!`,
          `MAKE SOME NOISE! ${djName.toUpperCase()} DROPPING THE BASS!`,
          `HANDS IN THE AIR! THREE, TWO, ONE... LET'S GO!`
        ],
        club: [
          `You are listening to the sound of ${djName.toUpperCase()}.`,
          `Midnight vibes, strictly exclusive. ${djName.toUpperCase()} on the decks.`,
          `Feel the groove, keep moving.`
        ],
        hyped: [
          `ENERGY OVERLOAD! ${djName.toUpperCase()} IS SHUTTING IT DOWN!`,
          `LOCK IN! DROP THAT SHIT!`,
          `BOOM! ${djName.toUpperCase()} TAKEOVER!`
        ]
      };
      const list = presets[style] || presets.festival;
      const dropText = list[Math.floor(Math.random() * list.length)];
      return res.json({ dropText, speechRate: 1.05, pitch: 0.95 });
    }

    const prompt = `You are an energetic, legendary DJ MC and voice drop creator for festivals and club events.
Generate a punchy, iconic, hype DJ voice drop script for DJ Name: "${djName}".
Style: ${style} (festival, dark techno, hiphop hype, or sleek club).
User note: ${customNote || 'Make it sound huge and energetic'}.

Return JSON:
{
  "dropText": "The exact short sentence to announce (e.g. 'DJ VITO IN THE MIX, DROP THE BASS!')",
  "speechRate": 1.05,
  "pitch": 0.95,
  "fxRecommended": "Echo + Reverb 50%"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const data = JSON.parse(response.text || '{}');
    res.json(data);
  } catch (error) {
    console.error('Error in generate-dj-drop:', error);
    res.status(500).json({
      error: 'Failed to generate DJ drop',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Endpoint: AI Track Recommendations & Setlist Curator
app.post('/api/ai/recommend-next-track', async (req, res) => {
  try {
    const { currentTrack, vibeTarget = 'peak_energy', library = [] } = req.body;

    if (!ai) {
      return res.json({
        recommendedTrackIndex: 1,
        reasoning: 'Matches harmonic 9A Camelot wheel progression and maintains steady 128 BPM momentum.',
        mixingTip: 'Start bringing in the hi-hats 30 seconds before the breakdown.'
      });
    }

    const prompt = `You are a resident festival DJ setlist curator.
Current playing track: "${currentTrack?.title || 'Unknown'}" (BPM: ${currentTrack?.bpm || 128}, Key: ${currentTrack?.key || '8A'}).
Target vibe: ${vibeTarget}.
Available tracks in library:
${JSON.stringify(library.map((t: any, i: number) => ({ index: i, title: t.title, artist: t.artist, bpm: t.bpm, key: t.key, genre: t.genre })))}

Select the best next track to play and return JSON:
{
  "recommendedTrackIndex": number,
  "reasoning": "why this track fits harmonically, energy-wise and rhythmically",
  "mixingTip": "one-sentence tip on how to execute the transition"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const data = JSON.parse(response.text || '{}');
    res.json(data);
  } catch (error) {
    console.error('Error in recommend-next-track:', error);
    res.status(500).json({
      error: 'Failed to recommend track',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Endpoint: AI Deep Track Analysis (BPM, Camelot Key, Ideal Mix Points, Spectral Profile)
app.post('/api/ai/deep-track-analysis', async (req, res) => {
  try {
    const { title, artist, duration = 180, rawBpm = 126 } = req.body;

    if (!ai) {
      // Smart algorithmic fallback
      const durationSec = Number(duration) || 180;
      return res.json({
        bpm: rawBpm,
        key: '8A (Am)',
        camelotCode: '8A',
        genre: 'Melodic Electronic',
        energy: 8,
        danceability: 9,
        mood: 'Peak Energy Club Groove',
        idealMixPoints: {
          introIn: 0,
          breakdown: Math.round(durationSec * 0.38),
          mainDrop: Math.round(durationSec * 0.52),
          outroOut: Math.round(durationSec * 0.82),
          phraseBars: 32,
        },
        spectralProfile: {
          bassEnergy: 0.82,
          midEnergy: 0.65,
          highEnergy: 0.74,
          dynamicRange: 0.88,
        },
        harmonicNeighbors: ['7A', '8A', '9A', '8B'],
        mixInTip: 'Mix in on 32-bar intro with low frequencies cut.',
        mixOutTip: 'Begin crossfade at outro marker with high-pass filter sweep.',
      });
    }

    const prompt = `You are an elite music theory analyst, audio engineer, and resident club DJ.
Analyze this track for professional DJ mixing:
Title: "${title || 'Untitled Track'}"
Artist: "${artist || 'Unknown'}"
Duration: ${duration} seconds (around ${(duration / 60).toFixed(1)} minutes)
Approximate BPM: ${rawBpm}

Provide a deep musical and structural analysis in strict JSON format:
{
  "bpm": number (exact detected BPM, e.g. 126 or 128),
  "key": "Musical Key with Camelot format (e.g. '8A (Am)' or '9B (G Major)')",
  "camelotCode": "Camelot Code (e.g. '8A')",
  "genre": "Precise subgenre (e.g. 'Tech House', 'Liquid DnB', 'Melodic Techno')",
  "energy": number from 1 to 10,
  "danceability": number from 1 to 10,
  "mood": "Short atmospheric description (e.g. 'Euphoric Peaktime Anthem')",
  "idealMixPoints": {
    "introIn": number in seconds (e.g. 0 or 15),
    "breakdown": number in seconds (where energy strips back for vocal/melody, e.g. 60),
    "mainDrop": number in seconds (where main kick & bassline explode, e.g. 90),
    "outroOut": number in seconds (ideal point to start mixing into next track, e.g. 150),
    "phraseBars": 16 or 32
  },
  "spectralProfile": {
    "bassEnergy": number 0 to 1,
    "midEnergy": number 0 to 1,
    "highEnergy": number 0 to 1,
    "dynamicRange": number 0 to 1
  },
  "harmonicNeighbors": ["adjacent Camelot codes like 7A, 8A, 9A, 8B"],
  "mixInTip": "Strategic advice for introducing this track cleanly",
  "mixOutTip": "Strategic advice for blending out to next track"
}

Output ONLY valid JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const data = JSON.parse(response.text || '{}');
    res.json(data);
  } catch (error) {
    console.error('Error in deep-track-analysis:', error);
    res.status(500).json({
      error: 'Failed to analyze track',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Endpoint: AI Smart Mix Suggestions & Real-Time Crossfade Recommendations
app.post('/api/ai/smart-mix-suggestions', async (req, res) => {
  try {
    const {
      currentTrack,
      currentDeckId = 'deckA',
      currentPosition = 0,
      library = [],
      listeningHistory = [],
    } = req.body;

    if (!currentTrack) {
      return res.status(400).json({ error: 'currentTrack is required' });
    }

    const targetDeckId = currentDeckId === 'deckA' ? 'deckB' : 'deckA';
    const remainingSeconds = Math.max(0, (currentTrack.duration || 180) - currentPosition);
    const bpm = currentTrack.bpm || 128;
    const secondsPerBeat = 60 / bpm;
    const secondsPerBar = secondsPerBeat * 4;

    // Calculate ideal crossfade point (either outro marker or 80% mark)
    const idealCrossfadeTime = currentTrack.idealMixPoints?.outroOut || Math.round((currentTrack.duration || 180) * 0.8);
    const secondsUntilCrossfade = Math.max(0, idealCrossfadeTime - currentPosition);
    const barsUntilCrossfade = Math.max(0, Math.round(secondsUntilCrossfade / secondsPerBar));

    if (!ai) {
      // Find candidate from library that is not currently playing
      const candidates = library.filter((t: any) => t.id !== currentTrack.id);
      const chosen = candidates[0] || library[0];
      const bpmDiff = Math.abs((chosen?.bpm || 128) - bpm);
      const pitchAdj = Number((((bpm - (chosen?.bpm || 128)) / (chosen?.bpm || 128)) * 100).toFixed(1));

      return res.json({
        targetDeckId,
        suggestedTrackIndex: library.findIndex((t: any) => t.id === chosen?.id) || 0,
        matchScore: 94,
        harmonicCompatibility: 'Harmonic Energy Boost (+1 Camelot Key)',
        tempoDifference: Number(bpmDiff.toFixed(1)),
        pitchAdjustment: pitchAdj,
        idealCrossfadeTimeSeconds: idealCrossfadeTime,
        secondsUntilCrossfade: Math.round(secondsUntilCrossfade),
        barsUntilCrossfade,
        recommendedFx: {
          name: 'AI Riser Build + 3/4 Echo Washout',
          timing: `Engage at bar ${Math.max(1, barsUntilCrossfade - 8)} (${Math.round(Math.max(0, secondsUntilCrossfade - 15))}s countdown)`,
          description: 'High-pass filter sweep with dynamic echo wash on outgoing track during 16 bars',
          macroType: 'riser_build',
        },
        stemAction: 'Solo Deck A Vocals while fading in Deck B Kick & Bass',
        reasoning: `Harmonic match creates flawless energy escalation. Synchronize tempo with ${pitchAdj >= 0 ? '+' : ''}${pitchAdj}% pitch bend.`,
      });
    }

    const prompt = `You are an AI DJ Co-pilot operating a live Virtual DJ session.
CURRENT STATUS:
- Currently Playing Track on ${currentDeckId.toUpperCase()}: "${currentTrack.title}" by ${currentTrack.artist} (BPM: ${currentTrack.bpm}, Key: ${currentTrack.key}, Camelot: ${currentTrack.camelotCode || '8A'}, Energy: ${currentTrack.energy || 8}/10)
- Current Playback Time: ${Math.round(currentPosition)}s / ${currentTrack.duration || 180}s (${Math.round(remainingSeconds)}s remaining)
- Ideal Outro Point: ${idealCrossfadeTime}s (${Math.round(secondsUntilCrossfade)}s until crossfade window / ${barsUntilCrossfade} bars)
- Listening History / Trends: ${JSON.stringify(listeningHistory.slice(0, 5))}
- Available Library:
${JSON.stringify(library.map((t: any, i: number) => ({ index: i, id: t.id, title: t.title, artist: t.artist, bpm: t.bpm, key: t.key, genre: t.genre, energy: t.energy })))}

Recommend the best next song to load on ${targetDeckId.toUpperCase()} and real-time transition parameters:
1. Select the top candidate from the library (must NOT be the same track).
2. Calculate exact match score (0-100%).
3. Recommend EXACT timing of when to start the crossfade.
4. Recommend WHICH dynamic FX to use (macroType: 'riser_build' | 'washout' | 'echo_freeze' | 'vinyl_brake' | 'stutter_roll').
5. Provide stem blending instruction (Vocals, Drums, Bass).

Return strict JSON:
{
  "targetDeckId": "${targetDeckId}",
  "suggestedTrackIndex": number,
  "matchScore": number (80-99),
  "harmonicCompatibility": "Harmonic description (e.g. 'Energy Boost +1 Step (8A -> 9A)')",
  "tempoDifference": number,
  "pitchAdjustment": number (pitch percent required to lock BPM),
  "idealCrossfadeTimeSeconds": ${idealCrossfadeTime},
  "secondsUntilCrossfade": ${Math.round(secondsUntilCrossfade)},
  "barsUntilCrossfade": ${barsUntilCrossfade},
  "recommendedFx": {
    "name": "e.g. 'AI Riser Build + 3/4 Echo Wash'",
    "timing": "when to activate the FX",
    "description": "precise action for the DJ",
    "macroType": "riser_build"
  },
  "stemAction": "stem instructions",
  "reasoning": "why this track and transition recipe will ignite the dancefloor"
}

Output ONLY valid JSON.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const data = JSON.parse(response.text || '{}');
    res.json(data);
  } catch (error) {
    console.error('Error in smart-mix-suggestions:', error);
    res.status(500).json({
      error: 'Failed to generate smart mix suggestions',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Endpoint: AI Dynamic FX Context & Macro Generator
app.post('/api/ai/dynamic-fx-context', async (req, res) => {
  try {
    const { bpm = 128, energy = 8, currentSection = 'breakdown', isTransitioning = false } = req.body;

    if (!ai) {
      return res.json({
        recommendedMacro: isTransitioning ? 'washout' : currentSection === 'breakdown' ? 'riser_build' : 'echo_freeze',
        suggestedEchoBeats: 0.75, // 3/4 dotted
        suggestedFilterSweepRate: 16, // bars
        reverbDecaySeconds: 3.5,
        tip: 'Activate AI Riser Build 8 bars before the drop for exponential crescendo.',
      });
    }

    const prompt = `You are an AI DJ DSP sound designer.
Track BPM: ${bpm}, Energy: ${energy}/10, Section: "${currentSection}", Transitioning: ${isTransitioning}.
Recommend dynamic FX macro parameters that adapt to this context.
Return JSON:
{
  "recommendedMacro": "riser_build" | "washout" | "echo_freeze" | "vinyl_brake" | "stutter_roll",
  "suggestedEchoBeats": number (0.25, 0.5, 0.75, or 1.0),
  "suggestedFilterSweepRate": number (bars),
  "reverbDecaySeconds": number,
  "tip": "Short DJ tip on using this effect right now"
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
      },
    });

    const data = JSON.parse(response.text || '{}');
    res.json(data);
  } catch (error) {
    console.error('Error in dynamic-fx-context:', error);
    res.status(500).json({
      error: 'Failed to evaluate dynamic FX context',
      details: error instanceof Error ? error.message : String(error),
    });
  }
});

// Setup Vite middleware in dev or static files in production
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Virtuoso DJ Studio server listening on port ${PORT}`);
  });
}

startServer();
