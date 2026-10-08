# Konami Code Easter Egg & Jogos Secretos Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implementar o easter egg do Konami Code (`↑ ↑ ↓ ↓ ← → ← → B A`) no portfólio Windows XP para desbloquear os jogos `Minecraft.exe` e `GTA_Vice_City.exe` na pasta Hobbies e no CMD, acompanhado de um diálogo de alerta autêntico do Windows XP com som característico e persistência no `localStorage`.

**Architecture:** 
- Hook `useKonamiCode` monitora eventos de teclado globais via buffer de 10 teclas.
- `SystemContext` centraliza `isSecretUnlocked`, `showSecretModal`, `unlockSecretGames` e `lockSecretGames` com persistência em `localStorage['caio_xp_secret_games_unlocked']`.
- `SecretErrorDialog` renderiza um diálogo clássico do Windows XP com som sintetizado via Web Audio API.
- `ExplorerFolderApp` filtra `HOBBIES_ITEMS` dinamicamente conforme `isSecretUnlocked`.
- `cmdEngine` oculta comandos no `help` e bloqueia execução quando trancado, além de oferecer o comando `lock` para re-bloquear.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Vite, Vitest, React Testing Library, Web Audio API.

## Global Constraints
- Chave de persistência: `'caio_xp_secret_games_unlocked'`.
- Jogos padrão do Windows XP (`winmine.exe` / Campo Minado e `spider.exe` / Paciência) devem permanecer sempre desbloqueados.
- Título do diálogo: `"Easter Egg do Sistema"`.
- Mensagem do diálogo: `"Código secreto ativo! Jogos liberados (Minecraft e GTA)"`.
- Sem quebrar testes existentes.

---

### Task 1: Web Audio Sound Synthesizer (`audioEffects.ts`)

**Files:**
- Create: `src/utils/audioEffects.ts`
- Test: `src/test/audioEffects.test.ts`

**Interfaces:**
- Produces: `playXpErrorSound(): void`

- [ ] **Step 1: Write the failing test**

```typescript
// src/test/audioEffects.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { playXpErrorSound } from '../utils/audioEffects';

describe('audioEffects - playXpErrorSound', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('safely attempts to synthesize Windows XP chord sound using AudioContext without throwing', () => {
    expect(() => playXpErrorSound()).not.toThrow();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/audioEffects.test.ts`
Expected: FAIL with "Cannot find module '../utils/audioEffects'"

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/utils/audioEffects.ts
/**
 * Synthesizes the iconic Windows XP Critical Error / Chord sound
 * using the Web Audio API without external file dependencies.
 */
