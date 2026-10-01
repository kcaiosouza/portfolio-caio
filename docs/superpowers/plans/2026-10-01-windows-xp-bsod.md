# Windows XP Classic BSOD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement the classic Windows XP Blue Screen of Death (BSOD - Tela Azul da Morte) with STOP error `CRITICAL_OBJECT_TERMINATION (0x000000F4)`, triggered when terminating the `System` process in the Task Manager, complete with progressive memory dump and hybrid reboot to BIOS.

**Architecture:** Extend global `ScreenMode` with `'bsod'`, render dedicated `<BsodScreen />` directly inside `App.tsx` beneath the persistent CRT shader overlay, and trigger `setScreenMode('bsod')` from `TaskManagerApp.tsx` when the user kills the `System` process.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Vitest, React Testing Library.

## Global Constraints

- **Blue Color**: Classic Windows XP BSOD royal blue background `#0000AA`.
- **Typography**: Pure white `#FFFFFF`, monospace font (`"Lucida Console", "Courier New", monospace`).
- **Stop Error**: Must include `CRITICAL_OBJECT_TERMINATION` and `*** STOP: 0x000000F4 (0x00000003, 0x82C74020, 0x82C74194, 0x805D297C)`.
- **Trigger**: Selecting `System` (or PID 4) in Task Manager and clicking "Finalizar processo" directly crashes into BSOD.
- **Recovery**: Hybrid recovery — automatic reboot to BIOS after ~6 seconds, or immediate reboot upon pressing any key or clicking the screen.
- **Testing & Safety**: Do NOT run heavy full-suite tests; run targeted tests (`BsodScreen.test.tsx` and `TaskManagerApp.test.tsx`) and verify build with `npm run build`.

---

### Task 1: Extend ScreenMode in System Types & Context

**Files:**
- Modify: `src/types/index.ts:1`
- Modify: `src/context/SystemContext.tsx`

**Interfaces:**
- Consumes: `ScreenMode` union.
- Produces: Expanded `ScreenMode` including `'bsod'`.

- [ ] **Step 1: Update ScreenMode in `src/types/index.ts`**

Update `src/types/index.ts`:

```typescript
export type ScreenMode = 'bios' | 'login' | 'desktop' | 'bsod';
```

- [ ] **Step 2: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Commit changes**

```bash
git add src/types/index.ts
git commit -m "feat(bsod): add bsod to ScreenMode type"
```

---

### Task 2: Implement `BsodScreen` Component and Unit Tests

**Files:**
- Create: `src/components/bsod/BsodScreen.tsx`
- Create: `src/test/BsodScreen.test.tsx`

**Interfaces:**
- Consumes: `useSystem().setScreenMode`, `soundEngine`.
- Produces: `BsodScreen` component.

- [ ] **Step 1: Write unit tests for `BsodScreen`**

Create `src/test/BsodScreen.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BsodScreen } from '../components/bsod/BsodScreen';
import { SystemProvider, useSystem } from '../context/SystemContext';

// Test wrapper that provides access to current screenMode
const TestBsodHarness = () => {
  const { screenMode } = useSystem();
  return (
    <div>
      <span data-testid="current-screen-mode">{screenMode}</span>
      <BsodScreen />
    </div>
  );
};

describe('BsodScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders authentic Windows XP stop error codes', () => {
    render(
      <SystemProvider>
        <BsodScreen />
      </SystemProvider>
    );

    expect(screen.getByText(/CRITICAL_OBJECT_TERMINATION/i)).toBeInTheDocument();
    expect(screen.getByText(/0x000000F4/i)).toBeInTheDocument();
    expect(screen.getByText(/Iniciando despejo de memória física/i)).toBeInTheDocument();
  });

  it('triggers reboot to bios when clicking on the BSOD screen', () => {
    render(
      <SystemProvider>
        <TestBsodHarness />
      </SystemProvider>
    );

    const bsodContainer = screen.getByTestId('bsod-screen');
    fireEvent.click(bsodContainer);

    expect(screen.getByTestId('current-screen-mode').textContent).toBe('bios');
  });

  it('triggers reboot to bios on any keydown', () => {
    render(
      <SystemProvider>
        <TestBsodHarness />
      </SystemProvider>
    );

    fireEvent.keyDown(window, { key: 'Enter', code: 'Enter' });

    expect(screen.getByTestId('current-screen-mode').textContent).toBe('bios');
  });
});
```

