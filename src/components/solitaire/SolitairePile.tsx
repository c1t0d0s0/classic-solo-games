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

export const SolitairePile = React.forwardRef<HTMLDivElement, SolitairePileProps>(
  (
    {
      type,
      suit,
      isEmpty = true,
      onClick,
      onDragOver,
      onDrop,
      children,
      className = '',
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        onClick={onClick}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={`solitaire-pile-container w-11 h-16 sm:w-16 sm:h-24 md:w-20 md:h-28 rounded-md sm:rounded-lg relative flex items-center justify-center border-2 transition-colors ${
          isEmpty
            ? 'border-dashed border-white/25 bg-black/15 hover:border-white/40'
            : 'border-transparent'
        } ${className}`}
      >
        {isEmpty && type === 'foundation' && suit && (
          <span className="text-white/25 text-2xl sm:text-3xl md:text-4xl font-bold select-none">
            {getSuitSymbol(suit)}
          </span>
        )}
        {isEmpty && type === 'stock' && (
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-white/25 flex items-center justify-center">
            <span className="text-white/40 text-sm sm:text-base">↺</span>
          </div>
        )}
        {children}
      </div>
    );
  }
);

SolitairePile.displayName = 'SolitairePile';

