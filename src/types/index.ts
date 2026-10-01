export type ScreenMode = 'bios' | 'login' | 'desktop' | 'bsod';

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
  iconType: 'trash' | 'pdf' | 'notepad' | 'folder' | 'browser' | 'smartphone' | 'cmd' | 'taskmgr';
  windowId: string;
}

export interface HobbyItem {
  id: string;
  title: string;
  type: 'text' | 'image' | 'audio' | 'link';
  content: string;
  description: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  fileTitle: string;
  url: string;
  description: string;
  tags: string[];
  type?: 'web' | 'mobile';
  featured?: boolean;
  playStoreUrl?: string;
  appStoreUrl?: string;
}

