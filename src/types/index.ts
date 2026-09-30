export type ScreenMode = 'bios' | 'login' | 'desktop';

export interface WindowPosition {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WindowItem {
  id: string;
  title: string;
  icon: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: WindowPosition;
  defaultPosition?: WindowPosition;
}

export interface DesktopIconItem {
  id: string;
  title: string;
  iconType: 'trash' | 'pdf' | 'notepad' | 'folder';
  windowId: string;
}

export interface HobbyItem {
  id: string;
  title: string;
  type: 'text' | 'image' | 'audio' | 'link';
  content: string;
  description: string;
}
