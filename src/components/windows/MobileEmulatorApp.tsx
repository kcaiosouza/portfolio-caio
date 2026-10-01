import React, { useState } from 'react';
import WindowFrame from './WindowFrame';
import {
  Smartphone,
  RotateCw,
  ExternalLink,
  QrCode,
  Wifi,
  BatteryMedium,
  CheckCircle2,
  X
} from 'lucide-react';
import { soundEngine } from '../../utils/soundEffects';

export interface MobileEmulatorAppProps {
  id?: string;
  withFrame?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export const MobileEmulatorContent: React.FC = () => {
  const [appUrl, setAppUrl] = useState<string>('https://www.igrejaemcampinagrande.com.br/hinario/');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showQrCode, setShowQrCode] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<string>('12:00');

  React.useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleReload = () => {
    soundEngine.playClick();
    setIsLoading(true);
    const temp = appUrl;
    setAppUrl('');
    setTimeout(() => setAppUrl(temp), 80);
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 bg-[#ECE9D8] font-tahoma text-black select-none text-xs p-2">
      {/* Barra Superior Retrô com Controles Rápidos */}
      <div className="bg-[#ECE9D8] border border-[#ACA899] rounded-[2px] p-1.5 mb-2 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-1.5">
          <Smartphone className="w-4 h-4 text-blue-600" />
          <span className="font-bold text-gray-800 text-xs">Hinario EAV</span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleReload}
            className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-white border border-[#7F9DB9] hover:bg-gray-100 active:bg-gray-200 text-gray-700 shadow-xs"
            title="Recarregar tela do app"
          >
            <RotateCw className="w-3 h-3 text-blue-600" />
            <span>Recarregar</span>
          </button>

          <button
            type="button"
            onClick={() => {
              soundEngine.playClick();
              setShowQrCode(prev => !prev);
            }}
            className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-white border border-[#7F9DB9] hover:bg-gray-100 active:bg-gray-200 text-gray-700 shadow-xs"
            title="Abrir no celular via QR Code"
          >
            <QrCode className="w-3 h-3 text-purple-600" />
            <span>QR Code</span>
          </button>

          <a
            href="https://www.igrejaemcampinagrande.com.br/hinario/"
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#245EDC] text-white border border-[#002D96] hover:bg-[#1941A5] font-semibold shadow-xs"
            title="Abrir em nova aba"
          >
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* Carcaça do Smartphone Estilizada com Proporção de Tela Real */}
      <div className="flex-1 flex flex-col bg-[#1A1A1A] rounded-[28px] border-4 border-[#333333] shadow-2xl overflow-hidden relative p-1.5 min-h-[580px]">
        {/* Notch / Speaker Superior do Celular */}
        <div className="h-6 bg-[#1A1A1A] flex items-center justify-between px-5 text-white/80 text-[10px] z-10 select-none">
          <span className="font-semibold text-white">{currentTime}</span>
          <div className="w-16 h-3.5 bg-black rounded-full mx-auto -mt-1 shadow-inner" />
          <div className="flex items-center gap-1.5 text-white/90">
            <Wifi className="w-3 h-3" />
            <BatteryMedium className="w-3.5 h-3.5" />
          </div>
        </div>

        {/* Viewport da Aplicação Mobile (Iframe Interativo) */}
        <div className="flex-1 bg-white rounded-[20px] overflow-hidden relative flex flex-col shadow-inner">
          {isLoading && (
            <div className="absolute inset-0 bg-white/90 z-20 flex flex-col items-center justify-center gap-2">
              <div className="w-8 h-8 rounded-full border-2 border-blue-600 border-t-transparent animate-spin" />
              <span className="text-xs text-gray-600 font-semibold">Carregando Hinario EAV...</span>
            </div>
          )}

          {appUrl && (
            <iframe
              src={appUrl}
              title="Hinario EAV"
              onLoad={() => setIsLoading(false)}
              className="w-full h-full border-0 flex-1 select-auto"
              sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            />
          )}

          {/* Modal com QR Code para Testar no Celular Real */}
          {showQrCode && (
            <div className="absolute inset-0 bg-black/70 z-30 flex flex-col items-center justify-center p-6 text-center animate-fade-in font-tahoma">
              <div className="bg-white p-5 rounded-xl shadow-2xl max-w-[280px] w-full flex flex-col items-center text-black">
                <div className="flex justify-between w-full items-center mb-2">
                  <span className="font-bold text-xs text-gray-800">Testar no seu Celular</span>
                  <button
                    type="button"
                    onClick={() => setShowQrCode(false)}
                    className="w-5 h-5 flex items-center justify-center rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="p-2 bg-gray-100 rounded-lg border border-gray-300 mb-3 shadow-inner">
                  {/* QR Code dinâmico via API pública segura */}
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https%3A%2F%2Fwww.igrejaemcampinagrande.com.br%2Fhinario%2F"
                    alt="QR Code Hinario EAV"
                    className="w-40 h-40 object-contain"
                  />
                </div>

                <p className="text-[11px] text-gray-600 leading-snug mb-3">
                  Aponte a câmera do seu smartphone para o QR Code acima para abrir o app diretamente no seu aparelho.
                </p>

                <a
                  href="https://www.igrejaemcampinagrande.com.br/hinario/"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-1.5 bg-[#245EDC] text-white text-xs font-bold rounded hover:bg-[#1941A5] text-center"
                >
                  Abrir Link Direto
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Barra de Home Gestual Inferior do Celular */}
        <div className="h-4 flex items-center justify-center pt-1">
          <div className="w-28 h-1 bg-white/40 rounded-full" />
        </div>
      </div>

      {/* Rodapé Informativo das Lojas */}
      <div className="mt-2 bg-blue-50 border border-blue-200 rounded p-1.5 flex items-center justify-between text-[11px] text-blue-900 shadow-xs">
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
          <span>Status: <strong>Versão Web Ativa</strong> • Em análise nas lojas de aplicativos</span>
        </div>
        <span className="text-[10px] text-gray-500 hidden sm:inline">PWA / React</span>
      </div>
    </div>
  );
};

export const MobileEmulatorApp: React.FC<MobileEmulatorAppProps> = ({
  id = 'mobile-app-window',
  withFrame = true,
  isOpen,
  onClose,
  className = '',
}) => {
  const content = <MobileEmulatorContent />;

  if (!withFrame) {
    return <div className={className}>{content}</div>;
  }

  return (
    <WindowFrame
      id={id}
      title="Hinario EAV - Dispositivo Móvel"
      icon={<Smartphone className="w-4 h-4 text-blue-400" />}
      isOpen={isOpen}
      onClose={onClose}
      className={className}
      initialPosition={{ x: 260, y: 25, width: 395, height: 720 }}
    >
      {content}
    </WindowFrame>
  );
};

export default MobileEmulatorApp;
