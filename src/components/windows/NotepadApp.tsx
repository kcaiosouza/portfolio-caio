import React, { useState } from 'react';
import WindowFrame from './WindowFrame';
import { PORTFOLIO_DATA } from '../../utils/data';
import { useWindowManager } from '../../context/WindowContext';

export interface NotepadContentProps {
  initialContent?: string;
  fileName?: string;
  onClose?: () => void;
}

export interface NotepadAppProps {
  id?: string;
  title?: string;
  initialContent?: string;
  fileName?: string;
  withFrame?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
  initialPosition?: { x: number; y: number; width: number; height: number };
}

export const generateNotepadText = () => {
  const skillsFormatted = PORTFOLIO_DATA.skills.join(', ');
  const languagesFormatted = PORTFOLIO_DATA.languages
    .map(l => `  * ${l.lang}: ${l.level}`)
    .join('\n');
  const experiencesFormatted = PORTFOLIO_DATA.experience
    .map(exp => `[${exp.period}] ${exp.role}\n  ${exp.description}`)
    .join('\n\n');

  return `======================================================================
SOBRE-CAIO.TXT - BLOCO DE NOTAS
======================================================================

NOME:         ${PORTFOLIO_DATA.name}
CARGO:        ${PORTFOLIO_DATA.title}
EXPERIÊNCIA:  +${PORTFOLIO_DATA.yearsOfExperience} anos de experiência comprovada no mercado de tecnologia

----------------------------------------------------------------------
[1] BIO & RESUMO PROFISSIONAL
----------------------------------------------------------------------
${PORTFOLIO_DATA.summary}

----------------------------------------------------------------------
[2] HABILIDADES TÉCNICAS (TECH STACK)
----------------------------------------------------------------------
${skillsFormatted}

----------------------------------------------------------------------
[3] IDIOMAS
----------------------------------------------------------------------
${languagesFormatted}

----------------------------------------------------------------------
[4] HISTÓRICO PROFISSIONAL
----------------------------------------------------------------------
${experiencesFormatted}

----------------------------------------------------------------------
[5] CONTATOS & CANAIS
----------------------------------------------------------------------
  * GitHub:   ${PORTFOLIO_DATA.contacts.github}
  * LinkedIn: ${PORTFOLIO_DATA.contacts.linkedin}
  * E-mail:   ${PORTFOLIO_DATA.contacts.email}

======================================================================
Arquivo gerado para Windows XP Luna Blue Edition | UTF-8 | CRLF
======================================================================`;
};

