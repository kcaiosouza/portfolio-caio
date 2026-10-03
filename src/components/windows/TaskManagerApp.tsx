import React, { useState, useEffect, useMemo, useRef } from 'react';
import WindowFrame from './WindowFrame';
import { useWindowManager } from '../../context/WindowContext';
import { useSystem } from '../../context/SystemContext';

export interface TaskManagerAppProps {
  id?: string;
  withFrame?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

type TabType = 'applications' | 'processes' | 'performance';

interface ProcessItem {
  id: string;
  name: string;
  pid: number;
  cpu: number;
  memory: string;
  memoryKb: number;
  user: string;
  windowId?: string;
}

// Helper to render mini icons for task list
const renderTaskIcon = (icon: string) => {
  switch (icon) {
    case 'notepad':
      return (
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="1" width="12" height="14" rx="1" fill="#FFFFFF" stroke="#003399" strokeWidth="1" />
          <path d="M4 4H12M4 7H12M4 10H9" stroke="#3366CC" strokeWidth="1" strokeLinecap="round" />
          <rect x="2" y="1" width="3" height="14" fill="#0058EE" />
        </svg>
      );
    case 'pdf':
      return (
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="1" width="12" height="14" rx="1.5" fill="#E22424" />
          <path d="M4 12V4H8C9.5 4 10.5 5 10.5 6.5C10.5 8 9.5 9 8 9H6V12H4Z" fill="#FFFFFF" />
          <circle cx="11" cy="11.5" r="1.5" fill="#FFFFFF" />
        </svg>
      );
    case 'trash':
      return (
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none">
          <path d="M3 4H13L11.5 14H4.5L3 4Z" fill="#7598CE" stroke="#254B8C" strokeWidth="1" />
          <path d="M2 3H14V4.5H2V3Z" fill="#A5C4F5" stroke="#254B8C" strokeWidth="0.8" />
          <path d="M6 1.5H10V3H6V1.5Z" fill="#254B8C" />
          <path d="M6 6V11M8 6V11M10 6V11" stroke="#FFFFFF" strokeWidth="1" strokeLinecap="round" />
        </svg>
      );
    case 'smartphone':
      return (
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none">
          <rect x="3.5" y="1" width="9" height="14" rx="2" fill="#2E2E38" stroke="#1A1A24" strokeWidth="1" />
          <rect x="5" y="3" width="6" height="9" rx="0.5" fill="#60A5FA" />
          <circle cx="8" cy="13.2" r="0.8" fill="#FFFFFF" />
        </svg>
      );
    case 'image':
      return (
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none">
          <rect x="2" y="2" width="12" height="12" rx="1.5" fill="#3B82F6" stroke="#2563EB" strokeWidth="0.8" />
          <circle cx="5.5" cy="5.5" r="1.5" fill="#FDE047" />
          <path d="M2.5 12L6 8L8.5 10.5L10.5 8.5L13.5 12H2.5Z" fill="#16A34A" />
        </svg>
      );
    case 'taskmgr':
      return (
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none">
          <rect x="1" y="2" width="14" height="10" rx="1" fill="#000000" stroke="#7A96DF" strokeWidth="0.8" />
          <rect x="2" y="3" width="12" height="8" fill="#001100" />
          <path d="M2 7H4L5 4L7 9L9 6L11 8H14" stroke="#00FF00" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case 'folder':
    default:
      return (
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none">
          <path d="M1 3.5C1 2.67 1.67 2 2.5 2H6.2L7.7 3.5H13.5C14.33 3.5 15 4.17 15 5V12.5C15 13.33 14.33 14 13.5 14H2.5C1.67 14 1 13.33 1 12.5V3.5Z" fill="#FFC933" stroke="#C48E00" strokeWidth="0.8" />
          <path d="M1 6H15V12.5C15 13.33 14.33 14 13.5 14H2.5C1.67 14 1 13.33 1 12.5V6Z" fill="#FFE066" />
        </svg>
      );
  }
};

export const TaskManagerContent: React.FC<{ parentId?: string }> = ({ parentId = 'task-manager-window' }) => {
  const { windows, closeWindow, focusWindow, openWindow } = useWindowManager();
  const { setScreenMode } = useSystem();
  const [activeTab, setActiveTab] = useState<TabType>('applications');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [selectedProcessPid, setSelectedProcessPid] = useState<number | null>(null);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [showRunDialog, setShowRunDialog] = useState(false);
  const [runInput, setRunInput] = useState('');

  // Performance simulation state
  const [cpuPercent, setCpuPercent] = useState<number>(4);
  const [memMb, setMemMb] = useState<number>(208);
  const [cpuHistory, setCpuHistory] = useState<number[]>(() => [
    4, 6, 8, 4, 3, 5, 12, 18, 9, 6, 4, 3, 5, 8, 6, 4, 3, 4, 6, 8, 5, 4, 3, 5, 7, 4, 3, 4, 5, 4
  ]);
  const [memHistory, setMemHistory] = useState<number[]>(() => [
    200, 202, 202, 204, 205, 205, 207, 208, 208, 208, 209, 210, 208, 208, 207, 207, 206, 208, 208, 209, 210, 208, 208, 208, 207, 208, 208, 208, 208, 208
  ]);

  // Real-time animation interval
  useEffect(() => {
    const isTest =
      (typeof import.meta !== 'undefined' && Boolean((import.meta as any).env?.MODE === 'test')) ||
      (typeof globalThis !== 'undefined' && Boolean((globalThis as any).process?.env?.NODE_ENV === 'test'));
    if (isTest) {
      return;
    }

    const timer = setInterval(() => {
      // Simulate natural fluctuating CPU between 2% and 15% with occasional small peaks
      const nextCpu = Math.floor(Math.random() * 8) + (Math.random() > 0.85 ? 12 : 2);
      const nextMem = Math.floor(Math.random() * 6) + 205;

      setCpuPercent(nextCpu);
      setMemMb(nextMem);

      setCpuHistory(prev => {
        const next = [...prev.slice(1), nextCpu];
        return next;
      });

      setMemHistory(prev => {
        const next = [...prev.slice(1), nextMem];
        return next;
      });
    }, 1200);

    return () => clearInterval(timer);
  }, []);

  // Filter open windows excluding this task manager window
  const activeTasks = useMemo(() => {
    return windows.filter(w => w.isOpen && w.id !== parentId);
  }, [windows, parentId]);

  // Keep selectedTaskId valid if activeTasks change
  useEffect(() => {
    if (selectedTaskId && !activeTasks.some(t => t.id === selectedTaskId)) {
      setSelectedTaskId(null);
    }
  }, [activeTasks, selectedTaskId]);

  // Calculate dynamic processes
  const processes: ProcessItem[] = useMemo(() => {
    const base: ProcessItem[] = [
      { id: 'sys', name: 'System', pid: 4, cpu: 0, memory: '220 K', memoryKb: 220, user: 'SYSTEM' },
      { id: 'smss', name: 'smss.exe', pid: 544, cpu: 0, memory: '412 K', memoryKb: 412, user: 'SYSTEM' },
      { id: 'csrss', name: 'csrss.exe', pid: 612, cpu: 0, memory: '3.420 K', memoryKb: 3420, user: 'SYSTEM' },
      { id: 'winlogon', name: 'winlogon.exe', pid: 636, cpu: 0, memory: '2.180 K', memoryKb: 2180, user: 'SYSTEM' },
      { id: 'services', name: 'services.exe', pid: 680, cpu: 0, memory: '3.910 K', memoryKb: 3910, user: 'SYSTEM' },
      { id: 'lsass', name: 'lsass.exe', pid: 692, cpu: 0, memory: '1.850 K', memoryKb: 1850, user: 'SYSTEM' },
      { id: 'svchost-net', name: 'svchost.exe', pid: 884, cpu: 0, memory: '14.320 K', memoryKb: 14320, user: 'SYSTEM' },
      { id: 'svchost-sys', name: 'svchost.exe', pid: 948, cpu: 0, memory: '4.890 K', memoryKb: 4890, user: 'SERVIÇO DE REDE' },
      { id: 'explorer', name: 'explorer.exe', pid: 1420, cpu: 0, memory: '18.240 K', memoryKb: 18240, user: 'Caio Souza' },
      { id: 'taskmgr', name: 'taskmgr.exe', pid: 2184, cpu: cpuPercent, memory: '4.120 K', memoryKb: 4120, user: 'Caio Souza', windowId: parentId },
      { id: 'puppy', name: 'puppy.exe', pid: 3052, cpu: 0, memory: '8.450 K', memoryKb: 8450, user: 'Caio Souza' }
    ];

    // Dynamic processes for currently open windows
    windows.forEach(w => {
      if (!w.isOpen) return;

      if (w.id === 'about-window' || w.id === 'notepad-blank-window' || w.id === 'hobby-open-source-window') {
        if (!base.some(p => p.name === 'notepad.exe')) {
          base.push({
            id: `proc-${w.id}`,
            name: 'notepad.exe',
            pid: 2840,
            cpu: 0,
            memory: '5.240 K',
            memoryKb: 5240,
            user: 'Caio Souza',
            windowId: w.id
          });
        }
      } else if (w.id === 'cv-window') {
        base.push({
          id: `proc-${w.id}`,
          name: 'acrobt32.exe',
          pid: 3144,
          cpu: 0,
          memory: '15.680 K',
          memoryKb: 15680,
          user: 'Caio Souza',
          windowId: w.id
        });
      } else if (w.id === 'minesweeper-window') {
        base.push({
          id: `proc-${w.id}`,
          name: 'winmine.exe',
          pid: 1892,
          cpu: 0,
          memory: '3.200 K',
          memoryKb: 3200,
          user: 'Caio Souza',
          windowId: w.id
        });
      } else if (w.id === 'browser-window') {
        base.push({
          id: `proc-${w.id}`,
          name: 'iexplore.exe',
          pid: 4012,
          cpu: 1,
          memory: '24.890 K',
          memoryKb: 24890,
          user: 'Caio Souza',
          windowId: w.id
        });
      } else if (w.id === 'mobile-app-window') {
        base.push({
          id: `proc-${w.id}`,
          name: 'hinario.exe',
          pid: 4516,
          cpu: 1,
          memory: '19.500 K',
          memoryKb: 19500,
          user: 'Caio Souza',
          windowId: w.id
        });
      } else if (w.id === 'image-viewer-window') {
        base.push({
          id: `proc-${w.id}`,
          name: 'shimgvw.dll',
          pid: 2650,
          cpu: 0,
          memory: '7.120 K',
          memoryKb: 7120,
          user: 'Caio Souza',
          windowId: w.id
        });
      } else if (w.id === 'msn-window' || w.id === 'msn-chat-window') {
        if (!base.some(p => p.name === 'msnmsgr.exe')) {
          base.push({
            id: `proc-${w.id}`,
            name: 'msnmsgr.exe',
            pid: 3280,
            cpu: 1,
            memory: '11.840 K',
            memoryKb: 11840,
            user: 'Caio Souza',
            windowId: w.id
          });
        }
      } else if (w.id === 'winamp-window') {
        if (!base.some(p => p.name === 'winamp.exe')) {
          base.push({
            id: `proc-${w.id}`,
            name: 'winamp.exe',
            pid: 4120,
            cpu: 2,
            memory: '14.220 K',
            memoryKb: 14220,
            user: 'Caio Souza',
            windowId: w.id
          });
        }
      }
    });

    return base;
  }, [windows, parentId, cpuPercent]);

  // Terminate Task Handler
  const handleEndTask = () => {
    if (selectedTaskId) {
      closeWindow(selectedTaskId);
      setSelectedTaskId(null);
    }
  };

  // Switch to Task Handler
  const handleSwitchTo = () => {
    if (selectedTaskId) {
      focusWindow(selectedTaskId);
    }
  };

  // End Process Handler
  const handleEndProcess = () => {
    if (!selectedProcessPid) return;
    const proc = processes.find(p => p.pid === selectedProcessPid);
    if (!proc) return;

    if (proc.name === 'System' || proc.pid === 4) {
      setScreenMode('bsod');
      return;
    }

    if (proc.windowId) {
      closeWindow(proc.windowId);
      setSelectedProcessPid(null);
    } else if (proc.name === 'explorer.exe' || proc.user === 'SYSTEM') {
      alert(`O processo "${proc.name}" é um processo crítico do sistema e não pode ser finalizado.`);
    }
  };

  // Run new task handler
  const handleRunSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = runInput.trim().toLowerCase();
    if (!cmd) return;

    if (cmd.includes('notepad') || cmd.includes('bloco')) {
      openWindow('notepad-blank-window');
    } else if (cmd.includes('mine') || cmd.includes('campo')) {
      openWindow('minesweeper-window');
    } else if (cmd.includes('taskmgr') || cmd.includes('gerenciador')) {
      openWindow('task-manager-window');
    } else if (cmd.includes('cv') || cmd.includes('curriculo') || cmd.includes('pdf')) {
      openWindow('cv-window');
    } else if (cmd.includes('sobre') || cmd.includes('caio')) {
      openWindow('about-window');
    } else if (cmd.includes('browser') || cmd.includes('internet') || cmd.includes('explorer')) {
      openWindow('browser-window');
    } else if (cmd.includes('hinario') || cmd.includes('mobile')) {
      openWindow('mobile-app-window');
    } else {
      openWindow('notepad-blank-window');
    }

    setShowRunDialog(false);
    setRunInput('');
  };

  return (
    <div
      className="flex flex-col h-full bg-[#ECE9D8] select-none text-[11px] font-sans text-black relative"
      onClick={() => setActiveMenu(null)}
    >
      {/* Top Classic Menu Bar */}
      <div className="flex items-center px-1 py-0.5 border-b border-[#D8D4C8] bg-[#ECE9D8] text-[11px] relative z-20">
        {/* Arquivo Menu */}
        <div className="relative">
          <button
            type="button"
            className={`px-2 py-0.5 rounded-sm hover:bg-[#316AC5] hover:text-white ${
              activeMenu === 'arquivo' ? 'bg-[#316AC5] text-white' : ''
            }`}
            onClick={e => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'arquivo' ? null : 'arquivo');
            }}
          >
            Arquivo
          </button>
          {activeMenu === 'arquivo' && (
            <div className="absolute top-full left-0 mt-0.5 bg-[#FFFFFF] border border-[#7F9DB9] shadow-md py-1 min-w-[170px] z-50 text-black">
              <button
                type="button"
                className="w-full text-left px-4 py-1 hover:bg-[#316AC5] hover:text-white"
                onClick={() => {
                  setShowRunDialog(true);
                  setActiveMenu(null);
                }}
              >
                Nova tarefa (Executar...)
              </button>
              <div className="border-t border-[#D8D4C8] my-1" />
              <button
                type="button"
                className="w-full text-left px-4 py-1 hover:bg-[#316AC5] hover:text-white"
                onClick={() => {
                  closeWindow(parentId);
                  setActiveMenu(null);
                }}
              >
                Sair do Gerenciador de tarefas
              </button>
            </div>
          )}
        </div>

