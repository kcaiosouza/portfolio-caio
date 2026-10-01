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
      className={`pointer-events-none fixed inset-0 z-[99999] overflow-hidden select-none ${className}`}
    >
      {/* Scanlines horizontais repetitivas via gradiente linear CSS */}
      <div
        data-testid="crt-scanlines"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          background:
            'repeating-linear-gradient(to bottom, rgba(255, 255, 255, 0) 0px, rgba(255, 255, 255, 0) 2px, rgba(0, 0, 0, 0.35) 3px, rgba(0, 0, 0, 0.35) 4px)',
          backgroundSize: '100% 4px',
        }}
      />

      {/* Vinheta radial escurecida nos cantos para simular curvatura do tubo */}
      <div
        data-testid="crt-vignette"
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{
          background:
            'radial-gradient(circle at 50% 50%, rgba(0, 0, 0, 0) 55%, rgba(0, 0, 0, 0.45) 85%, rgba(0, 0, 0, 0.85) 100%)',
          boxShadow: 'inset 0 0 80px rgba(0, 0, 0, 0.75)',
        }}
      />

      {/* Sutil brilho de fosforo */}
      <div
        data-testid="crt-phosphor"
        className="absolute inset-0 w-full h-full pointer-events-none mix-blend-screen opacity-30"
        style={{
          background:
            'radial-gradient(ellipse at center, rgba(16, 185, 129, 0.08) 0%, rgba(16, 185, 129, 0.01) 75%, transparent 100%)',
          boxShadow: 'inset 0 0 40px rgba(52, 211, 153, 0.08)',
        }}
      />
    </div>
  );
};

export default CrtOverlay;
