import React, { useRef } from 'react';
import { MineCell as MineCellType } from '../../types/minesweeper';
import { Flag, Bomb, X } from 'lucide-react';

interface MineCellProps {
  cell: MineCellType;
  gameStatus: 'ready' | 'playing' | 'won' | 'lost';
  onCellClick: (x: number, y: number) => void;
  onCellRightClick: (x: number, y: number) => void;
  onCellDoubleClick: (x: number, y: number) => void;
  onMouseDownFace?: () => void;
  onMouseUpFace?: () => void;
  cellSizeClass?: string;
}

const NUMBER_COLORS = [
  '',
  'text-blue-600 font-bold',     // 1
  'text-emerald-600 font-bold',  // 2
  'text-red-600 font-bold',      // 3
  'text-indigo-800 font-bold',   // 4
  'text-amber-800 font-bold',    // 5
  'text-teal-600 font-bold',     // 6
  'text-slate-900 font-bold',    // 7
  'text-slate-500 font-bold',    // 8
];

export const MineCell: React.FC<MineCellProps> = ({
  cell,
  gameStatus,
  onCellClick,
  onCellRightClick,
  onCellDoubleClick,
  onMouseDownFace,
  onMouseUpFace,
  cellSizeClass = 'w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9',
}) => {
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressRef = useRef<boolean>(false);

  const handleTouchStart = () => {
    isLongPressRef.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      onCellRightClick(cell.x, cell.y); // Long press places flag!
    }, 350);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
    if (isLongPressRef.current) {
      e.preventDefault();
    }
  };

  const handleClick = () => {
    if (isLongPressRef.current) {
      isLongPressRef.current = false;
      return;
    }
    onCellClick(cell.x, cell.y);
  };

  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    onCellRightClick(cell.x, cell.y);
  };

  // Render open cell
  if (cell.isOpen) {
    if (cell.isMine) {
      return (
        <div
          className={`${cellSizeClass} flex items-center justify-center border border-slate-400/50 ${
            cell.isExploded ? 'bg-red-600 text-white animate-pulse' : 'bg-slate-300 text-slate-900'
          }`}
        >
          <Bomb className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
        </div>
      );
    }

    return (
      <div
        onDoubleClick={() => onCellDoubleClick(cell.x, cell.y)}
        className={`${cellSizeClass} flex items-center justify-center bg-slate-200/90 border border-slate-300/80 text-sm sm:text-base md:text-lg select-none`}
      >
        {cell.neighborMines > 0 && (
          <span className={NUMBER_COLORS[cell.neighborMines]}>{cell.neighborMines}</span>
        )}
      </div>
    );
  }

  // Render closed cell when game lost and was wrongly flagged
  if (gameStatus === 'lost' && cell.isFlagged && !cell.isMine) {
    return (
      <div
        className={`${cellSizeClass} relative flex items-center justify-center bg-slate-300 border border-slate-400`}
      >
        <Bomb className="w-4 h-4 text-slate-700" />
        <X className="w-5 h-5 text-red-600 absolute inset-0 m-auto stroke-[3]" />
      </div>
    );
  }

  // Render closed cell when game lost and has unflagged mine
  if (gameStatus === 'lost' && cell.isMine && !cell.isFlagged) {
    return (
      <div
        className={`${cellSizeClass} flex items-center justify-center bg-slate-300 border border-slate-400 text-slate-800`}
      >
        <Bomb className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
      </div>
    );
  }

  // Closed unrevealed button (Classic 3D beveled appearance)
  return (
    <button
      onClick={handleClick}
      onContextMenu={handleContextMenu}
      onDoubleClick={() => onCellDoubleClick(cell.x, cell.y)}
      onMouseDown={onMouseDownFace}
      onMouseUp={onMouseUpFace}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`${cellSizeClass} flex items-center justify-center bg-slate-300 hover:bg-slate-250 active:bg-slate-400 border-t-2 border-l-2 border-r-2 border-b-2 border-t-white border-l-white border-r-slate-500 border-b-slate-500 shadow-xs cursor-pointer select-none transition-colors`}
    >
      {cell.isFlagged && (
        <Flag className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600 fill-red-600 drop-shadow-sm" />
      )}
    </button>
  );
};
