import { MahjongTile, MahjongTileType } from '../../types/shanghai';

export const isTileBlockedFromAbove = (
  target: MahjongTile,
  activeTiles: MahjongTile[]
): boolean => {
  return activeTiles.some(
    (other) =>
      !other.isRemoved &&
      other.id !== target.id &&
      other.layer > target.layer &&
      Math.abs(other.x - target.x) < 2 &&
      Math.abs(other.y - target.y) < 2
  );
};

export const isTileBlockedSides = (
  target: MahjongTile,
  activeTiles: MahjongTile[]
): boolean => {
  let hasLeft = false;
  let hasRight = false;

  for (const other of activeTiles) {
    if (other.isRemoved || other.id === target.id) continue;
    if (other.layer === target.layer && Math.abs(other.y - target.y) < 2) {
      // Left side adjacent
      if (other.x >= target.x - 2 && other.x < target.x) {
        hasLeft = true;
      }
      // Right side adjacent
      if (other.x <= target.x + 2 && other.x > target.x) {
        hasRight = true;
      }
    }
  }

  // Blocked only if BOTH left and right are blocked
  return hasLeft && hasRight;
};

export const isTileFree = (
  target: MahjongTile,
  activeTiles: MahjongTile[]
): boolean => {
  if (target.isRemoved) return false;
  if (isTileBlockedFromAbove(target, activeTiles)) return false;
  if (isTileBlockedSides(target, activeTiles)) return false;
  return true;
};

export const areTilesMatching = (t1: MahjongTile, t2: MahjongTile): boolean => {
  if (t1.id === t2.id) return false;
  return t1.type === t2.type && t1.value === t2.value;
};

// Finds all pairs of free tiles that can be matched right now
export const findAvailableMatchingPairs = (
  tiles: MahjongTile[]
): [MahjongTile, MahjongTile][] => {
  const activeTiles = tiles.filter((t) => !t.isRemoved);
  const freeTiles = activeTiles.filter((t) => isTileFree(t, activeTiles));

  const pairs: [MahjongTile, MahjongTile][] = [];
  for (let i = 0; i < freeTiles.length; i++) {
    for (let j = i + 1; j < freeTiles.length; j++) {
      if (areTilesMatching(freeTiles[i], freeTiles[j])) {
        pairs.push([freeTiles[i], freeTiles[j]]);
      }
    }
  }
  return pairs;
};

// Tile Type and Value labels (Japanese Mahjong standard)
export const getTileVisualInfo = (type: MahjongTileType, value: number) => {
  switch (type) {
    case 'wan':
      return {
        label: `${['一', '二', '三', '四', '五', '六', '七', '八', '九'][value - 1]}萬`,
        kanji: ['一', '二', '三', '四', '五', '六', '七', '八', '九'][value - 1],
        sub: '萬',
        color: 'text-red-700',
        subColor: 'text-red-600',
      };
    case 'tong':
      return {
        label: `${value}筒`,
        kanji: value.toString(),
        sub: '●',
        color: 'text-blue-700',
        subColor: 'text-blue-600',
      };
    case 'tiao':
      return {
        label: `${value}索`,
        kanji: value.toString(),
        sub: '‖',
        color: 'text-emerald-700',
        subColor: 'text-emerald-600',
      };
    case 'wind': {
      const winds = ['東', '南', '西', '北'];
      return {
        label: winds[value - 1],
        kanji: winds[value - 1],
        sub: '風',
        color: 'text-slate-900',
        subColor: 'text-slate-500',
      };
    }
    case 'dragon': {
      const dragons = [
        { label: '中', sub: '中', color: 'text-red-600' },
        { label: '發', sub: '發', color: 'text-emerald-600' },
        { label: '白', sub: '白', color: 'text-slate-400' },
      ];
      const d = dragons[value - 1];
      return {
        label: d.label,
        kanji: d.label,
        sub: d.sub,
        color: d.color,
        subColor: 'text-slate-400',
      };
    }
  }
};
