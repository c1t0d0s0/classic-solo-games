export type SudokuDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface SudokuState {
  difficulty: SudokuDifficulty;
  initialBoard: number[][];   // 9x9 (numbers 1-9, 0 = empty)
  currentBoard: number[][];   // 9x9 current user input
  solutionBoard: number[][];  // 9x9 solved board
  notes: Set<number>[][];     // 9x9 cell notes (1-9 candidate sets)
  selectedCell: [number, number] | null; // [row, col]
  isNotesMode: boolean;
  timeSeconds: number;
  isPlaying: boolean;
  isPaused: boolean;
  isWon: boolean;
  history: SudokuSnapshot[];
}

export interface SudokuSnapshot {
  board: number[][];
  notes: number[][][]; // array representation of Set<number> for history
}
