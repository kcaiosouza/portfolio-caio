import React, { useState } from 'react';
import WindowFrame from './WindowFrame';
import { PROJECTS_DATA } from '../../utils/data';
import { ProjectItem } from '../../types';
import { useWindowManager } from '../../context/WindowContext';
import { soundEngine } from '../../utils/soundEffects';
import {
  Folder,
  ArrowLeft,
  ArrowRight,
  Globe,
  Smartphone,
  ExternalLink,
  Sparkles,
  Info
} from 'lucide-react';

export interface ProjectsFolderAppProps {
  id?: string;
  withFrame?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export const ProjectsFolderContent: React.FC = () => {
  const { openBrowser, openMobileApp } = useWindowManager();
  const [selectedProject, setSelectedProject] = useState<ProjectItem | null>(PROJECTS_DATA[0]);

  const handleSelect = (project: ProjectItem) => {
    soundEngine.playClick();
    setSelectedProject(project);
  };

  const handleOpenProject = (project: ProjectItem) => {
    soundEngine.playClick();
    if (project.type === 'mobile') {
      openMobileApp();
    } else {
      openBrowser(project.url);
    }
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 bg-white font-tahoma text-black select-none text-xs relative">
      {/* Barra de Navegação Superior */}
      <div className="bg-[#ECE9D8] border-b border-[#ACA899] p-1 flex flex-col gap-1">
        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] opacity-50 cursor-default"
          >
            <div className="w-5 h-5 rounded-full bg-[#6EB82C] text-white flex items-center justify-center text-xs font-bold shadow-xs">
              <ArrowLeft className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span className="text-gray-600">Voltar</span>
          </button>

          <button
            type="button"
            disabled
            className="flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] opacity-50 cursor-default"
          >
            <div className="w-5 h-5 rounded-full bg-[#6EB82C] text-white flex items-center justify-center text-xs font-bold shadow-xs">
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </button>

          <div className="h-4 w-[1px] bg-gray-400 mx-1" />

          <button
            type="button"
            onClick={() => openBrowser()}
            className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] hover:bg-[#B6BDD2] text-gray-800"
          >
            <Globe className="w-4 h-4 text-blue-600" />
            <span>Abrir Internet Explorer</span>
          </button>
        </div>

        {/* Barra de Endereço */}
        <div className="flex items-center gap-1.5 px-1 py-0.5">
          <span className="text-gray-600 font-medium">Endereço</span>
          <div className="flex-1 flex items-center bg-white border border-[#7F9DB9] px-2 py-0.5 rounded-[1px] shadow-inner text-xs">
            <Folder className="w-3.5 h-3.5 text-yellow-500 mr-1.5 flex-shrink-0" />
            <span className="text-gray-800 font-normal truncate">
              C:\Documentos de Caio\Meus Projetos
            </span>
          </div>
        </div>
      </div>

      {/* Conteúdo Principal com Barra Lateral Azul */}
      <div className="flex-1 flex min-h-0 bg-white">
        {/* Painel lateral clássico do Windows Explorer */}
        <div className="w-56 bg-gradient-to-b from-[#7BA2E7] via-[#6375D6] to-[#6375D6] p-2 flex flex-col gap-2.5 overflow-y-auto border-r border-[#002D96]">
          {/* Caixa de Tarefas de Projetos */}
          <div className="bg-white rounded-t-[4px] rounded-b-[2px] shadow-sm overflow-hidden border border-[#A7BCE8]">
            <div className="bg-gradient-to-r from-white via-[#D3E1FA] to-[#C0D5FA] px-2 py-1 border-b border-[#A7BCE8] flex items-center gap-1 text-[#215DC6] font-bold text-xs">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500" />
              <span>Tarefas de Projetos</span>
            </div>
            <div className="p-2 flex flex-col gap-1.5 bg-[#F0F4FC] text-xs">
              {selectedProject?.type === 'mobile' ? (
                <button
                  type="button"
                  onClick={() => selectedProject && handleOpenProject(selectedProject)}
                  className="flex items-center gap-1.5 text-blue-700 hover:text-blue-900 hover:underline text-left font-bold"
                >
                  <Smartphone className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>Abrir no Emulador Móvel</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => selectedProject && handleOpenProject(selectedProject)}
                  className="flex items-center gap-1.5 text-blue-700 hover:text-blue-900 hover:underline text-left font-bold"
                >
                  <Globe className="w-3.5 h-3.5 text-blue-600 flex-shrink-0" />
                  <span>Navegar no Internet Explorer</span>
                </button>
              )}

