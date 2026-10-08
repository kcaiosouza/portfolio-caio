import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { WindowProvider, useWindowManager } from '../context/WindowContext';
import { SystemProvider } from '../context/SystemContext';
import { PORTFOLIO_DATA, HOBBIES_ITEMS, TRASH_ITEMS } from '../utils/data';
import { soundEngine } from '../utils/soundEffects';

import NotepadApp, { NotepadContent } from '../components/windows/NotepadApp';
import PdfViewerApp, { PdfViewerContent } from '../components/windows/PdfViewerApp';
import ExplorerFolderApp, { ExplorerFolderContent } from '../components/windows/ExplorerFolderApp';
import RecycleBinApp, { RecycleBinContent } from '../components/windows/RecycleBinApp';

describe('Windows XP Portfolio Applications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  // --------------------------------------------------------------------------
  // 1. NotepadApp Tests
  // --------------------------------------------------------------------------
  describe('NotepadApp', () => {
    it('renders with window frame, title and menu bar', () => {
      render(
        <WindowProvider>
          <NotepadApp isOpen={true} />
        </WindowProvider>
      );

      expect(screen.getByText('sobre-caio.txt - Bloco de notas')).toBeInTheDocument();

      const menus = ['Arquivo', 'Editar', 'Formatar', 'Exibir', 'Ajuda'];
      menus.forEach(menu => {
        expect(screen.getByTestId(`menu-${menu}`)).toBeInTheDocument();
      });
    });

    it('displays bio, +8 years experience, skills, languages, and contacts from PORTFOLIO_DATA', () => {
      render(<NotepadContent />);

      const textarea = screen.getByTestId('notepad-textarea') as HTMLTextAreaElement;
      expect(textarea).toBeInTheDocument();

      // Check updated bio content inside textarea value
      expect(textarea.value).toContain('Caio Souza');
      expect(textarea.value).toContain('Single Software');
      expect(textarea.value).toContain('Desenvolvedor Full Stack (Pleno III)');
      expect(textarea.value).toContain('HINÁRIO EAV');
      expect(textarea.value).toContain('IGCGMUSIC');
      expect(textarea.value).toContain(PORTFOLIO_DATA.contacts.github);
      expect(textarea.value).toContain(PORTFOLIO_DATA.contacts.linkedin);
    });

    it('renders status bar with line/column information', () => {
      render(<NotepadContent />);

      const statusbar = screen.getByTestId('notepad-statusbar');
      expect(statusbar).toBeInTheDocument();
      expect(statusbar.textContent).toContain('Linha 1, Coluna 1');
      expect(statusbar.textContent).toContain('Windows (CRLF)');
      expect(statusbar.textContent).toContain('UTF-8');
    });

    it('interacts with menu items', () => {
      render(<NotepadContent />);

      const arquivoMenu = screen.getByTestId('menu-Arquivo');
      fireEvent.click(arquivoMenu);

      expect(screen.getByText('Salvar')).toBeInTheDocument();
      expect(screen.getByText('Sair')).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // 2. PdfViewerApp Tests
  // --------------------------------------------------------------------------
  describe('PdfViewerApp', () => {
    it('renders toolbar, title, and structured professional resume', () => {
      render(
        <WindowProvider>
          <PdfViewerApp isOpen={true} />
        </WindowProvider>
      );

      expect(screen.getByText('caio-cv.pdf - Visualizador de Documentos')).toBeInTheDocument();
      expect(screen.getByTestId('btn-download-cv')).toBeInTheDocument();

      const paper = screen.getByTestId('cv-paper');
      expect(paper).toBeInTheDocument();
      expect(paper.textContent).toContain(PORTFOLIO_DATA.name);
      expect(paper.textContent).toContain(PORTFOLIO_DATA.title);
      expect(paper.textContent).toContain('Resumo Profissional');
      expect(paper.textContent).toContain('Experiência Profissional');
    });

    it('handles zoom in, zoom out, and reset', () => {
      render(<PdfViewerContent />);

      const zoomReset = screen.getByTestId('btn-zoom-reset');
      const zoomIn = screen.getByTestId('btn-zoom-in');
      const zoomOut = screen.getByTestId('btn-zoom-out');

      expect(zoomReset.textContent).toBe('100%');

      fireEvent.click(zoomIn);
      expect(zoomReset.textContent).toBe('115%');

      fireEvent.click(zoomOut);
      fireEvent.click(zoomOut);
      expect(zoomReset.textContent).toBe('85%');

      fireEvent.click(zoomReset);
      expect(zoomReset.textContent).toBe('100%');
    });

    it('triggers cv download when "Baixar Currículo" is clicked', () => {
      const clickSpy = vi.spyOn(soundEngine, 'playClick');
      const anchorClickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

      // Mock createObjectURL & revokeObjectURL
      const mockCreateObjectURL = vi.fn().mockReturnValue('blob:mock-url');
      const mockRevokeObjectURL = vi.fn();
      window.URL.createObjectURL = mockCreateObjectURL;
      window.URL.revokeObjectURL = mockRevokeObjectURL;

      render(<PdfViewerContent />);

      const downloadBtn = screen.getByTestId('btn-download-cv');
      fireEvent.click(downloadBtn);

      expect(clickSpy).toHaveBeenCalled();
      expect(mockCreateObjectURL).toHaveBeenCalled();
      anchorClickSpy.mockRestore();
    });
  });

  // --------------------------------------------------------------------------
  // 3. ExplorerFolderApp Tests
  // --------------------------------------------------------------------------
  describe('ExplorerFolderApp', () => {
    it('renders explorer folder for hobbies with address bar and sidebar', () => {
      render(
        <WindowProvider>
          <ExplorerFolderApp isOpen={true} />
        </WindowProvider>
      );

      expect(screen.getByText('hobbies')).toBeInTheDocument();
      expect(screen.getByText(/C:\\Documents and Settings\\Caio\\Meus Documentos\\hobbies/i)).toBeInTheDocument();
      expect(screen.getByTestId('explorer-sidebar')).toBeInTheDocument();
      expect(screen.getByTestId('explorer-items-grid')).toBeInTheDocument();
    });

    it('renders all hobbies items from HOBBIES_ITEMS', () => {
      localStorage.setItem('caio_xp_secret_games_unlocked', 'true');
      render(
        <SystemProvider>
          <ExplorerFolderContent />
        </SystemProvider>
      );

      HOBBIES_ITEMS.forEach(hobby => {
        expect(screen.getAllByText(hobby.title)[0]).toBeInTheDocument();
      });
    });

    it('selects hobby item on click and updates sidebar details', () => {
      render(<ExplorerFolderContent />);

      const hobbyItem = screen.getByTestId('hobby-item-setup');
      fireEvent.click(hobbyItem);

      const sidebarDetails = screen.getByTestId('sidebar-details');
      expect(sidebarDetails.textContent).toContain('Setup_Gamer.jpg');
      expect(sidebarDetails.textContent).toContain('Estética retrô & PC Gaming');
    });

    it('opens hobby item window on double click via WindowManager', () => {
      const TestComponent = () => {
        const { windows } = useWindowManager();
        const musicaWin = windows.find(w => w.id === 'hobby-musica-window');
        return (
          <>
            <ExplorerFolderContent />
            {musicaWin?.isOpen && <div data-testid="hobby-musica-opened">Musica Aberta</div>}
          </>
        );
      };

      render(
        <WindowProvider>
          <TestComponent />
        </WindowProvider>
      );

      const hobbyItem = screen.getByTestId('hobby-item-musica');
      fireEvent.doubleClick(hobbyItem);

      expect(screen.getByTestId('hobby-musica-opened')).toBeInTheDocument();
    });
  });

  // --------------------------------------------------------------------------
  // 4. RecycleBinApp Tests
  // --------------------------------------------------------------------------
  describe('RecycleBinApp', () => {
    it('renders Recycle Bin with TRASH_ITEMS nostalgic dev jokes', () => {
      render(
        <WindowProvider>
          <RecycleBinApp isOpen={true} />
        </WindowProvider>
      );

      expect(screen.getAllByText('Lixeira')[0]).toBeInTheDocument();

      TRASH_ITEMS.forEach(item => {
        expect(screen.getByText(item.name)).toBeInTheDocument();
        expect(screen.getByText(item.size)).toBeInTheDocument();
      });
    });

    it('opens confirmation popup when "Esvaziar a Lixeira" is clicked and cancels correctly', () => {
      render(<RecycleBinContent />);

      const emptyBtn = screen.getByTestId('btn-empty-recycle-bin');
      fireEvent.click(emptyBtn);

      expect(screen.getByTestId('confirm-empty-dialog')).toBeInTheDocument();
      expect(
        screen.getByText(/Tem certeza de que deseja excluir permanentemente estes 4 itens\?/i)
      ).toBeInTheDocument();

      // Click "Não" to cancel
      const cancelBtn = screen.getByTestId('btn-confirm-no');
      fireEvent.click(cancelBtn);

      expect(screen.queryByTestId('confirm-empty-dialog')).not.toBeInTheDocument();
      // Items are still present
      expect(screen.getByText('Internet Explorer 6.exe')).toBeInTheDocument();
    });

    it('empties trash and plays sound when confirming "Sim"', () => {
      const soundSpy = vi.spyOn(soundEngine, 'playTrashEmpty');

      render(<RecycleBinContent />);

      const emptyBtn = screen.getByTestId('btn-empty-recycle-bin');
      fireEvent.click(emptyBtn);

      const confirmYes = screen.getByTestId('btn-confirm-yes');
      fireEvent.click(confirmYes);

      expect(soundSpy).toHaveBeenCalledTimes(1);
      expect(screen.queryByTestId('confirm-empty-dialog')).not.toBeInTheDocument();
      expect(screen.getByTestId('recycle-bin-empty-state')).toBeInTheDocument();
      expect(screen.getByText('A Lixeira está vazia.')).toBeInTheDocument();
    });
  });
});
