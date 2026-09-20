import React, { useState, useEffect, useRef, useCallback, useLayoutEffect } from 'react';
import { Card, Suit } from '../../types/solitaire';
import { FreeCellPileType, FreeCellSelectedCardInfo, FreeCellState } from '../../types/freecell';
import {
  canMoveToCascade,
  canMoveToFoundation,
  canMoveToFreeCell,
  findAutoMoveDestination,
  getEmptyCellCount,
  getEmptyColCount,
  getMaxMovingCards,
  initializeFreeCellGame,
  isCardSafeForFoundation,
  isGameWon,
  isValidCascadeSequence,
} from './freecellLogic';
import { getRandomFreeCellGameNumber } from './freecellRNG';
import { SolitaireCard } from '../solitaire/SolitaireCard';
import { SolitairePile } from '../solitaire/SolitairePile';
import { WinAnimation } from '../solitaire/WinAnimation';
import { sounds } from '../../audio/soundEffects';
import { saveGameResult } from '../../utils/storage';
import { useTranslation } from '../../i18n/LanguageContext';
import { RotateCcw, Play, RefreshCw, Hash, Trophy, Volume2, VolumeX, Sparkles, X } from 'lucide-react';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;
const FOUNDATION_SUITS: Suit[] = ['clubs', 'diamonds', 'hearts', 'spades'];

interface FreeCellGameProps {
  onOpenStats?: () => void;
}

