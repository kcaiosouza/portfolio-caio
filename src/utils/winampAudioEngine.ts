import { WinampPlaybackStatus, WinampEqPreset } from '../types/winamp';
import { WINAMP_EQ_FREQUENCIES } from './winampTracks';

export type WinampAudioEvent =
  | 'statusChange'
  | 'timeUpdate'
  | 'ended'
  | 'volumeChange'
  | 'balanceChange'
  | 'eqChange'
  | 'error';

export class WinampAudioEngine {
  private audio: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private preampGainNode: GainNode | null = null;
  private filterNodes: BiquadFilterNode[] = [];
  private pannerNode: StereoPannerNode | null = null;
  private volumeGainNode: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;

  private isAudioGraphConnected: boolean = false;
  private corsBlocked: boolean = false;

  private volume: number = 80; // 0 to 100
  private balance: number = 0; // -1 to 1
  private preamp: number = 0; // dB, -12 to +12
  private eqBands: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; // 10 bands dB
  private eqOn: boolean = true;
  private playbackStatus: WinampPlaybackStatus = 'stopped';
  private currentTrackUrl: string = '';

  private listeners: Map<string, Set<Function>> = new Map();

  constructor() {
    // Lazy initialize on first interaction or init() call
  }

  /**
   * Initializes the HTML5 Audio element and attaches event listeners.
   */
  public init(): HTMLAudioElement | null {
    if (typeof window === 'undefined') return null;

    if (!this.audio && typeof Audio !== 'undefined') {
      try {
        this.audio = new Audio();
        this.audio.crossOrigin = 'anonymous';
        this.audio.preload = 'auto';
        this.setupAudioListeners();
      } catch (err) {
        console.warn('Could not create Audio element:', err);
      }
    }

    this.initAudioContext();
    return this.audio;
  }

  /**
   * Returns the underlying HTMLAudioElement instance, if initialized.
   */
  public getAudioElement(): HTMLAudioElement | null {
    if (!this.audio) {
      this.init();
    }
    return this.audio;
  }

  /**
   * Sets up event listeners on HTMLAudioElement
   */
  private setupAudioListeners(): void {
    if (!this.audio) return;

    this.audio.addEventListener('play', () => {
      this.playbackStatus = 'playing';
      this.emit('statusChange', 'playing');
    });

    this.audio.addEventListener('pause', () => {
      if (this.playbackStatus !== 'stopped') {
        this.playbackStatus = 'paused';
        this.emit('statusChange', 'paused');
      }
    });

    this.audio.addEventListener('ended', () => {
      this.playbackStatus = 'stopped';
      this.emit('statusChange', 'stopped');
      this.emit('ended');
    });

    this.audio.addEventListener('timeupdate', () => {
      if (this.audio) {
        this.emit('timeUpdate', this.audio.currentTime, this.audio.duration || 0);
      }
    });

    this.audio.addEventListener('error', () => {
      if (this.audio && this.audio.crossOrigin) {
        // If CORS blocked with anonymous, fallback to direct audio playback without crossOrigin
        this.corsBlocked = true;
        this.audio.removeAttribute('crossOrigin');
        if (this.currentTrackUrl) {
          const currentTime = this.audio.currentTime;
          this.audio.src = this.currentTrackUrl;
          this.audio.currentTime = currentTime;
          if (this.playbackStatus === 'playing') {
            this.audio.play().catch(() => {});
          }
        }
      }
      this.emit('error', this.audio?.error);
    });
  }

