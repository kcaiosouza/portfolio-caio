import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SystemProvider, useSystem } from '../context/SystemContext';
import { BiosScreen } from '../components/bios/BiosScreen';
import { soundEngine } from '../utils/soundEffects';
import { PORTFOLIO_DATA } from '../utils/data';

// Helper component to observe current screenMode from SystemContext
const ScreenModeObserver: React.FC = () => {
  const { screenMode } = useSystem();
  return <div data-testid="current-screen-mode">{screenMode}</div>;
};

const renderBiosWithSystem = () => {
  return render(
    <SystemProvider>
      <BiosScreen />
      <ScreenModeObserver />
    </SystemProvider>
  );
};

describe('BiosScreen Component', () => {
  let playBiosBeepSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    playBiosBeepSpy = vi.spyOn(soundEngine, 'playBiosBeep').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders retro Energy Star terminal layout, header, and blinking DEL prompt', () => {
    renderBiosWithSystem();

    const biosScreen = screen.getByTestId('bios-screen');
    expect(biosScreen).toHaveClass('bg-[#000000]');

    expect(screen.getByText(/DEV CAIO MODULAR BIOS v2.0/i)).toBeInTheDocument();
    expect(screen.getByText(/ENERGY STAR ALLIANCE COMPLIANT/i)).toBeInTheDocument();
    expect(screen.getByText(/⚡ EPA ENERGY STAR/i)).toBeInTheDocument();

    const footerPrompt = screen.getByText(/▶ Press DEL to enter SETUP \(ou clique para pular\)/i);
    expect(footerPrompt).toBeInTheDocument();
    expect(footerPrompt.parentElement).toHaveClass('animate-pulse');
  });

  it('progressively displays boot lines with skills and years of experience', () => {
    renderBiosWithSystem();

    // Advance time progressively to render boot lines
    act(() => {
      vi.advanceTimersByTime(200);
    });
    expect(screen.getByText(/Dev Caio Modular BIOS v2.04/i)).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(800);
    });
    expect(
      screen.getByText(new RegExp(`${PORTFOLIO_DATA.yearsOfExperience}\\+ Years Experience`, 'i'))
    ).toBeInTheDocument();

    act(() => {
      vi.advanceTimersByTime(1600);
    });
    expect(screen.getByText(/Loading Core Skills/i)).toBeInTheDocument();
    const reactOccurrences = screen.getAllByText(/React/i);
    expect(reactOccurrences.length).toBeGreaterThan(0);
    expect(screen.getByText(/Next\.js/i)).toBeInTheDocument();
    const nodeOccurrences = screen.getAllByText(/Node\.js/i);
    expect(nodeOccurrences.length).toBeGreaterThan(0);
  });

  it('transitions immediately to login and plays BIOS beep when clicked', () => {
    renderBiosWithSystem();

    expect(screen.getByTestId('current-screen-mode')).toHaveTextContent('bios');

    const biosScreen = screen.getByTestId('bios-screen');
    fireEvent.click(biosScreen);

    expect(playBiosBeepSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('current-screen-mode')).toHaveTextContent('login');
  });

  it('transitions to login and plays beep when pressing Delete key', () => {
    renderBiosWithSystem();

    expect(screen.getByTestId('current-screen-mode')).toHaveTextContent('bios');

    fireEvent.keyDown(window, { key: 'Delete' });

    expect(playBiosBeepSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('current-screen-mode')).toHaveTextContent('login');
  });

  it('transitions to login when pressing Del, Enter or Escape keys', () => {
    const { unmount } = renderBiosWithSystem();
    fireEvent.keyDown(window, { key: 'Del' });
    expect(playBiosBeepSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('current-screen-mode')).toHaveTextContent('login');
    unmount();

    // Test with Enter
    playBiosBeepSpy.mockClear();
    const renderedEnter = renderBiosWithSystem();
    fireEvent.keyDown(window, { key: 'Enter' });
    expect(playBiosBeepSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('current-screen-mode')).toHaveTextContent('login');
    renderedEnter.unmount();

    // Test with Escape
    playBiosBeepSpy.mockClear();
    const renderedEsc = renderBiosWithSystem();
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(playBiosBeepSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('current-screen-mode')).toHaveTextContent('login');
    renderedEsc.unmount();
  });

  it('automatically transitions to login after ~3.5 seconds if user does not interact', () => {
    renderBiosWithSystem();

    expect(screen.getByTestId('current-screen-mode')).toHaveTextContent('bios');
    expect(playBiosBeepSpy).not.toHaveBeenCalled();

    // Advance to 3490ms - should still be in bios
    act(() => {
      vi.advanceTimersByTime(3490);
    });
    expect(screen.getByTestId('current-screen-mode')).toHaveTextContent('bios');

    // Advance past 3500ms
    act(() => {
      vi.advanceTimersByTime(20);
    });

    expect(playBiosBeepSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('current-screen-mode')).toHaveTextContent('login');
  });

  it('prevents multiple trigger executions if key is pressed and screen clicked', () => {
    renderBiosWithSystem();

    fireEvent.keyDown(window, { key: 'Delete' });
    const biosScreen = screen.getByTestId('bios-screen');
    fireEvent.click(biosScreen);

    act(() => {
      vi.advanceTimersByTime(4000);
    });

    expect(playBiosBeepSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('current-screen-mode')).toHaveTextContent('login');
  });
});
