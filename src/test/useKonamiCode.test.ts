import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKonamiCode, KONAMI_SEQUENCE } from '../hooks/useKonamiCode';

describe('useKonamiCode hook', () => {
  it('exports KONAMI_SEQUENCE with standard 10 keys', () => {
    expect(KONAMI_SEQUENCE).toEqual([
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a',
    ]);
  });

  it('triggers callback when full Konami sequence is typed', () => {
    const callback = vi.fn();
    renderHook(() => useKonamiCode(callback));

    KONAMI_SEQUENCE.forEach((key) => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key }));
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('supports case-insensitive matching for letter keys (B and A)', () => {
    const callback = vi.fn();
    renderHook(() => useKonamiCode(callback));

    const sequenceWithCaps = [
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'B',
      'A',
    ];

    sequenceWithCaps.forEach((key) => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key }));
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('resets buffer if an incorrect key is pressed and does not trigger callback prematurely', () => {
    const callback = vi.fn();
    renderHook(() => useKonamiCode(callback));

    ['ArrowUp', 'ArrowUp', 'ArrowDown', 'x', 'ArrowLeft'].forEach((key) => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key }));
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('handles consecutive ArrowUp keys restarting the sequence properly', () => {
    const callback = vi.fn();
    renderHook(() => useKonamiCode(callback));

    // 4 ArrowUp presses followed by the rest of the sequence
    const sequenceWithExtraUps = [
      'ArrowUp',
      'ArrowUp',
      'ArrowUp',
      'ArrowUp',
      'ArrowDown',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
      'ArrowLeft',
      'ArrowRight',
      'b',
      'a',
    ];

    sequenceWithExtraUps.forEach((key) => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key }));
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('does not trigger callback when enabled is false', () => {
    const callback = vi.fn();
    renderHook(() => useKonamiCode(callback, false));

    KONAMI_SEQUENCE.forEach((key) => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key }));
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('cleans up event listener on unmount', () => {
    const callback = vi.fn();
    const { unmount } = renderHook(() => useKonamiCode(callback));

    unmount();

    KONAMI_SEQUENCE.forEach((key) => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key }));
    });

    expect(callback).not.toHaveBeenCalled();
  });

  it('uses the latest callback when callback reference changes', () => {
    const callback1 = vi.fn();
    const callback2 = vi.fn();

    const { rerender } = renderHook(
      ({ cb }) => useKonamiCode(cb),
      { initialProps: { cb: callback1 } }
    );

    // Enter partial sequence
    ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown'].forEach((key) => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key }));
    });

    // Re-render with new callback
    rerender({ cb: callback2 });

    // Enter remaining sequence
    ['ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'].forEach((key) => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key }));
    });

    expect(callback1).not.toHaveBeenCalled();
    expect(callback2).toHaveBeenCalledTimes(1);
  });

  it('can be triggered multiple times in succession', () => {
    const callback = vi.fn();
    renderHook(() => useKonamiCode(callback));

    // First completion
    KONAMI_SEQUENCE.forEach((key) => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key }));
    });
    expect(callback).toHaveBeenCalledTimes(1);

    // Second completion
    KONAMI_SEQUENCE.forEach((key) => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key }));
    });
    expect(callback).toHaveBeenCalledTimes(2);
  });
});
