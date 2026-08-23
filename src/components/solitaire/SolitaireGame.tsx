import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, PileType, SolitaireSnapshot, SolitaireState } from '../../types/solitaire';
import {
  canMoveToFoundation,
  canMoveToTableau,
  checkIsAutoCompletable,
  findAutoMoveDestination,
  initializeSolitaireGame,
  isGameWon,
  SUITS,
} from './solitaireLogic';
import { SolitaireCard } from './SolitaireCard';
import { SolitairePile } from './SolitairePile';
import { WinAnimation } from './WinAnimation';
import { sounds } from '../../audio/soundEffects';
import { triggerVictoryConfetti } from '../../utils/confetti';
import { saveGameResult } from '../../utils/storage';
import { Play, RotateCcw, Zap, Volume2, VolumeX, Award } from 'lucide-react';
import { useTranslation } from '../../i18n/LanguageContext';

interface SolitaireGameProps {
  drawMode?: 1 | 3;
  onOpenStats?: () => void;
}

export const SolitaireGame: React.FC<SolitaireGameProps> = ({
  drawMode = 1,
  onOpenStats,
}) => {
  const { t } = useTranslation();
  const [state, setState] = useState<SolitaireState>(() => initializeSolitaireGame(drawMode));
  const [history, setHistory] = useState<SolitaireSnapshot[]>([]);
  const [selectedCardInfo, setSelectedCardInfo] = useState<{
    pileType: PileType;
    pileIndex: number;
    cardIndex: number;
  } | null>(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState<boolean>(false);
  const [soundMuted, setSoundMuted] = useState<boolean>(sounds.isSoundMuted());

  // Drag source state
  const dragSourceRef = useRef<{
    pileType: PileType;
    pileIndex: number;
    cardIndex: number;
  } | null>(null);

  // Timer Effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (state.isPlaying && !state.isWon) {
      timer = setInterval(() => {
        setState((prev) => ({ ...prev, timeSeconds: prev.timeSeconds + 1 }));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [state.isPlaying, state.isWon]);

  // Push Snapshot to History
  const pushHistory = useCallback((currentState: SolitaireState) => {
    const snapshot: SolitaireSnapshot = {
      stock: JSON.parse(JSON.stringify(currentState.stock)),
      waste: JSON.parse(JSON.stringify(currentState.waste)),
      foundations: JSON.parse(JSON.stringify(currentState.foundations)),
      tableau: JSON.parse(JSON.stringify(currentState.tableau)),
      moves: currentState.moves,
      score: currentState.score,
    };
    setHistory((prev) => [...prev.slice(-30), snapshot]); // Keep up to 30 steps
  }, []);

  // Check Win Condition
  const checkAndHandleWin = useCallback((newState: SolitaireState) => {
    if (isGameWon(newState.foundations)) {
      newState.isWon = true;
      newState.isPlaying = false;
      sounds.playVictory();
      triggerVictoryConfetti();
      saveGameResult(
        newState.drawMode === 1 ? 'solitaire_draw1' : 'solitaire_draw3',
        true,
        newState.timeSeconds
      );
    } else {
      const autoCompletable = checkIsAutoCompletable(newState);
      newState.autoCompletable = autoCompletable;
      if (autoCompletable && !newState.isWon) {
        setIsAutoPlaying(true);
      }
    }
    return newState;
  }, []);

  // Restart / New Game
  const startNewGame = useCallback((newDrawMode: 1 | 3 = state.drawMode) => {
    sounds.playClick();
    const fresh = initializeSolitaireGame(newDrawMode);
    setState(fresh);
    setHistory([]);
    setSelectedCardInfo(null);
    setIsAutoPlaying(false);
  }, [state.drawMode]);

  // Toggle Draw Mode
  const handleChangeDrawMode = (mode: 1 | 3) => {
    if (mode !== state.drawMode) {
      startNewGame(mode);
    }
  };

  // Click Stock Pile
  const handleStockClick = () => {
    if (state.isWon || isAutoPlaying) return;
    pushHistory(state);

    setState((prev) => {
      let nextStock = [...prev.stock];
      let nextWaste = [...prev.waste];

      if (nextStock.length === 0) {
        // Recycle waste back to stock (reversed, face down)
        nextStock = nextWaste.reverse().map((c) => ({ ...c, faceUp: false }));
        nextWaste = [];
        sounds.playCardFlip();
      } else {
        // Draw cards
        const count = Math.min(prev.drawMode, nextStock.length);
        for (let i = 0; i < count; i++) {
          const card = nextStock.pop()!;
          card.faceUp = true;
          nextWaste.push(card);
        }
        sounds.playCardFlip();
      }

      const nextState: SolitaireState = {
        ...prev,
        stock: nextStock,
        waste: nextWaste,
        moves: prev.moves + 1,
        isPlaying: true,
      };

      return checkAndHandleWin(nextState);
    });

    setSelectedCardInfo(null);
  };

  // Perform Move
  const executeMove = useCallback((
    source: { pileType: PileType; pileIndex: number; cardIndex: number },
    target: { pileType: PileType; pileIndex: number }
  ): boolean => {
    let movingCards: Card[] = [];
    const nextStock = [...state.stock];
    const nextWaste = [...state.waste];
    const nextFoundations = state.foundations.map((f) => [...f]);
    const nextTableau = state.tableau.map((t) => [...t]);

    // Extract moving cards
    if (source.pileType === 'waste') {
      if (nextWaste.length === 0) return false;
      movingCards = [nextWaste.pop()!];
    } else if (source.pileType === 'tableau') {
      const col = nextTableau[source.pileIndex];
      if (source.cardIndex >= col.length) return false;
      movingCards = col.splice(source.cardIndex);
    } else if (source.pileType === 'foundation') {
      const f = nextFoundations[source.pileIndex];
      if (f.length === 0) return false;
      movingCards = [f.pop()!];
    }

    if (movingCards.length === 0) return false;
    const leadCard = movingCards[0];

    // Validate Target
    if (target.pileType === 'foundation') {
      if (movingCards.length > 1) return false; // Only 1 card can go to foundation
      const targetF = nextFoundations[target.pileIndex];
      if (!canMoveToFoundation(leadCard, targetF)) return false;
      targetF.push(leadCard);
    } else if (target.pileType === 'tableau') {
      const targetCol = nextTableau[target.pileIndex];
      if (!canMoveToTableau(leadCard, targetCol)) return false;
      targetCol.push(...movingCards);
    } else {
      return false;
    }

    // Reveal top card of source tableau if needed
    if (source.pileType === 'tableau') {
      const sourceCol = nextTableau[source.pileIndex];
      if (sourceCol.length > 0 && !sourceCol[sourceCol.length - 1].faceUp) {
        sourceCol[sourceCol.length - 1].faceUp = true;
      }
    }

    pushHistory(state);
    sounds.playCardPlace();

    const nextState: SolitaireState = {
      ...state,
      stock: nextStock,
      waste: nextWaste,
      foundations: nextFoundations,
      tableau: nextTableau,
      moves: state.moves + 1,
      score: state.score + (target.pileType === 'foundation' ? 10 : 5),
      isPlaying: true,
    };

    setState(checkAndHandleWin(nextState));
    setSelectedCardInfo(null);
    return true;
  }, [state, pushHistory, checkAndHandleWin]);

  // Tap-to-move card (Single Click)
  const handleCardClick = (
    pileType: PileType,
    pileIndex: number,
    cardIndex: number,
    card: Card
  ) => {
    if (state.isWon || isAutoPlaying || !card.faceUp) return;

    // If already selected and clicking another card/pile, attempt move
    if (selectedCardInfo) {
      if (
        selectedCardInfo.pileType === pileType &&
        selectedCardInfo.pileIndex === pileIndex &&
        selectedCardInfo.cardIndex === cardIndex
      ) {
        // Deselect
        setSelectedCardInfo(null);
        return;
      }

      if (pileType === 'tableau') {
        const moved = executeMove(selectedCardInfo, { pileType: 'tableau', pileIndex });
        if (moved) return;
      } else if (pileType === 'foundation') {
        const moved = executeMove(selectedCardInfo, { pileType: 'foundation', pileIndex });
        if (moved) return;
      }
    }

    // Auto-move on single tap (Mobile friendly!)
    const dest = findAutoMoveDestination(card, pileType, pileIndex, state);
    if (dest) {
      const moved = executeMove(
        { pileType, pileIndex, cardIndex },
        { pileType: dest.targetPile, pileIndex: dest.targetIndex }
      );
      if (moved) return;
    }

    // If no direct auto-move, select it
    setSelectedCardInfo({ pileType, pileIndex, cardIndex });
  };

  // Double click to send directly to Foundation
  const handleCardDoubleClick = (
    pileType: PileType,
    pileIndex: number,
    cardIndex: number,
    card: Card
  ) => {
    if (state.isWon || isAutoPlaying || !card.faceUp) return;
    for (let i = 0; i < 4; i++) {
      if (canMoveToFoundation(card, state.foundations[i])) {
        executeMove({ pileType, pileIndex, cardIndex }, { pileType: 'foundation', pileIndex: i });
        return;
      }
    }
  };

  // Empty tableau column click
  const handleEmptyTableauClick = (colIndex: number) => {
    if (selectedCardInfo) {
      executeMove(selectedCardInfo, { pileType: 'tableau', pileIndex: colIndex });
    }
  };

  // Drag Handlers
  const handleDragStart = (
    e: React.DragEvent,
    pileType: PileType,
    pileIndex: number,
    cardIndex: number
  ) => {
    dragSourceRef.current = { pileType, pileIndex, cardIndex };
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ pileType, pileIndex, cardIndex }));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetPile: PileType, targetIndex: number) => {
    e.preventDefault();
    const source = dragSourceRef.current;
    if (source) {
      executeMove(source, { pileType: targetPile, pileIndex: targetIndex });
      dragSourceRef.current = null;
    }
  };

  // Undo Handler
  const handleUndo = () => {
    if (history.length === 0 || isAutoPlaying) return;
    sounds.playUndo();
    const prevSnapshot = history[history.length - 1];
    setHistory((prev) => prev.slice(0, -1));

    setState((prev) => ({
      ...prev,
      stock: prevSnapshot.stock,
      waste: prevSnapshot.waste,
      foundations: prevSnapshot.foundations,
      tableau: prevSnapshot.tableau,
      moves: prevSnapshot.moves,
      score: prevSnapshot.score,
      isWon: false,
      autoCompletable: checkIsAutoCompletable({
        ...prev,
        stock: prevSnapshot.stock,
        waste: prevSnapshot.waste,
        tableau: prevSnapshot.tableau,
      }),
    }));
    setSelectedCardInfo(null);
  };

  // Auto-Complete Animation Loop
  const handleAutoComplete = () => {
    if (isAutoPlaying || state.isWon) return;
    setIsAutoPlaying(true);
  };

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setState((prev) => {
        if (isGameWon(prev.foundations)) {
          setIsAutoPlaying(false);
          return checkAndHandleWin({ ...prev, isWon: true });
        }

        const nextTableau = prev.tableau.map((t) => [...t]);
        const nextFoundations = prev.foundations.map((f) => [...f]);
        const nextWaste = [...prev.waste];

        // 1. Try moving top of tableau columns to foundation
        for (let colIdx = 0; colIdx < 7; colIdx++) {
          const col = nextTableau[colIdx];
          if (col.length === 0) continue;
          const topCard = col[col.length - 1];

          for (let fIdx = 0; fIdx < 4; fIdx++) {
            if (canMoveToFoundation(topCard, nextFoundations[fIdx])) {
              col.pop();
              nextFoundations[fIdx].push(topCard);
              sounds.playCardPlace();

              return {
                ...prev,
                tableau: nextTableau,
                foundations: nextFoundations,
                waste: nextWaste,
                moves: prev.moves + 1,
                score: prev.score + 10,
              };
            }
          }
        }

        // 2. Try moving top of waste to foundation
        if (nextWaste.length > 0) {
          const topWaste = nextWaste[nextWaste.length - 1];
          for (let fIdx = 0; fIdx < 4; fIdx++) {
            if (canMoveToFoundation(topWaste, nextFoundations[fIdx])) {
              nextWaste.pop();
              nextFoundations[fIdx].push(topWaste);
              sounds.playCardPlace();

              return {
                ...prev,
                tableau: nextTableau,
                foundations: nextFoundations,
                waste: nextWaste,
                moves: prev.moves + 1,
                score: prev.score + 10,
              };
            }
          }
        }

        // If no moves found, finish
        setIsAutoPlaying(false);
        return prev;
      });
    }, 85);

    return () => clearInterval(interval);
  }, [isAutoPlaying, checkAndHandleWin]);

  const toggleSound = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    sounds.setMuted(next);
  };

  // Format Time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full flex flex-col items-center select-none pb-8">
      {/* Game Bar / Controls */}
      <div className="w-full max-w-4xl flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-slate-800/80 backdrop-blur rounded-xl border border-slate-700/80 mb-4 shadow-lg">
        {/* Info Stats */}
        <div className="flex items-center gap-4 text-xs sm:text-sm font-semibold">
          <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="text-slate-400">{t('time')}:</span>
            <span className="font-mono-digits text-amber-400 text-sm sm:text-base">{formatTime(state.timeSeconds)}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="text-slate-400">{t('moves')}:</span>
            <span className="font-mono-digits text-emerald-400 text-sm sm:text-base">{state.moves}</span>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-900/60 px-3 py-1.5 rounded-lg border border-slate-700">
            <span className="text-slate-400">{t('score')}:</span>
            <span className="font-mono-digits text-sky-400 text-sm sm:text-base">{state.score}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Mode Switch */}
          <div className="flex rounded-lg bg-slate-900/70 p-0.5 border border-slate-700 text-xs">
            <button
              onClick={() => handleChangeDrawMode(1)}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                state.drawMode === 1 ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('draw1')}
            </button>
            <button
              onClick={() => handleChangeDrawMode(3)}
              className={`px-2.5 py-1 rounded-md transition-all font-medium ${
                state.drawMode === 3 ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('draw3')}
            </button>
          </div>

          {/* Auto-Complete Button */}
          {state.autoCompletable && !state.isWon && (
            <button
              onClick={handleAutoComplete}
              disabled={isAutoPlaying}
              className="flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs sm:text-sm font-bold rounded-lg shadow-lg shadow-orange-500/30 animate-bounce transition-transform active:scale-95"
            >
              <Zap className="w-4 h-4" />
              {isAutoPlaying ? t('autoCollecting') : t('autoComplete')}
            </button>
          )}

          {/* Undo */}
          <button
            onClick={handleUndo}
            disabled={history.length === 0 || isAutoPlaying}
            className="flex items-center gap-1 px-2.5 py-1.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 text-xs sm:text-sm font-medium rounded-lg transition-colors"
            title={t('undo')}
          >
            <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">{t('undo')}</span>
          </button>

          {/* New Game */}
          <button
            onClick={() => startNewGame()}
            className="flex items-center gap-1 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white text-xs sm:text-sm font-bold rounded-lg shadow-md transition-all"
            title={t('newGame')}
          >
            <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-white" />
            <span>{t('newGame')}</span>
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

      {/* Main Playing Felt Board */}
      <div className="w-full max-w-4xl bg-emerald-800/90 rounded-2xl p-2 sm:p-4 md:p-6 shadow-2xl border-4 border-emerald-950/60 ring-1 ring-emerald-600/30 flex flex-col gap-4 sm:gap-6 min-h-[480px]">
        {/* Top Row: Stock & Waste on Left, 4 Foundations on Right */}
        <div className="flex justify-between items-start">
          {/* Stock & Waste */}
          <div className="flex gap-2 sm:gap-3 md:gap-4">
            {/* Stock */}
            <SolitairePile
              type="stock"
              isEmpty={state.stock.length === 0}
              onClick={handleStockClick}
            >
              {state.stock.length > 0 && (
                <SolitaireCard
                  card={state.stock[state.stock.length - 1]}
                  className="cursor-pointer active:scale-95 hover:scale-102"
                />
              )}
            </SolitairePile>

            {/* Waste */}
            <SolitairePile type="waste" isEmpty={state.waste.length === 0}>
              {state.waste.length > 0 && (
                <SolitaireCard
                  card={state.waste[state.waste.length - 1]}
                  isSelected={
                    selectedCardInfo?.pileType === 'waste' &&
                    selectedCardInfo?.cardIndex === state.waste.length - 1
                  }
                  onClick={() =>
                    handleCardClick('waste', 0, state.waste.length - 1, state.waste[state.waste.length - 1])
                  }
                  onDoubleClick={() =>
                    handleCardDoubleClick('waste', 0, state.waste.length - 1, state.waste[state.waste.length - 1])
                  }
                  onDragStart={(e) => handleDragStart(e, 'waste', 0, state.waste.length - 1)}
                />
              )}
            </SolitairePile>
          </div>

          {/* 4 Foundations */}
          <div className="flex gap-2 sm:gap-3 md:gap-4">
            {SUITS.map((suit, idx) => {
              const pile = state.foundations[idx];
              const topCard = pile.length > 0 ? pile[pile.length - 1] : null;
              return (
                <SolitairePile
                  key={suit}
                  type="foundation"
                  suit={suit}
                  isEmpty={pile.length === 0}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, 'foundation', idx)}
                  onClick={() => {
                    if (selectedCardInfo) {
                      executeMove(selectedCardInfo, { pileType: 'foundation', pileIndex: idx });
                    }
                  }}
                >
                  {topCard && (
                    <SolitaireCard
                      card={topCard}
                      isSelected={
                        selectedCardInfo?.pileType === 'foundation' &&
                        selectedCardInfo?.pileIndex === idx
                      }
                      onClick={() => handleCardClick('foundation', idx, pile.length - 1, topCard)}
                      onDragStart={(e) => handleDragStart(e, 'foundation', idx, pile.length - 1)}
                    />
                  )}
                </SolitairePile>
              );
            })}
          </div>
        </div>

        {/* Bottom Row: 7 Tableau Columns */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 md:gap-3 items-start justify-items-center flex-1">
          {state.tableau.map((column, colIdx) => {
            let totalFaceDown = 0;
            let totalFaceUp = 0;
            for (let i = 0; i < column.length - 1; i++) {
              if (column[i].faceUp) totalFaceUp++;
              else totalFaceDown++;
            }

            return (
              <div
                key={colIdx}
                className="flex flex-col items-center w-full min-h-[160px] sm:min-h-[220px] tableau-col"
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'tableau', colIdx)}
              >
                {column.length === 0 ? (
                  <SolitairePile
                    type="tableau"
                    isEmpty={true}
                    onClick={() => handleEmptyTableauClick(colIdx)}
                  />
                ) : (
                  <div
                    className="relative w-full flex justify-center"
                    style={{
                      minHeight: `calc(${totalFaceDown} * var(--facedown-step) + ${totalFaceUp} * var(--faceup-step) + 112px)`,
                    }}
                  >
                    {column.map((card, cardIdx) => {
                      const isSelected =
                        selectedCardInfo?.pileType === 'tableau' &&
                        selectedCardInfo?.pileIndex === colIdx &&
                        selectedCardInfo?.cardIndex <= cardIdx;

                      let faceDownCount = 0;
                      let faceUpCount = 0;
                      for (let i = 0; i < cardIdx; i++) {
                        if (column[i].faceUp) faceUpCount++;
                        else faceDownCount++;
                      }

                      return (
                        <div
                          key={card.id}
                          className="absolute"
                          style={{
                            top: `calc(${faceDownCount} * var(--facedown-step) + ${faceUpCount} * var(--faceup-step))`,
                            zIndex: cardIdx + 1,
                          }}
                        >
                          <SolitaireCard
                            card={card}
                            isSelected={isSelected}
                            onClick={() => handleCardClick('tableau', colIdx, cardIdx, card)}
                            onDoubleClick={() => handleCardDoubleClick('tableau', colIdx, cardIdx, card)}
                            onDragStart={(e) => handleDragStart(e, 'tableau', colIdx, cardIdx)}
                          />
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Win Cascade Animation */}
      {state.isWon && <WinAnimation cards={state.foundations} />}
    </div>
  );
};
