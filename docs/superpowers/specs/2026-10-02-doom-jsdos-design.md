# Design Spec: DOOM (1993) Integration via js-dos

## 1. Overview & Motivation
This specification defines the complete replacement of Counter-Strike 1.6 with DOOM (1993) in the Windows XP Portfolio. 

The previous CS 1.6 integration via an external `play-cs.com` iframe was blocked by Cloudflare Turnstile with HTTP 401 Unauthorized due to parent domain mismatch in cross-origin frames. 

DOOM (1993) runs locally in the browser using the open-source DOSBox WebAssembly emulator via the `js-dos` (v8) npm package and the official id Software Shareware Episode 1 bundle (`doom.jsdos`). This requires no external server, has zero captcha or iframe restrictions, and operates 100% locally with authentic Sound Blaster audio, high-performance WebGL canvas rendering, and keyboard controls.

Per user instruction, CS 1.6 will be completely removed as if it never existed (no aliases or remaining references).

## 2. Requirements & Constraints
- **Location**: Inside the `hobbies` folder as `Doom.exe` (no icon on Desktop).
- **CMD Command**: `doom` launches the DOOM window (`doom-window`). No `cstrike`/`cs` aliases remain.
- **Engine**: Local WebAssembly DOSBox execution via `js-dos` (v8.5.1).
- **Game Bundle**: `public/assets/doom.jsdos` (~5.5MB id Software Shareware v1.9 release).
- **Icon**: `public/assets/doom-icon.webp` (128x128px WebP icon of DOOM).
- **Window Behavior**:
  - `WindowFrame` with `id="doom-window"`, title `"DOOM (1993)"`, icon `"doom"`.
  - Starts maximized (`isMaximized: true`) to fill the screen above the 36px taskbar, with the classic blue Windows XP titlebar.
  - Proper lifecycle cleanup: when the window closes or unmounts, `ci.stop()` is invoked to silence audio and release WebAssembly/WebGL memory.
- **Git Safety**: Local commits only. **DO NOT PUSH TO REMOTE** (`origin/main`).

## 3. Architecture & File Changes

### 3.1 Data & Types
- `src/types/index.ts`:
  - `HobbyItem`: keep `'game'` in `type` union, optional `windowId?: string`.
- `src/utils/data.ts`:
  - Remove `cstrike` item.
  - Add to `HOBBIES_ITEMS`:
    ```typescript
    {
      id: 'doom',
      title: 'Doom.exe',
      type: 'game',
      content: 'Classic DOOM (1993) via DOSBox WASM',
      description: 'Clássico jogo de tiro em primeira pessoa de 1993 rodando via DOSBox WebAssembly.',
      windowId: 'doom-window'
    }
    ```

### 3.2 Command Prompt (`cmdEngine.ts`)
- Remove commands: `cstrike`, `cs`, `cs16`.
- Add command: `doom`:
  - Calls `ctx.openWindow('doom-window')`.
  - Returns `['Iniciando DOOM (1993)...']`.
  - Documented in `help` text.

### 3.3 Window Management (`WindowContext.tsx`)
- In `DEFAULT_WINDOWS`:
  - Replace `cs-window` with:
    ```typescript
    {
      id: 'doom-window',
      title: 'DOOM (1993)',
      icon: 'doom',
      isOpen: false,
      isMinimized: false,
      isMaximized: true,
      zIndex: 10,
      position: { x: 30, y: 15, width: 1024, height: 680 },
      defaultPosition: { x: 30, y: 15, width: 1024, height: 680 }
    }
    ```

### 3.4 Icon Rendering
- `public/assets/doom-icon.webp`: DOOM icon.
- `src/components/windows/WindowFrame.tsx`:
  - Remove case `'cs'`.
  - Add case `'doom'`:
    ```tsx
    case 'doom':
      return (
        <img
          src="/assets/doom-icon.webp"
          alt="DOOM"
          className="w-3.5 h-3.5 object-contain flex-shrink-0"
        />
      );
    ```
- `src/components/desktop/Taskbar.tsx`:
  - Remove case `'cs'`.
  - Add case `'doom'`:
    ```tsx
    case 'doom':
      return (
        <img
          src="/assets/doom-icon.webp"
          alt="DOOM"
          className="w-3.5 h-3.5 object-contain flex-shrink-0"
        />
      );
    ```
- `src/components/windows/ExplorerFolderApp.tsx`:
  - For `hobby.type === 'game'`, reference `/assets/doom-icon.webp`.

### 3.5 DOOM Application Window Component (`DoomApp.tsx`)
- Replaces `CsApp.tsx` (which will be removed).
- Mounts in `src/components/desktop/Desktop.tsx` as `<DoomApp />`.
- Implementation details:
  - Container `div` ref where `js-dos` mounts.
  - Dynamically imports `js-dos` or uses `DosPlayer` to run `/assets/doom.jsdos`.
  - Handles container resize and cleanup on window close.

## 4. Verification & Testing
- Unit tests in `src/test/cmdEngine.test.ts` to assert `doom` opens `doom-window` and `cstrike`/`cs` are removed.
- Unit tests in `src/test/DoomApp.test.tsx` to assert window title, icon, and container render when open.
- Full TypeScript check: `npx tsc --noEmit`.
- Full Vitest suite: `npx vitest run`.
- Local verification in Vite dev server.
