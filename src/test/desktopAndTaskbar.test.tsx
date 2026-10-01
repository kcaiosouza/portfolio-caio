import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SystemProvider, useSystem } from '../context/SystemContext';
import { WindowProvider, useWindowManager } from '../context/WindowContext';
import { Desktop } from '../components/desktop/Desktop';
import { DesktopIcon } from '../components/desktop/DesktopIcon';
import { Taskbar } from '../components/desktop/Taskbar';
import { StartMenu } from '../components/desktop/StartMenu';
import { SystemTray } from '../components/desktop/SystemTray';
import { DESKTOP_ICONS, PORTFOLIO_DATA } from '../utils/data';

// Helper component that exposes context states for asserting interactions
const TestDesktopWrapper: React.FC = () => {
  const { screenMode } = useSystem();
  const { windows, activeWindowId } = useWindowManager();

  return (
    <div>
      <div data-testid="screen-mode-val">{screenMode}</div>
      <div data-testid="active-window-val">{activeWindowId || 'none'}</div>
      <div data-testid="open-windows-count">
        {windows.filter((w) => w.isOpen).length}
      </div>
      <Desktop />
    </div>
  );
};

const renderWithProviders = (ui: React.ReactElement) => {
  return render(
    <SystemProvider>
      <WindowProvider>{ui}</WindowProvider>
    </SystemProvider>
  );
};

