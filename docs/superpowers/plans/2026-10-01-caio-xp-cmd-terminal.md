# Caio XP Command Prompt (CMD) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement an authentic, interactive Windows XP-style Command Prompt (CMD) terminal for Caio XP Professional featuring functional commands (`help`, `shutdown`, `dir`/`ls`, `notepad`, `taskmgr`, `winmine`, `explorer`, `iexplore`, `hinario`, `cv`, `cls`, `ver`, `echo`, `date`, `time`, `exit`), history navigation, and seamless system integration via Desktop and Start Menu.

**Architecture:** A decoupled architecture with a pure, testable command evaluation engine (`cmdEngine.ts`) that executes actions on a provided system/window context, and a React terminal UI component (`CmdApp.tsx`) wrapped in `WindowFrame` with prompt input, history buffers, auto-scroll, and click-to-focus behavior. Desktop icon and Start Menu shortcuts provide intuitive access.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Lucide React, Vitest, React Testing Library.

## Global Constraints

- **Branding & Header**: Header text must strictly be:
  ```
  Caio XP Professional [Versão 5.1.2600]
  (C) Copyright 2016-2026 Caio Souza. Todos os direitos reservados.
  ```
  Do not use "Microsoft Windows" or "Windows XP" in the terminal header, prompt, or `ver` output.
- **Prompt String**: The prompt must strictly display `C:\Caio\Desktop> ` followed by the active command input.
- **Shutdown Behavior**: The `shutdown` command must invoke `setScreenMode('bios')` to restart into the retro BIOS boot screen.
- **Testing & Build Integrity**: Ensure `npx tsc --noEmit` and `npm run build` pass without errors. Do not run heavy hanging test suites; run targeted unit tests (`src/test/cmdEngine.test.ts`).

---

### Task 1: Type Definitions and Desktop Icon Registration

**Files:**
- Modify: `src/types/index.ts:22-27`
- Modify: `src/utils/data.ts:46-53`

**Interfaces:**
- Consumes: Existing `DesktopIconItem` in `src/types/index.ts`.
- Produces: Expanded `iconType` union allowing `'cmd' | 'taskmgr' | 'minesweeper'`, and new `cmd` icon in `DESKTOP_ICONS`.

- [ ] **Step 1: Update DesktopIconItem type in `src/types/index.ts`**

Update `src/types/index.ts` to allow `'cmd'` in `iconType`:

```typescript
export interface DesktopIconItem {
  id: string;
  title: string;
  iconType: 'trash' | 'pdf' | 'notepad' | 'folder' | 'browser' | 'smartphone' | 'cmd' | 'taskmgr';
  windowId: string;
}
```

- [ ] **Step 2: Add Command Prompt icon to `DESKTOP_ICONS` in `src/utils/data.ts`**

In `src/utils/data.ts`, add the desktop icon entry:

```typescript
export const DESKTOP_ICONS: DesktopIconItem[] = [
  { id: 'recycle-bin', title: 'Lixeira', iconType: 'trash', windowId: 'recycle-bin-window' },
  { id: 'cv', title: 'caio-cv.pdf', iconType: 'pdf', windowId: 'cv-window' },
  { id: 'about', title: 'sobre-caio.txt', iconType: 'notepad', windowId: 'about-window' },
  { id: 'cmd', title: 'Prompt de comando', iconType: 'cmd', windowId: 'cmd-window' },
  { id: 'projects', title: 'projetos', iconType: 'folder', windowId: 'projects-window' },
  { id: 'hobbies', title: 'hobbies', iconType: 'folder', windowId: 'hobbies-window' }
];
```

- [ ] **Step 3: Verify TypeScript compilation**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 4: Commit changes**

```bash
git add src/types/index.ts src/utils/data.ts
git commit -m "feat(cmd): add cmd icon type and register desktop icon"
```

---

### Task 2: Command Engine Implementation and Unit Tests

**Files:**
- Create: `src/utils/cmdEngine.ts`
- Create: `src/test/cmdEngine.test.ts`

