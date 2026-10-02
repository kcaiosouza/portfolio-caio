# Counter-Strike 1.6 Web Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrate playable Counter-Strike 1.6 inside a maximized Windows XP window loading `https://play-cs.com/pt/servers` with secure sandbox controls, an optimized WebP icon converted via ffmpeg, and accessible via the Hobbies folder and CMD terminal.

**Architecture:** Convert the source JPEG icon to a high-performance WebP icon with `ffmpeg`, register `cs-window` with `isMaximized: true` by default, embed the game in `CsApp.tsx` with a hardened iframe configuration (no top navigation, full pointer-lock and audio permissions), add `Counter-Strike 1.6.exe` inside `hobbies` folder (`ExplorerFolderApp.tsx`), and support `cstrike` in `cmdEngine.ts`.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, ffmpeg, HTML5 Iframe (sandboxed), Vitest, React Testing Library.

## Global Constraints

- **CRITICAL - DO NOT PUSH**: This feature is a test. Never run `git push`. Commit locally only!
- **No Desktop Icon**: Do NOT add any CS icon to the desktop (`DESKTOP_ICONS` must remain unchanged).
- **Hobbies Placement**: The app must reside inside the `hobbies` folder (`HOBBIES_ITEMS`) as `Counter-Strike 1.6.exe`.
- **CMD Command**: CMD must support `cstrike` (with aliases `cs`, `cs16`) to launch `cs-window`.
- **Iframe Attributes**:
  - `src="https://play-cs.com/pt/servers"`
  - `sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-popups allow-forms"` (must NOT contain `allow-top-navigation`)
  - `allow="autoplay; fullscreen; pointer-lock; gamepad; cross-origin-isolated"`
- **Window Sizing**: Must open maximized (`isMaximized: true`), occupying the full screen above the 36px taskbar with titlebar visible.

---

### Task 1: WebP Icon Conversion with ffmpeg

**Files:**
- Source: `counter_strike_1_6_hq_icon_by_fabritor100_dbpjpqu-fullview.jpg`
- Output: `public/assets/cs16-icon.webp`

**Interfaces:**
- Consumes: Source 512x512 JPEG image.
- Produces: 128x128 WebP icon in `public/assets/cs16-icon.webp`.

- [ ] **Step 1: Convert icon to WebP using ffmpeg**

Run command:
```bash
ffmpeg -i counter_strike_1_6_hq_icon_by_fabritor100_dbpjpqu-fullview.jpg -vf "scale=128:128" -c:v libwebp -quality 90 -y public/assets/cs16-icon.webp
```

- [ ] **Step 2: Verify converted file exists and has valid size**

Run command:
```powershell
Get-Item public\assets\cs16-icon.webp | Select-Object Name, Length
```
Expected: `cs16-icon.webp` exists with length > 0.

- [ ] **Step 3: Commit icon locally**

```bash
git add public/assets/cs16-icon.webp
git commit -m "feat(cs): add optimized WebP Counter-Strike 1.6 icon"
```

---

### Task 2: Hobbies Folder Integration

**Files:**
- Modify: `src/types/index.ts:29-37`
- Modify: `src/utils/data.ts:80-110`
- Modify: `src/components/windows/ExplorerFolderApp.tsx:250-280`

**Interfaces:**
- Consumes: `HobbyItem` type.
- Produces: `Counter-Strike 1.6.exe` item in `HOBBIES_ITEMS` and visual WebP icon rendering in `ExplorerFolderApp.tsx`.

- [ ] **Step 1: Update `HobbyItem` type in `src/types/index.ts`**

Expand `HobbyItem.type` to include `'game'`:

```typescript
export interface HobbyItem {
  id: string;
  title: string;
  type: 'text' | 'image' | 'audio' | 'link' | 'game';
  content: string;
  description: string;
  windowId?: string;
}
```

- [ ] **Step 2: Add Counter-Strike item to `HOBBIES_ITEMS` in `src/utils/data.ts`**

In `src/utils/data.ts`, append the item:

```typescript
  {
    id: 'cstrike',
    title: 'Counter-Strike 1.6.exe',
    type: 'game',
    content: 'https://play-cs.com/pt/servers',
    description: 'FPS tático clássico jogável via navegador',
    windowId: 'cs-window'
  }
```

