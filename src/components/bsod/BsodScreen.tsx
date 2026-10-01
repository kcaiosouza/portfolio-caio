import React, { useState, useEffect, useRef } from 'react';
import { useSystem } from '../../context/SystemContext';
import { soundEngine } from '../../utils/soundEffects';

export const BsodScreen: React.FC = () => {
  const { setScreenMode } = useSystem();
  const [dumpPercent, setDumpPercent] = useState<number>(0);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const hasRebootedRef = useRef<boolean>(false);

  const handleReboot = () => {
    if (hasRebootedRef.current) return;
    hasRebootedRef.current = true;
    soundEngine.playBeep();
    setScreenMode('bios');
  };

  useEffect(() => {
    // Play error sound tone on crash
    soundEngine.playError();

    // Keydown listener for immediate manual restart
    const handleKeyDown = () => {
      handleReboot();
    };

    window.addEventListener('keydown', handleKeyDown);

    // Progressive memory dump counter simulation
    const interval = setInterval(() => {
      setDumpPercent((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsComplete(true);
          return 100;
        }
        const next = Math.min(100, prev + Math.floor(Math.random() * 25) + 15);
        if (next >= 100) {
          setIsComplete(true);
        }
        return next;
      });
    }, 450);

    // Auto-reboot timer after ~6 seconds
    const autoRebootTimeout = setTimeout(() => {
      handleReboot();
    }, 6000);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearInterval(interval);
      clearTimeout(autoRebootTimeout);
    };
  }, []);

  return (
    <div
      data-testid="bsod-screen"
      onClick={handleReboot}
      className="fixed inset-0 w-screen h-screen bg-[#0000AA] text-white p-6 sm:p-12 font-mono text-xs sm:text-sm md:text-base select-none cursor-pointer overflow-hidden z-[9999] flex flex-col justify-between"
      style={{ fontFamily: '"Lucida Console", "Courier New", Consolas, monospace' }}
    >
      <div className="space-y-4 max-w-4xl">
        <p className="leading-relaxed">
          Foi detectado um problema e o Caio XP foi desligado para evitar danos ao computador.
        </p>

        <p className="font-bold tracking-wider text-sm sm:text-base">
          CRITICAL_OBJECT_TERMINATION
        </p>

        <p className="leading-relaxed">
          Se esta for a primeira vez que você vê esta tela de erro de parada, reinicie o computador.
          Se esta tela for exibida novamente, siga estas etapas:
        </p>

        <p className="leading-relaxed">
          Certifique-se de que não finalizou processos vitais do kernel (como o processo System)
          no Gerenciador de Tarefas. Se novos softwares ou componentes foram instalados, desinstale-os.
        </p>

        <p className="leading-relaxed">
          Informações técnicas:
        </p>

        <p className="font-bold tracking-wide">
          *** STOP: 0x000000F4 (0x00000003, 0x82C74020, 0x82C74194, 0x805D297C)
        </p>

        <div className="pt-4 space-y-1">
          <p>Iniciando despejo de memória física...</p>
          <p>
            Despejo de memória física: <span className="font-bold">{dumpPercent}%</span>
          </p>
          {isComplete && (
            <>
              <p className="text-[#FFFF00]">Despejo de memória física concluído.</p>
              <p className="text-white pt-2 animate-pulse">
                Reinicializando o computador automaticamente... (ou clique para reiniciar agora)
              </p>
            </>
          )}
        </div>
      </div>

      <div className="text-[11px] sm:text-xs text-white/70 pt-4 border-t border-white/20 flex items-center justify-between">
        <span>Caio XP Professional - Núcleo do Sistema Interrompido</span>
        <span>Pressione qualquer tecla ou clique para reiniciar</span>
      </div>
    </div>
  );
};
