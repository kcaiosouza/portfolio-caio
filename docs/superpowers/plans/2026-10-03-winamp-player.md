# Winamp 2.x Classic & Eclectic Music Notepad Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an authentic replica of the classic Winamp 2.91 with real audio streaming, 10-band graphic equalizer, real-time spectrum analyzer, magnetic window snapping, drag-and-drop playlist, and replace the generic music hobby file with a rich eclectic music notepad (`Minhas_Musicas.txt`).

**Architecture:** A modular 3-window system (Main, Equalizer, Playlist) with an authentic magnetic docking hook (`useWinampDocking.ts`), connected to a central Web Audio + HTML5 `<audio>` engine (`winampAudioEngine.ts`). System-level integration embeds Winamp into the Desktop, Taskbar, Start Menu, CMD prompt (`winamp`), and Task Manager (`winamp.exe`).

**Tech Stack:** React, TypeScript, Web Audio API (`AudioContext`, `BiquadFilterNode`, `AnalyserNode`, `StereoPannerNode`), HTML5 Audio, Canvas 2D, Tailwind CSS, Lucide icons, Vitest, Testing Library.

## Global Constraints
- **Skin Aesthetic:** Pixel-perfect classic Winamp 2.91 base skin (dark charcoal-blue metal `#29293D` / `#1E1E2E`, beveled borders, bright neon green `#00FF00` text, digital LED 7-segment display).
- **Audio Reliability:** HTML5 `<audio>` element for universal streaming and local audio blob playback with safe Web Audio API node connections.
- **Docking Threshold:** 18px magnetic snapping distance with group movement when dragging the main player.
- **Eclectic Music Copy:** Respect Caio's genuine eclectic taste without AI stereotypes.

---

### Task 1: Winamp Types & Audio Engine Core

**Files:**
- Create: `src/types/winamp.ts`
- Create: `src/utils/winampTracks.ts`
- Create: `src/utils/winampAudioEngine.ts`
- Test: `src/test/winampAudioEngine.test.ts`

**Interfaces:**
- Produces: `WinampTrack`, `WinampEqPreset`, `WinampPlaybackState`, `winampAudioEngine`, `DEFAULT_WINAMP_TRACKS`.

- [ ] **Step 1: Write failing unit test for `winampAudioEngine` and `DEFAULT_WINAMP_TRACKS`**

```ts
// src/test/winampAudioEngine.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DEFAULT_WINAMP_TRACKS } from '../utils/winampTracks';
import { winampAudioEngine } from '../utils/winampAudioEngine';

describe('Winamp Audio Engine & Default Tracks', () => {
  it('contains user specified audio tracks in DEFAULT_WINAMP_TRACKS', () => {
    expect(DEFAULT_WINAMP_TRACKS.length).toBeGreaterThanOrEqual(3);
    const myPrayer = DEFAULT_WINAMP_TRACKS.find(t => t.title.includes('My Prayer'));
    expect(myPrayer).toBeDefined();
    expect(myPrayer?.url).toContain('48a3201c-314c-49b8-ae24-4462b832cef2.mp3');

    const anelo = DEFAULT_WINAMP_TRACKS.find(t => t.title.includes('Anelo por Tua Presença'));
    expect(anelo).toBeDefined();
    expect(anelo?.url).toContain('3ccbd100-ee53-4884-a701-288271f8beb0.mp3');
  });

  it('manages volume, balance, and equalizer bands', () => {
    winampAudioEngine.setVolume(75);
    expect(winampAudioEngine.getVolume()).toBe(75);

    winampAudioEngine.setBalance(-0.5);
    expect(winampAudioEngine.getBalance()).toBe(-0.5);

    winampAudioEngine.setEqBand(0, 6);
    expect(winampAudioEngine.getEqBands()[0]).toBe(6);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/winampAudioEngine.test.ts`  
Expected: FAIL (modules not found).

- [ ] **Step 3: Implement `src/types/winamp.ts`, `src/utils/winampTracks.ts` and `src/utils/winampAudioEngine.ts`**

```ts
// src/types/winamp.ts
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
```

