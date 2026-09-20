import { describe, it, expect } from 'vitest';
import { loadSokobanLevel, movePlayer, undoMove, resetStage } from '../components/sokoban/sokobanLogic';
import { SokobanSolver } from '../components/sokoban/sokobanSolver';
import { SOKOBAN_LEVELS } from '../components/sokoban/sokobanLevels';

describe('Sokoban Logic', () => {
  it('should load all 25 levels without errors', () => {
    expect(SOKOBAN_LEVELS.length).toBe(25);
    for (let i = 0; i < SOKOBAN_LEVELS.length; i++) {
      const state = loadSokobanLevel(i);
      expect(state.grid.length).toBeGreaterThan(0);
      expect(state.boxes.length).toBeGreaterThan(0);
      expect(state.stageIndex).toBe(i);
      // Verify goals count equals boxes count
      let goalCount = 0;
      for (let r = 0; r < state.grid.length; r++) {
        for (let c = 0; c < state.grid[0].length; c++) {
          if (state.grid[r][c] === 2) goalCount++;
        }
      }
      expect(goalCount).toBe(state.boxes.length);
    }
  });

  it('should move player correctly and stop at walls', () => {
    // Stage 0: "#####\n#@$.#\n#####"
    // player at (1, 1), box at (2, 1), goal at (3, 1)
    const state = loadSokobanLevel(0);
    expect(state.player.x).toBe(1);
    expect(state.player.y).toBe(1);

    // Try moving up into wall (0, 1)
    const moveUp = movePlayer(state, 'up');
    expect(moveUp.moved).toBe(false);
    expect(moveUp.state.player.y).toBe(1);

    // Try moving left into wall (1, 0)
    const moveLeft = movePlayer(state, 'left');
    expect(moveLeft.moved).toBe(false);
    expect(moveLeft.state.player.x).toBe(1);
  });

  it('should push box and detect win condition on stage 0', () => {
    const state = loadSokobanLevel(0);
    // Push box right from (1, 1) to (2, 1), box moves from (2, 1) to (3, 1)
    const result = movePlayer(state, 'right');
    expect(result.moved).toBe(true);
    expect(result.pushed).toBe(true);
    expect(result.won).toBe(true);
    expect(result.state.player.x).toBe(2);
    expect(result.state.boxes[0].x).toBe(3);
    expect(result.state.boxes[0].y).toBe(1);
    expect(result.state.movesCount).toBe(1);
    expect(result.state.pushesCount).toBe(1);
  });

  it('should support undo and reset', () => {
    const state = loadSokobanLevel(1);
    const initialPlayerX = state.player.x;
    const initialPlayerY = state.player.y;

    // Move player
    const moved = movePlayer(state, 'down');
    if (moved.moved) {
      const undone = undoMove(moved.state);
      expect(undone.player.x).toBe(initialPlayerX);
      expect(undone.player.y).toBe(initialPlayerY);
      expect(undone.movesCount).toBe(0);
    }

    const reset = resetStage(state);
    expect(reset.player.x).toBe(initialPlayerX);
    expect(reset.player.y).toBe(initialPlayerY);
  });

  it('should detect corner deadlock', () => {
    const grid = [
      [1, 1, 1, 1, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 0, 0, 0, 1],
      [1, 1, 1, 1, 1],
    ];
    // (1, 1) has wall above (0, 1) and wall left (1, 0) => corner deadlock
    expect(SokobanSolver.isCornerDeadlock(grid, 1, 1)).toBe(true);
    // (2, 2) is surrounded by floors => not deadlock
    expect(SokobanSolver.isCornerDeadlock(grid, 2, 2)).toBe(false);
  });

  it('should solve stage 0 with SokobanSolver', () => {
    const state = loadSokobanLevel(0);
    const solution = SokobanSolver.solve(state.grid, state.player, state.boxes);
    expect(solution.success).toBe(true);
    expect(solution.moves).toBeDefined();
    expect(solution.moves!.length).toBe(1);
    expect(solution.moves![0].dir).toBe('right');
  });
});
