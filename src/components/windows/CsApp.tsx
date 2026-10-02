import React from 'react';
import { WindowFrame } from './WindowFrame';

export interface CsAppProps {
  id?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const CsApp: React.FC<CsAppProps> = ({
  id = 'cs-window',
  isOpen,
  onClose,
}) => {
  return (
    <WindowFrame
      id={id}
      title="Counter-Strike 1.6"
      icon="cs"
      isOpen={isOpen}
      onClose={onClose}
      initialPosition={{ x: 30, y: 15, width: 1024, height: 680 }}
    >
      <div className="w-full h-full bg-black select-none overflow-hidden flex flex-col">
        <iframe
          src="https://play-cs.com/pt/servers"
          title="Counter-Strike 1.6"
          data-testid="cs-iframe"
          className="w-full h-full border-none"
          allow="autoplay; fullscreen; gamepad"
        />
      </div>
    </WindowFrame>
  );
};

export default CsApp;
