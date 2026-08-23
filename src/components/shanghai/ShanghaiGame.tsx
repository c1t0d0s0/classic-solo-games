import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { MahjongTile, ShanghaiState } from '../../types/shanghai';
import {
  areTilesMatching,
  findAvailableMatchingPairs,
  isTileFree,
} from './shanghaiLogic';
import { generateSolvableShanghaiBoard } from './shanghaiSolver';
import { MahjongTileComponent } from './MahjongTile';
import { sounds } from '../../audio/soundEffects';
import { triggerVictoryConfetti } from '../../utils/confetti';
import { saveGameResult } from '../../utils/storage';
import {
  Play,
  RotateCcw,
  Lightbulb,
  Shuffle,
  Volume2,
  VolumeX,
  Award,
} from 'lucide-react';

interface ShanghaiGameProps {
  onOpenStats?: () => void;
}

export const ShanghaiGame: React.FC<ShanghaiGameProps> = ({ onOpenStats }) => {
  const [state, setState] = useState<ShanghaiState>(() => ({
    tiles: generateSolvableShanghaiBoard(),
    selectedTileId: null,
    hintPair: null,
    history: [],
    timeSeconds: 0,
    isPlaying: false,
    isWon: false,
    isStuck: false,
    shufflesRemaining: 3,
  }));

  const [soundMuted, setSoundMuted] = useState<boolean>(sounds.isSoundMuted());
  const boardWrapperRef = useRef<HTMLDivElement>(null);
  const [containerDimensions, setContainerDimensions] = useState<{ width: number; height: number }>({
    width: 800,
    height: 500,
  });

  // Calculate remaining and free tiles
  const activeTiles = useMemo(() => state.tiles.filter((t) => !t.isRemoved), [state.tiles]);

  const freeTileIds = useMemo(() => {
    const ids = new Set<number>();
    for (const t of activeTiles) {
      if (isTileFree(t, activeTiles)) {
        ids.add(t.id);
      }
    }
    return ids;
  }, [activeTiles]);

  // Check available matches
  const availableMatches = useMemo(() => {
    return findAvailableMatchingPairs(state.tiles);
  }, [state.tiles]);

  // Window / Container resize listener to compute dynamic tile sizes
  useEffect(() => {
    const updateSize = () => {
      if (boardWrapperRef.current) {
        const w = boardWrapperRef.current.clientWidth;
        setContainerDimensions({
          width: Math.max(320, w),
          height: Math.max(380, Math.min(600, w * 0.65)),
        });
      }
    };

    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Compute tile dimensions dynamically
  // Grid is 30 half-units wide (x: 0..28 + 2 for last tile width = 30)
  // Grid is 16 half-units high (y: 0..14 + 2 for last tile height = 16)
  const tileWidth = Math.max(20, Math.min(54, (containerDimensions.width - 24) / 15.5));
  const tileHeight = Math.floor(tileWidth * 1.32);

  const boardPixelWidth = tileWidth * 15.5;
  const boardPixelHeight = tileHeight * 8.5;

  // Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (state.isPlaying && !state.isWon) {
      timer = setInterval(() => {
        setState((prev) => ({ ...prev, timeSeconds: prev.timeSeconds + 1 }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [state.isPlaying, state.isWon]);

  // Start New Game
  const startNewGame = useCallback(() => {
    sounds.playClick();
    setState({
      tiles: generateSolvableShanghaiBoard(),
      selectedTileId: null,
      hintPair: null,
      history: [],
      timeSeconds: 0,
      isPlaying: false,
      isWon: false,
      isStuck: false,
      shufflesRemaining: 3,
    });
  }, []);

  // Tile Click Handler
  const handleTileClick = (clickedTile: MahjongTile) => {
    if (state.isWon) return;

    // Start timer on first interaction
    if (!state.isPlaying) {
      setState((prev) => ({ ...prev, isPlaying: true }));
    }

    // If clicking already selected tile, deselect it
    if (state.selectedTileId === clickedTile.id) {
      sounds.playClick();
      setState((prev) => ({ ...prev, selectedTileId: null, hintPair: null }));
      return;
    }

    // If no tile selected yet, select this one
    if (state.selectedTileId === null) {
      sounds.playTileSelect();
      setState((prev) => ({ ...prev, selectedTileId: clickedTile.id, hintPair: null }));
      return;
    }

    // One tile is already selected, check match
    const selectedTile = state.tiles.find((t) => t.id === state.selectedTileId);
    if (!selectedTile) {
      setState((prev) => ({ ...prev, selectedTileId: clickedTile.id }));
      return;
    }

    if (areTilesMatching(selectedTile, clickedTile)) {
      // MATCHED!
      sounds.playTileMatch();
      const updatedTiles = state.tiles.map((t) => {
        if (t.id === selectedTile.id || t.id === clickedTile.id) {
          return { ...t, isRemoved: true };
        }
        return t;
      });

      const remaining = updatedTiles.filter((t) => !t.isRemoved);
      const isWon = remaining.length === 0;

      if (isWon) {
        sounds.playVictory();
        triggerVictoryConfetti();
        saveGameResult('shanghai_turtle', true, state.timeSeconds);
      }

      // Check if stuck
      const nextMatches = findAvailableMatchingPairs(updatedTiles);
      const isStuck = remaining.length > 0 && nextMatches.length === 0;

      setState((prev) => ({
        ...prev,
        tiles: updatedTiles,
        selectedTileId: null,
        hintPair: null,
        history: [...prev.history, { removedIds: [selectedTile.id, clickedTile.id] }],
        isWon,
        isStuck,
      }));
    } else {
      // Mismatch, switch selection to clicked tile
      sounds.playTileSelect();
      setState((prev) => ({ ...prev, selectedTileId: clickedTile.id, hintPair: null }));
    }
  };

  // Undo Last Move
  const handleUndo = () => {
    if (state.history.length === 0) return;
    sounds.playUndo();
    const last = state.history[state.history.length - 1];
    const updatedTiles = state.tiles.map((t) => {
      if (last.removedIds.includes(t.id)) {
        return { ...t, isRemoved: false };
      }
      return t;
    });

    setState((prev) => ({
      ...prev,
      tiles: updatedTiles,
      history: prev.history.slice(0, -1),
      selectedTileId: null,
      hintPair: null,
      isWon: false,
      isStuck: false,
    }));
  };

  // Hint
  const handleHint = () => {
    if (availableMatches.length === 0) {
      sounds.playInvalid();
      return;
    }
    sounds.playClick();
    const randomPair = availableMatches[Math.floor(Math.random() * availableMatches.length)];
    setState((prev) => ({
      ...prev,
      hintPair: [randomPair[0].id, randomPair[1].id],
      selectedTileId: null,
    }));
  };

  // Shuffle Remaining Tiles
  const handleShuffle = () => {
    if (state.shufflesRemaining <= 0 || activeTiles.length === 0) return;
    sounds.playTileMatch();

    // Extract remaining tile values and types
    const typesAndValues = activeTiles.map((t) => ({ type: t.type, value: t.value }));
    // Shuffle
    for (let i = typesAndValues.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [typesAndValues[i], typesAndValues[j]] = [typesAndValues[j], typesAndValues[i]];
    }

    let idx = 0;
    const shuffledTiles = state.tiles.map((t) => {
      if (t.isRemoved) return t;
      const assigned = typesAndValues[idx++];
      return {
        ...t,
        type: assigned.type,
        value: assigned.value,
      };
    });

    setState((prev) => ({
      ...prev,
      tiles: shuffledTiles,
      shufflesRemaining: prev.shufflesRemaining - 1,
      selectedTileId: null,
      hintPair: null,
      isStuck: false,
    }));
  };

  const toggleSound = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    sounds.setMuted(next);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full flex flex-col items-center select-none pb-8">
      {/* Top Controls & Status Bar */}
      <div className="w-full max-w-4xl flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-800/80 backdrop-blur rounded-xl border border-slate-700/80 mb-4 shadow-lg">
        {/* Info Stats */}
        <div className="flex items-center gap-3 text-xs sm:text-sm font-semibold">
          <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="text-slate-400">タイム:</span>
            <span className="font-mono-digits text-amber-400 text-sm sm:text-base">{formatTime(state.timeSeconds)}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="text-slate-400">残り牌:</span>
            <span className="font-mono-digits text-emerald-400 text-sm sm:text-base">{activeTiles.length}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="text-slate-400">可能ペア:</span>
            <span className={`font-mono-digits text-sm sm:text-base ${availableMatches.length > 0 ? 'text-sky-400' : 'text-red-400 font-bold'}`}>
              {availableMatches.length}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Hint Button */}
          <button
            onClick={handleHint}
            disabled={availableMatches.length === 0 || state.isWon}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold rounded-lg shadow transition-colors"
            title="ヒントを表示"
          >
            <Lightbulb className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>ヒント</span>
          </button>

          {/* Shuffle Button */}
          <button
            onClick={handleShuffle}
            disabled={state.shufflesRemaining <= 0 || state.isWon || activeTiles.length === 0}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-semibold rounded-lg shadow transition-colors"
            title="シャッフル"
          >
            <Shuffle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span>再配置 ({state.shufflesRemaining})</span>
          </button>

          {/* Undo */}
          <button
            onClick={handleUndo}
            disabled={state.history.length === 0 || state.isWon}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 text-xs sm:text-sm font-medium rounded-lg transition-colors"
            title="一手戻す"
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">戻す</span>
          </button>

          {/* New Game */}
          <button
            onClick={startNewGame}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-lg shadow-md transition-all"
            title="新しいゲームを開始"
          >
            <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
            <span>新規</span>
          </button>

          {/* Stats Button */}
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

      {/* Stuck Alert Banner */}
      {state.isStuck && !state.isWon && (
        <div className="w-full max-w-4xl bg-amber-900/80 border border-amber-500 text-amber-200 px-4 py-2 rounded-xl mb-3 flex items-center justify-between shadow-lg animate-pulse">
          <span className="text-xs sm:text-sm font-semibold">
            ⚠️ 手詰まりになりました！「再配置」ボタンで牌をシャッフルできます。
          </span>
          {state.shufflesRemaining > 0 && (
            <button
              onClick={handleShuffle}
              className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-lg shadow"
            >
              今すぐ再配置
            </button>
          )}
        </div>
      )}

      {/* 3D Mahjong Board Container */}
      <div
        ref={boardWrapperRef}
        className="w-full max-w-5xl bg-gradient-to-b from-stone-900 via-stone-850 to-stone-950 rounded-2xl p-2 sm:p-4 md:p-6 shadow-2xl border-4 border-amber-950/80 ring-1 ring-amber-700/40 flex justify-center items-center overflow-x-auto min-h-[460px]"
      >
        <div
          className="relative mahjong-board-container my-4"
          style={{
            width: `${boardPixelWidth}px`,
            height: `${boardPixelHeight}px`,
            minWidth: `${boardPixelWidth}px`,
          }}
        >
          {state.tiles.map((tile) => {
            if (tile.isRemoved) return null;
            const isFree = freeTileIds.has(tile.id);
            const isSelected = state.selectedTileId === tile.id;
            const isHinted = state.hintPair !== null && (state.hintPair[0] === tile.id || state.hintPair[1] === tile.id);

            return (
              <MahjongTileComponent
                key={tile.id}
                tile={tile}
                isFree={isFree}
                isSelected={isSelected}
                isHinted={isHinted}
                onClick={handleTileClick}
                tileWidth={tileWidth}
                tileHeight={tileHeight}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
