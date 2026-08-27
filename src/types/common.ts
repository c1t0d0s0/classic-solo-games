export type GameType = 'hub' | 'solitaire' | 'minesweeper' | 'shanghai';

export type AppTheme = 'classic' | 'felt' | 'dark' | 'retro-win';

export interface GameStats {
  played: number;
  won: number;
  bestTime: number | null; // in seconds
  currentStreak: number;
  bestStreak: number;
}

export interface AllStats {
  solitaire_draw1: GameStats;
  solitaire_draw3: GameStats;
  minesweeper_easy: GameStats;
  minesweeper_medium: GameStats;
  minesweeper_hard: GameStats;
  shanghai_turtle: GameStats;
  shanghai_fortress: GameStats;
  shanghai_canyon: GameStats;
  shanghai_spider: GameStats;
  shanghai_dragon: GameStats;
}

export interface UserSettings {
  soundEnabled: boolean;
  theme: AppTheme;
  language: 'auto' | 'ja' | 'en';
  solitaireDrawMode: 1 | 3;
  solitaireAutoMove: boolean;
  minesweeperQuickFlag: boolean;
  minesweeperLongPressMs: number;
  shanghaiAutoHint: boolean;
}
