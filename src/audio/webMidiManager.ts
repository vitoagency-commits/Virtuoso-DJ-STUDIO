import {
  MidiAction,
  MidiMappingRule,
  MidiControllerProfile,
  MidiActivityEvent,
  MidiLearnState,
  DEFAULT_MIDI_PROFILES,
} from '../types/midi';

export type MidiEventCallback = (action: MidiAction, value: number, isRelative?: boolean) => void;
export type MidiActivityCallback = (event: MidiActivityEvent) => void;

class WebMidiManager {
  private midiAccess: any = null;
  private isSupported: boolean = false;
  private isInitialized: boolean = false;
  private connectedInputs: Map<string, any> = new Map();
  private connectedOutputs: Map<string, any> = new Map();

  // Active mappings list
  private activeMappings: MidiMappingRule[] = [];
  private activeProfileId: string = 'pioneer_ddj_flx4';

  // Listeners
  private actionListeners: Set<MidiEventCallback> = new Set();
  private activityListeners: Set<MidiActivityCallback> = new Set();
  private connectionListeners: Set<() => void> = new Set();

  // MIDI Learn state
  private learnState: MidiLearnState = {
    isActive: false,
    targetAction: null,
    targetName: null,
  };

  // Recent MIDI logs for live monitor
  private recentLogs: MidiActivityEvent[] = [];

  constructor() {
    this.isSupported = typeof navigator !== 'undefined' && 'requestMIDIAccess' in navigator;
    this.loadSavedMappings();
  }

  private loadSavedMappings() {
    try {
      const savedMappings = localStorage.getItem('virtuoso_midi_mappings');
      const savedProfile = localStorage.getItem('virtuoso_midi_profile');

      if (savedMappings) {
        this.activeMappings = JSON.parse(savedMappings);
      } else {
        const defaultProf = DEFAULT_MIDI_PROFILES[0];
        this.activeMappings = [...defaultProf.mappings];
      }

      if (savedProfile) {
        this.activeProfileId = savedProfile;
      }
    } catch {
      this.activeMappings = [...DEFAULT_MIDI_PROFILES[0].mappings];
    }
  }

  public saveMappings() {
    try {
      localStorage.setItem('virtuoso_midi_mappings', JSON.stringify(this.activeMappings));
      localStorage.setItem('virtuoso_midi_profile', this.activeProfileId);
    } catch (e) {
      console.warn('Could not save MIDI mappings to localStorage', e);
    }
  }

  public async init(): Promise<boolean> {
    if (this.isInitialized) return true;
    if (!this.isSupported) {
      console.warn('Web MIDI API is not supported in this browser.');
      return false;
    }

    try {
      this.midiAccess = await (navigator as any).requestMIDIAccess({ sysex: false });
      this.isInitialized = true;

      this.updatePorts();

      this.midiAccess.onstatechange = (e: any) => {
        this.updatePorts();
        this.notifyConnectionListeners();
      };

      return true;
    } catch (err) {
      console.warn('Web MIDI access was denied or failed:', err);
      return false;
    }
  }

  private updatePorts() {
    if (!this.midiAccess) return;

    this.connectedInputs.clear();
    const inputs = this.midiAccess.inputs.values();
    for (const input of inputs) {
      if (input.state === 'connected') {
        this.connectedInputs.set(input.id, input);
        // Bind incoming message handler
        input.onmidimessage = (msg: any) => this.handleMidiMessage(msg);
      }
    }

    this.connectedOutputs.clear();
    const outputs = this.midiAccess.outputs.values();
    for (const output of outputs) {
      if (output.state === 'connected') {
        this.connectedOutputs.set(output.id, output);
      }
    }
  }

  public getConnectedDevices(): { id: string; name: string; manufacturer: string; state: string }[] {
    const list: { id: string; name: string; manufacturer: string; state: string }[] = [];
    for (const [, input] of this.connectedInputs) {
      list.push({
        id: input.id,
        name: input.name || 'Dispositivo MIDI Generico',
        manufacturer: input.manufacturer || 'Hardware MIDI',
        state: input.state,
      });
    }
    return list;
  }

  public getConnectedOutputDevices(): { id: string; name: string; manufacturer: string }[] {
    const list: { id: string; name: string; manufacturer: string }[] = [];
    for (const [, output] of this.connectedOutputs) {
      list.push({
        id: output.id,
        name: output.name || 'Dispositivo MIDI Output',
        manufacturer: output.manufacturer || 'Hardware MIDI',
      });
    }
    return list;
  }

  // Send MIDI feedback to hardware LED (e.g. Play button light, Cue light)
  public sendMidiFeedback(channel: number, controlNumber: number, value: number) {
    if (!this.connectedOutputs.size) return;
    try {
      const statusByte = 0x90 | (channel & 0x0f); // Note On
      const data = [statusByte, controlNumber & 0x7f, value & 0x7f];
      for (const [, out] of this.connectedOutputs) {
        out.send(data);
      }
    } catch {
      // ignore
    }
  }

