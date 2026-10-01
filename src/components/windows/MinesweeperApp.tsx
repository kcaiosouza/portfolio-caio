import React, { useState, useEffect, useRef, useCallback } from 'react';
import WindowFrame from './WindowFrame';
import { soundEngine } from '../../utils/soundEffects';
import { useWindowManager } from '../../context/WindowContext';

export interface MinesweeperAppProps {
  id?: string;
  withFrame?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

type GameDifficulty = 'beginner' | 'intermediate';

interface DifficultyConfig {
  rows: number;
  cols: number;
  mines: number;
  width: number;
  height: number;
}

const DIFFICULTIES: Record<GameDifficulty, DifficultyConfig> = {
  beginner: { rows: 9, cols: 9, mines: 10, width: 280, height: 390 },
  intermediate: { rows: 16, cols: 16, mines: 40, width: 440, height: 550 },
};

interface Cell {
  row: number;
  col: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  isQuestion: boolean;
  neighborMines: number;
  isExploded?: boolean;
  isWrongFlag?: boolean;
}

export const MinesweeperContent: React.FC<{ difficulty: GameDifficulty; setDifficulty: (d: GameDifficulty) => void }> = ({
  difficulty,
  setDifficulty,
}) => {
  const config = DIFFICULTIES[difficulty];
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [gameState, setGameState] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  const [isMouseDown, setIsMouseDown] = useState(false);
  const [timer, setTimer] = useState(0);
  const [flagsCount, setFlagsCount] = useState(0);
  const [showMenu, setShowMenu] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Inicializar tabuleiro vazio
  const createEmptyGrid = useCallback((rows: number, cols: number): Cell[][] => {
    const newGrid: Cell[][] = [];
    for (let r = 0; r < rows; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < cols; c++) {
        row.push({
          row: r,
          col: c,
          isMine: false,
          isRevealed: false,
          isFlagged: false,
          isQuestion: false,
          neighborMines: 0,
        });
      }
      newGrid.push(row);
    }
    return newGrid;
  }, []);

