import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { SystemProvider, useSystem } from '../context/SystemContext';
import { WindowProvider } from '../context/WindowContext';
import { Desktop } from '../components/desktop/Desktop';
import * as audioEffects from '../utils/audioEffects';

// Helper component to test useSystem values directly
const SystemStateConsumer: React.FC = () => {
  const {
    isSecretUnlocked,
    showSecretModal,
    unlockSecretGames,
    lockSecretGames,
    closeSecretModal,
  } = useSystem();

  return (
    <div>
      <span data-testid="is-secret-unlocked">{String(isSecretUnlocked)}</span>
      <span data-testid="show-secret-modal">{String(showSecretModal)}</span>
      <button data-testid="btn-unlock" onClick={unlockSecretGames}>
        Unlock
      </button>
      <button data-testid="btn-lock" onClick={lockSecretGames}>
        Lock
      </button>
      <button data-testid="btn-close-modal" onClick={closeSecretModal}>
        Close Modal
      </button>
    </div>
  );
};

describe('SystemContext Secret State & Desktop Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('SystemContext secret state and persistence', () => {
    it('initializes isSecretUnlocked to false when localStorage is empty', () => {
      render(
        <SystemProvider>
          <SystemStateConsumer />
        </SystemProvider>
      );

      expect(screen.getByTestId('is-secret-unlocked').textContent).toBe('false');
      expect(screen.getByTestId('show-secret-modal').textContent).toBe('false');
    });

    it('initializes isSecretUnlocked to true when localStorage has caio_xp_secret_games_unlocked=true', () => {
      localStorage.setItem('caio_xp_secret_games_unlocked', 'true');

      render(
        <SystemProvider>
          <SystemStateConsumer />
        </SystemProvider>
      );

      expect(screen.getByTestId('is-secret-unlocked').textContent).toBe('true');
      expect(screen.getByTestId('show-secret-modal').textContent).toBe('false');
    });

    it('unlockSecretGames updates state, writes to localStorage, opens modal, and plays error sound', () => {
      const playSoundSpy = vi.spyOn(audioEffects, 'playXpErrorSound').mockImplementation(() => {});

      render(
        <SystemProvider>
          <SystemStateConsumer />
        </SystemProvider>
      );

      act(() => {
        fireEvent.click(screen.getByTestId('btn-unlock'));
      });

      expect(screen.getByTestId('is-secret-unlocked').textContent).toBe('true');
      expect(screen.getByTestId('show-secret-modal').textContent).toBe('true');
      expect(localStorage.getItem('caio_xp_secret_games_unlocked')).toBe('true');
      expect(playSoundSpy).toHaveBeenCalledTimes(1);
    });

    it('lockSecretGames resets state, writes false to localStorage, and closes modal', () => {
      localStorage.setItem('caio_xp_secret_games_unlocked', 'true');

      render(
        <SystemProvider>
          <SystemStateConsumer />
        </SystemProvider>
      );

      act(() => {
        fireEvent.click(screen.getByTestId('btn-unlock'));
      });
      expect(screen.getByTestId('show-secret-modal').textContent).toBe('true');

      act(() => {
        fireEvent.click(screen.getByTestId('btn-lock'));
      });

      expect(screen.getByTestId('is-secret-unlocked').textContent).toBe('false');
      expect(screen.getByTestId('show-secret-modal').textContent).toBe('false');
      expect(localStorage.getItem('caio_xp_secret_games_unlocked')).toBe('false');
    });

    it('closeSecretModal closes modal but preserves isSecretUnlocked', () => {
      render(
        <SystemProvider>
          <SystemStateConsumer />
        </SystemProvider>
      );

      act(() => {
        fireEvent.click(screen.getByTestId('btn-unlock'));
      });
      expect(screen.getByTestId('is-secret-unlocked').textContent).toBe('true');
      expect(screen.getByTestId('show-secret-modal').textContent).toBe('true');

      act(() => {
        fireEvent.click(screen.getByTestId('btn-close-modal'));
      });

      expect(screen.getByTestId('is-secret-unlocked').textContent).toBe('true');
      expect(screen.getByTestId('show-secret-modal').textContent).toBe('false');
    });
  });

  describe('Desktop Mounting & Konami Code Integration', () => {
    it('mounts SecretErrorDialog when showSecretModal is triggered via Konami code', () => {
      const playSoundSpy = vi.spyOn(audioEffects, 'playXpErrorSound').mockImplementation(() => {});

      render(
        <SystemProvider>
          <WindowProvider>
            <Desktop />
          </WindowProvider>
        </SystemProvider>
      );

      // Verify dialog is not visible initially
      expect(screen.queryByTestId('secret-error-dialog-content')).not.toBeInTheDocument();

      // Enter Konami Code: ↑ ↑ ↓ ↓ ← → ← → B A
      const sequence = [
        'ArrowUp',
        'ArrowUp',
        'ArrowDown',
        'ArrowDown',
        'ArrowLeft',
        'ArrowRight',
        'ArrowLeft',
        'ArrowRight',
        'b',
        'a',
      ];

      act(() => {
        for (const key of sequence) {
          window.dispatchEvent(new KeyboardEvent('keydown', { key }));
        }
      });

      // Dialog should now be open
      expect(screen.getByTestId('secret-error-dialog-content')).toBeInTheDocument();
      expect(
        screen.getByText(/Código secreto ativo! Jogos liberados \(Minecraft e GTA\)/i)
      ).toBeInTheDocument();
      expect(playSoundSpy).toHaveBeenCalledTimes(1);
      expect(localStorage.getItem('caio_xp_secret_games_unlocked')).toBe('true');

      // Click "OK" button in SecretErrorDialog to close it
      const okButton = screen.getByRole('button', { name: /^OK$/i });
      act(() => {
        fireEvent.click(okButton);
      });

      expect(screen.queryByTestId('secret-error-dialog-content')).not.toBeInTheDocument();
    });
  });
});
