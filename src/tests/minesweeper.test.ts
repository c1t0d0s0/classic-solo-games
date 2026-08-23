import { describe, it, expect } from 'vitest';
import {
  checkMinesweeperWin,
  createEmptyBoard,
  placeMinesAndCalculateNumbers,
  revealZeroCluster,
} from '../components/minesweeper/minesweeperLogic';

describe('Minesweeper Logic Tests', () => {
  it('should initialize an empty board with correct dimensions', () => {
    const board = createEmptyBoard(9, 9);
    expect(board).toHaveLength(9);
    expect(board[0]).toHaveLength(9);
    expect(board[0][0].isOpen).toBe(false);
    expect(board[0][0].isMine).toBe(false);
    expect(board[0][0].neighborMines).toBe(0);
  });

  it('should guarantee first-click safe opening (first cell and 8 neighbors are mine-free)', () => {
    const rows = 9;
    const cols = 9;
    const mines = 10;
    const firstX = 4;
    const firstY = 4;

    const empty = createEmptyBoard(rows, cols);
    const populated = placeMinesAndCalculateNumbers(empty, rows, cols, mines, firstX, firstY);

    // Total mines should match
    let totalMines = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (populated[r][c].isMine) totalMines++;
      }
    }
    expect(totalMines).toBe(mines);

    // First cell and 8 neighbors must NOT have mines
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        const nx = firstX + dx;
        const ny = firstY + dy;
        expect(populated[ny][nx].isMine).toBe(false);
      }
    }
  });

  it('should reveal zero-cluster recursively', () => {
    const board = createEmptyBoard(5, 5);
    // Put a single mine at (4,4)
    board[4][4].isMine = true;
    board[4][3].neighborMines = 1;
    board[3][4].neighborMines = 1;
    board[3][3].neighborMines = 1;

    // Reveal from (0,0) which has neighborMines = 0
    const revealed = revealZeroCluster(board, 0, 0, 5, 5);

    // (0,0) and surrounding 0s should be open
    expect(revealed[0][0].isOpen).toBe(true);
    expect(revealed[2][2].isOpen).toBe(true);
    // Mine at (4,4) must still be closed
    expect(revealed[4][4].isOpen).toBe(false);
  });

  it('should accurately detect Minesweeper win', () => {
    const board = createEmptyBoard(3, 3);
    // 1 mine at (0,0)
    board[0][0].isMine = true;

    // If other 8 cells are closed, win is false
    expect(checkMinesweeperWin(board, 3, 3)).toBe(false);

    // Open all non-mine cells
    for (let r = 0; r < 3; r++) {
      for (let c = 0; c < 3; c++) {
        if (r !== 0 || c !== 0) {
          board[r][c].isOpen = true;
        }
      }
    }

    expect(checkMinesweeperWin(board, 3, 3)).toBe(true);
  });
});
