export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'custom';

export interface DifficultyConfig {
  rows: number;
  cols: number;
  mines: number;
  label: string;
}

export interface MineCell {
  x: number;
  y: number;
  isMine: boolean;
  isOpen: boolean;
  isFlagged: boolean;
  isQuestion: boolean;
  neighborMines: number;
  isExploded?: boolean;
}

export type GameStatus = 'ready' | 'playing' | 'won' | 'lost';
export type FaceStatus = 'smile' | 'scared' | 'won' | 'dead';

export interface MinesweeperState {
  board: MineCell[][];
  difficulty: DifficultyLevel;
  customConfig?: { rows: number; cols: number; mines: number };
  status: GameStatus;
  minesLeft: number;
  timeSeconds: number;
  firstClick: boolean;
  flagMode: boolean; // Mobile toggle for tapping to flag
}
