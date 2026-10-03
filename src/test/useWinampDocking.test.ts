import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  calculateMagneticSnap,
  useWinampDocking,
  WindowRect,
} from '../hooks/useWinampDocking';

describe('Winamp Magnetic Snapping Calculations', () => {
  const main: WindowRect = { x: 100, y: 100, width: 275, height: 116 };

  it('snaps moving window directly below target when within threshold', () => {
    // target bottom is 100 + 116 = 216
    const moving: WindowRect = { x: 105, y: 225, width: 275, height: 116 }; // dy = 9px <= 18, dx = 5px <= 36

    const snap = calculateMagneticSnap(moving, main, 18);
    expect(snap.snapped).toBe(true);
    expect(snap.x).toBe(100);
    expect(snap.y).toBe(216);
  });

  it('snaps moving window directly above target when within threshold', () => {
    // target top is 100, moving bottom is -20 + 116 = 96 (dy = 4px <= 18)
    const moving: WindowRect = { x: 102, y: -20, width: 275, height: 116 };

    const snap = calculateMagneticSnap(moving, main, 18);
    expect(snap.snapped).toBe(true);
    expect(snap.x).toBe(100);
    expect(snap.y).toBe(100 - 116); // -16
  });

  it('snaps moving window directly to the right when within threshold', () => {
    // target right is 100 + 275 = 375, moving x is 380 (dx = 5px <= 18)
    const moving: WindowRect = { x: 380, y: 104, width: 275, height: 116 };

    const snap = calculateMagneticSnap(moving, main, 18);
    expect(snap.snapped).toBe(true);
    expect(snap.x).toBe(375);
    expect(snap.y).toBe(100);
  });

  it('snaps moving window directly to the left when within threshold', () => {
    // target left is 100, moving right is -180 + 275 = 95 (dx = 5px <= 18)
    const moving: WindowRect = { x: -180, y: 103, width: 275, height: 116 };

    const snap = calculateMagneticSnap(moving, main, 18);
    expect(snap.snapped).toBe(true);
    expect(snap.x).toBe(100 - 275); // -175
    expect(snap.y).toBe(100);
  });

  it('does not snap when distance exceeds threshold', () => {
    const moving: WindowRect = { x: 100, y: 350, width: 275, height: 116 };

    const snap = calculateMagneticSnap(moving, main, 18);
    expect(snap.snapped).toBe(false);
    expect(snap.x).toBe(100);
    expect(snap.y).toBe(350);
  });

  it('respects custom threshold', () => {
    const moving: WindowRect = { x: 100, y: 226, width: 275, height: 116 }; // dy = 10px

    const snapStrict = calculateMagneticSnap(moving, main, 5);
    expect(snapStrict.snapped).toBe(false);

    const snapGenerous = calculateMagneticSnap(moving, main, 15);
    expect(snapGenerous.snapped).toBe(true);
    expect(snapGenerous.y).toBe(216);
  });
});

