import React, { useEffect, useRef } from 'react';
import { WindowFrame } from './WindowFrame';

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

  useEffect(() => {
    if (!isOpen || !containerRef.current) return;

    let isMounted = true;

    const startDoom = async () => {
      try {
        // Ensure CSS is present
        if (!document.getElementById('js-dos-css')) {
          const link = document.createElement('link');
          link.id = 'js-dos-css';
          link.rel = 'stylesheet';
          link.href = '/js-dos/js-dos.css';
          document.head.appendChild(link);
        }

        // Ensure JS is loaded
        let DosFn = (window as any).Dos;
        if (!DosFn) {
          await import('js-dos');
          DosFn = (window as any).Dos;
        }

        if (!isMounted || !containerRef.current || !DosFn) return;

        // Initialize js-dos v8 with url and pathPrefix
        const dosInstance = DosFn(containerRef.current, {
          url: '/assets/doom.jsdos',
          pathPrefix: '/js-dos/emulators/',
          autoStart: true,
          theme: 'dark',
        });
        dosInstanceRef.current = dosInstance;
      } catch (err) {
        console.error('Failed to load js-dos:', err);
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
    if (onClose) onClose();
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