export function playXpErrorSound(): void {
  try {
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/audioEffects.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/audioEffects.ts src/test/audioEffects.test.ts
git commit -m "feat(audio): add synthesized Windows XP error chord sound"
```

---

### Task 2: Hook Global `useKonamiCode`

**Files:**
- Create: `src/hooks/useKonamiCode.ts`
- Test: `src/test/useKonamiCode.test.ts`

**Interfaces:**
- Produces: `useKonamiCode(onSuccess: () => void, enabled?: boolean): void`
- Target Sequence: `['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a']`

- [ ] **Step 1: Write the failing test**

```typescript
// src/test/useKonamiCode.test.ts
import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useKonamiCode, KONAMI_SEQUENCE } from '../hooks/useKonamiCode';

describe('useKonamiCode hook', () => {
  it('triggers callback when full Konami sequence is typed', () => {
    const callback = vi.fn();
    renderHook(() => useKonamiCode(callback));

    KONAMI_SEQUENCE.forEach(key => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key }));
    });

    expect(callback).toHaveBeenCalledTimes(1);
  });

  it('resets buffer if an incorrect key is pressed and does not trigger callback', () => {
    const callback = vi.fn();
    renderHook(() => useKonamiCode(callback));

    ['ArrowUp', 'ArrowUp', 'ArrowDown', 'KeyX', 'ArrowLeft'].forEach(key => {
      window.dispatchEvent(new KeyboardEvent('keydown', { key }));
    });

    expect(callback).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/useKonamiCode.test.ts`
Expected: FAIL with "Cannot find module '../hooks/useKonamiCode'"

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/hooks/useKonamiCode.ts
import { useEffect, useRef } from 'react';

export const KONAMI_SEQUENCE = [
  'ArrowUp',
  'ArrowUp',
  'ArrowDown',
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowLeft',
  'ArrowRight',
  'b',
  'a'
] as const;

export function useKonamiCode(onSuccess: () => void, enabled: boolean = true): void {
  const bufferRef = useRef<string[]>([]);
  const callbackRef = useRef(onSuccess);

  useEffect(() => {
    callbackRef.current = onSuccess;
  }, [onSuccess]);

  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      const expectedKey = KONAMI_SEQUENCE[bufferRef.current.length];

      if (key.toLowerCase() === expectedKey.toLowerCase()) {
        bufferRef.current.push(expectedKey);

        if (bufferRef.current.length === KONAMI_SEQUENCE.length) {
          bufferRef.current = [];
          callbackRef.current();
        }
      } else {
        // Reset if mismatched, but check if the pressed key is the start of a new sequence (ArrowUp)
        if (key === 'ArrowUp') {
          bufferRef.current = ['ArrowUp'];
        } else {
          bufferRef.current = [];
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled]);
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/useKonamiCode.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/hooks/useKonamiCode.ts src/test/useKonamiCode.test.ts
git commit -m "feat(hook): add useKonamiCode listener"
```

---

### Task 3: Windows XP Easter Egg Dialog Component (`SecretErrorDialog.tsx`)

**Files:**
- Create: `src/components/modals/SecretErrorDialog.tsx`
- Test: `src/test/SecretErrorDialog.test.tsx`

**Interfaces:**
- Produces: `SecretErrorDialog({ isOpen: boolean, onClose: () => void })`

- [ ] **Step 1: Write the failing test**

```typescript
// src/test/SecretErrorDialog.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { SecretErrorDialog } from '../components/modals/SecretErrorDialog';

describe('SecretErrorDialog Component', () => {
  it('renders dialog with title Easter Egg do Sistema and notification text when open', () => {
    const handleClose = vi.fn();
    render(<SecretErrorDialog isOpen={true} onClose={handleClose} />);

    expect(screen.getByText('Easter Egg do Sistema')).toBeInTheDocument();
    expect(
      screen.getByText('Código secreto ativo! Jogos liberados (Minecraft e GTA)')
    ).toBeInTheDocument();

    const okButton = screen.getByRole('button', { name: /ok/i });
    expect(okButton).toBeInTheDocument();
    fireEvent.click(okButton);
    expect(handleClose).toHaveBeenCalledTimes(1);
  });

  it('renders nothing when isOpen is false', () => {
    render(<SecretErrorDialog isOpen={false} onClose={vi.fn()} />);
    expect(screen.queryByText('Easter Egg do Sistema')).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/SecretErrorDialog.test.tsx`
Expected: FAIL with "Cannot find module '../components/modals/SecretErrorDialog'"

- [ ] **Step 3: Write minimal implementation**

```typescript
// src/components/modals/SecretErrorDialog.tsx
import React, { useEffect, useRef } from 'react';

export interface SecretErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecretErrorDialog: React.FC<SecretErrorDialogProps> = ({ isOpen, onClose }) => {
  const okButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      okButtonRef.current?.focus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      data-testid="secret-error-dialog"
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/30 select-none p-4"
      onClick={onClose}
    >
      <div
        className="w-[420px] max-w-[95vw] bg-[#ECE9D8] rounded-t-lg rounded-b-sm border-2 border-[#0055EA] shadow-[3px_3px_15px_rgba(0,0,0,0.5)] overflow-hidden font-sans text-xs text-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-[#0058EE] via-[#3593FF] to-[#032598] px-3 py-1.5 flex items-center justify-between text-white font-bold select-none shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#E04006] border border-white text-[9px] flex items-center justify-center font-bold">
              ✕
            </span>
            <span id="dialog-title" className="text-xs drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
              Easter Egg do Sistema
            </span>
          </div>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="w-5 h-5 bg-[#E04006] hover:bg-[#F05016] active:bg-[#B03004] text-white font-bold text-xs rounded-[3px] border border-white/60 flex items-center justify-center shadow-sm"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex items-start gap-4 bg-[#ECE9D8]">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#CC0000] border-2 border-white flex items-center justify-center shadow-md">
            <span className="text-white text-2xl font-bold font-mono leading-none pb-0.5">✕</span>
          </div>
          <div className="flex-1 space-y-1 pt-1">
            <p className="font-semibold text-gray-900 text-sm leading-snug">
              Código secreto ativo! Jogos liberados (Minecraft e GTA)
            </p>
            <p className="text-gray-600 text-[11px]">
              Novos atalhos foram desbloqueados na pasta Hobbies e no Prompt de Comando.
            </p>
          </div>
        </div>

        {/* Bottom Button Bar */}
        <div className="bg-[#ECE9D8] px-4 py-3 flex justify-center border-t border-[#ACA899] shadow-[inset_0_1px_0_#FFF]">
          <button
            ref={okButtonRef}
            type="button"
            onClick={onClose}
            className="px-7 py-1 bg-gradient-to-b from-white to-[#E1DECE] border border-[#7F9DB9] rounded-[2px] text-xs font-semibold text-gray-900 hover:border-[#0058EE] active:bg-[#C2CEE8] focus:ring-1 focus:ring-[#0058EE] shadow-sm"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/SecretErrorDialog.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/modals/SecretErrorDialog.tsx src/test/SecretErrorDialog.test.tsx
git commit -m "feat(ui): add SecretErrorDialog component"
```

---

### Task 4: SystemContext State, LocalStorage & Desktop Mounting

**Files:**
- Modify: `src/context/SystemContext.tsx`
- Modify: `src/components/desktop/Desktop.tsx`
- Test: `src/test/systemSecretState.test.tsx`

**Interfaces:**
- Consumes: `playXpErrorSound`, `useKonamiCode`, `SecretErrorDialog`
- Produces:
  - `isSecretUnlocked: boolean`
  - `showSecretModal: boolean`
  - `unlockSecretGames: () => void`
  - `lockSecretGames: () => void`
  - `closeSecretModal: () => void`

- [ ] **Step 1: Write the failing test**

```typescript
// src/test/systemSecretState.test.tsx
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { SystemProvider, useSystem } from '../context/SystemContext';

const TestComponent = () => {
  const { isSecretUnlocked, unlockSecretGames, lockSecretGames, showSecretModal } = useSystem();
  return (
    <div>
      <span data-testid="unlocked">{String(isSecretUnlocked)}</span>
      <span data-testid="modal">{String(showSecretModal)}</span>
      <button onClick={unlockSecretGames}>Unlock</button>
      <button onClick={lockSecretGames}>Lock</button>
    </div>
  );
};

describe('SystemContext Secret Games State', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('initializes as false when localStorage is empty', () => {
    render(
      <SystemProvider>
        <TestComponent />
      </SystemProvider>
    );
    expect(screen.getByTestId('unlocked').textContent).toBe('false');
  });

  it('updates state and localStorage on unlock and lock', () => {
    render(
      <SystemProvider>
        <TestComponent />
      </SystemProvider>
    );

    act(() => {
      screen.getByText('Unlock').click();
    });

    expect(screen.getByTestId('unlocked').textContent).toBe('true');
    expect(screen.getByTestId('modal').textContent).toBe('true');
    expect(localStorage.getItem('caio_xp_secret_games_unlocked')).toBe('true');

    act(() => {
      screen.getByText('Lock').click();
    });

    expect(screen.getByTestId('unlocked').textContent).toBe('false');
    expect(localStorage.getItem('caio_xp_secret_games_unlocked')).toBe('false');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/systemSecretState.test.tsx`
Expected: FAIL with Property 'isSecretUnlocked' does not exist on type 'SystemContextType'.

- [ ] **Step 3: Update SystemContext and Desktop**

Update `src/context/SystemContext.tsx`:
Add `isSecretUnlocked`, `showSecretModal`, `unlockSecretGames`, `lockSecretGames`, `closeSecretModal`.
Load initial state with `localStorage.getItem('caio_xp_secret_games_unlocked') === 'true'`.

Update `src/components/desktop/Desktop.tsx`:
- Call `useKonamiCode(unlockSecretGames)`.
- Render `<SecretErrorDialog isOpen={showSecretModal} onClose={closeSecretModal} />`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/systemSecretState.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/context/SystemContext.tsx src/components/desktop/Desktop.tsx src/test/systemSecretState.test.tsx
git commit -m "feat(system): integrate secret games state and Konami listener"
```

---

### Task 5: Hobbies Explorer Window Filtering (`ExplorerFolderApp.tsx`)

**Files:**
- Modify: `src/components/windows/ExplorerFolderApp.tsx`
- Test: `src/test/explorerSecretHobbies.test.tsx`

**Interfaces:**
- Consumes: `useSystem().isSecretUnlocked`
- When `isSecretUnlocked === false`: filter out `minecraft` and `vice-city` from items.
- When `isSecretUnlocked === true`: display all items.

- [ ] **Step 1: Write the failing test**

```typescript
// src/test/explorerSecretHobbies.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, beforeEach } from 'vitest';
import { ExplorerFolderApp } from '../components/windows/ExplorerFolderApp';
import { SystemProvider, useSystem } from '../context/SystemContext';
import { WindowProvider } from '../context/WindowContext';

const Wrapper: React.FC<{ unlocked: boolean }> = ({ unlocked }) => {
  const { unlockSecretGames, lockSecretGames } = useSystem();
  React.useEffect(() => {
    if (unlocked) unlockSecretGames();
    else lockSecretGames();
  }, [unlocked]);

  return <ExplorerFolderApp id="hobbies-window" title="hobbies" folderType="hobbies" isOpen={true} />;
};

describe('ExplorerFolderApp Hobbies Secret Filtering', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('hides Minecraft.exe and GTA_Vice_City.exe when secret is locked', () => {
    render(
      <SystemProvider>
        <WindowProvider>
          <Wrapper unlocked={false} />
        </WindowProvider>
      </SystemProvider>
    );

    expect(screen.queryByText('Minecraft.exe')).not.toBeInTheDocument();
    expect(screen.queryByText('GTA_Vice_City.exe')).not.toBeInTheDocument();
    // Default items like music should still be visible
    expect(screen.getByText('Musica.mp3')).toBeInTheDocument();
  });

  it('shows Minecraft.exe and GTA_Vice_City.exe when secret is unlocked', () => {
    render(
      <SystemProvider>
        <WindowProvider>
          <Wrapper unlocked={true} />
        </WindowProvider>
      </SystemProvider>
    );

    expect(screen.getByText('Minecraft.exe')).toBeInTheDocument();
    expect(screen.getByText('GTA_Vice_City.exe')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/explorerSecretHobbies.test.tsx`
Expected: FAIL (Minecraft and GTA currently appear even when locked)

- [ ] **Step 3: Modify `ExplorerFolderApp.tsx`**

In `ExplorerFolderApp.tsx`:
- Use `const { isSecretUnlocked } = useSystem();`.
- Filter `items`:
  ```typescript
  const visibleHobbies = useMemo(() => {
    if (isSecretUnlocked) return HOBBIES_ITEMS;
    return HOBBIES_ITEMS.filter(h => h.id !== 'minecraft' && h.id !== 'vice-city');
  }, [isSecretUnlocked]);
  ```
- Use `visibleHobbies` for item list, selection, and status bar count.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/explorerSecretHobbies.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/components/windows/ExplorerFolderApp.tsx src/test/explorerSecretHobbies.test.tsx
git commit -m "feat(explorer): filter secret games in Hobbies folder based on unlock state"
```

---

### Task 6: Prompt de Comando (CMD) Integration (`cmdEngine.ts`)

**Files:**
- Modify: `src/utils/cmdEngine.ts`
- Modify: `src/components/windows/CommandPromptApp.tsx`
- Modify: `src/test/cmdEngine.test.ts`

**Interfaces:**
- `CommandContext`:
  - `isSecretUnlocked?: boolean`
  - `lockSecretGames?: () => void`
  - `unlockSecretGames?: () => void`
- In `help`:
  - If `isSecretUnlocked !== true`: hide lines for `MINECRAFT` and `GTA / VICECITY`.
  - If `isSecretUnlocked === true`: show them.
- In `minecraft`, `gta`:
  - If `isSecretUnlocked !== true`: return standard unrecognized command error.
  - If `isSecretUnlocked === true`: launch game window.
- In `lock` / `resetgames`:
  - Call `ctx.lockSecretGames?.()` and return message: `"Jogos secretos bloqueados com sucesso. Digite o código secreto para liberar novamente."`.

- [ ] **Step 1: Write failing tests in `cmdEngine.test.ts`**

Add tests for:
- `help` with `isSecretUnlocked: false` does not include `MINECRAFT` or `GTA`.
- `help` with `isSecretUnlocked: true` includes `MINECRAFT` and `GTA`.
- `executeCommand('gta', { isSecretUnlocked: false, ... })` returns unrecognized command.
- `executeCommand('gta', { isSecretUnlocked: true, ... })` calls `openWindow('vice-city-window')`.
- `executeCommand('lock', { lockSecretGames, ... })` calls `lockSecretGames`.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/cmdEngine.test.ts`
Expected: FAIL

- [ ] **Step 3: Update `cmdEngine.ts` and `CommandPromptApp.tsx`**

- Extend `CommandContext` with `isSecretUnlocked`, `lockSecretGames`, `unlockSecretGames`.
- Conditionally render help lines.
- Guard `case 'minecraft'` and `case 'gta'` with `if (!ctx.isSecretUnlocked) break;` (falling through to `default`).
- Add `case 'lock'` and `case 'resetgames'`.
- Pass system context values into `CommandPromptApp.tsx`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/cmdEngine.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/utils/cmdEngine.ts src/components/windows/CommandPromptApp.tsx src/test/cmdEngine.test.ts
git commit -m "feat(cmd): hide secret games from help/execution until unlocked and add lock command"
```

---

### Task 7: Full Suite Verification & Build

**Files:**
- Existing test files

- [ ] **Step 1: Run all tests**

Run: `npm test`
Expected: ALL test suites pass (including updated ViceCityApp, MinecraftApp, applications tests).

- [ ] **Step 2: Run production build**

Run: `npm run build`
Expected: Zero TypeScript or Vite bundling errors.

- [ ] **Step 3: Commit and Push**

```bash
git push origin main
```