describe('Desktop and Taskbar Integration Tests', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Desktop Component', () => {
    it('renders desktop container with Bliss-inspired background and icons', () => {
      renderWithProviders(<TestDesktopWrapper />);

      const desktop = screen.getByRole('region', { name: /Área de Trabalho/i });
      expect(desktop).toBeInTheDocument();

      // Icons should all be rendered
      expect(screen.getByText('Lixeira')).toBeInTheDocument();
      expect(screen.getByText('caio-cv.pdf')).toBeInTheDocument();
      expect(screen.getByText('sobre-caio.txt')).toBeInTheDocument();
      expect(screen.getByText('hobbies')).toBeInTheDocument();

      // Taskbar and Start button
      expect(screen.getByText('iniciar')).toBeInTheDocument();

      // System tray
      expect(screen.getByRole('region', { name: /Bandeja do Sistema/i })).toBeInTheDocument();
    });

    it('opens window upon double clicking a desktop icon', () => {
      renderWithProviders(<TestDesktopWrapper />);

      expect(screen.getByTestId('open-windows-count').textContent).toBe('0');

      const notepadIcon = screen.getByText('sobre-caio.txt');
      fireEvent.doubleClick(notepadIcon);

      expect(screen.getByTestId('open-windows-count').textContent).toBe('1');
      expect(screen.getByTestId('active-window-val').textContent).toBe('about-window');

      // The window should now be in the document
      expect(screen.getAllByText('sobre-caio.txt - Bloco de notas').length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('DesktopIcon Component', () => {
    it('toggles selection on click and deselects on blur', () => {
      const item = DESKTOP_ICONS[0]; // Lixeira
      renderWithProviders(<DesktopIcon item={item} />);

      const iconBtn = screen.getByRole('button', { name: item.title });
      expect(iconBtn).toBeInTheDocument();

      // Initially not selected
      expect(iconBtn.className).toContain('hover:bg-white/10');

      // Single click selects it
      fireEvent.click(iconBtn);
      expect(iconBtn.className).toContain('bg-[#0B61FF]/40');
      expect(iconBtn.className).toContain('border-dotted');

      // Blur deselects it
      fireEvent.blur(iconBtn);
      expect(iconBtn.className).toContain('hover:bg-white/10');
    });

    it('opens window on Enter key press', () => {
      const item = DESKTOP_ICONS[1]; // caio-cv.pdf
      renderWithProviders(
        <div>
          <TestDesktopWrapper />
        </div>
      );

      const cvIcon = screen.getByRole('button', { name: item.title });
      fireEvent.keyDown(cvIcon, { key: 'Enter' });

      expect(screen.getByTestId('active-window-val').textContent).toBe('cv-window');
    });
  });

  describe('SystemTray Component', () => {
    it('displays formatted real-time clock HH:MM', () => {
      renderWithProviders(<SystemTray />);

      const clock = screen.getByTestId('digital-clock');
      expect(clock).toBeInTheDocument();
      // Should match HH:MM
      expect(clock.textContent).toMatch(/^\d{2}:\d{2}$/);
    });

    it('toggles sound mute on volume button click', () => {
      renderWithProviders(<SystemTray />);

      const unmutedBtn = screen.getByTitle(/Mutar sons retrô/i);
      expect(unmutedBtn).toBeInTheDocument();
      expect(screen.getByTestId('volume-unmuted-icon')).toBeInTheDocument();

      fireEvent.click(unmutedBtn);

      const mutedBtn = screen.getByTitle(/Desmutar sons/i);
      expect(mutedBtn).toBeInTheDocument();
      expect(screen.getByTestId('volume-muted-icon')).toBeInTheDocument();
    });

    it('toggles CRT monitor effect on CRT button click', () => {
      renderWithProviders(<SystemTray />);

      const crtBtn = screen.getByTitle(/Desativar efeito CRT|Ativar efeito CRT/i);
      expect(crtBtn).toBeInTheDocument();
      expect(screen.getByTestId('crt-toggle-icon')).toBeInTheDocument();

      const initialTitle = crtBtn.getAttribute('title');
      fireEvent.click(crtBtn);
      const afterTitle = crtBtn.getAttribute('title');

      expect(initialTitle).not.toEqual(afterTitle);
    });
  });

  describe('StartMenu Component', () => {
    it('does not render when isOpen is false', () => {
      const onClose = vi.fn();
      renderWithProviders(<StartMenu isOpen={false} onClose={onClose} />);

      expect(screen.queryByRole('menu', { name: /Menu Iniciar/i })).not.toBeInTheDocument();
    });

    it('renders classic 2-column XP layout with header, links, and footer when open', () => {
      const onClose = vi.fn();
      renderWithProviders(<StartMenu isOpen={true} onClose={onClose} />);

      expect(screen.getByRole('menu', { name: /Menu Iniciar/i })).toBeInTheDocument();

      // Header
      expect(screen.getByTestId('start-menu-avatar')).toBeInTheDocument();
      expect(screen.getByText(PORTFOLIO_DATA.name)).toBeInTheDocument();
      expect(screen.getByText(PORTFOLIO_DATA.title)).toBeInTheDocument();

      // Left column
      expect(screen.getByText('Sobre o Desenvolvedor')).toBeInTheDocument();
      expect(screen.getByText('Currículo (PDF)')).toBeInTheDocument();
      expect(screen.getByText('Meus Hobbies')).toBeInTheDocument();

      // Right column
      expect(screen.getByText('GitHub')).toBeInTheDocument();
      expect(screen.getByText('LinkedIn')).toBeInTheDocument();
      expect(screen.getByText('Email')).toBeInTheDocument();

      // Footer
      expect(screen.getByText('Fazer logoff')).toBeInTheDocument();
      expect(screen.getByText('Reiniciar BIOS')).toBeInTheDocument();
    });

    it('opens about window and calls onClose when clicking "Sobre o Desenvolvedor"', () => {
      const onClose = vi.fn();
      renderWithProviders(
        <div>
          <TestDesktopWrapper />
          <StartMenu isOpen={true} onClose={onClose} />
        </div>
      );

      fireEvent.click(screen.getByText('Sobre o Desenvolvedor'));
      expect(onClose).toHaveBeenCalled();
      expect(screen.getByTestId('active-window-val').textContent).toBe('about-window');
    });

    it('opens cv window and calls onClose when clicking "Currículo (PDF)"', () => {
      const onClose = vi.fn();
      renderWithProviders(
        <div>
          <TestDesktopWrapper />
          <StartMenu isOpen={true} onClose={onClose} />
        </div>
      );

      fireEvent.click(screen.getByText('Currículo (PDF)'));
      expect(onClose).toHaveBeenCalled();
      expect(screen.getByTestId('active-window-val').textContent).toBe('cv-window');
    });

    it('opens hobbies window and calls onClose when clicking "Meus Hobbies"', () => {
      const onClose = vi.fn();
      renderWithProviders(
        <div>
          <TestDesktopWrapper />
          <StartMenu isOpen={true} onClose={onClose} />
        </div>
      );

      fireEvent.click(screen.getByText('Meus Hobbies'));
      expect(onClose).toHaveBeenCalled();
      expect(screen.getByTestId('active-window-val').textContent).toBe('hobbies-window');
    });

    it('sets screenMode to login when clicking "Fazer logoff"', () => {
      const onClose = vi.fn();
      renderWithProviders(
        <div>
          <TestDesktopWrapper />
          <StartMenu isOpen={true} onClose={onClose} />
        </div>
      );

      fireEvent.click(screen.getByText('Fazer logoff'));
      expect(onClose).toHaveBeenCalled();
      expect(screen.getByTestId('screen-mode-val').textContent).toBe('login');
    });

    it('sets screenMode to bios when clicking "Reiniciar BIOS"', () => {
      const onClose = vi.fn();
      renderWithProviders(
        <div>
          <TestDesktopWrapper />
          <StartMenu isOpen={true} onClose={onClose} />
        </div>
      );

      fireEvent.click(screen.getByText('Reiniciar BIOS'));
      expect(onClose).toHaveBeenCalled();
      expect(screen.getByTestId('screen-mode-val').textContent).toBe('bios');
    });

    it('closes on Escape key press', () => {
      const onClose = vi.fn();
      renderWithProviders(<StartMenu isOpen={true} onClose={onClose} />);

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onClose).toHaveBeenCalled();
    });

    it('opens task manager window and calls onClose when clicking "Gerenciador de tarefas"', () => {
      const onClose = vi.fn();
      renderWithProviders(
        <div>
          <TestDesktopWrapper />
          <StartMenu isOpen={true} onClose={onClose} />
        </div>
      );

      fireEvent.click(screen.getByText('Gerenciador de tarefas'));
      expect(onClose).toHaveBeenCalled();
      expect(screen.getByTestId('active-window-val').textContent).toBe('task-manager-window');
    });
  });

  describe('Taskbar Component', () => {
    it('toggles StartMenu when clicking "iniciar" button', () => {
      renderWithProviders(<Taskbar />);

      const startBtn = screen.getByRole('button', { name: /Menu Iniciar/i });
      expect(screen.queryByRole('menu', { name: /Menu Iniciar/i })).not.toBeInTheDocument();

      // Click to open
      fireEvent.click(startBtn);
      expect(screen.getByRole('menu', { name: /Menu Iniciar/i })).toBeInTheDocument();

      // Click backdrop to close
      const backdrop = screen.getByTestId('start-menu-backdrop');
      fireEvent.click(backdrop);
      expect(screen.queryByRole('menu', { name: /Menu Iniciar/i })).not.toBeInTheDocument();
    });

    it('renders tabs for opened windows and toggles focus / minimize on click', () => {
      const TestWithWindows: React.FC = () => {
        const { openWindow } = useWindowManager();
        return (
          <div>
            <button
              onClick={() => {
                openWindow('about-window');
                openWindow('hobbies-window');
              }}
            >
              Open Both
            </button>
            <Taskbar />
          </div>
        );
      };

      renderWithProviders(<TestWithWindows />);

      fireEvent.click(screen.getByText('Open Both'));

      // Both should have tabs in the taskbar
      const aboutTab = screen.getByRole('button', { name: /sobre-caio.txt/i });
      const hobbiesTab = screen.getByRole('button', { name: /hobbies/i });
      expect(aboutTab).toBeInTheDocument();
      expect(hobbiesTab).toBeInTheDocument();

      // hobbies was opened last, so it should be active
      expect(hobbiesTab.getAttribute('aria-pressed')).toBe('true');
      expect(aboutTab.getAttribute('aria-pressed')).toBe('false');

      // Clicking the active tab minimizes it
      fireEvent.click(hobbiesTab);
      expect(hobbiesTab.getAttribute('aria-pressed')).toBe('false');

      // Clicking aboutTab focuses it
      fireEvent.click(aboutTab);
      expect(aboutTab.getAttribute('aria-pressed')).toBe('true');
    });

    it('opens context menu on right click and clicking "Gerenciador de tarefas" opens Task Manager', () => {
      renderWithProviders(<TestDesktopWrapper />);

      const taskbarNav = screen.getByRole('navigation', { name: /Barra de tarefas/i });
      fireEvent.contextMenu(taskbarNav);

      expect(screen.getByText('Bloquear a barra de tarefas')).toBeInTheDocument();
      expect(screen.getByText('Propriedades')).toBeInTheDocument();

      const taskMgrItem = screen.getByText('Gerenciador de tarefas');
      expect(taskMgrItem).toBeInTheDocument();

      fireEvent.click(taskMgrItem);
      expect(screen.getByTestId('active-window-val').textContent).toBe('task-manager-window');
      expect(screen.getByTestId('open-windows-count').textContent).toBe('1');
    });
  });
});
