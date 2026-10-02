import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { SpiderSolitaireApp } from '../components/windows/SpiderSolitaireApp';
import { WindowProvider } from '../context/WindowContext';
import { SystemProvider } from '../context/SystemContext';
import { createInitialGameState } from '../utils/spiderEngine';

describe('SpiderSolitaireApp', () => {
  beforeEach(() => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      drawImage: vi.fn(),
      beginPath: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      fillText: vi.fn(),
      rect: vi.fn(),
      roundRect: vi.fn()
    } as any);
  });
  it('renders green table, 10 tableau columns, and stock pile', () => {
    render(
      <SystemProvider>
        <WindowProvider>
          <SpiderSolitaireApp isOpen={true} />
        </WindowProvider>
      </SystemProvider>
    );

    expect(screen.getByText(/Paciência Spider/i)).toBeInTheDocument();
    expect(screen.getByText(/Pontuação:/i)).toBeInTheDocument();
    expect(screen.getByText(/Movimentos:/i)).toBeInTheDocument();

    for (let col = 0; col < 10; col++) {
      expect(screen.getByTestId(`tableau-column-${col}`)).toBeInTheDocument();
    }

    expect(screen.getByTestId('spider-stock-button')).toBeInTheDocument();
  });

  it('deals cards when clicking the stock button', () => {
    render(
      <SystemProvider>
        <WindowProvider>
          <SpiderSolitaireApp isOpen={true} />
        </WindowProvider>
      </SystemProvider>
    );

    const stockBtn = screen.getByTestId('spider-stock-button');
    fireEvent.click(stockBtn);

    expect(screen.getByText(/Movimentos: 1/i)).toBeInTheDocument();
  });

  it('displays the victory canvas when game is won', () => {
    const wonState = createInitialGameState('1-suit');
    wonState.isWon = true;
    wonState.completedRuns = 8;

    render(
      <SystemProvider>
        <WindowProvider>
          <SpiderSolitaireApp isOpen={true} initialState={wonState} />
        </WindowProvider>
      </SystemProvider>
    );

    expect(screen.getByTestId('victory-canvas-overlay')).toBeInTheDocument();
    expect(screen.getByText(/Parabéns! Você venceu!/i)).toBeInTheDocument();
  });
});
