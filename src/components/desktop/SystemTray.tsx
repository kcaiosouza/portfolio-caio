import React, { useState, useEffect } from 'react';
import { useSystem } from '../../context/SystemContext';
import { Volume2, VolumeX, Tv } from 'lucide-react';

export const SystemTray: React.FC = () => {
  const { isCrtEnabled, toggleCrt, isMuted, toggleMute } = useSystem();
  const [time, setTime] = useState<string>(() => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  });

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setTime(`${hours}:${minutes}`);
    };
    updateClock();
    const interval = setInterval(updateClock, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      role="region"
      aria-label="Bandeja do Sistema"
      className="h-full bg-[#0B61FF] border-l border-[#002D96] px-3 flex items-center gap-3 text-white text-xs font-tahoma shadow-inner select-none"
    >
      {/* Botão de alternar áudio */}
      <button
        type="button"
        onClick={toggleMute}
        className="hover:scale-110 active:scale-95 transition-transform p-0.5 focus:outline-none"
        title={isMuted ? 'Desmutar sons' : 'Mutar sons retrô'}
        aria-label={isMuted ? 'Desmutar sons' : 'Mutar sons retrô'}
      >
        {isMuted ? (
          <VolumeX className="w-3.5 h-3.5 text-red-300" data-testid="volume-muted-icon" />
        ) : (
          <Volume2 className="w-3.5 h-3.5 text-white" data-testid="volume-unmuted-icon" />
        )}
      </button>

      {/* Botão de alternar efeito CRT */}
      <button
        type="button"
        onClick={toggleCrt}
        className={`hover:scale-110 active:scale-95 transition-transform flex items-center p-0.5 focus:outline-none ${
          isCrtEnabled ? 'text-green-300' : 'text-gray-300 opacity-60'
        }`}
        title={isCrtEnabled ? 'Desativar efeito CRT' : 'Ativar efeito CRT'}
        aria-label={isCrtEnabled ? 'Desativar efeito CRT' : 'Ativar efeito CRT'}
      >
        <Tv className="w-3.5 h-3.5" data-testid="crt-toggle-icon" />
      </button>

      {/* Relógio digital em tempo real */}
      <span className="font-semibold tracking-wide ml-1 tabular-nums" data-testid="digital-clock">
        {time}
      </span>
    </div>
  );
};
