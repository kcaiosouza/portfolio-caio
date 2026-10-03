import React, { useState } from 'react';
import { useWindowManager } from '../../context/WindowContext';
import { StartMenu } from './StartMenu';
import { SystemTray } from './SystemTray';
import { FileText, Folder, Trash2, Globe, Smartphone, Image as ImageIcon } from 'lucide-react';

export const Taskbar: React.FC = () => {
  const { windows, activeWindowId, focusWindow, minimizeWindow, openWindow } = useWindowManager();
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const [isTaskbarLocked, setIsTaskbarLocked] = useState(true);

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    setContextMenu({
      x: Math.min(e.clientX, window.innerWidth - 180),
      y: Math.max(10, e.clientY - 120)
    });
  };

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
      case 'bomb':
        return <span className="text-xs">💣</span>;
      case 'browser':
        return <Globe className="w-3.5 h-3.5 text-blue-300 flex-shrink-0" />;
      case 'smartphone':
        return <Smartphone className="w-3.5 h-3.5 text-purple-300 flex-shrink-0" />;
      case 'image':
        return <ImageIcon className="w-3.5 h-3.5 text-emerald-300 flex-shrink-0" />;
      case 'taskmgr':
        return (
          <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="2" width="14" height="10" rx="1" fill="#000000" stroke="#7A96DF" strokeWidth="0.8" />
            <rect x="2" y="3" width="12" height="8" fill="#001100" />
            <path d="M2 7H4L5 4L7 9L9 6L11 8H14" stroke="#00FF00" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M6 12H10V14H6V12Z" fill="#7A96DF" />
            <path d="M4 14H12V15H4V14Z" fill="#5A76BF" />
          </svg>
        );
      case 'cmd':
        return (
          <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 16 16" fill="none">
            <rect x="1" y="2" width="14" height="11" rx="1" fill="#000000" stroke="#7A96DF" strokeWidth="0.8" />
            <path d="M3 5.5L5.5 8L3 10.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M7 10.5H11" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
          </svg>
        );
      case 'spider':
        return (
          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C9.5 7 4 11 4 15.5C4 18.5 6.5 21 9.5 21C10.7 21 11.5 20.2 12 19.5C12.5 20.2 13.3 21 14.5 21C17.5 21 20 18.5 20 15.5C20 11 14.5 7 12 2Z" fill="#1A1A1A" />
            <path d="M10 19L8 23H16L14 19H10Z" fill="#1A1A1A" />
          </svg>
        );
      case 'minecraft':
        return (
          <img
            src="/assets/minecraft-icon.webp"
            alt="Minecraft"
            className="w-3.5 h-3.5 object-contain flex-shrink-0"
          />
        );
      case 'msn':
        return (
          <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 24 24" fill="none">
            <circle cx="8" cy="7" r="4" fill="#00AA00" />
            <path d="M2 19C2 15 5 13 8 13C11 13 14 15 14 19" fill="#00AA00" />
            <circle cx="16" cy="9" r="3.5" fill="#0078D7" />
            <path d="M11 20C11 16.5 13.5 15 16 15C18.5 15 21 16.5 21 20" fill="#0078D7" />
          </svg>
        );
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

      {/* Context Menu da Barra de Tarefas */}
      {contextMenu && (
        <>
          <div
            data-testid="taskbar-context-backdrop"
            className="fixed inset-0 z-[9995]"
            onClick={() => setContextMenu(null)}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu(null);
            }}
          />
          <div
            data-testid="taskbar-context-menu"
            className="fixed z-[9996] bg-[#ECE9D8] border border-[#716F64] shadow-[2px_2px_4px_rgba(0,0,0,0.4)] p-0.5 rounded-[1px] font-tahoma text-xs text-black min-w-[170px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
          >
            <div
              onClick={() => {
                setIsTaskbarLocked((prev) => !prev);
                setContextMenu(null);
              }}
              className="px-5 py-1 hover:bg-[#316AC5] hover:text-white cursor-default flex items-center justify-between"
            >
              <span>Bloquear a barra de tarefas</span>
              {isTaskbarLocked && <span className="font-bold text-[10px]">✓</span>}
            </div>
            <div className="h-[1px] bg-[#ACA899] my-0.5" />
            <div
              onClick={() => {
                openWindow('task-manager-window');
                setContextMenu(null);
              }}
              className="px-5 py-1 hover:bg-[#316AC5] hover:text-white cursor-default font-bold"
            >
              Gerenciador de tarefas
            </div>
            <div className="h-[1px] bg-[#ACA899] my-0.5" />
            <div
              onClick={() => setContextMenu(null)}
              className="px-5 py-1 hover:bg-[#316AC5] hover:text-white cursor-default"
            >
              Propriedades
            </div>
          </div>
        </>
      )}

      <div
        role="navigation"
        aria-label="Barra de tarefas"
        onContextMenu={handleContextMenu}
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