**Interfaces:**
- Consumes: `openWindow`, `closeWindow`, `setScreenMode`, `openBrowser`, `openMobileApp`.
- Produces: `executeCommand(rawInput: string, ctx: CommandContext): CommandResult` and `CMD_BANNER: string[]`.

- [ ] **Step 1: Write the failing unit tests for `cmdEngine`**

Create `src/test/cmdEngine.test.ts`:

```typescript
import { describe, it, expect, vi } from 'vitest';
import { executeCommand, CMD_BANNER, CommandContext } from '../utils/cmdEngine';

describe('cmdEngine', () => {
  const createMockContext = (): CommandContext => ({
    openWindow: vi.fn(),
    closeWindow: vi.fn(),
    setScreenMode: vi.fn(),
    openBrowser: vi.fn(),
    openMobileApp: vi.fn(),
  });

  it('provides the authentic Caio XP banner', () => {
    expect(CMD_BANNER[0]).toContain('Caio XP Professional [Versão 5.1.2600]');
    expect(CMD_BANNER[1]).toContain('(C) Copyright 2016-2026 Caio Souza');
  });

  it('handles help command', () => {
    const ctx = createMockContext();
    const result = executeCommand('help', ctx);
    expect(result.output.some(line => line.includes('HELP'))).toBe(true);
    expect(result.output.some(line => line.includes('SHUTDOWN'))).toBe(true);
    expect(result.output.some(line => line.includes('NOTEPAD'))).toBe(true);
  });

  it('handles shutdown command by setting screen mode to bios', () => {
    const ctx = createMockContext();
    const result = executeCommand('shutdown', ctx);
    expect(ctx.setScreenMode).toHaveBeenCalledWith('bios');
    expect(result.output.join(' ')).toContain('Reiniciando');
  });

  it('handles cls command with clear flag', () => {
    const ctx = createMockContext();
    const result = executeCommand('cls', ctx);
    expect(result.clear).toBe(true);
    expect(result.output).toEqual([]);
  });

  it('handles ver command returning Caio XP version', () => {
    const ctx = createMockContext();
    const result = executeCommand('ver', ctx);
    expect(result.output[0]).toContain('Caio XP Professional [Versão 5.1.2600]');
  });

  it('handles dir/ls command listing desktop items', () => {
    const ctx = createMockContext();
    const result = executeCommand('dir', ctx);
    const text = result.output.join('\n');
    expect(text).toContain('sobre-caio.txt');
    expect(text).toContain('caio-cv.pdf');
    expect(text).toContain('projetos');
    expect(text).toContain('hobbies');
  });

  it('handles program launchers (notepad, taskmgr, winmine, explorer, iexplore, hinario, cv)', () => {
    const ctx = createMockContext();
    
    executeCommand('notepad', ctx);
    expect(ctx.openWindow).toHaveBeenCalledWith('notepad-blank-window');

    executeCommand('notepad sobre-caio.txt', ctx);
    expect(ctx.openWindow).toHaveBeenCalledWith('about-window');

    executeCommand('taskmgr', ctx);
    expect(ctx.openWindow).toHaveBeenCalledWith('task-manager-window');

    executeCommand('winmine', ctx);
    expect(ctx.openWindow).toHaveBeenCalledWith('minesweeper-window');

    executeCommand('explorer hobbies', ctx);
    expect(ctx.openWindow).toHaveBeenCalledWith('hobbies-window');

    executeCommand('iexplore', ctx);
    expect(ctx.openBrowser).toHaveBeenCalled();

    executeCommand('hinario', ctx);
    expect(ctx.openMobileApp).toHaveBeenCalled();

    executeCommand('cv', ctx);
    expect(ctx.openWindow).toHaveBeenCalledWith('cv-window');
  });

  it('handles exit command', () => {
    const ctx = createMockContext();
    const result = executeCommand('exit', ctx);
    expect(result.exit).toBe(true);
    expect(ctx.closeWindow).toHaveBeenCalledWith('cmd-window');
  });

  it('handles echo command', () => {
    const ctx = createMockContext();
    const result = executeCommand('echo Hello World!', ctx);
    expect(result.output).toEqual(['Hello World!']);
  });

  it('handles unknown command with friendly error', () => {
    const ctx = createMockContext();
    const result = executeCommand('nonexistent_cmd', ctx);
    expect(result.output[0]).toContain('não é reconhecido como um comando interno');
  });
});
```

