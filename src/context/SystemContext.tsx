import React, { createContext, useContext, useState, useEffect } from 'react';
import { ScreenMode } from '../types';
import { soundEngine } from '../utils/soundEffects';
import { playXpErrorSound } from '../utils/audioEffects';

interface SystemContextType {
  screenMode: ScreenMode;
  setScreenMode: (mode: ScreenMode) => void;
  isCrtEnabled: boolean;
  toggleCrt: () => void;
  isMuted: boolean;
  toggleMute: () => void;
  isMobileVga: boolean;
  setDismissMobileVga: (dismiss: boolean) => void;
  dismissMobileVga: boolean;
  isSecretUnlocked: boolean;
  showSecretModal: boolean;
  unlockSecretGames: () => void;
  lockSecretGames: () => void;
  closeSecretModal: () => void;
}

const SystemContext = createContext<SystemContextType | undefined>(undefined);

export const SystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [screenMode, setScreenMode] = useState<ScreenMode>('bios');
  const [isCrtEnabled, setIsCrtEnabled] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('caio_xp_crt');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const [isMuted, setIsMuted] = useState<boolean>(soundEngine.isMuted());
  const [isMobileVga, setIsMobileVga] = useState<boolean>(false);
  const [dismissMobileVga, setDismissMobileVga] = useState<boolean>(false);
  const [isSecretUnlocked, setIsSecretUnlocked] = useState<boolean>(() => {
    try {
      return localStorage.getItem('caio_xp_secret_games_unlocked') === 'true';
    } catch {
      return false;
    }
  });
  const [showSecretModal, setShowSecretModal] = useState<boolean>(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobileVga(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleCrt = () => {
    setIsCrtEnabled(prev => {
      const next = !prev;
      try {
        localStorage.setItem('caio_xp_crt', String(next));
      } catch {
        // storage disabled fallback
      }
      return next;
    });
  };

  const toggleMute = () => {
    const next = !isMuted;
    soundEngine.setMuted(next);
    setIsMuted(next);
  };

  const unlockSecretGames = () => {
    setIsSecretUnlocked(true);
    try {
      localStorage.setItem('caio_xp_secret_games_unlocked', 'true');
    } catch {
      // storage disabled fallback
    }
    playXpErrorSound();
    setShowSecretModal(true);
  };

  const lockSecretGames = () => {
    setIsSecretUnlocked(false);
    try {
      localStorage.setItem('caio_xp_secret_games_unlocked', 'false');
    } catch {
      // storage disabled fallback
    }
    setShowSecretModal(false);
  };

  const closeSecretModal = () => {
    setShowSecretModal(false);
  };

  return (
    <SystemContext.Provider
      value={{
        screenMode,
        setScreenMode,
        isCrtEnabled,
        toggleCrt,
        isMuted,
        toggleMute,
        isMobileVga,
        dismissMobileVga,
        setDismissMobileVga,
        isSecretUnlocked,
        showSecretModal,
        unlockSecretGames,
        lockSecretGames,
        closeSecretModal,
      }}
    >
      {children}
    </SystemContext.Provider>
  );
};

export const useSystem = () => {
  const ctx = useContext(SystemContext);
  if (!ctx) throw new Error('useSystem must be used within SystemProvider');
  return ctx;
};
