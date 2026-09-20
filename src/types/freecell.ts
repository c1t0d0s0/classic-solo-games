import { Card } from './solitaire';

export type FreeCellPileType = 'freecell' | 'foundation' | 'cascade';

export interface FreeCellState {
  gameNumber: number;
  freeCells: (Card | null)[]; // 4 free cells
  foundations: Card[][];       // 4 foundation piles (spades, hearts, clubs, diamonds)
  cascades: Card[][];          // 8 tableau cascades
  moves: number;
  timeSeconds: number;
  isPlaying: boolean;
  isWon: boolean;
  autoCompletable: boolean;
}

export interface FreeCellSelectedCardInfo {
  pileType: FreeCellPileType;
  pileIndex: number;
  cardIndex: number;
}
