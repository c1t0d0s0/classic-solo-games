import React from 'react';
import { GameType } from '../../types/common';
import { Home, Trophy, Settings, Maximize2, Minimize2 } from 'lucide-react';
import { sounds } from '../../audio/soundEffects';
import { useTranslation } from '../../i18n/LanguageContext';

interface HeaderProps {
  activeGame: GameType;
  onSelectGame: (game: GameType) => void;
  onOpenStats: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeGame,
  onSelectGame,
  onOpenStats,
  onOpenSettings,
}) => {
  const [isFullscreen, setIsFullscreen] = React.useState<boolean>(false);
  const { t } = useTranslation();

  const toggleFullscreen = () => {
    sounds.playClick();
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
      }
    }
  };

  const navItems: { id: GameType; label: string; icon: string }[] = [
    { id: 'hub', label: t('navHome'), icon: '🏠' },
    { id: 'solitaire', label: t('navSolitaire'), icon: '♠' },
    { id: 'freecell', label: t('navFreecell'), icon: '🃏' },
    { id: 'minesweeper', label: t('navMinesweeper'), icon: '💣' },
    { id: 'shanghai', label: t('navShanghai'), icon: '🀄' },
    { id: 'sokoban', label: t('navSokoban'), icon: '📦' },
    { id: 'sudoku', label: t('navSudoku'), icon: '🔢' },
  ];

  return (
    <header className="w-full bg-slate-900/95 backdrop-blur border-b border-slate-800 sticky top-0 z-40 shadow-md">
      {/* Main Top Bar */}
      <div className="w-full px-3 py-2 sm:px-6 flex items-center justify-between">
        {/* Brand / Logo */}
        <div
          onClick={() => {
            sounds.playClick();
            onSelectGame('hub');
          }}
          className="flex items-center gap-2 cursor-pointer group select-none"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-md group-hover:scale-105 transition-transform">
            CS
          </div>
          <span className="font-extrabold text-sm sm:text-base md:text-lg bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
            {t('appName')}
          </span>
        </div>

        {/* Desktop Navigation Game Tabs (hidden on mobile, visible on sm+) */}
        <nav className="hidden sm:flex items-center gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                sounds.playClick();
                onSelectGame(item.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold whitespace-nowrap transition-all ${
                activeGame === item.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/40'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              {item.id === 'hub' ? (
                <Home className="w-4 h-4" />
              ) : (
                <span className="text-sm">{item.icon}</span>
              )}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Global Utilities */}
        <div className="flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => {
              sounds.playClick();
              onOpenStats();
            }}
            className="p-1.5 sm:p-2 text-slate-300 hover:text-amber-400 bg-slate-800 hover:bg-slate-700/80 rounded-lg border border-slate-700 transition-colors"
            title={t('stats')}
          >
            <Trophy className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              sounds.playClick();
              onOpenSettings();
            }}
            className="p-1.5 sm:p-2 text-slate-300 hover:text-indigo-400 bg-slate-800 hover:bg-slate-700/80 rounded-lg border border-slate-700 transition-colors"
            title={t('settings')}
          >
            <Settings className="w-4 h-4" />
          </button>

          <button
            onClick={toggleFullscreen}
            className="p-1.5 sm:p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-lg border border-slate-700 transition-colors hidden sm:flex"
            title={isFullscreen ? t('exitFullscreen') : t('fullscreen')}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Row (visible on mobile < sm, hidden on sm+) */}
      <div className="sm:hidden px-1.5 pb-2 pt-0.5 w-full">
        <nav className="flex items-center gap-1 overflow-x-auto p-1 rounded-xl bg-slate-950/70 border border-slate-800/80 shadow-inner [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                sounds.playClick();
                onSelectGame(item.id);
              }}
              className={`flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition-all active:scale-95 ${
                activeGame === item.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/50'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
              }`}
            >
              {item.id === 'hub' ? (
                <Home className="w-3.5 h-3.5 shrink-0" />
              ) : (
                <span className="text-xs shrink-0">{item.icon}</span>
              )}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
};
