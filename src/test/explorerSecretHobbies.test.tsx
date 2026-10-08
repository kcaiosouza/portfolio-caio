import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { ExplorerFolderApp, ExplorerFolderContent } from '../components/windows/ExplorerFolderApp';
import { SystemProvider, useSystem } from '../context/SystemContext';
import { WindowProvider } from '../context/WindowContext';

// Helper component to trigger unlock/lock while rendering ExplorerFolderContent
const ExplorerWithSystemControls: React.FC = () => {
  const { unlockSecretGames, lockSecretGames } = useSystem();
  return (
    <div>
      <button data-testid="btn-unlock" onClick={unlockSecretGames}>Unlock</button>
      <button data-testid="btn-lock" onClick={lockSecretGames}>Lock</button>
      <ExplorerFolderContent />
    </div>
  );
};

describe('ExplorerFolderApp - Hobbies secret games filtering', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('When secret games are locked (isSecretUnlocked: false)', () => {
    it('does not render Minecraft.exe and GTA_Vice_City.exe', () => {
      render(
        <SystemProvider>
          <ExplorerFolderContent />
        </SystemProvider>
      );

      expect(screen.queryByText('Minecraft.exe')).not.toBeInTheDocument();
      expect(screen.queryByText('GTA_Vice_City.exe')).not.toBeInTheDocument();
      expect(screen.queryByTestId('hobby-item-minecraft')).not.toBeInTheDocument();
      expect(screen.queryByTestId('hobby-item-vice-city')).not.toBeInTheDocument();
    });

    it('renders normal hobby items (Cafe_Especial.txt, Setup_Gamer.jpg, Minhas_Musicas.txt, Open_Source.txt)', () => {
      render(
        <SystemProvider>
          <ExplorerFolderContent />
        </SystemProvider>
      );

      expect(screen.getByTestId('hobby-item-cafe')).toBeInTheDocument();
      expect(screen.getByTestId('hobby-item-setup')).toBeInTheDocument();
      expect(screen.getByTestId('hobby-item-musica')).toBeInTheDocument();
      expect(screen.getByTestId('hobby-item-open-source')).toBeInTheDocument();
    });

    it('displays filtered count in status bar when no item is selected', () => {
      render(
        <SystemProvider>
          <ExplorerFolderContent />
        </SystemProvider>
      );

      // Deselect by clicking grid background
      const grid = screen.getByTestId('explorer-items-grid');
      fireEvent.click(grid);

      const statusbar = screen.getByTestId('explorer-statusbar');
      expect(statusbar.textContent).toContain('4 objeto(s)');
      expect(statusbar.textContent).not.toContain('6 objeto(s)');
    });

    it('falls back to locked state when rendered outside SystemProvider', () => {
      render(<ExplorerFolderContent />);

      expect(screen.queryByText('Minecraft.exe')).not.toBeInTheDocument();
      expect(screen.queryByText('GTA_Vice_City.exe')).not.toBeInTheDocument();

      const grid = screen.getByTestId('explorer-items-grid');
      fireEvent.click(grid);

      const statusbar = screen.getByTestId('explorer-statusbar');
      expect(statusbar.textContent).toContain('4 objeto(s)');
    });
  });

  describe('When secret games are unlocked (isSecretUnlocked: true)', () => {
    it('renders Minecraft.exe and GTA_Vice_City.exe alongside all other items', () => {
      localStorage.setItem('caio_xp_secret_games_unlocked', 'true');

      render(
        <SystemProvider>
          <ExplorerFolderContent />
        </SystemProvider>
      );

      expect(screen.getByText('Minecraft.exe')).toBeInTheDocument();
      expect(screen.getByText('GTA_Vice_City.exe')).toBeInTheDocument();
      expect(screen.getByTestId('hobby-item-minecraft')).toBeInTheDocument();
      expect(screen.getByTestId('hobby-item-vice-city')).toBeInTheDocument();
      expect(screen.getByTestId('hobby-item-cafe')).toBeInTheDocument();
      expect(screen.getByTestId('hobby-item-setup')).toBeInTheDocument();
      expect(screen.getByTestId('hobby-item-musica')).toBeInTheDocument();
      expect(screen.getByTestId('hobby-item-open-source')).toBeInTheDocument();
    });

    it('displays full count (6 objeto(s)) in status bar when no item is selected', () => {
      localStorage.setItem('caio_xp_secret_games_unlocked', 'true');

      render(
        <SystemProvider>
          <ExplorerFolderContent />
        </SystemProvider>
      );

      const grid = screen.getByTestId('explorer-items-grid');
      fireEvent.click(grid);

      const statusbar = screen.getByTestId('explorer-statusbar');
      expect(statusbar.textContent).toContain('6 objeto(s)');
    });
  });

  describe('Dynamic unlocking and locking transition & selection reset', () => {
    it('dynamically reveals secret games when unlocked, and resets selection if locked while selecting secret item', () => {
      render(
        <SystemProvider>
          <WindowProvider>
            <ExplorerWithSystemControls />
          </WindowProvider>
        </SystemProvider>
      );

      // Initially locked
      expect(screen.queryByTestId('hobby-item-minecraft')).not.toBeInTheDocument();

      // Unlock
      act(() => {
        fireEvent.click(screen.getByTestId('btn-unlock'));
      });

      // Now Minecraft is visible
      const minecraftItem = screen.getByTestId('hobby-item-minecraft');
      expect(minecraftItem).toBeInTheDocument();

      // Select Minecraft
      act(() => {
        fireEvent.click(minecraftItem);
      });

      // Verify sidebar details shows Minecraft
      const sidebarDetails = screen.getByTestId('sidebar-details');
      expect(sidebarDetails.textContent).toContain('Minecraft.exe');

      // Lock again
      act(() => {
        fireEvent.click(screen.getByTestId('btn-lock'));
      });

      // Minecraft should be gone
      expect(screen.queryByTestId('hobby-item-minecraft')).not.toBeInTheDocument();

      // Selected hobby must reset to visibleHobbies[0] (Cafe_Especial.txt) and not be Minecraft
      const updatedSidebarDetails = screen.getByTestId('sidebar-details');
      expect(updatedSidebarDetails.textContent).not.toContain('Minecraft.exe');
      expect(updatedSidebarDetails.textContent).toContain('Cafe_Especial.txt');
    });
  });
});
