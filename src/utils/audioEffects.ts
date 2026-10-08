/**
 * Synthesizes the iconic Windows XP Critical Error / Chord sound
 * using the Web Audio API without external file dependencies.
 */
export function playXpErrorSound(): void {
  try {
    if (typeof window === 'undefined') return;

    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    // Frequencies of the classic Windows XP Chord (C major chord with bite)
    const chordFrequencies = [261.63, 329.63, 392.00, 523.25]; // C4, E4, G4, C5

    chordFrequencies.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = idx % 2 === 0 ? 'sawtooth' : 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.7);
    });
  } catch (err) {
    console.warn('AudioContext not allowed or not supported:', err);
  }
}