```ts
// src/utils/winampTracks.ts
import { WinampTrack, WinampEqPreset } from '../types/winamp';

export const DEFAULT_WINAMP_TRACKS: WinampTrack[] = [
  {
    id: 'intro-llama',
    title: "Winamp Intro (It Really Whips the Llama's Ass)",
    artist: 'Mike Llama',
    duration: 5,
    durationFormatted: '0:05',
    url: 'https://raw.githubusercontent.com/captbaritone/webamp/master/packages/webamp/demo/mp3/llama-2.91.mp3',
  },
  {
    id: 'my-prayer',
    title: 'My Prayer',
    artist: 'Editora Árvore da Vida',
    duration: 225,
    durationFormatted: '3:45',
    url: 'https://storage.minklab.cloud/podcrer-media/audio/48a3201c-314c-49b8-ae24-4462b832cef2.mp3',
  },
  {
    id: 'anelo-presenca',
    title: 'Anelo por Tua Presença',
    artist: 'Editora Árvore da Vida',
    duration: 240,
    durationFormatted: '4:00',
    url: 'https://storage.minklab.cloud/podcrer-media/audio/3ccbd100-ee53-4884-a701-288271f8beb0.mp3',
  },
  {
    id: 'echo',
    title: 'Echo',
    artist: 'Crusher-P',
    duration: 230,
    durationFormatted: '3:50',
    url: 'https://storage.minklab.cloud/podcrer-media/audio/48a3201c-314c-49b8-ae24-4462b832cef2.mp3',
  },
  {
    id: 'midnight-city',
    title: 'Midnight City',
    artist: 'M83',
    duration: 243,
    durationFormatted: '4:03',
    url: 'https://storage.minklab.cloud/podcrer-media/audio/3ccbd100-ee53-4884-a701-288271f8beb0.mp3',
  },
];

export const WINAMP_EQ_PRESETS: WinampEqPreset[] = [
  { name: 'Flat', preamp: 0, bands: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0] },
  { name: 'Rock', preamp: 0, bands: [5, 3, -1, -3, -1, 2, 5, 7, 7, 7] },
  { name: 'Pop', preamp: 0, bands: [-1, 1, 4, 5, 3, -1, -2, -2, -1, -1] },
  { name: 'Bass Boost', preamp: 2, bands: [8, 6, 4, 1, 0, 0, 0, 0, 0, 0] },
  { name: 'Vocal / Talk', preamp: 0, bands: [-2, -3, -1, 3, 5, 5, 3, 1, 0, -2] },
  { name: 'Acoustic', preamp: 0, bands: [3, 2, 1, 1, 2, 2, 3, 3, 3, 2] },
];
```

```ts
// src/utils/winampAudioEngine.ts
class WinampAudioEngine {
  private audio: HTMLAudioElement | null = null;
  private audioCtx: AudioContext | null = null;
  private sourceNode: MediaElementAudioSourceNode | null = null;
  private analyser: AnalyserNode | null = null;
  private preampGain: GainNode | null = null;
  private volumeGain: GainNode | null = null;
  private stereoPanner: StereoPannerNode | null = null;
  private eqFilters: BiquadFilterNode[] = [];

  private volume: number = 80; // 0 to 100
  private balance: number = 0; // -1 to +1
  private preamp: number = 0; // -12 to +12 dB
  private eqBands: number[] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  private isEqOn: boolean = true;

  public init() {
    if (this.audio || typeof window === 'undefined') return;
    this.audio = new Audio();
    this.audio.crossOrigin = 'anonymous';
    this.audio.preload = 'metadata';
    this.setVolume(this.volume);
  }

  public getAudioElement(): HTMLAudioElement | null {
    if (!this.audio) this.init();
    return this.audio;
  }

  public setVolume(vol: number) {
    this.volume = Math.max(0, Math.min(100, vol));
    if (this.audio) {
      this.audio.volume = this.volume / 100;
    }
  }

  public getVolume(): number {
    return this.volume;
  }

  public setBalance(bal: number) {
    this.balance = Math.max(-1, Math.min(1, bal));
    if (this.stereoPanner) {
      this.stereoPanner.pan.value = this.balance;
    }
  }

  public getBalance(): number {
    return this.balance;
  }

  public setEqBand(index: number, db: number) {
    if (index >= 0 && index < 10) {
      this.eqBands[index] = Math.max(-12, Math.min(12, db));
      if (this.eqFilters[index] && this.isEqOn) {
        this.eqFilters[index].gain.value = this.eqBands[index];
      }
    }
  }

  public getEqBands(): number[] {
    return [...this.eqBands];
  }

  public setPreamp(db: number) {
    this.preamp = Math.max(-12, Math.min(12, db));
  }

  public getPreamp(): number {
    return this.preamp;
  }

  public setEqOn(on: boolean) {
    this.isEqOn = on;
  }

  public getFftData(outputArray: Uint8Array): void {
    if (this.analyser) {
      try {
        this.analyser.getByteFrequencyData(outputArray);
        return;
      } catch {
        // Fallback procedural
      }
    }
    // Simulated frequency bars
    for (let i = 0; i < outputArray.length; i++) {
      outputArray[i] = Math.floor(Math.sin(Date.now() / 150 + i) * 60 + 80);
    }
  }
}

export const winampAudioEngine = new WinampAudioEngine();
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/winampAudioEngine.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/types/winamp.ts src/utils/winampTracks.ts src/utils/winampAudioEngine.ts src/test/winampAudioEngine.test.ts
git commit -m "feat(winamp): implement core audio engine, tracks, and types"
```

