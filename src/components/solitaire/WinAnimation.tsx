import React, { useEffect, useRef } from 'react';
import { Card } from '../../types/solitaire';
import { getCardColor, getRankLabel, getSuitSymbol } from './solitaireLogic';

interface WinAnimationProps {
  cards: Card[][]; // 4 foundation piles
  onComplete?: () => void;
}

interface BouncingCard {
  card: Card;
  x: number;
  y: number;
  vx: number;
  vy: number;
  width: number;
  height: number;
}

export const WinAnimation: React.FC<WinAnimationProps> = ({ cards }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    // Flatten all cards from King downwards
    const cardPool: { card: Card; startX: number; startY: number }[] = [];
    const cardWidth = Math.min(80, width * 0.1);
    const cardHeight = cardWidth * 1.4;

    cards.forEach((pile, pileIdx) => {
      const startX = width * 0.5 + (pileIdx - 1.5) * (cardWidth + 12);
      const startY = 80;
      for (let i = pile.length - 1; i >= 0; i--) {
        cardPool.push({
          card: pile[i],
          startX,
          startY,
        });
      }
    });

    const activeCards: BouncingCard[] = [];
    let currentCardIdx = 0;
    let frameId: number;
    let framesSinceLastSpawn = 0;

    const gravity = 0.45;
    const bounceFactor = -0.82;

    const drawCardCanvas = (bCard: BouncingCard) => {
      const { card, x, y, width: w, height: h } = bCard;
      const isRed = getCardColor(card.suit) === 'red';
      const rankStr = getRankLabel(card.rank);
      const suitStr = getSuitSymbol(card.suit);

      // Card Body
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1;

      // Rounded rect
      const radius = 6;
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + w - radius, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
      ctx.lineTo(x + w, y + h - radius);
      ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
      ctx.lineTo(x + radius, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Card Rank & Suit
      ctx.fillStyle = isRed ? '#dc2626' : '#0f172a';
      ctx.font = `bold ${Math.floor(w * 0.22)}px sans-serif`;
      ctx.fillText(rankStr, x + 6, y + w * 0.24);
      ctx.font = `${Math.floor(w * 0.18)}px sans-serif`;
      ctx.fillText(suitStr, x + 6, y + w * 0.44);

      // Center Suit
      ctx.font = `${Math.floor(w * 0.45)}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(suitStr, x + w / 2, y + h / 2);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    };

    const render = () => {
      // Trail effect instead of clearRect for classic Solitaire waterfall effect!
      framesSinceLastSpawn++;
      if (framesSinceLastSpawn > 12 && currentCardIdx < cardPool.length) {
        const item = cardPool[currentCardIdx];
        const vx = (Math.random() - 0.5) * 8;
        const vy = -(Math.random() * 4 + 2);
        activeCards.push({
          card: item.card,
          x: item.startX,
          y: item.startY,
          vx: vx === 0 ? 3 : vx,
          vy,
          width: cardWidth,
          height: cardHeight,
        });
        currentCardIdx++;
        framesSinceLastSpawn = 0;
      }

      // Update & draw active cards
      for (let i = activeCards.length - 1; i >= 0; i--) {
        const b = activeCards[i];
        b.vy += gravity;
        b.x += b.vx;
        b.y += b.vy;

        // Bounce on bottom
        if (b.y + b.height >= height) {
          b.y = height - b.height;
          b.vy *= bounceFactor;
        }

        drawCardCanvas(b);

        // Remove if off-screen horizontally
        if (b.x + b.width < -100 || b.x > width + 100) {
          activeCards.splice(i, 1);
        }
      }

      frameId = requestAnimationFrame(render);
    };

    frameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
    };
  }, [cards]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50"
    />
  );
};
