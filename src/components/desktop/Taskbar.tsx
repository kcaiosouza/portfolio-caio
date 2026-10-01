import React, { useState } from 'react';
import { useWindowManager } from '../../context/WindowContext';
import { StartMenu } from './StartMenu';
import { SystemTray } from './SystemTray';
import { FileText, Folder, Trash2 } from 'lucide-react';

export const Taskbar: React.FC = () => {
  const { windows, activeWindowId, focusWindow, minimizeWindow } = useWindowManager();
  const [isStartOpen, setIsStartOpen] = useState(false);

  const getWindowIcon = (icon: string) => {
    switch (icon) {
      case 'notepad':
        return <FileText className="w-3.5 h-3.5 text-blue-200 flex-shrink-0" />;
      case 'pdf':
        return <FileText className="w-3.5 h-3.5 text-red-400 flex-shrink-0" />;
      case 'folder':
        return <Folder className="w-3.5 h-3.5 text-yellow-300 flex-shrink-0" />;
      case 'trash':
        return <Trash2 className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />;
      default:
        return <FileText className="w-3.5 h-3.5 text-white flex-shrink-0" />;
    }
  };

  const handleTabClick = (windowId: string, isActive: boolean) => {
    if (isActive) {
      minimizeWindow(windowId);
    } else {
      focusWindow(windowId);
    }
  };

  return (
    <>
      {/* Overlay transparente para fechar o StartMenu ao clicar fora */}
      {isStartOpen && (
        <div
          data-testid="start-menu-backdrop"
          className="fixed inset-0 z-[9990]"
          onClick={() => setIsStartOpen(false)}
        />
      )}

      <StartMenu isOpen={isStartOpen} onClose={() => setIsStartOpen(false)} />

      <div
        role="navigation"
        aria-label="Barra de tarefas"
        className="h-9 bg-gradient-to-r from-[#245EDC] via-[#0058EE] to-[#245EDC] border-t-2 border-[#002D96] flex items-center justify-between z-[9000] relative select-none shadow-md font-tahoma"
      >
        <div className="flex items-center h-full gap-2 flex-1 overflow-hidden pr-2">
          {/* Botão Iniciar Verde clássico do Windows XP */}
          <button
            type="button"
            onClick={() => setIsStartOpen((prev) => !prev)}
            aria-expanded={isStartOpen}
            aria-label="Menu Iniciar"
            className={`h-full px-4 rounded-r-xl border-r-2 flex items-center gap-2 text-white font-bold italic shadow-md text-sm tracking-wide transition-all focus:outline-none ${
              isStartOpen
                ? 'bg-gradient-to-r from-[#2e7d32] via-[#388e3c] to-[#2e7d32] border-green-950 brightness-95 shadow-inner'
                : 'bg-gradient-to-r from-[#388E3C] via-[#4CAF50] to-[#388E3C] hover:brightness-110 active:brightness-95 border-green-800'
            }`}
          >
            {/* Ícone de bandeira/símbolo estilo XP */}
            <div className="w-4 h-4 rounded-full bg-white/30 flex items-center justify-center font-normal not-italic text-[10px] shadow-sm">
              ❖
            </div>
            <span className="drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]">iniciar</span>
          </button>

          {/* Abas das Janelas Abertas */}
          <div className="flex items-center gap-1 overflow-x-auto h-full py-0.5 scrollbar-none">
            {windows
              .filter((w) => w.isOpen)
              .map((w) => {
                const isActive = activeWindowId === w.id && !w.isMinimized;
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => handleTabClick(w.id, isActive)}
                    aria-pressed={isActive}
                    title={w.title}
                    className={`h-7 px-2.5 rounded flex items-center gap-1.5 text-xs max-w-[170px] truncate transition-colors border focus:outline-none ${
                      isActive
                        ? 'bg-[#1941A5] text-white border-blue-900 shadow-inner font-semibold'
                        : 'bg-[#245EDC] text-blue-100 hover:bg-[#326BE9] border-blue-400 shadow-sm'
                    }`}
                  >
                    {getWindowIcon(w.icon)}
                    <span className="truncate">{w.title}</span>
                  </button>
                );
              })}
          </div>
        </div>

        {/* System Tray */}
        <SystemTray />
      </div>
    </>
  );
};
