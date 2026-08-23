export type MahjongTileType = 
  | 'wan'    // 萬子 (Characters: 1-9, 4 of each = 36)
  | 'tong'   // 筒子 (Dots: 1-9, 4 of each = 36)
  | 'tiao'   // 索子 (Bamboo: 1-9, 4 of each = 36)
  | 'wind'   // 風牌 (East, South, West, North: 1-4, 4 of each = 16)
  | 'dragon' // 三元牌 (Red, Green, White: 1-3, 4 of each = 12)
  | 'flower' // 花牌 (Plum, Orchid, Chrysanthemum, Bamboo: 1-4, 1 of each = 4)
  | 'season';// 季節牌 (Spring, Summer, Autumn, Winter: 1-4, 1 of each = 4)
             // Total = 36 + 36 + 36 + 16 + 12 + 4 + 4 = 144 tiles (72 pairs)

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
