/**
 * Virtuoso DJ Studio - Real-Time Hardware Audio & MIDI Mixer Detector
 * Detects USB DJ Mixers, Controllers, Sound Cards, and Audio Interfaces
 * automatically identifying Brand, Product Name, and Equipment Type.
 */

export interface DetectedAudioDevice {
  id: string;
  name: string;
  brand: string;
  brandColor: string;
  category: 'dj_mixer' | 'audio_interface' | 'headphones' | 'microphone' | 'diffusion';
  categoryLabel: string;
  kind: 'audiooutput' | 'audioinput' | 'midi_controller';
  channels: number;
  sampleRate: number;
  latencyMs: number;
  isDefault?: boolean;
  isSimulated?: boolean;
  connectedAt: Date;
}

export type HardwareChangeCallback = (devices: DetectedAudioDevice[], lastEvent?: { action: 'connected' | 'disconnected'; device: DetectedAudioDevice }) => void;

interface BrandSignature {
  name: string;
  color: string;
  keywords: string[];
  defaultCategory: DetectedAudioDevice['category'];
}

const BRAND_DATABASE: BrandSignature[] = [
  {
    name: 'Pioneer DJ / AlphaTheta',
    color: '#00ffff', // Cyan Pioneer signature
    keywords: ['pioneer', 'alphatheta', 'ddj', 'djm', 'cdj', 'xdj', 'flx', 'opus', 'rev'],
    defaultCategory: 'dj_mixer',
  },
  {
    name: 'Denon DJ',
    color: '#3b82f6', // Blue
    keywords: ['denon', 'prime', 'sc6000', 'sc5000', 'x1850', 'mcx', 'engine'],
    defaultCategory: 'dj_mixer',
  },
  {
    name: 'Allen & Heath',
    color: '#f97316', // Orange
    keywords: ['allen', 'heath', 'xone', 'zed', 'qu-'],
    defaultCategory: 'dj_mixer',
  },
  {
    name: 'Native Instruments (Traktor)',
    color: '#a855f7', // Purple
    keywords: ['native instruments', 'traktor', 'kontrol', 'komplete', 'maschine'],
    defaultCategory: 'dj_mixer',
  },
  {
    name: 'Numark',
    color: '#ef4444', // Red
    keywords: ['numark', 'mixtrack', 'ns4', 'ns6', 'ns7', 'scratch', 'dj2go'],
    defaultCategory: 'dj_mixer',
  },
  {
    name: 'Hercules DJ',
    color: '#eab308', // Amber
    keywords: ['hercules', 'inpulse', 'djcontrol', 'starlight'],
    defaultCategory: 'dj_mixer',
  },
  {
    name: 'Rane DJ',
    color: '#ec4899', // Pink
    keywords: ['rane', 'seventy', 'twelve', 'one', 'four', 'sl2', 'sl3', 'sl4'],
    defaultCategory: 'dj_mixer',
  },
  {
    name: 'Reloop',
    color: '#10b981', // Emerald
    keywords: ['reloop', 'mixon', 'beatmix', 'buddy', 'ready', 'elite', 'touch'],
    defaultCategory: 'dj_mixer',
  },
  {
    name: 'JBL Professional',
    color: '#ea580c', // Orange JBL
    keywords: ['jbl', 'prx', 'eon', 'partybox', 'irx', 'srx', 'vtx'],
    defaultCategory: 'diffusion',
  },
  {
    name: 'Yamaha Pro Audio',
    color: '#6366f1', // Indigo Yamaha
    keywords: ['yamaha', 'mg10', 'mg12', 'mg06', 'ag03', 'ag06', 'dxr', 'stagepas', 'hs8', 'hs5', 'hs7'],
    defaultCategory: 'dj_mixer',
  },
  {
    name: 'Bose Professional',
    color: '#0284c7', // Sky Blue
    keywords: ['bose', 's1 pro', 'l1 pro', 'f1', 'tonematch'],
    defaultCategory: 'diffusion',
  },
  {
    name: 'Electro-Voice (EV)',
    color: '#ef4444', // Red
    keywords: ['electro-voice', 'everse', 'zlx', 'elx', 'ekx'],
    defaultCategory: 'diffusion',
  },
  {
    name: 'Mackie',
    color: '#22c55e', // Green Mackie
    keywords: ['mackie', 'profx', 'thump', 'onyx', 'cr3', 'cr4', 'cr5', 'srm'],
    defaultCategory: 'dj_mixer',
  },
  {
    name: 'Roland DJ',
    color: '#f59e0b', // Roland Gold
    keywords: ['roland', 'dj-202', 'dj-505', 'dj-707m', 'dj-808', 'rubix', 'bridge cast'],
    defaultCategory: 'dj_mixer',
  },
  {
    name: 'Focusrite',
    color: '#f43f5e', // Rose
    keywords: ['focusrite', 'scarlett', 'clarett', 'saffire'],
    defaultCategory: 'audio_interface',
  },
  {
    name: 'Universal Audio',
    color: '#8b5cf6', // Violet
    keywords: ['universal audio', 'apollo', 'volt', 'arrow'],
    defaultCategory: 'audio_interface',
  },
  {
    name: 'Behringer',
    color: '#f59e0b', // Amber
    keywords: ['behringer', 'cmd', 'umc', 'u-phoria', 'xenyx', 'dxr', 'flow 8', 'x32'],
    defaultCategory: 'dj_mixer',
  },
  {
    name: 'Apple CoreAudio',
    color: '#94a3b8', // Silver
    keywords: ['apple', 'airpods', 'macbook', 'built-in', 'studio display', 'coreaudio'],
    defaultCategory: 'diffusion',
  },
  {
    name: 'Sennheiser',
    color: '#38bdf8', // Light Blue
    keywords: ['sennheiser', 'hd 25', 'hd25', 'hd 280', 'ew-d', 'xs wireless'],
    defaultCategory: 'headphones',
  },
  {
    name: 'RØDE',
    color: '#e11d48', // Crimson
    keywords: ['rode', 'rodecaster', 'nt-usb', 'podmic', 'wireless', 'ai-micro'],
    defaultCategory: 'microphone',
  },
  {
    name: 'Shure',
    color: '#14b8a6', // Teal
    keywords: ['shure', 'mv7', 'sm7', 'motiv', 'pgx', 'qlxd', 'slxd'],
    defaultCategory: 'microphone',
  },
];

