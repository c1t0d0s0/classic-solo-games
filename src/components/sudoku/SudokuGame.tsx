import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { SudokuDifficulty, SudokuState } from '../../types/sudoku';
import {
  SudokuCore,
  initSudokuState,
  setCellValue,
  toggleNote,
  eraseCell,
  undoSudoku,
} from './sudokuLogic';
import { sounds } from '../../audio/soundEffects';
import { saveGameResult } from '../../utils/storage';
import { useTranslation } from '../../i18n/LanguageContext';
import {
  Play,
  Pause,
  RotateCcw,
  Undo2,
  Delete,
  Pencil,
  Lightbulb,
  AlertCircle,
} from 'lucide-react';

interface SudokuGameProps {
  onOpenStats?: () => void;
  highlightDuplicates?: boolean;
  autoClearNotes?: boolean;
}

export const SudokuGame: React.FC<SudokuGameProps> = ({
  onOpenStats,
  highlightDuplicates = true,
  autoClearNotes = true,
}) => {
  const { t } = useTranslation();

  const [gameState, setGameState] = useState<SudokuState>(() => initSudokuState('easy'));
  const [selectedCell, setSelectedCell] = useState<[number, number] | null>(null);
  const [isNotesMode, setIsNotesMode] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; icon: string } | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const showToast = useCallback((text: string, icon: string = '💡', duration: number = 3000) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToastMessage({ text, icon });
    if (duration > 0) {
      toastTimeoutRef.current = setTimeout(() => setToastMessage(null), duration);
    }
  }, []);

  // Timer loop
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isPaused && !gameState.isWon) {
      timerRef.current = setInterval(() => {
        setGameState((prev) => ({
          ...prev,
          timeSeconds: prev.timeSeconds + 1,
        }));
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState.isPlaying, gameState.isPaused, gameState.isWon]);

  // Start a new puzzle
  const handleStartNewGame = useCallback((diff: SudokuDifficulty) => {
    sounds.playClick();
    const newState = initSudokuState(diff);
    setGameState(newState);
    setSelectedCell(null);
    setToastMessage(null);
  }, []);

  // Format seconds
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Check conflicts
  const conflicts = useMemo(() => {
    if (!highlightDuplicates) return new Set<number>();
    return SudokuCore.getAllConflicts(gameState.currentBoard);
  }, [gameState.currentBoard, highlightDuplicates]);

  // Remaining numbers count
  const remainingNumbers = useMemo(() => {
    return SudokuCore.getRemainingNumbers(gameState.currentBoard);
  }, [gameState.currentBoard]);

  // Handle cell click
  const handleCellClick = useCallback((row: number, col: number) => {
    sounds.playClick();
    setSelectedCell([row, col]);
  }, []);

  // Handle input of digit 1..9
  const handleInputDigit = useCallback((num: number) => {
    if (!selectedCell || gameState.isWon || gameState.isPaused) return;
    const [r, c] = selectedCell;

    if (isNotesMode) {
      sounds.playClick();
      setGameState((prev) => toggleNote(prev, r, c, num));
    } else {
      sounds.playSudokuInput();
      setGameState((prev) => {
        const next = setCellValue(prev, r, c, num, autoClearNotes);
        if (next.isWon) {
          sounds.playVictory();
          saveGameResult(`sudoku_${prev.difficulty}`, true, next.timeSeconds);
        }
        return next;
      });
    }
  }, [selectedCell, gameState.isWon, gameState.isPaused, isNotesMode, autoClearNotes]);

  // Handle Erase
  const handleErase = useCallback(() => {
    if (!selectedCell || gameState.isWon || gameState.isPaused) return;
    const [r, c] = selectedCell;
    sounds.playSudokuErase();
    setGameState((prev) => eraseCell(prev, r, c));
  }, [selectedCell, gameState.isWon, gameState.isPaused]);

  // Handle Undo
  const handleUndo = useCallback(() => {
    sounds.playUndo();
    setGameState((prev) => undoSudoku(prev));
  }, []);

  // Handle Hint
  const handleHint = useCallback(() => {
    if (gameState.isWon || gameState.isPaused) return;

    sounds.playSudokuHint();

    let targetR = -1;
    let targetC = -1;

    // If selected cell is empty or incorrect, reveal it
    if (selectedCell) {
      const [r, c] = selectedCell;
      if (gameState.initialBoard[r][c] === 0 && gameState.currentBoard[r][c] !== gameState.solutionBoard[r][c]) {
        targetR = r;
        targetC = c;
      }
    }

    // Otherwise find first empty cell
    if (targetR === -1) {
      for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
          if (gameState.currentBoard[r][c] === 0) {
            targetR = r;
            targetC = c;
            break;
          }
        }
        if (targetR !== -1) break;
      }
    }

    if (targetR !== -1) {
      const solutionVal = gameState.solutionBoard[targetR][targetC];
      setSelectedCell([targetR, targetC]);
      setGameState((prev) => {
        const next = setCellValue(prev, targetR, targetC, solutionVal, autoClearNotes);
        if (next.isWon) {
          sounds.playVictory();
          saveGameResult(`sudoku_${prev.difficulty}`, true, next.timeSeconds);
        }
        return next;
      });
      showToast(`ヒント: [${targetR + 1}, ${targetC + 1}] に ${solutionVal} を配置しました`, '💡');
    }
  }, [selectedCell, gameState, autoClearNotes, showToast]);

  // Pause / Resume toggle
  const togglePause = useCallback(() => {
    sounds.playClick();
    setGameState((prev) => ({
      ...prev,
      isPaused: !prev.isPaused,
    }));
  }, []);

  // Keyboard navigation & entry
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState.isWon) return;

      if (e.key >= '1' && e.key <= '9') {
        e.preventDefault();
        handleInputDigit(parseInt(e.key, 10));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        e.preventDefault();
        handleErase();
      } else if (e.key === 'n' || e.key === 'N' || e.key === 'p' || e.key === 'P') {
        setIsNotesMode((prev) => !prev);
      } else if (e.key === 'u' || e.key === 'U') {
        handleUndo();
      } else if (e.key === 'h' || e.key === 'H') {
        handleHint();
      } else if (e.key === ' ') {
        e.preventDefault();
        togglePause();
      } else if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        setSelectedCell((prev) => {
          if (!prev) return [0, 0];
          const [r, c] = prev;
          if (e.key === 'ArrowUp') return [Math.max(0, r - 1), c];
          if (e.key === 'ArrowDown') return [Math.min(8, r + 1), c];
          if (e.key === 'ArrowLeft') return [r, Math.max(0, c - 1)];
          if (e.key === 'ArrowRight') return [r, Math.min(8, c + 1)];
          return prev;
        });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState.isWon, handleInputDigit, handleErase, handleUndo, handleHint, togglePause]);

  const selectedValue = selectedCell
    ? gameState.currentBoard[selectedCell[0]][selectedCell[1]]
    : 0;

  const difficultyLabels: Record<SudokuDifficulty, { label: string; en: string }> = {
    easy: { label: '初級', en: 'Easy' },
    medium: { label: '中級', en: 'Medium' },
    hard: { label: '上級', en: 'Hard' },
    expert: { label: 'エキスパート', en: 'Expert' },
  };

  return (
    <div className="w-full flex flex-col items-center select-none max-w-xl mx-auto px-2 py-2">
      {/* Top Header & Difficulty Selector */}
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-3 mb-4 shadow-xl backdrop-blur flex flex-col gap-3">
        {/* Difficulty Tabs */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-0.5">
          {(['easy', 'medium', 'hard', 'expert'] as SudokuDifficulty[]).map((diff) => {
            const active = gameState.difficulty === diff;
            return (
              <button
                key={diff}
                onClick={() => handleStartNewGame(diff)}
                className={`flex-1 py-1.5 px-2 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  active
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40 border border-indigo-400/40'
                    : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-700/80 border border-slate-700/50'
                }`}
              >
                <span>{difficultyLabels[diff].label}</span>
              </button>
            );
          })}
        </div>

        {/* Stats bar: Timer, Pause, Conflicts, Actions */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
          <div className="flex items-center gap-2">
            {/* Timer & Pause */}
            <button
              onClick={togglePause}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-200 hover:text-white transition-colors"
              title={gameState.isPaused ? '再開' : '一時停止'}
            >
              {gameState.isPaused ? (
                <Play className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <Pause className="w-3.5 h-3.5 text-amber-400" />
              )}
              <span className="font-mono-digits font-bold text-xs sm:text-sm text-sky-400">
                {formatTime(gameState.timeSeconds)}
              </span>
            </button>

            {/* Conflict Counter */}
            {conflicts.size > 0 && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-rose-950/60 border border-rose-800/60 text-rose-300 text-xs font-bold animate-pulse">
                <AlertCircle className="w-3.5 h-3.5 text-rose-400" />
                <span>重複: {conflicts.size / 2}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleStartNewGame(gameState.difficulty)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors"
              title="リセット / 新規ゲーム"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Toast */}
      {toastMessage && (
        <div className="mb-3 px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 bg-indigo-950/90 text-indigo-200 border border-indigo-500/40 shadow-lg animate-fade-in">
          <span>{toastMessage.icon}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* 9x9 Sudoku Board */}
      <div className="relative w-full max-w-[440px] aspect-square p-1.5 sm:p-2.5 rounded-2xl bg-slate-900 border-2 border-slate-700 shadow-2xl backdrop-blur flex items-center justify-center">
        {/* Paused Overlay */}
        {gameState.isPaused ? (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-md rounded-2xl gap-3">
            <div className="text-4xl">⏸️</div>
            <div className="text-lg font-bold text-white">一時停止中</div>
            <button
              onClick={togglePause}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg transition-all active:scale-95"
            >
              <Play className="w-4 h-4" />
              <span>ゲームを再開する</span>
            </button>
          </div>
        ) : null}

        {/* 9x9 Grid */}
        <div className="w-full h-full grid grid-cols-9 grid-rows-9 bg-slate-950 rounded-xl overflow-hidden border border-slate-800 shadow-inner">
          {gameState.currentBoard.map((row, rIdx) =>
            row.map((val, cIdx) => {
              const isInitial = gameState.initialBoard[rIdx][cIdx] !== 0;
              const isSelected = selectedCell && selectedCell[0] === rIdx && selectedCell[1] === cIdx;
              const cellNotes = gameState.notes[rIdx][cIdx];
              const cellIndex = rIdx * 9 + cIdx;
              const isConflict = conflicts.has(cellIndex);

              // Peer cell highlight: same row, col, or 3x3 block
              const isPeer =
                selectedCell &&
                (selectedCell[0] === rIdx ||
                  selectedCell[1] === cIdx ||
                  (Math.floor(selectedCell[0] / 3) === Math.floor(rIdx / 3) &&
                    Math.floor(selectedCell[1] / 3) === Math.floor(cIdx / 3)));

              // Same digit highlight
              const isSameDigit = selectedValue !== 0 && val === selectedValue;

              // 3x3 box borders
              const borderRight = (cIdx + 1) % 3 === 0 && cIdx !== 8 ? 'border-r-2 border-r-slate-500' : 'border-r border-r-slate-800/60';
              const borderBottom = (rIdx + 1) % 3 === 0 && rIdx !== 8 ? 'border-b-2 border-b-slate-500' : 'border-b border-b-slate-800/60';

              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  onClick={() => handleCellClick(rIdx, cIdx)}
                  className={`relative flex items-center justify-center cursor-pointer transition-colors ${borderRight} ${borderBottom} ${
                    isSelected
                      ? 'bg-indigo-600/40 ring-2 ring-indigo-400 z-10'
                      : isConflict
                      ? 'bg-rose-600/30'
                      : isSameDigit
                      ? 'bg-indigo-500/25'
                      : isPeer
                      ? 'bg-slate-800/40'
                      : 'bg-transparent hover:bg-slate-800/20'
                  }`}
                >
                  {val !== 0 ? (
                    <span
                      className={`text-base sm:text-xl font-mono-digits font-black select-none ${
                        isConflict
                          ? 'text-rose-400'
                          : isInitial
                          ? 'text-white'
                          : 'text-indigo-400'
                      }`}
                    >
                      {val}
                    </span>
                  ) : cellNotes.size > 0 ? (
                    /* 3x3 Mini-Grid for Notes */
                    <div className="w-full h-full p-0.5 grid grid-cols-3 grid-rows-3 text-[8px] sm:text-[9px] font-mono leading-none text-slate-400 pointer-events-none">
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
                        <div key={n} className="flex items-center justify-center">
                          {cellNotes.has(n) ? n : ''}
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Action Control Tools: Undo, Erase, Notes, Hint */}
      <div className="w-full max-w-[440px] grid grid-cols-4 gap-2 mt-4">
        <button
          onClick={handleUndo}
          disabled={gameState.history.length === 0 || gameState.isWon}
          className="flex flex-col items-center justify-center py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 transition-colors shadow-sm"
        >
          <Undo2 className="w-4 h-4 mb-0.5" />
          <span className="text-[11px] font-bold">{t('undo')}</span>
        </button>

        <button
          onClick={handleErase}
          disabled={!selectedCell || gameState.isWon}
          className="flex flex-col items-center justify-center py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-rose-400 disabled:opacity-40 transition-colors shadow-sm"
        >
          <Delete className="w-4 h-4 mb-0.5" />
          <span className="text-[11px] font-bold">消去</span>
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            setIsNotesMode((prev) => !prev);
          }}
          disabled={gameState.isWon}
          className={`flex flex-col items-center justify-center py-2 rounded-xl border transition-all shadow-sm ${
            isNotesMode
              ? 'bg-indigo-600 text-white border-indigo-400 ring-2 ring-indigo-400/40 shadow-indigo-900/50'
              : 'bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          <Pencil className="w-4 h-4 mb-0.5" />
          <span className="text-[11px] font-bold">
            メモ {isNotesMode ? 'ON' : 'OFF'}
          </span>
        </button>

        <button
          onClick={handleHint}
          disabled={gameState.isWon}
          className="flex flex-col items-center justify-center py-2 rounded-xl bg-slate-900 border border-slate-800 text-amber-300 hover:text-amber-200 transition-colors shadow-sm"
        >
          <Lightbulb className="w-4 h-4 mb-0.5 text-amber-400" />
          <span className="text-[11px] font-bold">ヒント</span>
        </button>
      </div>

      {/* 1-9 Number Keypad */}
      <div className="w-full max-w-[440px] grid grid-cols-9 gap-1 sm:gap-1.5 mt-3">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
          const remaining = remainingNumbers[num];
          const isComplete = remaining === 0;

          return (
            <button
              key={num}
              onClick={() => handleInputDigit(num)}
              disabled={gameState.isWon || gameState.isPaused}
              className={`relative flex flex-col items-center justify-center py-2 sm:py-3 rounded-xl border transition-all active:scale-95 shadow-md ${
                isComplete
                  ? 'bg-slate-900/60 border-slate-800/60 text-slate-600 opacity-60'
                  : 'bg-slate-800/90 hover:bg-slate-700/90 border-slate-700 text-white hover:border-indigo-400/60'
              }`}
            >
              <span className="text-lg sm:text-xl font-black font-mono-digits leading-none">
                {num}
              </span>
              <span className="text-[9px] font-semibold text-slate-400 mt-1 leading-none">
                {isComplete ? '✓' : remaining}
              </span>
            </button>
          );
        })}
      </div>

      {/* Victory Modal */}
      {gameState.isWon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-3xl">
              🎉
            </div>

            <div>
              <h3 className="text-xl font-black text-white">ナンプレ完成！</h3>
              <p className="text-xs text-slate-400 mt-1">
                難易度【{difficultyLabels[gameState.difficulty].label}】をクリアしました！
              </p>
            </div>

            <div className="w-full bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex items-center justify-around">
              <div>
                <div className="text-slate-400 text-xs font-semibold">{t('time')}</div>
                <div className="font-bold text-sky-400 font-mono-digits text-lg mt-0.5">
                  {formatTime(gameState.timeSeconds)}
                </div>
              </div>
              <div className="h-8 w-px bg-slate-800" />
              <div>
                <div className="text-slate-400 text-xs font-semibold">難易度</div>
                <div className="font-bold text-emerald-400 text-sm mt-1">
                  {difficultyLabels[gameState.difficulty].label}
                </div>
              </div>
            </div>

            <div className="w-full flex flex-col gap-2 pt-2">
              <button
                onClick={() => handleStartNewGame(gameState.difficulty)}
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md transition-all active:scale-95"
              >
                同じ難易度で再挑戦
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    const diffs: SudokuDifficulty[] = ['easy', 'medium', 'hard', 'expert'];
                    const nextIdx = Math.min(diffs.length - 1, diffs.indexOf(gameState.difficulty) + 1);
                    handleStartNewGame(diffs[nextIdx]);
                  }}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
                >
                  次の難易度
                </button>

                {onOpenStats && (
                  <button
                    onClick={onOpenStats}
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
                  >
                    戦績を見る
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
