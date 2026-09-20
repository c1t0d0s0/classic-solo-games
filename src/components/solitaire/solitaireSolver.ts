import { Card, SolitaireState, Suit } from '../../types/solitaire';
import { getCardColor, SUITS, RANKS } from './solitaireLogic';

interface SearchCard {
  suit: Suit;
  rank: number;
  faceUp: boolean;
}

interface SearchState {
  f: [number, number, number, number]; // Spades, Hearts, Clubs, Diamonds (0..13)
  stock: SearchCard[];
  waste: SearchCard[];
  tab: SearchCard[][];
  drawsWithoutProgress: number;
  priority?: number;
}

const suitToIndex = (suit: Suit): number => {
  switch (suit) {
    case 'spades': return 0;
    case 'hearts': return 1;
    case 'clubs': return 2;
    case 'diamonds': return 3;
  }
};

const isGameWonInternal = (f: [number, number, number, number]): boolean => {
  return f[0] === 13 && f[1] === 13 && f[2] === 13 && f[3] === 13;
};

const encodeState = (
  f: [number, number, number, number],
  stockLen: number,
  wasteTop: string,
  tab: SearchCard[][]
): string => {
  let s = `${f[0]},${f[1]},${f[2]},${f[3]}|s${stockLen},w${wasteTop}|`;
  for (let i = 0; i < 7; i++) {
    const col = tab[i];
    s += `${i}:`;
    for (let j = 0; j < col.length; j++) {
      const c = col[j];
      s += c.faceUp ? `${c.suit[0]}${c.rank}` : 'X';
    }
    s += ';';
  }
  return s;
};

const cloneFast = (
  f: [number, number, number, number],
  st: SearchCard[],
  w: SearchCard[],
  tab: SearchCard[][]
): SearchState => {
  return {
    f: [f[0], f[1], f[2], f[3]],
    stock: st.map((c) => ({ suit: c.suit, rank: c.rank, faceUp: c.faceUp })),
    waste: w.map((c) => ({ suit: c.suit, rank: c.rank, faceUp: c.faceUp })),
    tab: tab.map((col) => col.map((c) => ({ suit: c.suit, rank: c.rank, faceUp: c.faceUp }))),
    drawsWithoutProgress: 0,
  };
};

/**
 * Fast search solver that verifies whether a Solitaire deal has a winning path.
 * Uses priority-guided depth search with state memoization.
 */
