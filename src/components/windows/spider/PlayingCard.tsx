import React from 'react';
import { Card } from '../../../types/spider';

interface PlayingCardProps {
  card: Card;
  isDragging?: boolean;
  className?: string;
  style?: React.CSSProperties;
  onClick?: (e: React.MouseEvent) => void;
  onDoubleClick?: (e: React.MouseEvent) => void;
}

const SUIT_SYMBOLS: Record<string, { symbol: string; color: string }> = {
  spades: { symbol: '♠', color: '#000000' },
  hearts: { symbol: '♥', color: '#D80000' },
  diamonds: { symbol: '♦', color: '#D80000' },
  clubs: { symbol: '♣', color: '#000000' }
};

const RANK_LABELS: Record<number, string> = {
  1: 'A',
  2: '2',
  3: '3',
  4: '4',
  5: '5',
  6: '6',
  7: '7',
  8: '8',
  9: '9',
  10: '10',
  11: 'J',
  12: 'Q',
  13: 'K'
};

export const PlayingCard: React.FC<PlayingCardProps> = ({
  card,
  isDragging,
  className = '',
  style,
  onClick,
  onDoubleClick
}) => {
  if (!card.isFaceUp) {
    // Authentic retro blue patterned card back
    return (
      <div
        style={style}
        onClick={onClick}
        className={`w-16 h-24 sm:w-20 sm:h-28 rounded-md border-2 border-white shadow-md bg-[#0B409C] flex items-center justify-center select-none overflow-hidden ${className} ${
          isDragging ? 'opacity-60' : ''
        }`}
      >
        <div className="w-full h-full m-1 border border-white/60 rounded-xs bg-[radial-gradient(#1E6CE8_1.5px,transparent_1.5px)] [background-size:6px_6px] flex items-center justify-center">
          <div className="w-6 h-8 rounded-full border border-white/80 bg-[#003080] flex items-center justify-center text-white/90 text-xs font-serif shadow-inner">
            ✦
          </div>
        </div>
      </div>
    );
  }

  const { symbol, color } = SUIT_SYMBOLS[card.suit];
  const rankLabel = RANK_LABELS[card.rank];

  return (
    <div
      style={{ ...style, color }}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      data-testid={`card-${card.suit}-${card.rank}`}
      className={`w-16 h-24 sm:w-20 sm:h-28 rounded-md border border-gray-400 bg-white shadow-md select-none flex flex-col justify-between p-1.5 font-sans cursor-pointer transition-transform ${className} ${
        isDragging ? 'opacity-60 scale-105' : 'hover:brightness-95'
      }`}
    >
      {/* Top Left Corner */}
      <div className="flex flex-col items-center leading-none w-4">
        <span className="font-bold text-xs sm:text-sm">{rankLabel}</span>
        <span className="text-xs sm:text-sm">{symbol}</span>
      </div>

      {/* Center Center Symbol or Royal Face */}
      <div className="flex items-center justify-center text-xl sm:text-2xl font-bold opacity-90 select-none">
        {card.rank >= 11 ? rankLabel : symbol}
      </div>

      {/* Bottom Right Corner (Inverted) */}
      <div className="flex flex-col items-center leading-none w-4 self-end rotate-180">
        <span className="font-bold text-xs sm:text-sm">{rankLabel}</span>
        <span className="text-xs sm:text-sm">{symbol}</span>
      </div>
    </div>
  );
};
