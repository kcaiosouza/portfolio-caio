import { useEffect, useRef } from 'react';

export const KONAMI_SEQUENCE: readonly string[] = [
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
] as const;

/**
 * Computes the next matched buffer for the Konami code sequence.
 * Finds the longest suffix of (currentBuffer + newKey) that matches a prefix of KONAMI_SEQUENCE.
 * This naturally handles consecutive 'ArrowUp' presses and resets cleanly on incorrect keys.
 */
function getNextBuffer(currentBuffer: readonly string[], newKey: string): string[] {
  const candidate = [...currentBuffer, newKey];
  for (let len = Math.min(candidate.length, KONAMI_SEQUENCE.length); len > 0; len--) {
    const suffix = candidate.slice(candidate.length - len);
    const prefix = KONAMI_SEQUENCE.slice(0, len);
    const matches = suffix.every(
      (key, index) => key.toLowerCase() === prefix[index].toLowerCase()
    );
    if (matches) {
      return suffix;
    }
  }
  return [];
}

/**
 * Global keyboard listener hook for the Konami Code:
 * ↑ ↑ ↓ ↓ ← → ← → B A
 *
 * @param onSuccess Callback invoked when the sequence is completed.
 * @param enabled Whether the keyboard listener is currently active (defaults to true).
 */
export function useKonamiCode(onSuccess: () => void, enabled: boolean = true): void {
  const bufferRef = useRef<string[]>([]);
  const callbackRef = useRef(onSuccess);

  useEffect(() => {
    callbackRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    if (!enabled) {
      bufferRef.current = [];
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      const nextBuffer = getNextBuffer(bufferRef.current, e.key);
      if (nextBuffer.length === KONAMI_SEQUENCE.length) {
        bufferRef.current = [];
        callbackRef.current();
      } else {
        bufferRef.current = nextBuffer;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [enabled]);
}
