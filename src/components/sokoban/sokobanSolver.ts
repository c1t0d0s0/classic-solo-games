import { SokobanDirection } from '../../types/sokoban';

export interface SolverDir {
  dr: number;
  dc: number;
  dir: SokobanDirection;
  symbol: string;
  label: string;
}

export interface SolverResult {
  success: boolean;
  moves?: SolverDir[];
  reason?: string;
}

export class SokobanSolver {
  static readonly DIRS: SolverDir[] = [
    { dr: -1, dc: 0, dir: 'up', symbol: '↑', label: '上' },
    { dr: 1, dc: 0, dir: 'down', symbol: '↓', label: '下' },
    { dr: 0, dc: -1, dir: 'left', symbol: '←', label: '左' },
    { dr: 0, dc: 1, dir: 'right', symbol: '→', label: '右' },
  ];

  static isGoal(grid: number[][], r: number, c: number): boolean {
    return grid[r] !== undefined && grid[r][c] === 2;
  }

  static isWall(grid: number[][], r: number, c: number): boolean {
    if (r < 0 || r >= grid.length || c < 0 || c >= grid[0].length) return true;
    return grid[r][c] === 1;
  }

  /**
   * Find reachable floor area for player and return canonical minimum coordinate & path map
   */
  static getReachableArea(
    grid: number[][],
    startR: number,
    startC: number,
    boxSet: Set<string>
  ): { visited: Map<string, { fromR: number; fromC: number; dir: SolverDir } | null>; canonicalKey: string } {
    const visited = new Map<string, { fromR: number; fromC: number; dir: SolverDir } | null>();
    const queue: { r: number; c: number }[] = [{ r: startR, c: startC }];
    visited.set(`${startR},${startC}`, null);
    let minR = startR;
    let minC = startC;

    while (queue.length > 0) {
      const { r, c } = queue.shift()!;
      if (r < minR || (r === minR && c < minC)) {
        minR = r;
        minC = c;
      }

      for (const d of SokobanSolver.DIRS) {
        const nr = r + d.dr;
        const nc = c + d.dc;
        const key = `${nr},${nc}`;
        if (!visited.has(key) && !SokobanSolver.isWall(grid, nr, nc) && !boxSet.has(key)) {
          visited.set(key, { fromR: r, fromC: c, dir: d });
          queue.push({ r: nr, c: nc });
        }
      }
    }
    return { visited, canonicalKey: `${minR},${minC}` };
  }

  /**
   * Reconstruct single-step move path between start coordinate and target coordinate
   */
  static getPathBetween(
    reachableMap: Map<string, { fromR: number; fromC: number; dir: SolverDir } | null>,
    startR: number,
    startC: number,
    targetR: number,
    targetC: number
  ): SolverDir[] {
    const path: SolverDir[] = [];
    let curKey = `${targetR},${targetC}`;
    const startKey = `${startR},${startC}`;

    while (curKey !== startKey) {
      const info = reachableMap.get(curKey);
      if (!info) break;
      path.unshift(info.dir);
      curKey = `${info.fromR},${info.fromC}`;
    }
    return path;
  }

  /**
   * Check if a box position creates a corner deadlock
   */
  static isCornerDeadlock(grid: number[][], r: number, c: number): boolean {
    if (SokobanSolver.isGoal(grid, r, c)) return false;
    const upWall = SokobanSolver.isWall(grid, r - 1, c);
    const downWall = SokobanSolver.isWall(grid, r + 1, c);
    const leftWall = SokobanSolver.isWall(grid, r, c - 1);
    const rightWall = SokobanSolver.isWall(grid, r, c + 1);

    return (upWall && leftWall) || (upWall && rightWall) || (downWall && leftWall) || (downWall && rightWall);
  }

