import React, { useState } from 'react';
import WindowFrame from './WindowFrame';
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
  return `======================================================================
SOBRE-CAIO.TXT - BLOCO DE NOTAS
======================================================================

NOME:         Caio Souza
CARGO:        Desenvolvedor Full Stack (Pleno III)
EMPRESA:      Single Software (meio período)
LOCAL:        Campina Grande, Paraíba - Brasil
EXPERIÊNCIA:  +6 anos no mercado | programando desde os 12 anos
FORMAÇÃO:     Bacharelado em Sistemas de Informação (Unifacisa)
STATUS:       Aberto a propostas de recrutadores (presencial/híbrido)

----------------------------------------------------------------------
[1] BIO & RESUMO PROFISSIONAL
----------------------------------------------------------------------
Desenvolvedor Full Stack que aprende explorando e testando na prática.
Essa curiosidade me levou à programação ainda na adolescência
(primeiro código aos 12 anos) e, mais tarde, à graduação em Sistemas
de Informação.

Hoje concentro meus esforços em evoluir tecnicamente, entender
sistemas de forma profunda e aplicar esse conhecimento na resolução de
problemas reais, do front-end ao banco de dados, da web ao mobile.

Valorizo ambientes que incentivam aprendizado contínuo e desafios bem
definidos.

  > Promovido de Junior a Pleno III em 1 ano e 3 meses na Single
    Software
  > Responsável por um app mobile completo, do zero até o preparo para
    as lojas
  > Do front à infra: backend, Docker, Traefik e storage S3 próprio

----------------------------------------------------------------------
[2] STACK / TECNOLOGIAS
----------------------------------------------------------------------
FRONT-END:    React.js, Next.js, TypeScript, JavaScript, HTML, CSS,
              Tailwind, Vite, Angular
MOBILE:       React Native, Expo (Router + EAS), NativeWind,
              Reanimated
BACK-END:     Node.js, Socket.IO, GraphQL (já passei por Java/Spring,
              PHP e Python)
BANCOS:       SQL, PostgreSQL, MySQL, Prisma, Firebase, Supabase
INFRA:        Docker, Traefik (proxy reverso), MinIO (S3
              auto-hospedado)
PAGAMENTOS:   Stripe, Pagar.me, Mercado Pago
FERRAMENTAS:  Git/GitHub/GitLab
IA:           RAG, embeddings e chat com streaming

----------------------------------------------------------------------
[3] EXPERIÊNCIA PROFISSIONAL
----------------------------------------------------------------------

[ 2025-01 > HOJE ]  SINGLE SOFTWARE - Campina Grande, PB
  Regime: meio período | presencial
  - 03/2026 - hoje  : Pleno III Software Developer
  - 01/2025 - 03/2026: Junior Software Developer
  Tecnologias: Vue, Nuxt, Python e mais

[ 2024-06 > 2025-02 ]  UNIFACISA CENTRO UNIVERSITÁRIO
  Desenvolvedor de software (estágio) | presencial
  Tecnologias: AngularJS

[ 2021-11 > 2023-09 ]  REDEPHARMA - Campina Grande, PB
  Desenvolvedor Full Stack (tempo integral) | presencial
  Tecnologias: React.js, PHP, Python e mais

[ AUTONOMO ]  MINK

----------------------------------------------------------------------
[4] PROJETOS EM DESTAQUE
----------------------------------------------------------------------

> HINÁRIO EAV  (github.com/kcaiosouza/hinarioeav-igcg)
  App mobile do hinário digital da Igreja em Campina Grande.
  - Stack: Expo, React Native, TypeScript, NativeWind, Reanimated
  - Offline-first: catálogo embutido + atualização remota por versão
    SemVer, download atômico e barra de progresso
  - Busca full-text com paginação virtual para manter a performance
  - Assistente de IA (RAG com embeddings) que recomenda hinos por tema
    ou assunto bíblico, com chat em streaming
  - Publicado oficialmente na Google Play Store:
    https://play.google.com/store/apps/details?id=br.com.igrejacg.hinarioeav
    (App Store em fase final de análise)

> IGCGMUSIC (igcgmusic.com.br)
  Plataforma web de streaming de CDs de música cristã, com player,
  playlists e modo aleatório. Feita em Next.js.

> IGCGMUSIC BETA  (beta.igcgmusic.com.br)
  Nova versão do IGCGMusic, agora com backend próprio e infraestrutura
  self-hosted, com bem mais funcionalidades que a v1.
  - Backend containerizado com Docker
  - Infra com Traefik como proxy reverso
  - Storage S3 auto-hospedado com MinIO
  - PostgreSQL como banco de dados
  - Integração com Stripe

> WHATWATCH  (whatwatch.vercel.app)
  Site para descobrir o que assistir. HTML, CSS e JavaScript, com
  sorteio de títulos e compartilhamento de resultados.


----------------------------------------------------------------------
[5] FORMAÇÃO
----------------------------------------------------------------------

  Unifacisa Centro Universitário
  Bacharelado em Sistemas de Informação
  ago/2023 - jul/2027 (em andamento)

  Fabrica de Aplicativos
  Curso Online - Sujeito Programador
  jan/2021 - jun/2021

----------------------------------------------------------------------
[6] CURIOSIDADES
----------------------------------------------------------------------

  * Escrevo código desde os 12 anos
  * Fora do teclado: jogando, praticando esports e socializando com
    os amigos
  * Se tem spec e plano antes do código, provavelmente fui eu, quando
    se trabalha com IA é necessário para uma acertividade melhor e
    gastando menos tokens

----------------------------------------------------------------------
[7] CONTATO
----------------------------------------------------------------------

  GITHUB:    https://github.com/kcaiosouza
  LINKEDIN:  https://linkedin.com/in/kcaiosouza

----------------------------------------------------------------------
[8] TODO.TXT
----------------------------------------------------------------------

  [ ] Concluir a graduação (07/2027)
  [ ] Evoluir meus códigos
  [ ] Especialização em IA
  [ ] Fechar o próximo desafio bem definido
  [ ] Beber água (sério!)

======================================================================
Última atualização: 10/2026
Fim do arquivo. Ctrl+S e boa sorte.
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
