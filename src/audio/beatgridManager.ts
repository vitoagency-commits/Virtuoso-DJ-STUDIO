/**
 * Virtuoso DJ Studio - Magnetic Beatgrid & Quantize Engine
 * Implements high-precision mathematical quantization for CDJ/Rekordbox/Traktor-grade
 * beat-accurate drops, stutter cues, hot cues, loop snapping, and phase lock.
 */

import { DeckState } from '../types/dj';

export type QuantizeResolution = '1/1' | '1/2' | '1/4' | '1/8';

export interface BeatgridInfo {
  secondsPerBeat: number;
  barDuration: number;
  currentBeat: number;
  currentBar: number;
  beatFraction: number; // 0.0 to 1.0 within current beat
  nearestBeatTime: number;
  nextBeatTime: number;
  prevBeatTime: number;
}

export class BeatgridManager {
  /**
   * Calculates detailed beatgrid positioning for a deck at a given timestamp
   */
  public static getBeatgridInfo(deck: DeckState, targetTime?: number): BeatgridInfo {
    const time = targetTime !== undefined ? targetTime : deck.currentTime;
    const bpm = Math.max(20, deck.bpm || 128);
    const secondsPerBeat = 60 / bpm;
    const barDuration = secondsPerBeat * 4;
    const offset = deck.beatgridOffset || 0;

    const relativeTime = Math.max(0, time - offset);
    const totalBeats = relativeTime / secondsPerBeat;
    const currentBeat = Math.floor(totalBeats) % 4 + 1; // 1, 2, 3, 4
    const currentBar = Math.floor(totalBeats / 4) + 1;
    const beatFraction = totalBeats - Math.floor(totalBeats);

    const prevBeatTime = Math.floor(totalBeats) * secondsPerBeat + offset;
    const nextBeatTime = Math.ceil(totalBeats) * secondsPerBeat + offset;
    const nearestBeatTime =
      beatFraction < 0.5 ? prevBeatTime : nextBeatTime;

    return {
      secondsPerBeat,
      barDuration,
      currentBeat,
      currentBar,
      beatFraction,
      nearestBeatTime,
      nextBeatTime,
      prevBeatTime,
    };
  }

  /**
   * Snaps a timestamp magnetically to the nearest beatgrid division
   * according to the deck's active quantization resolution (1/1, 1/2, 1/4, 1/8)
   */
  public static snapToBeatgrid(
    deck: DeckState,
    targetTime: number,
    resolution: QuantizeResolution = '1/1'
  ): number {
    const bpm = Math.max(20, deck.bpm || 128);
    const secondsPerBeat = 60 / bpm;
    const offset = deck.beatgridOffset || 0;

    let divisor = 1;
    if (resolution === '1/2') divisor = 2;
    else if (resolution === '1/4') divisor = 4;
    else if (resolution === '1/8') divisor = 8;

    const subdivisionSeconds = secondsPerBeat / divisor;
    const relative = targetTime - offset;
    const quantizedSteps = Math.round(relative / subdivisionSeconds);
    const quantizedTime = Math.max(0, quantizedSteps * subdivisionSeconds + offset);

    // Ensure we don't exceed track duration
    const duration = deck.duration || 9999;
    return Math.min(duration, quantizedTime);
  }

  /**
   * Calculates the exact phase alignment offset between two decks.
   * If Deck A is playing and Deck B is started, this returns the target time
   * on Deck B that matches the fractional phase of Deck A.
   */
  public static alignPhaseToMaster(masterDeck: DeckState, slaveDeck: DeckState): number {
    const masterInfo = this.getBeatgridInfo(masterDeck);
    const slaveInfo = this.getBeatgridInfo(slaveDeck);

    // Keep the slave deck's current beat integer, but align the beat fraction to the master's
    const targetTime =
      Math.floor(slaveDeck.currentTime / slaveInfo.secondsPerBeat) * slaveInfo.secondsPerBeat +
      masterInfo.beatFraction * slaveInfo.secondsPerBeat +
      (slaveDeck.beatgridOffset || 0);

    return Math.max(0, targetTime);
  }

  /**
   * Snaps loop boundaries to exact integer beatgrid beats
   */
  public static getQuantizedLoopBounds(
    deck: DeckState,
    rawStart: number,
    beats: number
  ): { loopStart: number; loopLengthBeats: number } {
    const snappedStart = this.snapToBeatgrid(deck, rawStart, '1/1');
    const safeBeats = Math.max(0.25, Math.min(64, beats));
    return {
      loopStart: snappedStart,
      loopLengthBeats: safeBeats,
    };
  }

  /**
   * Shifts the entire beatgrid by milliseconds or beats (Beatgrid Shift tool)
   */
  public static shiftBeatgrid(currentOffset: number, deltaSeconds: number): number {
    return Math.max(0, currentOffset + deltaSeconds);
  }
}