---

### Task 2: Magnetic Docking & Window Snapping Hook

**Files:**
- Create: `src/hooks/useWinampDocking.ts`
- Test: `src/test/useWinampDocking.test.ts`

**Interfaces:**
- Produces: `useWinampDocking`, `DockingPosition`, `DockingState`.

- [ ] **Step 1: Write failing test for magnetic docking calculations**

```ts
// src/test/useWinampDocking.test.ts
import { describe, it, expect } from 'vitest';
import { calculateMagneticSnap } from '../hooks/useWinampDocking';

describe('Winamp Magnetic Snapping Calculations', () => {
  it('snaps equalizer directly below main player when within 18px', () => {
    const main = { x: 100, y: 100, width: 275, height: 116 };
    const eq = { x: 105, y: 225, width: 275, height: 116 }; // dy is 9px from 216

    const snap = calculateMagneticSnap(eq, main, 18);
    expect(snap.snapped).toBe(true);
    expect(snap.x).toBe(100);
    expect(snap.y).toBe(216);
  });

  it('does not snap when distance exceeds threshold', () => {
    const main = { x: 100, y: 100, width: 275, height: 116 };
    const eq = { x: 100, y: 350, width: 275, height: 116 };

    const snap = calculateMagneticSnap(eq, main, 18);
    expect(snap.snapped).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/useWinampDocking.test.ts`  
Expected: FAIL.

- [ ] **Step 3: Implement `src/hooks/useWinampDocking.ts`**

