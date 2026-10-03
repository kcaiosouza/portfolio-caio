import React, { useEffect, useRef } from 'react';
import { WindowFrame } from './WindowFrame';
import { useWindowManager } from '../../context/WindowContext';

export interface DoomAppProps {
  id?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const DoomApp: React.FC<DoomAppProps> = ({
  id = 'doom-window',
  isOpen,
  onClose,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const dosInstanceRef = useRef<any>(null);

  let wm: ReturnType<typeof useWindowManager> | undefined;
  try {
    wm = useWindowManager();
  } catch {
    wm = undefined;
  }

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    let isMounted = true;

    const startDoom = async () => {
      try {
        // Wait for window.Dos if script is still loading
        let retries = 0;
        while (!(window as any).Dos && retries < 20) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          retries++;
        }

        const DosFn = (window as any).Dos;
        if (!isMounted || !containerRef.current || !DosFn) {
          if (!DosFn) console.error('window.Dos not found');
          return;
        }

        // Clean container before mounting
        containerRef.current.innerHTML = '';

        // Initialize js-dos player
        const dosInstance = DosFn(containerRef.current, {
          url: '/assets/doom.jsdos',
          pathPrefix: '/js-dos/emulators/',
          autoStart: true,
          theme: 'dark',
        });
        dosInstanceRef.current = dosInstance;
      } catch (err) {
        console.error('Failed to initialize DOOM via js-dos:', err);
      }
    };

    startDoom();

    return () => {
      isMounted = false;
      if (dosInstanceRef.current) {
        try {
          dosInstanceRef.current.stop();
        } catch (e) {
          // Ignore
        }
        dosInstanceRef.current = null;
      }
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, [isOpen]);

  const handleClose = () => {
    if (dosInstanceRef.current) {
      try {
        dosInstanceRef.current.stop();
      } catch (e) {
        // Ignore
      }
      dosInstanceRef.current = null;
    }

    if (onClose) {
      onClose();
    } else if (wm) {
      wm.closeWindow(id);
    }
  };

  return (
    <WindowFrame
      id={id}
      title="DOOM (1993)"
      icon="doom"
      isOpen={isOpen}
      onClose={handleClose}
      initialPosition={{ x: 30, y: 15, width: 1024, height: 680 }}
    >
      <div
        data-testid="doom-container"
        className="w-full h-full bg-black select-none overflow-hidden relative flex items-center justify-center"
      >
        <div ref={containerRef} className="w-full h-full" />
      </div>
    </WindowFrame>
  );
};

export default DoomApp;