  const resetGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setGrid(createEmptyGrid(config.rows, config.cols));
    setGameState('idle');
    setTimer(0);
    setFlagsCount(0);
    setIsMouseDown(false);
  }, [config, createEmptyGrid]);

  useEffect(() => {
    resetGame();
  }, [difficulty, resetGame]);

  // Cronômetro
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimer(t => Math.min(999, t + 1));
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState]);

  // Gerar minas garantindo que o primeiro clique seja 100% seguro (e seus vizinhos também)
  const populateMines = (initialRow: number, initialCol: number, currentGrid: Cell[][]): Cell[][] => {
    const newGrid = currentGrid.map(row => row.map(cell => ({ ...cell })));
    let placedMines = 0;

    // Células protegidas (o clique inicial e vizinhos imediatos)
    const safeCells = new Set<string>();
    for (let dr = -1; dr <= 1; dr++) {
      for (let dc = -1; dc <= 1; dc++) {
        const nr = initialRow + dr;
        const nc = initialCol + dc;
        if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols) {
          safeCells.add(`${nr},${nc}`);
        }
      }
    }

    while (placedMines < config.mines) {
      const r = Math.floor(Math.random() * config.rows);
      const c = Math.floor(Math.random() * config.cols);
      const key = `${r},${c}`;

      if (!newGrid[r][c].isMine && !safeCells.has(key)) {
        newGrid[r][c].isMine = true;
        placedMines++;
      }
    }

    // Calcular vizinhos
    for (let r = 0; r < config.rows; r++) {
      for (let c = 0; c < config.cols; c++) {
        if (!newGrid[r][c].isMine) {
          let count = 0;
          for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
              const nr = r + dr;
              const nc = c + dc;
              if (nr >= 0 && nr < config.rows && nc >= 0 && nc < config.cols && newGrid[nr][nc].isMine) {
                count++;
              }
            }
          }
          newGrid[r][c].neighborMines = count;
        }
      }
    }

    return newGrid;
  };

  // Revelar em cadeia (flood fill)
  const revealCell = (r: number, c: number) => {
    if (gameState === 'won' || gameState === 'lost') return;

    let currentGrid = grid;
    if (gameState === 'idle') {
      currentGrid = populateMines(r, c, grid);
      setGameState('playing');
    }

    const cell = currentGrid[r][c];
    if (cell.isRevealed || cell.isFlagged) return;

    soundEngine.playClick();

    // Clicou em mina -> Game Over
    if (cell.isMine) {
      soundEngine.playExplosion();
      setGameState('lost');

      const revealedGrid = currentGrid.map(row =>
        row.map(cItem => {
          if (cItem.row === r && cItem.col === c) {
            return { ...cItem, isRevealed: true, isExploded: true };
          }
          if (cItem.isMine && !cItem.isFlagged) {
            return { ...cItem, isRevealed: true };
          }
          if (!cItem.isMine && cItem.isFlagged) {
            return { ...cItem, isWrongFlag: true };
          }
          return cItem;
        })
      );
      setGrid(revealedGrid);
      return;
    }

    // Revelar célula e vizinhos se neighborMines === 0
    const newGrid = currentGrid.map(row => row.map(item => ({ ...item })));
    const queue: [number, number][] = [[r, c]];
    newGrid[r][c].isRevealed = true;

    while (queue.length > 0) {
      const [currR, currC] = queue.shift()!;
      const currCell = newGrid[currR][currC];

      if (currCell.neighborMines === 0 && !currCell.isMine) {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = currR + dr;
            const nc = currC + dc;
            if (
              nr >= 0 &&
              nr < config.rows &&
              nc >= 0 &&
              nc < config.cols &&
              !newGrid[nr][nc].isRevealed &&
              !newGrid[nr][nc].isFlagged &&
              !newGrid[nr][nc].isMine
            ) {
              newGrid[nr][nc].isRevealed = true;
              queue.push([nr, nc]);
            }
          }
        }
      }
    }

    // Verificar vitória: todas as células não-minas foram reveladas
    let unrevealedNonMines = 0;
    for (let row = 0; row < config.rows; row++) {
      for (let col = 0; col < config.cols; col++) {
        if (!newGrid[row][col].isMine && !newGrid[row][col].isRevealed) {
          unrevealedNonMines++;
        }
      }
    }

    if (unrevealedNonMines === 0) {
      soundEngine.playWin();
      setGameState('won');
      // Colocar bandeiras em todas as minas
      for (let row = 0; row < config.rows; row++) {
        for (let col = 0; col < config.cols; col++) {
          if (newGrid[row][col].isMine) {
            newGrid[row][col].isFlagged = true;
          }
        }
      }
      setFlagsCount(config.mines);
    }

    setGrid(newGrid);
  };

  // Clique direito: bandeira / interrogação
  const handleRightClick = (e: React.MouseEvent, r: number, c: number) => {
    e.preventDefault();
    if (gameState === 'won' || gameState === 'lost') return;

    const cell = grid[r][c];
    if (cell.isRevealed) return;

    soundEngine.playClick();
    const newGrid = grid.map(row => row.map(item => ({ ...item })));

    if (!cell.isFlagged && !cell.isQuestion) {
      newGrid[r][c].isFlagged = true;
      setFlagsCount(prev => prev + 1);
    } else if (cell.isFlagged) {
      newGrid[r][c].isFlagged = false;
      newGrid[r][c].isQuestion = true;
      setFlagsCount(prev => prev - 1);
    } else {
      newGrid[r][c].isQuestion = false;
    }

    setGrid(newGrid);
  };

  // Cores numéricas autênticas do XP
  const getNumberColor = (num: number) => {
    switch (num) {
      case 1: return '#0000FF'; // Azul
      case 2: return '#008000'; // Verde
      case 3: return '#FF0000'; // Vermelho
      case 4: return '#000080'; // Azul Marinho
      case 5: return '#800000'; // Vinho / Marrom
      case 6: return '#008080'; // Ciano
      case 7: return '#000000'; // Preto
      case 8: return '#808080'; // Cinza
      default: return '#000000';
    }
  };

  // Ícone da carinha
  const getFaceEmoji = () => {
    if (gameState === 'lost') return '😵';
    if (gameState === 'won') return '😎';
    if (isMouseDown) return '😮';
    return '🙂';
  };

  const remainingMines = Math.max(-99, Math.min(999, config.mines - flagsCount));
  const formattedMines = remainingMines < 0
    ? `-${String(Math.abs(remainingMines)).padStart(2, '0')}`
    : String(remainingMines).padStart(3, '0');

  const formattedTimer = String(timer).padStart(3, '0');

  return (
    <div
      onClick={() => setShowMenu(false)}
      className="flex flex-col bg-[#C0C0C0] font-tahoma select-none text-black p-1 h-full min-h-0"
    >
      {/* Menu Superior */}
      <div className="relative flex items-center gap-3 px-2 py-0.5 text-xs text-black border-b border-gray-400 mb-1">
        <button
          onClick={e => {
            e.stopPropagation();
            setShowMenu(prev => !prev);
          }}
          className="hover:bg-blue-600 hover:text-white px-1.5 py-0.5 rounded cursor-default"
        >
          Jogo
        </button>

        {showMenu && (
          <div className="absolute top-6 left-1 bg-[#ECE9D8] border-2 border-t-white border-l-white border-b-gray-600 border-r-gray-600 shadow-xl py-1 w-44 z-50 text-xs">
            <button
              onClick={() => { resetGame(); setShowMenu(false); }}
              className="w-full text-left px-3 py-1 hover:bg-[#0A246A] hover:text-white flex justify-between"
            >
              <span>Novo Jogo</span>
              <span className="text-gray-500 hover:text-gray-200">F2</span>
            </button>
            <div className="h-[1px] bg-gray-400 my-1 mx-1" />
            <button
              onClick={() => { setDifficulty('beginner'); setShowMenu(false); }}
              className="w-full text-left px-3 py-1 hover:bg-[#0A246A] hover:text-white flex items-center justify-between"
            >
              <span>Iniciante (9x9)</span>
              {difficulty === 'beginner' && <span>✓</span>}
            </button>
            <button
              onClick={() => { setDifficulty('intermediate'); setShowMenu(false); }}
              className="w-full text-left px-3 py-1 hover:bg-[#0A246A] hover:text-white flex items-center justify-between"
            >
              <span>Intermediário (16x16)</span>
              {difficulty === 'intermediate' && <span>✓</span>}
            </button>
          </div>
        )}
      </div>

      {/* Caixa do Jogo com Borda 3D Rebaixada */}
      <div className="p-2 border-2 border-t-white border-l-white border-b-gray-600 border-r-gray-600 bg-[#C0C0C0] flex flex-col items-center gap-2">
        {/* Placar Superior com Display Digital LED e Carinha */}
        <div className="w-full flex items-center justify-between px-2 py-1.5 border-2 border-t-gray-600 border-l-gray-600 border-b-white border-r-white bg-[#C0C0C0]">
          {/* Display LED de Minas */}
          <div className="bg-black text-[#FF0000] font-mono font-bold text-xl px-1.5 py-0.5 border border-gray-600 tracking-widest shadow-inner rounded-xs">
            {formattedMines}
          </div>

          {/* Botão da Carinha Amarela */}
          <button
            onClick={resetGame}
            title="Novo Jogo"
            className="w-7 h-7 flex items-center justify-center bg-[#C0C0C0] border-2 border-t-white border-l-white border-b-gray-600 border-r-gray-600 active:border-t-gray-600 active:border-l-gray-600 active:border-b-white active:border-r-white text-base shadow-xs"
          >
            {getFaceEmoji()}
          </button>

          {/* Display LED do Cronômetro */}
          <div className="bg-black text-[#FF0000] font-mono font-bold text-xl px-1.5 py-0.5 border border-gray-600 tracking-widest shadow-inner rounded-xs">
            {formattedTimer}
          </div>
        </div>

        {/* Tabuleiro de Células */}
        <div
          onMouseDown={() => setIsMouseDown(true)}
          onMouseUp={() => setIsMouseDown(false)}
          onMouseLeave={() => setIsMouseDown(false)}
          className="border-3 border-t-gray-600 border-l-gray-600 border-b-white border-r-white bg-[#808080] p-[2px] overflow-auto max-w-full"
        >
          <div
            className="grid gap-[1px]"
            style={{
              gridTemplateColumns: `repeat(${config.cols}, 20px)`,
            }}
          >
            {grid.map((row, r) =>
              row.map((cell, c) => {
                if (cell.isRevealed) {
                  return (
                    <div
                      key={`${r}-${c}`}
                      className={`w-5 h-5 flex items-center justify-center font-bold text-xs select-none border border-gray-400 ${
                        cell.isExploded ? 'bg-red-600' : 'bg-[#C0C0C0]'
                      }`}
                    >
                      {cell.isMine ? (
                        <span className="text-black text-sm">💣</span>
                      ) : cell.neighborMines > 0 ? (
                        <span style={{ color: getNumberColor(cell.neighborMines) }}>
                          {cell.neighborMines}
                        </span>
                      ) : (
                        ''
                      )}
                    </div>
                  );
                }

                // Célula Oculta
                return (
                  <button
                    key={`${r}-${c}`}
                    type="button"
                    onClick={() => revealCell(r, c)}
                    onContextMenu={e => handleRightClick(e, r, c)}
                    className="w-5 h-5 flex items-center justify-center bg-[#C0C0C0] border-2 border-t-white border-l-white border-b-gray-600 border-r-gray-600 active:border active:border-gray-500 text-xs font-bold shadow-xs select-none"
                  >
                    {cell.isWrongFlag ? (
                      <span className="text-red-700 font-bold text-xs">❌</span>
                    ) : cell.isFlagged ? (
                      <span className="text-red-600 text-xs">🚩</span>
                    ) : cell.isQuestion ? (
                      <span className="text-blue-800 text-xs font-bold">?</span>
                    ) : (
                      ''
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const MinesweeperApp: React.FC<MinesweeperAppProps> = ({
  id = 'minesweeper-window',
  withFrame = true,
  isOpen,
  onClose,
  className = '',
}) => {
  const [difficulty, setDifficulty] = useState<GameDifficulty>('beginner');
  const config = DIFFICULTIES[difficulty];
  const { updateWindowPosition } = useWindowManager();

  useEffect(() => {
    updateWindowPosition(id, { width: config.width, height: config.height });
  }, [difficulty, id, config.width, config.height, updateWindowPosition]);

  const content = (
    <MinesweeperContent
      difficulty={difficulty}
      setDifficulty={setDifficulty}
    />
  );

  if (!withFrame) {
    return <div className={className}>{content}</div>;
  }

  return (
    <WindowFrame
      id={id}
      title="Campo Minado"
      icon={
        <span className="text-xs">💣</span>
      }
      isOpen={isOpen}
      onClose={onClose}
      className={className}
      initialPosition={{ x: 220, y: 70, width: config.width, height: config.height }}
    >
      {content}
    </WindowFrame>
  );
};

export default MinesweeperApp;
