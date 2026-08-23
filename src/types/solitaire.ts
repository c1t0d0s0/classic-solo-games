export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type CardColor = 'red' | 'black';

export interface Card {
  id: string; // e.g., 'hearts-1'
  suit: Suit;
  rank: number; // 1 = Ace, 11 = Jack, 12 = Queen, 13 = King
  faceUp: boolean;
}

export type PileType = 'stock' | 'waste' | 'foundation' | 'tableau';

export interface CardLocation {
  pileType: PileType;
  pileIndex: number; // 0-3 for foundation, 0-6 for tableau, 0 for stock/waste
  cardIndex: number;
}

export interface SolitaireState {
  stock: Card[];
  waste: Card[];
  foundations: Card[][]; // 4 foundation piles
  tableau: Card[][]; // 7 tableau columns
  drawMode: 1 | 3;
  moves: number;
  score: number;
  timeSeconds: number;
  isPlaying: boolean;
  isWon: boolean;
  autoCompletable: boolean;
}

export interface SolitaireSnapshot {
  stock: Card[];
  waste: Card[];
  foundations: Card[][];
  tableau: Card[][];
  moves: number;
  score: number;
}