- [ ] **Step 3: Update `ExplorerFolderApp.tsx` to handle `game` icon and double-click**

In `ExplorerFolderApp.tsx`:
1. In `handleOpenHobby`:
```typescript
  const handleOpenHobby = (hobby: HobbyItem) => {
    soundEngine.playClick();
    if (wm) {
      if (hobby.windowId) {
        wm.openWindow(hobby.windowId);
      } else {
        wm.openWindow(`hobby-${hobby.id}-window`);
      }
    }
  };
```
2. In the item list thumbnail:
```tsx
  {hobby.type === 'game' ? (
    <img
      src="/assets/cs16-icon.webp"
      alt={hobby.title}
      className="w-10 h-10 object-contain drop-shadow-md select-none"
    />
  ) : hobby.type === 'image' ? (
```
3. In the sidebar preview:
```tsx
  {selectedHobby.type === 'game' && (
    <div className="mt-2 border border-gray-300 rounded p-2 flex items-center justify-center bg-black/10">
      <img
        src="/assets/cs16-icon.webp"
        alt={selectedHobby.title}
        className="w-16 h-16 object-contain drop-shadow"
      />
    </div>
  )}
```

- [ ] **Step 4: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 5: Commit changes locally**

```bash
git add src/types/index.ts src/utils/data.ts src/components/windows/ExplorerFolderApp.tsx
git commit -m "feat(cs): add Counter-Strike 1.6 executable item to Hobbies folder"
```

---

### Task 3: Window Registration, Icons and CMD Launcher

**Files:**
- Modify: `src/context/WindowContext.tsx:160-190`
- Modify: `src/components/windows/WindowFrame.tsx:250-280`
- Modify: `src/components/desktop/Taskbar.tsx:40-60`
- Modify: `src/utils/cmdEngine.ts:90-130`
- Modify: `src/test/cmdEngine.test.ts`

**Interfaces:**
- Consumes: Window manager, command engine.
- Produces: `cs-window` registered in `WindowContext`, WebP icon in `WindowFrame` and `Taskbar`, `cstrike` command in `cmdEngine`.

- [ ] **Step 1: Register `cs-window` in `src/context/WindowContext.tsx`**

Add `cs-window` to `DEFAULT_WINDOWS`:

```typescript
{
  id: 'cs-window',
  title: 'Counter-Strike 1.6',
  icon: 'cs',
  isOpen: false,
  isMinimized: false,
  isMaximized: true,
  zIndex: 10,
  position: { x: 30, y: 15, width: 1024, height: 680 },
  defaultPosition: { x: 30, y: 15, width: 1024, height: 680 }
}
```

- [ ] **Step 2: Add `cs` icon in `WindowFrame.tsx` and `Taskbar.tsx`**

In `WindowFrame.tsx` and `Taskbar.tsx`, inside `renderIcon` / `getWindowIcon`:

```tsx
case 'cs':
  return (
    <img
      src="/assets/cs16-icon.webp"
      alt="CS 1.6"
      className="w-3.5 h-3.5 object-contain flex-shrink-0"
    />
  );
```

- [ ] **Step 3: Add `cstrike` command in `src/utils/cmdEngine.ts`**

In `src/utils/cmdEngine.ts`:
1. In `help` list:
```typescript
'  CSTRIKE / CS          Abre o jogo Counter-Strike 1.6.',
```
2. In `switch (command)`:
```typescript
case 'cstrike':
case 'cs':
case 'cs16':
  ctx.openWindow('cs-window');
  return { output: ['Iniciando Counter-Strike 1.6...'] };
```

- [ ] **Step 4: Add unit test in `src/test/cmdEngine.test.ts`**

Verify `cstrike` launches `cs-window`:

```typescript
it('handles cstrike command to open cs-window', () => {
  const ctx = createMockContext();
  const result = executeCommand('cstrike', ctx);
  expect(ctx.openWindow).toHaveBeenCalledWith('cs-window');
  expect(result.output[0]).toContain('Counter-Strike 1.6');
});
```

- [ ] **Step 5: Run unit tests**

Run: `npx vitest run src/test/cmdEngine.test.ts`
Expected: PASS.

- [ ] **Step 6: Commit changes locally**

