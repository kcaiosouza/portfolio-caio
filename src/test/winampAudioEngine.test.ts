import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  WINAMP_DEFAULT_TRACKS,
  DEFAULT_TRACKS,
  WINAMP_EQ_PRESETS,
  WINAMP_EQ_FREQUENCIES,
  WINAMP_EQ_LABELS,
  formatDuration,
} from '../utils/winampTracks';
import { WinampAudioEngine, winampAudioEngine } from '../utils/winampAudioEngine';

describe('Winamp Tracks & EQ Presets', () => {
  it('should have 5 default tracks with valid properties', () => {
    expect(WINAMP_DEFAULT_TRACKS).toHaveLength(5);
    expect(DEFAULT_TRACKS).toBe(WINAMP_DEFAULT_TRACKS);

    // Track 0: Winamp Intro
    const track0 = WINAMP_DEFAULT_TRACKS[0];
    expect(track0.title).toContain('Winamp Intro');
    expect(track0.url).toContain('llama-2.91.mp3');

    // Track 1: My Prayer - Editora Árvore da Vida
    const track1 = WINAMP_DEFAULT_TRACKS[1];
    expect(track1.title).toBe('My Prayer');
    expect(track1.artist).toBe('Editora Árvore da Vida');
    expect(track1.duration).toBe(225);
    expect(track1.durationFormatted).toBe('3:45');
    expect(track1.url).toBe(
      'https://storage.minklab.cloud/podcrer-media/audio/384d1368-913a-43b6-bd16-7a9dd2da0fd3.mp3'
    );

    // Track 2: Anelo por Tua Presença - Editora Árvore da Vida
    const track2 = WINAMP_DEFAULT_TRACKS[2];
    expect(track2.title).toBe('Anelo por Tua Presença');
    expect(track2.artist).toBe('Editora Árvore da Vida');
    expect(track2.duration).toBe(240);
    expect(track2.durationFormatted).toBe('4:00');
    expect(track2.url).toBe(
      'https://storage.minklab.cloud/podcrer-media/audio/e98167f0-98ce-4e2e-9d0f-eb99694ca9b0.mp3'
    );

    // Track 3: Echo - Crusher-P
    const track3 = WINAMP_DEFAULT_TRACKS[3];
    expect(track3.title).toBe('Echo');
    expect(track3.artist).toBe('Crusher-P');
    expect(track3.duration).toBe(230);
    expect(track3.durationFormatted).toBe('3:50');

    // Track 4: Midnight City - M83
    const track4 = WINAMP_DEFAULT_TRACKS[4];
    expect(track4.title).toBe('Midnight City');
    expect(track4.artist).toBe('M83');
    expect(track4.duration).toBe(243);
    expect(track4.durationFormatted).toBe('4:03');
  });

  it('should export all classic EQ presets with 10 bands', () => {
    expect(WINAMP_EQ_PRESETS.length).toBeGreaterThanOrEqual(6);

    const presetNames = WINAMP_EQ_PRESETS.map((p) => p.name);
    expect(presetNames).toContain('Flat');
    expect(presetNames).toContain('Rock');
    expect(presetNames).toContain('Pop');
    expect(presetNames).toContain('Bass Boost');
    expect(presetNames).toContain('Vocal / Talk');
    expect(presetNames).toContain('Acoustic');

    WINAMP_EQ_PRESETS.forEach((preset) => {
      expect(preset.bands).toHaveLength(10);
      preset.bands.forEach((band) => {
        expect(band).toBeGreaterThanOrEqual(-12);
        expect(band).toBeLessThanOrEqual(12);
      });
      expect(preset.preamp).toBeGreaterThanOrEqual(-12);
      expect(preset.preamp).toBeLessThanOrEqual(12);
    });
  });

  it('should have 10 standard EQ frequencies and labels', () => {
    expect(WINAMP_EQ_FREQUENCIES).toEqual([60, 170, 310, 600, 1000, 3000, 6000, 12000, 14000, 16000]);
    expect(WINAMP_EQ_LABELS).toEqual(['60', '170', '310', '600', '1K', '3K', '6K', '12K', '14K', '16K']);
  });

  it('should format duration in mm:ss correctly', () => {
    expect(formatDuration(0)).toBe('0:00');
    expect(formatDuration(5)).toBe('0:05');
    expect(formatDuration(65)).toBe('1:05');
    expect(formatDuration(225)).toBe('3:45');
    expect(formatDuration(-1)).toBe('0:00');
    expect(formatDuration(NaN)).toBe('0:00');
  });
});

