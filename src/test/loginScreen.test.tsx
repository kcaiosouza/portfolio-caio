import { render, screen, fireEvent, act } from '@testing-library/react';
import React, { useEffect } from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SystemProvider, useSystem } from '../context/SystemContext';
import { LoginScreen } from '../components/login/LoginScreen';
import { soundEngine } from '../utils/soundEffects';
import { PORTFOLIO_DATA } from '../utils/data';

// Helper component that sets initial screenMode once on mount and observes changes
const LoginScreenWrapper: React.FC<{ initialMode?: 'bios' | 'login' | 'desktop' }> = ({
  initialMode = 'login',
}) => {
  const { screenMode, setScreenMode } = useSystem();

  useEffect(() => {
    if (initialMode) {
      setScreenMode(initialMode);
    }
  }, []); // Run only once on mount

  return (
    <div>
      <LoginScreen />
      <div data-testid="current-screen-mode">{screenMode}</div>
    </div>
  );
};

const renderLoginWithSystem = (initialMode: 'bios' | 'login' | 'desktop' = 'login') => {
  return render(
    <SystemProvider>
      <LoginScreenWrapper initialMode={initialMode} />
    </SystemProvider>
  );
};

describe('LoginScreen Component', () => {
  let playStartupChimeSpy: ReturnType<typeof vi.spyOn>;
  let playClickSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.useFakeTimers();
    playStartupChimeSpy = vi.spyOn(soundEngine, 'playStartupChime').mockImplementation(() => {});
    playClickSpy = vi.spyOn(soundEngine, 'playClick').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders Windows XP Welcome Screen branding, orange accent divider lines, and instructions', () => {
    renderLoginWithSystem();

    expect(screen.getByText(/Caio XP Professional/i)).toBeInTheDocument();
    expect(screen.getByText(/Para começar,/i)).toBeInTheDocument();
    expect(
      screen.getByText(/clique no seu nome de usuário para acessar o portfólio e as informações profissionais/i)
    ).toBeInTheDocument();

    const divider = screen.getByTestId('login-divider');
    expect(divider).toBeInTheDocument();
  });

  it('renders user card for Dev Caio with professional title and coffee mug avatar', () => {
    renderLoginWithSystem();

    expect(screen.getByText(PORTFOLIO_DATA.name)).toBeInTheDocument();
    expect(screen.getByText(PORTFOLIO_DATA.title)).toBeInTheDocument();
    expect(screen.getByText(/Clique aqui para iniciar a sessão/i)).toBeInTheDocument();

    const coffeeIcon = screen.getByTestId('coffee-avatar');
    expect(coffeeIcon).toBeInTheDocument();
  });

  it('renders Restart in BIOS footer button and navigates to bios on click', () => {
    renderLoginWithSystem('login');

    const restartBtn = screen.getByRole('button', { name: /Reiniciar na BIOS/i });
    expect(restartBtn).toBeInTheDocument();

    fireEvent.click(restartBtn);

    expect(playClickSpy).toHaveBeenCalledTimes(1);
    expect(screen.getByTestId('current-screen-mode')).toHaveTextContent('bios');
  });

  it('triggers startup chime, shows loading feedback, and transitions to desktop when clicking user card', () => {
    renderLoginWithSystem('login');

    const userLoginBtn = screen.getByTestId('user-login-button');
    expect(screen.queryByTestId('loading-feedback')).not.toBeInTheDocument();

    fireEvent.click(userLoginBtn);

    // Chime plays immediately on click
    expect(playStartupChimeSpy).toHaveBeenCalledTimes(1);

    // Feedback message appears
    expect(screen.getByTestId('loading-feedback')).toBeInTheDocument();
    expect(screen.getByText(/Carregando suas configurações\.\.\./i)).toBeInTheDocument();
    expect(screen.getByText(/Iniciando sessão\.\.\./i)).toBeInTheDocument();

    // Mode is not desktop yet until transition delay completes
    expect(screen.getByTestId('current-screen-mode')).toHaveTextContent('login');

    // Advance timers by 1000ms
    act(() => {
      vi.advanceTimersByTime(1000);
    });

    // Screen mode should now be 'desktop'
    expect(screen.getByTestId('current-screen-mode')).toHaveTextContent('desktop');
  });

  it('prevents multiple login triggers while already loading', () => {
    renderLoginWithSystem('login');

    const userLoginBtn = screen.getByTestId('user-login-button');
    fireEvent.click(userLoginBtn);
    fireEvent.click(userLoginBtn);
    fireEvent.click(userLoginBtn);

    expect(playStartupChimeSpy).toHaveBeenCalledTimes(1);

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(screen.getByTestId('current-screen-mode')).toHaveTextContent('desktop');
  });
});