```bash
git add src/context/WindowContext.tsx src/components/windows/WindowFrame.tsx src/components/desktop/Taskbar.tsx src/utils/cmdEngine.ts src/test/cmdEngine.test.ts
git commit -m "feat(cs): register cs-window, icons and cstrike cmd command"
```

---

### Task 4: `CsApp` Component and Desktop Mounting

**Files:**
- Create: `src/components/windows/CsApp.tsx`
- Create: `src/test/CsApp.test.tsx`
- Modify: `src/components/desktop/Desktop.tsx:50-65`

**Interfaces:**
- Consumes: `WindowFrame`.
- Produces: `CsApp` component with sandboxed iframe, mounted on `Desktop.tsx`.

- [ ] **Step 1: Create `src/components/windows/CsApp.tsx`**

```tsx
import React from 'react';
import WindowFrame from './WindowFrame';

export interface CsAppProps {
  id?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const CsApp: React.FC<CsAppProps> = ({
  id = 'cs-window',
  isOpen,
  onClose
}) => {
  return (
    <WindowFrame
      id={id}
      title="Counter-Strike 1.6"
      icon="cs"
      isOpen={isOpen}
      onClose={onClose}
      initialPosition={{ x: 30, y: 15, width: 1024, height: 680 }}
    >
      <div
        data-testid="cs-container"
        className="w-full h-full bg-black select-none overflow-hidden flex flex-col"
      >
        <iframe
          src="https://play-cs.com/pt/servers"
          title="Counter-Strike 1.6"
          data-testid="cs-iframe"
          className="w-full h-full border-none"
          sandbox="allow-scripts allow-same-origin allow-pointer-lock allow-popups allow-forms"
          allow="autoplay; fullscreen; pointer-lock; gamepad; cross-origin-isolated"
        />
      </div>
    </WindowFrame>
  );
};
```

- [ ] **Step 2: Create unit tests in `src/test/CsApp.test.tsx`**

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CsApp } from '../components/windows/CsApp';
import { WindowProvider } from '../context/WindowContext';
import { SystemProvider } from '../context/SystemContext';

describe('CsApp', () => {
  it('renders iframe with correct src, sandbox and allow permissions', () => {
    render(
      <SystemProvider>
        <WindowProvider>
          <CsApp isOpen={true} />
        </WindowProvider>
      </SystemProvider>
    );

    const iframe = screen.getByTestId('cs-iframe') as HTMLIFrameElement;
    expect(iframe).toBeInTheDocument();
    expect(iframe.src).toBe('https://play-cs.com/pt/servers');

    // Security check: no allow-top-navigation
    const sandbox = iframe.getAttribute('sandbox') || '';
    expect(sandbox).toContain('allow-scripts');
    expect(sandbox).toContain('allow-same-origin');
    expect(sandbox).toContain('allow-pointer-lock');
    expect(sandbox).not.toContain('allow-top-navigation');

    // Controls check: pointer-lock and autoplay
    const allow = iframe.getAttribute('allow') || '';
    expect(allow).toContain('pointer-lock');
    expect(allow).toContain('autoplay');
  });
});
```

- [ ] **Step 3: Mount `<CsApp />` in `src/components/desktop/Desktop.tsx`**

In `src/components/desktop/Desktop.tsx`:
Import:
```tsx
import { CsApp } from '../windows/CsApp';
```
Mount alongside other window apps:
```tsx
<SpiderSolitaireApp />
<CsApp />
```

- [ ] **Step 4: Run unit tests**

Run: `npx vitest run src/test/CsApp.test.tsx`
Expected: PASS.

- [ ] **Step 5: Commit changes locally**

```bash
git add src/components/windows/CsApp.tsx src/test/CsApp.test.tsx src/components/desktop/Desktop.tsx
git commit -m "feat(cs): implement CsApp component and mount in Desktop"
```

---

### Task 5: Verification & Local Check (NO PUSH)

**Files:**
- Local Git Repository

- [ ] **Step 1: Run TypeScript verification**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 2: Run targeted test suite**

Run: `npx vitest run src/test/cmdEngine.test.ts src/test/CsApp.test.tsx`
Expected: All tests pass.

- [ ] **Step 3: Run production build**

Run: `npm run build`
Expected: `✓ built in ...ms` with code 0.

- [ ] **Step 4: Confirm git status (DO NOT PUSH)**

Run: `git status`
Expected: Working tree clean. DO NOT run `git push`.
