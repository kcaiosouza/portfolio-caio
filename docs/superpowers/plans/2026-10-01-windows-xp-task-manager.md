# Windows XP Task Manager Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a fully functional Windows XP Task Manager (*Gerenciador de Tarefas do Windows*) that monitors open windows, allows terminating tasks, provides process and performance metrics with retro green CRT graphs, and is accessible via taskbar right-click and the start menu.

**Architecture:** A specialized window component (`TaskManagerApp.tsx`) integrated into `WindowContext`. The component reads active windows to list tasks and processes, triggers `closeWindow(id)` when terminating tasks, and renders real-time animated SVG/Canvas oscilloscope graphs on the Performance tab. Context menu in `Taskbar.tsx` allows opening the task manager by right-clicking.

**Tech Stack:** React 18, TypeScript, Tailwind CSS, Lucide icons, Vitest, React Testing Library.

## Global Constraints

- Authentic Windows XP look and feel: `#ECE9D8` dialog gray, beveled tabs, inset lists (`#7F9DB9` border), green CRT oscilloscope graph (`#001100` background, `#00FF00` graph trace).
- Real window control: clicking "Finalizar tarefa" calls `closeWindow(id)` and immediately removes the window from the desktop and task list.
- Accessible via right-click on the Taskbar and Start Menu shortcut.
- Zero regressions: all existing tests must pass, TypeScript must compile cleanly without errors.

---

### Task 1: Window Registration & Taskmgr Icon

**Files:**
- Modify: `src/context/WindowContext.tsx`
- Modify: `src/components/windows/WindowFrame.tsx`
- Modify: `src/components/desktop/Taskbar.tsx`
- Test: `src/test/windowContext.test.tsx`

**Interfaces:**
- Produces:
  - `task-manager-window` in `DEFAULT_WINDOWS` of `WindowContext.tsx`.
  - Icon support for `'taskmgr'` in `WindowFrame.tsx` and `Taskbar.tsx`.

- [ ] **Step 1: Write failing test in `windowContext.test.tsx`**

Add assertion in `src/test/windowContext.test.tsx` that `task-manager-window` is registered:
```typescript
it('contains task-manager-window in default windows', () => {
  renderWithProvider();
  expect(screen.getByTestId('window-count').textContent).toContain('task-manager-window');
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/windowContext.test.tsx`  
Expected: FAIL.

- [ ] **Step 3: Register `task-manager-window` in `DEFAULT_WINDOWS` and add `'taskmgr'` icon helper**

In `src/context/WindowContext.tsx`:
Add `task-manager-window` with title `"Gerenciador de tarefas do Windows"`, icon `"taskmgr"`, default position `{ x: 180, y: 50, width: 480, height: 530 }`.
In `src/components/windows/WindowFrame.tsx` and `src/components/desktop/Taskbar.tsx`:
Render the classic task manager / CPU graph icon when icon is `'taskmgr'`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/windowContext.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/context/WindowContext.tsx src/components/windows/WindowFrame.tsx src/components/desktop/Taskbar.tsx src/test/windowContext.test.tsx
git commit -m "feat(taskmgr): register task-manager-window and add taskmgr icon"
```

---

### Task 2: Implement `TaskManagerApp.tsx` & Unit Tests

**Files:**
- Create: `src/components/windows/TaskManagerApp.tsx`
- Create: `src/test/TaskManagerApp.test.tsx`

**Interfaces:**
- Consumes: `useWindowManager()` (`windows`, `closeWindow`, `focusWindow`, `openWindow`).
- Produces: `export const TaskManagerApp: React.FC<TaskManagerAppProps>` and `export const TaskManagerContent: React.FC`.

- [ ] **Step 1: Write failing unit test in `src/test/TaskManagerApp.test.tsx`**

Test the 3 tabs and the window termination behavior:
```typescript
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { WindowProvider, useWindowManager } from '../context/WindowContext';
import { TaskManagerApp, TaskManagerContent } from '../components/windows/TaskManagerApp';

