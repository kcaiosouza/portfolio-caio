import React, { useState } from 'react';
import { DesktopIconItem } from '../../types';
import { useWindowManager } from '../../context/WindowContext';
import { Trash2, FileText, Folder, Globe, Smartphone } from 'lucide-react';

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
        return (
          <div className="w-9 h-9 bg-black border border-[#7A96DF] rounded-[3px] flex items-center justify-center shadow-md p-1" data-testid="icon-cmd">
            <span className="text-white font-mono text-[11px] font-bold">&gt;_</span>
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
