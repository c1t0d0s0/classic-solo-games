import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SokobanDirection, SokobanState } from '../../types/sokoban';
import { loadSokobanLevel, movePlayer, resetStage, undoMove } from './sokobanLogic';
import { SOKOBAN_LEVELS } from './sokobanLevels';
import { SokobanSolver, SolverDir } from './sokobanSolver';
import { sounds } from '../../audio/soundEffects';
import { saveGameResult } from '../../utils/storage';
import { useTranslation } from '../../i18n/LanguageContext';
import {
  RotateCcw,
  Undo2,
  Lightbulb,
  Play,
  Square,
  ChevronLeft,
  ChevronRight,
  ListOrdered,
  Gamepad2,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';

interface SokobanGameProps {
  onOpenStats?: () => void;
}

const STORAGE_CLEARED_STAGES_KEY = 'sokoban_cleared_stages_v1';

export const SokobanGame: React.FC<SokobanGameProps> = ({ onOpenStats }) => {
  const { t } = useTranslation();

  const [gameState, setGameState] = useState<SokobanState>(() => loadSokobanLevel(0));
  const [clearedStages, setClearedStages] = useState<number[]>(() => {
    try {
      const data = localStorage.getItem(STORAGE_CLEARED_STAGES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  });

  const [isStageSelectOpen, setIsStageSelectOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; icon: string; isWarning?: boolean } | null>(null);
  const [hintArrow, setHintArrow] = useState<{ x: number; y: number; dir: SolverDir } | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [showDpad, setShowDpad] = useState<boolean>(true);

  const autoPlayRef = useRef<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Mark stage cleared in storage
  const recordStageCleared = useCallback((stageIndex: number) => {
    setClearedStages((prev) => {
      if (prev.includes(stageIndex)) return prev;
      const updated = [...prev, stageIndex];
      try {
        localStorage.setItem(STORAGE_CLEARED_STAGES_KEY, JSON.stringify(updated));
      } catch {}
      return updated;
    });
  }, []);

  // Show temporary toast notification
  const showToast = useCallback((text: string, icon: string = '💡', isWarning: boolean = false, duration: number = 3500) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    setToastMessage({ text, icon, isWarning });
    if (duration > 0) {
      toastTimeoutRef.current = setTimeout(() => {
        setToastMessage(null);
      }, duration);
    }
  }, []);

  // Timer effect
  useEffect(() => {
    if (gameState.isPlaying && !gameState.isWon) {
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
  }, [gameState.isPlaying, gameState.isWon]);

  // Handle stage change
  const handleLoadStage = useCallback((index: number) => {
    sounds.playClick();
    setIsAutoPlaying(false);
    autoPlayRef.current = false;
    setHintArrow(null);
    setToastMessage(null);
    setGameState(loadSokobanLevel(index));
    setIsStageSelectOpen(false);
  }, []);

  // Perform a move
  const handleMove = useCallback((dir: SokobanDirection) => {
    setHintArrow(null);

    setGameState((prev) => {
      if (prev.isWon) return prev;

      const result = movePlayer(prev, dir);
      if (!result.moved) {
        return prev;
      }

      if (result.pushed) {
        // Box push sound
        sounds.playSokobanPush();
      } else {
        sounds.playSokobanMove();
      }

      if (result.deadlocked) {
        sounds.playSokobanDeadlock();
        showToast('⚠️ 手詰まり（詰み状態）になりました！「戻す」でやり直せます', '⚠️', true, 4500);
      }

      if (result.won) {
        sounds.playVictory();
        saveGameResult('sokoban', true, result.state.timeSeconds);
        recordStageCleared(result.state.stageIndex);
      }

      return result.state;
    });
  }, [recordStageCleared, showToast]);

  // Undo move
  const handleUndo = useCallback(() => {
    sounds.playUndo();
    setHintArrow(null);
    setGameState((prev) => undoMove(prev));
  }, []);

  // Reset stage
  const handleReset = useCallback(() => {
    sounds.playClick();
    setIsAutoPlaying(false);
    autoPlayRef.current = false;
    setHintArrow(null);
    setToastMessage(null);
    setGameState((prev) => resetStage(prev));
  }, []);

  // Calculate Hint
  const handleHint = useCallback(() => {
    sounds.playClick();
    if (gameState.isWon) {
      showToast('✨ すでにステージクリアしています！', '🎉');
      return;
    }

    const res = SokobanSolver.solve(gameState.grid, gameState.player, gameState.boxes);
    if (res.success && res.moves && res.moves.length > 0) {
      const nextMove = res.moves[0];
      const targetX = gameState.player.x + nextMove.dc;
      const targetY = gameState.player.y + nextMove.dr;
      setHintArrow({ x: targetX, y: targetY, dir: nextMove });
      showToast(`ヒント: 【${nextMove.label} (${nextMove.symbol})】に進む (ゴールまであと ${res.moves.length} 手)`, '💡', false, 4000);
    } else {
      setHintArrow(null);
      showToast(res.reason || '手詰まりです。「戻す」か「やり直す」を試してください。', '⚠️', true, 4000);
    }
  }, [gameState, showToast]);

  // Auto-play toggle
  const toggleAutoPlay = useCallback(() => {
    sounds.playClick();
    if (isAutoPlaying) {
      setIsAutoPlaying(false);
      autoPlayRef.current = false;
      showToast('自動解法を停止しました', '⏹', false, 2000);
      return;
    }

    if (gameState.isWon) return;

    setIsAutoPlaying(true);
    autoPlayRef.current = true;
    showToast('🤖 自動解法を開始します...', '🤖', false, 2000);
  }, [isAutoPlaying, gameState.isWon, showToast]);

  // Auto-play step runner
  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      if (!autoPlayRef.current || gameState.isWon) {
        setIsAutoPlaying(false);
        autoPlayRef.current = false;
        clearInterval(interval);
        return;
      }

      const res = SokobanSolver.solve(gameState.grid, gameState.player, gameState.boxes);
      if (res.success && res.moves && res.moves.length > 0) {
        const nextMove = res.moves[0];
        handleMove(nextMove.dir);
      } else {
        setIsAutoPlaying(false);
        autoPlayRef.current = false;
        clearInterval(interval);
      }
    }, 280);

    return () => clearInterval(interval);
  }, [isAutoPlaying, gameState, handleMove]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isStageSelectOpen) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          e.preventDefault();
          handleMove('up');
          break;
        case 'ArrowDown':
        case 's':
        case 'S':
          e.preventDefault();
          handleMove('down');
          break;
        case 'ArrowLeft':
        case 'a':
        case 'A':
          e.preventDefault();
          handleMove('left');
          break;
        case 'ArrowRight':
        case 'd':
        case 'D':
          e.preventDefault();
          handleMove('right');
          break;
        case 'u':
        case 'U':
          handleUndo();
          break;
        case 'r':
        case 'R':
          handleReset();
          break;
        case 'h':
        case 'H':
          handleHint();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isStageSelectOpen, handleMove, handleUndo, handleReset, handleHint]);

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Cell size calculation: fit board smoothly
  const maxDim = Math.max(gameState.rows, gameState.cols);
  const cellSize = maxDim <= 6 ? 54 : maxDim <= 8 ? 46 : maxDim <= 10 ? 40 : 34;

  return (
    <div className="w-full flex flex-col items-center select-none max-w-4xl mx-auto px-2 py-2">
      {/* Top Status & Controls Bar */}
      <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-3 mb-4 shadow-xl backdrop-blur flex flex-wrap items-center justify-between gap-3">
        {/* Stage Selection & Number */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              sounds.playClick();
              setIsStageSelectOpen(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
          >
            <ListOrdered className="w-4 h-4" />
            <span>
              Stage {String(gameState.stageIndex + 1).padStart(2, '0')} / {SOKOBAN_LEVELS.length}
            </span>
          </button>

          {/* Prev / Next buttons */}
          <div className="flex items-center gap-1 bg-slate-800/80 p-0.5 rounded-xl border border-slate-700">
            <button
              disabled={gameState.stageIndex === 0}
              onClick={() => handleLoadStage(gameState.stageIndex - 1)}
              className="p-1 rounded-lg text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300"
              title="Previous Stage"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={gameState.stageIndex === SOKOBAN_LEVELS.length - 1}
              onClick={() => handleLoadStage(gameState.stageIndex + 1)}
              className="p-1 rounded-lg text-slate-300 hover:text-white disabled:opacity-30 disabled:hover:text-slate-300"
              title="Next Stage"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Moves & Pushes & Timer counters */}
        <div className="flex items-center gap-3 text-xs sm:text-sm">
          <div className="flex items-center gap-1 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800">
            <span className="text-slate-400 font-semibold">{t('moves')}:</span>
            <span className="font-bold text-emerald-400 font-mono-digits">{gameState.movesCount}</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800">
            <span className="text-slate-400 font-semibold">押し:</span>
            <span className="font-bold text-amber-400 font-mono-digits">{gameState.pushesCount}</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-950/60 px-2.5 py-1 rounded-lg border border-slate-800">
            <span className="text-slate-400 font-semibold">{t('time')}:</span>
            <span className="font-bold text-sky-400 font-mono-digits">{formatTime(gameState.timeSeconds)}</span>
          </div>
        </div>

        {/* Actions: Undo, Reset, Hint, Auto */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={handleUndo}
            disabled={gameState.history.length === 0 || gameState.isWon}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 disabled:opacity-40 transition-colors shadow-sm"
            title={t('undo')}
          >
            <Undo2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('undo')}</span>
          </button>

          <button
            onClick={handleReset}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold border border-slate-700 transition-colors shadow-sm"
            title={t('restart')}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('restart')}</span>
          </button>

          <button
            onClick={handleHint}
            disabled={gameState.isWon}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 text-xs font-bold transition-colors shadow-sm"
            title="Hint"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">ヒント</span>
          </button>

          <button
            onClick={toggleAutoPlay}
            disabled={gameState.isWon}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors shadow-sm ${
              isAutoPlaying
                ? 'bg-rose-600 text-white border-rose-500 animate-pulse'
                : 'bg-indigo-900/40 hover:bg-indigo-900/60 text-indigo-300 border-indigo-700/40'
            }`}
            title="Auto Solve"
          >
            {isAutoPlaying ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isAutoPlaying ? '停止' : '自動'}</span>
          </button>

          <button
            onClick={() => setShowDpad((prev) => !prev)}
            className={`p-1.5 rounded-lg border text-xs font-bold transition-colors shadow-sm ${
              showDpad
                ? 'bg-indigo-600 text-white border-indigo-500'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
            }`}
            title="D-Pad 表示切替"
          >
            <Gamepad2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`mb-3 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 border shadow-lg animate-fade-in ${
            toastMessage.isWarning
              ? 'bg-rose-950/90 text-rose-200 border-rose-600/50'
              : 'bg-indigo-950/90 text-indigo-200 border-indigo-500/50'
          }`}
        >
          <span>{toastMessage.icon}</span>
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Main Board Container */}
      <div className="relative p-4 sm:p-6 rounded-2xl bg-slate-900/70 border border-slate-800 shadow-2xl backdrop-blur flex items-center justify-center overflow-auto max-w-full">
        <div
          className="relative grid select-none rounded-xl overflow-hidden border border-slate-800 shadow-inner bg-slate-950"
          style={{
            gridTemplateRows: `repeat(${gameState.rows}, ${cellSize}px)`,
            gridTemplateColumns: `repeat(${gameState.cols}, ${cellSize}px)`,
          }}
        >
          {/* Background Grid Cells: Walls, Goals, Floors */}
          {gameState.grid.map((row, rIdx) =>
            row.map((cellType, cIdx) => {
              const isWall = cellType === 1;
              const isGoal = cellType === 2;

              return (
                <div
                  key={`${rIdx}-${cIdx}`}
                  style={{ width: `${cellSize}px`, height: `${cellSize}px` }}
                  className={`relative flex items-center justify-center ${
                    isWall
                      ? 'bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600/40 shadow-inner'
                      : 'bg-slate-900/40 border border-slate-800/20'
                  }`}
                >
                  {/* Goal Marker */}
                  {isGoal && (
                    <div className="w-4 h-4 rounded-full bg-rose-500/30 border-2 border-rose-400 flex items-center justify-center animate-pulse">
                      <div className="w-1.5 h-1.5 rounded-full bg-rose-400 shadow-sm" />
                    </div>
                  )}
                </div>
              );
            })
          )}

          {/* Boxes Layer */}
          {gameState.boxes.map((box) => {
            const isOnGoal = gameState.grid[box.y][box.x] === 2;

            return (
              <div
                key={box.id}
                style={{
                  width: `${cellSize - 6}px`,
                  height: `${cellSize - 6}px`,
                  transform: `translate(${box.x * cellSize + 3}px, ${box.y * cellSize + 3}px)`,
                  transition: 'transform 120ms ease-out',
                }}
                className={`absolute top-0 left-0 rounded-lg flex items-center justify-center shadow-lg cursor-pointer ${
                  isOnGoal
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-700 border-2 border-emerald-300 text-white ring-2 ring-emerald-400/40'
                    : 'bg-gradient-to-br from-amber-600 to-amber-800 border-2 border-amber-400 text-amber-100'
                }`}
              >
                <div className="flex flex-col items-center justify-center">
                  <span className="text-base sm:text-lg filter drop-shadow">
                    {isOnGoal ? '⭐' : '📦'}
                  </span>
                </div>
              </div>
            );
          })}

          {/* Player Layer */}
          <div
            style={{
              width: `${cellSize - 4}px`,
              height: `${cellSize - 4}px`,
              transform: `translate(${gameState.player.x * cellSize + 2}px, ${gameState.player.y * cellSize + 2}px)`,
              transition: 'transform 120ms ease-out',
            }}
            className="absolute top-0 left-0 rounded-full bg-gradient-to-br from-indigo-400 via-indigo-500 to-purple-600 border-2 border-indigo-200 shadow-xl flex items-center justify-center z-10"
          >
            <span className="text-[11px] sm:text-xs font-black text-white tracking-tighter select-none font-mono">
              {gameState.player.face}
            </span>
          </div>

          {/* Hint Arrow Overlay */}
          {hintArrow && (
            <div
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`,
                transform: `translate(${hintArrow.x * cellSize}px, ${hintArrow.y * cellSize}px)`,
              }}
              className="absolute top-0 left-0 flex items-center justify-center pointer-events-none z-20"
            >
              <div className="w-8 h-8 rounded-full bg-amber-400/90 text-slate-900 flex items-center justify-center font-black text-lg shadow-lg animate-bounce">
                {hintArrow.dir.symbol}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Virtual D-Pad for Mobile / Touch Control */}
      {showDpad && (
        <div className="mt-4 flex flex-col items-center gap-1 select-none">
          <button
            onClick={() => handleMove('up')}
            className="w-14 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-indigo-600 text-slate-200 active:text-white border border-slate-700 active:border-indigo-500 shadow-lg flex items-center justify-center transition-all active:scale-95"
            aria-label="Up"
          >
            <ArrowUp className="w-6 h-6" />
          </button>

          <div className="flex items-center gap-4">
            <button
              onClick={() => handleMove('left')}
              className="w-14 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-indigo-600 text-slate-200 active:text-white border border-slate-700 active:border-indigo-500 shadow-lg flex items-center justify-center transition-all active:scale-95"
              aria-label="Left"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>

            <button
              onClick={() => handleMove('down')}
              className="w-14 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-indigo-600 text-slate-200 active:text-white border border-slate-700 active:border-indigo-500 shadow-lg flex items-center justify-center transition-all active:scale-95"
              aria-label="Down"
            >
              <ArrowDown className="w-6 h-6" />
            </button>

            <button
              onClick={() => handleMove('right')}
              className="w-14 h-12 rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-indigo-600 text-slate-200 active:text-white border border-slate-700 active:border-indigo-500 shadow-lg flex items-center justify-center transition-all active:scale-95"
              aria-label="Right"
            >
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}

      {/* Stage Selection Modal */}
      {isStageSelectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 shadow-2xl flex flex-col gap-4 max-h-[85vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <ListOrdered className="w-5 h-5 text-indigo-400" />
                <span>ステージ選択 (全25面)</span>
              </h3>
              <button
                onClick={() => setIsStageSelectOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-5 gap-2 overflow-y-auto p-1">
              {SOKOBAN_LEVELS.map((_, idx) => {
                const isCleared = clearedStages.includes(idx);
                const isCurrent = gameState.stageIndex === idx;

                return (
                  <button
                    key={idx}
                    onClick={() => handleLoadStage(idx)}
                    className={`py-2.5 rounded-xl font-bold text-sm flex flex-col items-center justify-center transition-all active:scale-95 border ${
                      isCurrent
                        ? 'bg-indigo-600 text-white border-indigo-400 ring-2 ring-indigo-400/40 shadow-lg'
                        : isCleared
                        ? 'bg-emerald-950/50 text-emerald-300 border-emerald-600/40 hover:bg-emerald-900/50'
                        : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {isCleared && <span className="text-[10px] text-emerald-400">✓</span>}
                  </button>
                );
              })}
            </div>

            <div className="pt-2 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setIsStageSelectOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold"
              >
                {t('close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stage Clear Modal */}
      {gameState.isWon && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-6 shadow-2xl flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-3xl">
              🏆
            </div>

            <div>
              <h3 className="text-xl font-black text-white">ステージクリア！</h3>
              <p className="text-xs text-slate-400 mt-1">
                Stage {gameState.stageIndex + 1} を見事に攻略しました！
              </p>
            </div>

            <div className="w-full grid grid-cols-3 gap-2 bg-slate-950/60 p-3 rounded-xl border border-slate-800 text-xs">
              <div>
                <div className="text-slate-400 font-semibold">{t('time')}</div>
                <div className="font-bold text-sky-400 font-mono-digits text-sm mt-0.5">
                  {formatTime(gameState.timeSeconds)}
                </div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold">{t('moves')}</div>
                <div className="font-bold text-emerald-400 font-mono-digits text-sm mt-0.5">
                  {gameState.movesCount}
                </div>
              </div>
              <div>
                <div className="text-slate-400 font-semibold">押し</div>
                <div className="font-bold text-amber-400 font-mono-digits text-sm mt-0.5">
                  {gameState.pushesCount}
                </div>
              </div>
            </div>

            <div className="w-full flex flex-col gap-2 pt-2">
              {gameState.stageIndex < SOKOBAN_LEVELS.length - 1 ? (
                <button
                  onClick={() => handleLoadStage(gameState.stageIndex + 1)}
                  className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-md transition-all active:scale-95"
                >
                  次のステージへ
                </button>
              ) : (
                <div className="text-emerald-400 font-bold text-sm py-2">
                  🎉 全25ステージ完全制覇おめでとうございます！
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={() => setIsStageSelectOpen(true)}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
                >
                  ステージ一覧
                </button>
                <button
                  onClick={handleReset}
                  className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
                >
                  もう一度遊ぶ
                </button>
              </div>

              {onOpenStats && (
                <button
                  onClick={onOpenStats}
                  className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors"
                >
                  戦績を見る
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
