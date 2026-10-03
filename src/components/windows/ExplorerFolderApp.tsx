import React, { useState } from 'react';
import WindowFrame from './WindowFrame';
import { HOBBIES_ITEMS } from '../../utils/data';
import { HobbyItem } from '../../types';
import { soundEngine } from '../../utils/soundEffects';
import { useWindowManager } from '../../context/WindowContext';

export interface ExplorerFolderAppProps {
  id?: string;
  withFrame?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export const ExplorerFolderContent: React.FC = () => {
  let wm: ReturnType<typeof useWindowManager> | undefined;
  try {
    wm = useWindowManager();
  } catch {
    wm = undefined;
  }

  const [selectedHobby, setSelectedHobby] = useState<HobbyItem | null>(HOBBIES_ITEMS[0]);

  const handleSelectHobby = (hobby: HobbyItem) => {
    soundEngine.playClick();
    setSelectedHobby(hobby);
  };

  const handleOpenHobby = (hobby: HobbyItem) => {
    soundEngine.playClick();
    if (wm) {
      if (hobby.windowId) {
        wm.openWindow(hobby.windowId);
      } else {
        wm.openWindow(`hobby-${hobby.id}-window`);
      }
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 bg-white font-tahoma text-black select-none text-xs relative">
      {/* Top Navigation & Toolbar */}
      <div className="bg-[#ECE9D8] border-b border-[#ACA899] p-1 flex flex-col gap-1">
        {/* Standard Buttons Toolbar */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            data-testid="btn-nav-back"
            title="Voltar"
            disabled
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] opacity-50 cursor-default hover:bg-transparent"
          >
            <span className="w-5 h-5 rounded-full bg-[#6EB82C] text-white flex items-center justify-center text-xs font-bold shadow-xs">
              ‹
            </span>
            <span className="text-gray-600">Voltar</span>
          </button>

          <button
            type="button"
            data-testid="btn-nav-forward"
            title="Avançar"
            disabled
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] opacity-50 cursor-default"
          >
            <span className="w-5 h-5 rounded-full bg-[#6EB82C] text-white flex items-center justify-center text-xs font-bold shadow-xs">
              ›
            </span>
          </button>

          <button
            type="button"
            data-testid="btn-nav-up"
            title="Acima"
            onClick={() => soundEngine.playClick()}
            className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] hover:bg-[#B6BDD2]"
          >
            <svg className="w-4 h-4 text-[#F0B232]" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 3a1 1 0 011-1h4l1.5 2H13a1 1 0 011 1v7a1 1 0 01-1 1H3a1 1 0 01-1-1V3z" />
              <path d="M8 8V5M6 6.5L8 4.5L10 6.5" stroke="#002D96" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
            <span>Acima</span>
          </button>

          <div className="h-4 w-[1px] bg-gray-400 mx-1" />

          {/* View info button */}
          <button
            type="button"
            title="Pastas"
            className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] hover:bg-[#B6BDD2]"
          >
            <svg className="w-4 h-4 text-blue-600" viewBox="0 0 16 16" fill="currentColor">
              <rect x="2" y="2" width="12" height="12" rx="1" fill="#7598CE" />
              <rect x="4" y="4" width="8" height="8" fill="white" />
            </svg>
            <span>Pastas</span>
          </button>
        </div>

        {/* Address Bar */}
        <div className="flex items-center gap-1.5 px-1 py-0.5">
          <span className="text-gray-600 font-medium">Endereço</span>
          <div className="flex-1 flex items-center bg-white border border-[#7F9DB9] px-2 py-0.5 rounded-[1px] shadow-inner text-xs">
            <svg className="w-3.5 h-3.5 text-[#F0B232] mr-1.5 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
              <path d="M2 3a1 1 0 011-1h4l1.5 2H13a1 1 0 011 1v7a1 1 0 01-1 1H3a1 1 0 01-1-1V3z" />
            </svg>
            <span className="text-gray-800 font-normal truncate">
              C:\Documents and Settings\Caio\Meus Documentos\hobbies
            </span>
          </div>
          <button
            type="button"
            title="Ir"
            onClick={() => soundEngine.playClick()}
            className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-b from-white to-[#E1DECE] border border-[#7F9DB9] rounded-[2px] hover:border-[#0058EE] active:bg-[#C2CEE8]"
          >
            <span className="text-green-600 font-bold">➔</span>
            <span>Ir</span>
          </button>
        </div>
      </div>

      {/* Main Container: Sidebar + Items Grid */}
      <div className="flex-1 flex min-h-0 bg-white">
        {/* Classic XP Left Sidebar (Luna Blue Gradient with Rounded Panels) */}
        <div
          data-testid="explorer-sidebar"
          className="w-52 bg-gradient-to-b from-[#7BA2E7] via-[#6375D6] to-[#6375D6] p-2 flex flex-col gap-2.5 overflow-y-auto border-r border-[#002D96]"
        >
          {/* Section 1: Tarefas de pasta */}
          <div className="bg-white rounded-t-[4px] rounded-b-[2px] shadow-sm overflow-hidden border border-[#A7BCE8]">
            <div className="bg-gradient-to-r from-white via-[#D3E1FA] to-[#C0D5FA] px-2 py-1 border-b border-[#A7BCE8] flex items-center justify-between font-bold text-[#215DC6]">
              <span>Tarefas de pasta</span>
              <span className="w-3.5 h-3.5 rounded-full bg-[#215DC6] text-white text-[9px] flex items-center justify-center font-bold">
                ▲
              </span>
            </div>
            <div className="p-2 space-y-1.5 text-xs text-[#215DC6]">
              <div
                className="hover:underline cursor-pointer flex items-center gap-1.5"
                onClick={() => selectedHobby && handleOpenHobby(selectedHobby)}
              >
                <span className="text-blue-500">📁</span>
                <span>Abrir item selecionado</span>
              </div>
              <div className="hover:underline cursor-pointer flex items-center gap-1.5">
                <span className="text-blue-500">🖼️</span>
                <span>Ver apresentação</span>
              </div>
              <div className="hover:underline cursor-pointer flex items-center gap-1.5">
                <span className="text-blue-500">🌐</span>
                <span>Publicar pasta na Web</span>
              </div>
            </div>
          </div>

          {/* Section 2: Outros Locais */}
          <div className="bg-white rounded-t-[4px] rounded-b-[2px] shadow-sm overflow-hidden border border-[#A7BCE8]">
            <div className="bg-gradient-to-r from-white via-[#D3E1FA] to-[#C0D5FA] px-2 py-1 border-b border-[#A7BCE8] flex items-center justify-between font-bold text-[#215DC6]">
              <span>Outros locais</span>
              <span className="w-3.5 h-3.5 rounded-full bg-[#215DC6] text-white text-[9px] flex items-center justify-center font-bold">
                ▲
              </span>
            </div>
            <div className="p-2 space-y-1.5 text-xs text-[#215DC6]">
              <div className="hover:underline cursor-pointer flex items-center gap-1.5">
                <span>📂</span>
                <span>Meus Documentos</span>
              </div>
              <div className="hover:underline cursor-pointer flex items-center gap-1.5">
                <span>💻</span>
                <span>Meu Computador</span>
              </div>
              <div className="hover:underline cursor-pointer flex items-center gap-1.5">
                <span>🌐</span>
                <span>Meus locais de rede</span>
              </div>
            </div>
          </div>

          {/* Section 3: Detalhes do item selecionado */}
          <div className="bg-white rounded-t-[4px] rounded-b-[2px] shadow-sm overflow-hidden border border-[#A7BCE8]">
            <div className="bg-gradient-to-r from-white via-[#D3E1FA] to-[#C0D5FA] px-2 py-1 border-b border-[#A7BCE8] flex items-center justify-between font-bold text-[#215DC6]">
              <span>Detalhes</span>
              <span className="w-3.5 h-3.5 rounded-full bg-[#215DC6] text-white text-[9px] flex items-center justify-center font-bold">
                ▲
              </span>
            </div>
            <div className="p-2 text-xs" data-testid="sidebar-details">
              {selectedHobby ? (
                <div className="space-y-1">
                  <div className="font-bold text-gray-900 truncate" title={selectedHobby.title}>
                    {selectedHobby.title}
                  </div>
                  <div className="text-gray-500">
                    Tipo: {selectedHobby.type === 'game' ? 'Aplicativo' : selectedHobby.type === 'image' ? 'Imagem JPEG' : 'Documento de Texto'}
                  </div>
                  <div className="text-gray-600 text-[11px] leading-tight mt-1 border-t border-gray-200 pt-1">
                    {selectedHobby.description}
                  </div>
                  {selectedHobby.type === 'image' && (
                    <div className="mt-2 border border-gray-300 rounded overflow-hidden">
                      <img
                        src={selectedHobby.content}
                        alt={selectedHobby.title}
                        className="w-full h-20 object-cover"
                      />
                    </div>
                  )}
                  {selectedHobby.type === 'game' && (
                    <div className="mt-2 border border-gray-300 rounded p-2 flex items-center justify-center bg-black/10">
                      <img
                        src="/assets/minecraft-icon.webp"
                        alt={selectedHobby.title}
                        className="w-16 h-16 object-contain drop-shadow"
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => handleOpenHobby(selectedHobby)}
                    className="mt-2 w-full px-2 py-1 bg-gradient-to-b from-white to-[#E1DECE] border border-[#7F9DB9] rounded-[2px] text-xs font-semibold hover:border-[#0058EE]"
                  >
                    Abrir Detalhes
                  </button>
                </div>
              ) : (
                <div className="text-gray-500 italic">Selecione um item para ver detalhes.</div>
              )}
            </div>
          </div>
        </div>

        {/* Right Grid Area */}
        <div
          data-testid="explorer-items-grid"
          className="flex-1 p-4 overflow-y-auto bg-white"
          onClick={() => setSelectedHobby(null)}
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {HOBBIES_ITEMS.map(hobby => {
              const isSelected = selectedHobby?.id === hobby.id;

              return (
                <div
                  key={hobby.id}
                  data-testid={`hobby-item-${hobby.id}`}
                  onClick={e => {
                    e.stopPropagation();
                    handleSelectHobby(hobby);
                  }}
                  onDoubleClick={e => {
                    e.stopPropagation();
                    handleOpenHobby(hobby);
                  }}
                  className={`flex flex-col items-center justify-start p-2 rounded cursor-pointer transition-colors text-center ${
                    isSelected
                      ? 'bg-[#316AC5] text-white ring-1 ring-[#002D96]'
                      : 'hover:bg-[#E0E8F8] text-black'
                  }`}
                >
                  {/* File Icon */}
                  <div className="w-12 h-12 flex items-center justify-center mb-1">
                    {hobby.type === 'game' ? (
                      <img
                        src="/assets/minecraft-icon.webp"
                        alt={hobby.title}
                        className="w-10 h-10 object-contain drop-shadow-md select-none"
                      />
                    ) : hobby.type === 'image' ? (
                      <svg className="w-10 h-10 drop-shadow-md" viewBox="0 0 32 32" fill="none">
                        <rect x="3" y="3" width="26" height="26" rx="2" fill="#FFFFFF" stroke="#808080" strokeWidth="1" />
                        <rect x="5" y="5" width="22" height="22" fill="#3A82F6" />
                        <circle cx="10" cy="11" r="3" fill="#FDE047" />
                        <path d="M5 23L12 16L17 21L21 17L27 23V27H5V23Z" fill="#15803D" />
                      </svg>
                    ) : (
                      <svg className="w-10 h-10 drop-shadow-md" viewBox="0 0 32 32" fill="none">
                        <path d="M6 3H21L26 8V29H6V3Z" fill="#FFFFFF" stroke="#808080" strokeWidth="1" />
                        <path d="M21 3V8H26" fill="#D4D0C8" />
                        <path d="M9 12H23M9 16H23M9 20H23M9 24H18" stroke="#316AC5" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    )}
                  </div>

                  {/* File Title */}
                  <span
                    className={`text-xs break-all px-1 line-clamp-2 ${
                      isSelected ? 'text-white font-medium' : 'text-gray-900'
                    }`}
                  >
                    {hobby.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Explorer Bottom Status Bar */}
      <div
        data-testid="explorer-statusbar"
        className="flex items-center justify-between px-3 py-0.5 bg-[#ECE9D8] border-t border-[#ACA899] text-[11px] text-gray-700 shadow-[inset_0_1px_0_#FFF]"
      >
        <span>
          {selectedHobby ? '1 objeto selecionado' : `${HOBBIES_ITEMS.length} objeto(s)`}
        </span>
        <span>Meu Computador</span>
      </div>
    </div>
  );
};

export const ExplorerFolderApp: React.FC<ExplorerFolderAppProps> = ({
  id = 'hobbies-window',
  withFrame = true,
  isOpen,
  onClose,
  className = ''
}) => {
  if (!withFrame) {
    return <ExplorerFolderContent />;
  }

  return (
    <WindowFrame
      id={id}
      title="hobbies"
      icon="folder"
      isOpen={isOpen}
      onClose={onClose}
      className={className}
    >
      <ExplorerFolderContent />
    </WindowFrame>
  );
};

export default ExplorerFolderApp;
