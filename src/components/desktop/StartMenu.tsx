import React, { useEffect, useRef } from 'react';
import { useWindowManager } from '../../context/WindowContext';
import { useSystem } from '../../context/SystemContext';
import { PORTFOLIO_DATA } from '../../utils/data';
import { Coffee, FileText, Folder, Power, LogOut, Mail, Globe, Smartphone } from 'lucide-react';

interface StartMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    role="img"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
    />
  </svg>
);

const LinkedinIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="currentColor"
    role="img"
    aria-hidden="true"
  >
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.88a1.45 1.45 0 1 0 0 2.9 1.45 1.45 0 0 0 0-2.9z" />
  </svg>
);

export const StartMenu: React.FC<StartMenuProps> = ({ isOpen, onClose }) => {
  const { openWindow } = useWindowManager();
  const { setScreenMode } = useSystem();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      role="menu"
      aria-label="Menu Iniciar"
      onClick={(e) => e.stopPropagation()}
      className="absolute bottom-9 left-0 w-80 sm:w-96 rounded-t-lg bg-white border-2 border-[#002D96] shadow-2xl flex flex-col font-tahoma overflow-hidden z-[9999]"
    >
      {/* Topo: avatar com caneca de café, nome 'Dev Caio' e subtítulo */}
      <div className="bg-gradient-to-r from-[#0058EE] via-[#0372FD] to-[#0058EE] p-3 flex items-center gap-3 text-white border-b-2 border-orange-400 shadow-sm">
        <div className="w-11 h-11 rounded-md bg-[#ECE9D8] border-2 border-white/80 shadow flex items-center justify-center overflow-hidden flex-shrink-0">
          <Coffee className="w-7 h-7 text-[#6F4E37]" data-testid="start-menu-avatar" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-sm tracking-wide truncate">{PORTFOLIO_DATA.name}</div>
          <div className="text-[11px] text-blue-100 truncate opacity-90">{PORTFOLIO_DATA.title}</div>
        </div>
      </div>

      {/* Corpo de 2 colunas do XP */}
      <div className="flex flex-1 min-h-[220px]">
        {/* Coluna esquerda: programas e atalhos */}
        <div className="w-1/2 p-2 bg-white flex flex-col gap-1 text-xs">
          <button
            type="button"
            onClick={() => {
              openWindow('about-window');
              onClose();
            }}
            className="flex items-center gap-2.5 p-2 rounded hover:bg-[#245EDC] hover:text-white text-gray-800 text-left transition-colors group"
          >
            <FileText className="w-5 h-5 text-blue-600 group-hover:text-white flex-shrink-0" />
            <div className="leading-tight">
              <span className="font-semibold block">Sobre o Desenvolvedor</span>
              <span className="text-[10px] text-gray-500 group-hover:text-blue-100 block">Biografia e skills</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              openWindow('cv-window');
              onClose();
            }}
            className="flex items-center gap-2.5 p-2 rounded hover:bg-[#245EDC] hover:text-white text-gray-800 text-left transition-colors group"
          >
            <FileText className="w-5 h-5 text-red-600 group-hover:text-white flex-shrink-0" />
            <div className="leading-tight">
              <span className="font-semibold block">Currículo (PDF)</span>
              <span className="text-[10px] text-gray-500 group-hover:text-blue-100 block">Experiência completa</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              openWindow('projects-window');
              onClose();
            }}
            className="flex items-center gap-2.5 p-2 rounded hover:bg-[#245EDC] hover:text-white text-gray-800 text-left transition-colors group"
          >
            <Folder className="w-5 h-5 text-yellow-500 group-hover:text-white flex-shrink-0" />
            <div className="leading-tight">
              <span className="font-semibold block">Meus Projetos</span>
              <span className="text-[10px] text-gray-500 group-hover:text-blue-100 block">Aplicações e portfolio</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              openWindow('browser-window');
              onClose();
            }}
            className="flex items-center gap-2.5 p-2 rounded hover:bg-[#245EDC] hover:text-white text-gray-800 text-left transition-colors group"
          >
            <Globe className="w-5 h-5 text-blue-600 group-hover:text-white flex-shrink-0" />
            <div className="leading-tight">
              <span className="font-semibold block">Internet Explorer</span>
              <span className="text-[10px] text-gray-500 group-hover:text-blue-100 block">Navegador Web Caio</span>
            </div>
          </button>

          <button
            type="button"
            onClick={() => {
              openWindow('hobbies-window');
              onClose();
            }}
            className="flex items-center gap-2.5 p-2 rounded hover:bg-[#245EDC] hover:text-white text-gray-800 text-left transition-colors group"
          >
            <Folder className="w-5 h-5 text-yellow-600 group-hover:text-white flex-shrink-0" />
            <div className="leading-tight">
              <span className="font-semibold block">Meus Hobbies</span>
              <span className="text-[10px] text-gray-500 group-hover:text-blue-100 block">Café, setup e música</span>
            </div>
          </button>

          <button
            type="button"
            data-testid="start-menu-minesweeper"
            onClick={() => {
              openWindow('minesweeper-window');
              onClose();
            }}
            className="flex items-center gap-2.5 p-2 rounded hover:bg-[#245EDC] hover:text-white text-gray-800 text-left transition-colors group"
          >
            <div className="w-5 h-5 flex items-center justify-center text-sm flex-shrink-0">
              💣
            </div>
            <div className="leading-tight">
              <span className="font-semibold block">Campo Minado</span>
              <span className="text-[10px] text-gray-500 group-hover:text-blue-100 block">Jogo clássico XP</span>
            </div>
          </button>
        </div>

        {/* Coluna direita: links sociais */}
        <div className="w-1/2 p-2 bg-[#D3E5FA] border-l border-blue-200 flex flex-col gap-1 text-xs text-gray-800">
          <div className="font-bold text-gray-600 text-[10px] px-2 py-0.5 uppercase tracking-wider mb-0.5">
            Redes & Contato
          </div>

          <a
            href={PORTFOLIO_DATA.contacts.github}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 p-2 rounded hover:bg-[#245EDC] hover:text-white transition-colors group"
          >
            <GithubIcon className="w-4 h-4 text-gray-700 group-hover:text-white flex-shrink-0" />
            <span className="font-medium">GitHub</span>
          </a>

          <a
            href={PORTFOLIO_DATA.contacts.linkedin}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-2.5 p-2 rounded hover:bg-[#245EDC] hover:text-white transition-colors group"
          >
            <LinkedinIcon className="w-4 h-4 text-blue-700 group-hover:text-white flex-shrink-0" />
            <span className="font-medium">LinkedIn</span>
          </a>

          <a
            href={PORTFOLIO_DATA.contacts.email}
            className="flex items-center gap-2.5 p-2 rounded hover:bg-[#245EDC] hover:text-white transition-colors group"
          >
            <Mail className="w-4 h-4 text-red-600 group-hover:text-white flex-shrink-0" />
            <span className="font-medium">Email</span>
          </a>
        </div>
      </div>

      {/* Rodapé: Fazer logoff e Reiniciar BIOS */}
      <div className="bg-gradient-to-r from-[#0058EE] via-[#0372FD] to-[#0058EE] p-2 flex justify-end gap-3 text-white text-xs border-t border-blue-300 shadow-inner">
        <button
          type="button"
          onClick={() => {
            setScreenMode('login');
            onClose();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-white/20 active:bg-white/30 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5 text-orange-200" />
          <span>Fazer logoff</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setScreenMode('bios');
            onClose();
          }}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded hover:bg-white/20 active:bg-white/30 transition-colors"
        >
          <Power className="w-3.5 h-3.5 text-red-300" />
          <span>Reiniciar BIOS</span>
        </button>
      </div>
    </div>
  );
};
