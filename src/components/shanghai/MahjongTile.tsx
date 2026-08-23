import React from 'react';
import { MahjongTile as MahjongTileType } from '../../types/shanghai';
import { getTileVisualInfo } from './shanghaiLogic';
import { MahjongTileArt } from './MahjongTileArt';

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

  // Base coordinates in half-tile units
  const left = (tile.x / 2) * tileWidth;
  const top = (tile.y / 2) * tileHeight;

  // 3D Elevation per layer
  const elevationX = tile.layer * 4;
  const elevationY = tile.layer * 5;
  const zIndex = tile.layer * 100 + Math.floor(tile.y) * 2 + Math.floor(tile.x / 2);

  // Dynamic 3D Jade back depth thickness based on tile width
  const jadeDepth = Math.max(3, Math.floor(tileWidth * 0.08));

  return (
    <div
      onClick={() => isFree && onClick(tile)}
      style={{
        left: `${left - elevationX}px`,
        top: `${top - elevationY}px`,
        width: `${tileWidth}px`,
        height: `${tileHeight}px`,
        zIndex: isSelected ? 9999 : zIndex,
      }}
      className={`absolute rounded-sm sm:rounded select-none transition-all duration-150 flex flex-col justify-between ${
        isFree ? 'cursor-pointer' : 'cursor-not-allowed'
      } ${
        isSelected
          ? 'mahjong-tile-selected ring-3 ring-amber-400 -translate-y-2'
          : isHinted
          ? 'mahjong-tile-hint'
          : ''
      } ${
        !isFree
          ? 'filter brightness-75 contrast-90'
          : 'hover:brightness-105 active:scale-98'
      }`}
    >
      {/* 3D Jade Green Bottom & Right Extrusion Block */}
      <div
        className="absolute inset-0 rounded-sm sm:rounded bg-emerald-900 border border-emerald-950 pointer-events-none"
        style={{
          transform: `translate(${jadeDepth}px, ${jadeDepth}px)`,
          boxShadow: `${elevationX + 2}px ${elevationY + 4}px ${Math.max(4, tile.layer * 4 + 4)}px rgba(0, 0, 0, ${
            0.35 + tile.layer * 0.08
          })`,
        }}
      />

      {/* 3D Jade Green Mid-Layer Rim */}
      <div
        className="absolute inset-0 rounded-sm sm:rounded bg-gradient-to-br from-emerald-600 via-emerald-800 to-emerald-950 pointer-events-none"
        style={{
          transform: `translate(${Math.floor(jadeDepth * 0.5)}px, ${Math.floor(jadeDepth * 0.5)}px)`,
        }}
      />

      {/* Front Ivory / Bone Tile Face */}
      <div
        className={`relative w-full h-full rounded-sm sm:rounded p-1 sm:p-1.5 flex flex-col justify-between overflow-hidden border-t border-l border-white/90 border-r border-b border-stone-400/80 shadow-inner ${
          isSelected
            ? 'bg-gradient-to-b from-amber-50 via-amber-100 to-amber-200'
            : isHinted
            ? 'bg-gradient-to-b from-sky-50 via-sky-100 to-sky-200'
            : 'bg-gradient-to-br from-white via-[#fbf9f4] to-[#ede7dc]'
        }`}
        style={{
          boxShadow: 'inset 1px 1px 2px rgba(255,255,255,0.9), inset -1px -1px 2px rgba(0,0,0,0.1)',
        }}
      >
        {/* Subtle Specular Surface Sheen */}
        <div className="absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

        {/* Tiny Top Corner Indicator for quick recognition */}
        <div className="flex justify-between items-center leading-none z-10">
          <span className={`font-black text-[9px] sm:text-[10px] md:text-xs ${visual.color}`}>
            {visual.kanji}
          </span>
          <span className={`font-bold text-[8px] sm:text-[9px] md:text-[10px] ${visual.subColor}`}>
            {visual.sub}
          </span>
        </div>

        {/* Center Authentic Engraved Artwork */}
        <div className="flex-1 flex items-center justify-center my-0.5 z-10 pointer-events-none">
          <MahjongTileArt
            type={tile.type}
            value={tile.value}
          />
        </div>

        {/* Bottom Small Label */}
        <div className="flex justify-center items-center leading-none z-10">
          <span className={`font-bold text-[7px] sm:text-[8px] md:text-[9px] ${visual.subColor} tracking-tighter opacity-80`}>
            {visual.label}
          </span>
        </div>
      </div>
    </div>
  );
};
