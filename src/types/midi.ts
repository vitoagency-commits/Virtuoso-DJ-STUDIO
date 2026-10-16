// Web MIDI API Type definitions & Controller profiles for DJ Hardware

export type MidiAction =
  | 'play_pause_deckA'
  | 'cue_deckA'
  | 'sync_deckA'
  | 'hotcue_1_deckA'
  | 'hotcue_2_deckA'
  | 'hotcue_3_deckA'
  | 'hotcue_4_deckA'
  | 'loop_in_deckA'
  | 'loop_out_deckA'
  | 'loop_auto_deckA'
  | 'jog_pitch_deckA'
  | 'jog_scratch_deckA'
  | 'tempo_fader_deckA'
  | 'volume_deckA'
  | 'eq_high_deckA'
  | 'eq_mid_deckA'
  | 'eq_low_deckA'
  | 'filter_deckA'
  | 'gain_deckA'
  | 'headphone_cue_deckA'
  | 'quantize_deckA'
  // Deck B
  | 'play_pause_deckB'
  | 'cue_deckB'
  | 'sync_deckB'
  | 'hotcue_1_deckB'
  | 'hotcue_2_deckB'
  | 'hotcue_3_deckB'
  | 'hotcue_4_deckB'
  | 'loop_in_deckB'
  | 'loop_out_deckB'
  | 'loop_auto_deckB'
  | 'jog_pitch_deckB'
  | 'jog_scratch_deckB'
  | 'tempo_fader_deckB'
  | 'volume_deckB'
  | 'eq_high_deckB'
  | 'eq_mid_deckB'
  | 'eq_low_deckB'
  | 'filter_deckB'
  | 'gain_deckB'
  | 'headphone_cue_deckB'
  | 'quantize_deckB'
  // Mixer & Master
  | 'crossfader'
  | 'master_volume'
  | 'headphone_volume'
  | 'headphone_cue_mix'
  | 'master_cue'
  | 'browser_scroll'
  | 'browser_load_deckA'
  | 'browser_load_deckB'
  | 'sampler_1'
  | 'sampler_2'
  | 'sampler_3'
  | 'sampler_4';

export interface MidiMappingRule {
  id: string;
  name: string;
  action: MidiAction;
  statusType: 'noteon' | 'noteoff' | 'cc';
  channel: number; // 0-15 (or -1 for any)
  controlNumber: number; // Note # or CC # (0-127)
  isRelative?: boolean; // For endless encoders & jog wheels
}

export interface MidiControllerProfile {
  id: string;
  name: string;
  brand: string;
  mappings: MidiMappingRule[];
}

export interface MidiActivityEvent {
  timestamp: number;
  channel: number;
  statusType: 'noteon' | 'noteoff' | 'cc' | 'pitchbend' | 'other';
  controlNumber: number;
  value: number;
  matchedAction?: string;
}

export interface MidiLearnState {
  isActive: boolean;
  targetAction: MidiAction | null;
  targetName: string | null;
}