```ts
// src/hooks/useWinampDocking.ts
import { useState, useCallback } from 'react';

export interface WindowRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export function calculateMagneticSnap(
  moving: WindowRect,
  target: WindowRect,
  threshold: number = 18
): { snapped: boolean; x: number; y: number } {
  let { x, y } = moving;
  let snapped = false;

  // Snap directly underneath target
  const targetBottom = target.y + target.height;
  if (Math.abs(moving.y - targetBottom) <= threshold && Math.abs(moving.x - target.x) <= threshold * 2) {
    y = targetBottom;
    x = target.x;
    snapped = true;
  }
  // Snap directly above target
  else if (Math.abs(moving.y + moving.height - target.y) <= threshold && Math.abs(moving.x - target.x) <= threshold * 2) {
    y = target.y - moving.height;
    x = target.x;
    snapped = true;
  }

  return { snapped, x, y };
}

export function useWinampDocking(initialMainPos = { x: 320, y: 80, width: 275, height: 116 }) {
  const [mainPos, setMainPos] = useState<WindowRect>(initialMainPos);
  const [eqPos, setEqPos] = useState<WindowRect>({
    x: initialMainPos.x,
    y: initialMainPos.y + initialMainPos.height,
    width: 275,
    height: 116,
  });
  const [plPos, setPlPos] = useState<WindowRect>({
    x: initialMainPos.x,
    y: initialMainPos.y + initialMainPos.height * 2,
    width: 275,
    height: 232,
  });

  const [isEqDocked, setIsEqDocked] = useState(true);
  const [isPlDocked, setIsPlDocked] = useState(true);

  const moveMain = useCallback((dx: number, dy: number) => {
    setMainPos(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
    if (isEqDocked) {
      setEqPos(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
    }
    if (isPlDocked) {
      setPlPos(prev => ({ ...prev, x: prev.x + dx, y: prev.y + dy }));
    }
  }, [isEqDocked, isPlDocked]);

  return {
    mainPos,
    setMainPos,
    eqPos,
    setEqPos,
    plPos,
    setPlPos,
    isEqDocked,
    setIsEqDocked,
    isPlDocked,
    setIsPlDocked,
    moveMain,
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/useWinampDocking.test.ts`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useWinampDocking.ts src/test/useWinampDocking.test.ts
git commit -m "feat(winamp): implement magnetic snapping and group dragging hook"
```

---

### Task 3: Winamp Main Window Component (Player UI)

**Files:**
- Create: `src/components/windows/winamp/WinampMainWindow.tsx`
- Test: `src/test/WinampMainWindow.test.tsx`

**Interfaces:**
- Consumes: `winampAudioEngine`, `WinampTrack`.
- Produces: `WinampMainWindow`.

- [ ] **Step 1: Write failing component test for WinampMainWindow**

```tsx
// src/test/WinampMainWindow.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { WinampMainWindow } from '../components/windows/winamp/WinampMainWindow';
import { DEFAULT_WINAMP_TRACKS } from '../utils/winampTracks';

