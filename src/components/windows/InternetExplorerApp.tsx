import React, { useState, useEffect } from 'react';
import WindowFrame from './WindowFrame';
import { PROJECTS_DATA } from '../../utils/data';
import { useWindowManager } from '../../context/WindowContext';
import { soundEngine } from '../../utils/soundEffects';
import {
  ArrowLeft,
  ArrowRight,
  X,
  RotateCw,
  Home,
  ExternalLink,
  Globe,
  Lock,
  Layers,
  Sparkles
} from 'lucide-react';

export interface InternetExplorerAppProps {
  id?: string;
  withFrame?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export const InternetExplorerContent: React.FC = () => {
  const { browserUrl, setBrowserUrl } = useWindowManager();
  const [inputUrl, setInputUrl] = useState<string>(browserUrl || 'https://igcgmusic.com.br');
  const [currentUrl, setCurrentUrl] = useState<string>(browserUrl || 'https://igcgmusic.com.br');
  const [history, setHistory] = useState<string[]>([browserUrl || 'https://igcgmusic.com.br']);
  const [historyIndex, setHistoryIndex] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [iframeError, setIframeError] = useState<boolean>(false);

  // Manter sincronizado quando abrir via openBrowser(url)
  useEffect(() => {
    if (browserUrl && browserUrl !== currentUrl) {
      setCurrentUrl(browserUrl);
      setInputUrl(browserUrl);
      setHistory(prev => [...prev.slice(0, historyIndex + 1), browserUrl]);
      setHistoryIndex(prev => prev + 1);
      setIsLoading(true);
      setIframeError(false);
    }
  }, [browserUrl]);

  const activeProject = PROJECTS_DATA.find(p => p.url === currentUrl) || {
    id: 'custom',
    title: 'Navegação Web',
    fileTitle: 'Web.url',
    url: currentUrl,
    description: 'Página web externa carregada no Internet Explorer.',
    tags: ['Web Application'],
  };

  const navigateTo = (url: string) => {
    soundEngine.playClick();
    let formatted = url.trim();
    if (!formatted.startsWith('http://') && !formatted.startsWith('https://')) {
      formatted = `https://${formatted}`;
    }
    setInputUrl(formatted);
    setCurrentUrl(formatted);
    setBrowserUrl(formatted);
    setIsLoading(true);
    setIframeError(false);

    const nextHistory = [...history.slice(0, historyIndex + 1), formatted];
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);
  };

  const handleBack = () => {
    if (historyIndex > 0) {
      soundEngine.playClick();
      const prevUrl = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setCurrentUrl(prevUrl);
      setInputUrl(prevUrl);
      setBrowserUrl(prevUrl);
      setIsLoading(true);
      setIframeError(false);
    }
  };

  const handleForward = () => {
    if (historyIndex < history.length - 1) {
      soundEngine.playClick();
      const nextUrl = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setCurrentUrl(nextUrl);
      setInputUrl(nextUrl);
      setBrowserUrl(nextUrl);
      setIsLoading(true);
      setIframeError(false);
    }
  };