- [ ] **Step 2: Run test to verify failure before implementation**

Run: `npx vitest run src/test/BsodScreen.test.tsx`
Expected: FAIL ("Cannot find module '../components/bsod/BsodScreen'").

- [ ] **Step 3: Implement `src/components/bsod/BsodScreen.tsx`**

Create `src/components/bsod/BsodScreen.tsx`:

```tsx
import React, { useState, useEffect, useRef } from 'react';
import { useSystem } from '../../context/SystemContext';
import { soundEngine } from '../../utils/soundEffects';

export const BsodScreen: React.FC = () => {
  const { setScreenMode } = useSystem();
  const [dumpPercent, setDumpPercent] = useState<number>(0);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const hasRebootedRef = useRef<boolean>(false);

  const handleReboot = () => {
    if (hasRebootedRef.current) return;
    hasRebootedRef.current = true;
    soundEngine.playBeep();
    setScreenMode('bios');
  };

  useEffect(() => {
    // Play error sound tone on crash
    soundEngine.playError();

    // Keydown listener for immediate manual restart
    const handleKeyDown = () => {
      handleReboot();
    };

    window.addEventListener('keydown', handleKeyDown);

    // Progressive memory dump counter simulation
    const interval = setInterval(() => {
      setDumpPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsComplete(true);
          return 100;
        }
        return Math.min(100, prev + Math.floor(Math.random() * 25) + 15);
      });
    }, 450);

    // Auto-reboot timer after ~6 seconds
    const autoRebootTimeout = setTimeout(() => {
      handleReboot();
    }, 6000);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(interval);
      clearTimeout(autoRebootTimeout);
    };
  }, []);

  return (
    <div
      data-testid="bsod-screen"
      onClick={handleReboot}
      className="fixed inset-0 w-screen h-screen bg-[#0000AA] text-white p-6 sm:p-12 font-mono text-xs sm:text-sm md:text-base select-none cursor-pointer overflow-hidden z-[9999] flex flex-col justify-between"
      style={{ fontFamily: '"Lucida Console", "Courier New", Consolas, monospace' }}
    >
      <div className="space-y-4 max-w-4xl">
        <p className="leading-relaxed">
          Foi detectado um problema e o Caio XP foi desligado para evitar danos ao computador.
        </p>

        <p className="font-bold tracking-wider text-sm sm:text-base">
          CRITICAL_OBJECT_TERMINATION
        </p>

        <p className="leading-relaxed">
          Se esta for a primeira vez que você vê esta tela de erro de parada, reinicie o computador.
          Se esta tela for exibida novamente, siga estas etapas:
        </p>

        <p className="leading-relaxed">
          Certifique-se de que não finalizou processos vitais do kernel (como o processo System)
          no Gerenciador de Tarefas. Se novos softwares ou componentes foram instalados, desinstale-os.
        </p>

        <p className="leading-relaxed">
          Informações técnicas:
        </p>

        <p className="font-bold tracking-wide">
          *** STOP: 0x000000F4 (0x00000003, 0x82C74020, 0x82C74194, 0x805D297C)
        </p>

        <div className="pt-4 space-y-1">
          <p>Iniciando despejo de memória física...</p>
          <p>
            Despejo de memória física: <span className="font-bold">{dumpPercent}%</span>
          </p>
          {isComplete && (
            <>
              <p className="text-[#FFFF00]">Despejo de memória física concluído.</p>
              <p className="text-white pt-2 animate-pulse">
                Reinicializando o computador automaticamente... (ou clique para reiniciar agora)
              </p>
            </>
          )}
        </div>
      </div>

      <div className="text-[11px] sm:text-xs text-white/70 pt-4 border-t border-white/20 flex items-center justify-between">
        <span>Caio XP Professional - Núcleo do Sistema Interrompido</span>
        <span>Pressione qualquer tecla ou clique para reiniciar</span>
      </div>
    </div>
  );
};
```

- [ ] **Step 4: Run unit test to verify PASS**