export const NotepadContent: React.FC<NotepadContentProps> = ({
  initialContent,
  fileName = 'sobre-caio.txt',
  onClose
}) => {
  const [content, setContent] = useState<string>(() =>
    initialContent !== undefined ? initialContent : generateNotepadText()
  );
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [cursorPos, setCursorPos] = useState({ line: 1, col: 1 });
  const [wordWrap, setWordWrap] = useState(true);

  const menuItems = ['Arquivo', 'Editar', 'Formatar', 'Exibir', 'Ajuda'];

  const handleCursorChange = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    const target = e.currentTarget;
    const textBeforeCursor = target.value.substring(0, target.selectionStart);
    const lines = textBeforeCursor.split('\n');
    setCursorPos({
      line: lines.length,
      col: lines[lines.length - 1].length + 1
    });
  };

  const handleMenuClick = (menu: string) => {
    setActiveMenu(prev => (prev === menu ? null : menu));
  };

  const handleCloseMenu = () => {
    setActiveMenu(null);
  };

  return (
    <div
      className="flex flex-col flex-1 h-full min-h-0 bg-white font-tahoma text-black text-xs select-none"
      onClick={handleCloseMenu}
    >
      {/* Top Menu Bar */}
      <div
        className="flex items-center gap-1 px-1 py-0.5 bg-[#ECE9D8] border-b border-[#D4D0C8] relative"
        onClick={e => e.stopPropagation()}
      >
        {menuItems.map(item => (
          <div key={item} className="relative">
            <button
              type="button"
              data-testid={`menu-${item}`}
              onClick={() => handleMenuClick(item)}
              className={`px-2 py-0.5 rounded-[2px] transition-colors ${
                activeMenu === item
                  ? 'bg-[#316AC5] text-white shadow-inner'
                  : 'hover:bg-[#B6BDD2] hover:text-black text-black'
              }`}
            >
              {item}
            </button>

            {/* Simulated XP Dropdown Menu */}
            {activeMenu === item && (
              <div
                className="absolute left-0 top-full mt-0.5 w-48 bg-white border border-[#002D96] shadow-md py-1 z-50 text-black text-xs"
                onClick={e => e.stopPropagation()}
              >
                {item === 'Arquivo' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = fileName;
                        a.click();
                        setActiveMenu(null);
                      }}
                      className="w-full text-left px-3 py-1 hover:bg-[#316AC5] hover:text-white flex justify-between"
                    >
                      <span>Salvar</span>
                      <span className="text-gray-400">Ctrl+S</span>
                    </button>
                    <div className="border-t border-gray-300 my-1" />
                    <button
                      type="button"
                      onClick={() => {
                        setActiveMenu(null);
                        if (onClose) onClose();
                      }}
                      className="w-full text-left px-3 py-1 hover:bg-[#316AC5] hover:text-white"
                    >
                      Sair
                    </button>
                  </>
                )}

                {item === 'Editar' && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard?.writeText(content);
                        setActiveMenu(null);
                      }}
                      className="w-full text-left px-3 py-1 hover:bg-[#316AC5] hover:text-white flex justify-between"
                    >
                      <span>Copiar Tudo</span>
                      <span className="text-gray-400">Ctrl+C</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setContent('');
                        setActiveMenu(null);
                      }}
                      className="w-full text-left px-3 py-1 hover:bg-[#316AC5] hover:text-white"
                    >
                      Limpar Conteúdo
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setContent(generateNotepadText());
                        setActiveMenu(null);
                      }}
                      className="w-full text-left px-3 py-1 hover:bg-[#316AC5] hover:text-white"
                    >
                      Restaurar Texto Original
                    </button>
                  </>
                )}

                {item === 'Formatar' && (
                  <button
                    type="button"
                    onClick={() => {
                      setWordWrap(prev => !prev);
                      setActiveMenu(null);
                    }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316AC5] hover:text-white flex items-center gap-2"
                  >
                    <span>{wordWrap ? '✓' : ' '}</span>
                    <span>Quebra automática de linha</span>
                  </button>
                )}

                {item === 'Exibir' && (
                  <button
                    type="button"
                    onClick={() => setActiveMenu(null)}
                    className="w-full text-left px-3 py-1 hover:bg-[#316AC5] hover:text-white flex items-center gap-2"
                  >
                    <span>✓</span>
                    <span>Barra de status</span>
                  </button>
                )}

                {item === 'Ajuda' && (
                  <button
                    type="button"
                    onClick={() => {
                      alert('Bloco de Notas do Windows XP Luna Blue\nPortfólio Caio - Engenharia de Software');
                      setActiveMenu(null);
                    }}
                    className="w-full text-left px-3 py-1 hover:bg-[#316AC5] hover:text-white"
                  >
                    Sobre o Bloco de Notas
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Monospace Text Area */}
      <div className="flex-1 flex flex-col min-h-0 bg-white relative">
        <textarea
          data-testid="notepad-textarea"
          value={content}
          onChange={e => setContent(e.target.value)}
          onKeyUp={handleCursorChange}
          onClick={handleCursorChange}
          spellCheck={false}
          className={`flex-1 w-full h-full p-2 font-mono text-[13px] leading-relaxed resize-none bg-white text-black outline-none border-none select-text ${
            wordWrap ? 'whitespace-pre-wrap' : 'whitespace-pre overflow-x-auto'
          }`}
        />
      </div>

      {/* Classic XP Status Bar */}
      <div
        data-testid="notepad-statusbar"
        className="flex items-center justify-between px-3 py-0.5 bg-[#ECE9D8] border-t border-[#ACA899] text-[11px] text-gray-800 select-none shadow-[inset_0_1px_0_#FFF]"
      >
        <div className="flex-1 px-2 border-r border-[#ACA899]">
          Linha {cursorPos.line}, Coluna {cursorPos.col}
        </div>
        <div className="w-24 text-center border-r border-[#ACA899]">
          100%
        </div>
        <div className="w-32 text-center border-r border-[#ACA899]">
          Windows (CRLF)
        </div>
        <div className="w-20 text-center">
          UTF-8
        </div>
      </div>
    </div>
  );
};

export const NotepadApp: React.FC<NotepadAppProps> = ({
  id = 'about-window',
  title = 'sobre-caio.txt - Bloco de notas',
  initialContent,
  fileName,
  withFrame = true,
  isOpen,
  onClose,
  className = '',
  initialPosition
}) => {
  let wm: ReturnType<typeof useWindowManager> | undefined;
  try {
    wm = useWindowManager();
  } catch {
    wm = undefined;
  }

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (wm) {
      wm.closeWindow(id);
    }
  };

  const content = (
    <NotepadContent
      initialContent={initialContent}
      fileName={fileName}
      onClose={handleClose}
    />
  );

  if (!withFrame) {
    return content;
  }

  return (
    <WindowFrame
      id={id}
      title={title}
      icon="notepad"
      isOpen={isOpen}
      onClose={handleClose}
      className={className}
      initialPosition={initialPosition}
    >
      {content}
    </WindowFrame>
  );
};

export default NotepadApp;
