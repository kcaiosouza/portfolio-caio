import React, { useState } from 'react';
import { Mail, Check, X, ExternalLink } from 'lucide-react';
import { soundEngine } from '../../../utils/soundEffects';

export interface MsnDirectMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MsnDirectMessageModal: React.FC<MsnDirectMessageModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const email = 'caio@exemplo.com';

  if (!isOpen) return null;

  const handleCopy = () => {
    soundEngine.playClick();
    navigator.clipboard?.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendEmail = () => {
    soundEngine.playClick();
    window.open(`mailto:${email}?subject=Contato%20via%20MSN%20Portfolio`, '_blank');
  };

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-[1px] font-tahoma select-none text-black"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-[#ECE9D8] rounded-t-lg rounded-b-md border-2 border-[#0058EE] shadow-2xl overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        {/* Titlebar */}
        <div className="bg-gradient-to-r from-[#0058EE] via-[#0372FD] to-[#0058EE] px-3 py-1.5 flex items-center justify-between text-white text-xs font-bold">
          <div className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-yellow-300" />
            <span>Mensagem Direta do MSN</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-5 h-5 flex items-center justify-center rounded-[2px] bg-[#E76C55] hover:bg-[#E81123] text-white"
          >
            <X className="w-3 h-3 stroke-[2.5]" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 flex gap-3 text-xs bg-[#ECE9D8]">
          <div className="w-10 h-10 flex-shrink-0 rounded-full bg-blue-100 border border-blue-300 flex items-center justify-center text-blue-700">
            <Mail className="w-5 h-5" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="font-bold text-sm text-[#002D96]">
              Recurso em breve! [Envio direto ao e-mail]
            </div>
            <p className="text-gray-700 leading-relaxed text-[11px]">
              Estamos desenvolvendo a integração para que as mensagens enviadas por aqui caiam diretamente na caixa de entrada do Caio.
            </p>
            <p className="text-gray-700 leading-relaxed text-[11px]">
              Enquanto finalizamos essa ponte, você pode bater um papo interativo com o bot inteligente do Caio no MSN ou enviar um e-mail tradicional agora mesmo para:
            </p>
            <div className="p-2 bg-white border border-[#7F9DB9] rounded font-mono text-[11px] font-semibold text-blue-900 select-text flex items-center justify-between">
              <span>{email}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-4 py-2.5 bg-[#ECE9D8] border-t border-[#D0C9B6] flex items-center justify-end gap-2 text-xs">
          <button
            type="button"
            onClick={handleCopy}
            className="px-3 py-1 bg-gradient-to-b from-white to-[#E1DECE] border border-[#7F9DB9] rounded-[2px] hover:border-[#0058EE] flex items-center gap-1 font-medium shadow-xs"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : null}
            <span>{copied ? 'Copiado!' : 'Copiar E-mail'}</span>
          </button>

          <button
            type="button"
            onClick={handleSendEmail}
            className="px-3 py-1 bg-gradient-to-b from-[#245EDC] to-[#1941A5] text-white border border-[#002D96] rounded-[2px] hover:brightness-110 flex items-center gap-1 font-bold shadow-xs"
          >
            <span>Enviar E-mail Agora</span>
            <ExternalLink className="w-3 h-3" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1 bg-gradient-to-b from-white to-[#E1DECE] border border-[#7F9DB9] rounded-[2px] hover:border-[#0058EE] font-medium shadow-xs"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
};
