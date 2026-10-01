import React, { useState, useEffect, useRef } from 'react';
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
  const [scale, setScale] = useState<number>(0.87);
  const viewportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Calcula escala responsiva para que a aplicação sempre renderize na resolução móvel padrão (360px)
  // sem cortar nenhum botão ou elemento verticalmente
  useEffect(() => {
    if (!viewportRef.current) return;
    const calculateScale = () => {
      if (viewportRef.current) {
        const { clientWidth } = viewportRef.current;
        if (clientWidth > 0) {
          const calculated = Math.min(1, clientWidth / 360);
          setScale(calculated);
        }
      }
    };

    calculateScale();
    const ro = new ResizeObserver(calculateScale);
    ro.observe(viewportRef.current);
    return () => ro.disconnect();
  }, []);

  const handleReload = () => {
    soundEngine.playClick();
    setIsLoading(true);
    const temp = appUrl;
    setAppUrl('');
    setTimeout(() => setAppUrl(temp), 80);
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 bg-[#ECE9D8] font-tahoma text-black select-none text-xs p-1.5 overflow-y-auto">
      {/* Container Centralizado para Manter Proporção de Celular mesmo em Tela Cheia */}
      <div className="flex flex-col flex-1 w-full max-w-[340px] max-h-[760px] mx-auto my-auto min-h-0">
        {/* Barra Superior Retrô Compacta com Controles Rápidos */}
        <div className="bg-[#ECE9D8] border border-[#ACA899] rounded-[2px] px-1.5 py-1 mb-1 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-1.5 min-w-0">
            <Smartphone className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
            <span className="font-bold text-gray-800 text-[11px] truncate">Hinario EAV</span>
          </div>

          <div className="flex items-center gap-1 flex-shrink-0">
            <button
              type="button"
              onClick={handleReload}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-white border border-[#7F9DB9] hover:bg-gray-100 active:bg-gray-200 text-gray-700 shadow-xs text-[10px]"
              title="Recarregar tela do app"
            >
              <RotateCw className="w-2.5 h-2.5 text-blue-600" />
              <span>Recarregar</span>
            </button>

            <button
              type="button"
              onClick={() => {
                soundEngine.playClick();
                setShowQrCode(prev => !prev);
              }}
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-white border border-[#7F9DB9] hover:bg-gray-100 active:bg-gray-200 text-gray-700 shadow-xs text-[10px]"
              title="Abrir no celular via QR Code"
            >
              <QrCode className="w-2.5 h-2.5 text-purple-600" />
              <span>QR Code</span>
            </button>

            <a
              href="https://play.google.com/store/apps/details?id=br.com.igrejacg.hinarioeav"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-[#01875F] text-white border border-[#016849] hover:bg-[#01704F] font-semibold shadow-xs text-[10px]"
              title="Abrir na Google Play Store"
            >
              <span>Play Store</span>
              <ExternalLink className="w-2.5 h-2.5" />
            </a>

            <a
              href="https://www.igrejaemcampinagrande.com.br/hinario/"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] bg-[#245EDC] text-white border border-[#002D96] hover:bg-[#1941A5] font-semibold shadow-xs text-[10px]"
              title="Abrir versão web em nova aba"
            >
              <ExternalLink className="w-2.5 h-2.5" />
            </a>
          </div>
        </div>

        {/* Carcaça do Smartphone com Silhueta Esguia e Proporção Real de Celular Moderno */}
        <div className="flex-1 flex flex-col bg-[#141414] rounded-[32px] border-[3px] border-[#2C2C2C] shadow-2xl overflow-hidden relative p-1 min-h-[520px]">
          {/* Notch / Speaker Superior do Celular */}
          <div className="h-5 bg-[#141414] flex items-center justify-between px-4 text-white/80 text-[10px] z-10 select-none">
            <span className="font-semibold text-white text-[10px]">{currentTime}</span>
            <div className="w-16 h-2.5 bg-black rounded-full mx-auto -mt-0.5 shadow-inner flex items-center justify-center gap-1.5">
              <div className="w-5 h-0.5 bg-neutral-800 rounded-full" />
              <div className="w-1.5 h-1.5 bg-neutral-900 rounded-full" />
            </div>
            <div className="flex items-center gap-1 text-white/90">
              <Wifi className="w-2.5 h-2.5" />
              <BatteryMedium className="w-3 h-3" />
            </div>
          </div>

          {/* Viewport da Aplicação Mobile (com escala precisa para evitar cortes) */}
          <div
            ref={viewportRef}
            className="flex-1 bg-white rounded-[22px] overflow-hidden relative flex flex-col shadow-[inset_0_0_4px_rgba(0,0,0,0.25)]"
          >
            {isLoading && (
              <div className="absolute inset-0 bg-[#241814] z-20 flex flex-col items-center justify-center gap-2">
                <div className="w-7 h-7 rounded-full border-2 border-emerald-500 border-t-transparent animate-spin" />
                <span className="text-[11px] text-emerald-200 font-semibold">Carregando Hinario EAV...</span>
              </div>
            )}

            {appUrl && (
              <iframe
                src={appUrl}
                title="Hinario EAV"
                onLoad={() => setIsLoading(false)}
                style={{
                  width: `${Math.round(100 / scale)}%`,
                  height: `${Math.round(100 / scale)}%`,
                  transform: `scale(${scale})`,
                  transformOrigin: 'top left',
                }}
                className="border-0 absolute top-0 left-0 select-auto"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
              />
            )}

            {/* Modal com QR Code para Testar no Celular Real */}
            {showQrCode && (
              <div className="absolute inset-0 bg-black/75 z-30 flex flex-col items-center justify-center p-4 text-center animate-fade-in font-tahoma">
                <div className="bg-white p-4 rounded-xl shadow-2xl max-w-[260px] w-full flex flex-col items-center text-black">
                  <div className="flex justify-between w-full items-center mb-2">
                    <span className="font-bold text-xs text-gray-800">Testar no Celular</span>
                    <button
                      type="button"
                      onClick={() => setShowQrCode(false)}
                      className="w-5 h-5 flex items-center justify-center rounded bg-gray-200 hover:bg-gray-300 text-gray-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="p-2 bg-gray-100 rounded-lg border border-gray-300 mb-2 shadow-inner">
                    <img
                      src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https%3A%2F%2Fwww.igrejaemcampinagrande.com.br%2Fhinario%2F"
                      alt="QR Code Hinario EAV"
                      className="w-36 h-36 object-contain"
                    />
                  </div>

                  <p className="text-[10px] text-gray-600 leading-snug mb-2.5">
                    Aponte a câmera do seu celular para abrir o app ou baixe diretamente na loja.
                  </p>

                  <div className="flex flex-col gap-1.5 w-full">
                    <a
                      href="https://play.google.com/store/apps/details?id=br.com.igrejacg.hinarioeav"
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-1 bg-[#01875F] text-white text-xs font-bold rounded hover:bg-[#01704F] text-center shadow-xs flex items-center justify-center gap-1"
                    >
                      <span>Baixar na Google Play</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>

                    <a
                      href="https://www.igrejaemcampinagrande.com.br/hinario/"
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-1 bg-gray-100 text-blue-700 text-xs font-semibold rounded border border-gray-300 hover:bg-gray-200 text-center"
                    >
                      Abrir Versão Web
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Barra de Home Gestual Inferior do Celular */}
          <div className="h-3 flex items-center justify-center pt-0.5">
            <div className="w-20 h-0.5 bg-white/40 rounded-full" />
          </div>
        </div>

        {/* Rodapé Informativo das Lojas em Linha Única */}
        <div className="mt-1 bg-emerald-50 border border-emerald-300 rounded px-2 py-1 flex items-center justify-between text-[10px] text-emerald-950 shadow-xs">
          <div className="flex items-center gap-1.5 min-w-0 truncate">
            <CheckCircle2 className="w-3.5 h-3.5 text-[#01875F] flex-shrink-0" />
            <span className="truncate">
              Status: <strong>Publicado na Google Play Store</strong> • App Store em análise
            </span>
          </div>
          <a
            href="https://play.google.com/store/apps/details?id=br.com.igrejacg.hinarioeav"
            target="_blank"
            rel="noreferrer"
            className="text-[10px] text-emerald-800 hover:text-emerald-950 hover:underline font-bold ml-1 flex-shrink-0 flex items-center gap-0.5"
          >
            <span>Ver na Loja</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
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
      initialPosition={{ x: 280, y: 15, width: 335, height: 710 }}
    >
      {content}
    </WindowFrame>
  );
};

export default MobileEmulatorApp;
