# Minecraft Classic via Iframe Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Completely purge DOOM and integrate Minecraft Classic (`https://classic.minecraft.net/`) into a dedicated maximized window in the Windows XP Portfolio.

**Architecture:** A `MinecraftApp` component renders an unsandboxed `iframe` with PointerLock, WebGL, and keyboard permissions inside a Windows XP `WindowFrame`. Accessible as `Minecraft.exe` in `hobbies` folder and via `minecraft` / `mc` / `craft` in CMD.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Vite, Vitest.

## Global Constraints
- DO NOT PUSH TO REMOTE REPOSITORY (`origin/main`). Local commits only.
- NO Desktop icon (lives in `hobbies` folder).
- Window `minecraft-window` title is `"Minecraft Classic"`, icon `"minecraft"`, opens maximized (`isMaximized: true`) above the 36px taskbar.
- Purge all DOOM files, libraries, and configurations completely.

---

### Task 1: Purge DOOM Library, Assets, and Configs

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Modify: `index.html`
- Delete: `public/js-dos/`
- Delete: `public/assets/doom.jsdos`
- Delete: `public/assets/doom-icon.webp`
- Delete: `src/types/js-dos.d.ts`

- [ ] **Step 1: Uninstall js-dos**
Run: `npm uninstall js-dos`

- [ ] **Step 2: Clean vite.config.ts**
Remove the `'js-dos'` alias from `vite.config.ts`:
```typescript
/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
  },
});
```

- [ ] **Step 3: Clean index.html**
Remove `<link rel="stylesheet" href="/js-dos/js-dos.css" />` and `<script src="/js-dos/js-dos.js"></script>` from `index.html`.

- [ ] **Step 4: Delete DOOM files**
Remove `public/js-dos/`, `public/assets/doom.jsdos`, `public/assets/doom-icon.webp`, `src/types/js-dos.d.ts`.

- [ ] **Step 5: Commit DOOM purge**
```bash
git add package.json package-lock.json vite.config.ts index.html
git rm -rf public/js-dos public/assets/doom.jsdos public/assets/doom-icon.webp src/types/js-dos.d.ts
git commit -m "chore: purge DOOM library, assets, and configurations"
```

---

### Task 2: Create Minecraft Classic WebP Icon

**Files:**
- Create: `public/assets/minecraft-icon.webp`

- [ ] **Step 1: Download Minecraft grass block texture and convert to WebP**
Download texture: `curl.exe -L -o public/assets/temp_grass.png https://classic.minecraft.net/assets/textures/grass_dirt.png`
Convert to 128x128 WebP with nearest-neighbor scaling using ffmpeg:
`ffmpeg.exe -y -i public/assets/temp_grass.png -vf "scale=128:128:flags=neighbor" -c:v libwebp public/assets/minecraft-icon.webp`
Remove `public/assets/temp_grass.png`.

- [ ] **Step 2: Verify icon exists**
Verify `public/assets/minecraft-icon.webp` exists and is a valid image.

- [ ] **Step 3: Commit icon**
```bash
git add public/assets/minecraft-icon.webp
git commit -m "feat(minecraft): add Minecraft grass block WebP icon"
```

---

### Task 3: Data, CMD Launcher, and Hobbies Explorer Integration

**Files:**
- Modify: `src/utils/data.ts`
- Modify: `src/utils/cmdEngine.ts`
- Modify: `src/components/windows/ExplorerFolderApp.tsx`
- Test: `src/test/cmdEngine.test.ts`

- [ ] **Step 1: Update cmdEngine.test.ts**
```typescript
it('executa comando minecraft abrindo minecraft-window', async () => {
  const result = await executeCommand('minecraft', mockContext);
  expect(mockContext.openWindow).toHaveBeenCalledWith('minecraft-window');
  expect(result.output[0]).toContain('Minecraft');
});

it('executa aliases mc e craft', async () => {
  await executeCommand('mc', mockContext);
  expect(mockContext.openWindow).toHaveBeenCalledWith('minecraft-window');
  await executeCommand('craft', mockContext);
  expect(mockContext.openWindow).toHaveBeenCalledWith('minecraft-window');
});

it('não reconhece mais doom', async () => {
  const result = await executeCommand('doom', mockContext);
  expect(result.output[0]).toContain('não é reconhecido');
});
```