- [ ] **Step 2: Run unit test to verify failure before implementation**

Run: `npx vitest run src/test/cmdEngine.test.ts`
Expected: FAIL ("Cannot find module '../utils/cmdEngine'").

- [ ] **Step 3: Implement `src/utils/cmdEngine.ts`**

Create `src/utils/cmdEngine.ts`:

```typescript
export interface CommandContext {
  openWindow: (id: string) => void;
  closeWindow: (id: string) => void;
  setScreenMode: (mode: 'bios' | 'login' | 'desktop') => void;
  openBrowser?: (url?: string) => void;
  openMobileApp?: (url?: string) => void;
}

export interface CommandResult {
  output: string[];
  clear?: boolean;
  exit?: boolean;
}

export const CMD_BANNER: string[] = [
  'Caio XP Professional [Versão 5.1.2600]',
  '(C) Copyright 2016-2026 Caio Souza. Todos os direitos reservados.',
  ''
];

export const PROMPT_PATH = 'C:\\Caio\\Desktop>';

export function executeCommand(rawInput: string, ctx: CommandContext): CommandResult {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return { output: [] };
  }

  const spaceIndex = trimmed.indexOf(' ');
  const command = (spaceIndex === -1 ? trimmed : trimmed.substring(0, spaceIndex)).toLowerCase();
  const args = spaceIndex === -1 ? '' : trimmed.substring(spaceIndex + 1).trim();

  switch (command) {
    case 'help':
    case '?':
      return {
        output: [
          'Comandos disponíveis no Caio XP Professional:',
          '',
          '  HELP                  Exibe esta lista de comandos de ajuda.',
          '  CLS / CLEAR           Limpa a tela do Prompt de Comando.',
          '  VER                   Exibe a versão do Caio XP Professional.',
          '  DIR / LS              Lista arquivos e pastas da Área de Trabalho.',
          '  NOTEPAD [arquivo]     Abre o Bloco de Notas (ex: notepad sobre-caio.txt).',
          '  TASKMGR               Abre o Gerenciador de Tarefas do Windows.',
          '  WINMINE / MINESWEEPER Abre o jogo Campo Minado.',
          '  EXPLORER [pasta]      Abre o Windows Explorer (projetos ou hobbies).',
          '  IEXPLORE [url]        Abre o navegador Internet Explorer.',
          '  HINARIO               Abre o emulador móvel do aplicativo Hinário EAV.',
          '  CV / PDF              Abre o currículo completo em PDF.',
          '  ECHO [mensagem]       Exibe uma mensagem na tela.',
          '  DATE                  Exibe a data atual do sistema.',
          '  TIME                  Exibe a hora atual do sistema.',
          '  SHUTDOWN              Reinicia o computador para a tela de BIOS.',
          '  EXIT                  Fecha a janela do Prompt de Comando.',
          ''
        ]
      };

    case 'cls':
    case 'clear':
      return {
        output: [],
        clear: true
      };

    case 'ver':
    case 'version':
      return {
        output: [
          'Caio XP Professional [Versão 5.1.2600]',
          '(C) Copyright 2016-2026 Caio Souza. Todos os direitos reservados.'
        ]
      };

    case 'dir':
    case 'ls':
      return {
        output: [
          ' O volume na unidade C é CAIO_XP',
          ' O Número de Série do Volume é 2026-CA10',
          '',
          ' Pasta de C:\\Caio\\Desktop',
          '',
          '01/10/2026  10:00    <DIR>          .',
          '01/10/2026  10:00    <DIR>          ..',
          '01/10/2026  10:00    <DIR>          projetos',
          '01/10/2026  10:00    <DIR>          hobbies',
          '01/10/2026  10:00    <DIR>          Lixeira',
          '01/10/2026  10:00             1.420 sobre-caio.txt',
          '01/10/2026  10:00           154.218 caio-cv.pdf',
          '01/10/2026  10:00               482 Prompt de comando.lnk',
          '               3 arquivo(s)        156.120 bytes',
          '               5 pasta(s)   124.582.912 bytes livres'
        ]
      };

    case 'shutdown':
    case 'reboot':
    case 'restart':
      ctx.setScreenMode('bios');
      return {
        output: ['Reiniciando o sistema Caio XP Professional...']
      };

    case 'notepad':
    case 'bloco':
      if (args.toLowerCase().includes('sobre') || args.toLowerCase().includes('caio')) {
        ctx.openWindow('about-window');
        return { output: ['Abrindo sobre-caio.txt no Bloco de notas...'] };
      }
      ctx.openWindow('notepad-blank-window');
      return { output: ['Iniciando Bloco de notas...'] };

    case 'taskmgr':
    case 'taskmanager':
      ctx.openWindow('task-manager-window');
      return { output: ['Iniciando Gerenciador de tarefas...'] };

    case 'winmine':
    case 'minesweeper':
    case 'minado':
      ctx.openWindow('minesweeper-window');
      return { output: ['Iniciando Campo Minado...'] };

    case 'explorer':
      if (args.toLowerCase().includes('hobb')) {
        ctx.openWindow('hobbies-window');
        return { output: ['Abrindo pasta hobbies...'] };
      }
      ctx.openWindow('projects-window');
      return { output: ['Abrindo pasta projetos...'] };

    case 'iexplore':
    case 'browser':
    case 'internet':
      if (ctx.openBrowser) {
        ctx.openBrowser(args || undefined);
      } else {
        ctx.openWindow('browser-window');
      }
      return { output: ['Iniciando Internet Explorer...'] };

    case 'hinario':
    case 'mobile':
      if (ctx.openMobileApp) {
        ctx.openMobileApp();
      } else {
        ctx.openWindow('mobile-app-window');
      }
      return { output: ['Iniciando Hinario EAV (Emulador Móvel)...'] };

    case 'cv':
    case 'pdf':
    case 'curriculo':
      ctx.openWindow('cv-window');
      return { output: ['Abrindo currículo (caio-cv.pdf)...'] };

    case 'echo':
      return {
        output: [args]
      };

    case 'date': {
      const now = new Date();
      return {
        output: [`Data atual: ${now.toLocaleDateString('pt-BR')}`]
      };
    }

    case 'time': {
      const now = new Date();
      return {
        output: [`Hora atual: ${now.toLocaleTimeString('pt-BR')}`]
      };
    }

    case 'exit':
      ctx.closeWindow('cmd-window');
      return {
        output: [],
        exit: true
      };

    default:
      return {
        output: [
          `'${command}' não é reconhecido como um comando interno ou externo,`,
          'um programa operável ou um arquivo em lotes.',
          "Digite 'help' para ver os comandos disponíveis."
        ]
      };
  }
}
```

