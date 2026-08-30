import React from 'react';
import { Card, Suit } from '../../types/solitaire';
import { getCardColor, getRankLabel, getSuitSymbol } from './solitaireLogic';

interface SolitaireCardProps {
  card: Card;
  isDragging?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  onDoubleClick?: () => void;
  onDragStart?: (e: React.DragEvent) => void;
  className?: string;
  style?: React.CSSProperties;
}

const suitColorClass = (suit: Suit) => {
  return getCardColor(suit) === 'red' ? 'text-red-600' : 'text-slate-900';
};

export const SolitaireCard: React.FC<SolitaireCardProps> = ({
  card,
  isDragging = false,
  isSelected = false,
  onClick,
  onDoubleClick,
  onDragStart,
  className = '',
  style = {},
}) => {
  const rankStr = getRankLabel(card.rank);
  const suitSymbol = getSuitSymbol(card.suit);

  if (!card.faceUp) {
    return (
      <div
        className={`w-11 h-16 sm:w-16 sm:h-24 md:w-20 md:h-28 rounded-md sm:rounded-lg bg-gradient-to-br from-blue-700 via-indigo-800 to-blue-950 border-2 border-white/70 shadow-md flex items-center justify-center cursor-default select-none relative overflow-hidden transition-transform ${className}`}
        style={style}
        onClick={onClick}
      >
        <div className="absolute inset-1 border border-white/30 rounded sm:rounded-md bg-blue-900/40 flex items-center justify-center">
          <div className="w-5 h-7 sm:w-8 sm:h-12 border border-amber-300/40 rounded-full flex items-center justify-center">
            <span className="text-amber-300/70 font-serif font-bold text-xs sm:text-base md:text-lg">✦</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      draggable={card.faceUp}
      onDragStart={onDragStart}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      style={style}
      className={`w-11 h-16 sm:w-16 sm:h-24 md:w-20 md:h-28 rounded-md sm:rounded-lg bg-white border border-slate-300 shadow-sm sm:shadow-md relative cursor-pointer select-none overflow-hidden transition-shadow duration-150 ${
        isSelected ? 'ring-3 ring-amber-400 -translate-y-1' : ''
      } ${isDragging ? 'opacity-40 scale-105' : 'hover:shadow-lg hover:-translate-y-0.5'} ${className}`}
    >
      {/* Top Left Corner Index */}
      <div className={`absolute top-0.5 left-0.5 sm:top-1 sm:left-1 md:top-1.5 md:left-1.5 flex flex-col items-center leading-none ${suitColorClass(card.suit)} pointer-events-none`}>
        <span className="font-black text-xs sm:text-base md:text-lg leading-none tracking-tighter">{rankStr}</span>
        <span className="text-[10px] sm:text-xs md:text-sm leading-none font-bold mt-0.5">{suitSymbol}</span>
      </div>

      {/* Center Symbol / Art */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        {card.rank >= 11 ? (
          <span className={`font-serif font-black text-lg sm:text-2xl md:text-3xl leading-none select-none ${suitColorClass(card.suit)}`}>
            {rankStr}
          </span>
        ) : (
          <span className={`text-base sm:text-2xl md:text-3xl leading-none font-bold select-none ${suitColorClass(card.suit)}`}>
            {suitSymbol}
          </span>
        )}
      </div>

      {/* Bottom Right Corner Index (Rotated) */}
      <div className={`absolute bottom-0.5 right-0.5 sm:bottom-1 sm:right-1 md:bottom-1.5 md:right-1.5 flex flex-col items-center leading-none rotate-180 ${suitColorClass(card.suit)} pointer-events-none`}>
        <span className="font-black text-xs sm:text-base md:text-lg leading-none tracking-tighter">{rankStr}</span>
        <span className="text-[10px] sm:text-xs md:text-sm leading-none font-bold mt-0.5">{suitSymbol}</span>
      </div>
    </div>
  );
};
