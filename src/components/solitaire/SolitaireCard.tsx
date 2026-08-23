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
          <div className="w-4 h-6 sm:w-7 sm:h-10 border border-amber-300/40 rounded-full flex items-center justify-center">
            <span className="text-amber-300/60 font-serif font-bold text-xs sm:text-base">✦</span>
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
      className={`w-11 h-16 sm:w-16 sm:h-24 md:w-20 md:h-28 rounded-md sm:rounded-lg bg-white border border-slate-300 shadow-sm sm:shadow-md flex flex-col justify-between p-0.5 sm:p-1 md:p-1.5 cursor-pointer select-none overflow-hidden transition-all duration-150 ${
        isSelected ? 'ring-3 ring-amber-400 -translate-y-1' : ''
      } ${isDragging ? 'opacity-40 scale-105' : 'hover:shadow-lg hover:-translate-y-0.5'} ${className}`}
    >
      {/* Top Left Corner Index */}
      <div className={`flex flex-col items-start leading-none self-start px-0.5 ${suitColorClass(card.suit)}`}>
        <span className="font-extrabold text-[11px] sm:text-xs md:text-sm tracking-tighter">{rankStr}</span>
        <span className="text-[9px] sm:text-[11px] md:text-xs leading-none -mt-0.5">{suitSymbol}</span>
      </div>

      {/* Center Symbol / Art */}
      <div className="flex-1 flex items-center justify-center my-0 pointer-events-none">
        {card.rank >= 11 ? (
          <span className={`font-serif font-bold text-sm sm:text-xl md:text-2xl leading-none ${suitColorClass(card.suit)}`}>
            {rankStr}
          </span>
        ) : (
          <span className={`text-sm sm:text-xl md:text-2xl leading-none ${suitColorClass(card.suit)}`}>
            {suitSymbol}
          </span>
        )}
      </div>

      {/* Bottom Right Corner Index (Rotated) */}
      <div className={`flex flex-col items-start leading-none self-end rotate-180 px-0.5 ${suitColorClass(card.suit)}`}>
        <span className="font-extrabold text-[11px] sm:text-xs md:text-sm tracking-tighter">{rankStr}</span>
        <span className="text-[9px] sm:text-[11px] md:text-xs leading-none -mt-0.5">{suitSymbol}</span>
      </div>
    </div>
  );
};