- [ ] **Step 4: Run unit test to verify PASS**

Run: `npx vitest run src/test/cmdEngine.test.ts`
Expected: PASS with 10 passed tests.

- [ ] **Step 5: Commit changes**

```bash
git add src/utils/cmdEngine.ts src/test/cmdEngine.test.ts
git commit -m "feat(cmd): implement cmdEngine command executor and unit tests"
```

---

### Task 3: Window Registration and Icon Support across UI

**Files:**
- Modify: `src/context/WindowContext.tsx:160-180`
- Modify: `src/components/windows/WindowFrame.tsx:240-270`
- Modify: `src/components/desktop/DesktopIcon.tsx:15-32`
- Modify: `src/components/desktop/Taskbar.tsx:35-52`
- Modify: `src/components/desktop/StartMenu.tsx:210-230`

**Interfaces:**
- Consumes: Window definitions, `useWindowManager`, `executeCommand`.
- Produces: `cmd-window` registered in `WindowContext`, CMD SVG icon rendered in `WindowFrame`, `DesktopIcon`, `Taskbar`, and `StartMenu`.

- [ ] **Step 1: Register `cmd-window` in `src/context/WindowContext.tsx`**

Add `cmd-window` to `DEFAULT_WINDOWS`:

```typescript
{
  id: 'cmd-window',
  title: 'Prompt de comando',
  icon: 'cmd',
  isOpen: false,
  isMinimized: false,
  isMaximized: false,
  zIndex: 10,
  position: { x: 120, y: 70, width: 640, height: 420 },
  defaultPosition: { x: 120, y: 70, width: 640, height: 420 }
}
```

