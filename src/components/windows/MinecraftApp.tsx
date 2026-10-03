import React from 'react';
import { WindowFrame } from './WindowFrame';

export interface MinecraftAppProps {
  id?: string;
  isOpen?: boolean;
  onClose?: () => void;
}

export const MinecraftApp: React.FC<MinecraftAppProps> = ({
  id = 'minecraft-window',
  isOpen,
  onClose,
}) => {
  return (
    <WindowFrame
      id={id}
      title="Minecraft Classic"
      icon="minecraft"
      isOpen={isOpen}
      onClose={onClose}
      initialPosition={{ x: 30, y: 15, width: 1024, height: 680 }}
    >
      <div
        data-testid="minecraft-container"
        className="w-full h-full bg-black select-none overflow-hidden flex flex-col"
      >
        <iframe
          src="https://classic.minecraft.net/"
          title="Minecraft Classic"
          data-testid="minecraft-iframe"
          className="w-full h-full border-none"
          allow="autoplay; fullscreen; pointer-lock; gamepad; cross-origin-isolated"
        />
      </div>
    </WindowFrame>
  );
};

export default MinecraftApp;
