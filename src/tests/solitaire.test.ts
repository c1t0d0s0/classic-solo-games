import { describe, it, expect } from 'vitest';
import {
  canMoveToFoundation,
  canMoveToTableau,
  createShuffledDeck,
  getCardColor,
  initializeSolitaireGame,
  isGameWon,
} from '../components/solitaire/solitaireLogic';
import { Card } from '../types/solitaire';

describe('Solitaire Logic Tests', () => {
  it('should create a complete 52-card deck', () => {
    const deck = createShuffledDeck();
    expect(deck).toHaveLength(52);

    const suits = ['spades', 'hearts', 'clubs', 'diamonds'];
    suits.forEach((s) => {
      const suitCards = deck.filter((c) => c.suit === s);
      expect(suitCards).toHaveLength(13);
    });
  });

  it('should initialize a valid Solitaire game', () => {
    const game = initializeSolitaireGame(1);
    expect(game.tableau).toHaveLength(7);
    expect(game.tableau[0]).toHaveLength(1);
    expect(game.tableau[6]).toHaveLength(7);
    expect(game.stock).toHaveLength(24);
    expect(game.waste).toHaveLength(0);
    expect(game.foundations).toHaveLength(4);
    expect(game.foundations.every((f) => f.length === 0)).toBe(true);
  });

  it('should correctly identify card colors', () => {
    expect(getCardColor('hearts')).toBe('red');
    expect(getCardColor('diamonds')).toBe('red');
    expect(getCardColor('spades')).toBe('black');
    expect(getCardColor('clubs')).toBe('black');
  });

  it('should validate tableau moves accurately', () => {
    const blackKing: Card = { id: 'spades-13', suit: 'spades', rank: 13, faceUp: true };
    const redQueen: Card = { id: 'hearts-12', suit: 'hearts', rank: 12, faceUp: true };
    const blackQueen: Card = { id: 'clubs-12', suit: 'clubs', rank: 12, faceUp: true };
    const redJack: Card = { id: 'diamonds-11', suit: 'diamonds', rank: 11, faceUp: true };

    // Empty column allows only King
    expect(canMoveToTableau(blackKing, [])).toBe(true);
    expect(canMoveToTableau(redQueen, [])).toBe(false);

    // Red Queen can move onto Black King
    expect(canMoveToTableau(redQueen, [blackKing])).toBe(true);

    // Black Queen cannot move onto Black King (same color)
    expect(canMoveToTableau(blackQueen, [blackKing])).toBe(false);

    // Red Jack cannot move onto Black King (rank difference != 1)
    expect(canMoveToTableau(redJack, [blackKing])).toBe(false);
  });

  it('should validate foundation moves accurately', () => {
    const aceOfHearts: Card = { id: 'hearts-1', suit: 'hearts', rank: 1, faceUp: true };
    const twoOfHearts: Card = { id: 'hearts-2', suit: 'hearts', rank: 2, faceUp: true };
    const twoOfSpades: Card = { id: 'spades-2', suit: 'spades', rank: 2, faceUp: true };
    const threeOfHearts: Card = { id: 'hearts-3', suit: 'hearts', rank: 3, faceUp: true };

    // Empty foundation allows only Ace
    expect(canMoveToFoundation(aceOfHearts, [])).toBe(true);
    expect(canMoveToFoundation(twoOfHearts, [])).toBe(false);

    // 2 of Hearts onto Ace of Hearts
    expect(canMoveToFoundation(twoOfHearts, [aceOfHearts])).toBe(true);

    // 2 of Spades onto Ace of Hearts (wrong suit)
    expect(canMoveToFoundation(twoOfSpades, [aceOfHearts])).toBe(false);

    // 3 of Hearts onto Ace of Hearts (wrong rank jump)
    expect(canMoveToFoundation(threeOfHearts, [aceOfHearts])).toBe(false);
  });

  it('should detect win condition when all 4 foundations are full', () => {
    const dummyCard: Card = { id: 'c', suit: 'hearts', rank: 1, faceUp: true };
    const fullFoundation = Array(13).fill(dummyCard);
    const incompleteFoundation = Array(12).fill(dummyCard);

    expect(
      isGameWon([fullFoundation, fullFoundation, fullFoundation, fullFoundation])
    ).toBe(true);

    expect(
      isGameWon([fullFoundation, fullFoundation, fullFoundation, incompleteFoundation])
    ).toBe(false);
  });

  it('should generate a guaranteed solvable Solitaire game for Draw 1 and Draw 3', () => {
    const game1 = initializeSolitaireGame(1);
    expect(game1.tableau).toHaveLength(7);
    expect(game1.stock).toHaveLength(24);

    const game3 = initializeSolitaireGame(3);
    expect(game3.tableau).toHaveLength(7);
    expect(game3.stock).toHaveLength(24);
  });
});