- [ ] **Step 2: Add `cmd` icon to `WindowFrame.tsx`**

In `WindowFrame.tsx`, inside `renderIcon()`, add:

```typescript
case 'cmd':
  return (
    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="2" width="14" height="11" rx="1" fill="#000000" stroke="#7A96DF" strokeWidth="0.8" />
      <path d="M3 5.5L5.5 8L3 10.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 10.5H11" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
```

- [ ] **Step 3: Add `cmd` icon to `DesktopIcon.tsx`**

In `DesktopIcon.tsx`, inside `renderIcon()`, add:

```typescript
case 'cmd':
  return (
    <div className="w-9 h-9 bg-black border border-[#7A96DF] rounded-[3px] flex items-center justify-center shadow-md p-1" data-testid="icon-cmd">
      <span className="text-white font-mono text-[11px] font-bold">&gt;_</span>
    </div>
  );
```

- [ ] **Step 4: Add `cmd` icon to `Taskbar.tsx`**

In `Taskbar.tsx`, inside `getWindowIcon()`, add:

```typescript
case 'cmd':
  return (
    <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="2" width="14" height="11" rx="1" fill="#000000" stroke="#7A96DF" strokeWidth="0.8" />
      <path d="M3 5.5L5.5 8L3 10.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 10.5H11" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
```

- [ ] **Step 5: Add Command Prompt button in `StartMenu.tsx`**

In `StartMenu.tsx`, right under the Task Manager button, add:

```tsx
<button
  type="button"
  data-testid="start-menu-cmd"
  onClick={() => {
    openWindow('cmd-window');
    onClose();
  }}
  className="flex items-center gap-2.5 p-2 rounded hover:bg-[#245EDC] hover:text-white text-gray-800 text-left transition-colors group"
>
  <div className="w-5 h-5 flex items-center justify-center flex-shrink-0">
    <svg className="w-4 h-4 drop-shadow-xs" viewBox="0 0 16 16" fill="none">
      <rect x="1" y="2" width="14" height="11" rx="1" fill="#000000" stroke="#7A96DF" strokeWidth="0.8" />
      <path d="M3 5.5L5.5 8L3 10.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7 10.5H11" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  </div>
  <div className="leading-tight">
    <span className="font-semibold block">Prompt de comando</span>
    <span className="text-[10px] text-gray-500 group-hover:text-blue-100 block">Linha de comando do sistema</span>
  </div>
</button>
```

- [ ] **Step 6: Verify compilation**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 7: Commit changes**

```bash
git add src/context/WindowContext.tsx src/components/windows/WindowFrame.tsx src/components/desktop/DesktopIcon.tsx src/components/desktop/Taskbar.tsx src/components/desktop/StartMenu.tsx
git commit -m "feat(cmd): register cmd window and visual icons across window frame, desktop, taskbar and start menu"
```

---

### Task 4: Terminal Visual Component (`CmdApp.tsx`) and Interactive Tests

**Files:**
- Create: `src/components/windows/CmdApp.tsx`
- Create: `src/test/CmdApp.test.tsx`

**Interfaces:**
- Consumes: `WindowFrame`, `useWindowManager`, `useSystem`, `executeCommand`, `CMD_BANNER`, `PROMPT_PATH`.
- Produces: `CmdApp` React component rendering the terminal screen.

- [ ] **Step 1: Write tests for `CmdApp`**

Create `src/test/CmdApp.test.tsx`:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CmdApp } from '../components/windows/CmdApp';
import { WindowProvider } from '../context/WindowContext';
import { SystemProvider } from '../context/SystemContext';

