import React, { useState } from 'react';
import WindowFrame from '../WindowFrame';
import { useWindowManager } from '../../../context/WindowContext';
import { soundEngine } from '../../../utils/soundEffects';
import { DEFAULT_MSN_CONTACTS } from '../../../utils/msnEngine';
import { MsnContact, MsnStatus } from '../../../types/msn';
import { MsnDirectMessageModal } from './MsnDirectMessageModal';
import { Coffee, ChevronDown, ChevronRight, Search } from 'lucide-react';

export interface MsnContactListAppProps {
  id?: string;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export const MsnContactListApp: React.FC<MsnContactListAppProps> = ({
  id = 'msn-window',
  isOpen,
  onClose,
  className = '',
}) => {
  let openWindow: (winId: string) => void = () => {};
  try {
    const wm = useWindowManager();
    openWindow = wm.openWindow;
  } catch {
    // safe fallback if outside WindowProvider
  }

  const [contacts] = useState<MsnContact[]>(DEFAULT_MSN_CONTACTS);
  const [myStatus, setMyStatus] = useState<MsnStatus>('online');
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [personalMsg, setPersonalMsg] = useState('Ouvindo: Synthwave & Lofi | Desenvolvendo no Caio XP 🚀');
  const [isEditingMsg, setIsEditingMsg] = useState(false);
  const [isDirectModalOpen, setIsDirectModalOpen] = useState(false);

  // Group expansion
  const [isOnlineOpen, setIsOnlineOpen] = useState(true);
  const [isDirectOpen, setIsDirectOpen] = useState(true);
  const [isOfflineOpen, setIsOfflineOpen] = useState(true);

  const handleContactClick = (contact: MsnContact) => {
    soundEngine.playClick();
    if (contact.isDirectContact) {
      setIsDirectModalOpen(true);
      return;
    }
    soundEngine.playMsnOnline();
    openWindow('msn-chat-window');
  };

  const getStatusColor = (st: MsnStatus) => {
    switch (st) {
      case 'online': return 'bg-green-500';
      case 'busy': return 'bg-red-500';
      case 'away': return 'bg-yellow-500';
      case 'offline':
      default: return 'bg-gray-400';
    }
  };

  const getStatusLabel = (st: MsnStatus) => {
    switch (st) {
      case 'online': return 'Disponível';
      case 'busy': return 'Ocupado';
      case 'away': return 'Ausente';
      case 'offline': return 'Invisível';
    }
  };

  const onlineContacts = contacts.filter(c => c.group === 'online');
  const directContacts = contacts.filter(c => c.group === 'direct');
  const offlineContacts = contacts.filter(c => c.group === 'offline');

  return (
    <WindowFrame
      id={id}
      title="MSN Messenger"
      icon="msn"
      isOpen={isOpen}
      onClose={onClose}
      className={className}
      initialPosition={{ x: 80, y: 40, width: 300, height: 530 }}
    >
      <div className="flex flex-col flex-1 h-full min-h-0 bg-[#EBF3FD] font-tahoma text-black select-none text-xs relative">
        {/* User Card Header */}
        <div className="p-2.5 bg-gradient-to-b from-[#CADAF3] to-[#B9CDEB] border-b border-[#8CA5D3] flex items-center gap-2.5">
          <div className="relative">
            <div className="w-11 h-11 rounded bg-white border-2 border-white shadow flex items-center justify-center overflow-hidden">
              <Coffee className="w-7 h-7 text-[#6F4E37]" />
            </div>
            <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border border-white ${getStatusColor(myStatus)}`} />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#002D96] truncate">Dev Caio</span>
              <div className="relative">
                <button
                  type="button"
                  aria-label="status-selector"
                  onClick={() => setIsStatusMenuOpen(prev => !prev)}
                  className="flex items-center gap-1 px-1 py-0.5 rounded hover:bg-white/50 text-[10px] text-gray-700"
                >
                  <span className={`w-2 h-2 rounded-full ${getStatusColor(myStatus)}`} />
                  <span>({getStatusLabel(myStatus)})</span>
                  <ChevronDown className="w-2.5 h-2.5" />
                </button>

                {isStatusMenuOpen && (
                  <div className="absolute right-0 top-full mt-1 w-32 bg-white border border-[#7F9DB9] shadow-md py-1 z-50 text-xs">
                    {(['online', 'busy', 'away', 'offline'] as MsnStatus[]).map(st => (
                      <button
                        key={st}
                        type="button"
                        onClick={() => {
                          setMyStatus(st);
                          setIsStatusMenuOpen(false);
                        }}
                        className="w-full text-left px-3 py-1 hover:bg-[#316AC5] hover:text-white flex items-center gap-2 text-xs"
                      >
                        <span className={`w-2 h-2 rounded-full ${getStatusColor(st)}`} />
                        <span>{getStatusLabel(st)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {isEditingMsg ? (
              <input
                type="text"
                value={personalMsg}
                onChange={e => setPersonalMsg(e.target.value)}
                onBlur={() => setIsEditingMsg(false)}
                onKeyDown={e => e.key === 'Enter' && setIsEditingMsg(false)}
                autoFocus
                className="w-full text-[10px] px-1 bg-white border border-blue-400 outline-none rounded-xs"
              />
            ) : (
              <div
                onClick={() => setIsEditingMsg(true)}
                className="text-[10px] text-gray-600 truncate cursor-pointer hover:underline mt-0.5"
                title="Clique para editar frase de status"
              >
                &lt;{personalMsg}&gt;
              </div>
            )}
          </div>
        </div>

        {/* Quick Search Bar */}
        <div className="px-2 py-1 bg-white border-b border-[#CADAF3] flex items-center gap-1.5 text-gray-400">
          <Search className="w-3.5 h-3.5 text-gray-400" />
          <span className="text-[11px] text-gray-400">Pesquisar contatos...</span>
        </div>

        {/* Contacts Tree List */}
        <div className="flex-1 p-2 overflow-y-auto bg-white space-y-2">
          {/* Online Group */}
          <div>
            <button
              type="button"
              onClick={() => setIsOnlineOpen(prev => !prev)}
              className="flex items-center gap-1 text-[11px] font-bold text-[#002D96] w-full text-left py-0.5"
            >
              {isOnlineOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              <span>Disponíveis ({onlineContacts.length})</span>
            </button>

            {isOnlineOpen && (
              <div className="pl-4 space-y-1 mt-1">
                {onlineContacts.map(c => (
                  <div
                    key={c.id}
                    onDoubleClick={() => handleContactClick(c)}
                    className="flex items-start gap-1.5 p-1 rounded hover:bg-[#CADAF3] cursor-pointer"
                  >
                    <span className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${getStatusColor(c.status)}`} />
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-gray-900 leading-tight truncate">{c.name}</div>
                      <div className="text-[10px] text-gray-500 truncate">{c.personalMessage}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Direct Message Group [Em Breve] */}
          <div>
            <button
              type="button"
              onClick={() => setIsDirectOpen(prev => !prev)}
              className="flex items-center gap-1 text-[11px] font-bold text-purple-900 w-full text-left py-0.5"
            >
              {isDirectOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              <span>Falar com o Caio Real ({directContacts.length})</span>
            </button>

            {isDirectOpen && (
              <div className="pl-4 space-y-1 mt-1">
                {directContacts.map(c => (
                  <div
                    key={c.id}
                    onDoubleClick={() => handleContactClick(c)}
                    className="flex items-start gap-1.5 p-1 rounded hover:bg-purple-100 cursor-pointer border border-dashed border-purple-300"
                  >
                    <span className="text-xs">✉️</span>
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-purple-950 leading-tight truncate">{c.name}</div>
                      <div className="text-[10px] text-purple-700 truncate">{c.personalMessage}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Offline Group */}
          <div>
            <button
              type="button"
              onClick={() => setIsOfflineOpen(prev => !prev)}
              className="flex items-center gap-1 text-[11px] font-bold text-gray-500 w-full text-left py-0.5"
            >
              {isOfflineOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              <span>Offline ({offlineContacts.length})</span>
            </button>

            {isOfflineOpen && (
              <div className="pl-4 space-y-1 mt-1 opacity-70">
                {offlineContacts.map(c => (
                  <div
                    key={c.id}
                    className="flex items-start gap-1.5 p-1 rounded hover:bg-gray-100 cursor-default"
                  >
                    <span className="w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 bg-gray-400" />
                    <div className="min-w-0">
                      <div className="font-bold text-xs text-gray-700 leading-tight truncate">{c.name}</div>
                      <div className="text-[10px] text-gray-500 truncate">{c.personalMessage}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Status bar */}
        <div className="p-1.5 bg-[#ECE9D8] border-t border-[#A0B8E0] text-[10px] text-gray-600 flex items-center justify-between">
          <span>MSN Messenger 7.5</span>
          <span>{onlineContacts.length} contatos online</span>
        </div>

        {/* Modal Direto */}
        <MsnDirectMessageModal
          isOpen={isDirectModalOpen}
          onClose={() => setIsDirectModalOpen(false)}
        />
      </div>
    </WindowFrame>
  );
};

export default MsnContactListApp;
