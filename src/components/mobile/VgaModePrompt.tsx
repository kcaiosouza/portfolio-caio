import React from 'react';
import { Monitor, AlertTriangle, X } from 'lucide-react';
import { useSystem } from '../../context/SystemContext';
import { soundEngine } from '../../utils/soundEffects';

export interface VgaModePromptProps {
  forceDisplay?: boolean;
  onDismiss?: () => void;
}

export const VgaModePrompt: React.FC<VgaModePromptProps> = ({
  forceDisplay,
  onDismiss,
}) => {
  const { isMobileVga, dismissMobileVga, setDismissMobileVga } = useSystem();

  const isVisible = forceDisplay !== undefined ? forceDisplay : (isMobileVga && !dismissMobileVga);

  if (!isVisible) {
    return null;
  }

  const handleDismiss = () => {
    soundEngine.playClick();
    setDismissMobileVga(true);
    onDismiss?.();
  };

  return (
    <div
      data-testid="vga-mode-prompt"
      className="fixed inset-0 z-[99990] flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vga-prompt-title"
    >
      {/* Moldura clássica do Windows XP */}
      <div className="w-full max-w-md bg-[#ECE9D8] rounded-t-lg rounded-b-md border-2 border-[#0055ea] shadow-2xl overflow-hidden font-tahoma text-black">
        {/* Barra de Título XP */}
        <div className="bg-gradient-to-r from-[#0058EE] via-[#0372FD] to-[#0058EE] px-3 py-1.5 flex items-center justify-between select-none">
          <div className="flex items-center space-x-2">
            <Monitor className="w-4 h-4 text-white drop-shadow" />
            <span
              id="vga-prompt-title"
              className="text-white text-xs font-bold tracking-wide drop-shadow-[1px_1px_1px_rgba(0,19,107,0.8)]"
            >
              Aviso do Sistema
            </span>
          </div>
          <button
            onClick={handleDismiss}
            aria-label="Fechar"
            className="w-5 h-5 rounded-[3px] bg-gradient-to-b from-[#e8543f] to-[#be2b1a] hover:brightness-110 active:brightness-90 flex items-center justify-center border border-white/60 text-white font-bold text-xs shadow-sm transition-all focus:outline-none"
          >
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>

        {/* Corpo da Janela */}
        <div className="p-4 bg-[#ECE9D8]">
          <div className="flex items-start space-x-3.5 mb-4">
            <div className="relative flex-shrink-0 mt-0.5">
              <div className="w-10 h-10 rounded bg-[#ffcc00] border border-[#b28900] flex items-center justify-center shadow-inner">
                <AlertTriangle className="w-6 h-6 text-[#734b00]" />
              </div>
            </div>

            <div className="text-xs space-y-2 text-[#1c1c1c]">
              <p className="font-bold text-[13px] text-[#0c2a5b]">
                Modo VGA Detectado (640x480)
              </p>
              <p className="leading-relaxed">
                Detectamos que você está acessando através de uma tela compacta ou dispositivo móvel.
              </p>
              <p className="leading-relaxed text-[#333333]">
                Este portfólio foi desenhado originalmente para a experiência completa de desktop com janelas livres, multitarefa e o visual nostálgico do Windows XP.
              </p>
              <p className="text-[11px] text-[#555555] bg-[#FFFBEA] p-2 rounded border border-[#E6DB9C]">
                Dica: Você pode navegar normalmente pelo modo adaptado agora, e recomendamos visitar pelo computador mais tarde para curtir a experiência completa com janelas arrastáveis e som!
              </p>
            </div>
          </div>

          {/* Rodapé / Ações */}
          <div className="mt-4 pt-3 border-t border-[#D0C9B6] flex justify-end">
            <button
              data-testid="vga-dismiss-button"
              onClick={handleDismiss}
              className="px-4 py-1.5 bg-gradient-to-b from-white via-[#ECE9D8] to-[#D4D0C8] hover:from-[#FFFFFF] hover:to-[#E5E1D8] active:from-[#CAC6BD] active:to-[#ECE9D8] border border-[#003C74] rounded-[3px] shadow-[inset_1px_1px_0px_rgba(255,255,255,0.9),inset_-1px_-1px_0px_rgba(0,0,0,0.15)] text-xs font-semibold text-black focus:outline-none focus:ring-1 focus:ring-[#003C74] transition-all cursor-pointer"
            >
              Continuar no Modo Adaptado
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VgaModePrompt;
