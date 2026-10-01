import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSystem } from '../../context/SystemContext';
import { soundEngine } from '../../utils/soundEffects';
import { PORTFOLIO_DATA } from '../../utils/data';

export const BiosScreen: React.FC = () => {
  const { setScreenMode } = useSystem();
  const [lines, setLines] = useState<string[]>([]);
  const hasFinishedRef = useRef(false);

  const handleSkip = useCallback(() => {
    if (hasFinishedRef.current) return;
    hasFinishedRef.current = true;
    soundEngine.playBiosBeep();
    setScreenMode('login');
  }, [setScreenMode]);

  // Pré-carregamento do papel de parede oficial em segundo plano durante a BIOS
  useEffect(() => {
    try {
      const img = new Image();
      img.src = '/assets/wallpaper-bliss.jpg';
    } catch {
      // Fallback seguro caso Image() não esteja disponível
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === 'Delete' ||
        e.key === 'Del' ||
        e.key === 'Enter' ||
        e.key === 'Escape'
      ) {
        e.preventDefault();
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSkip]);

  useEffect(() => {
    const bootSequence = [
      'Dev Caio Modular BIOS v2.04 - ACPI BIOS Revision 1008',
      'Copyright (C) 2016-2026, Caio Engineering Systems Inc.',
      '',
      `CPU: Fullstack Architect Engine @ ${PORTFOLIO_DATA.yearsOfExperience}+ Years Experience`,
      'Memory Frequency For DDR3 1600 (Dual Channel Mode)',
      'Memory Testing: 16384K OK',
      '',
      'Detecting Primary Master ... High Performance Frontend',
      'Detecting Primary Slave  ... Scalable Node.js Backend',
      'Detecting Secondary Master ... React Native & Cloud APIs',
      '',
      `Loading Core Skills: [${PORTFOLIO_DATA.skills.slice(0, 8).join(', ')}] ... [OK]`,
      `Loading Languages: Portuguese (Native), English (Fluent), Spanish ... [OK]`,
      'Initializing Virtual Luna Subsystem...',
      'Booting System Kernel from C:\\dev-caio\\portfolio...',
      'READY.'
    ];

    let currentIndex = 0;
    const interval = setInterval(() => {
      if (currentIndex < bootSequence.length) {
        const nextLine = bootSequence[currentIndex];
        setLines(prev => [...prev, nextLine]);
        currentIndex++;
      }
    }, 180);

    const autoTimer = setTimeout(() => {
      handleSkip();
    }, 3500);

    return () => {
      clearInterval(interval);
      clearTimeout(autoTimer);
    };
  }, [handleSkip]);

  return (
    <div
      data-testid="bios-screen"
      onClick={handleSkip}
      className="fixed inset-0 bg-[#000000] text-gray-200 font-terminal text-sm md:text-base p-6 md:p-12 flex flex-col justify-between cursor-pointer select-none z-50 overflow-hidden"
    >
      <div>
        {/* Retro Energy Star terminal header */}
        <div className="flex justify-between items-start border-b border-gray-700 pb-4 mb-4">
          <div>
            <div className="text-white font-bold tracking-widest text-lg md:text-xl">
              DEV CAIO MODULAR BIOS v2.0
            </div>
            <div className="text-gray-400 text-xs tracking-wider">
              ENERGY STAR ALLIANCE COMPLIANT
            </div>
          </div>
          <div className="hidden sm:block text-right text-xs text-yellow-400 border border-yellow-500 p-1 font-bold">
            ⚡ EPA ENERGY STAR
          </div>
        </div>

        {/* Progressive line-by-line typing/printing of skills and system status */}
        <div className="space-y-1">
          {lines.map((line, idx) => (
            <div key={idx} className="leading-snug">
              {line.includes('[OK]') ? (
                <span>
                  {line.replace('[OK]', '')}
                  <span className="text-green-400 font-bold">[OK]</span>
                </span>
              ) : (
                line
              )}
            </div>
          ))}
          <span className="inline-block w-2.5 h-4 bg-white animate-pulse ml-1 align-middle" />
        </div>
      </div>

      {/* Blinking footer prompt */}
      <div className="border-t border-gray-700 pt-3 flex justify-between items-center text-xs md:text-sm text-yellow-300">
        <div className="animate-pulse flex items-center gap-2">
          <span>▶ Press DEL to enter SETUP (ou clique para pular)</span>
        </div>
        <div className="text-gray-500 font-mono text-xs">09/30/2026-XP-PORTFOLIO</div>
      </div>
    </div>
  );
};
