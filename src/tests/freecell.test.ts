import { describe, it, expect } from 'vitest';
import {
  canMoveToCascade,
  canMoveToFoundation,
  canMoveToFreeCell,
  getMaxMovingCards,
  initializeFreeCellGame,
  isGameWon,
  isValidCascadeSequence,
} from '../components/freecell/freecellLogic';
import { generateFreeCellDeal } from '../components/freecell/freecellRNG';
import { Card } from '../types/solitaire';

describe('FreeCell Logic & RNG Tests', () => {
  it('should generate an authentic Microsoft FreeCell Game #1 deal', () => {
    const cascades = generateFreeCellDeal(1);
    expect(cascades).toHaveLength(8);

    // Columns 0-3 have 7 cards, columns 4-7 have 6 cards
    expect(cascades[0]).toHaveLength(7);
    expect(cascades[1]).toHaveLength(7);
    expect(cascades[2]).toHaveLength(7);
    expect(cascades[3]).toHaveLength(7);
    expect(cascades[4]).toHaveLength(6);
    expect(cascades[5]).toHaveLength(6);
    expect(cascades[6]).toHaveLength(6);
    expect(cascades[7]).toHaveLength(6);

    // Verify canonical cards in Game #1 column 0
    // In Microsoft FreeCell Game #1:
    // Bottom card of col 0 is Jack of Diamonds (rank 11, diamonds)
    // Top card of col 0 is 6 of Spades (rank 6, spades)
    expect(cascades[0][0].rank).toBe(11);
    expect(cascades[0][0].suit).toBe('diamonds');
    expect(cascades[0][6].rank).toBe(6);
    expect(cascades[0][6].suit).toBe('spades');

    // Total 52 cards and all face-up
    const allCards = cascades.flat();
    expect(allCards).toHaveLength(52);
    expect(allCards.every((c) => c.faceUp)).toBe(true);
  });

  it('should initialize a valid FreeCell state', () => {
    const state = initializeFreeCellGame(1234);
    expect(state.gameNumber).toBe(1234);
    expect(state.freeCells).toEqual([null, null, null, null]);
    expect(state.foundations).toEqual([[], [], [], []]);
    expect(state.cascades).toHaveLength(8);
    expect(state.moves).toBe(0);
    expect(state.isWon).toBe(false);
  });

  it('should validate cascade moves (alternating color, descending rank, empty accepts any)', () => {
    const redTen: Card = { id: 'hearts-10', suit: 'hearts', rank: 10, faceUp: true };
    const blackNine: Card = { id: 'spades-9', suit: 'spades', rank: 9, faceUp: true };
    const redNine: Card = { id: 'diamonds-9', suit: 'diamonds', rank: 9, faceUp: true };
    const blackEight: Card = { id: 'clubs-8', suit: 'clubs', rank: 8, faceUp: true };

    // Empty column accepts any card
    expect(canMoveToCascade(redTen, [])).toBe(true);
    expect(canMoveToCascade(blackNine, [])).toBe(true);

    // Black 9 onto Red 10 (valid)
    expect(canMoveToCascade(blackNine, [redTen])).toBe(true);

    // Red 9 onto Red 10 (invalid, same color)
    expect(canMoveToCascade(redNine, [redTen])).toBe(false);

    // Black 8 onto Red 10 (invalid, rank gap != 1)
    expect(canMoveToCascade(blackEight, [redTen])).toBe(false);
  });

  it('should validate foundation moves (same suit, ascending rank)', () => {
    const aceClubs: Card = { id: 'clubs-1', suit: 'clubs', rank: 1, faceUp: true };
    const twoClubs: Card = { id: 'clubs-2', suit: 'clubs', rank: 2, faceUp: true };
    const twoSpades: Card = { id: 'spades-2', suit: 'spades', rank: 2, faceUp: true };

    // Empty foundation accepts only Ace
    expect(canMoveToFoundation(aceClubs, [])).toBe(true);
    expect(canMoveToFoundation(twoClubs, [])).toBe(false);

    // 2 of Clubs onto Ace of Clubs
    expect(canMoveToFoundation(twoClubs, [aceClubs])).toBe(true);

    // 2 of Spades onto Ace of Clubs (wrong suit)
    expect(canMoveToFoundation(twoSpades, [aceClubs])).toBe(false);
  });

  it('should validate free cell occupancy', () => {
    const dummy: Card = { id: 'hearts-5', suit: 'hearts', rank: 5, faceUp: true };
    expect(canMoveToFreeCell(null)).toBe(true);
    expect(canMoveToFreeCell(dummy)).toBe(false);
  });

  it('should correctly calculate Supermove max allowed cards', () => {
    // Formula: (1 + emptyCells) * 2^(effectiveEmptyCols)
    // 0 empty cells, 0 empty cols -> (1 + 0) * 2^0 = 1
    expect(getMaxMovingCards(0, 0, false)).toBe(1);

    // 4 empty cells, 0 empty cols -> (1 + 4) * 2^0 = 5
    expect(getMaxMovingCards(4, 0, false)).toBe(5);

    // 1 empty cell, 1 empty col moving to non-empty -> (1 + 1) * 2^1 = 4
    expect(getMaxMovingCards(1, 1, false)).toBe(4);

    // 1 empty cell, 1 empty col moving to that empty col -> (1 + 1) * 2^0 = 2
    expect(getMaxMovingCards(1, 1, true)).toBe(2);

    // 4 empty cells, 2 empty cols moving to non-empty -> (1 + 4) * 2^2 = 20
    expect(getMaxMovingCards(4, 2, false)).toBe(20);
  });

  it('should validate whether a card sequence is packed', () => {
    const redTen: Card = { id: 'hearts-10', suit: 'hearts', rank: 10, faceUp: true };
    const blackNine: Card = { id: 'spades-9', suit: 'spades', rank: 9, faceUp: true };
    const redEight: Card = { id: 'diamonds-8', suit: 'diamonds', rank: 8, faceUp: true };
    const blackSeven: Card = { id: 'clubs-7', suit: 'clubs', rank: 7, faceUp: true };

    expect(isValidCascadeSequence([redTen, blackNine, redEight, blackSeven])).toBe(true);
    expect(isValidCascadeSequence([redTen, redEight])).toBe(false);
  });

  it('should detect win condition when all foundations have 13 cards', () => {
    const dummy: Card = { id: 'c', suit: 'hearts', rank: 1, faceUp: true };
    const full = Array(13).fill(dummy);
    const partial = Array(12).fill(dummy);

    expect(isGameWon([full, full, full, full])).toBe(true);
    expect(isGameWon([full, full, full, partial])).toBe(false);
  });
});
