import React from 'react';
import { PileType, Suit } from '../../types/solitaire';
import { getSuitSymbol } from './solitaireLogic';

interface SolitairePileProps {
  type: PileType;
  suit?: Suit;
  isEmpty?: boolean;
  onClick?: () => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent) => void;
  children?: React.ReactNode;
  className?: string;
}

export const SolitairePile: React.FC<SolitairePileProps> = ({
  type,
  suit,
  isEmpty = true,
  onClick,
  onDragOver,
  onDrop,
  children,
  className = '',
}) => {
  return (
    <div
      onClick={onClick}
      onDragOver={onDragOver}
      onDrop={onDrop}
      className={`w-11 h-16 sm:w-16 sm:h-24 md:w-20 md:h-28 rounded-md sm:rounded-lg relative flex items-center justify-center transition-colors ${
        isEmpty
          ? 'border-2 border-dashed border-white/25 bg-black/15 hover:border-white/40'
          : ''
      } ${className}`}
    >
      {isEmpty && type === 'foundation' && suit && (
        <span className="text-white/20 text-xl sm:text-2xl font-bold select-none">
          {getSuitSymbol(suit)}
        </span>
      )}
      {isEmpty && type === 'stock' && (
        <div className="w-6 h-6 rounded-full border-2 border-white/20 flex items-center justify-center">
          <span className="text-white/30 text-xs">↺</span>
        </div>
      )}
      {children}
    </div>
  );
};