        {/* Opções Menu */}
        <div className="relative">
          <button
            type="button"
            className={`px-2 py-0.5 rounded-sm hover:bg-[#316AC5] hover:text-white ${
              activeMenu === 'opcoes' ? 'bg-[#316AC5] text-white' : ''
            }`}
            onClick={e => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'opcoes' ? null : 'opcoes');
            }}
          >
            Opções
          </button>
          {activeMenu === 'opcoes' && (
            <div className="absolute top-full left-0 mt-0.5 bg-[#FFFFFF] border border-[#7F9DB9] shadow-md py-1 min-w-[170px] z-50 text-black">
              <div className="px-4 py-1 flex items-center justify-between text-[#888888]">
                <span>✓ Sempre visível</span>
              </div>
              <div className="px-4 py-1 text-[#888888]">Minimizar ao usar</div>
              <div className="px-4 py-1 text-[#888888]">Ocultar quando minimizado</div>
            </div>
          )}
        </div>

        {/* Exibir Menu */}
        <div className="relative">
          <button
            type="button"
            className={`px-2 py-0.5 rounded-sm hover:bg-[#316AC5] hover:text-white ${
              activeMenu === 'exibir' ? 'bg-[#316AC5] text-white' : ''
            }`}
            onClick={e => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'exibir' ? null : 'exibir');
            }}
          >
            Exibir
          </button>
          {activeMenu === 'exibir' && (
            <div className="absolute top-full left-0 mt-0.5 bg-[#FFFFFF] border border-[#7F9DB9] shadow-md py-1 min-w-[170px] z-50 text-black">
              <div className="px-4 py-1 hover:bg-[#316AC5] hover:text-white cursor-pointer" onClick={() => setActiveMenu(null)}>
                Atualizar agora
              </div>
              <div className="border-t border-[#D8D4C8] my-1" />
              <div className="px-4 py-1 text-[#888888]">Velocidade de atualização ▶</div>
            </div>
          )}
        </div>

        {/* Ajuda Menu */}
        <div className="relative">
          <button
            type="button"
            className={`px-2 py-0.5 rounded-sm hover:bg-[#316AC5] hover:text-white ${
              activeMenu === 'ajuda' ? 'bg-[#316AC5] text-white' : ''
            }`}
            onClick={e => {
              e.stopPropagation();
              setActiveMenu(activeMenu === 'ajuda' ? null : 'ajuda');
            }}
          >
            Ajuda
          </button>
          {activeMenu === 'ajuda' && (
            <div className="absolute top-full left-0 mt-0.5 bg-[#FFFFFF] border border-[#7F9DB9] shadow-md py-1 min-w-[200px] z-50 text-black">
              <div className="px-4 py-1 hover:bg-[#316AC5] hover:text-white cursor-pointer" onClick={() => setActiveMenu(null)}>
                Tópicos da Ajuda do Gerenciador de Tarefas
              </div>
              <div className="border-t border-[#D8D4C8] my-1" />
              <div
                className="px-4 py-1 hover:bg-[#316AC5] hover:text-white cursor-pointer"
                onClick={() => {
                  alert('Gerenciador de Tarefas do Windows XP\nVersão 5.1 (Compilação 2600.xpsp_sp3)\nPortfolio Caio Souza');
                  setActiveMenu(null);
                }}
              >
                Sobre o Gerenciador de tarefas
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Container */}
      <div className="flex-1 flex flex-col p-2.5 pt-1.5 overflow-hidden">
        {/* Tab Headers */}
        <div role="tablist" className="flex items-end pl-1 space-x-0.5 relative z-10 -mb-[1px]">
          <button
            role="tab"
            aria-selected={activeTab === 'applications'}
            className={`px-3 py-1 text-xs border border-[#919B9C] rounded-t-[3px] transition-none ${
              activeTab === 'applications'
                ? 'bg-[#ECE9D8] font-bold border-b-transparent pt-1.5 pb-1 z-20 shadow-[inset_1px_1px_0px_#FFFFFF]'
                : 'bg-[#DCD8C8] text-[#555555] hover:text-black border-b-[#919B9C]'
            }`}
            onClick={() => setActiveTab('applications')}
          >
            Aplicativos
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'processes'}
            className={`px-3 py-1 text-xs border border-[#919B9C] rounded-t-[3px] transition-none ${
              activeTab === 'processes'
                ? 'bg-[#ECE9D8] font-bold border-b-transparent pt-1.5 pb-1 z-20 shadow-[inset_1px_1px_0px_#FFFFFF]'
                : 'bg-[#DCD8C8] text-[#555555] hover:text-black border-b-[#919B9C]'
            }`}
            onClick={() => setActiveTab('processes')}
          >
            Processos
          </button>

          <button
            role="tab"
            aria-selected={activeTab === 'performance'}
            className={`px-3 py-1 text-xs border border-[#919B9C] rounded-t-[3px] transition-none ${
              activeTab === 'performance'
                ? 'bg-[#ECE9D8] font-bold border-b-transparent pt-1.5 pb-1 z-20 shadow-[inset_1px_1px_0px_#FFFFFF]'
                : 'bg-[#DCD8C8] text-[#555555] hover:text-black border-b-[#919B9C]'
            }`}
            onClick={() => setActiveTab('performance')}
          >
            Desempenho
          </button>
        </div>

        {/* Tab Body Box */}
        <div className="flex-1 flex flex-col bg-[#ECE9D8] border border-[#919B9C] p-2 rounded-b-[2px] rounded-tr-[2px] overflow-hidden shadow-[inset_1px_1px_0px_#FFFFFF]">
          {/* TAB 1: APLICATIVOS */}
          {activeTab === 'applications' && (
            <div role="tabpanel" className="flex-1 flex flex-col justify-between overflow-hidden">
              {/* Task Table Container */}
              <div className="flex-1 flex flex-col bg-[#FFFFFF] border-2 border-t-[#7A98B0] border-l-[#7A98B0] border-b-[#D8E4F8] border-r-[#D8E4F8] overflow-y-auto mb-2">
                <table data-testid="task-list-table" className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#ECE9D8] text-[#000000] border-b border-[#D8D4C8] sticky top-0 z-10">
                      <th className="py-1 px-2 border-r border-[#D8D4C8] font-normal shadow-[inset_1px_1px_0px_#FFFFFF]">
                        Tarefa
                      </th>
                      <th className="py-1 px-2 w-28 font-normal shadow-[inset_1px_1px_0px_#FFFFFF]">
                        Status
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {activeTasks.length === 0 ? (
                      <tr>
                        <td colSpan={2} className="py-4 text-center text-[#888888] italic">
                          Nenhum aplicativo aberto no momento.
                        </td>
                      </tr>
                    ) : (
                      activeTasks.map(task => {
                        const isSelected = selectedTaskId === task.id;
                        return (
                          <tr
                            key={task.id}
                            className={`cursor-pointer ${
                              isSelected ? 'bg-[#0A246A] text-white' : 'hover:bg-[#F0F0F0] text-black'
                            }`}
                            onClick={() => setSelectedTaskId(task.id)}
                            onDoubleClick={() => focusWindow(task.id)}
                          >
                            <td className="py-1 px-2 flex items-center space-x-2">
                              {renderTaskIcon(task.icon)}
                              <span className="truncate">{task.title}</span>
                            </td>
                            <td className="py-1 px-2 text-xs">
                              Executando
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Bottom Task Action Buttons */}
              <div className="flex items-center justify-end space-x-2 pt-1">
                <button
                  type="button"
                  disabled={!selectedTaskId}
                  onClick={handleEndTask}
                  className="px-3 py-1 text-xs border border-[#003C74] bg-gradient-to-b from-[#FFFFFF] via-[#ECE9D8] to-[#D8D4C8] text-black rounded-[3px] hover:border-[#F2A000] active:from-[#D8D4C8] active:to-[#ECE9D8] disabled:border-[#A0A0A0] disabled:text-[#888888] disabled:from-[#EAEAEA] disabled:to-[#EAEAEA] shadow-sm"
                >
                  Finalizar tarefa
                </button>

                <button
                  type="button"
                  disabled={!selectedTaskId}
                  onClick={handleSwitchTo}
                  className="px-3 py-1 text-xs border border-[#003C74] bg-gradient-to-b from-[#FFFFFF] via-[#ECE9D8] to-[#D8D4C8] text-black rounded-[3px] hover:border-[#F2A000] active:from-[#D8D4C8] active:to-[#ECE9D8] disabled:border-[#A0A0A0] disabled:text-[#888888] disabled:from-[#EAEAEA] disabled:to-[#EAEAEA] shadow-sm"
                >
                  Alternar para
                </button>

                <button
                  type="button"
                  onClick={() => setShowRunDialog(true)}
                  className="px-3 py-1 text-xs border border-[#003C74] bg-gradient-to-b from-[#FFFFFF] via-[#ECE9D8] to-[#D8D4C8] text-black rounded-[3px] hover:border-[#F2A000] active:from-[#D8D4C8] active:to-[#ECE9D8] shadow-sm"
                >
                  Nova tarefa...
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PROCESSOS */}
          {activeTab === 'processes' && (
            <div role="tabpanel" className="flex-1 flex flex-col justify-between overflow-hidden">
              {/* Process Table Container */}
              <div className="flex-1 flex flex-col bg-[#FFFFFF] border-2 border-t-[#7A98B0] border-l-[#7A98B0] border-b-[#D8E4F8] border-r-[#D8E4F8] overflow-y-auto mb-2">
                <table data-testid="process-list-table" className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#ECE9D8] text-[#000000] border-b border-[#D8D4C8] sticky top-0 z-10">
                      <th className="py-1 px-2 border-r border-[#D8D4C8] font-normal shadow-[inset_1px_1px_0px_#FFFFFF]">
                        Nome da imagem
                      </th>
                      <th className="py-1 px-2 border-r border-[#D8D4C8] font-normal w-14 text-right shadow-[inset_1px_1px_0px_#FFFFFF]">
                        PID
                      </th>
                      <th className="py-1 px-2 border-r border-[#D8D4C8] font-normal w-12 text-right shadow-[inset_1px_1px_0px_#FFFFFF]">
                        CPU
                      </th>
                      <th className="py-1 px-2 font-normal w-24 text-right shadow-[inset_1px_1px_0px_#FFFFFF]">
                        Uso de memória
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {processes.map(proc => {
                      const isSelected = selectedProcessPid === proc.pid;
                      return (
                        <tr
                          key={proc.id}
                          className={`cursor-pointer font-mono ${
                            isSelected ? 'bg-[#0A246A] text-white' : 'hover:bg-[#F0F0F0] text-black'
                          }`}
                          onClick={() => setSelectedProcessPid(proc.pid)}
                        >
                          <td className="py-0.5 px-2 font-sans truncate">{proc.name}</td>
                          <td className="py-0.5 px-2 text-right">{proc.pid}</td>
                          <td className="py-0.5 px-2 text-right">
                            {String(proc.cpu).padStart(2, '0')}
                          </td>
                          <td className="py-0.5 px-2 text-right">{proc.memory}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bottom Process Options and Button */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-1.5 text-xs cursor-pointer">
                  <input type="checkbox" defaultChecked className="rounded-none text-[#0055EA]" />
                  <span>Mostrar processos de todos os usuários</span>
                </label>

                <button
                  type="button"
                  disabled={!selectedProcessPid}
                  onClick={handleEndProcess}
                  className="px-3 py-1 text-xs border border-[#003C74] bg-gradient-to-b from-[#FFFFFF] via-[#ECE9D8] to-[#D8D4C8] text-black rounded-[3px] hover:border-[#F2A000] active:from-[#D8D4C8] active:to-[#ECE9D8] disabled:border-[#A0A0A0] disabled:text-[#888888] disabled:from-[#EAEAEA] disabled:to-[#EAEAEA] shadow-sm"
                >
                  Finalizar processo
                </button>
              </div>
            </div>
          )}

          {/* TAB 3: DESEMPENHO */}
          {activeTab === 'performance' && (
            <div role="tabpanel" className="flex-1 flex flex-col space-y-2 overflow-y-auto pr-1">
              {/* Top Row: CPU Usage & CPU History */}
              <div className="flex space-x-2">
                {/* Left: CPU Gauge */}
                <div className="w-24 border border-[#7F9DB9] rounded-[2px] p-1.5 flex flex-col items-center bg-[#ECE9D8]">
                  <span className="text-[11px] font-bold text-center mb-1">Uso de CPU</span>
                  <div className="w-10 h-28 bg-[#001100] border border-[#003300] relative flex flex-col justify-end p-0.5">
                    {/* Segmented green bar */}
                    <div
                      className="w-full bg-[#00FF00] transition-all duration-300"
                      style={{ height: `${Math.min(100, Math.max(0, cpuPercent))}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold mt-1 text-[#003399]">
                    {cpuPercent} %
                  </span>
                </div>

                {/* Right: CPU History CRT Oscilloscope */}
                <div className="flex-1 border border-[#7F9DB9] rounded-[2px] p-1.5 flex flex-col bg-[#ECE9D8]">
                  <span className="text-[11px] font-bold mb-1">Histórico do uso de CPU</span>
                  <div
                    data-testid="cpu-oscilloscope"
                    className="flex-1 h-28 bg-[#001100] border-2 border-t-[#000000] border-l-[#000000] border-b-[#003300] border-r-[#003300] relative overflow-hidden"
                  >
                    {/* CRT Grid */}
                    <svg className="w-full h-full" preserveAspectRatio="none">
                      <defs>
                        <pattern id="cpu-grid" width="12" height="12" patternUnits="userSpaceOnUse">
                          <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#003300" strokeWidth="0.8" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#cpu-grid)" />

                      {/* Neon Green Waveform Trace */}
                      <polyline
                        fill="none"
                        stroke="#00FF00"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={cpuHistory
                          .map((val, idx) => {
                            const x = (idx / (cpuHistory.length - 1)) * 320;
                            // val is between 0 and 100, inverted for SVG y (0 at top, 100 at bottom)
                            const y = 110 - (val / 100) * 100;
                            return `${x},${y}`;
                          })
                          .join(' ')}
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Middle Row: Memory Usage & Memory History */}
              <div className="flex space-x-2">
                {/* Left: Memory Gauge */}
                <div className="w-24 border border-[#7F9DB9] rounded-[2px] p-1.5 flex flex-col items-center bg-[#ECE9D8]">
                  <span className="text-[11px] font-bold text-center mb-1">Uso de PF</span>
                  <div className="w-10 h-28 bg-[#001100] border border-[#003300] relative flex flex-col justify-end p-0.5">
                    {/* Segmented green bar for memory */}
                    <div
                      className="w-full bg-[#00FF00] transition-all duration-300"
                      style={{ height: `${Math.min(100, Math.max(0, (memMb / 512) * 100))}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono font-bold mt-1 text-[#003399]">
                    {memMb} MB
                  </span>
                </div>

                {/* Right: Memory History CRT Oscilloscope */}
                <div className="flex-1 border border-[#7F9DB9] rounded-[2px] p-1.5 flex flex-col bg-[#ECE9D8]">
                  <span className="text-[11px] font-bold mb-1">Histórico do uso de memória</span>
                  <div
                    data-testid="memory-oscilloscope"
                    className="flex-1 h-28 bg-[#001100] border-2 border-t-[#000000] border-l-[#000000] border-b-[#003300] border-r-[#003300] relative overflow-hidden"
                  >
                    {/* CRT Grid */}
                    <svg className="w-full h-full" preserveAspectRatio="none">
                      <defs>
                        <pattern id="mem-grid" width="12" height="12" patternUnits="userSpaceOnUse">
                          <path d="M 12 0 L 0 0 0 12" fill="none" stroke="#003300" strokeWidth="0.8" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#mem-grid)" />

                      {/* Neon Green Memory Waveform */}
                      <polyline
                        fill="none"
                        stroke="#00FF00"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={memHistory
                          .map((val, idx) => {
                            const x = (idx / (memHistory.length - 1)) * 320;
                            // normalize between 150MB and 300MB
                            const norm = Math.max(0, Math.min(100, ((val - 150) / 150) * 100));
                            const y = 110 - (norm / 100) * 100;
                            return `${x},${y}`;
                          })
                          .join(' ')}
                      />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Bottom Statistics Cards */}
              <div className="grid grid-cols-2 gap-2 text-[10px]">
                {/* Totais */}
                <fieldset className="border border-[#7F9DB9] rounded-[2px] p-2">
                  <legend className="px-1 text-black font-semibold">Totais</legend>
                  <div className="flex justify-between py-0.5">
                    <span>Identificadores:</span>
                    <span className="font-mono">5120</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>Threads:</span>
                    <span className="font-mono">342</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>Processos:</span>
                    <span className="font-mono">{processes.length}</span>
                  </div>
                </fieldset>

                {/* Memória Física */}
                <fieldset className="border border-[#7F9DB9] rounded-[2px] p-2">
                  <legend className="px-1 text-black font-semibold">Memória física (KB)</legend>
                  <div className="flex justify-between py-0.5">
                    <span>Total:</span>
                    <span className="font-mono">1048048</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>Disponível:</span>
                    <span className="font-mono">684120</span>
                  </div>
                  <div className="flex justify-between py-0.5">
                    <span>Cache do sistema:</span>
                    <span className="font-mono">314890</span>
                  </div>
                </fieldset>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Classic XP 3-Part Status Bar */}
      <div className="flex items-center text-[11px] bg-[#ECE9D8] border-t border-[#7F9DB9] px-1 py-0.5 space-x-1">
        <div className="flex-1 px-2 py-0.5 border border-t-[#7A98B0] border-l-[#7A98B0] border-b-[#FFFFFF] border-r-[#FFFFFF] shadow-[inset_1px_1px_0px_rgba(0,0,0,0.1)] truncate">
          Processos: {processes.length}
        </div>
        <div className="w-32 px-2 py-0.5 border border-t-[#7A98B0] border-l-[#7A98B0] border-b-[#FFFFFF] border-r-[#FFFFFF] shadow-[inset_1px_1px_0px_rgba(0,0,0,0.1)] truncate">
          Uso de CPU: {cpuPercent}%
        </div>
        <div className="w-36 px-2 py-0.5 border border-t-[#7A98B0] border-l-[#7A98B0] border-b-[#FFFFFF] border-r-[#FFFFFF] shadow-[inset_1px_1px_0px_rgba(0,0,0,0.1)] truncate">
          Memória física: {Math.round((memMb / 1024) * 100)}%
        </div>
      </div>

      {/* Nova Tarefa (Run) Dialog */}
      {showRunDialog && (
        <div className="absolute inset-0 bg-black/25 flex items-center justify-center z-50 p-4">
          <div className="w-[340px] bg-[#ECE9D8] border-2 border-t-[#FFFFFF] border-l-[#FFFFFF] border-b-[#000000] border-r-[#000000] shadow-xl p-3 text-xs">
            <div className="font-bold text-sm mb-2 flex items-center space-x-2">
              <span>Criar nova tarefa</span>
            </div>
            <p className="text-[11px] text-[#333333] mb-3">
              Digite o nome de um programa, pasta, documento ou recurso da Internet para abrir:
            </p>
            <form onSubmit={handleRunSubmit}>
              <div className="flex items-center space-x-2 mb-3">
                <span className="font-semibold">Abrir:</span>
                <input
                  type="text"
                  value={runInput}
                  onChange={e => setRunInput(e.target.value)}
                  placeholder="ex: notepad, winmine, sobre"
                  autoFocus
                  className="flex-1 px-2 py-1 bg-white border border-[#7F9DB9] text-xs outline-none"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="submit"
                  className="px-4 py-1 text-xs border border-[#003C74] bg-[#ECE9D8] hover:bg-[#DCD8C8] shadow-sm rounded-sm"
                >
                  OK
                </button>
                <button
                  type="button"
                  onClick={() => setShowRunDialog(false)}
                  className="px-4 py-1 text-xs border border-[#7F9DB9] bg-[#ECE9D8] hover:bg-[#DCD8C8] shadow-sm rounded-sm"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const TaskManagerApp: React.FC<TaskManagerAppProps> = ({
  id = 'task-manager-window',
  withFrame = true,
  isOpen,
  onClose,
  className = ''
}) => {
  const content = <TaskManagerContent parentId={id} />;

  if (!withFrame) {
    return <div className={className}>{content}</div>;
  }

  return (
    <WindowFrame
      id={id}
      title="Gerenciador de tarefas do Windows"
      icon="taskmgr"
      isOpen={isOpen}
      onClose={onClose}
      className={className}
      initialPosition={{ x: 180, y: 50, width: 480, height: 530 }}
    >
      {content}
    </WindowFrame>
  );
};

export default TaskManagerApp;
