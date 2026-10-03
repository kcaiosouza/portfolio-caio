export interface WinampTrack {
  id: string;
  title: string;
  artist: string;
  duration: number; // in seconds
  durationFormatted: string; // "3:45"
  url: string;
  isUserUploaded?: boolean;
}

export interface WinampEqPreset {
  name: string;
  preamp: number;
  bands: number[]; // 10 values between -12 and +12
}

export type WinampPlaybackStatus = 'stopped' | 'playing' | 'paused';

export type WinampVisualizerMode = 'spectrum' | 'oscilloscope' | 'off';

export interface WinampState {
  currentTrackIndex: number;
  playbackStatus: WinampPlaybackStatus;
  currentTime: number;
  duration: number;
  volume: number; // 0 - 100
  balance: number; // -1 to 1
  isMuted: boolean;
  shuffle: boolean;
  repeat: boolean;
  eqEnabled: boolean;
  eqPreamp: number;
  eqBands: number[];
  playlist: WinampTrack[];
  visualizerMode: WinampVisualizerMode;
}
