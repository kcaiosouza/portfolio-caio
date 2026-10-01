import React, { useState } from 'react';
import { useSystem } from '../../context/SystemContext';
import { soundEngine } from '../../utils/soundEffects';
import { PORTFOLIO_DATA } from '../../utils/data';
import { Power, Coffee } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { setScreenMode } = useSystem();
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    soundEngine.playStartupChime();
    setTimeout(() => {
      setScreenMode('desktop');
    }, 1000);
  };

  const handleRestartToBios = () => {
    soundEngine.playClick();
    setScreenMode('bios');
  };

  return (
    <div
      data-testid="login-screen"
      className="fixed inset-0 bg-[#00136B] flex flex-col justify-between font-tahoma select-none overflow-hidden z-40"
    >
      {/* Top Banner clássico com degradê azul e filete laranja */}
      <div className="h-16 md:h-20 bg-gradient-to-r from-[#00136B] via-[#002D96] to-[#00136B] border-b-2 border-[#E76300] flex items-center px-8 shadow-md">
        <div className="text-white text-lg md:text-xl font-bold tracking-wide italic">
          Caio XP Professional
        </div>
      </div>

      {/* Área Central de Boas-Vindas */}
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center px-6 md:px-16 gap-8 md:gap-16">
        {/* Lado Esquerdo com instrução */}
        <div className="text-right text-white max-w-sm hidden md:block">
          <h2 className="text-3xl font-light mb-2 tracking-wide">Para começar,</h2>
          <p className="text-blue-200 text-sm leading-relaxed">
            clique no seu nome de usuário para acessar o portfólio e as informações profissionais.
          </p>
        </div>

        {/* Divisor vertical característico com degradê branco */}
        <div
          data-testid="login-divider"
          className="hidden md:block w-[1px] h-64 bg-gradient-to-b from-transparent via-white to-transparent opacity-60"
        />

        {/* Lado Direito: Card de Usuário */}
        <div className="flex flex-col items-center md:items-start">
          <button
            type="button"
            data-testid="user-login-button"
            onClick={handleLogin}
            disabled={isLoggingIn}
            className="group flex items-center gap-4 p-3 pr-8 rounded-lg cursor-pointer transition-all duration-150 hover:bg-white hover:bg-opacity-10 border border-transparent hover:border-yellow-400 text-left focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            {/* Avatar: Caneca de café estilizada com moldura clássica do XP */}
            <div className="relative w-16 h-16 md:w-20 md:h-20 rounded-lg bg-gradient-to-br from-[#ECE9D8] to-[#C0BCA7] border-2 border-white shadow-md flex items-center justify-center overflow-hidden flex-shrink-0">
              <Coffee
                data-testid="coffee-avatar"
                className="w-10 h-10 md:w-12 md:h-12 text-[#6F4E37] drop-shadow-sm group-hover:scale-105 transition-transform"
              />
              <div className="absolute inset-0 bg-white opacity-10 group-hover:opacity-20 pointer-events-none" />
            </div>

            {/* Informações do usuário */}
            <div className="text-white">
              <div className="text-xl md:text-2xl font-bold tracking-wide group-hover:text-yellow-300">
                {PORTFOLIO_DATA.name}
              </div>
              <div className="text-xs md:text-sm text-blue-200 min-h-[20px]">
                {isLoggingIn ? (
                  <span
                    data-testid="loading-feedback"
                    className="text-yellow-300 animate-pulse font-medium"
                  >
                    Carregando suas configurações...
                  </span>
                ) : (
                  PORTFOLIO_DATA.title
                )}
              </div>
              <div className="text-[11px] text-gray-300 mt-1">
                {isLoggingIn ? 'Iniciando sessão...' : 'Clique aqui para iniciar a sessão'}
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Barra Inferior com botão de desligar / reiniciar na BIOS e filete laranja */}
      <div className="h-16 md:h-20 bg-gradient-to-r from-[#00136B] via-[#002D96] to-[#00136B] border-t-2 border-[#E76300] flex items-center justify-between px-8 text-white text-xs shadow-inner">
        <button
          type="button"
          onClick={handleRestartToBios}
          className="flex items-center gap-2 px-3 py-1.5 rounded hover:bg-white hover:bg-opacity-10 text-white font-medium transition-colors focus:outline-none focus:ring-1 focus:ring-white"
        >
          <div className="w-6 h-6 rounded-full bg-red-600 border border-white flex items-center justify-center shadow">
            <Power className="w-3.5 h-3.5 text-white" />
          </div>
          <span>Reiniciar na BIOS</span>
        </button>

        <div className="text-blue-300 hidden sm:block">
          Após fazer logon, você poderá explorar arquivos, currículo e projetos.
        </div>
      </div>
    </div>
  );
};