  /**
   * Sets up the Web Audio API graph (source -> preamp -> 10 filters -> panner -> volume -> analyser -> destination)
   */
  private initAudioContext(): void {
    if (this.isAudioGraphConnected || typeof window === 'undefined') return;

    try {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;

      if (!AudioContextClass) return;

      if (!this.audioCtx) {
        this.audioCtx = new AudioContextClass();
      }

      if (!this.audio) {
        this.audio = new Audio();
        this.audio.crossOrigin = 'anonymous';
        this.setupAudioListeners();
      }

      // Check if createMediaElementSource is supported
      if (typeof this.audioCtx.createMediaElementSource === 'function' && !this.sourceNode) {
        this.sourceNode = this.audioCtx.createMediaElementSource(this.audio);

        // Preamp Gain
        this.preampGainNode = this.audioCtx.createGain();
        const initialPreampGain = this.eqOn ? Math.pow(10, this.preamp / 20) : 1.0;
        this.preampGainNode.gain.setValueAtTime(initialPreampGain, this.audioCtx.currentTime);

        // 10 Peaking Filter Nodes
        this.filterNodes = WINAMP_EQ_FREQUENCIES.map((freq, idx) => {
          const filter = this.audioCtx!.createBiquadFilter();
          filter.type = 'peaking';
          filter.frequency.setValueAtTime(freq, this.audioCtx!.currentTime);
          filter.Q.setValueAtTime(1.4, this.audioCtx!.currentTime);
          filter.gain.setValueAtTime(this.eqOn ? this.eqBands[idx] : 0, this.audioCtx!.currentTime);
          return filter;
        });

        // Stereo Panner Node
        if (typeof this.audioCtx.createStereoPanner === 'function') {
          this.pannerNode = this.audioCtx.createStereoPanner();
          this.pannerNode.pan.setValueAtTime(this.balance, this.audioCtx.currentTime);
        }

        // Master Volume Gain Node
        this.volumeGainNode = this.audioCtx.createGain();
        this.volumeGainNode.gain.setValueAtTime(this.volume / 100, this.audioCtx.currentTime);

        // Analyser Node (64 fftSize gives 32 frequency bins, ideal for Winamp visualizer)
        this.analyserNode = this.audioCtx.createAnalyser();
        this.analyserNode.fftSize = 64;
        this.analyserNode.smoothingTimeConstant = 0.8;

        // Connect graph chain:
        // source -> preamp -> filter 0 -> ... -> filter 9 -> (panner) -> volume -> analyser -> destination
        let lastNode: AudioNode = this.sourceNode;
        lastNode.connect(this.preampGainNode);
        lastNode = this.preampGainNode;

        for (const filter of this.filterNodes) {
          lastNode.connect(filter);
          lastNode = filter;
        }

        if (this.pannerNode) {
          lastNode.connect(this.pannerNode);
          lastNode = this.pannerNode;
        }

        lastNode.connect(this.volumeGainNode);
        this.volumeGainNode.connect(this.analyserNode);
        this.analyserNode.connect(this.audioCtx.destination);

        this.isAudioGraphConnected = true;
      }
    } catch (err) {
      console.warn('Web Audio API graph initialization fallback:', err);
      this.corsBlocked = true;
      this.isAudioGraphConnected = false;
    }
  }

  /**
   * Plays a track from the given URL starting at optional startTime in seconds.
   */
  public async playTrack(url: string, startTime: number = 0): Promise<void> {
    this.init();
    if (!this.audio) return;

    if (this.currentTrackUrl !== url || this.audio.src !== url) {
      this.currentTrackUrl = url;
      this.audio.src = url;
      this.audio.load();
    }

    if (startTime > 0) {
      this.audio.currentTime = startTime;
    }

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      try {
        await this.audioCtx.resume();
      } catch (err) {
        console.warn('AudioContext resume error:', err);
      }
    }

