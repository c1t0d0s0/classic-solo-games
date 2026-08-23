import { DifficultyConfig, DifficultyLevel, MineCell } from '../../types/minesweeper';

export const DIFFICULTY_CONFIGS: Record<DifficultyLevel, DifficultyConfig> = {
  easy: { rows: 9, cols: 9, mines: 10, label: '初級 (9×9)' },
  medium: { rows: 16, cols: 16, mines: 40, label: '中級 (16×16)' },
  hard: { rows: 16, cols: 30, mines: 99, label: '上級 (30×16)' },
  custom: { rows: 9, cols: 9, mines: 10, label: 'カスタム' },
};

export const createEmptyBoard = (rows: number, cols: number): MineCell[][] => {
  const board: MineCell[][] = [];
  for (let r = 0; r < rows; r++) {
    const row: MineCell[] = [];
    for (let c = 0; c < cols; c++) {
      row.push({
        x: c,
        y: r,
        isMine: false,
        isOpen: false,
        isFlagged: false,
        isQuestion: false,
        neighborMines: 0,
      });
    }
    board.push(row);
  }
  return board;
};

// Generates mines ensuring the first clicked cell (and its 8 neighbors) are completely safe
export const placeMinesAndCalculateNumbers = (
  board: MineCell[][],
  rows: number,
  cols: number,
  minesCount: number,
  firstClickX: number,
  firstClickY: number
): MineCell[][] => {
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));

  // Identify forbidden coordinates (first click + surrounding 8 cells)
  const forbidden = new Set<string>();
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      const nx = firstClickX + dx;
      const ny = firstClickY + dy;
      if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
        forbidden.add(`${nx},${ny}`);
      }
    }
  }

  // Collect all available cell coordinates
  const availableCoords: [number, number][] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (!forbidden.has(`${c},${r}`)) {
        availableCoords.push([c, r]);
      }
    }
  }

  // Shuffle available coordinates
  for (let i = availableCoords.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [availableCoords[i], availableCoords[j]] = [availableCoords[j], availableCoords[i]];
  }

  // Place mines
  const minesToPlace = Math.min(minesCount, availableCoords.length);
  for (let i = 0; i < minesToPlace; i++) {
    const [mx, my] = availableCoords[i];
    newBoard[my][mx].isMine = true;
  }

  // Calculate neighbor counts
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (newBoard[r][c].isMine) continue;

      let count = 0;
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = c + dx;
          const ny = r + dy;
          if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
            if (newBoard[ny][nx].isMine) {
              count++;
            }
          }
        }
      }
      newBoard[r][c].neighborMines = count;
    }
  }

  return newBoard;
};

// Flood fill open zero cells
export const revealZeroCluster = (
  board: MineCell[][],
  startX: number,
  startY: number,
  rows: number,
  cols: number
): MineCell[][] => {
  const newBoard = board.map((row) => row.map((cell) => ({ ...cell })));
  const queue: [number, number][] = [[startX, startY]];
  newBoard[startY][startX].isOpen = true;

  while (queue.length > 0) {
    const [cx, cy] = queue.shift()!;
    const currentCell = newBoard[cy][cx];

    if (currentCell.neighborMines === 0) {
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = cx + dx;
          const ny = cy + dy;

          if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
            const neighbor = newBoard[ny][nx];
            if (!neighbor.isOpen && !neighbor.isFlagged && !neighbor.isMine) {
              neighbor.isOpen = true;
              if (neighbor.neighborMines === 0) {
                queue.push([nx, ny]);
              }
            }
          }
        }
      }
    }
  }

  return newBoard;
};

// Check if player won
export const checkMinesweeperWin = (board: MineCell[][], rows: number, cols: number): boolean => {
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const cell = board[r][c];
      // If a non-mine cell is still closed, game is not won yet
      if (!cell.isMine && !cell.isOpen) {
        return false;
      }
    }
  }
  return true;
};
