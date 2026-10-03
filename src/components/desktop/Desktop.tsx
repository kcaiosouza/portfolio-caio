import React from 'react';
import { DESKTOP_ICONS, HOBBIES_ITEMS } from '../../utils/data';
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
import { ImageViewerApp } from '../windows/ImageViewerApp';
import { PuppyAssistant } from '../assistant/PuppyAssistant';
import { TaskManagerApp } from '../windows/TaskManagerApp';
import { CmdApp } from '../windows/CmdApp';
import { SpiderSolitaireApp } from '../windows/SpiderSolitaireApp';
import { MinecraftApp } from '../windows/MinecraftApp';
import { MsnContactListApp } from '../windows/msn/MsnContactListApp';
import { MsnChatApp } from '../windows/msn/MsnChatApp';

export const Desktop: React.FC = () => {
  return (
    <div
      role="region"
      aria-label="Área de Trabalho"
      className="relative h-screen w-screen flex flex-col overflow-hidden select-none font-tahoma"
    >
      {/* Papel de Parede Retrô Bliss (Pintura a Óleo - Colinas Verdes e Céu Azul) */}
      <div
        className="flex-1 relative overflow-hidden bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `url(/assets/wallpaper-bliss.jpg), radial-gradient(ellipse 120% 75% at 50% 100%, #2E7D32 0%, #388E3C 30%, #4CAF50 55%, transparent 75%), linear-gradient(to bottom, #1E88E5 0%, #42A5F5 35%, #90CAF9 65%, #C8E6C9 85%, #4CAF50 100%)`,
        }}
      >
        {/* Grid de Ícones da Área de Trabalho */}
        <div className="p-4 flex flex-col flex-wrap gap-4 h-full content-start select-none z-0">
          {DESKTOP_ICONS.map((item) => (
            <DesktopIcon key={item.id} item={item} />
          ))}
        </div>

        {/* Instâncias das Janelas Principais */}
        <NotepadApp />
        <NotepadApp
          id="notepad-blank-window"
          title="Sem título - Bloco de notas"
          fileName="Sem título.txt"
          initialContent=""
          initialPosition={{ x: 100, y: 60, width: 600, height: 440 }}
        />
        <PdfViewerApp />
        <ExplorerFolderApp />
        <RecycleBinApp />
        <MinesweeperApp />
        <SpiderSolitaireApp />
        <ProjectsFolderApp />
        <InternetExplorerApp />
        <MobileEmulatorApp />
        <TaskManagerApp />
        <CmdApp />
        <MinecraftApp />
        <MsnContactListApp />
        <MsnChatApp />

        {/* Instâncias das Janelas dos Arquivos da Pasta Hobbies */}
        {HOBBIES_ITEMS.filter((item) => item.type === 'text').map((hobby) => (
          <NotepadApp
            key={hobby.id}
            id={`hobby-${hobby.id}-window`}
            title={`${hobby.title} - Bloco de notas`}
            fileName={hobby.title}
            initialContent={hobby.content}
          />
        ))}

        {HOBBIES_ITEMS.filter((item) => item.type === 'image').map((hobby) => (
          <ImageViewerApp
            key={hobby.id}
            id={`hobby-${hobby.id}-window`}
            title={`${hobby.title} - Visualizador de imagens do Windows`}
            imageSrc={hobby.content}
            imageTitle={hobby.title}
            description={hobby.description}
          />
        ))}

        {/* Cachorrinho Ajudante do Windows XP */}
        <PuppyAssistant />
      </div>

      {/* Barra de Tarefas */}
      <Taskbar />
    </div>
  );
};

export default Desktop;
