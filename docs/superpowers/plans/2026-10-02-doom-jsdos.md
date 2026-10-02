# DOOM (1993) via js-dos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completely replace Counter-Strike 1.6 with DOOM (1993) running locally via `js-dos` WebAssembly DOSBox emulator in the Windows XP Portfolio.

**Architecture:** A dedicated `DoomApp` window component mounts a `js-dos` DOSBox canvas running `doom.jsdos` (official id Software Shareware release). The game is accessible as `Doom.exe` inside the `hobbies` folder and via `doom` command in CMD. All former CS 1.6 traces are purged.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, `js-dos` (v8.5.1), Vite, Vitest.

## Global Constraints
- DO NOT PUSH TO REMOTE REPOSITORY (`origin/main`). Local commits only.
- DOOM icon MUST NOT appear on Desktop (lives in `hobbies` folder).
- CMD command is strictly `doom` (no CS aliases).
- Window `doom-window` title is `"DOOM (1993)"`, icon `"doom"`, opens maximized (`isMaximized: true`) filling the screen above the 36px XP taskbar.
- Memory and audio must cleanly stop when the window is closed or unmounted.

---

### Task 1: Assets & Package Setup

**Files:**
- Create: `public/assets/doom.jsdos`
- Create: `public/assets/doom-icon.webp`
- Modify: `package.json`

- [ ] **Step 1: Install js-dos**
Run: `npm install js-dos`
Expected: Installs `js-dos` and adds to `dependencies` in `package.json`.

- [ ] **Step 2: Download doom.jsdos**
Run: `curl.exe -L -o public/assets/doom.jsdos https://cdn.dos.zone/custom/dos/doom.jsdos`
Expected: File `public/assets/doom.jsdos` exists and is ~5.5MB.

- [ ] **Step 3: Create DOOM WebP icon**
Use `ffmpeg` or copy icon to generate 128x128 `public/assets/doom-icon.webp`.
Expected: `public/assets/doom-icon.webp` exists and is valid WebP.

- [ ] **Step 4: Commit assets and dependencies**
```bash
git add package.json package-lock.json public/assets/doom.jsdos public/assets/doom-icon.webp
git commit -m "feat(doom): install js-dos and add doom.jsdos bundle with icon"
```

---

### Task 2: Data, CMD Launcher, and Hobbies Explorer Integration

**Files:**
- Modify: `src/utils/data.ts`
- Modify: `src/utils/cmdEngine.ts`
- Modify: `src/components/windows/ExplorerFolderApp.tsx`
- Test: `src/test/cmdEngine.test.ts`

- [ ] **Step 1: Write failing test in cmdEngine.test.ts**
Update `src/test/cmdEngine.test.ts` to test `doom` command and verify `cstrike` is unrecognized:
```typescript
it('executa comando doom abrindo doom-window', async () => {
  const result = await executeCommand('doom', mockContext);
  expect(mockContext.openWindow).toHaveBeenCalledWith('doom-window');
  expect(result.output[0]).toContain('DOOM');
});

it('não reconhece mais cstrike', async () => {
  const result = await executeCommand('cstrike', mockContext);
  expect(result.output[0]).toContain('não é reconhecido');
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run src/test/cmdEngine.test.ts`
Expected: FAIL (command doom not recognized, cstrike still present).

- [ ] **Step 3: Update data.ts, cmdEngine.ts, and ExplorerFolderApp.tsx**
In `src/utils/data.ts`:
Replace `id: 'cstrike'` item with:
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

In `src/utils/cmdEngine.ts`:
Remove `cstrike`, `cs`, `cs16`.
Add `doom` command:
```typescript
case 'doom':
  ctx.openWindow('doom-window');
  return {
    output: [
      'Iniciando DOOM (1993)...',
      'Controles: Setas para mover, Ctrl para atirar, Espaço para abrir portas, 1-7 armas.'
    ]
  };
```
Update `help` text to show `doom` instead of `cstrike`.

In `src/components/windows/ExplorerFolderApp.tsx`:
Change icon source from `/assets/cs16-icon.webp` to `/assets/doom-icon.webp`.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run src/test/cmdEngine.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/utils/data.ts src/utils/cmdEngine.ts src/components/windows/ExplorerFolderApp.tsx src/test/cmdEngine.test.ts
git commit -m "feat(doom): integrate Doom into Hobbies folder and CMD launcher, purge CS commands"
```

---

### Task 3: Window Management & System Icons

**Files:**
- Modify: `src/context/WindowContext.tsx`
- Modify: `src/components/windows/WindowFrame.tsx`
- Modify: `src/components/desktop/Taskbar.tsx`

- [ ] **Step 1: Replace cs-window with doom-window in WindowContext.tsx**
In `DEFAULT_WINDOWS`:
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

- [ ] **Step 2: Update WindowFrame.tsx and Taskbar.tsx icons**
Replace `'cs'` case with `'doom'` case:
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

- [ ] **Step 3: Verify TypeScript compiles**
Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**
```bash
git add src/context/WindowContext.tsx src/components/windows/WindowFrame.tsx src/components/desktop/Taskbar.tsx
git commit -m "feat(doom): register doom-window and icon in WindowContext and WindowFrame"
```

---

### Task 4: Implement DoomApp, Remove CsApp, and Mount in Desktop

**Files:**
- Create: `src/components/windows/DoomApp.tsx`
- Create: `src/test/DoomApp.test.tsx`
- Delete: `src/components/windows/CsApp.tsx`
- Delete: `src/test/CsApp.test.tsx`
- Delete: `public/assets/cs16-icon.webp`
- Modify: `src/components/desktop/Desktop.tsx`

- [ ] **Step 1: Write test in DoomApp.test.tsx**
Create `src/test/DoomApp.test.tsx`:
```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { DoomApp } from '../components/windows/DoomApp';
import { WindowProvider } from '../context/WindowContext';
import { SystemProvider } from '../context/SystemContext';