  private handleMidiMessage(event: any) {
    const data = event.data;
    if (!data || data.length < 2) return;

    const status = data[0];
    const messageType = status >> 4;
    const channel = status & 0x0f;
    const byte1 = data[1];
    const byte2 = data.length > 2 ? data[2] : 0;

    let statusType: 'noteon' | 'noteoff' | 'cc' | 'pitchbend' | 'other' = 'other';
    let controlNumber = byte1;
    let value = byte2;

    if (messageType === 0x9) {
      statusType = byte2 > 0 ? 'noteon' : 'noteoff';
      controlNumber = byte1;
      value = byte2;
    } else if (messageType === 0x8) {
      statusType = 'noteoff';
      controlNumber = byte1;
      value = 0;
    } else if (messageType === 0xb) {
      statusType = 'cc';
      controlNumber = byte1;
      value = byte2;
    } else if (messageType === 0xe) {
      statusType = 'pitchbend';
      controlNumber = 0;
      value = (byte2 << 7) | byte1;
    }

    // 1. MIDI LEARN MODE INTERCEPTION
    if (this.learnState.isActive && this.learnState.targetAction) {
      // Accept noteon or cc
      if (statusType === 'noteon' || statusType === 'cc') {
        const newRule: MidiMappingRule = {
          id: `custom-${Date.now()}`,
          name: this.learnState.targetName || this.learnState.targetAction,
          action: this.learnState.targetAction,
          statusType: statusType,
          channel: channel,
          controlNumber: controlNumber,
        };

        // Remove old mapping for this action or overwrite
        this.activeMappings = this.activeMappings.filter((m) => m.action !== this.learnState.targetAction);
        this.activeMappings.push(newRule);
        this.saveMappings();

        // End learn mode
        this.learnState = { isActive: false, targetAction: null, targetName: null };
      }
    }

    // 2. FIND MATCHING MAPPINGS
    let matchedActionName: string | undefined = undefined;
    for (const rule of this.activeMappings) {
      const matchChannel = rule.channel === -1 || rule.channel === channel;
      const matchType = rule.statusType === statusType;
      const matchControl = rule.controlNumber === controlNumber;

      if (matchChannel && matchType && matchControl) {
        matchedActionName = rule.name;
        // Dispatch action
        this.dispatchAction(rule.action, value, rule.isRelative);
      }
    }

    // 3. BROADCAST ACTIVITY FOR LIVE MONITOR
    const activityEvent: MidiActivityEvent = {
      timestamp: Date.now(),
      channel,
      statusType,
      controlNumber,
      value,
      matchedAction: matchedActionName,
    };

    this.recentLogs.unshift(activityEvent);
    if (this.recentLogs.length > 50) this.recentLogs.pop();

    for (const cb of this.activityListeners) {
      cb(activityEvent);
    }
  }

  // Simulation: Trigger MIDI messages artificially from UI to test controller behavior without a physical cable
  public simulateMidiInput(statusType: 'noteon' | 'cc', channel: number, controlNumber: number, value: number) {
    const statusByte = (statusType === 'noteon' ? 0x90 : 0xb0) | (channel & 0x0f);
    const mockEvent = {
      data: new Uint8Array([statusByte, controlNumber, value]),
    };
    this.handleMidiMessage(mockEvent);
  }

  private dispatchAction(action: MidiAction, rawValue: number, isRelative?: boolean) {
    let normalizedValue = rawValue / 127; // 0.0 to 1.0

    // Handle relative encoders (e.g. jog wheel 64 is zero, >64 forward, <64 backward)
    if (isRelative) {
      if (rawValue > 64) {
        normalizedValue = rawValue - 64; // e.g. +1, +2
      } else if (rawValue < 64) {
        normalizedValue = -(64 - rawValue); // e.g. -1, -2
      } else {
        normalizedValue = 0;
      }
    }

    for (const listener of this.actionListeners) {
      listener(action, normalizedValue, isRelative);
    }
  }

  // Public Mapping & Profile Controls
  public getActiveMappings(): MidiMappingRule[] {
    return this.activeMappings;
  }

  public setMapping(rule: MidiMappingRule) {
    this.activeMappings = this.activeMappings.filter((m) => m.id !== rule.id && m.action !== rule.action);
    this.activeMappings.push(rule);
    this.saveMappings();
  }

  public removeMapping(ruleId: string) {
    this.activeMappings = this.activeMappings.filter((m) => m.id !== ruleId);
    this.saveMappings();
  }

  public resetToProfile(profileId: string) {
    const prof = DEFAULT_MIDI_PROFILES.find((p) => p.id === profileId) || DEFAULT_MIDI_PROFILES[0];
    this.activeProfileId = prof.id;
    this.activeMappings = [...prof.mappings];
    this.saveMappings();
  }

  public getProfiles(): MidiControllerProfile[] {
    return DEFAULT_MIDI_PROFILES;
  }

  public getActiveProfileId(): string {
    return this.activeProfileId;
  }

  // Learn Mode
  public startLearn(action: MidiAction, name: string) {
    this.learnState = {
      isActive: true,
      targetAction: action,
      targetName: name,
    };
  }

  public cancelLearn() {
    this.learnState = {
      isActive: false,
      targetAction: null,
      targetName: null,
    };
  }

  public getLearnState(): MidiLearnState {
    return this.learnState;
  }

  public getRecentLogs(): MidiActivityEvent[] {
    return this.recentLogs;
  }

  public clearRecentLogs() {
    this.recentLogs = [];
  }

  // Event Subscriptions
  public onAction(cb: MidiEventCallback): () => void {
    this.actionListeners.add(cb);
    return () => this.actionListeners.delete(cb);
  }

  public onActivity(cb: MidiActivityCallback): () => void {
    this.activityListeners.add(cb);
    return () => this.activityListeners.delete(cb);
  }

  public onConnectionChange(cb: () => void): () => void {
    this.connectionListeners.add(cb);
    return () => this.connectionListeners.delete(cb);
  }

  private notifyConnectionListeners() {
    for (const cb of this.connectionListeners) {
      cb();
    }
  }

  public getIsSupported(): boolean {
    return this.isSupported;
  }

  public getIsInitialized(): boolean {
    return this.isInitialized;
  }
}

export const webMidiManager = new WebMidiManager();
