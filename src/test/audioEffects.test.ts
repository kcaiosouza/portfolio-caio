import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { playXpErrorSound } from '../utils/audioEffects';

describe('audioEffects - playXpErrorSound', () => {
  const originalAudioContext = window.AudioContext;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    window.AudioContext = originalAudioContext;
  });

  it('safely executes without throwing when AudioContext is unavailable', () => {
    // Ensure AudioContext is undefined
    (window as any).AudioContext = undefined;
    (window as any).webkitAudioContext = undefined;

    expect(() => playXpErrorSound()).not.toThrow();
  });

  it('synthesizes Windows XP chord sound when AudioContext is supported', () => {
    const mockStart = vi.fn();
    const mockStop = vi.fn();
    const mockConnect = vi.fn();
    const mockSetValueAtTime = vi.fn();
    const mockExponentialRamp = vi.fn();

    const createdOscillators: any[] = [];
    const createdGains: any[] = [];

    class MockAudioContext {
      currentTime = 0;
      destination = {};

      createOscillator() {
        const osc = {
          type: 'sine',
          frequency: {
            setValueAtTime: mockSetValueAtTime,
          },
          connect: mockConnect,
          start: mockStart,
          stop: mockStop,
        };
        createdOscillators.push(osc);
        return osc;
      }

      createGain() {
        const gain = {
          gain: {
            setValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: mockExponentialRamp,
          },
          connect: mockConnect,
        };
        createdGains.push(gain);
        return gain;
      }
    }

    (window as any).AudioContext = MockAudioContext;

    expect(() => playXpErrorSound()).not.toThrow();

    // 4 frequencies for the XP chord: [261.63, 329.63, 392.00, 523.25]
    expect(createdOscillators).toHaveLength(4);
    expect(createdGains).toHaveLength(4);

    const expectedFrequencies = [261.63, 329.63, 392.00, 523.25];
    expectedFrequencies.forEach((freq) => {
      expect(mockSetValueAtTime).toHaveBeenCalledWith(freq, 0);
    });

    expect(mockStart).toHaveBeenCalledTimes(4);
    expect(mockStop).toHaveBeenCalledTimes(4);
  });

  it('handles AudioContext errors gracefully without throwing', () => {
    (window as any).AudioContext = class {
      constructor() {
        throw new Error('Autoplay blocked');
      }
    };

    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    expect(() => playXpErrorSound()).not.toThrow();
    expect(warnSpy).toHaveBeenCalled();
  });
});