  /**
   * Check if state has any deadlocked box
   */
  static isDeadlockState(grid: number[][], boxes: { x: number; y: number }[]): boolean {
    for (const b of boxes) {
      if (SokobanSolver.isCornerDeadlock(grid, b.y, b.x)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Solve current Sokoban state using Push-BFS
   */
  static solve(
    grid: number[][],
    player: { x: number; y: number },
    boxes: { x: number; y: number }[],
    maxVisited: number = 250000
  ): SolverResult {
    const rows = grid.length;
    if (rows === 0) return { success: false, reason: '盤面が無効です' };
    const cols = grid[0].length;

    // Collect goal locations
    const goals = new Set<string>();
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (grid[r][c] === 2) {
          goals.add(`${r},${c}`);
        }
      }
    }

    if (goals.size === 0) return { success: false, reason: 'ゴールが存在しません' };

    const makeBoxKeySet = (boxArr: { r: number; c: number }[]) =>
      new Set(boxArr.map((b) => `${b.r},${b.c}`));

    const makeBoxesSortedKey = (boxArr: { r: number; c: number }[]) => {
      const sorted = [...boxArr].sort((a, b) => a.r - b.r || a.c - b.c);
      return sorted.map((b) => `${b.r},${b.c}`).join(';');
    };

    const formattedBoxes = boxes.map((b) => ({ r: b.y, c: b.x }));
    const isSolved = (boxArr: { r: number; c: number }[]) =>
      boxArr.every((b) => goals.has(`${b.r},${b.c}`));

    if (isSolved(formattedBoxes)) {
      return { success: true, moves: [] };
    }

    const startBoxSet = makeBoxKeySet(formattedBoxes);
    const startReach = SokobanSolver.getReachableArea(grid, player.y, player.x, startBoxSet);
    const startStateKey = `${startReach.canonicalKey}|${makeBoxesSortedKey(formattedBoxes)}`;

    const visited = new Set<string>([startStateKey]);
    const queue: {
      playerR: number;
      playerC: number;
      boxes: { r: number; c: number }[];
      path: SolverDir[];
    }[] = [{ playerR: player.y, playerC: player.x, boxes: formattedBoxes, path: [] }];

    let head = 0;
    while (head < queue.length) {
      if (visited.size > maxVisited) {
        return { success: false, reason: '探索数の上限に達しました（複雑なレベルです）' };
      }

      const cur = queue[head++];
      const boxSet = makeBoxKeySet(cur.boxes);
      const reach = SokobanSolver.getReachableArea(grid, cur.playerR, cur.playerC, boxSet);

      for (const b of cur.boxes) {
        for (const d of SokobanSolver.DIRS) {
          const pr = b.r - d.dr;
          const pc = b.c - d.dc;
          const pKey = `${pr},${pc}`;

          if (reach.visited.has(pKey)) {
            const bnr = b.r + d.dr;
            const bnc = b.c + d.dc;

            if (!SokobanSolver.isWall(grid, bnr, bnc) && !boxSet.has(`${bnr},${bnc}`)) {
              const newBoxes = cur.boxes.map((bx) =>
                bx.r === b.r && bx.c === b.c ? { r: bnr, c: bnc } : bx
              );
              if (SokobanSolver.isDeadlockState(grid, newBoxes.map((bx) => ({ x: bx.c, y: bx.r })))) {
                continue;
              }

              const walkPath = SokobanSolver.getPathBetween(
                reach.visited,
                cur.playerR,
                cur.playerC,
                pr,
                pc
              );
              const fullPath = cur.path.concat(walkPath).concat([d]);

              if (isSolved(newBoxes)) {
                return { success: true, moves: fullPath };
              }

              const newBoxSet = makeBoxKeySet(newBoxes);
              const newReach = SokobanSolver.getReachableArea(grid, b.r, b.c, newBoxSet);
              const newKey = `${newReach.canonicalKey}|${makeBoxesSortedKey(newBoxes)}`;

              if (!visited.has(newKey)) {
                visited.add(newKey);
                queue.push({ playerR: b.r, playerC: b.c, boxes: newBoxes, path: fullPath });
              }
            }
          }
        }
      }
    }

    return { success: false, reason: 'この状態からの解法が見つかりませんでした' };
  }
}
