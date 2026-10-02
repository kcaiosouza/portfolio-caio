import React, { useEffect, useRef } from 'react';

interface VictoryCanvasProps {
  onRestart: () => void;
}

interface BouncingCard {
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
  suit: string;
  rank: string;
}

export const VictoryCanvas: React.FC<VictoryCanvasProps> = ({ onRestart }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext('2d');
    } catch {
      ctx = null;
    }
    if (!ctx) return;

    let animationFrameId: number;
    const width = (canvas.width = canvas.parentElement?.clientWidth || 840);
    const height = (canvas.height = canvas.parentElement?.clientHeight || 560);

    const cards: BouncingCard[] = [];
    const suits = ['♠', '♥', '♦', '♣'];
    const ranks = ['K', 'Q', 'J', '10', '9', '8', '7', '6', '5', '4', '3', '2', 'A'];

    let cardCounter = 0;
    const totalCardsToDrop = 104;

    const spawnCard = () => {
      if (cardCounter >= totalCardsToDrop) return;
      const rank = ranks[cardCounter % 13];
      const suit = suits[Math.floor(cardCounter / 26) % 4];
      cards.push({
        x: Math.random() * (width - 120) + 40,
        y: 60,
        vx: (Math.random() - 0.5) * 12,
        vy: -(Math.random() * 8 + 5),
        width: 56,
        height: 78,
        suit,
        rank
      });
      cardCounter++;
    };

    // Spawn 1 card every 100ms
    const spawner = setInterval(spawnCard, 100);

    const gravity = 0.55;
    const bounceDamping = 0.84;

    const render = () => {
      // NOTE: Intentionally do NOT clearRect to create the legendary Windows XP card trail!
      for (const card of cards) {
        card.vy += gravity;
        card.x += card.vx;
        card.y += card.vy;

        // Ground collision
        if (card.y + card.height >= height) {
          card.y = height - card.height;
          card.vy = -card.vy * bounceDamping;
          card.vx *= 0.98; // slight rolling friction
        }

        // Wall collision
        if (card.x <= 0 || card.x + card.width >= width) {
          card.vx = -card.vx;
        }

        // Draw card onto canvas
        ctx.fillStyle = '#FFFFFF';
        ctx.strokeStyle = '#222222';
        ctx.lineWidth = 1;
        ctx.beginPath();
        if (ctx.roundRect) {
          ctx.roundRect(card.x, card.y, card.width, card.height, 4);
        } else {
          ctx.rect(card.x, card.y, card.width, card.height);
        }
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = card.suit === '♥' || card.suit === '♦' ? '#D80000' : '#000000';
        ctx.font = 'bold 12px sans-serif';
        ctx.fillText(card.rank, card.x + 4, card.y + 14);
        ctx.fillText(card.suit, card.x + 4, card.y + 26);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      clearInterval(spawner);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div
      data-testid="victory-canvas-overlay"
      className="absolute inset-0 z-50 flex flex-col items-center justify-between pointer-events-auto"
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      <div className="relative z-10 mt-8 bg-[#ECE9D8] border-2 border-white shadow-2xl p-4 rounded text-center max-w-sm">
        <h2 className="text-xl font-bold text-green-900 mb-1">Parabéns! Você venceu!</h2>
        <p className="text-xs text-gray-700 mb-3">
          Todas as 8 sequências de cartas foram organizadas com sucesso!
        </p>
        <button
          type="button"
          onClick={onRestart}
          className="px-4 py-1.5 text-xs font-bold text-black bg-gradient-to-b from-white via-[#ECE9D8] to-[#D8D4C8] border border-[#003C74] rounded hover:border-[#F2A000] active:scale-95 shadow"
        >
          Jogar Novamente
        </button>
      </div>
    </div>
  );
};
