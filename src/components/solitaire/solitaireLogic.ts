import { Card, CardColor, PileType, SolitaireState, Suit } from '../../types/solitaire';

export const SUITS: Suit[] = ['spades', 'hearts', 'clubs', 'diamonds'];
export const RANKS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13]; // 1: Ace, 11: J, 12: Q, 13: K

export const getCardColor = (suit: Suit): CardColor => {
  return suit === 'hearts' || suit === 'diamonds' ? 'red' : 'black';
};

export const getRankLabel = (rank: number): string => {
  switch (rank) {
    case 1: return 'A';
    case 11: return 'J';
    case 12: return 'Q';
    case 13: return 'K';
    default: return rank.toString();
  }
};

export const getSuitSymbol = (suit: Suit): string => {
  switch (suit) {
    case 'spades': return '♠';
    case 'hearts': return '♥';
    case 'clubs': return '♣';
    case 'diamonds': return '♦';
  }
};

export const createShuffledDeck = (): Card[] => {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `${suit}-${rank}`,
        suit,
        rank,
        faceUp: false,
      });
    }
  }

  // Fisher-Yates shuffle
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }

  return deck;
};

export const initializeSolitaireGame = (drawMode: 1 | 3 = 1): SolitaireState => {
  const deck = createShuffledDeck();
  const tableau: Card[][] = [[], [], [], [], [], [], []];

  // Deal tableau: 1st col has 1 card, 2nd has 2, ..., 7th has 7 cards
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = deck.pop()!;
      if (row === col) {
        card.faceUp = true; // Top card is face up
      }
      tableau[col].push(card);
    }
  }

  // Remaining 24 cards go to stock (face down)
  const stock: Card[] = deck.map((c) => ({ ...c, faceUp: false }));
  const waste: Card[] = [];
  const foundations: Card[][] = [[], [], [], []];

  return {
    stock,
    waste,
    foundations,
    tableau,
    drawMode,
    moves: 0,
    score: 0,
    timeSeconds: 0,
    isPlaying: false,
    isWon: false,
    autoCompletable: false,
  };
};

export const canMoveToTableau = (card: Card, targetColumn: Card[]): boolean => {
  if (targetColumn.length === 0) {
    return card.rank === 13; // King only
  }
  const topCard = targetColumn[targetColumn.length - 1];
  if (!topCard.faceUp) return false;

  const cardColor = getCardColor(card.suit);
  const topCardColor = getCardColor(topCard.suit);

  return cardColor !== topCardColor && card.rank === topCard.rank - 1;
};

export const canMoveToFoundation = (card: Card, foundationPile: Card[]): boolean => {
  if (foundationPile.length === 0) {
    return card.rank === 1; // Ace only
  }
  const topCard = foundationPile[foundationPile.length - 1];
  return card.suit === topCard.suit && card.rank === topCard.rank + 1;
};

export const isGameWon = (foundations: Card[][]): boolean => {
  return foundations.every((f) => f.length === 13);
};

export const checkIsAutoCompletable = (state: SolitaireState): boolean => {
  if (state.stock.length > 0 || state.waste.length > 0) return false;
  // All cards in tableau must be face-up
  for (const col of state.tableau) {
    for (const card of col) {
      if (!card.faceUp) return false;
    }
  }
  return true;
};

// Finds an auto destination for single card tap (prefers foundation, then tableau)
export const findAutoMoveDestination = (
  card: Card,
  fromPile: PileType,
  fromColIndex: number,
  state: SolitaireState
): { targetPile: PileType; targetIndex: number } | null => {
  // Check Foundations first
  for (let i = 0; i < 4; i++) {
    if (canMoveToFoundation(card, state.foundations[i])) {
      return { targetPile: 'foundation', targetIndex: i };
    }
  }

  // Check Tableau next (avoid moving from a tableau column if it's already top and doesn't reveal any new card unless helpful)
  for (let i = 0; i < 7; i++) {
    if (fromPile === 'tableau' && fromColIndex === i) continue;
    if (canMoveToTableau(card, state.tableau[i])) {
      return { targetPile: 'tableau', targetIndex: i };
    }
  }

  return null;
};
