import { Card } from '../../types/solitaire';
import { FreeCellPileType, FreeCellState } from '../../types/freecell';
import { getCardColor } from '../solitaire/solitaireLogic';
import { generateFreeCellDeal, getRandomFreeCellGameNumber } from './freecellRNG';

export const initializeFreeCellGame = (gameNumber?: number): FreeCellState => {
  const num = gameNumber && gameNumber > 0 ? gameNumber : getRandomFreeCellGameNumber();
  const cascades = generateFreeCellDeal(num);

  return {
    gameNumber: num,
    freeCells: [null, null, null, null],
    foundations: [[], [], [], []], // 0: clubs, 1: diamonds, 2: hearts, 3: spades
    cascades,
    moves: 0,
    timeSeconds: 0,
    isPlaying: false,
    isWon: false,
    autoCompletable: false,
  };
};

export const canMoveToCascade = (card: Card, targetColumn: Card[]): boolean => {
  if (targetColumn.length === 0) {
    return true; // Any card can be placed in an empty column in FreeCell
  }
  const topCard = targetColumn[targetColumn.length - 1];
  return getCardColor(card.suit) !== getCardColor(topCard.suit) && card.rank === topCard.rank - 1;
};

export const canMoveToFoundation = (card: Card, foundationPile: Card[]): boolean => {
  if (foundationPile.length === 0) {
    return card.rank === 1; // Ace only
  }
  const topCard = foundationPile[foundationPile.length - 1];
  return card.suit === topCard.suit && card.rank === topCard.rank + 1;
};

export const canMoveToFreeCell = (cellCard: Card | null): boolean => {
  return cellCard === null;
};

/**
 * Checks if a slice of cards forms a valid descending alternate-colored sequence.
 */
export const isValidCascadeSequence = (cards: Card[]): boolean => {
  if (cards.length <= 1) return true;
  for (let i = 0; i < cards.length - 1; i++) {
    const curr = cards[i];
    const next = cards[i + 1];
    if (getCardColor(curr.suit) === getCardColor(next.suit)) return false;
    if (curr.rank !== next.rank + 1) return false;
  }
  return true;
};

/**
 * Calculates the maximum number of cards that can be moved as a packed sequence.
 * Formula: (1 + emptyCells) * 2^(effectiveEmptyCols)
 */
export const getMaxMovingCards = (
  emptyCells: number,
  emptyCols: number,
  movingToEmptyCol = false
): number => {
  const effectiveEmptyCols = movingToEmptyCol ? Math.max(0, emptyCols - 1) : emptyCols;
  return (1 + emptyCells) * Math.pow(2, effectiveEmptyCols);
};

export const getEmptyCellCount = (freeCells: (Card | null)[]): number => {
  return freeCells.filter((c) => c === null).length;
};

export const getEmptyColCount = (cascades: Card[][]): number => {
  return cascades.filter((c) => c.length === 0).length;
};

export const isGameWon = (foundations: Card[][]): boolean => {
  return foundations.every((f) => f.length === 13);
};

/**
 * Checks if a card is safe to automatically send to the foundation.
 * Ace and 2 are always safe.
 * Rank R >= 3 is safe if both opposite-colored foundations have at least R - 1 (or R - 2).
 */
export const isCardSafeForFoundation = (card: Card, foundations: Card[][]): boolean => {
  if (card.rank <= 2) return true;

  const isRed = getCardColor(card.suit) === 'red';
  // Check opposite color foundation ranks
  let opp1Rank = 0;
  let opp2Rank = 0;

  for (const f of foundations) {
    if (f.length === 0) continue;
    const top = f[f.length - 1];
    const topIsRed = getCardColor(top.suit) === 'red';
    if (topIsRed !== isRed) {
      if (opp1Rank === 0) {
        opp1Rank = top.rank;
      } else {
        opp2Rank = top.rank;
      }
    }
  }

  // Both opposite foundations must be at least card.rank - 1
  return opp1Rank >= card.rank - 1 && opp2Rank >= card.rank - 1;
};

/**
 * Finds automatic move destination for tap-to-move.
 * Priority: Foundation -> Non-empty Cascade -> Empty Cascade -> Free Cell.
 */
export const findAutoMoveDestination = (
  card: Card,
  source: { pileType: FreeCellPileType; pileIndex: number },
  state: FreeCellState,
  cardsToMoveCount = 1
): { targetPile: FreeCellPileType; targetIndex: number } | null => {
  // 1. Check Foundation (only for single card)
  if (cardsToMoveCount === 1) {
    for (let fIdx = 0; fIdx < 4; fIdx++) {
      if (canMoveToFoundation(card, state.foundations[fIdx])) {
        return { targetPile: 'foundation', targetIndex: fIdx };
      }
    }
  }

  // Calculate max allowed moving cards
  const emptyCells = getEmptyCellCount(state.freeCells);
  const emptyCols = getEmptyColCount(state.cascades);

  // 2. Check Non-empty Cascades
  const maxNonEmpty = getMaxMovingCards(emptyCells, emptyCols, false);
  if (cardsToMoveCount <= maxNonEmpty) {
    for (let cIdx = 0; cIdx < 8; cIdx++) {
      if (source.pileType === 'cascade' && source.pileIndex === cIdx) continue;
      const targetCol = state.cascades[cIdx];
      if (targetCol.length > 0 && canMoveToCascade(card, targetCol)) {
        return { targetPile: 'cascade', targetIndex: cIdx };
      }
    }
  }

  // 3. Check Empty Cascades
  const maxEmpty = getMaxMovingCards(emptyCells, emptyCols, true);
  if (cardsToMoveCount <= maxEmpty) {
    for (let cIdx = 0; cIdx < 8; cIdx++) {
      if (source.pileType === 'cascade' && source.pileIndex === cIdx) continue;
      const targetCol = state.cascades[cIdx];
      if (targetCol.length === 0) {
        return { targetPile: 'cascade', targetIndex: cIdx };
      }
    }
  }

  // 4. Check Free Cells (only single card and from cascade)
  if (cardsToMoveCount === 1 && source.pileType === 'cascade') {
    for (let cellIdx = 0; cellIdx < 4; cellIdx++) {
      if (canMoveToFreeCell(state.freeCells[cellIdx])) {
        return { targetPile: 'freecell', targetIndex: cellIdx };
      }
    }
  }

  return null;
};