describe('CmdApp', () => {
  const renderCmd = () => {
    return render(
      <SystemProvider>
        <WindowProvider>
          <CmdApp />
        </WindowProvider>
      </SystemProvider>
    );
  };

  it('renders initial banner and prompt path C:\\Caio\\Desktop>', () => {
    renderCmd();
    expect(screen.getByText(/Caio XP Professional \[Versão 5.1.2600\]/i)).toBeInTheDocument();
    expect(screen.getByText(/C:\\Caio\\Desktop>/i)).toBeInTheDocument();
  });

  it('executes a command on Enter and displays output', () => {
    renderCmd();
    const input = screen.getByRole('textbox', { name: /prompt-input/i });
    fireEvent.change(input, { target: { value: 'ver' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(screen.getAllByText(/Caio XP Professional \[Versão 5.1.2600\]/i).length).toBeGreaterThanOrEqual(1);
  });

  it('navigates command history with ArrowUp and ArrowDown', () => {
    renderCmd();
    const input = screen.getByRole('textbox', { name: /prompt-input/i }) as HTMLInputElement;

    fireEvent.change(input, { target: { value: 'echo first' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    fireEvent.change(input, { target: { value: 'echo second' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    // Press ArrowUp to get "echo second"
    fireEvent.keyDown(input, { key: 'ArrowUp', code: 'ArrowUp' });
    expect(input.value).toBe('echo second');

    // Press ArrowUp to get "echo first"
    fireEvent.keyDown(input, { key: 'ArrowUp', code: 'ArrowUp' });
    expect(input.value).toBe('echo first');

    // Press ArrowDown to get back to "echo second"
    fireEvent.keyDown(input, { key: 'ArrowDown', code: 'ArrowDown' });
    expect(input.value).toBe('echo second');
  });

  it('clears screen when cls is typed', () => {
    renderCmd();
    const input = screen.getByRole('textbox', { name: /prompt-input/i });
    fireEvent.change(input, { target: { value: 'cls' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(screen.queryByText(/Versão 5.1.2600/i)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify failure before implementing component**

Run: `npx vitest run src/test/CmdApp.test.tsx`
Expected: FAIL ("Cannot find module '../components/windows/CmdApp'").

- [ ] **Step 3: Implement `src/components/windows/CmdApp.tsx`**

Create `src/components/windows/CmdApp.tsx`:

```tsx
import React, { useState, useRef, useEffect } from 'react';
import { WindowFrame } from './WindowFrame';
import { useWindowManager } from '../../context/WindowContext';
import { useSystem } from '../../context/SystemContext';
import { executeCommand, CMD_BANNER, PROMPT_PATH } from '../../utils/cmdEngine';

interface CmdHistoryEntry {
  command?: string;
  output?: string[];
}

export const CmdApp: React.FC = () => {
  const { openWindow, closeWindow, openBrowser, openMobileApp } = useWindowManager();
  const { setScreenMode } = useSystem();

  const [history, setHistory] = useState<CmdHistoryEntry[]>([
    { output: CMD_BANNER }
  ]);
  const [commandList, setCommandList] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [inputVal, setInputVal] = useState<string>('');

  const inputRef = useRef<HTMLInputElement>(null);
  const terminalScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom whenever history updates
  useEffect(() => {
    if (terminalScrollRef.current) {
      terminalScrollRef.current.scrollTop = terminalScrollRef.current.scrollHeight;
    }
  }, [history]);

  const handleContainerClick = () => {
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const raw = inputVal;
      const trimmed = raw.trim();

      if (trimmed) {
        setCommandList((prev) => [...prev, trimmed]);
      }
      setHistoryIndex(-1);

      const result = executeCommand(raw, {
        openWindow,
        closeWindow,
        setScreenMode,
        openBrowser,
        openMobileApp
      });

      if (result.clear) {
        setHistory([]);
      } else {
        setHistory((prev) => [
          ...prev,
          {
            command: raw,
            output: result.output
          }
        ]);
      }

      setInputVal('');
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandList.length === 0) return;

      const nextIndex = historyIndex === -1 ? commandList.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setInputVal(commandList[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;

      const nextIndex = historyIndex + 1;
      if (nextIndex >= commandList.length) {
        setHistoryIndex(-1);
        setInputVal('');
      } else {
        setHistoryIndex(nextIndex);
        setInputVal(commandList[nextIndex]);
      }
    }
  };

  return (
    <WindowFrame
      id="cmd-window"
      title="Prompt de comando"
      icon="cmd"
      className="bg-black"
    >
      <div
        ref={terminalScrollRef}
        onClick={handleContainerClick}
        data-testid="cmd-terminal-body"
        className="w-full h-full bg-black text-[#CCCCCC] font-mono text-xs sm:text-sm p-3 overflow-y-auto select-text cursor-text leading-tight flex flex-col justify-start"
        style={{ minHeight: '100%', fontFamily: 'Consolas, "Lucida Console", "Courier New", monospace' }}
      >
        {/* Render prior history blocks */}
        {history.map((entry, idx) => (
          <div key={idx} className="mb-1">
            {entry.command !== undefined && (
              <div className="flex items-center text-white">
                <span className="text-[#AAAAAA] mr-1">{PROMPT_PATH}</span>
                <span>{entry.command}</span>
              </div>
            )}
            {entry.output && entry.output.map((line, lineIdx) => (
              <div key={lineIdx} className="whitespace-pre-wrap min-h-[1.1rem]">
                {line}
              </div>
            ))}
          </div>
        ))}

        {/* Active prompt row */}
        <div className="flex items-center text-white mt-0.5">
          <span className="text-[#AAAAAA] mr-1 select-none">{PROMPT_PATH}</span>
          <div className="relative flex-1 flex items-center">
            <input
              ref={inputRef}
              type="text"
              aria-label="prompt-input"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className="w-full bg-transparent text-white outline-none border-none p-0 m-0 font-mono text-xs sm:text-sm"
              spellCheck={false}
              autoComplete="off"
            />
          </div>
        </div>
      </div>
    </WindowFrame>
  );
};
```

- [ ] **Step 4: Run test to verify PASS**

Run: `npx vitest run src/test/CmdApp.test.tsx`
Expected: PASS with 4 passed tests.

- [ ] **Step 5: Commit changes**

```bash
git add src/components/windows/CmdApp.tsx src/test/CmdApp.test.tsx
git commit -m "feat(cmd): implement CmdApp visual component and interactive tests"
```

---

### Task 5: Mount `CmdApp` in Desktop & Full Verification

**Files:**
- Modify: `src/components/desktop/Desktop.tsx:1-60`

**Interfaces:**
- Consumes: `<CmdApp />`
- Produces: Command Prompt accessible and mounted on Desktop.

- [ ] **Step 1: Import and mount `<CmdApp />` in `src/components/desktop/Desktop.tsx`**

In `src/components/desktop/Desktop.tsx`:
Add import:
```tsx
import { CmdApp } from '../windows/CmdApp';
```
And mount `<CmdApp />` alongside `<TaskManagerApp />`:
```tsx
<TaskManagerApp />
<CmdApp />
```

- [ ] **Step 2: Run TypeScript check**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Run targeted test suite**

Run: `npx vitest run src/test/cmdEngine.test.ts src/test/CmdApp.test.tsx`
Expected: All tests pass.

- [ ] **Step 4: Run production build**

Run: `npm run build`
Expected: Build finishes with `✓ built in ...ms` and zero errors.

- [ ] **Step 5: Commit changes**

```bash
git add src/components/desktop/Desktop.tsx
git commit -m "feat(cmd): mount CmdApp in Desktop"
```

---

### Task 6: Push to Remote Repository

**Files:**
- Repository remote: `origin/main`

- [ ] **Step 1: Verify clean git status**

Run: `git status`
Expected: working tree clean.

- [ ] **Step 2: Push changes to `origin main`**

Run: `git push origin main`
Expected: Everything pushed to `https://github.com/kcaiosouza/portfolio-caio.git`.
