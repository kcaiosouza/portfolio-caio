import React, { useState, useEffect, useRef } from 'react';
import { useWindowManager } from '../../context/WindowContext';
import { WindowPosition } from '../../types';

export interface WindowFrameProps {
  id: string;
  title?: string;
  icon?: 'notepad' | 'pdf' | 'folder' | 'trash' | string | React.ReactNode;
  children: React.ReactNode;
  isOpen?: boolean;
  isMinimized?: boolean;
  isMaximized?: boolean;
  isActive?: boolean;
  onClose?: () => void;
  onMinimize?: () => void;
  onMaximize?: () => void;
  onFocus?: () => void;
  className?: string;
  initialPosition?: WindowPosition;
}

export const WindowFrame: React.FC<WindowFrameProps> = ({
  id,
  title: propTitle,
  icon: propIcon,
  children,
  isOpen: propIsOpen,
  isMinimized: propIsMinimized,
  isMaximized: propIsMaximized,
  isActive: propIsActive,
  onClose,
  onMinimize,
  onMaximize,
  onFocus,
  className = '',
  initialPosition
}) => {
  let wm: ReturnType<typeof useWindowManager> | undefined;
  try {
    wm = useWindowManager();
  } catch {
    wm = undefined;
  }

  const win = wm?.windows.find(w => w.id === id);

  const isOpen = propIsOpen !== undefined ? propIsOpen : (win ? win.isOpen : true);
  const isMinimized = propIsMinimized !== undefined ? propIsMinimized : (win ? win.isMinimized : false);
  const isMaximized = propIsMaximized !== undefined ? propIsMaximized : (win ? win.isMaximized : false);
  const isActive = propIsActive !== undefined ? propIsActive : (wm ? wm.activeWindowId === id : true);
  const zIndex = win ? win.zIndex : 10;
  const title = propTitle || win?.title || 'Janela';
  const iconType = propIcon || win?.icon || 'folder';

  const [position, setPosition] = useState<WindowPosition>(() => {
    return win?.position || initialPosition || { x: 80, y: 50, width: 620, height: 460 };
  });

  // Keep local position in sync when external window position changes
  useEffect(() => {
    if (win?.position) {
      setPosition(win.position);
    }
  }, [win?.position]);

  // Dragging state
  const isDragging = useRef(false);
  const dragStartRef = useRef({ mouseX: 0, mouseY: 0, posX: 0, posY: 0 });

  const handleMouseDown = (e: React.MouseEvent) => {
    // Avoid dragging if clicking buttons or inputs
    if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) {
      return;
    }

    if (isMaximized) return;

    handleFocus();

    isDragging.current = true;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      posX: position.x,
      posY: position.y
    };

    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;

      const deltaX = e.clientX - dragStartRef.current.mouseX;
      const deltaY = e.clientY - dragStartRef.current.mouseY;

      const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1024;
      const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 768;

      // Bound containment: keep window within boundaries
      const minX = 0;
      const maxX = Math.max(0, viewportWidth - position.width);
      const minY = 0;
      const maxY = Math.max(0, viewportHeight - 32);

      const calculatedX = Math.max(minX, Math.min(maxX, dragStartRef.current.posX + deltaX));
      const calculatedY = Math.max(minY, Math.min(maxY, dragStartRef.current.posY + deltaY));

      const newPos = { x: calculatedX, y: calculatedY };
      setPosition(prev => ({ ...prev, ...newPos }));
      wm?.updateWindowPosition(id, newPos);
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        isDragging.current = false;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [id, position.width, wm]);

  const handleFocus = () => {
    if (wm) {
      wm.focusWindow(id);
    }
    if (onFocus) {
      onFocus();
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onClose) {
      onClose();
    } else if (wm) {
      wm.closeWindow(id);
    }
  };

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMinimize) {
      onMinimize();
    } else if (wm) {
      wm.minimizeWindow(id);
    }
  };

  const handleMaximize = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onMaximize) {
      onMaximize();
    } else if (wm) {
      wm.maximizeWindow(id);
    }
  };

  if (!isOpen || isMinimized) {
    return null;
  }

  // Render icon helper
  const renderIcon = () => {
    if (React.isValidElement(propIcon)) {
      return propIcon;
    }

    switch (iconType) {
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

  const windowStyle: React.CSSProperties = isMaximized
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: 'calc(100vh - 30px)',
        zIndex
      }
    : {
        position: 'absolute',
        top: `${position.y}px`,
        left: `${position.x}px`,
        width: `${position.width}px`,
        height: `${position.height}px`,
        zIndex
      };

  const titleBarGradientStyle: React.CSSProperties = isActive
    ? {
        background: 'linear-gradient(180deg, #0058EE 0%, #3593FF 4%, #288EFF 6%, #0669F2 8%, #0368FD 10%, #0372FD 50%, #0058EE 100%)'
      }
    : {
        background: '#7A96DF'
      };

  return (
    <div
      role="dialog"
      aria-label={title}
      data-testid={`window-${id}`}
      data-active={isActive ? 'true' : 'false'}
      data-maximized={isMaximized ? 'true' : 'false'}
      data-window-id={id}
      onClick={handleFocus}
      style={windowStyle}
      className={`flex flex-col bg-[#ECE9D8] select-none xp-window-shadow border-[3px] transition-shadow duration-150 ${
        isMaximized ? 'rounded-none' : 'rounded-t-[8px] rounded-b-[4px]'
      } ${
        isActive ? 'border-[#0058EE]' : 'border-[#7A96DF]'
      } ${className}`}
    >
      {/* Title Bar */}
      <div
        data-testid="window-titlebar"
        onMouseDown={handleMouseDown}
        onDoubleClick={handleMaximize}
        style={titleBarGradientStyle}
        className={`flex items-center justify-between h-[30px] px-2 text-white font-tahoma text-xs font-bold cursor-default select-none ${
          isMaximized ? 'rounded-none' : 'rounded-t-[5px]'
        }`}
      >
        {/* Title & Icon */}
        <div className="flex items-center gap-1.5 overflow-hidden pr-2">
          {renderIcon()}
          <span
            className="truncate font-semibold text-white drop-shadow-[0_1px_1px_rgba(0,0,0,0.8)]"
            title={title}
          >
            {title}
          </span>
        </div>

        {/* Control Buttons */}
        <div className="flex items-center gap-[3px] flex-shrink-0">
          {/* Minimize button */}
          <button
            type="button"
            aria-label="Minimizar"
            title="Minimizar"
            data-testid="btn-minimize"
            onClick={handleMinimize}
            className="w-[21px] h-[21px] flex items-center justify-center rounded-[3px] border border-white/60 bg-gradient-to-b from-[#4F93E8] via-[#2E6ED8] to-[#124FB0] active:from-[#124FB0] active:to-[#2E6ED8] hover:brightness-110 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] text-white"
          >
            <span className="w-2 h-[2px] bg-white block mt-2 shadow-xs" />
          </button>

          {/* Maximize / Restore button */}
          <button
            type="button"
            aria-label={isMaximized ? 'Restaurar' : 'Maximizar'}
            title={isMaximized ? 'Restaurar' : 'Maximizar'}
            data-testid="btn-maximize"
            onClick={handleMaximize}
            className="w-[21px] h-[21px] flex items-center justify-center rounded-[3px] border border-white/60 bg-gradient-to-b from-[#4F93E8] via-[#2E6ED8] to-[#124FB0] active:from-[#124FB0] active:to-[#2E6ED8] hover:brightness-110 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] text-white"
          >
            {isMaximized ? (
              <span className="relative w-[9px] h-[9px] block">
                <span className="absolute top-0 right-0 w-[7px] h-[7px] border-[1.5px] border-white block" />
                <span className="absolute bottom-0 left-0 w-[7px] h-[7px] border-[1.5px] border-white bg-[#2E6ED8] block" />
              </span>
            ) : (
              <span className="w-[9px] h-[9px] border-[1.5px] border-white block shadow-xs" />
            )}
          </button>

          {/* Close button with luminous red hover */}
          <button
            type="button"
            aria-label="Fechar"
            title="Fechar"
            data-testid="btn-close"
            onClick={handleClose}
            className="w-[21px] h-[21px] flex items-center justify-center rounded-[3px] border border-white/60 bg-gradient-to-b from-[#E76C55] via-[#D84B37] to-[#B82B17] hover:bg-[#E81123] hover:from-[#FF4D4D] hover:to-[#CC0000] hover:brightness-125 hover:shadow-[0_0_8px_rgba(255,80,80,0.9)] active:from-[#991B0B] active:to-[#D84B37] text-white font-bold leading-none transition-all duration-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]"
          >
            <span className="text-white text-[11px] font-sans drop-shadow-[0_1px_1px_rgba(0,0,0,0.6)]">✕</span>
          </button>
        </div>
      </div>

      {/* Window Body */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#ECE9D8] overflow-hidden">
        {children}
      </div>
    </div>
  );
};

export default WindowFrame;
