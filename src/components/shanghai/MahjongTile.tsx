import React from 'react';
import { MahjongTile as MahjongTileType } from '../../types/shanghai';
import { getTileVisualInfo } from './shanghaiLogic';

interface MahjongTileProps {
  tile: MahjongTileType;
  isFree: boolean;
  isSelected: boolean;
  isHinted: boolean;
  onClick: (tile: MahjongTileType) => void;
  tileWidth: number;  // In px
  tileHeight: number; // In px
}

export const MahjongTileComponent: React.FC<MahjongTileProps> = ({
  tile,
  isFree,
  isSelected,
  isHinted,
  onClick,
  tileWidth,
  tileHeight,
}) => {
  const visual = getTileVisualInfo(tile.type, tile.value);

  // Position calculation based on half-tile units
  // tile.x is in half-widths, tile.y is in half-heights
  const left = (tile.x / 2) * tileWidth;
  const top = (tile.y / 2) * tileHeight;

  // 3D Isometric / Layer offset
  const layerOffset = tile.layer * 4;
  const zIndex = tile.layer * 100 + Math.floor(tile.y) * 2 + Math.floor(tile.x / 2);

  return (
    <div
      onClick={() => isFree && onClick(tile)}
      style={{
        left: `${left - layerOffset}px`,
        top: `${top - layerOffset}px`,
        width: `${tileWidth}px`,
        height: `${tileHeight}px`,
        zIndex: isSelected ? 9999 : zIndex,
      }}
      className={`absolute rounded sm:rounded-md select-none transition-all duration-150 flex flex-col justify-between p-0.5 sm:p-1 ${
        isFree ? 'cursor-pointer' : 'cursor-not-allowed'
      } ${
        isSelected
          ? 'mahjong-tile-selected ring-3 ring-amber-400 bg-gradient-to-b from-amber-50 to-amber-100'
          : isHinted
          ? 'mahjong-tile-hint bg-gradient-to-b from-sky-50 to-sky-100'
          : 'bg-gradient-to-br from-amber-50 via-stone-50 to-stone-200'
      } ${
        !isFree
          ? 'filter brightness-75 contrast-90 opacity-90'
          : 'hover:brightness-105 active:scale-98'
      } border-t-2 border-l-2 border-r-3 border-b-4 border-t-white border-l-white border-r-stone-400 border-b-stone-600 mahjong-tile-shadow`}
    >
      {/* 3D Green Base Rim underneath tile */}
      <div className="absolute -bottom-1.5 -right-1 left-1.5 h-1.5 bg-emerald-800/80 rounded-b pointer-events-none -z-10" />

      {/* Top Value / Kanji */}
      <div className="flex justify-between items-center leading-none px-0.5">
        <span className={`font-bold text-[10px] sm:text-xs md:text-sm ${visual.color}`}>
          {visual.kanji}
        </span>
        <span className={`text-[8px] sm:text-[10px] md:text-xs ${visual.subColor}`}>
          {visual.sub}
        </span>
      </div>

      {/* Center Character / Symbol */}
      <div className="flex-1 flex items-center justify-center my-0">
        <span className={`font-black text-sm sm:text-lg md:text-xl leading-none ${visual.color}`}>
          {visual.kanji}
        </span>
      </div>

      {/* Bottom Type Label */}
      <div className="flex justify-center items-center leading-none">
        <span className={`font-semibold text-[8px] sm:text-[9px] md:text-[10px] ${visual.subColor}`}>
          {visual.label}
        </span>
      </div>
    </div>
  );
};
