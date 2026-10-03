import { WinampTrack, WinampEqPreset } from '../types/winamp';

export const WINAMP_DEFAULT_TRACKS: WinampTrack[] = [
  {
    id: 'track-0',
    title: "Winamp Intro (It Really Whips the Llama's Ass)",
    artist: 'DJ Mike Llama / Nullsoft',
    duration: 5,
    durationFormatted: '0:05',
    url: 'https://cdn.jsdelivr.net/gh/captbaritone/webamp@43434d82cfe0e37286dbbe0666072dc3190a83bc/mp3/llama-2.91.mp3',
  },
  {
    id: 'track-1',
    title: 'My Prayer',
    artist: 'Editora Árvore da Vida',
    duration: 225,
    durationFormatted: '3:45',
    url: 'https://storage.minklab.cloud/podcrer-media/audio/384d1368-913a-43b6-bd16-7a9dd2da0fd3.mp3',
  },
  {
    id: 'track-2',
    title: 'Anelo por Tua Presença',
    artist: 'Editora Árvore da Vida',
    duration: 240,
    durationFormatted: '4:00',
    url: 'https://storage.minklab.cloud/podcrer-media/audio/e98167f0-98ce-4e2e-9d0f-eb99694ca9b0.mp3',
  },
  {
    id: 'track-3',
    title: 'Echo',
    artist: 'Crusher-P',
    duration: 230,
    durationFormatted: '3:50',
    url: 'https://storage.minklab.cloud/podcrer-media/audio/48a3201c-314c-49b8-ae24-4462b832cef2.mp3',
  },
  {
    id: 'track-4',
    title: 'Midnight City',
    artist: 'M83',
    duration: 243,
    durationFormatted: '4:03',
    url: 'https://storage.minklab.cloud/podcrer-media/audio/3ccbd100-ee53-4884-a701-288271f8beb0.mp3',
  },
];

export const DEFAULT_TRACKS = WINAMP_DEFAULT_TRACKS;

export const WINAMP_EQ_PRESETS: WinampEqPreset[] = [
  {
    name: 'Flat',
    preamp: 0,
    bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  },
  {
    name: 'Rock',
    preamp: 0,
    bands: [4.8, 3.2, -1.6, -3.2, -1.0, 1.5, 4.0, 5.5, 5.5, 5.5],
  },
  {
    name: 'Pop',
    preamp: 0,
    bands: [-1.6, 1.2, 4.2, 4.5, 3.0, -1.0, -1.5, -1.5, -1.0, -1.0],
  },
  {
    name: 'Bass Boost',
    preamp: 2.0,
    bands: [7.0, 5.5, 4.0, 2.0, 0.0, -1.5, -2.5, -3.0, -3.0, -3.0],
  },
  {
    name: 'Vocal / Talk',
    preamp: 0,
    bands: [-2.0, -3.0, -2.0, 1.5, 4.0, 4.0, 2.5, 0.5, -1.0, -2.5],
  },
  {
    name: 'Acoustic',
    preamp: 0,
    bands: [3.5, 3.0, 2.0, 1.0, 1.5, 1.5, 2.5, 3.0, 2.5, 1.5],
  },
];

export const WINAMP_EQ_FREQUENCIES = [60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000];
export const WINAMP_EQ_LABELS = ['60', '170', '310', '600', '1K', '3K', '6K', '12K', '14K', '16K'];

export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export const DEFAULT_WINAMP_TRACKS = WINAMP_DEFAULT_TRACKS;