describe('WinampAudioEngine', () => {
  let engine: WinampAudioEngine;

  beforeEach(() => {
    // Mock HTMLMediaElement.prototype.play and pause in jsdom if needed
    window.HTMLMediaElement.prototype.play = vi.fn().mockImplementation(() => Promise.resolve());
    window.HTMLMediaElement.prototype.pause = vi.fn().mockImplementation(() => {});
    window.HTMLMediaElement.prototype.load = vi.fn().mockImplementation(() => {});

    engine = new WinampAudioEngine();
    engine.init();
  });

  it('should export a singleton instance', () => {
    expect(winampAudioEngine).toBeInstanceOf(WinampAudioEngine);
  });

  it('should initialize and provide audio element', () => {
    const audio = engine.getAudioElement();
    expect(audio).toBeTruthy();
    expect(audio?.tagName).toBe('AUDIO');
  });

  it('should manage volume and clamp between 0 and 100', () => {
    engine.setVolume(50);
    expect(engine.getVolume()).toBe(50);

    // Clamping
    engine.setVolume(150);
    expect(engine.getVolume()).toBe(100);

    engine.setVolume(-20);
    expect(engine.getVolume()).toBe(0);
  });

  it('should manage balance and clamp between -1 and 1', () => {
    engine.setBalance(0.5);
    expect(engine.getBalance()).toBe(0.5);

    // Clamping
    engine.setBalance(2);
    expect(engine.getBalance()).toBe(1);

    engine.setBalance(-5);
    expect(engine.getBalance()).toBe(-1);
  });

  it('should manage 10 EQ bands and clamp between -12 and +12', () => {
    const initialBands = engine.getEqBands();
    expect(initialBands).toHaveLength(10);

    engine.setEqBand(0, 6);
    expect(engine.getEqBands()[0]).toBe(6);

    // Clamping
    engine.setEqBand(1, 20);
    expect(engine.getEqBands()[1]).toBe(12);

    engine.setEqBand(2, -25);
    expect(engine.getEqBands()[2]).toBe(-12);

    // Invalid index ignored
    engine.setEqBand(15, 5);
    engine.setEqBand(-1, 5);
    expect(engine.getEqBands()).toHaveLength(10);
  });

  it('should manage preamp and clamp between -12 and +12', () => {
    engine.setPreamp(4);
    expect(engine.getPreamp()).toBe(4);

    engine.setPreamp(20);
    expect(engine.getPreamp()).toBe(12);

    engine.setPreamp(-20);
    expect(engine.getPreamp()).toBe(-12);
  });

  it('should toggle EQ enabled state', () => {
    expect(engine.isEqOn()).toBe(true);
    engine.setEqOn(false);
    expect(engine.isEqOn()).toBe(false);
    engine.setEqOn(true);
    expect(engine.isEqOn()).toBe(true);
  });

  it('should apply an EQ preset', () => {
    const rockPreset = WINAMP_EQ_PRESETS.find((p) => p.name === 'Rock')!;
    engine.setPreset(rockPreset);

    expect(engine.getPreamp()).toBe(rockPreset.preamp);
    expect(engine.getEqBands()).toEqual(rockPreset.bands);
  });

  it('should manage playback lifecycle: play, pause, resume, seek, stop', async () => {
    expect(engine.getPlaybackStatus()).toBe('stopped');

    const track = WINAMP_DEFAULT_TRACKS[1];
    await engine.playTrack(track.url);
    expect(engine.getPlaybackStatus()).toBe('playing');

    engine.pause();
    expect(engine.getPlaybackStatus()).toBe('paused');

    await engine.resume();
    expect(engine.getPlaybackStatus()).toBe('playing');

    engine.seek(30);
    expect(engine.getCurrentTime()).toBe(30);

    engine.stop();
    expect(engine.getPlaybackStatus()).toBe('stopped');
    expect(engine.getCurrentTime()).toBe(0);
  });

  it('should return zeros for FFT data when stopped, and animated data when playing', async () => {
    const buffer = new Uint8Array(32);

    // When stopped: all 0
    engine.stop();
    engine.getFftData(buffer);
    const sumStopped = buffer.reduce((a, b) => a + b, 0);
    expect(sumStopped).toBe(0);

    // When playing: procedural simulation generates dancing spectrum
    await engine.playTrack(WINAMP_DEFAULT_TRACKS[0].url);
    engine.getFftData(buffer);
    const sumPlaying = buffer.reduce((a, b) => a + b, 0);
    expect(sumPlaying).toBeGreaterThan(0);
  });

  it('should support event subscription and unsubscription', async () => {
    const statusChanges: string[] = [];
    const unsubscribe = engine.on('statusChange', (status: string) => {
      statusChanges.push(status);
    });

    await engine.playTrack(WINAMP_DEFAULT_TRACKS[0].url);
    engine.pause();
    engine.stop();

    expect(statusChanges).toEqual(['playing', 'paused', 'stopped']);

    // Unsubscribe
    unsubscribe();
    await engine.playTrack(WINAMP_DEFAULT_TRACKS[0].url);
    expect(statusChanges).toEqual(['playing', 'paused', 'stopped']); // no additional status change
  });
});
