import { describe, it, expect } from 'vitest';
import {
  SudokuCore,
  initSudokuState,
  setCellValue,
  toggleNote,
  eraseCell,
  undoSudoku,
} from '../components/sudoku/sudokuLogic';

describe('Sudoku Core Logic', () => {
  it('should validate placement correctly', () => {
    const board = SudokuCore.createEmptyBoard();
    board[0][0] = 5;

    // Same row conflict
    expect(SudokuCore.isValid(board, 0, 5, 5)).toBe(false);
    expect(SudokuCore.isValid(board, 0, 5, 6)).toBe(true);

    // Same column conflict
    expect(SudokuCore.isValid(board, 5, 0, 5)).toBe(false);
    expect(SudokuCore.isValid(board, 5, 0, 7)).toBe(true);

    // Same 3x3 block conflict
    expect(SudokuCore.isValid(board, 1, 1, 5)).toBe(false);
    expect(SudokuCore.isValid(board, 1, 1, 8)).toBe(true);
  });

  it('should detect conflicts across row, column, and box', () => {
    const board = SudokuCore.createEmptyBoard();
    board[0][0] = 5;
    board[0][4] = 5; // row duplicate

    const conflicts = SudokuCore.getAllConflicts(board);
    expect(conflicts.has(0)).toBe(true); // 0*9 + 0
    expect(conflicts.has(4)).toBe(true); // 0*9 + 4
  });

  it('should generate a valid complete solution board', () => {
    const solution = SudokuCore.generateSolution();
    expect(solution.length).toBe(9);
    for (let r = 0; r < 9; r++) {
      expect(solution[r].length).toBe(9);
      for (let c = 0; c < 9; c++) {
        expect(solution[r][c]).toBeGreaterThanOrEqual(1);
        expect(solution[r][c]).toBeLessThanOrEqual(9);
      }
    }
    // Verify zero conflicts
    expect(SudokuCore.getAllConflicts(solution).size).toBe(0);
  });

  it('should generate a puzzle with unique solution and valid clue count', () => {
    const { puzzle, solution, cluesCount } = SudokuCore.createPuzzle('easy');
    expect(cluesCount).toBeLessThanOrEqual(42);
    expect(SudokuCore.countSolutions(puzzle, 2)).toBe(1);

    // Puzzle numbers must match solution
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (puzzle[r][c] !== 0) {
          expect(puzzle[r][c]).toBe(solution[r][c]);
        }
      }
    }
  });

  it('should calculate remaining numbers correctly', () => {
    const board = SudokuCore.createEmptyBoard();
    board[0][0] = 1;
    board[0][1] = 1;
    const remaining = SudokuCore.getRemainingNumbers(board);
    expect(remaining[1]).toBe(7);
    expect(remaining[2]).toBe(9);
  });
});

describe('Sudoku State Management', () => {
  it('should initialize state and allow input, undo, notes, and erase', () => {
    const state = initSudokuState('easy');
    expect(state.isPlaying).toBe(true);
    expect(state.isWon).toBe(false);

    // Find an empty cell
    let targetR = -1;
    let targetC = -1;
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (state.initialBoard[r][c] === 0) {
          targetR = r;
          targetC = c;
          break;
        }
      }
      if (targetR !== -1) break;
    }

    expect(targetR).toBeGreaterThanOrEqual(0);

    // Enter note
    const notedState = toggleNote(state, targetR, targetC, 4);
    expect(notedState.notes[targetR][targetC].has(4)).toBe(true);

    // Set value (should clear note for that cell)
    const filledState = setCellValue(notedState, targetR, targetC, 4);
    expect(filledState.currentBoard[targetR][targetC]).toBe(4);
    expect(filledState.notes[targetR][targetC].size).toBe(0);

    // Erase cell
    const erasedState = eraseCell(filledState, targetR, targetC);
    expect(erasedState.currentBoard[targetR][targetC]).toBe(0);

    // Undo erase
    const undoneState = undoSudoku(erasedState);
    expect(undoneState.currentBoard[targetR][targetC]).toBe(4);
  });
});