  const handleRefresh = () => {
    soundEngine.playClick();
    setIsLoading(true);
    setIframeError(false);
    // Forçar recarga
    const temp = currentUrl;
    setCurrentUrl('');
    setTimeout(() => setCurrentUrl(temp), 50);
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 bg-[#ECE9D8] font-tahoma text-black select-none text-xs">
      {/* 1. Barra de Menus */}
      <div className="bg-[#ECE9D8] border-b border-[#ACA899] px-2 py-0.5 flex gap-4 text-xs">
        <span className="hover:bg-[#0A246A] hover:text-white px-1 cursor-default">Arquivo</span>
        <span className="hover:bg-[#0A246A] hover:text-white px-1 cursor-default">Editar</span>
        <span className="hover:bg-[#0A246A] hover:text-white px-1 cursor-default">Exibir</span>
        <span className="hover:bg-[#0A246A] hover:text-white px-1 cursor-default">Favoritos</span>
        <span className="hover:bg-[#0A246A] hover:text-white px-1 cursor-default">Ferramentas</span>
        <span className="hover:bg-[#0A246A] hover:text-white px-1 cursor-default">Ajuda</span>
      </div>

      {/* 2. Barra de Ferramentas com Botões Clássicos do IE6 */}
      <div className="bg-[#ECE9D8] border-b border-[#ACA899] p-1 flex items-center justify-between gap-1 shadow-xs">
        <div className="flex items-center gap-0.5">
          {/* Voltar */}
          <button
            type="button"
            disabled={historyIndex <= 0}
            onClick={handleBack}
            className="flex items-center gap-1 px-1.5 py-1 rounded-[2px] hover:bg-[#B6BDD2] active:bg-[#C2CEE8] disabled:opacity-40 disabled:hover:bg-transparent"
            title="Voltar"
          >
            <div className="w-5 h-5 rounded-full bg-[#6EB82C] text-white flex items-center justify-center font-bold shadow-xs">
              <ArrowLeft className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span className="text-gray-700">Voltar</span>
          </button>

          {/* Avançar */}
          <button
            type="button"
            disabled={historyIndex >= history.length - 1}
            onClick={handleForward}
            className="flex items-center gap-1 px-1.5 py-1 rounded-[2px] hover:bg-[#B6BDD2] active:bg-[#C2CEE8] disabled:opacity-40 disabled:hover:bg-transparent"
            title="Avançar"
          >
            <div className="w-5 h-5 rounded-full bg-[#6EB82C] text-white flex items-center justify-center font-bold shadow-xs">
              <ArrowRight className="w-3.5 h-3.5 stroke-[3]" />
            </div>
          </button>

          {/* Parar */}
          <button
            type="button"
            onClick={() => setIsLoading(false)}
            className="flex items-center gap-1 px-1.5 py-1 rounded-[2px] hover:bg-[#B6BDD2] active:bg-[#C2CEE8]"
            title="Parar"
          >
            <div className="w-5 h-5 rounded-full bg-[#D84B37] text-white flex items-center justify-center shadow-xs">
              <X className="w-3.5 h-3.5 stroke-[3]" />
            </div>
            <span className="text-gray-700">Parar</span>
          </button>

          {/* Atualizar */}
          <button
            type="button"
            onClick={handleRefresh}
            className="flex items-center gap-1 px-1.5 py-1 rounded-[2px] hover:bg-[#B6BDD2] active:bg-[#C2CEE8]"
            title="Atualizar"
          >
            <div className="w-5 h-5 rounded-full bg-[#3B72BA] text-white flex items-center justify-center shadow-xs">
              <RotateCw className="w-3 h-3 stroke-[2.5]" />
            </div>
            <span className="text-gray-700">Atualizar</span>
          </button>

          {/* Página Inicial */}
          <button
            type="button"
            onClick={() => navigateTo('https://igcgmusic.com.br')}
            className="flex items-center gap-1 px-1.5 py-1 rounded-[2px] hover:bg-[#B6BDD2] active:bg-[#C2CEE8]"
            title="Página Inicial"
          >
            <div className="w-5 h-5 rounded-full bg-[#F0B232] text-white flex items-center justify-center shadow-xs">
              <Home className="w-3.5 h-3.5 text-gray-900" />
            </div>
            <span className="text-gray-700">Início</span>
          </button>
        </div>

        {/* Logo animado do Windows / Globo */}
        <div className="w-7 h-7 bg-white rounded border border-[#7F9DB9] shadow-inner flex items-center justify-center mr-1">
          <Globe
            className={`w-5 h-5 text-blue-600 ${isLoading ? 'animate-spin' : ''}`}
          />
        </div>
      </div>

      {/* 3. Barra de Endereço */}
      <div className="bg-[#ECE9D8] border-b border-[#ACA899] px-2 py-1 flex items-center gap-2">
        <span className="text-gray-600 font-medium">Endereço</span>
        <div className="flex-1 flex items-center bg-white border border-[#7F9DB9] px-2 py-0.5 rounded-[1px] shadow-inner">
          <Globe className="w-3.5 h-3.5 text-blue-600 mr-1.5 flex-shrink-0" />
          <input
            type="text"
            value={inputUrl}
            onChange={e => setInputUrl(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                navigateTo(inputUrl);
              }
            }}
            className="w-full text-xs font-tahoma outline-none text-gray-900 select-text"
            placeholder="Digite a URL do projeto..."
          />
        </div>

        <button
          type="button"
          onClick={() => navigateTo(inputUrl)}
          className="flex items-center gap-1 px-3 py-0.5 bg-gradient-to-b from-white to-[#E1DECE] border border-[#7F9DB9] rounded-[2px] hover:border-[#0058EE] active:bg-[#C2CEE8] font-semibold text-gray-800 shadow-xs"
        >
          <span className="text-green-600 font-bold">➔</span>
          <span>Ir</span>
        </button>
      </div>

      {/* 4. Barra de Favoritos (Atalhos dos Projetos de Caio) */}
      <div className="bg-[#ECE9D8] border-b border-[#ACA899] px-2 py-1 flex items-center gap-1.5 overflow-x-auto">
        <span className="text-[11px] text-gray-500 font-semibold uppercase tracking-wider mr-1">
          Favoritos:
        </span>
        {PROJECTS_DATA.map(proj => (
          <button
            key={proj.id}
            onClick={() => navigateTo(proj.url)}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] border text-xs transition-colors ${
              currentUrl === proj.url
                ? 'bg-blue-100 border-blue-500 font-bold text-blue-900 shadow-xs'
                : 'bg-white/80 border-gray-300 hover:bg-white text-gray-800'
            }`}
          >
            <Sparkles className="w-3 h-3 text-yellow-500" />
            <span>{proj.title}</span>
          </button>
        ))}
      </div>

      {/* 5. Painel de Informações do Projeto Selecionado */}
      <div className="bg-gradient-to-r from-[#D3E5FA] to-[#EBF3FD] border-b border-blue-300 px-3 py-2 flex flex-wrap items-center justify-between gap-2 shadow-inner">
        <div className="flex items-center gap-2 min-w-0">
          <Layers className="w-4 h-4 text-blue-700 flex-shrink-0" />
          <div className="truncate">
            <span className="font-bold text-gray-900">{activeProject.title}:</span>{' '}
            <span className="text-gray-700 text-[11px]">{activeProject.description}</span>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="hidden sm:flex items-center gap-1">
            {activeProject.tags.map((tag, i) => (
              <span
                key={i}
                className="bg-white/90 border border-blue-300 text-blue-800 px-1.5 py-0.5 rounded text-[10px] font-semibold"
              >
                {tag}
              </span>
            ))}
          </div>

          <a
            href={currentUrl}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1 px-2.5 py-1 bg-gradient-to-b from-[#245EDC] to-[#1941A5] text-white font-bold rounded-[2px] border border-[#002D96] hover:brightness-110 active:brightness-90 shadow-sm text-xs"
          >
            <span>Abrir no Navegador Real</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>

      {/* 6. Viewport do Navegador (Iframe com Fallback Gracioso) */}
      <div className="flex-1 bg-white relative overflow-hidden flex flex-col">
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 z-20 flex flex-col items-center justify-center gap-2">
            <Globe className="w-8 h-8 text-blue-600 animate-spin" />
            <span className="text-xs text-gray-600 font-medium">Carregando {currentUrl}...</span>
          </div>
        )}

        {currentUrl ? (
          <iframe
            src={currentUrl}
            title={activeProject.title}
            onLoad={() => setIsLoading(false)}
            onError={() => {
              setIsLoading(false);
              setIframeError(true);
            }}
            className="w-full flex-1 border-0"
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        ) : null}

        {/* Fallback caso bloqueie iframe por CSP / X-Frame-Options */}
        {iframeError && (
          <div className="absolute inset-0 bg-[#ECE9D8] p-8 flex flex-col items-center justify-center text-center z-30 font-tahoma">
            <div className="bg-white border-2 border-[#7F9DB9] p-6 max-w-lg shadow-xl rounded-[2px]">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Globe className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-base font-bold text-gray-900 mb-1">{activeProject.title}</h2>
              <p className="text-xs text-gray-600 mb-4 leading-relaxed">
                {activeProject.description}
              </p>

              <div className="flex flex-wrap justify-center gap-1.5 mb-6">
                {activeProject.tags.map((tag, idx) => (
                  <span
                    key={idx}
                    className="bg-blue-50 border border-blue-200 text-blue-800 text-xs px-2 py-0.5 rounded font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <a
                href={currentUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2 bg-[#245EDC] text-white font-bold rounded border border-[#002D96] hover:bg-[#1941A5] shadow-md transition-all transform active:scale-95"
              >
                <span>Acessar {activeProject.title}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* 7. Barra de Status do Internet Explorer */}
      <div className="bg-[#ECE9D8] border-t border-[#ACA899] px-3 py-0.5 flex items-center justify-between text-[11px] text-gray-600 shadow-inner">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
          <span>{isLoading ? 'Conectando...' : 'Concluído'}</span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Lock className="w-3 h-3 text-green-700" />
            <span>Zona da Internet</span>
          </div>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
};

export const InternetExplorerApp: React.FC<InternetExplorerAppProps> = ({
  id = 'browser-window',
  withFrame = true,
  isOpen,
  onClose,
  className = '',
}) => {
  const content = <InternetExplorerContent />;

  if (!withFrame) {
    return <div className={className}>{content}</div>;
  }

  return (
    <WindowFrame
      id={id}
      title="Internet Explorer - Navegador Web Caio"
      icon={
        <Globe className="w-4 h-4 text-blue-400" />
      }
      isOpen={isOpen}
      onClose={onClose}
      className={className}
      initialPosition={{ x: 90, y: 30, width: 850, height: 580 }}
    >
      {content}
    </WindowFrame>
  );
};

export default InternetExplorerApp;
