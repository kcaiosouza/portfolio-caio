import { render, screen, fireEvent, act } from '@testing-library/react';
import React, { useEffect } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { BsodScreen } from '../components/bsod/BsodScreen';
import { SystemProvider, useSystem } from '../context/SystemContext';
import { soundEngine } from '../utils/soundEffects';

// Test harness that initializes screenMode to 'bsod' and exposes current screenMode
const TestBsodHarness = () => {
  const { screenMode, setScreenMode } = useSystem();
  useEffect(() => {
    setScreenMode('bsod');
  }, [setScreenMode]);

  return (
    <div>
      <span data-testid="current-screen-mode">{screenMode}</span>
      <BsodScreen />
    </div>
  );
};

describe('BsodScreen Component', () => {
  let playErrorSpy: ReturnType<typeof vi.spyOn>;
  let playBeepSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();
    playErrorSpy = vi.spyOn(soundEngine, 'playError').mockImplementation(() => {});
    playBeepSpy = vi.spyOn(soundEngine, 'playBeep').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('renders authentic Windows XP stop error codes and plays error sound on mount', () => {
    render(
      <SystemProvider>
        <BsodScreen />
      </SystemProvider>
    );

    expect(screen.getByTestId('bsod-screen')).toBeInTheDocument();
    expect(screen.getByText(/Foi detectado um problema e o Caio XP foi desligado/i)).toBeInTheDocument();
    expect(screen.getByText(/CRITICAL_OBJECT_TERMINATION/i)).toBeInTheDocument();
    expect(screen.getByText(/0x000000F4/i)).toBeInTheDocument();
    expect(screen.getByText(/Iniciando despejo de memória física/i)).toBeInTheDocument();
    expect(playErrorSpy).toHaveBeenCalledTimes(1);
  });

  it('triggers reboot to bios when clicking on the BSOD screen and plays beep', () => {
    render(
      <SystemProvider>
        <TestBsodHarness />
      </SystemProvider>
    );

    const bsodContainer = screen.getByTestId('bsod-screen');
    fireEvent.click(bsodContainer);

    expect(screen.getByTestId('current-screen-mode').textContent).toBe('bios');
    expect(playBeepSpy).toHaveBeenCalledTimes(1);
  });

  it('triggers reboot to bios on any keydown and plays beep', () => {
    render(
      <SystemProvider>
        <TestBsodHarness />
      </SystemProvider>
    );

    fireEvent.keyDown(window, { key: 'Enter', code: 'Enter' });

    expect(screen.getByTestId('current-screen-mode').textContent).toBe('bios');
    expect(playBeepSpy).toHaveBeenCalledTimes(1);
  });

  it('progresses memory dump simulation to 100% and displays completion message', () => {
    vi.useFakeTimers();
    render(
      <SystemProvider>
        <BsodScreen />
      </SystemProvider>
    );

    expect(screen.getByText(/Despejo de memória física:/i)).toHaveTextContent('0%');

    // Advance time for interval ticks (450ms each)
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByText(/Despejo de memória física:/i)).toHaveTextContent('100%');
    expect(screen.getByText(/Despejo de memória física concluído\./i)).toBeInTheDocument();

    vi.useRealTimers();
  });

  it('automatically reboots to bios after ~6 seconds', () => {
    vi.useFakeTimers();
    render(
      <SystemProvider>
        <TestBsodHarness />
      </SystemProvider>
    );

    expect(screen.getByTestId('current-screen-mode').textContent).toBe('bsod');

    act(() => {
      vi.advanceTimersByTime(6500);
    });

    expect(screen.getByTestId('current-screen-mode').textContent).toBe('bios');
    expect(playBeepSpy).toHaveBeenCalledTimes(1);

    vi.useRealTimers();
  });

  it('cleans up event listeners and timers on unmount without double rebooting', () => {
    vi.useFakeTimers();
    const { unmount } = render(
      <SystemProvider>
        <TestBsodHarness />
      </SystemProvider>
    );

    unmount();

    // Trigger keydown and advance time after unmount
    fireEvent.keyDown(window, { key: 'Space', code: 'Space' });
    act(() => {
      vi.advanceTimersByTime(10000);
    });

    // Reboot beep should not have been called after unmount
    expect(playBeepSpy).not.toHaveBeenCalled();

    vi.useRealTimers();
  });
});
