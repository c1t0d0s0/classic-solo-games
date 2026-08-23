import { describe, it, expect } from 'vitest';
import {
  areTilesMatching,
  findAvailableMatchingPairs,
  isTileFree,
} from '../components/shanghai/shanghaiLogic';
import { createStandardTilePairs, generateSolvableShanghaiBoard } from '../components/shanghai/shanghaiSolver';
import { MahjongTile } from '../types/shanghai';

describe('Shanghai / Mahjong Solitaire Logic Tests', () => {
  it('should create exactly 72 pairs (144 tiles) in standard set', () => {
    const pairs = createStandardTilePairs();
    expect(pairs).toHaveLength(72);

    const flat = pairs.flatMap(([a, b]) => [a, b]);
    expect(flat).toHaveLength(144);

    const wanCount = flat.filter((t) => t.type === 'wan').length;
    const tongCount = flat.filter((t) => t.type === 'tong').length;
    const tiaoCount = flat.filter((t) => t.type === 'tiao').length;
    const windCount = flat.filter((t) => t.type === 'wind').length;
    const dragonCount = flat.filter((t) => t.type === 'dragon').length;
    const flowerCount = flat.filter((t) => t.type === 'flower').length;
    const seasonCount = flat.filter((t) => t.type === 'season').length;

    expect(wanCount).toBe(36);
    expect(tongCount).toBe(36);
    expect(tiaoCount).toBe(36);
    expect(windCount).toBe(16);
    expect(dragonCount).toBe(12);
    expect(flowerCount).toBe(4);
    expect(seasonCount).toBe(4);
  });

  it('should validate tile matching rules accurately', () => {
    const wan1A: MahjongTile = { id: 1, type: 'wan', value: 1, layer: 0, x: 0, y: 0, isRemoved: false };
    const wan1B: MahjongTile = { id: 2, type: 'wan', value: 1, layer: 0, x: 2, y: 0, isRemoved: false };
    const wan2: MahjongTile = { id: 3, type: 'wan', value: 2, layer: 0, x: 4, y: 0, isRemoved: false };
    const tong1: MahjongTile = { id: 4, type: 'tong', value: 1, layer: 0, x: 6, y: 0, isRemoved: false };

    // Same suit and same value
    expect(areTilesMatching(wan1A, wan1B)).toBe(true);
    // Same suit different value
    expect(areTilesMatching(wan1A, wan2)).toBe(false);
    // Different suit same value
    expect(areTilesMatching(wan1A, tong1)).toBe(false);

    // Flowers match any flower (even different values 1 and 4)
    const flower1: MahjongTile = { id: 5, type: 'flower', value: 1, layer: 0, x: 0, y: 0, isRemoved: false };
    const flower4: MahjongTile = { id: 6, type: 'flower', value: 4, layer: 0, x: 2, y: 0, isRemoved: false };
    expect(areTilesMatching(flower1, flower4)).toBe(true);

    // Seasons match any season (even different values 2 and 3)
    const season2: MahjongTile = { id: 7, type: 'season', value: 2, layer: 0, x: 0, y: 0, isRemoved: false };
    const season3: MahjongTile = { id: 8, type: 'season', value: 3, layer: 0, x: 2, y: 0, isRemoved: false };
    expect(areTilesMatching(season2, season3)).toBe(true);

    // Season does NOT match flower
    expect(areTilesMatching(season2, flower1)).toBe(false);
  });

  it('should accurately detect free and blocked tiles', () => {
    // 3 tiles in a horizontal row: (x=0, y=0), (x=2, y=0), (x=4, y=0)
    const leftTile: MahjongTile = { id: 1, type: 'wan', value: 1, layer: 0, x: 0, y: 0, isRemoved: false };
    const middleTile: MahjongTile = { id: 2, type: 'wan', value: 1, layer: 0, x: 2, y: 0, isRemoved: false };
    const rightTile: MahjongTile = { id: 3, type: 'wan', value: 1, layer: 0, x: 4, y: 0, isRemoved: false };
    const row = [leftTile, middleTile, rightTile];

    // Left and Right ends are free (one side is completely open)
    expect(isTileFree(leftTile, row)).toBe(true);
    expect(isTileFree(rightTile, row)).toBe(true);
    // Middle is blocked on both sides
    expect(isTileFree(middleTile, row)).toBe(false);

    // If a tile is placed directly above middleTile on layer 1:
    const topTile: MahjongTile = { id: 4, type: 'tong', value: 1, layer: 1, x: 0, y: 0, isRemoved: false };
    const withTop = [leftTile, topTile];
    // leftTile is covered from above by topTile
    expect(isTileFree(leftTile, withTop)).toBe(false);
    // topTile is on layer 1 with nothing above, so it is free
    expect(isTileFree(topTile, withTop)).toBe(true);
  });

  it('should generate a 144-tile solvable board with available moves', () => {
    const board = generateSolvableShanghaiBoard();
    expect(board).toHaveLength(144);

    const available = findAvailableMatchingPairs(board);
    expect(available.length).toBeGreaterThan(0);
  });
});
