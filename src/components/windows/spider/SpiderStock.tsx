import React from 'react';

interface SpiderStockProps {
  stockCount: number;
  completedRuns: number;
  onDeal: () => void;
}

export const SpiderStock: React.FC<SpiderStockProps> = ({
  stockCount,
  completedRuns,
  onDeal
}) => {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-t border-green-800 bg-[#006020]/40">
      {/* Left: Completed Foundation Runs */}
      <div className="flex items-center space-x-1 sm:space-x-1.5" data-testid="spider-foundations">
        {Array.from({ length: 8 }).map((_, idx) => {
          const isCollected = idx < completedRuns;
          return (
            <div
              key={idx}
              className={`w-10 h-14 sm:w-12 sm:h-16 rounded border ${
                isCollected
                  ? 'border-yellow-300 bg-white shadow-md flex flex-col items-center justify-center text-black'
                  : 'border-green-800/80 bg-green-900/30'
              } flex items-center justify-center text-xs font-bold`}
            >
              {isCollected ? (
                <>
                  <span className="text-[10px] leading-tight">K</span>
                  <span className="text-sm">♠</span>
                </>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* Right: Stock Deal Pile */}
      <div className="flex items-center space-x-2">
        <span className="text-white text-xs font-bold drop-shadow">
          Restam: {stockCount}
        </span>
        <button
          type="button"
          disabled={stockCount === 0}
          onClick={onDeal}
          data-testid="spider-stock-button"
          title={stockCount > 0 ? 'Comprar 10 cartas' : 'Estoque vazio'}
          className="relative w-12 h-16 sm:w-14 sm:h-20 rounded border-2 border-white shadow-lg bg-[#0B409C] cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-95 transition-transform"
        >
          {stockCount > 0 && (
            <div className="w-full h-full p-1 bg-[radial-gradient(#1E6CE8_1px,transparent_1px)] [background-size:4px_4px] flex items-center justify-center text-white text-xs">
              🂠
            </div>
          )}
        </button>
      </div>
    </div>
  );
};
