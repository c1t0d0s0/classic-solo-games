import { describe, it, expect } from 'vitest';
import {
  areTilesMatching,
  findAvailableMatchingPairs,
  isTileFree,
} from '../components/shanghai/shanghaiLogic';
import { createStandardTilePairs, generateSolvableShanghaiBoard } from '../components/shanghai/shanghaiSolver';
import { MahjongTile } from '../types/shanghai';

describe('Shanghai / Mahjong Solitaire Logic Tests', () => {
  it('should create exactly 72 pairs (144 tiles) of Japanese Mahjong tiles', () => {
    const pairs = createStandardTilePairs();
    expect(pairs).toHaveLength(72);

    const flat = pairs.flatMap(([a, b]) => [a, b]);
    expect(flat).toHaveLength(144);

    const wanCount = flat.filter((t) => t.type === 'wan').length;
    const tongCount = flat.filter((t) => t.type === 'tong').length;
    const tiaoCount = flat.filter((t) => t.type === 'tiao').length;
    const windCount = flat.filter((t) => t.type === 'wind').length;
    const dragonCount = flat.filter((t) => t.type === 'dragon').length;

    expect(wanCount).toBe(36);
    expect(tongCount).toBe(36);
    expect(tiaoCount).toBe(36);
    expect(windCount).toBe(20);
    expect(dragonCount).toBe(16);
  });

  it('should validate tile matching rules accurately', () => {
    const wan1A: MahjongTile = { id: 1, type: 'wan', value: 1, layer: 0, x: 0, y: 0, isRemoved: false };
    const wan1B: MahjongTile = { id: 2, type: 'wan', value: 1, layer: 0, x: 2, y: 0, isRemoved: false };
    const wan2: MahjongTile = { id: 3, type: 'wan', value: 2, layer: 0, x: 4, y: 0, isRemoved: false };
    const tong1: MahjongTile = { id: 4, type: 'tong', value: 1, layer: 0, x: 6, y: 0, isRemoved: false };
    const windEast1: MahjongTile = { id: 5, type: 'wind', value: 1, layer: 0, x: 0, y: 0, isRemoved: false };
    const windEast2: MahjongTile = { id: 6, type: 'wind', value: 1, layer: 0, x: 2, y: 0, isRemoved: false };
    const dragonRed: MahjongTile = { id: 7, type: 'dragon', value: 1, layer: 0, x: 0, y: 0, isRemoved: false };

    // Same suit and same value match
    expect(areTilesMatching(wan1A, wan1B)).toBe(true);
    expect(areTilesMatching(windEast1, windEast2)).toBe(true);

    // Same suit different value do not match
    expect(areTilesMatching(wan1A, wan2)).toBe(false);

    // Different suit same value do not match
    expect(areTilesMatching(wan1A, tong1)).toBe(false);
    expect(areTilesMatching(windEast1, dragonRed)).toBe(false);
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

  it('should verify all 5 layouts have exactly 144 tiles', () => {
    const layoutIds: ('turtle' | 'fortress' | 'canyon' | 'spider' | 'dragon')[] = [
      'turtle',
      'fortress',
      'canyon',
      'spider',
      'dragon',
    ];

    layoutIds.forEach((id) => {
      const board = generateSolvableShanghaiBoard(id);
      expect(board).toHaveLength(144);
      const available = findAvailableMatchingPairs(board);
      expect(available.length).toBeGreaterThan(0);
    });
  });
});
