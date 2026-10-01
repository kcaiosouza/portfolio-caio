import React, { createContext, useContext, useState } from 'react';
import { WindowItem, WindowPosition } from '../types';
import { soundEngine } from '../utils/soundEffects';

interface WindowContextType {
  windows: WindowItem[];
  activeWindowId: string | null;
  openWindow: (id: string) => void;
  closeWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  updateWindowPosition: (id: string, pos: Partial<WindowPosition>) => void;
  browserUrl: string;
  setBrowserUrl: (url: string) => void;
  openBrowser: (url?: string) => void;
}

const DEFAULT_WINDOWS: WindowItem[] = [
  {
    id: 'about-window',
    title: 'sobre-caio.txt - Bloco de notas',
    icon: 'notepad',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    position: { x: 80, y: 50, width: 620, height: 460 },
    defaultPosition: { x: 80, y: 50, width: 620, height: 460 }
  },
  {
    id: 'cv-window',
    title: 'caio-cv.pdf - Visualizador de Documentos',
    icon: 'pdf',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    position: { x: 140, y: 40, width: 700, height: 520 },
    defaultPosition: { x: 140, y: 40, width: 700, height: 520 }
  },
  {
    id: 'hobbies-window',
    title: 'hobbies',
    icon: 'folder',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    position: { x: 200, y: 80, width: 600, height: 420 },
    defaultPosition: { x: 200, y: 80, width: 600, height: 420 }
  },
  {
    id: 'projects-window',
    title: 'projetos',
    icon: 'folder',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    position: { x: 180, y: 60, width: 640, height: 440 },
    defaultPosition: { x: 180, y: 60, width: 640, height: 440 }
  },
  {
    id: 'browser-window',
    title: 'Internet Explorer',
    icon: 'browser',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    position: { x: 90, y: 30, width: 850, height: 580 },
    defaultPosition: { x: 90, y: 30, width: 850, height: 580 }
  },
  {
    id: 'recycle-bin-window',
    title: 'Lixeira',
    icon: 'trash',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    position: { x: 160, y: 70, width: 560, height: 380 },
    defaultPosition: { x: 160, y: 70, width: 560, height: 380 }
  },
  {
    id: 'minesweeper-window',
    title: 'Campo Minado',
    icon: 'bomb',
    isOpen: false,
    isMinimized: false,
    isMaximized: false,
    zIndex: 10,
    position: { x: 220, y: 70, width: 340, height: 430 },
    defaultPosition: { x: 220, y: 70, width: 340, height: 430 }
  }
];

const WindowContext = createContext<WindowContextType | undefined>(undefined);

export const WindowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [windows, setWindows] = useState<WindowItem[]>(DEFAULT_WINDOWS);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [topZIndex, setTopZIndex] = useState<number>(10);

  const focusWindow = (id: string) => {
    soundEngine.playClick();
    const nextZ = topZIndex + 1;
    setTopZIndex(nextZ);
    setActiveWindowId(id);
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, zIndex: nextZ, isMinimized: false } : w))
    );
  };

  const openWindow = (id: string) => {
    soundEngine.playClick();
    const nextZ = topZIndex + 1;
    setTopZIndex(nextZ);
    setActiveWindowId(id);
    setWindows(prev =>
      prev.map(w =>
        w.id === id
          ? { ...w, isOpen: true, isMinimized: false, zIndex: nextZ }
          : w
      )
    );
  };

  const closeWindow = (id: string) => {
    soundEngine.playClick();
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, isOpen: false, isMinimized: false } : w))
    );
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const minimizeWindow = (id: string) => {
    soundEngine.playClick();
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, isMinimized: true } : w))
    );
    if (activeWindowId === id) {
      setActiveWindowId(null);
    }
  };

  const maximizeWindow = (id: string) => {
    soundEngine.playClick();
    setWindows(prev =>
      prev.map(w => (w.id === id ? { ...w, isMaximized: !w.isMaximized } : w))
    );
    focusWindow(id);
  };

  const updateWindowPosition = (id: string, pos: Partial<WindowPosition>) => {
    setWindows(prev =>
      prev.map(w =>
        w.id === id ? { ...w, position: { ...w.position, ...pos } } : w
      )
    );
  };

  const [browserUrl, setBrowserUrl] = useState<string>('https://igcgmusic.com.br');

  const openBrowser = (url?: string) => {
    if (url) {
      setBrowserUrl(url);
    }
    openWindow('browser-window');
  };

  return (
    <WindowContext.Provider
      value={{
        windows,
        activeWindowId,
        openWindow,
        closeWindow,
        focusWindow,
        minimizeWindow,
        maximizeWindow,
        updateWindowPosition,
        browserUrl,
        setBrowserUrl,
        openBrowser
      }}
    >
      {children}
    </WindowContext.Provider>
  );
};

export const useWindowManager = () => {
  const ctx = useContext(WindowContext);
  if (!ctx) throw new Error('useWindowManager must be used within WindowProvider');
  return ctx;
};