- [ ] **Step 2: Run test to verify it fails**
Run: `npx vitest run src/test/cmdEngine.test.ts`
Expected: FAIL.

- [ ] **Step 3: Update data.ts, cmdEngine.ts, and ExplorerFolderApp.tsx**
In `src/utils/data.ts`:
Replace `doom` item with:
```typescript
{
  id: 'minecraft',
  title: 'Minecraft.exe',
  type: 'game',
  content: 'https://classic.minecraft.net/',
  description: 'Versão clássica original de Minecraft (0.0.23a_01) jogável diretamente no navegador.',
  windowId: 'minecraft-window'
}
```

In `src/utils/cmdEngine.ts`:
Remove `doom` command.
Add `minecraft`, `mc`, `craft` commands:
```typescript
case 'minecraft':
case 'mc':
case 'craft':
  ctx.openWindow('minecraft-window');
  return {
    output: [
      'Iniciando Minecraft Classic...',
      'Dica: Clique na tela para capturar o mouse. Pressione Esc para liberar.'
    ]
  };
```
Update `help` text to show `minecraft`.

In `src/components/windows/ExplorerFolderApp.tsx`:
Change icon source from `/assets/doom-icon.webp` to `/assets/minecraft-icon.webp`.

- [ ] **Step 4: Run test to verify it passes**
Run: `npx vitest run src/test/cmdEngine.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit**
```bash
git add src/utils/data.ts src/utils/cmdEngine.ts src/components/windows/ExplorerFolderApp.tsx src/test/cmdEngine.test.ts
git commit -m "feat(minecraft): integrate Minecraft in Hobbies folder and CMD launcher"
```

---

### Task 4: Window Context, WindowFrame, and Taskbar Integration

**Files:**
- Modify: `src/context/WindowContext.tsx`
- Modify: `src/components/windows/WindowFrame.tsx`
- Modify: `src/components/desktop/Taskbar.tsx`

- [ ] **Step 1: Replace doom-window in WindowContext.tsx**
In `DEFAULT_WINDOWS`:
```typescript
{
  id: 'minecraft-window',
  title: 'Minecraft Classic',
  icon: 'minecraft',
  isOpen: false,
  isMinimized: false,
  isMaximized: true,
  zIndex: 10,
  position: { x: 30, y: 15, width: 1024, height: 680 },
  defaultPosition: { x: 30, y: 15, width: 1024, height: 680 }
}
```

- [ ] **Step 2: Update WindowFrame.tsx and Taskbar.tsx**
Replace case `'doom'` with:
```tsx
case 'minecraft':
  return (
    <img
      src="/assets/minecraft-icon.webp"
      alt="Minecraft"
      className="w-3.5 h-3.5 object-contain flex-shrink-0"
    />
  );
```

- [ ] **Step 3: Run TypeScript compiler check**
Run: `npx tsc --noEmit`
Expected: PASS.

- [ ] **Step 4: Commit**
```bash
git add src/context/WindowContext.tsx src/components/windows/WindowFrame.tsx src/components/desktop/Taskbar.tsx
git commit -m "feat(minecraft): register minecraft-window and icon in WindowContext, WindowFrame, and Taskbar"
```

---

### Task 5: Implement MinecraftApp, Mount in Desktop, and Delete DoomApp

**Files:**
- Create: `src/components/windows/MinecraftApp.tsx`
- Create: `src/test/MinecraftApp.test.tsx`
- Modify: `src/components/desktop/Desktop.tsx`
- Delete: `src/components/windows/DoomApp.tsx`
- Delete: `src/test/DoomApp.test.tsx`

- [ ] **Step 1: Write test in MinecraftApp.test.tsx**
Create `src/test/MinecraftApp.test.tsx`:
```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { MinecraftApp } from '../components/windows/MinecraftApp';
import { WindowProvider } from '../context/WindowContext';
import { SystemProvider } from '../context/SystemContext';