    try {
      this.playbackStatus = 'playing';
      this.emit('statusChange', 'playing');
      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
    } catch (err) {
      // In tests or before user interaction, autoplay may be rejected
      console.warn('Audio play request:', err);
      this.emit('error', err);
    }
  }

  /**
   * Pauses the audio playback.
   */
  public pause(): void {
    if (this.audio) {
      this.audio.pause();
    }
    this.playbackStatus = 'paused';
    this.emit('statusChange', 'paused');
  }

  /**
   * Resumes playback from current position.
   */
  public async resume(): Promise<void> {
    if (!this.audio) return;

    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      try {
        await this.audioCtx.resume();
      } catch (err) {
        console.warn('AudioContext resume error:', err);
      }
    }

    try {
      this.playbackStatus = 'playing';
      this.emit('statusChange', 'playing');
      const playPromise = this.audio.play();
      if (playPromise !== undefined) {
        await playPromise;
      }
    } catch (err) {
      console.warn('Audio resume error:', err);
      this.emit('error', err);
    }
  }

  /**
   * Stops playback and resets audio time to 0.
   */
  public stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    this.playbackStatus = 'stopped';
    this.emit('statusChange', 'stopped');
  }

  /**
   * Seeks audio to specified time in seconds.
   */
  public seek(time: number): void {
    if (this.audio) {
      const validTime = Math.max(0, Math.min(time, this.audio.duration || Infinity));
      this.audio.currentTime = validTime;
      this.emit('timeUpdate', validTime, this.audio.duration || 0);
    }
  }

  /**
   * Returns current playback time in seconds.
   */
  public getCurrentTime(): number {
    return this.audio?.currentTime || 0;
  }

  /**
   * Returns duration of currently loaded audio in seconds.
   */
  public getDuration(): number {
    return this.audio?.duration || 0;
  }

  /**
   * Returns current playback status ('playing' | 'paused' | 'stopped').
   */
  public getPlaybackStatus(): WinampPlaybackStatus {
    return this.playbackStatus;
  }

  /**
   * Sets volume between 0 and 100.
   */
  public setVolume(volume: number): void {
    const clamped = Math.max(0, Math.min(100, Math.round(volume)));
    this.volume = clamped;
    const gainVal = clamped / 100;

    if (this.volumeGainNode && this.audioCtx) {
      try {
        this.volumeGainNode.gain.setValueAtTime(gainVal, this.audioCtx.currentTime);
      } catch {
        this.volumeGainNode.gain.value = gainVal;
      }
    }

    if (this.audio) {
      this.audio.volume = gainVal;
    }

    this.emit('volumeChange', clamped);
  }

  /**
   * Gets volume between 0 and 100.
   */
  public getVolume(): number {
    return this.volume;
  }

  /**
   * Sets stereo balance between -1 (100% Left) and +1 (100% Right).
   */
  public setBalance(balance: number): void {
    const clamped = Math.max(-1, Math.min(1, balance));
    this.balance = clamped;

    if (this.pannerNode && this.audioCtx) {
      try {
        this.pannerNode.pan.setValueAtTime(clamped, this.audioCtx.currentTime);
      } catch {
        this.pannerNode.pan.value = clamped;
      }
    }

    this.emit('balanceChange', clamped);
  }

  /**
   * Gets stereo balance between -1 and +1.
   */
  public getBalance(): number {
    return this.balance;
  }

  /**
   * Sets gain in dB (-12 to +12) for a specific EQ band (0-9).
   */
  public setEqBand(index: number, db: number): void {
    if (index < 0 || index >= 10) return;
    const clampedDb = Math.max(-12, Math.min(12, db));
    this.eqBands[index] = clampedDb;

    if (this.eqOn && this.filterNodes[index] && this.audioCtx) {
      try {
        this.filterNodes[index].gain.setValueAtTime(clampedDb, this.audioCtx.currentTime);
      } catch {
        this.filterNodes[index].gain.value = clampedDb;
      }
    }

    this.emit('eqChange', { bands: [...this.eqBands], preamp: this.preamp, eqOn: this.eqOn });
  }

  /**
   * Returns current 10-band EQ values in dB.
   */
  public getEqBands(): number[] {
    return [...this.eqBands];
  }

  /**
   * Sets preamp gain in dB (-12 to +12).
   */
  public setPreamp(db: number): void {
    const clampedDb = Math.max(-12, Math.min(12, db));
    this.preamp = clampedDb;

    if (this.preampGainNode && this.audioCtx) {
      const gainVal = this.eqOn ? Math.pow(10, clampedDb / 20) : 1.0;
      try {
        this.preampGainNode.gain.setValueAtTime(gainVal, this.audioCtx.currentTime);
      } catch {
        this.preampGainNode.gain.value = gainVal;
      }
    }

    this.emit('eqChange', { bands: [...this.eqBands], preamp: this.preamp, eqOn: this.eqOn });
  }

  /**
   * Gets current preamp gain in dB.
   */
  public getPreamp(): number {
    return this.preamp;
  }

  /**
   * Enables or disables the EQ and preamp processing.
   */
  public setEqOn(enabled: boolean): void {
    this.eqOn = enabled;

    if (this.audioCtx) {
      this.filterNodes.forEach((node, i) => {
        const gainVal = enabled ? this.eqBands[i] : 0;
        try {
          node.gain.setValueAtTime(gainVal, this.audioCtx!.currentTime);
        } catch {
          node.gain.value = gainVal;
        }
      });

      if (this.preampGainNode) {
        const gainVal = enabled ? Math.pow(10, this.preamp / 20) : 1.0;
        try {
          this.preampGainNode.gain.setValueAtTime(gainVal, this.audioCtx!.currentTime);
        } catch {
          this.preampGainNode.gain.value = gainVal;
        }
      }
    }

    this.emit('eqChange', { bands: [...this.eqBands], preamp: this.preamp, eqOn: this.eqOn });
  }

  /**
   * Checks if EQ is currently enabled.
   */
  public isEqOn(): boolean {
    return this.eqOn;
  }

  /**
   * Applies an EQ preset (preamp and 10 bands).
   */
  public setPreset(preset: WinampEqPreset): void {
    this.setPreamp(preset.preamp);
    preset.bands.forEach((b, i) => {
      this.setEqBand(i, b);
    });
  }

  /**
   * Fills the provided Uint8Array with frequency FFT data.
   * If real FFT is unavailable (e.g. CORS blocked, AudioContext suspended, or mock environment),
   * generates an authentic procedural rhythmic simulation based on current playback and EQ.
   */
  public getFftData(outputArray: Uint8Array): void {
    if (this.playbackStatus !== 'playing') {
      outputArray.fill(0);
      return;
    }

    let hasRealData = false;
    if (this.analyserNode && !this.corsBlocked && this.audioCtx?.state === 'running') {
      try {
        this.analyserNode.getByteFrequencyData(outputArray as any);
        for (let i = 0; i < outputArray.length; i++) {
          if (outputArray[i] > 0) {
            hasRealData = true;
            break;
          }
        }
      } catch {
        hasRealData = false;
      }
    }

    // Fallback: procedural rhythmic simulation
    if (!hasRealData) {
      this.generateProceduralFft(outputArray);
    }
  }

  /**
   * Procedural rhythmic simulation for spectrum visualizer
   */
  private generateProceduralFft(outputArray: Uint8Array): void {
    const now = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
    const len = outputArray.length;
    const volMult = this.volume / 100;

    if (volMult === 0) {
      outputArray.fill(0);
      return;
    }

    // 128 BPM pulse
    const beatTime = now * 2.13;
    const beatPhase = beatTime % 1;
    const kick = Math.pow(Math.max(0, 1 - beatPhase * 2.2), 3);
    const snare = Math.pow(Math.max(0, 1 - ((beatTime + 0.5) % 1) * 3), 2);

    for (let i = 0; i < len; i++) {
      const norm = i / len;
      const freqDecay = Math.pow(1 - norm * 0.7, 1.2);

      const lowFreq = Math.sin(now * 8 + i * 0.6) * 35;
      const bassComponent = norm < 0.25 ? kick * 160 + lowFreq + 70 : 0;

      const midWave1 = Math.sin(now * 11 + i * 1.4) * 45;
      const midWave2 = Math.cos(now * 7 - i * 0.9) * 30;
      const midComponent = norm >= 0.15 && norm < 0.75 ? snare * 70 + midWave1 + midWave2 + 50 : 0;

      const highJitter = Math.sin(now * 37 + i * 23) > 0.1 ? 40 : 15;
      const highComponent = norm >= 0.6 ? highJitter : 0;

      let value = (bassComponent + midComponent + highComponent) * freqDecay;

      if (this.eqOn) {
        const eqBandIdx = Math.min(9, Math.floor(norm * 10));
        const bandGain = this.eqBands[eqBandIdx] || 0;
        value += bandGain * 3.5;
        value += this.preamp * 1.5;
      }

      outputArray[i] = Math.max(0, Math.min(255, Math.floor(value * volMult)));
    }
  }

  /**
   * Event subscription
   */
  public on(event: WinampAudioEvent, callback: Function): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(callback);
    return () => this.off(event, callback);
  }

  /**
   * Event unsubscription
   */
  public off(event: WinampAudioEvent, callback: Function): void {
    const set = this.listeners.get(event);
    if (set) {
      set.delete(callback);
    }
  }

  /**
   * Emit event to all registered listeners
   */
  private emit(event: WinampAudioEvent, ...args: any[]): void {
    const set = this.listeners.get(event);
    if (set) {
      set.forEach((cb) => {
        try {
          cb(...args);
        } catch (err) {
          console.error(`Error in WinampAudioEngine listener for ${event}:`, err);
        }
      });
    }
  }
}

export const winampAudioEngine = new WinampAudioEngine();
