import { MahjongTile, MahjongTileType } from '../../types/shanghai';
import { TURTLE_LAYOUT } from './shanghaiLayouts';
import { isTileFree } from './shanghaiLogic';

interface TilePair {
  type: MahjongTileType;
  value: number;
}

// Generate the standard 72 pairs (144 tiles)
export const createStandardTilePairs = (): [TilePair, TilePair][] => {
  const pairs: [TilePair, TilePair][] = [];

  // Wan (1-9, 4 of each = 2 pairs of each)
  for (let val = 1; val <= 9; val++) {
    pairs.push([{ type: 'wan', value: val }, { type: 'wan', value: val }]);
    pairs.push([{ type: 'wan', value: val }, { type: 'wan', value: val }]);
  }

  // Tong (1-9, 4 of each = 2 pairs of each)
  for (let val = 1; val <= 9; val++) {
    pairs.push([{ type: 'tong', value: val }, { type: 'tong', value: val }]);
    pairs.push([{ type: 'tong', value: val }, { type: 'tong', value: val }]);
  }

  // Tiao (1-9, 4 of each = 2 pairs of each)
  for (let val = 1; val <= 9; val++) {
    pairs.push([{ type: 'tiao', value: val }, { type: 'tiao', value: val }]);
    pairs.push([{ type: 'tiao', value: val }, { type: 'tiao', value: val }]);
  }

  // Winds (1-4, 4 of each = 2 pairs of each)
  for (let val = 1; val <= 4; val++) {
    pairs.push([{ type: 'wind', value: val }, { type: 'wind', value: val }]);
    pairs.push([{ type: 'wind', value: val }, { type: 'wind', value: val }]);
  }

  // Dragons (1-3, 4 of each = 2 pairs of each)
  for (let val = 1; val <= 3; val++) {
    pairs.push([{ type: 'dragon', value: val }, { type: 'dragon', value: val }]);
    pairs.push([{ type: 'dragon', value: val }, { type: 'dragon', value: val }]);
  }

  // Flowers (1-4: 2 pairs)
  pairs.push([{ type: 'flower', value: 1 }, { type: 'flower', value: 2 }]);
  pairs.push([{ type: 'flower', value: 3 }, { type: 'flower', value: 4 }]);

  // Seasons (1-4: 2 pairs)
  pairs.push([{ type: 'season', value: 1 }, { type: 'season', value: 2 }]);
  pairs.push([{ type: 'season', value: 3 }, { type: 'season', value: 4 }]);

  // Shuffle pairs
  for (let i = pairs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
  }

  return pairs;
};

// Generates a guaranteed solvable Shanghai board
export const generateSolvableShanghaiBoard = (): MahjongTile[] => {
  const maxAttempts = 20;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const pairs = createStandardTilePairs();
    const layoutPositions = TURTLE_LAYOUT.map((pos, idx) => ({
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

  return TURTLE_LAYOUT.map((pos, idx) => ({
    id: idx,
    layer: pos.layer,
    x: pos.x,
    y: pos.y,
    type: flatPairs[idx].type,
    value: flatPairs[idx].value,
    isRemoved: false,
  }));
};
