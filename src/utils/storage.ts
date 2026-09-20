import { AllStats, GameStats, UserSettings } from '../types/common';

const STATS_STORAGE_KEY = 'classic_solo_games_stats_v1';
const SETTINGS_STORAGE_KEY = 'classic_solo_games_settings_v1';

const defaultGameStats = (): GameStats => ({
  played: 0,
  won: 0,
  bestTime: null,
  currentStreak: 0,
  bestStreak: 0,
});

const defaultAllStats: AllStats = {
  solitaire_draw1: defaultGameStats(),
  solitaire_draw3: defaultGameStats(),
  freecell: defaultGameStats(),
  minesweeper_easy: defaultGameStats(),
  minesweeper_medium: defaultGameStats(),
  minesweeper_hard: defaultGameStats(),
  shanghai_turtle: defaultGameStats(),
  shanghai_fortress: defaultGameStats(),
  shanghai_canyon: defaultGameStats(),
  shanghai_spider: defaultGameStats(),
  shanghai_dragon: defaultGameStats(),
  sokoban: defaultGameStats(),
  sudoku_easy: defaultGameStats(),
  sudoku_medium: defaultGameStats(),
  sudoku_hard: defaultGameStats(),
  sudoku_expert: defaultGameStats(),
};

const defaultSettings: UserSettings = {
  soundEnabled: true,
  theme: 'classic',
  language: 'auto',
  solitaireDrawMode: 1,
  solitaireAutoMove: true,
  minesweeperQuickFlag: false,
  minesweeperLongPressMs: 350,
  shanghaiAutoHint: false,
  freecellAutoMove: true,
  sokobanDpad: true,
  sudokuHighlightDuplicates: true,
  sudokuAutoClearNotes: true,
};

export const loadStats = (): AllStats => {
  try {
    const raw = localStorage.getItem(STATS_STORAGE_KEY);
    if (!raw) return defaultAllStats;
    const parsed = JSON.parse(raw);
    return { ...defaultAllStats, ...parsed };
  } catch {
    return defaultAllStats;
  }
};

export const saveGameResult = (
  gameKey: keyof AllStats,
  isWon: boolean,
  timeSeconds: number | null
): AllStats => {
  const current = loadStats();
  const target = { ...(current[gameKey] || defaultGameStats()) };

  target.played += 1;
  if (isWon) {
    target.won += 1;
    target.currentStreak += 1;
    if (target.currentStreak > target.bestStreak) {
      target.bestStreak = target.currentStreak;
    }
    if (timeSeconds !== null) {
      if (target.bestTime === null || timeSeconds < target.bestTime) {
        target.bestTime = timeSeconds;
      }
    }
  } else {
    target.currentStreak = 0;
  }

  const updated: AllStats = {
    ...current,
    [gameKey]: target,
  };

  try {
    localStorage.setItem(STATS_STORAGE_KEY, JSON.stringify(updated));
  } catch {}

  return updated;
};

export const loadSettings = (): UserSettings => {
  try {
    const raw = localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return defaultSettings;
    const parsed = JSON.parse(raw);
    return { ...defaultSettings, ...parsed };
  } catch {
    return defaultSettings;
  }
};

export const saveSettings = (settings: UserSettings): void => {
  try {
    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {}
};
