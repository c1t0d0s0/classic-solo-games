import { SudokuDifficulty, SudokuSnapshot, SudokuState } from '../../types/sudoku';

export class SudokuCore {
  static cloneBoard(board: number[][]): number[][] {
    return board.map((row) => [...row]);
  }

  static createEmptyBoard(): number[][] {
    return Array.from({ length: 9 }, () => Array(9).fill(0));
  }

  static createEmptyNotes(): Set<number>[][] {
    return Array.from({ length: 9 }, () =>
      Array.from({ length: 9 }, () => new Set<number>())
    );
  }

  static isValid(board: number[][], row: number, col: number, num: number): boolean {
    for (let i = 0; i < 9; i++) {
      if (board[row][i] === num || board[i][col] === num) return false;
    }
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (board[startRow + r][startCol + c] === num) return false;
      }
    }
    return true;
  }

  static hasConflict(board: number[][], row: number, col: number): boolean {
    const num = board[row][col];
    if (num === 0) return false;

    for (let c = 0; c < 9; c++) {
      if (c !== col && board[row][c] === num) return true;
    }
    for (let r = 0; r < 9; r++) {
      if (r !== row && board[r][col] === num) return true;
    }
    const startRow = Math.floor(row / 3) * 3;
    const startCol = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        const curR = startRow + r;
        const curC = startCol + c;
        if ((curR !== row || curC !== col) && board[curR][curC] === num) return true;
      }
    }
    return false;
  }

  static getAllConflicts(board: number[][]): Set<number> {
    const conflictIndices = new Set<number>();

    // Check rows
    for (let r = 0; r < 9; r++) {
      const seen = new Map<number, number>();
      for (let c = 0; c < 9; c++) {
        const val = board[r][c];
        if (val !== 0) {
          if (seen.has(val)) {
            conflictIndices.add(r * 9 + c);
            conflictIndices.add(r * 9 + seen.get(val)!);
          } else {
            seen.set(val, c);
          }
        }
      }
    }

    // Check cols
    for (let c = 0; c < 9; c++) {
      const seen = new Map<number, number>();
      for (let r = 0; r < 9; r++) {
        const val = board[r][c];
        if (val !== 0) {
          if (seen.has(val)) {
            conflictIndices.add(r * 9 + c);
            conflictIndices.add(seen.get(val)! * 9 + c);
          } else {
            seen.set(val, r);
          }
        }
      }
    }

    // Check 3x3 boxes
    for (let b = 0; b < 9; b++) {
      const startR = Math.floor(b / 3) * 3;
      const startC = (b % 3) * 3;
      const seen = new Map<number, number>();
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const row = startR + r;
          const col = startC + c;
          const val = board[row][col];
          if (val !== 0) {
            const idx = row * 9 + col;
            if (seen.has(val)) {
              conflictIndices.add(idx);
              conflictIndices.add(seen.get(val)!);
            } else {
              seen.set(val, idx);
            }
          }
        }
      }
    }

    return conflictIndices;
  }

  static countSolutions(board: number[][], limit = 2): number {
    let count = 0;

    const solveInternal = (grid: number[][]) => {
      if (count >= limit) return;

      let empty: [number, number] | null = null;
      let minCandidates = 10;

      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (grid[r][c] === 0) {
            let cands = 0;
            for (let n = 1; n <= 9; n++) {
              if (this.isValid(grid, r, c, n)) cands++;
            }
            if (cands === 0) return; // Dead end
            if (cands < minCandidates) {
              minCandidates = cands;
              empty = [r, c];
              if (cands === 1) break;
            }
          }
        }
        if (minCandidates === 1) break;
      }

      if (!empty) {
        count++;
        return;
      }

      const [r, c] = empty;
      for (let num = 1; num <= 9; num++) {
        if (this.isValid(grid, r, c, num)) {
          grid[r][c] = num;
          solveInternal(grid);
          grid[r][c] = 0;
          if (count >= limit) return;
        }
      }
    };

    const copy = this.cloneBoard(board);
    solveInternal(copy);
    return count;
  }

  static solve(board: number[][]): boolean {
    let empty: [number, number] | null = null;
    let minOptions = 10;

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0) {
          let options = 0;
          for (let n = 1; n <= 9; n++) {
            if (this.isValid(board, r, c, n)) options++;
          }
          if (options === 0) return false;
          if (options < minOptions) {
            minOptions = options;
            empty = [r, c];
            if (options === 1) break;
          }
        }
      }
      if (minOptions === 1) break;
    }

    if (!empty) return true;

    const [r, c] = empty;
    for (let num = 1; num <= 9; num++) {
      if (this.isValid(board, r, c, num)) {
        board[r][c] = num;
        if (this.solve(board)) return true;
        board[r][c] = 0;
      }
    }
    return false;
  }

  static shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  static generateSolution(): number[][] {
    const board = this.createEmptyBoard();

    const fillBox = (row: number, col: number) => {
      const nums = this.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
      let idx = 0;
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          board[row + r][col + c] = nums[idx++];
        }
      }
    };

    // Fill 3 diagonal independent 3x3 boxes
    fillBox(0, 0);
    fillBox(3, 3);
    fillBox(6, 6);

    const solveRandom = (grid: number[][]): boolean => {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (grid[r][c] === 0) {
            const nums = this.shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
            for (const n of nums) {
              if (this.isValid(grid, r, c, n)) {
                grid[r][c] = n;
                if (solveRandom(grid)) return true;
                grid[r][c] = 0;
              }
            }
            return false;
          }
        }
      }
      return true;
    };

    solveRandom(board);
    return board;
  }

  static createPuzzle(difficulty: SudokuDifficulty = 'medium'): {
    puzzle: number[][];
    solution: number[][];
    cluesCount: number;
  } {
    const solution = this.generateSolution();
    const puzzle = this.cloneBoard(solution);

    const targetCluesMap: Record<SudokuDifficulty, number> = {
      easy: 42,
      medium: 32,
      hard: 28,
      expert: 24,
    };
    const targetClues = targetCluesMap[difficulty] || 32;

    const cells = Array.from({ length: 81 }, (_, i) => i);
    this.shuffle(cells);

    let currentClues = 81;

    for (const idx of cells) {
      if (currentClues <= targetClues) break;
      const r = Math.floor(idx / 9);
      const c = idx % 9;
      const originalVal = puzzle[r][c];

      puzzle[r][c] = 0;

      // Ensure unique solution
      if (this.countSolutions(puzzle, 2) === 1) {
        currentClues--;
      } else {
        puzzle[r][c] = originalVal;
      }
    }

    return {
      puzzle,
      solution,
      cluesCount: currentClues,
    };
  }

  static getRemainingNumbers(board: number[][]): Record<number, number> {
    const counts: Record<number, number> = {
      1: 9, 2: 9, 3: 9, 4: 9, 5: 9, 6: 9, 7: 9, 8: 9, 9: 9,
    };

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const val = board[r][c];
        if (val >= 1 && val <= 9) {
          counts[val] = Math.max(0, counts[val] - 1);
        }
      }
    }
    return counts;
  }

  static isBoardComplete(board: number[][], solution: number[][]): boolean {
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (board[r][c] === 0 || board[r][c] !== solution[r][c]) {
          return false;
        }
      }
    }
    return true;
  }
}