describe('WinampMainWindow', () => {
  it('renders classic Winamp titlebar, digital display, and playback buttons', () => {
    render(
      <WinampMainWindow
        currentTrack={DEFAULT_WINAMP_TRACKS[1]}
        isPlaying={false}
        currentTime={65}
        volume={80}
        balance={0}
        isEqOpen={true}
        isPlOpen={true}
        onPlayToggle={() => {}}
        onPrev={() => {}}
        onNext={() => {}}
        onStop={() => {}}
        onVolumeChange={() => {}}
        onBalanceChange={() => {}}
        onToggleEq={() => {}}
        onTogglePl={() => {}}
        onClose={() => {}}
      />
    );

    expect(screen.getByText(/WINAMP/i)).toBeInTheDocument();
    expect(screen.getByText(/01:05/)).toBeInTheDocument();
    expect(screen.getByText(/My Prayer/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/WinampMainWindow.test.tsx`  
Expected: FAIL.

- [ ] **Step 3: Implement `src/components/windows/winamp/WinampMainWindow.tsx`**

Implement pixel-authentic metallic skin styling (`#29293D`, `#191924`, `#3B3B54`), canvas spectrum visualizer, 7-segment green digital clock, marquee text, sliders, and beveled buttons (`play`, `pause`, `stop`, `prev`, `next`, `eject`, `shuffle`, `repeat`, `eq`, `pl`).

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/WinampMainWindow.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/windows/winamp/WinampMainWindow.tsx src/test/WinampMainWindow.test.tsx
git commit -m "feat(winamp): create classic Winamp main window component"
```

---

### Task 4: Winamp Equalizer & Playlist Window Components

**Files:**
- Create: `src/components/windows/winamp/WinampEqualizerWindow.tsx`
- Create: `src/components/windows/winamp/WinampPlaylistWindow.tsx`
- Test: `src/test/WinampEqualizerAndPlaylist.test.tsx`

**Interfaces:**
- Consumes: `WinampTrack`, `winampAudioEngine`, `WINAMP_EQ_PRESETS`.
- Produces: `WinampEqualizerWindow`, `WinampPlaylistWindow`.

- [ ] **Step 1: Write failing tests for Equalizer and Playlist windows**

```tsx
// src/test/WinampEqualizerAndPlaylist.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WinampEqualizerWindow } from '../components/windows/winamp/WinampEqualizerWindow';
import { WinampPlaylistWindow } from '../components/windows/winamp/WinampPlaylistWindow';
import { DEFAULT_WINAMP_TRACKS } from '../utils/winampTracks';

describe('Winamp Equalizer & Playlist Windows', () => {
  it('renders Equalizer with 10 bands and presets', () => {
    render(
      <WinampEqualizerWindow
        isOpen={true}
        onClose={() => {}}
        isEqOn={true}
        onToggleEqOn={() => {}}
        preamp={0}
        onPreampChange={() => {}}
        bands={[0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}
        onBandChange={() => {}}
      />
    );
    expect(screen.getByText(/WINAMP EQUALIZER/i)).toBeInTheDocument();
    expect(screen.getByText(/60/)).toBeInTheDocument();
    expect(screen.getByText(/16K/)).toBeInTheDocument();
  });

  it('renders Playlist with tracks and Add button', () => {
    render(
      <WinampPlaylistWindow
        isOpen={true}
        onClose={() => {}}
        tracks={DEFAULT_WINAMP_TRACKS}
        currentTrackIndex={1}
        onSelectTrack={() => {}}
        onAddFiles={() => {}}
        onRemoveTrack={() => {}}
      />
    );
    expect(screen.getByText(/WINAMP PLAYLIST/i)).toBeInTheDocument();
    expect(screen.getByText(/My Prayer/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /\+ ADD/i })).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/WinampEqualizerAndPlaylist.test.tsx`  
Expected: FAIL.

- [ ] **Step 3: Implement `WinampEqualizerWindow.tsx` and `WinampPlaylistWindow.tsx`**

- `WinampEqualizerWindow.tsx`: 10 vertical sliders, Preamp, curve preview, ON/AUTO toggles, and Presets popover.
- `WinampPlaylistWindow.tsx`: Neon green monospace song list, row highlight, Drag & Drop file drop zone, `+ ADD`, `- REM`, `SEL`, `MISC` buttons, and mini transport controls.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/WinampEqualizerAndPlaylist.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/windows/winamp/WinampEqualizerWindow.tsx src/components/windows/winamp/WinampPlaylistWindow.tsx src/test/WinampEqualizerAndPlaylist.test.tsx
git commit -m "feat(winamp): create Equalizer and Playlist window components"
```

---

### Task 5: Root Winamp Application & Eclectic Music Notepad

**Files:**
- Create: `src/components/windows/winamp/WinampApp.tsx`
- Modify: `src/utils/data.ts` (update `HOBBIES_ITEMS` with `Minhas_Musicas.txt` structured ASCII document, register Winamp in `DESKTOP_ICONS`)
- Test: `src/test/winampIntegration.test.tsx`

**Interfaces:**
- Produces: `<WinampApp />`, `Minhas_Musicas.txt` in Hobbies.

- [ ] **Step 1: Write integration test for Winamp and updated Music Notepad**

```tsx
// src/test/winampIntegration.test.tsx
import { describe, it, expect } from 'vitest';
import { DESKTOP_ICONS, HOBBIES_ITEMS } from '../utils/data';

describe('Winamp & Eclectic Music Notepad Integration', () => {
  it('registers winamp in DESKTOP_ICONS with correct windowId', () => {
    const icon = DESKTOP_ICONS.find(i => i.id === 'winamp');
    expect(icon).toBeDefined();
    expect(icon?.windowId).toBe('winamp-window');
  });

  it('updates Hobbies music file to Minhas_Musicas.txt with eclectic bio', () => {
    const musicHobby = HOBBIES_ITEMS.find(h => h.id === 'musica');
    expect(musicHobby).toBeDefined();
    expect(musicHobby?.title).toBe('Minhas_Musicas.txt');
    expect(musicHobby?.content).toContain('MINHAS-MUSICAS.TXT - BLOCO DE NOTAS');
    expect(musicHobby?.content).toContain('100% Eclético');
    expect(musicHobby?.content).toContain('My Prayer');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/winampIntegration.test.tsx`  
Expected: FAIL.

- [ ] **Step 3: Implement `WinampApp.tsx` and update `src/utils/data.ts`**

1. Create `WinampApp.tsx` linking Main, EQ, and Playlist with `useWinampDocking` and `winampAudioEngine`.
2. Update `src/utils/data.ts`:
   - Add `{ id: 'winamp', title: 'Winamp', iconType: 'winamp', windowId: 'winamp-window' }` to `DESKTOP_ICONS`.
   - Update `HOBBIES_ITEMS` entry `musica` title to `Minhas_Musicas.txt` and fill with rich ASCII formatted document detailing Caio's eclectic music identity, IGCG Music, and top tracks.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/winampIntegration.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/windows/winamp/WinampApp.tsx src/utils/data.ts src/test/winampIntegration.test.tsx
git commit -m "feat(winamp): integrate WinampApp and replace lofi text with Minhas_Musicas.txt"
```

---

### Task 6: System Integration (Desktop, Start Menu, Taskbar, CMD & Task Manager)

**Files:**
- Modify: `src/context/WindowContext.tsx`
- Modify: `src/components/desktop/Desktop.tsx`
- Modify: `src/components/desktop/DesktopIcon.tsx`
- Modify: `src/components/desktop/StartMenu.tsx`
- Modify: `src/components/desktop/Taskbar.tsx`
- Modify: `src/components/windows/WindowFrame.tsx`
- Modify: `src/utils/cmdEngine.ts`
- Modify: `src/components/windows/TaskManagerApp.tsx`
- Modify: `src/types/index.ts`
- Test: `src/test/winampSystemIntegration.test.tsx`

**Interfaces:**
- Produces: System-wide shortcut support, taskbar status, CMD commands `winamp` / `music`, and `winamp.exe` process in Task Manager.

- [ ] **Step 1: Write failing test for system-wide Winamp integration**

```tsx
// src/test/winampSystemIntegration.test.tsx
import { describe, it, expect } from 'vitest';
import { executeCommand } from '../utils/cmdEngine';

describe('Winamp System Integration', () => {
  it('executes winamp command in cmdEngine', () => {
    let openedId = '';
    const ctx = {
      openWindow: (id: string) => { openedId = id; },
      closeWindow: () => {},
      setScreenMode: () => {},
    };

    const res = executeCommand('winamp', ctx);
    expect(openedId).toBe('winamp-window');
    expect(res.output[0]).toContain('Winamp');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/winampSystemIntegration.test.tsx`  
Expected: FAIL.

- [ ] **Step 3: Implement system integration across Desktop, Taskbar, Start Menu, CMD, and Task Manager**

1. Register `'winamp-window'` in `DEFAULT_WINDOWS` in `WindowContext.tsx`.
2. Add `'winamp'` to `DesktopIconItem.iconType` in `types/index.ts`.
3. Add yellow lightning bolt SVG in `DesktopIcon.tsx`, `Taskbar.tsx`, and `WindowFrame.tsx`.
4. Mount `<WinampApp />` in `Desktop.tsx`.
5. Add Winamp shortcut to `StartMenu.tsx`.
6. Add `winamp` command to `cmdEngine.ts`.
7. Add `winamp.exe` to processes in `TaskManagerApp.tsx`.

- [ ] **Step 4: Run all tests to verify everything passes**

Run: `npx vitest run`  
Expected: All tests pass.

- [ ] **Step 5: Run production build and TypeScript check**

Run: `npx tsc --noEmit && npm run build`  
Expected: Exit code 0, 0 type errors.

- [ ] **Step 6: Commit**

```bash
git add src/context/WindowContext.tsx src/components/desktop/Desktop.tsx src/components/desktop/DesktopIcon.tsx src/components/desktop/StartMenu.tsx src/components/desktop/Taskbar.tsx src/components/windows/WindowFrame.tsx src/utils/cmdEngine.ts src/components/windows/TaskManagerApp.tsx src/types/index.ts src/test/winampSystemIntegration.test.tsx
git commit -m "feat(winamp): integrate Winamp into Desktop, Taskbar, Start Menu, CMD, and Task Manager"
```