              {selectedProject && (
                <a
                  href={selectedProject.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-blue-700 hover:text-blue-900 hover:underline"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-green-600 flex-shrink-0" />
                  <span>Acessar no Navegador Real</span>
                </a>
              )}
            </div>
          </div>

          {/* Caixa de Detalhes do Projeto Selecionado */}
          {selectedProject && (
            <div className="bg-white rounded-t-[4px] rounded-b-[2px] shadow-sm overflow-hidden border border-[#A7BCE8]">
              <div className="bg-gradient-to-r from-white via-[#D3E1FA] to-[#C0D5FA] px-2 py-1 border-b border-[#A7BCE8] flex items-center gap-1 text-[#215DC6] font-bold text-xs">
                <Info className="w-3.5 h-3.5 text-blue-600" />
                <span>Detalhes</span>
              </div>
              <div className="p-2 flex flex-col gap-2 bg-[#F0F4FC] text-xs text-gray-700">
                <div className="font-bold text-gray-900 text-sm">{selectedProject.title}</div>
                <div className="text-[11px] text-gray-600 leading-snug">
                  {selectedProject.description}
                </div>
                <div className="border-t border-gray-200 pt-1.5">
                  <span className="text-[10px] text-gray-500 font-semibold block mb-1">
                    TECNOLOGIAS:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {selectedProject.tags.map((tag, i) => (
                      <span
                        key={i}
                        className="bg-blue-100 text-blue-800 border border-blue-200 px-1.5 py-0.2 rounded text-[10px] font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {selectedProject.playStoreUrl && (
                  <a
                    href={selectedProject.playStoreUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-1 flex items-center justify-center gap-1.5 w-full py-1 bg-[#01875F] text-white rounded text-[11px] font-bold hover:bg-[#01704F] shadow-xs text-center"
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>Baixar na Google Play</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Grade de Arquivos de Projetos */}
        <div className="flex-1 bg-white p-4 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {PROJECTS_DATA.map(project => {
              const isSelected = selectedProject?.id === project.id;
              return (
                <div
                  key={project.id}
                  onClick={() => handleSelect(project)}
                  onDoubleClick={() => handleOpenProject(project)}
                  tabIndex={0}
                  className={`flex flex-col items-center p-3 rounded cursor-pointer border select-none group text-center transition-colors ${
                    isSelected
                      ? 'bg-[#0B61FF]/20 border-dotted border-[#0B61FF]'
                      : 'border-transparent hover:bg-blue-50 hover:border-blue-200'
                  }`}
                >
                  {/* Ícone clássico de Atalho Web / Mobile do Windows XP */}
                  <div className="relative mb-1">
                    <div className="w-12 h-12 bg-white rounded-md border border-gray-300 shadow-md flex items-center justify-center">
                      {project.type === 'mobile' ? (
                        <Smartphone className="w-8 h-8 text-purple-600" />
                      ) : (
                        <Globe className="w-8 h-8 text-blue-600" />
                      )}
                    </div>
                    {/* Seta curvada ou badge de mobile */}
                    <div className="absolute -bottom-1 -left-1 w-4 h-4 bg-white rounded-full border border-gray-400 flex items-center justify-center text-[10px] text-blue-600 font-bold shadow-xs">
                      {project.type === 'mobile' ? '📱' : '↗'}
                    </div>
                  </div>

                  <span
                    className={`text-xs font-semibold px-1 rounded break-all leading-tight ${
                      isSelected ? 'bg-[#0A246A] text-white' : 'text-gray-900'
                    }`}
                  >
                    {project.fileTitle}
                  </span>
                  <span className="text-[10px] text-gray-500 mt-0.5">{project.title}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-8 p-3 bg-[#ECE9D8] border border-gray-300 rounded text-xs text-gray-600 flex items-center gap-2">
            <span className="text-base">💡</span>
            <span>
              Dê um <strong>duplo clique</strong> no atalho do projeto para abri-lo diretamente no <strong>Internet Explorer</strong>!
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ProjectsFolderApp: React.FC<ProjectsFolderAppProps> = ({
  id = 'projects-window',
  withFrame = true,
  isOpen,
  onClose,
  className = '',
}) => {
  const content = <ProjectsFolderContent />;

  if (!withFrame) {
    return <div className={className}>{content}</div>;
  }

  return (
    <WindowFrame
      id={id}
      title="projetos"
      icon={<Folder className="w-4 h-4 text-yellow-500" />}
      isOpen={isOpen}
      onClose={onClose}
      className={className}
      initialPosition={{ x: 180, y: 60, width: 640, height: 440 }}
    >
      {content}
    </WindowFrame>
  );
};

export default ProjectsFolderApp;