// Convert Set<number>[][] to number[][][] for history storage
export const serializeNotes = (notes: Set<number>[][]): number[][][] => {
  return notes.map((row) => row.map((cell) => Array.from(cell)));
};

// Convert number[][][] back to Set<number>[][]
export const deserializeNotes = (serialized: number[][][]): Set<number>[][] => {
  return serialized.map((row) => row.map((cell) => new Set(cell)));
};

export const initSudokuState = (difficulty: SudokuDifficulty = 'easy'): SudokuState => {
  const { puzzle, solution } = SudokuCore.createPuzzle(difficulty);

  return {
    difficulty,
    initialBoard: SudokuCore.cloneBoard(puzzle),
    currentBoard: SudokuCore.cloneBoard(puzzle),
    solutionBoard: solution,
    notes: SudokuCore.createEmptyNotes(),
    selectedCell: null,
    isNotesMode: false,
    timeSeconds: 0,
    isPlaying: true,
    isPaused: false,
    isWon: false,
    history: [],
  };
};

export const setCellValue = (
  state: SudokuState,
  row: number,
  col: number,
  value: number,
  autoClearNotesSetting: boolean = true
): SudokuState => {
  // Can't edit initial clue cells
  if (state.initialBoard[row][col] !== 0 || state.isWon) {
    return state;
  }

  const snapshot: SudokuSnapshot = {
    board: SudokuCore.cloneBoard(state.currentBoard),
    notes: serializeNotes(state.notes),
  };

  const nextBoard = SudokuCore.cloneBoard(state.currentBoard);
  nextBoard[row][col] = value;

  // Clear notes for this cell
  const nextNotes = state.notes.map((r, rIdx) =>
    r.map((cSet, cIdx) => {
      const copy = new Set(cSet);
      if (rIdx === row && cIdx === col) {
        copy.clear();
      } else if (autoClearNotesSetting && value !== 0) {
        // Auto-clear candidate from same row, column, and 3x3 block
        const sameRow = rIdx === row;
        const sameCol = cIdx === col;
        const sameBlock =
          Math.floor(rIdx / 3) === Math.floor(row / 3) &&
          Math.floor(cIdx / 3) === Math.floor(col / 3);
        if (sameRow || sameCol || sameBlock) {
          copy.delete(value);
        }
      }
      return copy;
    })
  );

  const isWon = SudokuCore.isBoardComplete(nextBoard, state.solutionBoard);

  return {
    ...state,
    currentBoard: nextBoard,
    notes: nextNotes,
    isWon,
    isPlaying: !isWon,
    history: [...state.history, snapshot],
  };
};