describe('MinecraftApp Component', () => {
  it('renders iframe with correct src and permissions when open', () => {
    render(
      <SystemProvider>
        <WindowProvider>
          <MinecraftApp isOpen={true} />
        </WindowProvider>
      </SystemProvider>
    );

    const iframe = screen.getByTestId('minecraft-iframe');
    expect(iframe).toBeInTheDocument();
    expect(iframe).toHaveAttribute('src', 'https://classic.minecraft.net/');
    expect(iframe).toHaveAttribute('title', 'Minecraft Classic');

    const allow = iframe.getAttribute('allow') || '';
    expect(allow).toContain('autoplay');
    expect(allow).toContain('fullscreen');
    expect(allow).toContain('pointer-lock');
  });

  it('renders window title and icon', () => {
    render(
      <SystemProvider>
        <WindowProvider>
          <MinecraftApp isOpen={true} />
        </WindowProvider>
      </SystemProvider>
    );

    expect(screen.getByText('Minecraft Classic')).toBeInTheDocument();
    const icon = screen.getByAltText('Minecraft');
    expect(icon).toBeInTheDocument();
    expect(icon).toHaveAttribute('src', '/assets/minecraft-icon.webp');
  });

  it('does not render content when closed', () => {
    render(
      <SystemProvider>
        <WindowProvider>
          <MinecraftApp isOpen={false} />
        </WindowProvider>
      </SystemProvider>
    );

    expect(screen.queryByTestId('minecraft-iframe')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Create MinecraftApp.tsx**
Create `src/components/windows/MinecraftApp.tsx`:
```tsx
import React from 'react';
import { WindowFrame } from './WindowFrame';

export interface MinecraftAppProps {
  id?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const MinecraftApp: React.FC<MinecraftAppProps> = ({
  id = 'minecraft-window',
  isOpen,
  onClose,
}) => {
  return (
    <WindowFrame
      id={id}
      title="Minecraft Classic"
      icon="minecraft"
      isOpen={isOpen}
      onClose={onClose}
      initialPosition={{ x: 30, y: 15, width: 1024, height: 680 }}
    >
      <div data-testid="minecraft-container" className="w-full h-full bg-black select-none overflow-hidden flex flex-col">
        <iframe
          src="https://classic.minecraft.net/"
          title="Minecraft Classic"
          data-testid="minecraft-iframe"
          className="w-full h-full border-none"
          allow="autoplay; fullscreen; pointer-lock; gamepad; cross-origin-isolated"
        />
      </div>
    </WindowFrame>
  );
};

export default MinecraftApp;
```

- [ ] **Step 3: Update Desktop.tsx and delete DoomApp files**
In `src/components/desktop/Desktop.tsx`:
Replace `import { DoomApp } from '../windows/DoomApp';` with `import { MinecraftApp } from '../windows/MinecraftApp';`.
Replace `<DoomApp />` with `<MinecraftApp />`.

Delete `src/components/windows/DoomApp.tsx` and `src/test/DoomApp.test.tsx`.

- [ ] **Step 4: Run unit tests**
Run: `npx vitest run src/test/MinecraftApp.test.tsx`
Expected: PASS (3 tests pass).

- [ ] **Step 5: Commit**
```bash
git add src/components/windows/MinecraftApp.tsx src/test/MinecraftApp.test.tsx src/components/desktop/Desktop.tsx
git rm -f src/components/windows/DoomApp.tsx src/test/DoomApp.test.tsx
git commit -m "feat(minecraft): implement MinecraftApp component and mount in Desktop, purge DoomApp"
```

---

### Task 6: Full Verification & Build Check

- [ ] **Step 1: Run TypeScript compiler check**
Run: `npx tsc --noEmit`
Expected: Exits with code 0 and no errors.

- [ ] **Step 2: Run all vitest tests**
Run: `npx vitest run`
Expected: All suites pass.

- [ ] **Step 3: Run production build**
Run: `npm run build`
Expected: Clean build into `dist/`.
