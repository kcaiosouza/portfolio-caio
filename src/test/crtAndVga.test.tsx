import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SystemProvider, useSystem } from '../context/SystemContext';
import { CrtOverlay } from '../components/effects/CrtOverlay';
import { VgaModePrompt } from '../components/mobile/VgaModePrompt';

describe('CrtOverlay Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders CRT overlay when isCrtEnabled is true', () => {
    localStorage.setItem('caio_xp_crt', 'true');

    render(
      <SystemProvider>
        <CrtOverlay />
      </SystemProvider>
    );

    const overlay = screen.getByTestId('crt-overlay');
    expect(overlay).toBeInTheDocument();
    expect(overlay.className).toContain('pointer-events-none');
    expect(overlay.className).toContain('fixed');
    expect(overlay.className).toContain('inset-0');
    expect(overlay.className).toContain('z-[99999]');

    // Scanlines, vignette and phosphor elements
    expect(screen.getByTestId('crt-scanlines')).toBeInTheDocument();
    expect(screen.getByTestId('crt-vignette')).toBeInTheDocument();
    expect(screen.getByTestId('crt-phosphor')).toBeInTheDocument();
  });

  it('does not render CRT overlay when isCrtEnabled is false', () => {
    localStorage.setItem('caio_xp_crt', 'false');

    render(
      <SystemProvider>
        <CrtOverlay />
      </SystemProvider>
    );

    expect(screen.queryByTestId('crt-overlay')).not.toBeInTheDocument();
  });

  it('allows overriding CRT status using forceEnabled prop', () => {
    localStorage.setItem('caio_xp_crt', 'false');

    const { rerender } = render(
      <SystemProvider>
        <CrtOverlay forceEnabled={true} />
      </SystemProvider>
    );

    expect(screen.getByTestId('crt-overlay')).toBeInTheDocument();

    rerender(
      <SystemProvider>
        <CrtOverlay forceEnabled={false} />
      </SystemProvider>
    );

    expect(screen.queryByTestId('crt-overlay')).not.toBeInTheDocument();
  });

  it('toggles CRT visibility when toggleCrt is triggered', () => {
    localStorage.setItem('caio_xp_crt', 'true');

    const ToggleConsumer = () => {
      const { toggleCrt } = useSystem();
      return (
        <div>
          <button onClick={toggleCrt} data-testid="toggle-crt-btn">
            Toggle CRT
          </button>
          <CrtOverlay />
        </div>
      );
    };

    render(
      <SystemProvider>
        <ToggleConsumer />
      </SystemProvider>
    );

    expect(screen.getByTestId('crt-overlay')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('toggle-crt-btn'));
    expect(screen.queryByTestId('crt-overlay')).not.toBeInTheDocument();

    fireEvent.click(screen.getByTestId('toggle-crt-btn'));
    expect(screen.getByTestId('crt-overlay')).toBeInTheDocument();
  });
});

describe('VgaModePrompt Component', () => {
  beforeEach(() => {
    window.innerWidth = 1024;
    localStorage.clear();
  });

  it('renders when forceDisplay is true even on desktop', () => {
    render(
      <SystemProvider>
        <VgaModePrompt forceDisplay={true} />
      </SystemProvider>
    );

    const prompt = screen.getByTestId('vga-mode-prompt');
    expect(prompt).toBeInTheDocument();
    expect(screen.getByText('Modo VGA Detectado (640x480)')).toBeInTheDocument();
    expect(screen.getByTestId('vga-dismiss-button')).toHaveTextContent(
      'Continuar no Modo Adaptado'
    );
  });

  it('does not render on desktop resolution by default (isMobileVga = false)', () => {
    window.innerWidth = 1200;

    render(
      <SystemProvider>
        <VgaModePrompt />
      </SystemProvider>
    );

    expect(screen.queryByTestId('vga-mode-prompt')).not.toBeInTheDocument();
  });

  it('renders when mobile viewport is detected (width < 768)', () => {
    window.innerWidth = 480;

    render(
      <SystemProvider>
        <VgaModePrompt />
      </SystemProvider>
    );

    expect(screen.getByTestId('vga-mode-prompt')).toBeInTheDocument();
    expect(screen.getByText(/janelas livres, multitarefa/i)).toBeInTheDocument();
  });

  it('dismisses when "Continuar no Modo Adaptado" is clicked', () => {
    window.innerWidth = 480;
    const onDismissMock = vi.fn();

    render(
      <SystemProvider>
        <VgaModePrompt onDismiss={onDismissMock} />
      </SystemProvider>
    );

    const button = screen.getByTestId('vga-dismiss-button');
    expect(button).toBeInTheDocument();

    act(() => {
      fireEvent.click(button);
    });

    expect(onDismissMock).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('vga-mode-prompt')).not.toBeInTheDocument();
  });

  it('dismisses when header close button (X) is clicked', () => {
    window.innerWidth = 480;
    const onDismissMock = vi.fn();

    render(
      <SystemProvider>
        <VgaModePrompt onDismiss={onDismissMock} />
      </SystemProvider>
    );

    const closeButton = screen.getByRole('button', { name: /fechar/i });
    expect(closeButton).toBeInTheDocument();

    act(() => {
      fireEvent.click(closeButton);
    });

    expect(onDismissMock).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('vga-mode-prompt')).not.toBeInTheDocument();
  });
});