export const toggleNote = (
  state: SudokuState,
  row: number,
  col: number,
  num: number
): SudokuState => {
  if (state.initialBoard[row][col] !== 0 || state.currentBoard[row][col] !== 0 || state.isWon) {
    return state;
  }

  const snapshot: SudokuSnapshot = {
    board: SudokuCore.cloneBoard(state.currentBoard),
    notes: serializeNotes(state.notes),
  };

  const nextNotes = state.notes.map((r, rIdx) =>
    r.map((cSet, cIdx) => {
      const copy = new Set(cSet);
      if (rIdx === row && cIdx === col) {
        if (copy.has(num)) {
          copy.delete(num);
        } else {
          copy.add(num);
        }
      }
      return copy;
    })
  );

  return {
    ...state,
    notes: nextNotes,
    history: [...state.history, snapshot],
  };
};

export const eraseCell = (state: SudokuState, row: number, col: number): SudokuState => {
  if (state.initialBoard[row][col] !== 0 || state.isWon) {
    return state;
  }

  // If cell is already empty and has no notes, no-op
  if (state.currentBoard[row][col] === 0 && state.notes[row][col].size === 0) {
    return state;
  }

  const snapshot: SudokuSnapshot = {
    board: SudokuCore.cloneBoard(state.currentBoard),
    notes: serializeNotes(state.notes),
  };

  const nextBoard = SudokuCore.cloneBoard(state.currentBoard);
  nextBoard[row][col] = 0;

  const nextNotes = state.notes.map((r, rIdx) =>
    r.map((cSet, cIdx) => {
      const copy = new Set(cSet);
      if (rIdx === row && cIdx === col) {
        copy.clear();
      }
      return copy;
    })
  );

  return {
    ...state,
    currentBoard: nextBoard,
    notes: nextNotes,
    history: [...state.history, snapshot],
  };
};

export const undoSudoku = (state: SudokuState): SudokuState => {
  if (state.history.length === 0 || state.isWon) {
    return state;
  }

  const prevHistory = [...state.history];
  const lastSnapshot = prevHistory.pop()!;

  return {
    ...state,
    currentBoard: lastSnapshot.board,
    notes: deserializeNotes(lastSnapshot.notes),
    history: prevHistory,
  };
};
