import React, { useEffect, useRef } from 'react';

export interface SecretErrorDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecretErrorDialog: React.FC<SecretErrorDialogProps> = ({ isOpen, onClose }) => {
  const okButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (isOpen) {
      okButtonRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="dialog-title"
      data-testid="secret-error-dialog-overlay"
      className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/30 select-none p-4"
      onClick={onClose}
    >
      <div
        data-testid="secret-error-dialog-content"
        className="w-[420px] max-w-[95vw] bg-[#ECE9D8] rounded-t-lg rounded-b-sm border-2 border-[#0055EA] shadow-[3px_3px_15px_rgba(0,0,0,0.5)] overflow-hidden font-sans text-xs text-black"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Title Bar */}
        <div className="bg-gradient-to-r from-[#0058EE] via-[#3593FF] to-[#032598] px-3 py-1.5 flex items-center justify-between text-white font-bold select-none shadow-[inset_0_1px_0_rgba(255,255,255,0.4)]">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 rounded-full bg-[#E04006] border border-white text-[9px] flex items-center justify-center font-bold">
              ✕
            </span>
            <span id="dialog-title" className="text-xs drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]">
              Easter Egg do Sistema
            </span>
          </div>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            className="w-5 h-5 bg-[#E04006] hover:bg-[#F05016] active:bg-[#B03004] text-white font-bold text-xs rounded-[3px] border border-white/60 flex items-center justify-center shadow-sm"
          >
            ✕
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex items-start gap-4 bg-[#ECE9D8]">
          <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#CC0000] border-2 border-white flex items-center justify-center shadow-md">
            <span className="text-white text-2xl font-bold font-mono leading-none pb-0.5">✕</span>
          </div>
          <div className="flex-1 space-y-1 pt-1">
            <p className="font-semibold text-gray-900 text-sm leading-snug">
              Código secreto ativo! Jogos liberados (Minecraft e GTA)
            </p>
            <p className="text-gray-600 text-[11px]">
              Novos atalhos foram desbloqueados na pasta Hobbies e no Prompt de Comando.
            </p>
          </div>
        </div>

        {/* Bottom Button Bar */}
        <div className="bg-[#ECE9D8] px-4 py-3 flex justify-center border-t border-[#ACA899] shadow-[inset_0_1px_0_#FFF]">
          <button
            ref={okButtonRef}
            type="button"
            autoFocus
            onClick={onClose}
            className="px-7 py-1 bg-gradient-to-b from-white to-[#E1DECE] border border-[#7F9DB9] rounded-[2px] text-xs font-semibold text-gray-900 hover:border-[#0058EE] active:bg-[#C2CEE8] focus:ring-1 focus:ring-[#0058EE] focus:outline-none shadow-sm"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
