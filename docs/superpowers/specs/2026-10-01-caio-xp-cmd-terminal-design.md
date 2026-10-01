# Design Spec: Caio XP Terminal (Prompt de Comando - CMD)

**Date:** 2026-10-01  
**Status:** Approved  
**Author:** Antigravity & Caio Souza  

## 1. Overview & Objectives

Implement an authentic, nostalgic Command Prompt (*Prompt de comando*) customized with the portfolio's identity (**Caio XP Professional**), featuring:
1. Custom branding matching the login screen:
   ```
   Caio XP Professional [Versão 5.1.2600]
   (C) Copyright 2016-2026 Caio Souza. Todos os direitos reservados.
   ```
2. Prompt path set to: `C:\Caio\Desktop>`
3. Full command interpreter (`cmdEngine.ts`) with core functional commands:
   - `help`: Lists all supported commands with clean descriptions.
   - `shutdown`: Initiates system shutdown, resetting to the BIOS boot screen (`setScreenMode('bios')`).
   - `dir` / `ls`: Lists desktop files and directories (`sobre-caio.txt`, `caio-cv.pdf`, `projetos`, `hobbies`, `Lixeira`, etc.).
   - Executable commands:
     - `notepad [file]`: Opens the Notepad (`notepad-blank-window` or `about-window` if `sobre-caio.txt`).
     - `taskmgr`: Opens the Windows XP Task Manager (`task-manager-window`).
     - `winmine` / `minesweeper`: Opens Campo Minado (`minesweeper-window`).
     - `explorer [folder]`: Opens Projects or Hobbies folders.
     - `iexplore [url]` / `browser`: Opens Internet Explorer (`browser-window`).
     - `hinario`: Opens the mobile emulator for Hinário EAV (`mobile-app-window`).
     - `cv` / `pdf`: Opens the PDF resume viewer (`cv-window`).
   - Utility commands: `cls` / `clear` (clear screen), `ver` (prints Caio XP Professional version), `echo [text]`, `date`, `time`, `exit` (closes terminal).
4. Interactive terminal experience:
   - Command history navigation using ArrowUp (`↑`) and ArrowDown (`↓`).
   - Blinking cursor (`_`).
   - Auto-scroll to bottom on new output.
   - Click anywhere on the terminal window to focus the input prompt.
5. Entry points:
   - Desktop icon: `Prompt de comando` (`cmd-window`).
   - Start Menu shortcut: `Prompt de comando`.

---

## 2. Architecture & File Structure

```
portfolio-caio/
├── src/
│   ├── utils/
│   │   ├── cmdEngine.ts          # Pure command parsing and execution logic
│   │   └── data.ts               # Adds 'cmd' to DESKTOP_ICONS
│   ├── components/
│   │   ├── windows/
│   │   │   ├── CmdApp.tsx        # Terminal visual component & WindowFrame wrapper
│   │   │   └── WindowFrame.tsx   # Supports 'cmd' icon
│   │   └── desktop/
│   │       ├── Desktop.tsx       # Mounts <CmdApp />
│   │       ├── Taskbar.tsx       # Supports 'cmd' taskbar icon
│   │       └── StartMenu.tsx     # Adds "Prompt de comando" item
│   ├── context/
│   │   └── WindowContext.tsx     # Registers 'cmd-window' in DEFAULT_WINDOWS
│   └── test/
│       ├── cmdEngine.test.ts     # Unit tests for command parsing & execution
│       └── CmdApp.test.tsx       # Component tests for interactive terminal
```

---

## 3. Component & Engine Specifications

### 3.1 `cmdEngine.ts`
- **Interfaces**:
  ```typescript
  export interface CommandContext {
    openWindow: (id: string) => void;
    closeWindow: (id: string) => void;
    setScreenMode: (mode: 'bios' | 'login' | 'desktop') => void;
    openBrowser: (url?: string) => void;
    openMobileApp: (url?: string) => void;
  }

  export interface CommandResult {
    output: string[];
    clear?: boolean;
    exit?: boolean;
  }
  ```
- **Function**: `executeCommand(rawInput: string, ctx: CommandContext): CommandResult`
  - Parses command name and arguments (case-insensitive).
  - Handles `help`, `dir`/`ls`, `shutdown`, `notepad`, `taskmgr`, `winmine`, `explorer`, `iexplore`, `hinario`, `cv`, `cls`, `ver`, `echo`, `date`, `time`, `exit`.
  - For unknown commands: returns `'[comando]' não é reconhecido como um comando interno ou externo, um programa operável ou um arquivo em lotes. Digite 'help' para ver os comandos disponíveis.`.

### 3.2 `CmdApp.tsx`
- **Styling**:
  - Background: `#000000`.
  - Font: `font-mono text-sm leading-relaxed text-[#CCCCCC]`.
  - Prompt: `text-[#FFFFFF]`.
- **State**:
  - `lines: string[]`: Array of output lines. Initialized with:
    ```
    Caio XP Professional [Versão 5.1.2600]
    (C) Copyright 2016-2026 Caio Souza. Todos os direitos reservados.
    ```
  - `history: string[]`: Array of previously typed commands.
  - `historyIndex: number`: Current navigation position in command history.
  - `currentInput: string`: Current text in prompt input.
- **Interactions**:
  - KeyDown:
    - `Enter`: Executes command via `executeCommand`, appends to output and history, clears input.
    - `ArrowUp`: Navigates to previous command in history.
    - `ArrowDown`: Navigates to next command in history.
  - Click on container focuses the hidden input.

### 3.3 Access & Navigation
- **WindowContext**:
  - Register `cmd-window`:
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
- **Desktop Icons (`data.ts`)**:
  - Add `{ id: 'cmd', title: 'Prompt de comando', iconType: 'cmd', windowId: 'cmd-window' }`.
- **Start Menu (`StartMenu.tsx`)**:
  - Add item "Prompt de comando" with subtitle "Linha de comando do sistema".

---

## 4. Verification & Testing

1. `cmdEngine.test.ts`:
   - `help` outputs list of commands.
   - `shutdown` calls `setScreenMode('bios')`.
   - `notepad`, `taskmgr`, `winmine`, etc. call `openWindow`.
   - `dir` / `ls` returns desktop file listing.
   - `cls` returns `{ clear: true }`.
   - `ver` returns version string.
2. `CmdApp.test.tsx`:
   - Renders header and prompt `C:\Caio\Desktop>`.
   - Typing `help` and pressing Enter outputs commands.
   - ArrowUp/Down navigates command history.
   - Clicking window focuses input.
3. Typecheck & Build:
   - `npx tsc --noEmit` exits with 0 errors.
   - `npm run build` succeeds cleanly.
