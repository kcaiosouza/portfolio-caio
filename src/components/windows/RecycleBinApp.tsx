import React, { useState } from 'react';
import WindowFrame from './WindowFrame';
import { TRASH_ITEMS } from '../../utils/data';
import { soundEngine } from '../../utils/soundEffects';

export interface TrashItem {
  name: string;
  size: string;
  date: string;
}

export interface RecycleBinAppProps {
  id?: string;
  withFrame?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export const RecycleBinContent: React.FC = () => {
  const [items, setItems] = useState<TrashItem[]>(TRASH_ITEMS);
  const [selectedItemName, setSelectedItemName] = useState<string | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState<boolean>(false);

  const handleOpenConfirm = () => {
    if (items.length === 0) return;
    soundEngine.playClick();
    setShowConfirmDialog(true);
  };

  const handleConfirmEmpty = () => {
    soundEngine.playTrashEmpty();
    setItems([]);
    setSelectedItemName(null);
    setShowConfirmDialog(false);
  };

  const handleCancelConfirm = () => {
    soundEngine.playClick();
    setShowConfirmDialog(false);
  };

  const handleRestoreItems = () => {
    soundEngine.playClick();
    setItems(TRASH_ITEMS);
  };

  const getFileIcon = (name: string) => {
    if (name.endsWith('.exe')) {
      return (
        <svg className="w-4 h-4 text-blue-600 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
          <rect x="2" y="2" width="12" height="12" rx="1" fill="#4B6EAF" />
          <path d="M4 6H12M4 9H8" stroke="white" strokeWidth="1.2" />
        </svg>
      );
    }
    if (name.endsWith('.plugin')) {
      return (
        <svg className="w-4 h-4 text-red-600 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 2L10 6L14 6.5L11 9.5L12 14L8 11.5L4 14L5 9.5L2 6.5L6 6L8 2Z" fill="#D32F2F" />
        </svg>
      );
    }
    if (name.endsWith('.js')) {
      return (
        <svg className="w-4 h-4 text-yellow-500 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
          <rect x="2" y="2" width="12" height="12" rx="1" fill="#F7DF1E" />
          <path d="M6 11V7M10 11V7" stroke="#323330" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 text-gray-500 flex-shrink-0" viewBox="0 0 16 16" fill="currentColor">
        <path d="M3 2h7l3 3v9a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" fill="#E0E0E0" />
        <path d="M5 6h6M5 9h6M5 12h4" stroke="#616161" strokeWidth="1" strokeLinecap="round" />
      </svg>
    );
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 bg-white font-tahoma text-black select-none text-xs relative">
      {/* Top Toolbar */}
      <div className="bg-[#ECE9D8] border-b border-[#ACA899] p-1 flex items-center justify-between gap-2 shadow-xs">
        <div className="flex items-center gap-1">
          {/* Esvaziar a Lixeira Button */}
          <button
            type="button"
            data-testid="btn-empty-recycle-bin"
            title="Esvaziar a Lixeira"
            disabled={items.length === 0}
            onClick={handleOpenConfirm}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[2px] border text-xs font-semibold shadow-xs transition-colors ${
              items.length === 0
                ? 'opacity-50 cursor-not-allowed bg-[#ECE9D8] border-gray-300 text-gray-500'
                : 'bg-gradient-to-b from-white to-[#E1DECE] border-[#7F9DB9] hover:border-[#0058EE] active:bg-[#C2CEE8] text-gray-800'
            }`}
          >
            <svg className="w-3.5 h-3.5 text-blue-600" viewBox="0 0 16 16" fill="currentColor">
              <path d="M3 4H13L11.5 14H4.5L3 4Z" fill="#7598CE" />
              <path d="M2 3H14V4H2V3Z" fill="#254B8C" />
            </svg>
            <span>Esvaziar a Lixeira</span>
          </button>

          {items.length === 0 && (
            <button
              type="button"
              data-testid="btn-restore-items"
              onClick={handleRestoreItems}
              className="flex items-center gap-1.5 px-2 py-1 bg-gradient-to-b from-white to-[#E1DECE] border border-[#7F9DB9] rounded-[2px] hover:border-[#0058EE] text-gray-800"
            >
              <span>Restaurar Itens</span>
            </button>
          )}
        </div>

        {/* Address text */}
        <div className="text-[11px] text-gray-500 pr-2">
          Lixeira do Windows
        </div>
      </div>

      {/* Main Container: Sidebar + Details Table */}
      <div className="flex-1 flex min-h-0 bg-white">
        {/* Classic XP Left Sidebar */}
        <div
          data-testid="recycle-bin-sidebar"
          className="w-52 bg-gradient-to-b from-[#7BA2E7] via-[#6375D6] to-[#6375D6] p-2 flex flex-col gap-2.5 overflow-y-auto border-r border-[#002D96]"
        >
          {/* Section: Tarefas da Lixeira */}
          <div className="bg-white rounded-t-[4px] rounded-b-[2px] shadow-sm overflow-hidden border border-[#A7BCE8]">
            <div className="bg-gradient-to-r from-white via-[#D3E1FA] to-[#C0D5FA] px-2 py-1 border-b border-[#A7BCE8] flex items-center justify-between font-bold text-[#215DC6]">
              <span>Tarefas da Lixeira</span>
              <span className="w-3.5 h-3.5 rounded-full bg-[#215DC6] text-white text-[9px] flex items-center justify-center font-bold">
                ▲
              </span>
            </div>
            <div className="p-2 space-y-1.5 text-xs text-[#215DC6]">
              <div
                data-testid="sidebar-empty-link"
                className={`flex items-center gap-1.5 ${
                  items.length === 0
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:underline cursor-pointer'
                }`}
                onClick={() => {
                  if (items.length > 0) handleOpenConfirm();
                }}
              >
                <span>🗑️</span>
                <span>Esvaziar a Lixeira</span>
              </div>
              <div
                className="hover:underline cursor-pointer flex items-center gap-1.5"
                onClick={handleRestoreItems}
              >
                <span>♻️</span>
                <span>Restaurar todos os itens</span>
              </div>
            </div>
          </div>

          {/* Section: Outros Locais */}
          <div className="bg-white rounded-t-[4px] rounded-b-[2px] shadow-sm overflow-hidden border border-[#A7BCE8]">
            <div className="bg-gradient-to-r from-white via-[#D3E1FA] to-[#C0D5FA] px-2 py-1 border-b border-[#A7BCE8] flex items-center justify-between font-bold text-[#215DC6]">
              <span>Outros locais</span>
              <span className="w-3.5 h-3.5 rounded-full bg-[#215DC6] text-white text-[9px] flex items-center justify-center font-bold">
                ▲
              </span>
            </div>
            <div className="p-2 space-y-1.5 text-xs text-[#215DC6]">
              <div className="hover:underline cursor-pointer flex items-center gap-1.5">
                <span>🖥️</span>
                <span>Área de Trabalho</span>
              </div>
              <div className="hover:underline cursor-pointer flex items-center gap-1.5">
                <span>📁</span>
                <span>Meus Documentos</span>
              </div>
              <div className="hover:underline cursor-pointer flex items-center gap-1.5">
                <span>💻</span>
                <span>Meu Computador</span>
              </div>
            </div>
          </div>

          {/* Section: Detalhes */}
          <div className="bg-white rounded-t-[4px] rounded-b-[2px] shadow-sm overflow-hidden border border-[#A7BCE8]">
            <div className="bg-gradient-to-r from-white via-[#D3E1FA] to-[#C0D5FA] px-2 py-1 border-b border-[#A7BCE8] flex items-center justify-between font-bold text-[#215DC6]">
              <span>Detalhes</span>
              <span className="w-3.5 h-3.5 rounded-full bg-[#215DC6] text-white text-[9px] flex items-center justify-center font-bold">
                ▲
              </span>
            </div>
            <div className="p-2 text-xs text-gray-700">
              <div className="font-bold">Lixeira do Sistema</div>
              <div className="text-gray-500 mt-0.5">
                {items.length === 0 ? 'Pasta vazia' : `${items.length} item(ns) aguardando exclusão`}
              </div>
            </div>
          </div>
        </div>

        {/* Right Details Table */}
        <div
          data-testid="recycle-bin-table-container"
          className="flex-1 overflow-auto bg-white flex flex-col"
          onClick={() => setSelectedItemName(null)}
        >
          {items.length > 0 ? (
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-[#ECE9D8] sticky top-0 border-b border-[#ACA899] select-none text-gray-700">
                <tr>
                  <th className="py-1 px-2 font-semibold border-r border-[#ACA899] min-w-[200px]">Nome</th>
                  <th className="py-1 px-2 font-semibold border-r border-[#ACA899] min-w-[130px]">Local original</th>
                  <th className="py-1 px-2 font-semibold border-r border-[#ACA899] min-w-[110px]">Data de exclusão</th>
                  <th className="py-1 px-2 font-semibold min-w-[80px]">Tamanho</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => {
                  const isSelected = selectedItemName === item.name;

                  return (
                    <tr
                      key={item.name}
                      data-testid={`trash-item-${item.name}`}
                      onClick={e => {
                        e.stopPropagation();
                        soundEngine.playClick();
                        setSelectedItemName(item.name);
                      }}
                      className={`cursor-pointer ${
                        isSelected
                          ? 'bg-[#316AC5] text-white'
                          : 'hover:bg-[#E0E8F8] text-gray-900 even:bg-gray-50'
                      }`}
                    >
                      <td className="py-1 px-2 flex items-center gap-1.5 font-medium truncate">
                        {getFileIcon(item.name)}
                        <span className="truncate">{item.name}</span>
                      </td>
                      <td className={`py-1 px-2 ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                        C:\Windows\Recycle
                      </td>
                      <td className={`py-1 px-2 ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                        {item.date}
                      </td>
                      <td className={`py-1 px-2 ${isSelected ? 'text-blue-100' : 'text-gray-500'}`}>
                        {item.size}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <div
              data-testid="recycle-bin-empty-state"
              className="flex-1 flex flex-col items-center justify-center p-8 text-gray-500"
            >
              <svg className="w-16 h-16 text-gray-300 mb-3" viewBox="0 0 16 16" fill="currentColor">
                <path d="M3 4H13L11.5 14H4.5L3 4Z" fill="#D4D0C8" stroke="#808080" />
                <path d="M2 3H14V4H2V3Z" fill="#808080" />
                <path d="M6 1.5H10V3H6V1.5Z" fill="#808080" />
              </svg>
              <span className="font-semibold text-sm text-gray-700">A Lixeira está vazia.</span>
              <span className="text-xs text-gray-400 mt-1">Nenhum arquivo ou piada de dev foi excluído recentemente.</span>
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Dialog Modal */}
      {showConfirmDialog && (
        <div
          data-testid="confirm-empty-dialog"
          className="absolute inset-0 bg-black/40 z-50 flex items-center justify-center p-4 backdrop-blur-[1px]"
          onClick={handleCancelConfirm}
        >
          <div
            className="w-full max-w-md bg-[#ECE9D8] border-2 border-[#0058EE] rounded-t-[6px] rounded-b-[3px] shadow-2xl overflow-hidden flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Title Bar */}
            <div className="h-7 bg-gradient-to-r from-[#0058EE] to-[#0372FD] px-2 flex items-center justify-between text-white font-bold text-xs">
              <span>Confirmar Exclusão de Vários Arquivos</span>
              <button
                type="button"
                data-testid="btn-close-confirm-modal"
                onClick={handleCancelConfirm}
                className="w-5 h-5 flex items-center justify-center rounded-[2px] bg-[#E76C55] hover:bg-[#E81123] text-white"
              >
                ✕
              </button>
            </div>

            {/* Modal Body with Warning Icon */}
            <div className="p-4 flex items-start gap-3 bg-[#ECE9D8] text-gray-900 text-xs">
              <div className="w-9 h-9 flex-shrink-0 flex items-center justify-center">
                <svg className="w-8 h-8 text-yellow-500 drop-shadow-sm" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
                </svg>
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-gray-800">
                  Tem certeza de que deseja excluir permanentemente estes {items.length} itens?
                </p>
                <p className="text-gray-600 text-[11px]">
                  Após esvaziar a lixeira, os itens excluídos não poderão ser recuperados.
                </p>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="bg-[#ECE9D8] border-t border-[#ACA899] px-4 py-2.5 flex justify-end gap-2">
              <button
                type="button"
                data-testid="btn-confirm-yes"
                onClick={handleConfirmEmpty}
                className="px-5 py-1 bg-gradient-to-b from-white to-[#E1DECE] border border-[#7F9DB9] rounded-[2px] text-xs font-semibold hover:border-[#0058EE] active:bg-[#C2CEE8] focus:ring-1 focus:ring-[#0058EE]"
              >
                Sim
              </button>
              <button
                type="button"
                data-testid="btn-confirm-no"
                onClick={handleCancelConfirm}
                className="px-5 py-1 bg-gradient-to-b from-white to-[#E1DECE] border border-[#7F9DB9] rounded-[2px] text-xs font-semibold hover:border-[#0058EE] active:bg-[#C2CEE8]"
              >
                Não
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Recycle Bin Bottom Status Bar */}
      <div
        data-testid="recycle-bin-statusbar"
        className="flex items-center justify-between px-3 py-0.5 bg-[#ECE9D8] border-t border-[#ACA899] text-[11px] text-gray-700 shadow-[inset_0_1px_0_#FFF]"
      >
        <span>
          {selectedItemName ? '1 objeto selecionado' : `${items.length} objeto(s)`}
        </span>
        <span>Lixeira</span>
      </div>
    </div>
  );
};

export const RecycleBinApp: React.FC<RecycleBinAppProps> = ({
  id = 'recycle-bin-window',
  withFrame = true,
  isOpen,
  onClose,
  className = ''
}) => {
  if (!withFrame) {
    return <RecycleBinContent />;
  }

  return (
    <WindowFrame
      id={id}
      title="Lixeira"
      icon="trash"
      isOpen={isOpen}
      onClose={onClose}
      className={className}
    >
      <RecycleBinContent />
    </WindowFrame>
  );
};

export default RecycleBinApp;
