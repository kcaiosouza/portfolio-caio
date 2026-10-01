import React, { useState } from 'react';
import WindowFrame from './WindowFrame';
import { PORTFOLIO_DATA } from '../../utils/data';
import { soundEngine } from '../../utils/soundEffects';

export interface PdfViewerAppProps {
  id?: string;
  withFrame?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export const downloadCvFile = () => {
  soundEngine.playClick();

  const cvText = `================================================================================
                      CURRICULUM VITAE - ${PORTFOLIO_DATA.name.toUpperCase()}
                      ${PORTFOLIO_DATA.title.toUpperCase()}
================================================================================
E-mail:    ${PORTFOLIO_DATA.contacts.email.replace('mailto:', '')}
GitHub:    ${PORTFOLIO_DATA.contacts.github}
LinkedIn:  ${PORTFOLIO_DATA.contacts.linkedin}

--------------------------------------------------------------------------------
RESUMO PROFISSIONAL
--------------------------------------------------------------------------------
${PORTFOLIO_DATA.summary}

--------------------------------------------------------------------------------
EXPERIÊNCIA PROFISSIONAL
--------------------------------------------------------------------------------
${PORTFOLIO_DATA.experience
  .map(
    exp => `* ${exp.period} | ${exp.role}
  ${exp.description}`
  )
  .join('\n\n')}

--------------------------------------------------------------------------------
COMPETÊNCIAS & HABILIDADES
--------------------------------------------------------------------------------
${PORTFOLIO_DATA.skills.join(' • ')}

--------------------------------------------------------------------------------
IDIOMAS
--------------------------------------------------------------------------------
${PORTFOLIO_DATA.languages.map(l => `* ${l.lang}: ${l.level}`).join('\n')}

================================================================================
Documento gerado através do Portfólio Windows XP - ${PORTFOLIO_DATA.name}
================================================================================`;

  const blob = new Blob([cvText], { type: 'application/pdf;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'caio-cv.pdf';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const PdfViewerContent: React.FC = () => {
  const [zoom, setZoom] = useState<number>(100);

  const handleZoomIn = () => {
    soundEngine.playClick();
    setZoom(prev => Math.min(prev + 15, 175));
  };

  const handleZoomOut = () => {
    soundEngine.playClick();
    setZoom(prev => Math.max(prev - 15, 50));
  };

  const handleZoomReset = () => {
    soundEngine.playClick();
    setZoom(100);
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 bg-[#525659] font-tahoma text-black select-none">
      {/* Retro Toolbar */}
      <div className="flex flex-wrap items-center justify-between px-3 py-1 bg-[#ECE9D8] border-b border-[#ACA899] gap-2 shadow-xs">
        {/* Left: Document info & Navigation */}
        <div className="flex items-center gap-2">
          {/* Adobe Acrobat style icon */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white border border-[#ACA899] rounded-[2px] shadow-inner text-xs">
            <svg className="w-3.5 h-3.5 text-red-600" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM8.5 15.5C8.5 16.3 7.8 17 7 17H5V7H7C7.8 7 8.5 7.7 8.5 8.5V15.5ZM13.5 11.5C13.5 12.3 12.8 13 12 13H10.5V11H12C12.8 11 13.5 11.7 13.5 11.5ZM19 9H17.5V11H19V13H17.5V17H15.5V7H19V9Z" />
            </svg>
            <span className="font-semibold text-gray-800">caio-cv.pdf</span>
          </div>

          <div className="h-4 w-[1px] bg-gray-400" />

          {/* Page Indicator */}
          <div className="text-xs text-gray-700 flex items-center gap-1">
            <span>Página</span>
            <span className="px-2 py-0.5 bg-white border border-[#ACA899] text-center font-mono text-xs w-8 rounded-[1px]">1</span>
            <span>de 1</span>
          </div>
        </div>

        {/* Center: Zoom Controls */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            data-testid="btn-zoom-out"
            aria-label="Diminuir zoom"
            title="Diminuir zoom (-)"
            onClick={handleZoomOut}
            className="w-7 h-6 flex items-center justify-center bg-gradient-to-b from-white to-[#E1DECE] border border-[#7F9DB9] rounded-[2px] hover:border-[#0058EE] active:bg-[#C2CEE8] text-xs font-bold shadow-xs"
          >
            -
          </button>

          <button
            type="button"
            data-testid="btn-zoom-reset"
            title="Restaurar zoom para 100%"
            onClick={handleZoomReset}
            className="px-2 h-6 flex items-center justify-center bg-white border border-[#7F9DB9] text-xs font-mono min-w-[50px] rounded-[1px]"
          >
            {zoom}%
          </button>

          <button
            type="button"
            data-testid="btn-zoom-in"
            aria-label="Aumentar zoom"
            title="Aumentar zoom (+)"
            onClick={handleZoomIn}
            className="w-7 h-6 flex items-center justify-center bg-gradient-to-b from-white to-[#E1DECE] border border-[#7F9DB9] rounded-[2px] hover:border-[#0058EE] active:bg-[#C2CEE8] text-xs font-bold shadow-xs"
          >
            +
          </button>
        </div>

        {/* Right: Destacado 'Baixar Currículo' button */}
        <div className="flex items-center">
          <button
            type="button"
            data-testid="btn-download-cv"
            aria-label="Baixar Currículo"
            title="Download caio-cv.pdf"
            onClick={downloadCvFile}
            className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-b from-[#2272E2] via-[#0A58CF] to-[#0444A4] hover:from-[#3583F0] hover:to-[#0A58CF] active:from-[#0444A4] active:to-[#0A58CF] text-white text-xs font-bold rounded-[3px] border border-[#002D96] shadow-[inset_0_1px_0_rgba(255,255,255,0.4),0_1px_2px_rgba(0,0,0,0.3)] transition-all transform active:scale-95"
          >
            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 16 16">
              <path d="M8 12L3 7H6V1H10V7H13L8 12Z" />
              <path d="M1 14H15V16H1V14Z" />
            </svg>
            <span>Baixar Currículo</span>
          </button>
        </div>
      </div>

      {/* PDF Viewport (Paper Container) */}
      <div className="flex-1 overflow-auto p-6 flex justify-center items-start">
        <div
          data-testid="cv-paper"
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center'
          }}
          className="bg-white text-gray-900 shadow-2xl p-10 w-[640px] min-h-[900px] border border-gray-400 select-text transition-transform duration-100 ease-out"
        >
          {/* Header */}
          <div className="border-b-2 border-[#1941A5] pb-4 mb-6">
            <h1 className="text-2xl font-bold tracking-tight text-[#002D96] font-tahoma">
              {PORTFOLIO_DATA.name}
            </h1>
            <h2 className="text-sm font-semibold text-[#0058EE] mt-0.5">
              {PORTFOLIO_DATA.title} • {PORTFOLIO_DATA.yearsOfExperience}+ Anos de Experiência
            </h2>

            <div className="flex flex-wrap items-center gap-4 mt-3 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <strong>E-mail:</strong> {PORTFOLIO_DATA.contacts.email.replace('mailto:', '')}
              </span>
              <span className="flex items-center gap-1">
                <strong>LinkedIn:</strong> {PORTFOLIO_DATA.contacts.linkedin}
              </span>
              <span className="flex items-center gap-1">
                <strong>GitHub:</strong> {PORTFOLIO_DATA.contacts.github}
              </span>
            </div>
          </div>

          {/* Section: Resumo */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#002D96] border-b border-gray-200 pb-1 mb-2">
              Resumo Profissional
            </h3>
            <p className="text-xs text-gray-700 leading-relaxed text-justify">
              {PORTFOLIO_DATA.summary}
            </p>
          </div>

          {/* Section: Experiência */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#002D96] border-b border-gray-200 pb-1 mb-3">
              Experiência Profissional
            </h3>
            <div className="space-y-4">
              {PORTFOLIO_DATA.experience.map((exp, idx) => (
                <div key={idx} className="border-l-2 border-[#7A96DF] pl-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-bold text-gray-900">{exp.role}</span>
                    <span className="text-[11px] font-semibold text-[#0058EE]">{exp.period}</span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1 leading-normal">
                    {exp.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section: Habilidades Técnicas */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#002D96] border-b border-gray-200 pb-1 mb-2">
              Competências & Habilidades Técnicas
            </h3>
            <div className="flex flex-wrap gap-1.5 mt-2">
              {PORTFOLIO_DATA.skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-[#EEF2FC] border border-[#B6BDD2] text-[#002D96] rounded text-[11px] font-medium"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Section: Idiomas */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#002D96] border-b border-gray-200 pb-1 mb-2">
              Idiomas
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {PORTFOLIO_DATA.languages.map((l, idx) => (
                <div key={idx} className="text-xs bg-gray-50 p-2 border border-gray-200 rounded-[2px]">
                  <div className="font-semibold text-gray-900">{l.lang}</div>
                  <div className="text-[11px] text-[#0058EE]">{l.level}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Retro PDF watermark note */}
          <div className="mt-8 pt-4 border-t border-gray-200 text-center text-[10px] text-gray-400">
            Documento Oficial • Formato A4 • Microsoft Windows XP Professional Edition
          </div>
        </div>
      </div>

      {/* Bottom Status Bar */}
      <div className="flex items-center justify-between px-3 py-0.5 bg-[#ECE9D8] border-t border-[#ACA899] text-[11px] text-gray-700 shadow-[inset_0_1px_0_#FFF]">
        <span>Página 1 de 1</span>
        <span>A4 (595 x 842 pt)</span>
        <span>Zoom: {zoom}%</span>
      </div>
    </div>
  );
};

export const PdfViewerApp: React.FC<PdfViewerAppProps> = ({
  id = 'cv-window',
  withFrame = true,
  isOpen,
  onClose,
  className = ''
}) => {
  if (!withFrame) {
    return <PdfViewerContent />;
  }

  return (
    <WindowFrame
      id={id}
      title="caio-cv.pdf - Visualizador de Documentos"
      icon="pdf"
      isOpen={isOpen}
      onClose={onClose}
      className={className}
    >
      <PdfViewerContent />
    </WindowFrame>
  );
};

export default PdfViewerApp;