class HardwareDetector {
  private devices: DetectedAudioDevice[] = [];
  private listeners: Set<HardwareChangeCallback> = new Set();
  private isListening: boolean = false;
  private midiAccess: any = null;

  public async init() {
    if (this.isListening) return;
    this.isListening = true;

    // 1. Initial Device Scan
    await this.scanAudioDevices();

    // 2. Listen for Web MediaDevices hot-plug changes
    if (navigator.mediaDevices && navigator.mediaDevices.ondevicechange !== undefined) {
      navigator.mediaDevices.ondevicechange = () => {
        this.scanAudioDevices();
      };
    }

    // 3. Listen for Web MIDI Controller / Mixer hot-plug changes
    if ('requestMIDIAccess' in navigator) {
      try {
        this.midiAccess = await (navigator as any).requestMIDIAccess({ sysex: false });
        this.scanMidiDevices();
        this.midiAccess.onstatechange = (e: any) => {
          this.handleMidiStateChange(e);
        };
      } catch (err) {
        // MIDI access optional or denied
      }
    }
  }

  // Scan Audio Input & Output Devices via MediaDevices API
  public async scanAudioDevices() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) return;

    try {
      const mediaDevices = await navigator.mediaDevices.enumerateDevices();
      const currentDevices: DetectedAudioDevice[] = [];

      for (const dev of mediaDevices) {
        if (dev.kind !== 'audioinput' && dev.kind !== 'audiooutput') continue;

        const info = this.classifyDevice(dev.label || `${dev.kind === 'audioinput' ? 'Input Microfonico' : 'Diffusione Audio'} (${dev.deviceId.slice(0, 5)})`, dev.kind);
        
        currentDevices.push({
          id: dev.deviceId,
          name: info.cleanName,
          brand: info.brand,
          brandColor: info.brandColor,
          category: info.category,
          categoryLabel: info.categoryLabel,
          kind: dev.kind,
          channels: dev.kind === 'audiooutput' ? 4 : 2, // DJ soundcards typically have 4 out (Master L/R + Cue L/R)
          sampleRate: 48000,
          latencyMs: 4.8,
          isDefault: dev.deviceId === 'default',
          connectedAt: new Date(),
        });
      }

      // Merge with any simulated devices
      const simulated = this.devices.filter((d) => d.isSimulated);
      this.devices = [...currentDevices, ...simulated];
      this.notifyListeners();
    } catch (err) {
      console.error('Error scanning audio devices:', err);
    }
  }

  // Scan MIDI DJ Mixers and Controllers
  private scanMidiDevices() {
    if (!this.midiAccess) return;

    const midiInputs = this.midiAccess.inputs.values();
    for (const input of midiInputs) {
      if (input.state === 'connected') {
        const info = this.classifyDevice(input.name || 'MIDI DJ Controller', 'midi_controller');
        if (!this.devices.some((d) => d.id === input.id)) {
          const device: DetectedAudioDevice = {
            id: input.id,
            name: input.name || info.cleanName,
            brand: input.manufacturer || info.brand,
            brandColor: info.brandColor,
            category: 'dj_mixer',
            categoryLabel: 'Mixer Hardware DJ & Superficie MIDI',
            kind: 'midi_controller',
            channels: 4,
            sampleRate: 96000,
            latencyMs: 2.1,
            connectedAt: new Date(),
          };
          this.devices.push(device);
          this.notifyListeners({ action: 'connected', device });
        }
      }
    }
  }

  private handleMidiStateChange(event: any) {
    const port = event.port;
    if (port.type === 'input') {
      if (port.state === 'connected') {
        const info = this.classifyDevice(port.name || 'DJ Controller', 'midi_controller');
        const device: DetectedAudioDevice = {
          id: port.id,
          name: port.name || info.cleanName,
          brand: port.manufacturer || info.brand,
          brandColor: info.brandColor,
          category: 'dj_mixer',
          categoryLabel: 'Mixer Hardware DJ & Superficie MIDI',
          kind: 'midi_controller',
          channels: 4,
          sampleRate: 96000,
          latencyMs: 2.1,
          connectedAt: new Date(),
        };
        this.devices.push(device);
        this.notifyListeners({ action: 'connected', device });
      } else if (port.state === 'disconnected') {
        const removed = this.devices.find((d) => d.id === port.id);
        this.devices = this.devices.filter((d) => d.id !== port.id);
        if (removed) {
          this.notifyListeners({ action: 'disconnected', device: removed });
        }
      }
    }
  }

  // Classify Brand, Equipment Type, and Category
  public classifyDevice(rawLabel: string, kind: 'audioinput' | 'audiooutput' | 'midi_controller'): {
    cleanName: string;
    brand: string;
    brandColor: string;
    category: DetectedAudioDevice['category'];
    categoryLabel: string;
  } {
    const lower = rawLabel.toLowerCase();

    // Check against brand database
    let matchedBrand = 'Dispositivo Audio Esterno';
    let brandColor = '#06b6d4';
    let category: DetectedAudioDevice['category'] = kind === 'audioinput' ? 'microphone' : 'diffusion';

    for (const b of BRAND_DATABASE) {
      if (b.keywords.some((kw) => lower.includes(kw))) {
        matchedBrand = b.name;
        brandColor = b.color;
        category = b.defaultCategory;
        break;
      }
    }

    // Refine category from label keywords
    if (lower.includes('mixer') || lower.includes('djm') || lower.includes('xone') || lower.includes('ddj') || lower.includes('controller')) {
      category = 'dj_mixer';
    } else if (lower.includes('cuffi') || lower.includes('headphone') || lower.includes('earphone') || lower.includes('airpod')) {
      category = 'headphones';
    } else if (lower.includes('mic') || lower.includes('input') || lower.includes('line in') || lower.includes('vocal')) {
      category = 'microphone';
    } else if (lower.includes('interface') || lower.includes('scarlett') || lower.includes('apollo') || lower.includes('soundcard')) {
      category = 'audio_interface';
    }

    const categoryLabels: Record<DetectedAudioDevice['category'], string> = {
      dj_mixer: 'Mixer Hardware DJ & Controller USB',
      audio_interface: 'Interfaccia Audio Professionale (Studio / Live)',
      headphones: 'Cuffie Pre-Ascolto DJ & Monitor PFL',
      microphone: 'Ingresso Microfono DJ / Speaker MC',
      diffusion: 'Diffusione Master / Impianto Casse Club',
    };

    return {
      cleanName: rawLabel || 'Dispositivo USB DJ',
      brand: matchedBrand,
      brandColor,
      category,
      categoryLabel: categoryLabels[category],
    };
  }

  // Subscribe to hardware connection events
  public subscribe(cb: HardwareChangeCallback): () => void {
    this.listeners.add(cb);
    cb(this.devices);
    return () => {
      this.listeners.delete(cb);
    };
  }

  private notifyListeners(lastEvent?: { action: 'connected' | 'disconnected'; device: DetectedAudioDevice }) {
    for (const cb of this.listeners) {
      cb(this.devices, lastEvent);
    }
  }

  public getDevices(): DetectedAudioDevice[] {
    return this.devices;
  }

  // Simulation: Allows testing connecting real DJ Mixers, PA diffusion, Audio Interfaces, and Microphones
  public simulateHardwareConnection(preset: 'pioneer_flx4' | 'allen_xone96' | 'jbl_prx' | 'denon_prime4' | 'focusrite_scarlett' | 'shure_mic' | 'bose_s1' | 'airpods_pro') {
    const presets: Record<string, Partial<DetectedAudioDevice>> = {
      pioneer_flx4: {
        name: 'Pioneer DJ DDJ-FLX4 (USB Audio/MIDI 4-Ch 24-bit)',
        brand: 'Pioneer DJ / AlphaTheta',
        brandColor: '#00ffff',
        category: 'dj_mixer',
        categoryLabel: 'Mixer Hardware DJ & Controller USB 4-Canali',
        kind: 'audiooutput',
        channels: 4,
        sampleRate: 48000,
        latencyMs: 3.2,
      },
      allen_xone96: {
        name: 'Allen & Heath Xone:96 (Club Analogue/Dual USB Soundcard)',
        brand: 'Allen & Heath',
        brandColor: '#f97316',
        category: 'dj_mixer',
        categoryLabel: 'Mixer Club Analogico & Doppia Scheda Audio 32-bit',
        kind: 'audiooutput',
        channels: 8,
        sampleRate: 96000,
        latencyMs: 1.8,
      },
      jbl_prx: {
        name: 'JBL Professional PRX ONE (Impianto Diffusione Club PA Line-Array)',
        brand: 'JBL Professional',
        brandColor: '#ea580c',
        category: 'diffusion',
        categoryLabel: 'Diffusione Master / Impianto Casse Club ad Alta Potenza',
        kind: 'audiooutput',
        channels: 2,
        sampleRate: 96000,
        latencyMs: 1.5,
      },
      denon_prime4: {
        name: 'Denon DJ Prime 4 (Engine OS Pro Audio Interface)',
        brand: 'Denon DJ',
        brandColor: '#3b82f6',
        category: 'dj_mixer',
        categoryLabel: 'Console DJ Standalone & Diffusione Zona',
        kind: 'audiooutput',
        channels: 4,
        sampleRate: 48000,
        latencyMs: 2.8,
      },
      focusrite_scarlett: {
        name: 'Focusrite Scarlett 4i4 USB (Master L/R + Headphone Cue)',
        brand: 'Focusrite',
        brandColor: '#f43f5e',
        category: 'audio_interface',
        categoryLabel: 'Interfaccia Audio Professionale a Bassa Latenza',
        kind: 'audiooutput',
        channels: 4,
        sampleRate: 96000,
        latencyMs: 2.4,
      },
      shure_mic: {
        name: 'Shure SM7B USB Preamp (Ingresso Microfonico Vocale MC)',
        brand: 'Shure',
        brandColor: '#14b8a6',
        category: 'microphone',
        categoryLabel: 'Ingresso Microfono DJ / Voce MC Speaker',
        kind: 'audioinput',
        channels: 1,
        sampleRate: 48000,
        latencyMs: 2.0,
      },
      bose_s1: {
        name: 'Bose S1 Pro+ (Diffusione Suono Portatile con Mixer Integrato)',
        brand: 'Bose Professional',
        brandColor: '#0284c7',
        category: 'diffusion',
        categoryLabel: 'Diffusione Suono Master / Monitor Spia DJ',
        kind: 'audiooutput',
        channels: 2,
        sampleRate: 48000,
        latencyMs: 3.5,
      },
      airpods_pro: {
        name: 'Apple AirPods Pro (Spatial Audio / Monitoring Personale)',
        brand: 'Apple CoreAudio',
        brandColor: '#94a3b8',
        category: 'headphones',
        categoryLabel: 'Cuffie Pre-Ascolto Wireless & Monitor PFL',
        kind: 'audiooutput',
        channels: 2,
        sampleRate: 48000,
        latencyMs: 8.5,
      },
    };

    const target = presets[preset];
    if (!target) return;

    const simDevice: DetectedAudioDevice = {
      id: `sim-${Date.now()}`,
      name: target.name || 'Hardware DJ',
      brand: target.brand || 'Hardware DJ',
      brandColor: target.brandColor || '#06b6d4',
      category: target.category || 'dj_mixer',
      categoryLabel: target.categoryLabel || 'Mixer Hardware DJ',
      kind: target.kind || 'audiooutput',
      channels: target.channels || 4,
      sampleRate: target.sampleRate || 48000,
      latencyMs: target.latencyMs || 3.0,
      isSimulated: true,
      connectedAt: new Date(),
    };

    this.devices.push(simDevice);
    this.notifyListeners({ action: 'connected', device: simDevice });
  }

  public disconnectDevice(deviceId: string) {
    const removed = this.devices.find((d) => d.id === deviceId);
    this.devices = this.devices.filter((d) => d.id !== deviceId);
    if (removed) {
      this.notifyListeners({ action: 'disconnected', device: removed });
    }
  }
}

export const hardwareDetector = new HardwareDetector();
