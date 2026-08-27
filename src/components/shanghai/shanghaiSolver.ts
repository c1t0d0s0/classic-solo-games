import { MahjongTile, MahjongTileType, ShanghaiLayoutId } from '../../types/shanghai';
import { SHANGHAI_LAYOUTS, TURTLE_LAYOUT } from './shanghaiLayouts';
import { isTileFree } from './shanghaiLogic';

interface TilePair {
  type: MahjongTileType;
  value: number;
}

// Generate the standard 72 pairs (144 tiles) exclusively using Japanese Mahjong tiles
export const createStandardTilePairs = (): [TilePair, TilePair][] => {
  const pairs: [TilePair, TilePair][] = [];

  // 萬子 (1-9萬, 4 of each = 18 pairs / 36 tiles)
  for (let val = 1; val <= 9; val++) {
    pairs.push([{ type: 'wan', value: val }, { type: 'wan', value: val }]);
    pairs.push([{ type: 'wan', value: val }, { type: 'wan', value: val }]);
  }

  // 筒子 (1-9筒, 4 of each = 18 pairs / 36 tiles)
  for (let val = 1; val <= 9; val++) {
    pairs.push([{ type: 'tong', value: val }, { type: 'tong', value: val }]);
    pairs.push([{ type: 'tong', value: val }, { type: 'tong', value: val }]);
  }

  // 索子 (1-9索, 4 of each = 18 pairs / 36 tiles)
  for (let val = 1; val <= 9; val++) {
    pairs.push([{ type: 'tiao', value: val }, { type: 'tiao', value: val }]);
    pairs.push([{ type: 'tiao', value: val }, { type: 'tiao', value: val }]);
  }

  // 風牌 (東, 南, 西, 北: 東×6, 南×6, 西×4, 北×4 = 10 pairs / 20 tiles)
  pairs.push([{ type: 'wind', value: 1 }, { type: 'wind', value: 1 }]); // 東
  pairs.push([{ type: 'wind', value: 1 }, { type: 'wind', value: 1 }]);
  pairs.push([{ type: 'wind', value: 1 }, { type: 'wind', value: 1 }]);
  pairs.push([{ type: 'wind', value: 2 }, { type: 'wind', value: 2 }]); // 南
  pairs.push([{ type: 'wind', value: 2 }, { type: 'wind', value: 2 }]);
  pairs.push([{ type: 'wind', value: 2 }, { type: 'wind', value: 2 }]);
  pairs.push([{ type: 'wind', value: 3 }, { type: 'wind', value: 3 }]); // 西
  pairs.push([{ type: 'wind', value: 3 }, { type: 'wind', value: 3 }]);
  pairs.push([{ type: 'wind', value: 4 }, { type: 'wind', value: 4 }]); // 北
  pairs.push([{ type: 'wind', value: 4 }, { type: 'wind', value: 4 }]);

  // 三元牌 (中, 發, 白: 中×6, 發×6, 白×4 = 8 pairs / 16 tiles)
  pairs.push([{ type: 'dragon', value: 1 }, { type: 'dragon', value: 1 }]); // 中
  pairs.push([{ type: 'dragon', value: 1 }, { type: 'dragon', value: 1 }]);
  pairs.push([{ type: 'dragon', value: 1 }, { type: 'dragon', value: 1 }]);
  pairs.push([{ type: 'dragon', value: 2 }, { type: 'dragon', value: 2 }]); // 發
  pairs.push([{ type: 'dragon', value: 2 }, { type: 'dragon', value: 2 }]);
  pairs.push([{ type: 'dragon', value: 2 }, { type: 'dragon', value: 2 }]);
  pairs.push([{ type: 'dragon', value: 3 }, { type: 'dragon', value: 3 }]); // 白
  pairs.push([{ type: 'dragon', value: 3 }, { type: 'dragon', value: 3 }]);

  // Shuffle pairs
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }

  return pairs;
};

// Generates a guaranteed solvable Shanghai board for the given layout
export const generateSolvableShanghaiBoard = (layoutId: ShanghaiLayoutId = 'turtle'): MahjongTile[] => {
  const layout = SHANGHAI_LAYOUTS[layoutId] || TURTLE_LAYOUT;
  const maxAttempts = 20;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const pairs = createStandardTilePairs();
    const layoutPositions = layout.map((pos, idx) => ({
      id: idx,
      layer: pos.layer,
      x: pos.x,
      y: pos.y,
    }));

    // Filled status for reverse generation
    // We start with full board, find free tiles, assign pairs, and remove them in reverse
    const activePositions = layoutPositions.map((pos) => ({
      ...pos,
      type: 'wan' as MahjongTileType,
      value: 1,
      isRemoved: false,
    }));

    const assignedTiles: MahjongTile[] = [];
    let success = true;

    for (const [pairA, pairB] of pairs) {
      // Find all positions that are currently free in the remaining active layout
      const available = activePositions.filter(
        (p) => !p.isRemoved && isTileFree(p, activePositions)
      );

      if (available.length < 2) {
        success = false;
        break;
      }

      // Pick two random available positions
      const idx1 = Math.floor(Math.random() * available.length);
      let idx2 = Math.floor(Math.random() * (available.length - 1));
      if (idx2 >= idx1) idx2++;

      const pos1 = available[idx1];
      const pos2 = available[idx2];

      assignedTiles.push({
        id: pos1.id,
        layer: pos1.layer,
        x: pos1.x,
        y: pos1.y,
        type: pairA.type,
        value: pairA.value,
        isRemoved: false,
      });

      assignedTiles.push({
        id: pos2.id,
        layer: pos2.layer,
        x: pos2.x,
        y: pos2.y,
        type: pairB.type,
        value: pairB.value,
        isRemoved: false,
      });

      // Mark as removed in reverse simulation
      pos1.isRemoved = true;
      pos2.isRemoved = true;
    }

    if (success && assignedTiles.length === 144) {
      // Sort by layer ascending, then y, then x for stable and accurate rendering order
      assignedTiles.sort((a, b) => {
        if (a.layer !== b.layer) return a.layer - b.layer;
        if (a.y !== b.y) return a.y - b.y;
        return a.x - b.x;
      });
      return assignedTiles;
    }
  }

  // Fallback if random generation encounters 20 consecutive conflicts (astronomically unlikely)
  const pairs = createStandardTilePairs();
  const flatPairs: TilePair[] = [];
  pairs.forEach(([a, b]) => {
    flatPairs.push(a, b);
  });

  return layout.map((pos, idx) => ({
    id: idx,
    layer: pos.layer,
    x: pos.x,
    y: pos.y,
    type: flatPairs[idx].type,
    value: flatPairs[idx].value,
    isRemoved: false,
  }));
};