describe('TaskManagerApp', () => {
  it('renders with tabs: Aplicativos, Processos, Desempenho', () => {
    render(
      <WindowProvider>
        <TaskManagerApp isOpen={true} />
      </WindowProvider>
    );
    expect(screen.getByText('Aplicativos')).toBeInTheDocument();
    expect(screen.getByText('Processos')).toBeInTheDocument();
    expect(screen.getByText('Desempenho')).toBeInTheDocument();
  });

  it('lists active open windows and terminates selected task', () => {
    const TestWrapper = () => {
      const { openWindow } = useWindowManager();
      React.useEffect(() => {
        openWindow('about-window');
      }, []);
      return <TaskManagerContent />;
    };

    render(
      <WindowProvider>
        <TestWrapper />
      </WindowProvider>
    );

    expect(screen.getByText(/sobre-caio\.txt/i)).toBeInTheDocument();
    const taskRow = screen.getByText(/sobre-caio\.txt/i);
    fireEvent.click(taskRow);

    const endTaskBtn = screen.getByRole('button', { name: /Finalizar tarefa/i });
    expect(endTaskBtn).toBeEnabled();
    fireEvent.click(endTaskBtn);

    expect(screen.queryByText(/sobre-caio\.txt/i)).not.toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/test/TaskManagerApp.test.tsx`  
Expected: FAIL ("Cannot find module '../components/windows/TaskManagerApp'").

- [ ] **Step 3: Implement `src/components/windows/TaskManagerApp.tsx`**

Implement full Windows XP Task Manager:
- Menu Bar: `Arquivo` (Nova Tarefa, Sair), `Opções`, `Exibir`, `Ajuda`.
- Beveled XP Tabs: `Aplicativos`, `Processos`, `Desempenho`.
- **Tab 1: Aplicativos**:
  - List of open windows (`isOpen === true && id !== 'task-manager-window'`).
  - Columns: `Tarefa` (Icon + Title), `Status` (`Executando`).
  - Selection highlight (`bg-[#0A246A] text-white`).
  - Buttons: "Finalizar tarefa" (`closeWindow(id)`), "Alternar para" (`focusWindow(id)`), "Nova tarefa..." (`openWindow`).
- **Tab 2: Processos**:
  - Processes table: `Nome da imagem`, `PID`, `CPU`, `Uso de memória`.
  - Dynamic mapping of active windows + system daemons (`explorer.exe`, `taskmgr.exe`, `puppy.exe`, etc.).
  - "Finalizar processo" button.
- **Tab 3: Desempenho**:
  - Retro green phosphor oscilloscopes:
    - CPU Usage (%) oscilloscope with animated waveform grid.
    - Memory Usage History (MB) oscilloscope.
    - Vertical digital level meters.
- Status Bar: `Processos: [N] | Uso de CPU: [X]% | Memória física: [Y]%`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/TaskManagerApp.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/windows/TaskManagerApp.tsx src/test/TaskManagerApp.test.tsx
git commit -m "feat(taskmgr): implement TaskManagerApp component with 3 tabs and task termination"
```

---

### Task 3: Taskbar Right-Click Menu, Start Menu Entry & Desktop Mount

**Files:**
- Modify: `src/components/desktop/Taskbar.tsx`
- Modify: `src/components/desktop/StartMenu.tsx`
- Modify: `src/components/desktop/Desktop.tsx`
- Test: `src/test/desktopAndTaskbar.test.tsx`

**Interfaces:**
- Right-clicking Taskbar triggers context menu with "Gerenciador de tarefas".
- Start Menu lists "Gerenciador de tarefas".
- `<TaskManagerApp id="task-manager-window" />` mounted on `Desktop.tsx`.

- [ ] **Step 1: Write test for taskbar context menu and Start Menu item**

In `src/test/desktopAndTaskbar.test.tsx`, add test:
- Right-clicking taskbar shows context menu with "Gerenciador de tarefas".
- Clicking "Gerenciador de tarefas" opens `task-manager-window`.

- [ ] **Step 2: Run test to verify failure**

Run: `npx vitest run src/test/desktopAndTaskbar.test.tsx`  
Expected: FAIL.

- [ ] **Step 3: Implement context menu in `Taskbar.tsx`, add to `StartMenu.tsx`, and mount in `Desktop.tsx`**

- In `Taskbar.tsx`:
  - Handle `onContextMenu` on taskbar container: prevent default, open XP context menu with options:
    - "Bloquear a barra de tarefas"
    - Separator
    - "Gerenciador de tarefas" -> `openWindow('task-manager-window')`
    - Separator
    - "Propriedades"
  - Handle clicking outside to dismiss context menu.
- In `StartMenu.tsx`:
  - Add "Gerenciador de tarefas" shortcut item with taskmgr icon.
- In `Desktop.tsx`:
  - Mount `<TaskManagerApp id="task-manager-window" />`.

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/test/desktopAndTaskbar.test.tsx`  
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components/desktop/Taskbar.tsx src/components/desktop/StartMenu.tsx src/components/desktop/Desktop.tsx src/test/desktopAndTaskbar.test.tsx
git commit -m "feat(desktop): add taskbar context menu, start menu shortcut, and mount TaskManagerApp"
```

---

### Task 4: Complete Verification & Push

**Files:**
- All codebase files

- [ ] **Step 1: Run complete Vitest suite**

Run: `npm run test` (or `npx vitest run`)  
Expected: All tests pass.

- [ ] **Step 2: Typecheck & Production Build**

Run: `npx tsc --noEmit && npm run build`  
Expected: Clean build without errors.

- [ ] **Step 3: Push to GitHub `main`**

```bash
git push origin main
```
