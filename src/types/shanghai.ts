export type MahjongTileType = 
  | 'wan'    // 萬子 (Characters: 1-9萬)
  | 'tong'   // 筒子 (Dots/Pinzu: 1-9筒)
  | 'tiao'   // 索子 (Bamboo/Souzu: 1-9索)
  | 'wind'   // 風牌 (Winds: 東, 南, 西, 北)
  | 'dragon';// 三元牌 (Dragons: 白, 發, 中)
             // Total = 144 tiles (72 pairs) of standard Japanese Mahjong tiles

export interface TilePos {
  layer: number; // 0 is bottom-most
  x: number;     // In half-tile units (e.g. 0 to 30)
  y: number;     // In half-tile units (e.g. 0 to 16)
}

export interface MahjongTile {
  id: number;
  type: MahjongTileType;
  value: number;
  layer: number;
  x: number; // half-tile units
  y: number; // half-tile units
  isRemoved: boolean;
}

export interface ShanghaiState {
  tiles: MahjongTile[];
  selectedTileId: number | null;
  hintPair: [number, number] | null;
  history: { removedIds: [number, number] }[];
  timeSeconds: number;
  isPlaying: boolean;
  isWon: boolean;
  isStuck: boolean;
  shufflesRemaining: number;
}
