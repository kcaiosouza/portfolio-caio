import React, { useState } from 'react';
import { WindowFrame } from './WindowFrame';
import { SpiderTableau } from './spider/SpiderTableau';
import { SpiderStock } from './spider/SpiderStock';
import { VictoryCanvas } from './spider/VictoryCanvas';
import {
  createInitialGameState,
  dealFromStock,
  moveCards,
  undoMove
} from '../../utils/spiderEngine';
import { Difficulty, SpiderGameState } from '../../types/spider';

export interface SpiderSolitaireAppProps {
  id?: string;
  isOpen?: boolean;
  onClose?: () => void;
  initialState?: SpiderGameState;
}

export const SpiderSolitaireApp: React.FC<SpiderSolitaireAppProps> = ({
  id = 'spider-solitaire-window',
  isOpen,
  onClose,
  initialState
}) => {
  const [difficulty, setDifficulty] = useState<Difficulty>('1-suit');
  const [gameState, setGameState] = useState<SpiderGameState>(() =>
    initialState || createInitialGameState('1-suit')
  );
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const handleRestart = (newDiff: Difficulty = difficulty) => {
    setDifficulty(newDiff);
    setGameState(createInitialGameState(newDiff));
    setActiveMenu(null);
  };

  const handleMove = (fromCol: number, cardIdx: number, toCol: number) => {
    setGameState(prev => moveCards(prev, fromCol, cardIdx, toCol));
  };

  const handleDeal = () => {
    setGameState(prev => dealFromStock(prev));
  };

  const handleUndo = () => {
    setGameState(prev => undoMove(prev));
    setActiveMenu(null);
  };

  return (
    <WindowFrame
      id={id}
      title="Paciência Spider"
      icon="spider"
      isOpen={isOpen}
      onClose={onClose}
      initialPosition={{ x: 70, y: 30, width: 840, height: 600 }}
    >
      <div className="flex flex-col h-full bg-[#007A33] font-tahoma select-none overflow-hidden relative">
        {/* Menu Bar */}
        <div className="flex items-center px-1.5 py-0.5 bg-[#ECE9D8] border-b border-[#D8D4C8] text-xs text-black">
          <div className="relative">
            <button
              type="button"
              onClick={() => setActiveMenu(activeMenu === 'jogo' ? null : 'jogo')}
              className={`px-2 py-0.5 rounded-sm hover:bg-[#316AC5] hover:text-white ${
                activeMenu === 'jogo' ? 'bg-[#316AC5] text-white' : ''
              }`}
            >
              Jogo
            </button>
            {activeMenu === 'jogo' && (
              <div className="absolute top-full left-0 mt-0.5 bg-white border border-[#7F9DB9] shadow-md py-1 min-w-[170px] z-50 text-black">
                <div
                  className="px-4 py-1 hover:bg-[#316AC5] hover:text-white cursor-pointer"
                  onClick={() => handleRestart(difficulty)}
                >
                  Novo jogo (F2)
                </div>
                <div
                  className="px-4 py-1 hover:bg-[#316AC5] hover:text-white cursor-pointer"
                  onClick={handleUndo}
                >
                  Desfazer (Ctrl+Z)
                </div>
                <div className="border-t border-[#D8D4C8] my-1" />
                <div
                  className="px-4 py-1 hover:bg-[#316AC5] hover:text-white cursor-pointer font-bold"
                  onClick={() => handleRestart('1-suit')}
                >
                  Fácil (1 Naipe) {difficulty === '1-suit' && '✓'}
                </div>
                <div
                  className="px-4 py-1 hover:bg-[#316AC5] hover:text-white cursor-pointer"
                  onClick={() => handleRestart('2-suits')}
                >
                  Médio (2 Naipes) {difficulty === '2-suits' && '✓'}
                </div>
                <div
                  className="px-4 py-1 hover:bg-[#316AC5] hover:text-white cursor-pointer"
                  onClick={() => handleRestart('4-suits')}
                >
                  Difícil (4 Naipes) {difficulty === '4-suits' && '✓'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 10 Tableau Columns */}
        <SpiderTableau tableau={gameState.tableau} onMove={handleMove} />

        {/* Stock & Foundations */}
        <SpiderStock
          stockCount={gameState.stock.length * 10}
          completedRuns={gameState.completedRuns}
          onDeal={handleDeal}
        />

        {/* Status Bar */}
        <div className="flex items-center justify-between px-3 py-1 bg-[#ECE9D8] border-t border-[#D8D4C8] text-xs text-gray-700">
          <span>Pontuação: {gameState.score}</span>
          <span>Movimentos: {gameState.moves}</span>
        </div>

        {/* Victory Screen with Bouncing Card Cascade Canvas */}
        {gameState.isWon && <VictoryCanvas onRestart={() => handleRestart(difficulty)} />}
      </div>
    </WindowFrame>
  );
};
