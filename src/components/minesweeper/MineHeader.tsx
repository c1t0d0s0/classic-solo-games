import React from 'react';
import { FaceStatus } from '../../types/minesweeper';

interface MineHeaderProps {
  minesLeft: number;
  timeSeconds: number;
  faceStatus: FaceStatus;
  onReset: () => void;
}

export const MineHeader: React.FC<MineHeaderProps> = ({
  minesLeft,
  timeSeconds,
  faceStatus,
  onReset,
}) => {
  const formatDigits = (val: number): string => {
    if (val < 0) {
      return `-${Math.abs(val).toString().padStart(2, '0').slice(-2)}`;
    }
    return Math.min(999, Math.max(0, val)).toString().padStart(3, '0');
  };

  const getFaceEmoji = (status: FaceStatus) => {
    switch (status) {
      case 'scared': return '😮';
      case 'won': return '😎';
      case 'dead': return '😵';
      default: return '🙂';
    }
  };

  return (
    <div className="w-full flex items-center justify-between px-3 py-2 bg-slate-300 border-4 border-t-slate-500 border-l-slate-500 border-r-white border-b-white mb-2 shadow-inner select-none">
      {/* Mine Counter Display */}
      <div className="bg-black px-2 py-1 rounded border-2 border-slate-600 font-mono-digits font-bold text-red-500 text-xl sm:text-2xl tracking-widest led-display">
        {formatDigits(minesLeft)}
      </div>

      {/* Face Reset Button */}
      <button
        onClick={onReset}
        className="w-10 h-10 sm:w-11 sm:h-11 bg-slate-300 hover:bg-slate-200 active:bg-slate-400 border-t-2 border-l-2 border-r-2 border-b-2 border-t-white border-l-white border-r-slate-500 border-b-slate-500 rounded flex items-center justify-center text-2xl sm:text-3xl active:translate-y-0.5 shadow-sm transition-transform cursor-pointer"
        title="リセット"
      >
        {getFaceEmoji(faceStatus)}
      </button>

      {/* Timer Display */}
      <div className="bg-black px-2 py-1 rounded border-2 border-slate-600 font-mono-digits font-bold text-red-500 text-xl sm:text-2xl tracking-widest led-display">
        {formatDigits(timeSeconds)}
      </div>
    </div>
  );
};
