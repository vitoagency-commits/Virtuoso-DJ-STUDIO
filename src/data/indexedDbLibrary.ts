/**
 * Virtuoso DJ Studio - Persistent IndexedDB Library Engine
 * Stores user-imported tracks, decoded audio, custom hotcues, beatgrid alignments,
 * playlists, and performance history permanently in the browser.
 */

import { Track } from '../types/dj';

const DB_NAME = 'VirtuosoDj_DB_v1';
const DB_VERSION = 1;

const STORES = {
  TRACKS: 'tracks',
  AUDIO_DATA: 'audio_blobs',
  CUE_PRESETS: 'cue_presets',
  PLAYLISTS: 'playlists',
  HISTORY: 'session_history',
};

export interface StoredTrackRecord {
  id: string;
  title: string;
  artist: string;
  bpm: number;
  key: string;
  camelot: string;
  genre: string;
  duration: number;
  waveformData: number[];
  cuePoints?: number[];
  beatgridOffset?: number;
  addedAt: number;
  fileSize?: number;
  fileType?: string;
  isUserTrack: boolean;
}

export interface StoredCuePreset {
  trackId: string;
  hotCues: (number | null)[];
  cuePosition: number;
  updatedAt: number;
}

class IndexedDbLibrary {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private getDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB not supported in this environment'));
        return;
      }

      const request = window.indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Tracks store
        if (!db.objectStoreNames.contains(STORES.TRACKS)) {
          db.createObjectStore(STORES.TRACKS, { keyPath: 'id' });
        }

        // Audio Blobs store
        if (!db.objectStoreNames.contains(STORES.AUDIO_DATA)) {
          db.createObjectStore(STORES.AUDIO_DATA, { keyPath: 'id' });
        }

        // Hot Cue & Beatgrid presets store
        if (!db.objectStoreNames.contains(STORES.CUE_PRESETS)) {
          db.createObjectStore(STORES.CUE_PRESETS, { keyPath: 'trackId' });
        }

        // Playlists / Crates store
        if (!db.objectStoreNames.contains(STORES.PLAYLISTS)) {
          db.createObjectStore(STORES.PLAYLISTS, { keyPath: 'id' });
        }

        // History store
        if (!db.objectStoreNames.contains(STORES.HISTORY)) {
          db.createObjectStore(STORES.HISTORY, { keyPath: 'id', autoIncrement: true });
        }
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });

    return this.dbPromise;
  }

  /**
   * Save a track and optionally its raw audio binary into IndexedDB
   */
  public async saveTrack(track: Track, audioFile?: Blob | ArrayBuffer): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORES.TRACKS, STORES.AUDIO_DATA], 'readwrite');
      const trackStore = tx.objectStore(STORES.TRACKS);
      const audioStore = tx.objectStore(STORES.AUDIO_DATA);

      const record: StoredTrackRecord = {
        id: track.id,
        title: track.title,
        artist: track.artist,
        bpm: track.bpm,
        key: track.key,
        camelot: (track as any).camelot || track.camelotCode || '',
        genre: track.genre,
        duration: track.duration,
        waveformData: track.waveformData || [],
        cuePoints: track.cuePoints || [],
        beatgridOffset: (track as any).beatgridOffset || 0,
        addedAt: Date.now(),
        isUserTrack: true,
      };

      trackStore.put(record);

      if (audioFile) {
        audioStore.put({ id: track.id, data: audioFile });
      }

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Retrieve all saved user tracks from IndexedDB
   */
  public async getAllSavedTracks(): Promise<StoredTrackRecord[]> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.TRACKS, 'readonly');
      const store = tx.objectStore(STORES.TRACKS);
      const req = store.getAll();

      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Retrieve raw audio blob/ArrayBuffer for a track
   */
  public async getTrackAudioData(trackId: string): Promise<Blob | ArrayBuffer | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.AUDIO_DATA, 'readonly');
      const store = tx.objectStore(STORES.AUDIO_DATA);
      const req = store.get(trackId);

      req.onsuccess = () => resolve(req.result ? req.result.data : null);
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Delete a track and its audio data from IndexedDB
   */
  public async deleteTrack(trackId: string): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORES.TRACKS, STORES.AUDIO_DATA, STORES.CUE_PRESETS], 'readwrite');
      tx.objectStore(STORES.TRACKS).delete(trackId);
      tx.objectStore(STORES.AUDIO_DATA).delete(trackId);
      tx.objectStore(STORES.CUE_PRESETS).delete(trackId);

      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Save custom hotcues and cue point for any track
   */
  public async saveCuePreset(trackId: string, hotCues: (number | null)[], cuePosition: number): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.CUE_PRESETS, 'readwrite');
      const store = tx.objectStore(STORES.CUE_PRESETS);
      const preset: StoredCuePreset = {
        trackId,
        hotCues,
        cuePosition,
        updatedAt: Date.now(),
      };
      store.put(preset);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  /**
   * Load saved hotcue presets for a track
   */
  public async getCuePreset(trackId: string): Promise<StoredCuePreset | null> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORES.CUE_PRESETS, 'readonly');
      const store = tx.objectStore(STORES.CUE_PRESETS);
      const req = store.get(trackId);
      req.onsuccess = () => resolve(req.result || null);
      req.onerror = () => reject(req.error);
    });
  }

  /**
   * Calculate storage used by IndexedDB
   */
  public async getStorageUsage(): Promise<{ count: number; bytes: number; mbFormatted: string }> {
    try {
      const tracks = await this.getAllSavedTracks();
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        const usageBytes = estimate.usage || 0;
        const mb = (usageBytes / (1024 * 1024)).toFixed(1);
        return { count: tracks.length, bytes: usageBytes, mbFormatted: `${mb} MB` };
      }
      return { count: tracks.length, bytes: 0, mbFormatted: 'Disponibile' };
    } catch {
      return { count: 0, bytes: 0, mbFormatted: '0 MB' };
    }
  }

  /**
   * Clear all stored tracks in IndexedDB
   */
  public async clearAll(): Promise<void> {
    const db = await this.getDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORES.TRACKS, STORES.AUDIO_DATA, STORES.CUE_PRESETS], 'readwrite');
      tx.objectStore(STORES.TRACKS).clear();
      tx.objectStore(STORES.AUDIO_DATA).clear();
      tx.objectStore(STORES.CUE_PRESETS).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}

export const indexedDbLibrary = new IndexedDbLibrary();
