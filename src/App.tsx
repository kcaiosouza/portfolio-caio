import React from 'react';
import { SystemProvider, useSystem } from './context/SystemContext';
import { WindowProvider } from './context/WindowContext';
import { BiosScreen } from './components/bios/BiosScreen';
import { LoginScreen } from './components/login/LoginScreen';
import { Desktop } from './components/desktop/Desktop';
import { CrtOverlay } from './components/effects/CrtOverlay';
import { VgaModePrompt } from './components/mobile/VgaModePrompt';

const AppContent: React.FC = () => {
  const { screenMode } = useSystem();

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black select-none">
      {/* Camada persistente de tubo CRT (Scanlines + Curvatura + Fósforo) */}
      <CrtOverlay />

      {/* Alerta de Modo VGA para smartphones */}
      <VgaModePrompt />

      {/* Telas do Sistema Operacional */}
      {screenMode === 'bios' && <BiosScreen />}
      {screenMode === 'login' && <LoginScreen />}
      {screenMode === 'desktop' && <Desktop />}
    </div>
  );
};

export default function App() {
  return (
    <SystemProvider>
      <WindowProvider>
        <AppContent />
      </WindowProvider>
    </SystemProvider>
  );
}