// Preset profiles for popular controllers
export const DEFAULT_MIDI_PROFILES: MidiControllerProfile[] = [
  {
    id: 'pioneer_ddj_flx4',
    name: 'Pioneer DJ DDJ-FLX4 / DDJ-400',
    brand: 'Pioneer DJ',
    mappings: [
      // Deck A Transport
      { id: 'flx4-play-a', name: 'Play/Pause Deck 1', action: 'play_pause_deckA', statusType: 'noteon', channel: 0, controlNumber: 11 },
      { id: 'flx4-cue-a', name: 'Cue Deck 1', action: 'cue_deckA', statusType: 'noteon', channel: 0, controlNumber: 12 },
      { id: 'flx4-sync-a', name: 'Sync Deck 1', action: 'sync_deckA', statusType: 'noteon', channel: 0, controlNumber: 88 },
      { id: 'flx4-pfl-a', name: 'Headphone Cue 1', action: 'headphone_cue_deckA', statusType: 'noteon', channel: 0, controlNumber: 84 },
      // Deck A EQ & Levels
      { id: 'flx4-eq-hi-a', name: 'EQ High Deck 1', action: 'eq_high_deckA', statusType: 'cc', channel: 0, controlNumber: 7 },
      { id: 'flx4-eq-mid-a', name: 'EQ Mid Deck 1', action: 'eq_mid_deckA', statusType: 'cc', channel: 0, controlNumber: 11 },
      { id: 'flx4-eq-low-a', name: 'EQ Low Deck 1', action: 'eq_low_deckA', statusType: 'cc', channel: 0, controlNumber: 15 },
      { id: 'flx4-filter-a', name: 'Filter Deck 1', action: 'filter_deckA', statusType: 'cc', channel: 0, controlNumber: 23 },
      { id: 'flx4-gain-a', name: 'Trim / Gain 1', action: 'gain_deckA', statusType: 'cc', channel: 0, controlNumber: 4 },
      { id: 'flx4-vol-a', name: 'Channel Fader 1', action: 'volume_deckA', statusType: 'cc', channel: 0, controlNumber: 19 },
      { id: 'flx4-tempo-a', name: 'Pitch / Tempo 1', action: 'tempo_fader_deckA', statusType: 'cc', channel: 0, controlNumber: 0 },
      { id: 'flx4-jog-a', name: 'Jog Wheel 1', action: 'jog_scratch_deckA', statusType: 'cc', channel: 0, controlNumber: 33, isRelative: true },
      // Deck A Hot Cues
      { id: 'flx4-pad1-a', name: 'Hot Cue 1 Deck 1', action: 'hotcue_1_deckA', statusType: 'noteon', channel: 7, controlNumber: 0 },
      { id: 'flx4-pad2-a', name: 'Hot Cue 2 Deck 1', action: 'hotcue_2_deckA', statusType: 'noteon', channel: 7, controlNumber: 1 },
      { id: 'flx4-pad3-a', name: 'Hot Cue 3 Deck 1', action: 'hotcue_3_deckA', statusType: 'noteon', channel: 7, controlNumber: 2 },
      { id: 'flx4-pad4-a', name: 'Hot Cue 4 Deck 1', action: 'hotcue_4_deckA', statusType: 'noteon', channel: 7, controlNumber: 3 },
      { id: 'flx4-loop-in-a', name: 'Loop In Deck 1', action: 'loop_in_deckA', statusType: 'noteon', channel: 0, controlNumber: 16 },
      { id: 'flx4-loop-out-a', name: 'Loop Out Deck 1', action: 'loop_out_deckA', statusType: 'noteon', channel: 0, controlNumber: 17 },

      // Deck B Transport
      { id: 'flx4-play-b', name: 'Play/Pause Deck 2', action: 'play_pause_deckB', statusType: 'noteon', channel: 1, controlNumber: 11 },
      { id: 'flx4-cue-b', name: 'Cue Deck 2', action: 'cue_deckB', statusType: 'noteon', channel: 1, controlNumber: 12 },
      { id: 'flx4-sync-b', name: 'Sync Deck 2', action: 'sync_deckB', statusType: 'noteon', channel: 1, controlNumber: 88 },
      { id: 'flx4-pfl-b', name: 'Headphone Cue 2', action: 'headphone_cue_deckB', statusType: 'noteon', channel: 1, controlNumber: 84 },
      // Deck B EQ & Levels
      { id: 'flx4-eq-hi-b', name: 'EQ High Deck 2', action: 'eq_high_deckB', statusType: 'cc', channel: 1, controlNumber: 7 },
      { id: 'flx4-eq-mid-b', name: 'EQ Mid Deck 2', action: 'eq_mid_deckB', statusType: 'cc', channel: 1, controlNumber: 11 },
      { id: 'flx4-eq-low-b', name: 'EQ Low Deck 2', action: 'eq_low_deckB', statusType: 'cc', channel: 1, controlNumber: 15 },
      { id: 'flx4-filter-b', name: 'Filter Deck 2', action: 'filter_deckB', statusType: 'cc', channel: 1, controlNumber: 23 },
      { id: 'flx4-gain-b', name: 'Trim / Gain 2', action: 'gain_deckB', statusType: 'cc', channel: 1, controlNumber: 4 },
      { id: 'flx4-vol-b', name: 'Channel Fader 2', action: 'volume_deckB', statusType: 'cc', channel: 1, controlNumber: 19 },
      { id: 'flx4-tempo-b', name: 'Pitch / Tempo 2', action: 'tempo_fader_deckB', statusType: 'cc', channel: 1, controlNumber: 0 },
      { id: 'flx4-jog-b', name: 'Jog Wheel 2', action: 'jog_scratch_deckB', statusType: 'cc', channel: 1, controlNumber: 33, isRelative: true },
      // Deck B Hot Cues
      { id: 'flx4-pad1-b', name: 'Hot Cue 1 Deck 2', action: 'hotcue_1_deckB', statusType: 'noteon', channel: 8, controlNumber: 0 },
      { id: 'flx4-pad2-b', name: 'Hot Cue 2 Deck 2', action: 'hotcue_2_deckB', statusType: 'noteon', channel: 8, controlNumber: 1 },
      { id: 'flx4-pad3-b', name: 'Hot Cue 3 Deck 2', action: 'hotcue_3_deckB', statusType: 'noteon', channel: 8, controlNumber: 2 },
      { id: 'flx4-pad4-b', name: 'Hot Cue 4 Deck 2', action: 'hotcue_4_deckB', statusType: 'noteon', channel: 8, controlNumber: 3 },
      { id: 'flx4-loop-in-b', name: 'Loop In Deck 2', action: 'loop_in_deckB', statusType: 'noteon', channel: 1, controlNumber: 16 },
      { id: 'flx4-loop-out-b', name: 'Loop Out Deck 2', action: 'loop_out_deckB', statusType: 'noteon', channel: 1, controlNumber: 17 },

      // Mixer Center
      { id: 'flx4-xfader', name: 'Crossfader', action: 'crossfader', statusType: 'cc', channel: 0, controlNumber: 31 },
      { id: 'flx4-master', name: 'Master Level', action: 'master_volume', statusType: 'cc', channel: 0, controlNumber: 79 },
      { id: 'flx4-hp-vol', name: 'Cuffie Volume', action: 'headphone_volume', statusType: 'cc', channel: 0, controlNumber: 80 },
      { id: 'flx4-load-a', name: 'Carica Deck 1', action: 'browser_load_deckA', statusType: 'noteon', channel: 0, controlNumber: 70 },
      { id: 'flx4-load-b', name: 'Carica Deck 2', action: 'browser_load_deckB', statusType: 'noteon', channel: 1, controlNumber: 70 },
    ],
  },
  {
    id: 'traktor_kontrol_s2',
    name: 'Native Instruments Traktor Kontrol S2 / S4',
    brand: 'Native Instruments',
    mappings: [
      { id: 's2-play-a', name: 'Play Deck 1', action: 'play_pause_deckA', statusType: 'noteon', channel: 0, controlNumber: 36 },
      { id: 's2-cue-a', name: 'Cue Deck 1', action: 'cue_deckA', statusType: 'noteon', channel: 0, controlNumber: 37 },
      { id: 's2-sync-a', name: 'Sync Deck 1', action: 'sync_deckA', statusType: 'noteon', channel: 0, controlNumber: 38 },
      { id: 's2-play-b', name: 'Play Deck 2', action: 'play_pause_deckB', statusType: 'noteon', channel: 1, controlNumber: 36 },
      { id: 's2-cue-b', name: 'Cue Deck 2', action: 'cue_deckB', statusType: 'noteon', channel: 1, controlNumber: 37 },
      { id: 's2-sync-b', name: 'Sync Deck 2', action: 'sync_deckB', statusType: 'noteon', channel: 1, controlNumber: 38 },
      { id: 's2-xfader', name: 'Crossfader', action: 'crossfader', statusType: 'cc', channel: 0, controlNumber: 8 },
      { id: 's2-vol-a', name: 'Volume Deck 1', action: 'volume_deckA', statusType: 'cc', channel: 0, controlNumber: 0 },
      { id: 's2-vol-b', name: 'Volume Deck 2', action: 'volume_deckB', statusType: 'cc', channel: 1, controlNumber: 0 },
      { id: 's2-eq-hi-a', name: 'EQ High 1', action: 'eq_high_deckA', statusType: 'cc', channel: 0, controlNumber: 1 },
      { id: 's2-eq-mid-a', name: 'EQ Mid 1', action: 'eq_mid_deckA', statusType: 'cc', channel: 0, controlNumber: 2 },
      { id: 's2-eq-low-a', name: 'EQ Low 1', action: 'eq_low_deckA', statusType: 'cc', channel: 0, controlNumber: 3 },
      { id: 's2-eq-hi-b', name: 'EQ High 2', action: 'eq_high_deckB', statusType: 'cc', channel: 1, controlNumber: 1 },
      { id: 's2-eq-mid-b', name: 'EQ Mid 2', action: 'eq_mid_deckB', statusType: 'cc', channel: 1, controlNumber: 2 },
      { id: 's2-eq-low-b', name: 'EQ Low 2', action: 'eq_low_deckB', statusType: 'cc', channel: 1, controlNumber: 3 },
      { id: 's2-flt-a', name: 'Filter 1', action: 'filter_deckA', statusType: 'cc', channel: 0, controlNumber: 4 },
      { id: 's2-flt-b', name: 'Filter 2', action: 'filter_deckB', statusType: 'cc', channel: 1, controlNumber: 4 },
    ],
  },
  {
    id: 'numark_mixtrack',
    name: 'Numark Mixtrack Pro FX / Platinum FX',
    brand: 'Numark',
    mappings: [
      { id: 'num-play-a', name: 'Play Deck 1', action: 'play_pause_deckA', statusType: 'noteon', channel: 0, controlNumber: 0 },
      { id: 'num-cue-a', name: 'Cue Deck 1', action: 'cue_deckA', statusType: 'noteon', channel: 0, controlNumber: 1 },
      { id: 'num-sync-a', name: 'Sync Deck 1', action: 'sync_deckA', statusType: 'noteon', channel: 0, controlNumber: 2 },
      { id: 'num-play-b', name: 'Play Deck 2', action: 'play_pause_deckB', statusType: 'noteon', channel: 1, controlNumber: 0 },
      { id: 'num-cue-b', name: 'Cue Deck 2', action: 'cue_deckB', statusType: 'noteon', channel: 1, controlNumber: 1 },
      { id: 'num-sync-b', name: 'Sync Deck 2', action: 'sync_deckB', statusType: 'noteon', channel: 1, controlNumber: 2 },
      { id: 'num-xfader', name: 'Crossfader', action: 'crossfader', statusType: 'cc', channel: 0, controlNumber: 8 },
      { id: 'num-vol-a', name: 'Fader 1', action: 'volume_deckA', statusType: 'cc', channel: 0, controlNumber: 28 },
      { id: 'num-vol-b', name: 'Fader 2', action: 'volume_deckB', statusType: 'cc', channel: 1, controlNumber: 28 },
    ],
  },
  {
    id: 'generic_akai_lpd8',
    name: 'Akai Professional LPD8 / MPK Mini (DJ Pads & Knobs)',
    brand: 'Akai Professional',
    mappings: [
      // 8 Pads
      { id: 'akai-pad1', name: 'Hot Cue 1 Deck 1', action: 'hotcue_1_deckA', statusType: 'noteon', channel: 0, controlNumber: 36 },
      { id: 'akai-pad2', name: 'Hot Cue 2 Deck 1', action: 'hotcue_2_deckA', statusType: 'noteon', channel: 0, controlNumber: 37 },
      { id: 'akai-pad3', name: 'Hot Cue 3 Deck 1', action: 'hotcue_3_deckA', statusType: 'noteon', channel: 0, controlNumber: 38 },
      { id: 'akai-pad4', name: 'Hot Cue 4 Deck 1', action: 'hotcue_4_deckA', statusType: 'noteon', channel: 0, controlNumber: 39 },
      { id: 'akai-pad5', name: 'Hot Cue 1 Deck 2', action: 'hotcue_1_deckB', statusType: 'noteon', channel: 0, controlNumber: 40 },
      { id: 'akai-pad6', name: 'Hot Cue 2 Deck 2', action: 'hotcue_2_deckB', statusType: 'noteon', channel: 0, controlNumber: 41 },
      { id: 'akai-pad7', name: 'Hot Cue 3 Deck 2', action: 'hotcue_3_deckB', statusType: 'noteon', channel: 0, controlNumber: 42 },
      { id: 'akai-pad8', name: 'Hot Cue 4 Deck 2', action: 'hotcue_4_deckB', statusType: 'noteon', channel: 0, controlNumber: 43 },
      // 8 Knobs
      { id: 'akai-k1', name: 'Filter Deck 1', action: 'filter_deckA', statusType: 'cc', channel: 0, controlNumber: 1 },
      { id: 'akai-k2', name: 'EQ Low Deck 1', action: 'eq_low_deckA', statusType: 'cc', channel: 0, controlNumber: 2 },
      { id: 'akai-k3', name: 'EQ Mid Deck 1', action: 'eq_mid_deckA', statusType: 'cc', channel: 0, controlNumber: 3 },
      { id: 'akai-k4', name: 'EQ High Deck 1', action: 'eq_high_deckA', statusType: 'cc', channel: 0, controlNumber: 4 },
      { id: 'akai-k5', name: 'Filter Deck 2', action: 'filter_deckB', statusType: 'cc', channel: 0, controlNumber: 5 },
      { id: 'akai-k6', name: 'EQ Low Deck 2', action: 'eq_low_deckB', statusType: 'cc', channel: 0, controlNumber: 6 },
      { id: 'akai-k7', name: 'EQ Mid Deck 2', action: 'eq_mid_deckB', statusType: 'cc', channel: 0, controlNumber: 7 },
      { id: 'akai-k8', name: 'Crossfader', action: 'crossfader', statusType: 'cc', channel: 0, controlNumber: 8 },
    ],
  },
];
