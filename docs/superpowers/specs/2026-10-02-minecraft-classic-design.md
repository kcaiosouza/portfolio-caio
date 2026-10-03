# Design Spec: Minecraft Classic Integration via Iframe

## 1. Overview & Motivation
This specification defines the complete replacement of DOOM (1993) with **Minecraft Classic** (`https://classic.minecraft.net/`) embedded in a dedicated maximized window in the Windows XP Portfolio.

Unlike the third-party CS 1.6 site, `https://classic.minecraft.net/` is the official Mojang WebGL port of classic Minecraft:
- No Cloudflare Turnstile bot checks / captchas
- No `X-Frame-Options` or `frame-ancestors` blocking embedding
- Runs natively in WebGL and WebRTC in the browser

All remnants of DOOM (including `js-dos` package, bundle, emulator files, and scripts) are completely removed from the project.

## 2. Requirements & Constraints
- **Location**: Inside the `hobbies` folder as `Minecraft.exe` (no icon on Desktop).
- **CMD Command**: `minecraft` (plus shortcuts `mc`, `craft`) opens `minecraft-window`.
- **Game URL**: `https://classic.minecraft.net/`.
- **Iframe Configuration**:
  - `src="https://classic.minecraft.net/"`
  - `title="Minecraft Classic"`
  - `allow="autoplay; fullscreen; pointer-lock; gamepad; cross-origin-isolated"`
  - Unsandboxed (no `sandbox` attribute) so WebGL, WebRTC, PointerLock, and keyboard events work seamlessly.
- **Icon**: `public/assets/minecraft-icon.webp` (128x128px WebP icon of Minecraft Grass Block).
- **Window Behavior**:
  - `WindowFrame` with `id="minecraft-window"`, title `"Minecraft Classic"`, icon `"minecraft"`.
  - Starts maximized (`isMaximized: true`) to fill the screen above the 36px XP taskbar, with the classic blue Windows XP titlebar and native minimize, maximize, and close controls.
- **Purge DOOM**:
  - Uninstall `js-dos` npm package.
  - Delete `public/js-dos/`, `public/assets/doom.jsdos`, `public/assets/doom-icon.webp`.
  - Delete `src/components/windows/DoomApp.tsx`, `src/test/DoomApp.test.tsx`, `src/types/js-dos.d.ts`.
  - Remove alias from `vite.config.ts`.
  - Remove `js-dos` links/scripts from `index.html`.
- **Git Safety**: Local commits only. **DO NOT PUSH TO REMOTE** (`origin/main`).

## 3. Architecture & File Changes

### 3.1 Data & Types
- `src/types/index.ts`:
  - `HobbyItem.type`: keep `'game'`, `windowId?: string`.
- `src/utils/data.ts`:
  - Replace `doom` item in `HOBBIES_ITEMS` with:
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

### 3.2 Command Prompt (`cmdEngine.ts`)
- Remove `doom` command.
- Add `minecraft`, `mc`, `craft` commands:
  - Calls `ctx.openWindow('minecraft-window')`.
  - Returns `['Iniciando Minecraft Classic...', 'Dica: Clique na tela para capturar o mouse. Pressione Esc para liberar.']`.
  - Documented in `help` text.

### 3.3 Window Management (`WindowContext.tsx`)
- In `DEFAULT_WINDOWS`:
  - Replace `doom-window` with:
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

### 3.4 Icon Rendering
- `public/assets/minecraft-icon.webp`: Minecraft Grass Block icon.
- `src/components/windows/WindowFrame.tsx`:
  - Replace case `'doom'` with case `'minecraft'`.
- `src/components/desktop/Taskbar.tsx`:
  - Replace case `'doom'` with case `'minecraft'`.
- `src/components/windows/ExplorerFolderApp.tsx`:
  - For `hobby.type === 'game'`, use `/assets/minecraft-icon.webp`.

### 3.5 Minecraft Window Component (`MinecraftApp.tsx`)
- `src/components/windows/MinecraftApp.tsx`:
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
- Mount `<MinecraftApp />` in `src/components/desktop/Desktop.tsx`.

## 4. Verification & Testing
- Unit tests in `src/test/MinecraftApp.test.tsx` verifying iframe attributes (`src`, `allow`, `title`), window title, icon, and closed state.
- Unit tests in `src/test/cmdEngine.test.ts` verifying `minecraft`, `mc`, `craft` commands open `minecraft-window`, and `doom` is unrecognized.
- Full TypeScript verification: `npx tsc --noEmit`.
- Full Vitest test suite: `npx vitest run`.
- Production build: `npm run build`.
