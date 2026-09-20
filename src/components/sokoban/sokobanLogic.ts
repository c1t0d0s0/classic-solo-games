import { SokobanBox, SokobanDirection, SokobanPlayer, SokobanSnapshot, SokobanState } from '../../types/sokoban';
import { SOKOBAN_LEVELS } from './sokobanLevels';
import { SokobanSolver } from './sokobanSolver';

const DIR_DELTAS: Record<SokobanDirection, { dx: number; dy: number }> = {
  up: { dx: 0, dy: -1 },
  down: { dx: 0, dy: 1 },
  left: { dx: -1, dy: 0 },
  right: { dx: 1, dy: 0 },
};

export const loadSokobanLevel = (index: number): SokobanState => {
  const safeIndex = Math.max(0, Math.min(index, SOKOBAN_LEVELS.length - 1));
  const rawString = SOKOBAN_LEVELS[safeIndex];
  const lines = rawString.split('\n');

  const rows = lines.length;
  let cols = 0;
  for (let r = 0; r < rows; r++) {
    cols = Math.max(cols, lines[r].length);
  }

  const grid: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
  const boxes: SokobanBox[] = [];
  let player: SokobanPlayer = { x: 0, y: 0, dir: 'right', face: '•_•' };
  let boxId = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < lines[r].length; c++) {
      const char = lines[r][c];
      switch (char) {
        case '#':
          grid[r][c] = 1; // Wall
          break;
        case '.':
          grid[r][c] = 2; // Goal
          break;
        case '@':
          player = { x: c, y: r, dir: 'right', face: '•_•' };
          grid[r][c] = 0; // Floor
          break;
        case '+':
          player = { x: c, y: r, dir: 'right', face: '•_•' };
          grid[r][c] = 2; // Goal
          break;
        case '$':
          boxes.push({ id: boxId++, x: c, y: r });
          grid[r][c] = 0; // Floor
          break;
        case '*':
          boxes.push({ id: boxId++, x: c, y: r });
          grid[r][c] = 2; // Goal
          break;
        default:
          grid[r][c] = 0;
          break;
      }
    }
  }

  return {
    stageIndex: safeIndex,
    rows,
    cols,
    grid,
    player,
    boxes,
    movesCount: 0,
    pushesCount: 0,
    timeSeconds: 0,
    isPlaying: true,
    isWon: false,
    history: [],
  };
};

export const movePlayer = (
  state: SokobanState,
  dir: SokobanDirection
): {
  state: SokobanState;
  moved: boolean;
  pushed: boolean;
  won: boolean;
  deadlocked: boolean;
} => {
  if (state.isWon) {
    return { state, moved: false, pushed: false, won: true, deadlocked: false };
  }

  const { dx, dy } = DIR_DELTAS[dir];
  const nextX = state.player.x + dx;
  const nextY = state.player.y + dy;

  // Out of bounds check
  if (nextY < 0 || nextY >= state.grid.length || nextX < 0 || nextX >= state.grid[0].length) {
    return { state, moved: false, pushed: false, won: false, deadlocked: false };
  }

  // Wall check
  if (state.grid[nextY][nextX] === 1) {
    return { state, moved: false, pushed: false, won: false, deadlocked: false };
  }

  // Snapshot current state for history
  const snapshot: SokobanSnapshot = {
    player: { ...state.player },
    boxes: state.boxes.map((b) => ({ ...b })),
    movesCount: state.movesCount,
    pushesCount: state.pushesCount,
  };

  const targetBoxIdx = state.boxes.findIndex((b) => b.x === nextX && b.y === nextY);

  if (targetBoxIdx !== -1) {
    // Pushing box
    const nextBoxX = nextX + dx;
    const nextBoxY = nextY + dy;

    // Box out of bounds check
    if (
      nextBoxY < 0 ||
      nextBoxY >= state.grid.length ||
      nextBoxX < 0 ||
      nextBoxX >= state.grid[0].length
    ) {
      return { state, moved: false, pushed: false, won: false, deadlocked: false };
    }

    // Box hits wall
    if (state.grid[nextBoxY][nextBoxX] === 1) {
      return { state, moved: false, pushed: false, won: false, deadlocked: false };
    }

    // Box hits another box
    if (state.boxes.some((b) => b.x === nextBoxX && b.y === nextBoxY)) {
      return { state, moved: false, pushed: false, won: false, deadlocked: false };
    }

    // Move box and player
    const updatedBoxes = state.boxes.map((b, idx) =>
      idx === targetBoxIdx ? { ...b, x: nextBoxX, y: nextBoxY } : b
    );

    const isWon = updatedBoxes.every((b) => state.grid[b.y][b.x] === 2);
    const deadlocked = !isWon && SokobanSolver.isDeadlockState(state.grid, updatedBoxes);

    const nextPlayer: SokobanPlayer = {
      x: nextX,
      y: nextY,
      dir,
      face: isWon ? '^▽^' : '>_<',
    };

    return {
      state: {
        ...state,
        player: nextPlayer,
        boxes: updatedBoxes,
        movesCount: state.movesCount + 1,
        pushesCount: state.pushesCount + 1,
        isWon,
        isPlaying: !isWon,
        history: [...state.history, snapshot],
      },
      moved: true,
      pushed: true,
      won: isWon,
      deadlocked,
    };
  }

  // Player only move
  const nextPlayer: SokobanPlayer = {
    x: nextX,
    y: nextY,
    dir,
    face: '^o^',
  };

  return {
    state: {
      ...state,
      player: nextPlayer,
      movesCount: state.movesCount + 1,
      history: [...state.history, snapshot],
    },
    moved: true,
    pushed: false,
    won: false,
    deadlocked: false,
  };
};

export const undoMove = (state: SokobanState): SokobanState => {
  if (state.history.length === 0 || state.isWon) {
    return state;
  }

  const prevHistory = [...state.history];
  const lastSnapshot = prevHistory.pop()!;

  return {
    ...state,
    player: {
      ...lastSnapshot.player,
      face: 'o_o',
    },
    boxes: lastSnapshot.boxes,
    movesCount: lastSnapshot.movesCount,
    pushesCount: lastSnapshot.pushesCount,
    history: prevHistory,
  };
};

export const resetStage = (state: SokobanState): SokobanState => {
  return loadSokobanLevel(state.stageIndex);
};