Run: `npx vitest run src/test/BsodScreen.test.tsx`
Expected: PASS with 3 passed tests.

- [ ] **Step 5: Commit changes**

```bash
git add src/components/bsod/BsodScreen.tsx src/test/BsodScreen.test.tsx
git commit -m "feat(bsod): implement BsodScreen component with memory dump and tests"
```

---

### Task 3: Trigger BSOD on Terminating 'System' Process in TaskManagerApp

**Files:**
- Modify: `src/components/windows/TaskManagerApp.tsx:260-275`
- Modify: `src/test/TaskManagerApp.test.tsx`

**Interfaces:**
- Consumes: `useSystem().setScreenMode`.
- Produces: BSOD triggered when ending `System` process.

- [ ] **Step 1: Add unit test in `src/test/TaskManagerApp.test.tsx`**

In `src/test/TaskManagerApp.test.tsx`, add a test verifying that terminating `System` triggers `bsod`:

```tsx
it('triggers BSOD when terminating the System process in Processos tab', () => {
  let currentMode = 'desktop';
  const Harness = () => {
    const { setScreenMode } = useSystem();
    // Watch changes to screenMode
    return (
      <div>
        <TaskManagerApp isOpen={true} />
      </div>
    );
  };

  const { getByRole, getByText } = render(
    <SystemProvider>
      <WindowProvider>
        <Harness />
      </WindowProvider>
    </SystemProvider>
  );

  // Switch to Processos tab
  fireEvent.click(getByRole('tab', { name: /Processos/i }));

  // Click on the row with System
  const systemRow = getByText('System');
  fireEvent.click(systemRow);

  // Click Finalizar processo
  const endProcessBtn = getByRole('button', { name: /Finalizar processo/i });
  fireEvent.click(endProcessBtn);

  // Screen mode in context must have transitioned to bsod
});
```

- [ ] **Step 2: Update `handleEndProcess` in `src/components/windows/TaskManagerApp.tsx`**

In `TaskManagerApp.tsx`:
Inject `setScreenMode` from `useSystem`:
```tsx
const { setScreenMode } = useSystem();
```
Update `handleEndProcess`:
```tsx
  const handleEndProcess = () => {
    if (!selectedProcessPid) return;
    const proc = processes.find(p => p.pid === selectedProcessPid);
    if (!proc) return;

    if (proc.name === 'System' || proc.pid === 4) {
      setScreenMode('bsod');
      return;
    }

    if (proc.windowId) {
      closeWindow(proc.windowId);
      setSelectedProcessPid(null);
    } else if (proc.name === 'explorer.exe' || proc.user === 'SYSTEM') {
      alert(`O processo "${proc.name}" é um processo crítico do sistema e não pode ser finalizado.`);
    }
  };
```

- [ ] **Step 3: Run targeted test to verify PASS**

Run: `npx vitest run src/test/TaskManagerApp.test.tsx`
Expected: PASS.

- [ ] **Step 4: Commit changes**

```bash
git add src/components/windows/TaskManagerApp.tsx src/test/TaskManagerApp.test.tsx
git commit -m "feat(bsod): trigger BSOD on System process termination in TaskManager"
```

---

### Task 4: Mount `BsodScreen` in `App.tsx` and Full Verification

**Files:**
- Modify: `src/App.tsx:20-27`

**Interfaces:**
- Consumes: `<BsodScreen />`
- Produces: Integrated BSOD screen mode in main OS root.

- [ ] **Step 1: Mount `<BsodScreen />` in `src/App.tsx`**

In `src/App.tsx`, import `BsodScreen`:
```tsx
import { BsodScreen } from './components/bsod/BsodScreen';
```
And add condition:
```tsx
{screenMode === 'bsod' && <BsodScreen />}
```

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Run targeted unit tests**

Run: `npx vitest run src/test/BsodScreen.test.tsx src/test/TaskManagerApp.test.tsx`
Expected: All tests pass.

- [ ] **Step 4: Run production build**

Run: `npm run build`
Expected: `✓ built in ...ms` with code 0.

- [ ] **Step 5: Commit and push changes to `main`**

```bash
git add src/App.tsx
git commit -m "feat(bsod): mount BsodScreen in App and enable full BSOD flow"
git push origin main
```
