import React, { useState } from 'react';
import { Card } from '../../../types/spider';
import { PlayingCard } from './PlayingCard';
import { getMovableSequence, canMoveCards } from '../../../utils/spiderEngine';

interface SpiderTableauProps {
  tableau: Card[][];
  onMove: (fromCol: number, cardIdx: number, toCol: number) => void;
}

export const SpiderTableau: React.FC<SpiderTableauProps> = ({ tableau, onMove }) => {
  const [dragInfo, setDragInfo] = useState<{ colIdx: number; cardIdx: number } | null>(null);

  const handleCardClick = (colIdx: number, cardIdx: number) => {
    const cardsToMove = getMovableSequence(tableau[colIdx], cardIdx);
    if (!cardsToMove) return;

    // Find the first valid destination column
    for (let targetCol = 0; targetCol < 10; targetCol++) {
      if (targetCol === colIdx) continue;
      if (canMoveCards(cardsToMove, tableau[targetCol])) {
        onMove(colIdx, cardIdx, targetCol);
        return;
      }
    }
  };

  const handleDragStart = (e: React.DragEvent, colIdx: number, cardIdx: number) => {
    const seq = getMovableSequence(tableau[colIdx], cardIdx);
    if (!seq) {
      e.preventDefault();
      return;
    }
    setDragInfo({ colIdx, cardIdx });
    e.dataTransfer.setData('text/plain', JSON.stringify({ colIdx, cardIdx }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetColIdx: number) => {
    e.preventDefault();
    if (!dragInfo) return;
    onMove(dragInfo.colIdx, dragInfo.cardIdx, targetColIdx);
    setDragInfo(null);
  };

  return (
    <div className="flex-1 grid grid-cols-10 gap-1 sm:gap-2 p-2 sm:p-3 overflow-x-auto min-h-0">
      {tableau.map((column, colIdx) => (
        <div
          key={colIdx}
          data-testid={`tableau-column-${colIdx}`}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, colIdx)}
          className="relative min-h-[320px] rounded border border-green-800/40 bg-green-900/10 flex flex-col items-center"
        >
          {column.length === 0 ? (
            <div
              onClick={() => {
                if (dragInfo) {
                  onMove(dragInfo.colIdx, dragInfo.cardIdx, colIdx);
                  setDragInfo(null);
                }
              }}
              className="w-16 h-24 sm:w-20 sm:h-28 rounded border border-dashed border-green-600/40 m-1 cursor-pointer"
            />
          ) : (
            column.map((card, cardIdx) => {
              const isTop = cardIdx === column.length - 1;
              const isMovable = getMovableSequence(column, cardIdx) !== null;

              return (
                <div
                  key={card.id}
                  draggable={isMovable}
                  onDragStart={(e) => handleDragStart(e, colIdx, cardIdx)}
                  style={{
                    position: cardIdx === 0 ? 'relative' : 'absolute',
                    top: cardIdx === 0 ? 0 : `${cardIdx * (card.isFaceUp ? 22 : 12)}px`,
                    zIndex: cardIdx + 1
                  }}
                >
                  <PlayingCard
                    card={card}
                    onClick={() => {
                      if (isTop) {
                        handleCardClick(colIdx, cardIdx);
                      }
                    }}
                    onDoubleClick={() => handleCardClick(colIdx, cardIdx)}
                  />
                </div>
              );
            })
          )}
        </div>
      ))}
    </div>
  );
};
