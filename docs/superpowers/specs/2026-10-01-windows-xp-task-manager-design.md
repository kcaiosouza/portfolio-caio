# Design Spec: Windows XP Task Manager (Gerenciador de Tarefas)

**Date:** 2026-10-01  
**Status:** Approved  
**Author:** Antigravity & Caio Souza  

## 1. Overview & Objectives

Implement an authentic, fully functional Windows XP Task Manager (*Gerenciador de Tarefas do Windows*) that allows users to:
1. View all active applications/windows in real time.
2. Select any open window and terminate it immediately ("Finalizar tarefa"), properly updating the global window state.
3. Switch to ("Alternar para") the selected application to bring it to the foreground.
4. Explore active processes (*Processos*) mapped to current tasks and system components (`explorer.exe`, `taskmgr.exe`, `notepad.exe`, `puppy.exe`, `minesweeper.exe`, `system.exe`).
5. Observe the nostalgic green CRT oscilloscope performance graphs (*Desempenho*) for CPU usage and Memory history.
6. Open the Task Manager seamlessly via:
   - Right-clicking the Taskbar (*Barra de Tarefas*) context menu: "Gerenciador de tarefas".
   - Start Menu (*iniciar*): Shortcut "Gerenciador de tarefas".

---

## 2. Architecture & File Structure

```
portfolio-caio/
├── src/
│   ├── components/
│   │   ├── windows/
│   │   │   ├── TaskManagerApp.tsx         # Main Task Manager application with 3 tabs
│   │   │   └── WindowFrame.tsx            # Supports taskmgr icon
│   │   └── desktop/
│   │       ├── Taskbar.tsx                # Adds right-click context menu
│   │       ├── StartMenu.tsx              # Adds Task Manager shortcut
│   │       └── Desktop.tsx                # Mounts <TaskManagerApp />
│   ├── context/
│   │   └── WindowContext.tsx              # Registers task-manager-window in DEFAULT_WINDOWS
│   └── test/
│       ├── TaskManagerApp.test.tsx        # Unit & interaction tests
│       └── desktopAndTaskbar.test.tsx     # Context menu and open tests
```

---

## 3. Detailed Component & Interaction Design

### 3.1 `WindowContext.tsx`
- Register `task-manager-window`:
  ```typescript
  {
    id: 'task-manager-window',
    title: 'Gerenciador de tarefas do Windows',
    icon: 'taskmgr',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    position: { x: 180, y: 50, width: 480, height: 530 },
    defaultPosition: { x: 180, y: 50, width: 480, height: 530 }
  }
  ```

### 3.2 `TaskManagerApp.tsx`
- **Menu Bar**: `Arquivo` (Nova Tarefa, Sair), `Opções`, `Exibir`, `Ajuda`.
- **Tab Navigation**: Classic XP beveled tabs:
  - `Aplicativos` (Applications)
  - `Processos` (Processes)
  - `Desempenho` (Performance)
- **Tab 1: Aplicativos**:
  - Displays table of open windows from `useWindowManager().windows.filter(w => w.isOpen && w.id !== 'task-manager-window')`.
  - Column 1: `Tarefa` (Window icon + Title).
  - Column 2: `Status` (Fixed string "Executando").
  - Row click selects a task (`selectedTaskId`). Double click switches to task.
  - Buttons at bottom:
    - **Finalizar tarefa**: Calls `closeWindow(selectedTaskId)`. Disabled when no task is selected.
    - **Alternar para**: Calls `focusWindow(selectedTaskId)`. Disabled when no task is selected.
    - **Nova tarefa...**: Opens a classic Run dialog or triggers window open.
- **Tab 2: Processos**:
  - Displays table with columns: `Nome da imagem`, `PID`, `CPU`, `Uso de memória`.
  - Dynamic processes based on active windows:
    - `explorer.exe` (Shell / Desktop)
    - `taskmgr.exe` (Task Manager)
    - `puppy.exe` (Rover Assistant)
    - If `notepad-blank-window` or `about-window` or hobby text: `notepad.exe`
    - If `browser-window`: `iexplore.exe`
    - If `mobile-app-window`: `hinario.exe`
    - If `minesweeper-window`: `winmine.exe`
    - If `cv-window`: `acrobt32.exe`
    - Background services: `svchost.exe`, `system.exe`, `csrss.exe`.
  - Button **Finalizar processo**: Closes the associated window if applicable.
- **Tab 3: Desempenho**:
  - Two green CRT-style oscilloscope display boxes (`#001100` background, dark green grid, bright `#00FF00` waveform line).
  - Box 1: **Uso de CPU** (%) with real-time oscillating waveform (2% - 20%).
  - Box 2: **Histórico do uso de memória** (MB) with smooth wave (e.g. 180 MB - 240 MB).
  - Digital readout meters with percentages.
- **Status Bar**:
  - Fixed bottom bar with 3 segments:
    - `Processos: [N]`
    - `Uso de CPU: [X]%`
    - `Memória física: [Y]%`

### 3.3 Taskbar Context Menu (`Taskbar.tsx`)
- Right-clicking anywhere on the taskbar (`onContextMenu={(e) => { e.preventDefault(); ... }}`):
  - Opens classic Windows XP context menu (`#ECE9D8`, border `#002D96` / `#7F9DB9`, shadow, Tahoma font).
  - Menu items:
    - `Bloquear a barra de tarefas` (with checkmark)
    - Separator
    - `Gerenciador de tarefas` (Bold or prominent; clicks `openWindow('task-manager-window')`)
    - Separator
    - `Propriedades`
- Clicking outside closes context menu.

### 3.4 Start Menu (`StartMenu.tsx`)
- Adds item `Gerenciador de tarefas` with computer/task icon in the left or right column, launching `task-manager-window`.

---

## 4. Verification & Testing

1. **Unit Tests (`TaskManagerApp.test.tsx`)**:
   - Renders Task Manager with default tab "Aplicativos".
   - Lists currently open windows.
   - Selects a window and clicks "Finalizar tarefa", asserting `closeWindow` was called and window was closed.
   - Selects a window and clicks "Alternar para", asserting `focusWindow` was called.
   - Switches tabs to "Processos" and verifies process list is rendered.
   - Switches tabs to "Desempenho" and verifies CPU/Memory graphs are rendered.
2. **Integration Tests (`desktopAndTaskbar.test.tsx`)**:
   - Right-clicking Taskbar opens context menu with "Gerenciador de tarefas".
   - Clicking "Gerenciador de tarefas" opens the Task Manager window.
3. **Build & Typecheck**:
   - `npx tsc --noEmit` exits with 0 errors.
   - `npm run build` succeeds cleanly.
