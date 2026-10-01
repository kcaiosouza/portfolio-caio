import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WindowProvider, useWindowManager } from '../context/WindowContext';
import { WindowFrame } from '../components/windows/WindowFrame';

const TestApp: React.FC<{
  windowId: string;
  defaultOpen?: boolean;
}> = ({ windowId, defaultOpen = true }) => {
  const { openWindow } = useWindowManager();

  React.useEffect(() => {
    if (defaultOpen) {
      openWindow(windowId);
    }
  }, [windowId, defaultOpen, openWindow]);

  return (
    <WindowFrame id={windowId}>
      <div data-testid="test-content">Conteúdo da Janela de Teste</div>
    </WindowFrame>
  );
};

describe('WindowFrame Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders window title and content when open', () => {
    render(
      <WindowProvider>
        <TestApp windowId="about-window" />
      </WindowProvider>
    );

    expect(screen.getByText('sobre-caio.txt - Bloco de notas')).toBeInTheDocument();
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
  });

  it('does not render when window is closed', () => {
    render(
      <WindowProvider>
        <TestApp windowId="about-window" defaultOpen={false} />
      </WindowProvider>
    );

    expect(screen.queryByTestId('test-content')).not.toBeInTheDocument();
  });

  it('applies Luna Blue gradient when active and inactive tone when inactive', () => {
    const { rerender } = render(
      <WindowFrame id="custom-test" title="Janela Ativa" isActive={true} isOpen={true}>
        <div>Conteúdo</div>
      </WindowFrame>
    );

    const titlebarActive = screen.getByTestId('window-titlebar');
    expect(titlebarActive.style.background).toContain('#0058EE');
    expect(titlebarActive.style.background).toContain('#0372FD');

    // Inactive window
    rerender(
      <WindowFrame id="custom-test" title="Janela Inativa" isActive={false} isOpen={true}>
        <div>Conteúdo</div>
      </WindowFrame>
    );

    const titlebarInactive = screen.getByTestId('window-titlebar');
    expect(titlebarInactive.style.background).toContain('#7A96DF');
  });

  it('renders minimize, maximize, and close control buttons', () => {
    render(
      <WindowFrame id="btn-test" title="Botoes" isOpen={true}>
        <div>Body</div>
      </WindowFrame>
    );

    expect(screen.getByTestId('btn-minimize')).toBeInTheDocument();
    expect(screen.getByTestId('btn-maximize')).toBeInTheDocument();
    expect(screen.getByTestId('btn-close')).toBeInTheDocument();

    const closeBtn = screen.getByTestId('btn-close');
    expect(closeBtn.className).toContain('hover:bg-[#E81123]');
  });

  it('handles close, minimize, and maximize button clicks via props', () => {
    const onClose = vi.fn();
    const onMinimize = vi.fn();
    const onMaximize = vi.fn();

    render(
      <WindowFrame
        id="prop-test"
        title="Props Action"
        isOpen={true}
        onClose={onClose}
        onMinimize={onMinimize}
        onMaximize={onMaximize}
      >
        <div>Body</div>
      </WindowFrame>
    );

    fireEvent.click(screen.getByTestId('btn-close'));
    expect(onClose).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('btn-minimize'));
    expect(onMinimize).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByTestId('btn-maximize'));
    expect(onMaximize).toHaveBeenCalledTimes(1);
  });

  it('handles window controls through WindowContext integration', () => {
    const Harness: React.FC = () => {
      const { openWindow, windows } = useWindowManager();
      const aboutWin = windows.find(w => w.id === 'about-window');

      return (
        <div>
          <button onClick={() => openWindow('about-window')}>Abrir</button>
          <div data-testid="is-open">{aboutWin?.isOpen ? 'true' : 'false'}</div>
          <div data-testid="is-minimized">{aboutWin?.isMinimized ? 'true' : 'false'}</div>
          <div data-testid="is-maximized">{aboutWin?.isMaximized ? 'true' : 'false'}</div>
          <WindowFrame id="about-window">
            <div>Body</div>
          </WindowFrame>
        </div>
      );
    };

    render(
      <WindowProvider>
        <Harness />
      </WindowProvider>
    );

    // Initially closed
    expect(screen.getByTestId('is-open').textContent).toBe('false');

    // Open
    fireEvent.click(screen.getByText('Abrir'));
    expect(screen.getByTestId('is-open').textContent).toBe('true');

    // Maximize
    fireEvent.click(screen.getByTestId('btn-maximize'));
    expect(screen.getByTestId('is-maximized').textContent).toBe('true');

    // Minimize
    fireEvent.click(screen.getByTestId('btn-minimize'));
    expect(screen.getByTestId('is-minimized').textContent).toBe('true');
  });

  it('focuses window and updates z-index on click', () => {
    const FocusHarness: React.FC = () => {
      const { openWindow, windows } = useWindowManager();
      const win1 = windows.find(w => w.id === 'about-window');
      const win2 = windows.find(w => w.id === 'cv-window');

      return (
        <div>
          <button onClick={() => openWindow('about-window')}>Abrir 1</button>
          <button onClick={() => openWindow('cv-window')}>Abrir 2</button>
          <div data-testid="z1">{win1?.zIndex}</div>
          <div data-testid="z2">{win2?.zIndex}</div>
          <WindowFrame id="about-window">
            <div data-testid="content-1">Win1</div>
          </WindowFrame>
          <WindowFrame id="cv-window">
            <div data-testid="content-2">Win2</div>
          </WindowFrame>
        </div>
      );
    };

    render(
      <WindowProvider>
        <FocusHarness />
      </WindowProvider>
    );

    fireEvent.click(screen.getByText('Abrir 1'));
    fireEvent.click(screen.getByText('Abrir 2'));

    // Click win1 again to focus it
    fireEvent.click(screen.getByTestId('content-1'));

    const z1 = Number(screen.getByTestId('z1').textContent);
    const z2 = Number(screen.getByTestId('z2').textContent);
    expect(z1).toBeGreaterThan(z2);
  });

  it('drags window with mouse and respects boundary containment', () => {
    // Mock window innerWidth and innerHeight
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1000 });
    Object.defineProperty(window, 'innerHeight', { writable: true, configurable: true, value: 700 });

    render(
      <WindowFrame
        id="drag-window"
        title="Draggable"
        isOpen={true}
        initialPosition={{ x: 100, y: 100, width: 400, height: 300 }}
      >
        <div>Content</div>
      </WindowFrame>
    );

    const titlebar = screen.getByTestId('window-titlebar');
    const windowEl = screen.getByTestId('window-drag-window');

    // Mouse down on title bar
    fireEvent.mouseDown(titlebar, { clientX: 120, clientY: 110 });

    // Drag 50px right, 30px down
    act(() => {
      window.dispatchEvent(new MouseEvent('mousemove', { clientX: 170, clientY: 140 }));
    });

    expect(windowEl.style.left).toBe('150px');
    expect(windowEl.style.top).toBe('130px');

    // Drag beyond right boundary: maxX = 1000 - 400 = 600px
    act(() => {
      window.dispatchEvent(new MouseEvent('mousemove', { clientX: 1200, clientY: 140 }));
    });
    expect(windowEl.style.left).toBe('600px');

    // Drag beyond top/left boundary (< 0)
    act(() => {
      window.dispatchEvent(new MouseEvent('mousemove', { clientX: -500, clientY: -500 }));
    });
    expect(windowEl.style.left).toBe('0px');
    expect(windowEl.style.top).toBe('0px');

    // Release mouse
    act(() => {
      window.dispatchEvent(new MouseEvent('mouseup'));
    });
  });
});