describe('DoomApp Component', () => {
  it('renders window title and icon when open', () => {
    render(
      <SystemProvider>
        <WindowProvider>
          <DoomApp isOpen={true} />
        </WindowProvider>
      </SystemProvider>
    );

    expect(screen.getByText('DOOM (1993)')).toBeInTheDocument();
    const icon = screen.getByAltText('DOOM');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('src', '/assets/doom-icon.webp');
    expect(screen.getByTestId('doom-container')).toBeInTheDocument();
  });

  it('does not render content when closed', () => {
    render(
      <SystemProvider>
        <WindowProvider>
          <DoomApp isOpen={false} />
        </WindowProvider>
      </SystemProvider>
    );

    expect(screen.queryByTestId('doom-container')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Create DoomApp.tsx**
Create `src/components/windows/DoomApp.tsx`:
```tsx
import React, { useEffect, useRef } from 'react';
import { WindowFrame } from './WindowFrame';

export interface DoomAppProps {
  id?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const DoomApp: React.FC<DoomAppProps> = ({
  id = 'doom-window',
  isOpen,
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dosInstanceRef = useRef<any>(null);

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    let isMounted = true;

    const startDoom = async () => {
      try {
        const { Dos } = await import('js-dos');
        if (!isMounted || !containerRef.current) return;

        // Initialize js-dos player
        const dosInstance = Dos(containerRef.current);
        dosInstanceRef.current = dosInstance;

        // Run local doom bundle
        dosInstance.run('/assets/doom.jsdos');
      } catch (err) {
        console.error('Failed to load js-dos:', err);
      }
    };

    startDoom();

    return () => {
      isMounted = false;
      if (dosInstanceRef.current) {
        try {
          dosInstanceRef.current.stop();
        } catch (e) {
          // Ignore cleanup error
        }
        dosInstanceRef.current = null;
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [isOpen]);

  const handleClose = () => {
    if (dosInstanceRef.current) {
      try {
        dosInstanceRef.current.stop();
      } catch (e) {
        // Ignore
      }
      dosInstanceRef.current = null;
    }
    if (onClose) onClose();
  };

  return (
    <WindowFrame
      id={id}
      title="DOOM (1993)"
      icon="doom"
      isOpen={isOpen}
      onClose={handleClose}
      initialPosition={{ x: 30, y: 15, width: 1024, height: 680 }}
    >
      <div
        data-testid="doom-container"
        className="w-full h-full bg-black select-none overflow-hidden relative flex items-center justify-center"
      >
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </WindowFrame>
  );
};

export default DoomApp;
```

- [ ] **Step 3: Update Desktop.tsx and remove CS files**
In `src/components/desktop/Desktop.tsx`:
Replace `import { CsApp } from '../windows/CsApp';` with `import { DoomApp } from '../windows/DoomApp';`.
Replace `<CsApp />` with `<DoomApp />`.

Delete `src/components/windows/CsApp.tsx`, `src/test/CsApp.test.tsx`, and `public/assets/cs16-icon.webp`.

- [ ] **Step 4: Run unit tests**
Run: `npx vitest run src/test/DoomApp.test.tsx`
Expected: PASS (2 tests pass).

- [ ] **Step 5: Commit**
```bash
git add src/components/windows/DoomApp.tsx src/test/DoomApp.test.tsx src/components/desktop/Desktop.tsx
git rm src/components/windows/CsApp.tsx src/test/CsApp.test.tsx public/assets/cs16-icon.webp
git commit -m "feat(doom): implement DoomApp with js-dos and purge CsApp files"
```

---

### Task 5: Full Project Verification & Typecheck

- [ ] **Step 1: Run TypeScript Compiler Check**
Run: `npx tsc --noEmit`
Expected: Exits with code 0 and no errors.

- [ ] **Step 2: Run Full Vitest Suite**
Run: `npx vitest run`
Expected: All test suites pass.

- [ ] **Step 3: Run Production Build**
Run: `npm run build`
Expected: Vite build succeeds and generates `dist/` cleanly.