describe('useWinampDocking Hook', () => {
  it('initializes with default positions and docked states', () => {
    const { result } = renderHook(() => useWinampDocking());

    expect(result.current.mainPos).toEqual({ x: 320, y: 80, width: 275, height: 116 });
    expect(result.current.eqPos).toEqual({ x: 320, y: 196, width: 275, height: 116 });
    expect(result.current.plPos).toEqual({ x: 320, y: 312, width: 275, height: 232 });

    expect(result.current.isEqDocked).toBe(true);
    expect(result.current.isPlDocked).toBe(true);
    expect(result.current.isMainShade).toBe(false);
    expect(result.current.isEqShade).toBe(false);
    expect(result.current.isPlShade).toBe(false);
  });

  it('accepts custom initialMainPos', () => {
    const { result } = renderHook(() =>
      useWinampDocking({ x: 150, y: 50, width: 275, height: 116 })
    );

    expect(result.current.mainPos.x).toBe(150);
    expect(result.current.mainPos.y).toBe(50);
    expect(result.current.eqPos.x).toBe(150);
    expect(result.current.eqPos.y).toBe(166);
    expect(result.current.plPos.x).toBe(150);
    expect(result.current.plPos.y).toBe(282);
  });

  it('translates all docked windows together when moveMain is called', () => {
    const { result } = renderHook(() =>
      useWinampDocking({ x: 100, y: 100, width: 275, height: 116 })
    );

    act(() => {
      result.current.moveMain(25, 40);
    });

    expect(result.current.mainPos).toEqual({ x: 125, y: 140, width: 275, height: 116 });
    expect(result.current.eqPos).toEqual({ x: 125, y: 256, width: 275, height: 116 });
    expect(result.current.plPos).toEqual({ x: 125, y: 372, width: 275, height: 232 });
  });

  it('undocks and re-docks EQ via handleDragEq', () => {
    const { result } = renderHook(() =>
      useWinampDocking({ x: 100, y: 100, width: 275, height: 116 })
    );

    // Drag EQ far away -> undocks
    act(() => {
      const snapResult = result.current.handleDragEq({ x: 500, y: 500 });
      expect(snapResult.snapped).toBe(false);
    });

    expect(result.current.isEqDocked).toBe(false);
    expect(result.current.eqPos.x).toBe(500);
    expect(result.current.eqPos.y).toBe(500);

    // moveMain now only moves Main and PL, leaving EQ unmoved
    act(() => {
      result.current.moveMain(10, 10);
    });

    expect(result.current.mainPos.x).toBe(110);
    expect(result.current.mainPos.y).toBe(110);
    expect(result.current.plPos.x).toBe(110);
    expect(result.current.plPos.y).toBe(342);
    expect(result.current.eqPos.x).toBe(500);
    expect(result.current.eqPos.y).toBe(500);

    // Drag EQ back near main bottom (main is at y=110, height=116 -> bottom=226)
    act(() => {
      const snapResult = result.current.handleDragEq({ x: 115, y: 232 }, 18);
      expect(snapResult.snapped).toBe(true);
    });

    expect(result.current.isEqDocked).toBe(true);
    expect(result.current.eqPos.x).toBe(110);
    expect(result.current.eqPos.y).toBe(226);

    // Moving main moves EQ along again
    act(() => {
      result.current.moveMain(15, 15);
    });
    expect(result.current.mainPos.x).toBe(125);
    expect(result.current.eqPos.x).toBe(125);
    expect(result.current.eqPos.y).toBe(241);
  });

  it('undocks and re-docks PL via handleDragPl', () => {
    const { result } = renderHook(() =>
      useWinampDocking({ x: 100, y: 100, width: 275, height: 116 })
    );

    // Drag PL far away
    act(() => {
      const snapResult = result.current.handleDragPl({ x: 600, y: 600 });
      expect(snapResult.snapped).toBe(false);
    });

    expect(result.current.isPlDocked).toBe(false);
    expect(result.current.plPos.x).toBe(600);
    expect(result.current.plPos.y).toBe(600);

    // Move main: PL stays at 600, 600
    act(() => {
      result.current.moveMain(20, 20);
    });
    expect(result.current.plPos.x).toBe(600);
    expect(result.current.plPos.y).toBe(600);

    // Drag PL near EQ bottom (EQ is at 120, 236 with height 116 -> bottom 352)
    act(() => {
      const snapResult = result.current.handleDragPl({ x: 122, y: 358 }, 18);
      expect(snapResult.snapped).toBe(true);
    });

    expect(result.current.isPlDocked).toBe(true);
    expect(result.current.plPos.x).toBe(120);
    expect(result.current.plPos.y).toBe(352);
  });

  it('toggles windowshade rollup states and adjusts heights', () => {
    const { result } = renderHook(() =>
      useWinampDocking({ x: 100, y: 100, width: 275, height: 116 })
    );

    // Toggle Main windowshade
    act(() => {
      result.current.toggleMainShade();
    });

    expect(result.current.isMainShade).toBe(true);
    expect(result.current.mainPos.height).toBe(14);
    // Docked EQ and PL shift up by (116 - 14) = 102px
    expect(result.current.eqPos.y).toBe(114);
    expect(result.current.plPos.y).toBe(230);

    // Toggle EQ windowshade
    act(() => {
      result.current.toggleEqShade();
    });

    expect(result.current.isEqShade).toBe(true);
    expect(result.current.eqPos.height).toBe(14);
    // Docked PL shifts up by 102px
    expect(result.current.plPos.y).toBe(128);

    // Toggle PL windowshade
    act(() => {
      result.current.togglePlShade();
    });

    expect(result.current.isPlShade).toBe(true);
    expect(result.current.plPos.height).toBe(14);

    // Un-shade Main
    act(() => {
      result.current.toggleMainShade();
    });

    expect(result.current.isMainShade).toBe(false);
    expect(result.current.mainPos.height).toBe(116);
    expect(result.current.eqPos.y).toBe(216);
  });
});