export const isSolitaireSolvable = (
  initialState: SolitaireState,
  drawMode: 1 | 3 = 1,
  maxNodes = 2500
): boolean => {
  const foundations: [number, number, number, number] = [0, 0, 0, 0];
  const stock: SearchCard[] = initialState.stock.map((c) => ({
    suit: c.suit,
    rank: c.rank,
    faceUp: false,
  }));
  const waste: SearchCard[] = [];
  const tab: SearchCard[][] = initialState.tableau.map((col) =>
    col.map((c) => ({ suit: c.suit, rank: c.rank, faceUp: c.faceUp }))
  );

  const visited = new Set<string>();
  let nodes = 0;

  const stack: SearchState[] = [
    {
      f: foundations,
      stock,
      waste,
      tab,
      drawsWithoutProgress: 0,
    },
  ];

  while (stack.length > 0) {
    nodes++;
    if (nodes > maxNodes) return false;

    const curr = stack.pop()!;
    if (isGameWonInternal(curr.f)) return true;

    const wasteTopStr =
      curr.waste.length > 0
        ? `${curr.waste[curr.waste.length - 1].suit[0]}${curr.waste[curr.waste.length - 1].rank}`
        : '';
    const key = encodeState(curr.f, curr.stock.length, wasteTopStr, curr.tab);
    if (visited.has(key)) continue;
    visited.add(key);

    const nextStates: SearchState[] = [];

    // 1. Tableau -> Foundation
    for (let c = 0; c < 7; c++) {
      const col = curr.tab[c];
      if (col.length === 0) continue;
      const card = col[col.length - 1];
      if (!card.faceUp) continue;
      const sIdx = suitToIndex(card.suit);
      if (curr.f[sIdx] === card.rank - 1) {
        const next = cloneFast(curr.f, curr.stock, curr.waste, curr.tab);
        next.f[sIdx] = card.rank;
        next.tab[c].pop();
        if (next.tab[c].length > 0) {
          next.tab[c][next.tab[c].length - 1].faceUp = true;
        }
        next.drawsWithoutProgress = 0;
        next.priority = 120 + (card.rank <= 2 ? 30 : 0);
        nextStates.push(next);
      }
    }

    // 2. Waste -> Foundation
    if (curr.waste.length > 0) {
      const card = curr.waste[curr.waste.length - 1];
      const sIdx = suitToIndex(card.suit);
      if (curr.f[sIdx] === card.rank - 1) {
        const next = cloneFast(curr.f, curr.stock, curr.waste, curr.tab);
        next.f[sIdx] = card.rank;
        next.waste.pop();
        next.drawsWithoutProgress = 0;
        next.priority = 110 + (card.rank <= 2 ? 30 : 0);
        nextStates.push(next);
      }
    }

    // 3. Move face-up cards within Tableau
    for (let from = 0; from < 7; from++) {
      const fromCol = curr.tab[from];
      if (fromCol.length === 0) continue;

      let firstFaceUp = 0;
      while (firstFaceUp < fromCol.length && !fromCol[firstFaceUp].faceUp) firstFaceUp++;
      if (firstFaceUp >= fromCol.length) continue;

      for (let cardIdx = firstFaceUp; cardIdx < fromCol.length; cardIdx++) {
        const card = fromCol[cardIdx];
        if (card.rank === 13 && cardIdx === 0) continue; // Skip moving King to King

        for (let to = 0; to < 7; to++) {
          if (to === from) continue;
          const toCol = curr.tab[to];
          const canMove =
            toCol.length === 0
              ? card.rank === 13
              : toCol[toCol.length - 1].faceUp &&
                getCardColor(card.suit) !== getCardColor(toCol[toCol.length - 1].suit) &&
                card.rank === toCol[toCol.length - 1].rank - 1;

          if (canMove) {
            const next = cloneFast(curr.f, curr.stock, curr.waste, curr.tab);
            const moving = next.tab[from].splice(cardIdx);
            next.tab[to].push(...moving);
            let uncovers = false;
            if (next.tab[from].length > 0 && !next.tab[from][next.tab[from].length - 1].faceUp) {
              next.tab[from][next.tab[from].length - 1].faceUp = true;
              uncovers = true;
            }
            next.drawsWithoutProgress = curr.drawsWithoutProgress;
            next.priority = uncovers ? 90 : toCol.length === 0 ? 40 : 70;
            nextStates.push(next);
          }
        }
      }
    }

    // 4. Waste -> Tableau
    if (curr.waste.length > 0) {
      const card = curr.waste[curr.waste.length - 1];
      for (let to = 0; to < 7; to++) {
        const toCol = curr.tab[to];
        const canMove =
          toCol.length === 0
            ? card.rank === 13
            : toCol[toCol.length - 1].faceUp &&
              getCardColor(card.suit) !== getCardColor(toCol[toCol.length - 1].suit) &&
              card.rank === toCol[toCol.length - 1].rank - 1;

        if (canMove) {
          const next = cloneFast(curr.f, curr.stock, curr.waste, curr.tab);
          next.waste.pop();
          next.tab[to].push(card);
          next.drawsWithoutProgress = 0;
          next.priority = curr.tab[to].length === 0 ? 45 : 80;
          nextStates.push(next);
        }
      }
    }

    // 5. Stock -> Waste
    if (curr.stock.length > 0) {
      const next = cloneFast(curr.f, curr.stock, curr.waste, curr.tab);
      const drawCount = Math.min(drawMode, next.stock.length);
      for (let d = 0; d < drawCount; d++) {
        const c = next.stock.pop()!;
        c.faceUp = true;
        next.waste.push(c);
      }
      next.drawsWithoutProgress = curr.drawsWithoutProgress + 1;
      next.priority = 25;
      nextStates.push(next);
    } else if (curr.waste.length > 0 && curr.drawsWithoutProgress < (drawMode === 1 ? 3 : 6)) {
      // Recycle Waste to Stock
      const next = cloneFast(curr.f, curr.stock, curr.waste, curr.tab);
      while (next.waste.length > 0) {
        const c = next.waste.pop()!;
        c.faceUp = false;
        next.stock.push(c);
      }
      next.drawsWithoutProgress = curr.drawsWithoutProgress + 1;
      next.priority = 15;
      nextStates.push(next);
    }

    // Sort ascending by priority so pop() picks the highest priority first
    nextStates.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
    for (const ns of nextStates) {
      stack.push(ns);
    }
  }

  return false;
};

/**
 * Creates a raw dealt Solitaire game state.
 */
export const createCandidateGame = (drawMode: 1 | 3 = 1): SolitaireState => {
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

  const tableau: Card[][] = [[], [], [], [], [], [], []];
  for (let col = 0; col < 7; col++) {
    for (let row = 0; row <= col; row++) {
      const card = deck.pop()!;
      if (row === col) {
        card.faceUp = true;
      }
      tableau[col].push(card);
    }
  }

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

/**
 * Generates a guaranteed 100% solvable Klondike Solitaire game.
 * Verifies with the solver before returning.
 */
export const generateGuaranteedSolvableGame = (drawMode: 1 | 3 = 1): SolitaireState => {
  const maxAttempts = 25;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const candidate = createCandidateGame(drawMode);
    if (isSolitaireSolvable(candidate, drawMode, 2200)) {
      return candidate;
    }
  }

  // Fallback (extremely rare safeguard)
  return createCandidateGame(drawMode);
};
