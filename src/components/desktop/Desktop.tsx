import React from 'react';
import { DESKTOP_ICONS } from '../../utils/data';
import { DesktopIcon } from './DesktopIcon';
import { Taskbar } from './Taskbar';
import { NotepadApp } from '../windows/NotepadApp';
import { PdfViewerApp } from '../windows/PdfViewerApp';
import { ExplorerFolderApp } from '../windows/ExplorerFolderApp';
import { RecycleBinApp } from '../windows/RecycleBinApp';
import { MinesweeperApp } from '../windows/MinesweeperApp';
import { ProjectsFolderApp } from '../windows/ProjectsFolderApp';
import { InternetExplorerApp } from '../windows/InternetExplorerApp';
import { MobileEmulatorApp } from '../windows/MobileEmulatorApp';

export const Desktop: React.FC = () => {
  return (
    <div
      role="region"
      aria-label="Área de Trabalho"
      className="relative h-screen w-screen flex flex-col overflow-hidden select-none font-tahoma"
    >
      {/* Papel de Parede Retrô Bliss (Colinas Verdes e Céu Azul) */}
      <div
        className="flex-1 relative overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage: `
            radial-gradient(ellipse 120% 75% at 50% 100%, #2E7D32 0%, #388E3C 30%, #4CAF50 55%, transparent 75%),
            radial-gradient(ellipse 90% 50% at 85% 95%, #43A047 0%, #66BB6A 40%, transparent 70%),
            linear-gradient(to bottom, #1E88E5 0%, #42A5F5 35%, #90CAF9 65%, #C8E6C9 85%, #4CAF50 100%)
          `,
        }}
      >
        {/* Grid de Ícones da Área de Trabalho */}
        <div className="p-4 flex flex-col flex-wrap gap-4 h-full content-start select-none z-0">
          {DESKTOP_ICONS.map((item) => (
            <DesktopIcon key={item.id} item={item} />
          ))}
        </div>

        {/* Instâncias das Janelas */}
        <NotepadApp />
        <PdfViewerApp />
        <ExplorerFolderApp />
        <RecycleBinApp />
        <MinesweeperApp />
        <ProjectsFolderApp />
        <InternetExplorerApp />
        <MobileEmulatorApp />
      </div>

      {/* Barra de Tarefas */}
      <Taskbar />
    </div>
  );
};

export default Desktop;
