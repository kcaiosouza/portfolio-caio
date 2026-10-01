import React from 'react';
import { useSystem } from '../../context/SystemContext';

export interface CrtOverlayProps {
  forceEnabled?: boolean;
  className?: string;
}

export const CrtOverlay: React.FC<CrtOverlayProps> = ({
  forceEnabled,
  className = '',
}) => {
  const { isCrtEnabled } = useSystem();

  const enabled = forceEnabled !== undefined ? forceEnabled : isCrtEnabled;

  if (!enabled) {
    return null;
  }

  return (
    <div
      data-testid="crt-overlay"
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-[99999] overflow-hidden select-none crt-flicker-animation ${className}`}
    >
      {/* 1. Scanlines horizontais ultra-leves e suaves para manter nitidez total do texto */}
      <div
        data-testid="crt-scanlines"
        className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
        style={{
          background:
            'repeating-linear-gradient(to bottom, rgba(255, 255, 255, 0) 0px, rgba(255, 255, 255, 0) 2px, rgba(0, 0, 0, 0.12) 3px, rgba(0, 0, 0, 0.12) 4px)',
          backgroundSize: '100% 4px',
        }}
      />

      {/* 2. Feixe animado de varredura vertical contínua (Cathode Ray Sweep Beam) */}
      <div
        className="absolute inset-x-0 h-32 pointer-events-none crt-beam-animation opacity-25"
        style={{
          background:
            'linear-gradient(to bottom, rgba(255, 255, 255, 0) 0%, rgba(255, 255, 255, 0.08) 50%, rgba(0, 0, 0, 0.15) 100%)',
        }}
      />

      {/* 3. Vinheta radial suave (escurecimento delicado apenas nos cantos da curvatura) */}
      <div
        data-testid="crt-vignette"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 90% 85% at 50% 50%, rgba(0, 0, 0, 0) 70%, rgba(0, 0, 0, 0.2) 90%, rgba(0, 0, 0, 0.45) 100%)',
          boxShadow: 'inset 0 0 50px rgba(0, 0, 0, 0.4)',
        }}
      />

      {/* 4. Brilho suave de fósforo que realça as cores retrô sem cansar os olhos */}
      <div
        data-testid="crt-phosphor"
        className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen opacity-15"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.05) 0%, transparent 80%)',
        }}
      />
    </div>
  );
};

export default CrtOverlay;
