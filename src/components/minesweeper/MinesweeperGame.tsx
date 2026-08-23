import React, { useState, useEffect, useCallback, useRef } from 'react';
import { DifficultyLevel, FaceStatus, MineCell as MineCellType, MinesweeperState } from '../../types/minesweeper';
import {
  checkMinesweeperWin,
  createEmptyBoard,
  DIFFICULTY_CONFIGS,
  placeMinesAndCalculateNumbers,
  revealZeroCluster,
} from './minesweeperLogic';
import { MineCell } from './MineCell';
import { MineHeader } from './MineHeader';
import { sounds } from '../../audio/soundEffects';
import { triggerVictoryConfetti } from '../../utils/confetti';
import { saveGameResult } from '../../utils/storage';
import { Flag, Bomb, Volume2, VolumeX, Award, ZoomIn, ZoomOut } from 'lucide-react';

interface MinesweeperGameProps {
  initialDifficulty?: DifficultyLevel;
  onOpenStats?: () => void;
}

export const MinesweeperGame: React.FC<MinesweeperGameProps> = ({
  initialDifficulty = 'easy',
  onOpenStats,
}) => {
  const [difficulty, setDifficulty] = useState<DifficultyLevel>(initialDifficulty);
  const config = DIFFICULTY_CONFIGS[difficulty];

  const [board, setBoard] = useState<MineCellType[][]>(() =>
    createEmptyBoard(config.rows, config.cols)
  );
  const [state, setState] = useState<MinesweeperState>({
    board: [],
    difficulty,
    status: 'ready',
    minesLeft: config.mines,
    timeSeconds: 0,
    firstClick: true,
    flagMode: false,
  });

  const [faceStatus, setFaceStatus] = useState<FaceStatus>('smile');
  const [soundMuted, setSoundMuted] = useState<boolean>(sounds.isSoundMuted());
  const [zoomScale, setZoomScale] = useState<number>(1);
  const boardContainerRef = useRef<HTMLDivElement>(null);

  // Timer Effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (state.status === 'playing') {
      timer = setInterval(() => {
        setState((prev) => ({
          ...prev,
          timeSeconds: Math.min(999, prev.timeSeconds + 1),
        }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [state.status]);

  // Reset Game
  const resetGame = useCallback((diff: DifficultyLevel = difficulty) => {
    const cfg = DIFFICULTY_CONFIGS[diff];
    setBoard(createEmptyBoard(cfg.rows, cfg.cols));
    setState({
      board: [],
      difficulty: diff,
      status: 'ready',
      minesLeft: cfg.mines,
      timeSeconds: 0,
      firstClick: true,
      flagMode: false,
    });
    setFaceStatus('smile');
    sounds.playClick();
  }, [difficulty]);

  // Change Difficulty
  const handleDifficultyChange = (newDiff: DifficultyLevel) => {
    setDifficulty(newDiff);
    resetGame(newDiff);
  };

  // Cell Reveal (Left Click or Mobile Tap)
  const handleCellClick = (x: number, y: number) => {
    if (state.status === 'won' || state.status === 'lost') return;

    // In Mobile Flag Mode, treat tap as flag toggle
    if (state.flagMode) {
      handleCellRightClick(x, y);
      return;
    }

    const currentCell = board[y][x];
    if (currentCell.isOpen || currentCell.isFlagged) return;

    let activeBoard = board;

    // First Click Generation
    if (state.firstClick) {
      activeBoard = placeMinesAndCalculateNumbers(
        board,
        config.rows,
        config.cols,
        config.mines,
        x,
        y
      );
      setState((prev) => ({ ...prev, firstClick: false, status: 'playing' }));
    }

    const target = activeBoard[y][x];

    // Stepped on Mine!
    if (target.isMine) {
      target.isOpen = true;
      target.isExploded = true;
      sounds.playExplosion();
      setFaceStatus('dead');

      // Reveal all mines
      const revealedBoard = activeBoard.map((row) =>
        row.map((cell) => ({
          ...cell,
          isOpen: cell.isMine ? true : cell.isOpen,
        }))
      );
      setBoard(revealedBoard);
      setState((prev) => ({ ...prev, status: 'lost' }));
      return;
    }

    // Safe cell clicked
    sounds.playMineClick();
    let newBoard: MineCellType[][];

    if (target.neighborMines === 0) {
      newBoard = revealZeroCluster(activeBoard, x, y, config.rows, config.cols);
    } else {
      newBoard = activeBoard.map((row) => row.map((c) => ({ ...c })));
      newBoard[y][x].isOpen = true;
    }

    // Check Win
    const won = checkMinesweeperWin(newBoard, config.rows, config.cols);
    if (won) {
      // Auto flag all mines
      newBoard = newBoard.map((row) =>
        row.map((c) => (c.isMine ? { ...c, isFlagged: true } : c))
      );
      setBoard(newBoard);
      setFaceStatus('won');
      sounds.playVictory();
      triggerVictoryConfetti();

      const statKey =
        difficulty === 'easy'
          ? 'minesweeper_easy'
          : difficulty === 'medium'
          ? 'minesweeper_medium'
          : 'minesweeper_hard';
      saveGameResult(statKey, true, state.timeSeconds);

      setState((prev) => ({ ...prev, status: 'won', minesLeft: 0 }));
      return;
    }

    setBoard(newBoard);
    if (state.status === 'ready') {
      setState((prev) => ({ ...prev, status: 'playing' }));
    }
  };

  // Flag Toggle (Right Click / Long Press)
  const handleCellRightClick = (x: number, y: number) => {
    if (state.status === 'won' || state.status === 'lost') return;
    const cell = board[y][x];
    if (cell.isOpen) return;

    sounds.playFlag();
    const newBoard = board.map((row) => row.map((c) => ({ ...c })));
    const nextFlagged = !cell.isFlagged;
    newBoard[y][x].isFlagged = nextFlagged;

    setBoard(newBoard);
    setState((prev) => ({
      ...prev,
      minesLeft: prev.minesLeft + (nextFlagged ? -1 : 1),
      status: prev.status === 'ready' ? 'playing' : prev.status,
    }));
  };

  // Double Click / Chord (Open all unflagged neighbors if flags match number)
  const handleCellDoubleClick = (x: number, y: number) => {
    if (state.status !== 'playing') return;
    const cell = board[y][x];
    if (!cell.isOpen || cell.neighborMines === 0) return;

    // Count flags around this cell
    let flagCount = 0;
    for (let dy = -1; dy <= 1; dy++) {
      for (let dx = -1; dx <= 1; dx++) {
        if (dx === 0 && dy === 0) continue;
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < config.cols && ny >= 0 && ny < config.rows) {
          if (board[ny][nx].isFlagged) flagCount++;
        }
      }
    }

    if (flagCount === cell.neighborMines) {
      // Reveal all non-flagged neighbors
      let newBoard = board.map((row) => row.map((c) => ({ ...c })));
      let hitMine = false;

      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          if (dx === 0 && dy === 0) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx >= 0 && nx < config.cols && ny >= 0 && ny < config.rows) {
            const neighbor = newBoard[ny][nx];
            if (!neighbor.isOpen && !neighbor.isFlagged) {
              neighbor.isOpen = true;
              if (neighbor.isMine) {
                hitMine = true;
                neighbor.isExploded = true;
              } else if (neighbor.neighborMines === 0) {
                newBoard = revealZeroCluster(newBoard, nx, ny, config.rows, config.cols);
              }
            }
          }
        }
      }

      if (hitMine) {
        sounds.playExplosion();
        setFaceStatus('dead');
        const revealed = newBoard.map((row) =>
          row.map((c) => ({ ...c, isOpen: c.isMine ? true : c.isOpen }))
        );
        setBoard(revealed);
        setState((prev) => ({ ...prev, status: 'lost' }));
      } else {
        sounds.playMineClick();
        if (checkMinesweeperWin(newBoard, config.rows, config.cols)) {
          newBoard = newBoard.map((row) =>
            row.map((c) => (c.isMine ? { ...c, isFlagged: true } : c))
          );
          setFaceStatus('won');
          sounds.playVictory();
          triggerVictoryConfetti();

          const statKey =
            difficulty === 'easy'
              ? 'minesweeper_easy'
              : difficulty === 'medium'
              ? 'minesweeper_medium'
              : 'minesweeper_hard';
          saveGameResult(statKey, true, state.timeSeconds);

          setState((prev) => ({ ...prev, status: 'won', minesLeft: 0 }));
        }
        setBoard(newBoard);
      }
    }
  };

  const handleMouseDownFace = () => {
    if (state.status === 'playing' || state.status === 'ready') {
      setFaceStatus('scared');
    }
  };

  const handleMouseUpFace = () => {
    if (state.status === 'playing' || state.status === 'ready') {
      setFaceStatus('smile');
    }
  };

  const toggleSound = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    sounds.setMuted(next);
  };

  return (
    <div className="w-full flex flex-col items-center select-none pb-8">
      {/* Controls & Difficulty Bar */}
      <div className="w-full max-w-2xl flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-800/80 backdrop-blur rounded-xl border border-slate-700/80 mb-4 shadow-lg">
        {/* Difficulty Select */}
        <div className="flex rounded-lg bg-slate-900/70 p-0.5 border border-slate-700 text-xs">
          {(['easy', 'medium', 'hard'] as DifficultyLevel[]).map((lvl) => (
            <button
              key={lvl}
              onClick={() => handleDifficultyChange(lvl)}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                difficulty === lvl
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {DIFFICULTY_CONFIGS[lvl].label.split(' ')[0]}
            </button>
          ))}
        </div>

        {/* Mobile Flag Mode Toggle */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setState((prev) => ({ ...prev, flagMode: !prev.flagMode }))}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm ${
              state.flagMode
                ? 'bg-red-600 text-white ring-2 ring-red-400'
                : 'bg-slate-700 text-slate-200 hover:bg-slate-600'
            }`}
          >
            {state.flagMode ? <Flag className="w-3.5 h-3.5 fill-white" /> : <Bomb className="w-3.5 h-3.5" />}
            <span>{state.flagMode ? '旗モード' : '開くモード'}</span>
          </button>

          {/* Zoom controls (helpful for hard difficulty on small screens) */}
          {difficulty === 'hard' && (
            <div className="flex items-center bg-slate-700/80 rounded-lg p-0.5">
              <button
                onClick={() => setZoomScale((s) => Math.max(0.7, s - 0.1))}
                className="p-1 hover:bg-slate-600 rounded text-slate-300"
                title="縮小"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomScale(1)}
                className="px-1 text-[10px] font-mono text-slate-300"
              >
                {Math.round(zoomScale * 100)}%
              </button>
              <button
                onClick={() => setZoomScale((s) => Math.min(1.4, s + 0.1))}
                className="p-1 hover:bg-slate-600 rounded text-slate-300"
                title="拡大"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Stats */}
          {onOpenStats && (
            <button
              onClick={onOpenStats}
              className="p-1.5 sm:p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors"
              title="統計"
            >
              <Award className="w-4 h-4" />
            </button>
          )}

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            className="p-1.5 sm:p-2 bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white rounded-lg transition-colors"
            title={soundMuted ? 'ミュート解除' : 'ミュート'}
          >
            {soundMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>
        </div>
      </div>

      {/* Retro Windows-style Minesweeper Frame */}
      <div className="bg-slate-300 p-3 sm:p-4 rounded-xl border-4 border-t-white border-l-white border-r-slate-600 border-b-slate-600 shadow-2xl max-w-full overflow-hidden flex flex-col items-center">
        {/* LED Header Counter */}
        <MineHeader
          minesLeft={state.minesLeft}
          timeSeconds={state.timeSeconds}
          faceStatus={faceStatus}
          onReset={() => resetGame()}
        />

        {/* Board Container with Scroll / Zoom */}
        <div
          ref={boardContainerRef}
          className="max-w-full overflow-auto p-1 bg-slate-300 border-4 border-t-slate-500 border-l-slate-500 border-r-white border-b-white shadow-inner"
          style={{
            transform: zoomScale !== 1 ? `scale(${zoomScale})` : undefined,
            transformOrigin: 'top center',
          }}
        >
          <div
            className="grid gap-0 select-none"
            style={{
              gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))`,
              width: 'max-content',
            }}
          >
            {board.map((row) =>
              row.map((cell) => (
                <MineCell
                  key={`${cell.x}-${cell.y}`}
                  cell={cell}
                  gameStatus={state.status}
                  onCellClick={handleCellClick}
                  onCellRightClick={handleCellRightClick}
                  onCellDoubleClick={handleCellDoubleClick}
                  onMouseDownFace={handleMouseDownFace}
                  onMouseUpFace={handleMouseUpFace}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
