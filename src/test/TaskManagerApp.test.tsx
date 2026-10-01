import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WindowProvider, useWindowManager } from '../context/WindowContext';
import { TaskManagerApp, TaskManagerContent } from '../components/windows/TaskManagerApp';

describe('TaskManagerApp', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders with tabs: Aplicativos, Processos, Desempenho and status bar', () => {
    render(
      <WindowProvider>
        <TaskManagerApp isOpen={true} />
      </WindowProvider>
    );

    expect(screen.getByRole('tab', { name: /Aplicativos/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Processos/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /Desempenho/i })).toBeInTheDocument();

    // Check status bar
    expect(screen.getByText(/Processos:/i)).toBeInTheDocument();
    expect(screen.getByText(/Uso de CPU:/i)).toBeInTheDocument();
    expect(screen.getByText(/Memória física:/i)).toBeInTheDocument();
  });

  it('lists active open windows in Aplicativos tab (excluding task-manager-window)', () => {
    const TestComponent = () => {
      const { openWindow } = useWindowManager();
      React.useEffect(() => {
        openWindow('about-window');
        openWindow('task-manager-window');
      }, []);

      return <TaskManagerContent />;
    };

    render(
      <WindowProvider>
        <TestComponent />
      </WindowProvider>
    );

    // Should display open about-window
    expect(screen.getByText(/sobre-caio\.txt/i)).toBeInTheDocument();

    // Should NOT display task-manager-window in the task list
    const taskListTable = screen.getByTestId('task-list-table');
    expect(taskListTable.textContent).not.toContain('Gerenciador de tarefas do Windows');
  });

  it('terminates selected task when clicking "Finalizar tarefa"', () => {
    const TestComponent = () => {
      const { openWindow } = useWindowManager();
      React.useEffect(() => {
        openWindow('about-window');
      }, []);

      return <TaskManagerContent />;
    };

    render(
      <WindowProvider>
        <TestComponent />
      </WindowProvider>
    );

    expect(screen.getByText(/sobre-caio\.txt/i)).toBeInTheDocument();

    // Select row
    const taskRow = screen.getByText(/sobre-caio\.txt/i).closest('tr');
    expect(taskRow).toBeTruthy();
    if (taskRow) fireEvent.click(taskRow);

    const endTaskBtn = screen.getByRole('button', { name: /Finalizar tarefa/i });
    expect(endTaskBtn).toBeEnabled();

    // Click Finalizar tarefa
    fireEvent.click(endTaskBtn);

    // Window should be closed and removed from list
    expect(screen.queryByText(/sobre-caio\.txt/i)).not.toBeInTheDocument();
  });

  it('focuses selected task when clicking "Alternar para"', () => {
    const ActiveWindowSpy = () => {
      const { activeWindowId, openWindow } = useWindowManager();
      React.useEffect(() => {
        openWindow('about-window');
        openWindow('cv-window');
      }, []);

      return (
        <div>
          <span data-testid="active-win">{activeWindowId}</span>
          <TaskManagerContent />
        </div>
      );
    };

    render(
      <WindowProvider>
        <ActiveWindowSpy />
      </WindowProvider>
    );

    // Initial active window is cv-window (last opened)
    expect(screen.getByTestId('active-win').textContent).toBe('cv-window');

    // Select about-window
    const aboutRow = screen.getByText(/sobre-caio\.txt/i).closest('tr');
    expect(aboutRow).toBeTruthy();
    if (aboutRow) fireEvent.click(aboutRow);

    const switchBtn = screen.getByRole('button', { name: /Alternar para/i });
    fireEvent.click(switchBtn);

    // Active window should now be about-window
    expect(screen.getByTestId('active-win').textContent).toBe('about-window');
  });

  it('switches to Processos tab and displays process list table with system and task processes', () => {
    const TestComponent = () => {
      const { openWindow } = useWindowManager();
      React.useEffect(() => {
        openWindow('about-window');
      }, []);

      return <TaskManagerContent />;
    };

    render(
      <WindowProvider>
        <TestComponent />
      </WindowProvider>
    );

    // Switch to Processos tab
    const processosTab = screen.getByRole('tab', { name: /Processos/i });
    fireEvent.click(processosTab);

    // Verify table headers
    expect(screen.getByText('Nome da imagem')).toBeInTheDocument();
    expect(screen.getByText('PID')).toBeInTheDocument();
    expect(screen.getByText('CPU')).toBeInTheDocument();
    expect(screen.getByText('Uso de memória')).toBeInTheDocument();

    // Verify daemons and task processes
    expect(screen.getByText('explorer.exe')).toBeInTheDocument();
    expect(screen.getByText('taskmgr.exe')).toBeInTheDocument();
    expect(screen.getByText('notepad.exe')).toBeInTheDocument();

    // Verify "Finalizar processo" button
    expect(screen.getByRole('button', { name: /Finalizar processo/i })).toBeInTheDocument();
  });

  it('switches to Desempenho tab and displays CPU and Memory performance oscilloscopes', () => {
    render(
      <WindowProvider>
        <TaskManagerContent />
      </WindowProvider>
    );

    // Switch to Desempenho tab
    const desempenhoTab = screen.getByRole('tab', { name: /Desempenho/i });
    fireEvent.click(desempenhoTab);

    // Verify CPU graph title / label
    expect(screen.getByText('Uso de CPU')).toBeInTheDocument();
    expect(screen.getByText('Histórico do uso de CPU')).toBeInTheDocument();

    // Verify Memory graph title / label
    expect(screen.getByText('Uso de PF')).toBeInTheDocument();
    expect(screen.getByText('Histórico do uso de memória')).toBeInTheDocument();

    // Verify oscilloscope CRT graph elements are rendered
    expect(screen.getByTestId('cpu-oscilloscope')).toBeInTheDocument();
    expect(screen.getByTestId('memory-oscilloscope')).toBeInTheDocument();
  });
});
