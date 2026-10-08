import React, { useEffect } from 'react';
import { WindowFrame } from './WindowFrame';
import { useWindowManager } from '../../context/WindowContext';

export interface ViceCityAppProps {
  id?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const ViceCityApp: React.FC<ViceCityAppProps> = ({
  id = 'vice-city-window',
  isOpen,
  onClose,
}) => {
  let wm: ReturnType<typeof useWindowManager> | undefined;
  try {
    wm = useWindowManager();
  } catch {
    wm = undefined;
  }

  const handleClose = onClose || (() => wm?.closeWindow(id));

  // Escuta mensagens vindas do iframe (postMessage de saída)
  useEffect(() => {
    const handleMessage = (e: MessageEvent) => {
      if (
        e.data === 'quit-game' ||
        e.data === 'close-window' ||
        e.data?.type === 'quit-game' ||
        e.data?.action === 'quit' ||
        e.data?.event === 'quit'
      ) {
        handleClose();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleClose]);

  return (
    <WindowFrame
      id={id}
      title="Grand Theft Auto: Vice City"
      icon="vice-city"
      isOpen={isOpen}
      onClose={handleClose}
      initialPosition={{ x: 30, y: 15, width: 1024, height: 720 }}
    >
      <div
        data-testid="vice-city-container"
        className="w-full h-full bg-[#171c20] select-none overflow-hidden flex flex-col"
      >
        <iframe
          src="https://vc.quenq.com"
          title="GTA Vice City Online"
          data-testid="vice-city-iframe"
          className="w-full h-full border-none"
          allow="accelerometer; autoplay; bluetooth; camera; clipboard-read; clipboard-write; cross-origin-isolated; display-capture; encrypted-media; fullscreen; gamepad; geolocation; gyroscope; hid; identity-credentials-get; idle-detection; local-fonts; magnetometer; microphone; midi; payment; picture-in-picture; publickey-credentials-get; screen-wake-lock; serial; usb; web-share; window-management; xr-spatial-tracking; keyboard-map; pointer-lock"
          allowFullScreen={true}
        />
      </div>
    </WindowFrame>
  );
};

export default ViceCityApp;
