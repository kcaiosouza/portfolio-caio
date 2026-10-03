import React, { useState } from 'react';
import { DesktopIconItem } from '../../types';
import { useWindowManager } from '../../context/WindowContext';
import { Trash2, FileText, Folder, Globe, Smartphone, SquareTerminal, Spade } from 'lucide-react';

interface DesktopIconProps {
  item: DesktopIconItem;
}

export const DesktopIcon: React.FC<DesktopIconProps> = ({ item }) => {
  const { openWindow } = useWindowManager();
  const [isSelected, setIsSelected] = useState(false);

  const renderIcon = () => {
    switch (item.iconType) {
      case 'trash':
        return <Trash2 className="w-9 h-9 text-gray-200 drop-shadow-md" data-testid="icon-trash" />;
      case 'pdf':
        return <FileText className="w-9 h-9 text-red-500 drop-shadow-md" data-testid="icon-pdf" />;
      case 'notepad':
        return <FileText className="w-9 h-9 text-blue-300 drop-shadow-md" data-testid="icon-notepad" />;
      case 'folder':
        return <Folder className="w-9 h-9 text-yellow-400 drop-shadow-md" data-testid="icon-folder" />;
      case 'browser':
        return <Globe className="w-9 h-9 text-blue-400 drop-shadow-md" data-testid="icon-browser" />;
      case 'smartphone':
        return <Smartphone className="w-9 h-9 text-purple-400 drop-shadow-md" data-testid="icon-smartphone" />;
      case 'cmd':
        return <SquareTerminal className="w-9 h-9 text-emerald-400 drop-shadow-md" data-testid="icon-cmd" />;
      case 'spider':
        return <Spade className="w-9 h-9 text-emerald-300 drop-shadow-md" data-testid="icon-spider" />;
      case 'msn':
        return (
          <svg className="w-9 h-9 drop-shadow-md" viewBox="0 0 24 24" fill="none" data-testid="icon-msn">
            <circle cx="8" cy="7" r="4" fill="#00C853" />
            <path d="M2 19C2 14.5 5 12.5 8 12.5C11 12.5 14 14.5 14 19" fill="#00C853" />
            <circle cx="16" cy="9" r="3.5" fill="#0091EA" />
            <path d="M11 20C11 16 13.5 14.5 16 14.5C21 16 21 20 21 20" fill="#0091EA" />
          </svg>
        );
      case 'winamp':
        return (
          <div className="w-9 h-9 rounded-md bg-gradient-to-b from-[#2F3142] to-[#12131C] border border-[#52556E] flex items-center justify-center drop-shadow-md" data-testid="icon-winamp">
            <svg className="w-6 h-6 text-yellow-400 fill-yellow-400 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)]" viewBox="0 0 24 24">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
        );
      default:
        return <FileText className="w-9 h-9 text-white drop-shadow-md" />;
    }
  };

  return (
    <div
      tabIndex={0}
      role="button"
      aria-label={item.title}
      onClick={() => setIsSelected(true)}
      onDoubleClick={() => openWindow(item.windowId)}
      onBlur={() => setIsSelected(false)}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          openWindow(item.windowId);
        }
      }}
      className={`w-20 p-2 flex flex-col items-center justify-center rounded cursor-pointer select-none group focus:outline-none transition-colors ${
        isSelected
          ? 'bg-[#0B61FF]/40 border border-dotted border-white/70 shadow-sm'
          : 'hover:bg-white/10 border border-transparent'
      }`}
    >
      <div className="mb-1 pointer-events-none">{renderIcon()}</div>
      <span
        className={`text-white text-xs text-center leading-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.9)] px-1 rounded break-words max-w-full ${
          isSelected ? 'bg-[#0B61FF]' : ''
        }`}
      >
        {item.title}
      </span>
    </div>
  );
};