export const FreeCellGame: React.FC<FreeCellGameProps> = ({ onOpenStats }) => {
  const { t } = useTranslation();
  const [state, setState] = useState<FreeCellState>(() => initializeFreeCellGame());
  const [history, setHistory] = useState<FreeCellState[]>([]);
  const [selectedCardInfo, setSelectedCardInfo] = useState<FreeCellSelectedCardInfo | null>(null);
  const [soundMuted, setSoundMuted] = useState<boolean>(sounds.isSoundMuted());
  const [isGameSelectOpen, setIsGameSelectOpen] = useState<boolean>(false);
  const [customGameNumInput, setCustomGameNumInput] = useState<string>('');

  const boardRef = useRef<HTMLDivElement | null>(null);
  const prevPositionsRef = useRef<Map<string, DOMRect>>(new Map());
  const isInitialRenderRef = useRef<boolean>(true);
  const isNewGameRef = useRef<boolean>(false);

  // Timer Effect
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (state.isPlaying && !state.isWon) {
      timer = setInterval(() => {
        setState((prev) => ({ ...prev, timeSeconds: prev.timeSeconds + 1 }));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [state.isPlaying, state.isWon]);

  // Save state to undo history
  const pushHistory = (curr: FreeCellState) => {
    setHistory((prev) => [...prev.slice(-30), curr]);
  };

  // Check Win Condition & Save Stats
  const checkAndHandleWin = useCallback((nextState: FreeCellState): FreeCellState => {
    if (!nextState.isWon && isGameWon(nextState.foundations)) {
      sounds.playVictory();
      saveGameResult('freecell', true, nextState.timeSeconds);
      return { ...nextState, isWon: true, isPlaying: false };
    }
    return nextState;
  }, []);

  // Safe Auto-Home Trigger
  const handleAutoHome = useCallback(() => {
    if (state.isWon) return;

    let madeMove = false;
    let nextState = { ...state };

    // 1. Check free cells
    for (let i = 0; i < 4; i++) {
      const card = nextState.freeCells[i];
      if (!card) continue;
      for (let fIdx = 0; fIdx < 4; fIdx++) {
        if (canMoveToFoundation(card, nextState.foundations[fIdx])) {
          if (isCardSafeForFoundation(card, nextState.foundations)) {
            pushHistory(nextState);
            const nextFreeCells = [...nextState.freeCells];
            nextFreeCells[i] = null;
            const nextFoundations = nextState.foundations.map((col, idx) =>
              idx === fIdx ? [...col, card] : col
            );
            sounds.playCardPlace();
            nextState = {
              ...nextState,
              freeCells: nextFreeCells,
              foundations: nextFoundations,
              moves: nextState.moves + 1,
            };
            madeMove = true;
            break;
          }
        }
      }
      if (madeMove) break;
    }

    // 2. Check cascades
    if (!madeMove) {
      for (let cIdx = 0; cIdx < 8; cIdx++) {
        const col = nextState.cascades[cIdx];
        if (col.length === 0) continue;
        const card = col[col.length - 1];
        for (let fIdx = 0; fIdx < 4; fIdx++) {
          if (canMoveToFoundation(card, nextState.foundations[fIdx])) {
            if (isCardSafeForFoundation(card, nextState.foundations)) {
              pushHistory(nextState);
              const nextCascades = nextState.cascades.map((c, idx) =>
                idx === cIdx ? c.slice(0, -1) : c
              );
              const nextFoundations = nextState.foundations.map((f, idx) =>
                idx === fIdx ? [...f, card] : f
              );
              sounds.playCardPlace();
              nextState = {
                ...nextState,
                cascades: nextCascades,
                foundations: nextFoundations,
                moves: nextState.moves + 1,
              };
              madeMove = true;
              break;
            }
          }
        }
        if (madeMove) break;
      }
    }

    if (madeMove) {
      setState(checkAndHandleWin(nextState));
    }
  }, [state, checkAndHandleWin]);

  // Execute Move between piles
  const executeMove = useCallback(
    (
      source: { pileType: FreeCellPileType; pileIndex: number; cardIndex: number },
      target: { pileType: FreeCellPileType; pileIndex: number }
    ): boolean => {
      let movingCards: Card[] = [];
      const nextCascades = state.cascades.map((col) => [...col]);
      const nextFreeCells = [...state.freeCells];
      const nextFoundations = state.foundations.map((col) => [...col]);

      // Extract moving cards from source
      if (source.pileType === 'freecell') {
        const c = nextFreeCells[source.pileIndex];
        if (!c) return false;
        movingCards = [c];
      } else if (source.pileType === 'cascade') {
        const col = nextCascades[source.pileIndex];
        if (source.cardIndex < 0 || source.cardIndex >= col.length) return false;
        movingCards = col.slice(source.cardIndex);
        if (!isValidCascadeSequence(movingCards)) return false;
      } else if (source.pileType === 'foundation') {
        const col = nextFoundations[source.pileIndex];
        if (col.length === 0) return false;
        movingCards = [col[col.length - 1]];
      }

      if (movingCards.length === 0) return false;

      // Validate move against target
      if (target.pileType === 'foundation') {
        if (movingCards.length !== 1) return false;
        const targetPile = nextFoundations[target.pileIndex];
        if (!canMoveToFoundation(movingCards[0], targetPile)) return false;

        // Apply move
        if (source.pileType === 'freecell') nextFreeCells[source.pileIndex] = null;
        else if (source.pileType === 'cascade') nextCascades[source.pileIndex].pop();
        else if (source.pileType === 'foundation') nextFoundations[source.pileIndex].pop();

        nextFoundations[target.pileIndex].push(movingCards[0]);
        sounds.playCardPlace();
      } else if (target.pileType === 'freecell') {
        if (movingCards.length !== 1) return false;
        if (!canMoveToFreeCell(nextFreeCells[target.pileIndex])) return false;

        if (source.pileType === 'freecell') nextFreeCells[source.pileIndex] = null;
        else if (source.pileType === 'cascade') nextCascades[source.pileIndex].pop();
        else if (source.pileType === 'foundation') nextFoundations[source.pileIndex].pop();

        nextFreeCells[target.pileIndex] = movingCards[0];
        sounds.playCardPlace();
      } else if (target.pileType === 'cascade') {
        const targetCol = nextCascades[target.pileIndex];
        const emptyCells = getEmptyCellCount(state.freeCells);
        const emptyCols = getEmptyColCount(state.cascades);
        const movingToEmpty = targetCol.length === 0;

        const maxCards = getMaxMovingCards(emptyCells, emptyCols, movingToEmpty);
        if (movingCards.length > maxCards) return false;
        if (!canMoveToCascade(movingCards[0], targetCol)) return false;

        // Apply move
        if (source.pileType === 'freecell') nextFreeCells[source.pileIndex] = null;
        else if (source.pileType === 'cascade') {
          nextCascades[source.pileIndex].splice(source.cardIndex, movingCards.length);
        } else if (source.pileType === 'foundation') {
          nextFoundations[source.pileIndex].pop();
        }

        nextCascades[target.pileIndex].push(...movingCards);
        sounds.playCardPlace();
      }

      pushHistory(state);

      const nextState: FreeCellState = {
        ...state,
        cascades: nextCascades,
        freeCells: nextFreeCells,
        foundations: nextFoundations,
        moves: state.moves + 1,
        isPlaying: true,
      };

      setState(checkAndHandleWin(nextState));
      setSelectedCardInfo(null);
      return true;
    },
    [state, checkAndHandleWin]
  );

  // Card Tap / Click Handler
  const handleCardClick = (
    pileType: FreeCellPileType,
    pileIndex: number,
    cardIndex: number,
    card: Card
  ) => {
    if (state.isWon) return;

    // 1. If card already selected, deselect
    if (
      selectedCardInfo &&
      selectedCardInfo.pileType === pileType &&
      selectedCardInfo.pileIndex === pileIndex &&
      selectedCardInfo.cardIndex === cardIndex
    ) {
      setSelectedCardInfo(null);
      sounds.playClick();
      return;
    }

    // 2. If another card is selected, try moving to this target
    if (selectedCardInfo) {
      const moved = executeMove(selectedCardInfo, { pileType, pileIndex });
      if (moved) return;
      // If move failed and user clicked another card, change selection
      setSelectedCardInfo(null);
    }

    // 3. Try Auto-Move on tap
    if (pileType === 'cascade') {
      const col = state.cascades[pileIndex];
      const movingStack = col.slice(cardIndex);
      if (isValidCascadeSequence(movingStack)) {
        const dest = findAutoMoveDestination(
          card,
          { pileType, pileIndex },
          state,
          movingStack.length
        );
        if (dest) {
          executeMove(
            { pileType, pileIndex, cardIndex },
            { pileType: dest.targetPile, pileIndex: dest.targetIndex }
          );
          return;
        }
      }
    } else if (pileType === 'freecell') {
      const dest = findAutoMoveDestination(card, { pileType, pileIndex }, state, 1);
      if (dest) {
        executeMove(
          { pileType, pileIndex, cardIndex },
          { pileType: dest.targetPile, pileIndex: dest.targetIndex }
        );
        return;
      }
    }

    // 4. Select the card
    sounds.playClick();
    setSelectedCardInfo({ pileType, pileIndex, cardIndex });
  };

  // Empty Pile Tap Handler
  const handleEmptyPileClick = (pileType: FreeCellPileType, pileIndex: number) => {
    if (!selectedCardInfo || state.isWon) return;
    executeMove(selectedCardInfo, { pileType, pileIndex });
  };

  // Drag and Drop
  const handleDragStart = (
    e: React.DragEvent,
    pileType: FreeCellPileType,
    pileIndex: number,
    cardIndex: number
  ) => {
    if (state.isWon) {
      e.preventDefault();
      return;
    }
    sounds.playClick();
    e.dataTransfer.setData('text/plain', JSON.stringify({ pileType, pileIndex, cardIndex }));
    setSelectedCardInfo({ pileType, pileIndex, cardIndex });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetPile: FreeCellPileType, targetIndex: number) => {
    e.preventDefault();
    try {
      const raw = e.dataTransfer.getData('text/plain');
      if (!raw) return;
      const source = JSON.parse(raw) as {
        pileType: FreeCellPileType;
        pileIndex: number;
        cardIndex: number;
      };
      executeMove(source, { pileType: targetPile, pileIndex: targetIndex });
    } catch {}
  };

  // Start New Game
  const handleNewGame = (gameNum?: number) => {
    sounds.playCardFlip();
    isNewGameRef.current = true;
    const num = gameNum && gameNum > 0 ? gameNum : getRandomFreeCellGameNumber();
    setState(initializeFreeCellGame(num));
    setHistory([]);
    setSelectedCardInfo(null);
    setIsGameSelectOpen(false);
  };

  // Restart Current Game
  const handleRestartGame = () => {
    handleNewGame(state.gameNumber);
  };

  // Undo
  const handleUndo = () => {
    if (history.length === 0 || state.isWon) return;
    sounds.playUndo();
    const prev = history[history.length - 1];
    setHistory((prevHist) => prevHist.slice(0, -1));
    setState(prev);
    setSelectedCardInfo(null);
  };

  // Sound toggle
  const toggleSound = () => {
    const next = !soundMuted;
    setSoundMuted(next);
    sounds.setMuted(next);
  };

  // FLIP Card Movement Animation
  useIsomorphicLayoutEffect(() => {
    if (!boardRef.current) return;

    if (isInitialRenderRef.current) {
      isInitialRenderRef.current = false;
      const initialPositions = new Map<string, DOMRect>();
      const cardEls = boardRef.current.querySelectorAll<HTMLElement>('[data-card-id]');
      cardEls.forEach((el) => {
        const id = el.getAttribute('data-card-id');
        if (id) initialPositions.set(id, el.getBoundingClientRect());
      });
      prevPositionsRef.current = initialPositions;
      return;
    }

    if (isNewGameRef.current) {
      isNewGameRef.current = false;
      const newPositions = new Map<string, DOMRect>();
      const cardEls = boardRef.current.querySelectorAll<HTMLElement>('[data-card-id]');
      cardEls.forEach((el) => {
        const id = el.getAttribute('data-card-id');
        if (id) newPositions.set(id, el.getBoundingClientRect());
      });
      prevPositionsRef.current = newPositions;
      return;
    }

    const prevPositions = prevPositionsRef.current;
    const currentPositions = new Map<string, DOMRect>();
    const cardEls = boardRef.current.querySelectorAll<HTMLElement>('[data-card-id]');

    cardEls.forEach((el) => {
      const id = el.getAttribute('data-card-id');
      if (!id) return;

      const newRect = el.getBoundingClientRect();
      currentPositions.set(id, newRect);

      const oldRect = prevPositions.get(id);
      if (oldRect) {
        const deltaX = oldRect.left - newRect.left;
        const deltaY = oldRect.top - newRect.top;
        const distance = Math.hypot(deltaX, deltaY);

        if (distance > 1 && typeof el.animate === 'function') {
          const parentPile = el.closest<HTMLElement>('.freecell-col, .solitaire-pile-container');
          if (parentPile) parentPile.style.zIndex = '50';

          const animation = el.animate(
            [
              { transform: `translate3d(${deltaX}px, ${deltaY}px, 0)` },
              { transform: 'translate3d(0, 0, 0)' },
            ],
            {
              duration: 190,
              easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
              fill: 'none',
            }
          );

          animation.onfinish = () => {
            if (parentPile) parentPile.style.zIndex = '';
          };
        }
      }
    });

    prevPositionsRef.current = currentPositions;
  }, [state]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div
      ref={boardRef}
      className="flex flex-col items-center w-full select-none"
      style={
        {
          '--fc-step-mobile': '20px',
          '--fc-step-desktop': '28px',
        } as React.CSSProperties
      }
    >
      {/* Top Game Bar */}
      <div className="w-full max-w-5xl flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4 px-1">
        {/* Game Number & Stats */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsGameSelectOpen(true)}
            className="flex items-center gap-1 px-2.5 py-1 bg-violet-950/70 hover:bg-violet-900 border border-violet-700/60 rounded-lg text-violet-200 text-xs sm:text-sm font-black shadow-sm transition-colors"
            title={t('fcSelectGameTooltip')}
          >
            <Hash className="w-3.5 h-3.5 text-violet-400" />
            <span>#{state.gameNumber}</span>
          </button>

          <div className="flex items-center gap-2 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-800 text-xs sm:text-sm font-mono text-slate-300">
            <span>
              {t('moves')}: <b className="text-white font-bold">{state.moves}</b>
            </span>
            <span className="text-slate-600">|</span>
            <span>
              ⏱️ <b className="text-white font-bold">{formatTime(state.timeSeconds)}</b>
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={handleAutoHome}
            className="flex items-center gap-1 px-2.5 py-1 bg-amber-600/80 hover:bg-amber-500 text-white rounded-lg text-xs sm:text-sm font-bold shadow-sm transition-colors"
            title={t('fcAutoHomeTooltip')}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('fcAutoHome')}</span>
          </button>

          <button
            onClick={handleUndo}
            disabled={history.length === 0}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs sm:text-sm font-bold shadow-sm transition-colors ${
              history.length === 0
                ? 'bg-slate-800/40 text-slate-600 border border-slate-800 cursor-not-allowed'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
            title={t('undo')}
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('undo')}</span>
          </button>

          <button
            onClick={handleRestartGame}
            className="p-1.5 sm:px-2.5 sm:py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs sm:text-sm font-bold shadow-sm transition-colors"
            title={t('restart')}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t('restart')}</span>
          </button>

          <button
            onClick={() => handleNewGame()}
            className="flex items-center gap-1 px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs sm:text-sm font-bold shadow-md transition-colors"
            title={t('newGame')}
          >
            <Play className="w-3.5 h-3.5" />
            <span>{t('newGame')}</span>
          </button>

          <button
            onClick={toggleSound}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
            title={t('sound')}
          >
            {soundMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {onOpenStats && (
            <button
              onClick={onOpenStats}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 rounded-lg border border-slate-700 transition-colors"
              title={t('stats')}
            >
              <Trophy className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Board Surface */}
      <div className="w-full max-w-5xl flex flex-col gap-4 sm:gap-6 bg-slate-950/40 p-2 sm:p-4 md:p-6 rounded-2xl border border-slate-800/80 shadow-2xl backdrop-blur-sm">
        {/* Top Area: 4 Free Cells (Left) and 4 Foundations (Right) */}
        <div className="w-full flex justify-between items-center gap-2 sm:gap-6">
          {/* 4 Free Cells */}
          <div className="flex gap-1 sm:gap-2 md:gap-3">
            {state.freeCells.map((cellCard, idx) => {
              const isSelected =
                selectedCardInfo?.pileType === 'freecell' && selectedCardInfo.pileIndex === idx;

              return (
                <div key={`freecell-${idx}`} className="relative">
                  <SolitairePile
                    type="freecell"
                    isEmpty={cellCard === null}
                    onClick={() => {
                      if (cellCard) {
                        handleCardClick('freecell', idx, 0, cellCard);
                      } else {
                        handleEmptyPileClick('freecell', idx);
                      }
                    }}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'freecell', idx)}
                  >
                    {cellCard ? (
                      <div data-card-id={cellCard.id} className="w-full h-full">
                        <SolitaireCard
                          card={cellCard}
                          isSelected={isSelected}
                          onClick={() => handleCardClick('freecell', idx, 0, cellCard)}
                          onDragStart={(e) => handleDragStart(e, 'freecell', idx, 0)}
                        />
                      </div>
                    ) : (
                      <span className="text-[10px] sm:text-xs text-white/30 font-bold uppercase tracking-wider select-none">
                        F{idx + 1}
                      </span>
                    )}
                  </SolitairePile>
                </div>
              );
            })}
          </div>

          {/* 4 Foundations */}
          <div className="flex gap-1 sm:gap-2 md:gap-3">
            {state.foundations.map((foundationPile, idx) => {
              const topCard =
                foundationPile.length > 0
                  ? foundationPile[foundationPile.length - 1]
                  : null;

              return (
                <div key={`foundation-${idx}`} className="relative">
                  <SolitairePile
                    type="foundation"
                    suit={FOUNDATION_SUITS[idx]}
                    isEmpty={foundationPile.length === 0}
                    onClick={() => handleEmptyPileClick('foundation', idx)}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, 'foundation', idx)}
                  >
                    {topCard && (
                      <div data-card-id={topCard.id} className="w-full h-full">
                        <SolitaireCard card={topCard} />
                      </div>
                    )}
                  </SolitairePile>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom Area: 8 Tableau Cascades */}
        <div className="grid grid-cols-8 gap-1 sm:gap-2 md:gap-3 w-full min-h-[380px] sm:min-h-[500px]">
          {state.cascades.map((column, colIdx) => (
            <div
              key={`cascade-${colIdx}`}
              className="freecell-col relative min-h-[340px] sm:min-h-[460px] flex flex-col items-center"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, 'cascade', colIdx)}
              onClick={(e) => {
                if (column.length === 0 && e.target === e.currentTarget) {
                  handleEmptyPileClick('cascade', colIdx);
                }
              }}
            >
              {/* Empty Column Indicator */}
              {column.length === 0 && (
                <div
                  onClick={() => handleEmptyPileClick('cascade', colIdx)}
                  className="w-11 h-16 sm:w-16 sm:h-24 md:w-20 md:h-28 rounded-md sm:rounded-lg border-2 border-dashed border-white/20 bg-black/10 flex items-center justify-center cursor-pointer hover:border-white/35 transition-colors"
                >
                  <span className="text-white/20 text-xs font-bold font-mono">↓</span>
                </div>
              )}

              {/* Stacked Cards in Cascade */}
              {column.map((card, cardIdx) => {
                const isSelected =
                  selectedCardInfo?.pileType === 'cascade' &&
                  selectedCardInfo.pileIndex === colIdx &&
                  selectedCardInfo.cardIndex <= cardIdx;

                return (
                  <div
                    key={card.id}
                    data-card-id={card.id}
                    className="absolute"
                    style={{
                      top: `calc(${cardIdx} * var(--fc-step-mobile))`,
                      zIndex: cardIdx + 1,
                    }}
                  >
                    <SolitaireCard
                      card={card}
                      isSelected={isSelected}
                      onClick={() => handleCardClick('cascade', colIdx, cardIdx, card)}
                      onDragStart={(e) => handleDragStart(e, 'cascade', colIdx, cardIdx)}
                    />
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Select Game Number Modal */}
      {isGameSelectOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-sm w-full p-5 shadow-2xl flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-violet-400" />
                <h3 className="font-bold text-white text-base">{t('fcSelectGameTitle')}</h3>
              </div>
              <button
                onClick={() => setIsGameSelectOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              {t('fcSelectGameDesc')}
            </p>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const num = parseInt(customGameNumInput, 10);
                if (!isNaN(num) && num >= 1 && num <= 1000000) {
                  handleNewGame(num);
                }
              }}
              className="flex flex-col gap-3"
            >
              <input
                type="number"
                min="1"
                max="1000000"
                placeholder={t('fcGameNumPlaceholder')}
                value={customGameNumInput}
                onChange={(e) => setCustomGameNumInput(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-white font-mono text-center text-lg focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                autoFocus
              />

              <div className="flex items-center justify-between gap-1 text-[11px] text-slate-400">
                <span>{t('fcFamousDeals')}:</span>
                <div className="flex gap-1.5">
                  {[1, 617, 11982].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => handleNewGame(num)}
                      className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-violet-300 rounded border border-slate-700 font-mono transition-colors"
                    >
                      #{num}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setIsGameSelectOpen(false)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-xs transition-colors"
                >
                  {t('cancel')}
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-xl font-bold text-xs transition-colors shadow-md shadow-violet-900/40"
                >
                  {t('start')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Win Cascade Animation */}
      {state.isWon && <WinAnimation cards={state.foundations} />}
    </div>
  );
};
