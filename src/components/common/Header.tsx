import React from 'react';
import { GameType } from '../../types/common';
import { Home, Trophy, Settings, Maximize2, Minimize2 } from 'lucide-react';
import { sounds } from '../../audio/soundEffects';

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
    { id: 'hub', label: 'ホーム', icon: '🏠' },
    { id: 'solitaire', label: 'ソリティア', icon: '♠' },
    { id: 'minesweeper', label: 'マインスイーパー', icon: '💣' },
    { id: 'shanghai', label: '上海', icon: '🀄' },
  ];

  return (
    <header className="w-full bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-40 px-3 py-2 sm:px-6 flex items-center justify-between shadow-md">
      {/* Brand / Logo */}
      <div
        onClick={() => {
          sounds.playClick();
          onSelectGame('hub');
        }}
        className="flex items-center gap-2 cursor-pointer group"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-sm shadow-md group-hover:scale-105 transition-transform">
          CS
        </div>
        <span className="font-extrabold text-sm sm:text-base md:text-lg bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent hidden xs:inline">
          クラシック・ソロ
        </span>
      </div>

      {/* Navigation Game Tabs */}
      <nav className="flex items-center gap-1 sm:gap-1.5 bg-slate-950/60 p-1 rounded-xl border border-slate-800">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => {
              sounds.playClick();
              onSelectGame(item.id);
            }}
            className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all ${
              activeGame === item.id
                ? 'bg-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            {item.id === 'hub' ? (
              <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            ) : (
              <span className="text-sm">{item.icon}</span>
            )}
            <span className={item.id === 'hub' ? 'hidden sm:inline' : ''}>{item.label}</span>
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
          title="戦績・統計"
        >
          <Trophy className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            sounds.playClick();
            onOpenSettings();
          }}
          className="p-1.5 sm:p-2 text-slate-300 hover:text-indigo-400 bg-slate-800 hover:bg-slate-700/80 rounded-lg border border-slate-700 transition-colors"
          title="設定"
        >
          <Settings className="w-4 h-4" />
        </button>

        <button
          onClick={toggleFullscreen}
          className="p-1.5 sm:p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700/80 rounded-lg border border-slate-700 transition-colors hidden sm:flex"
          title={isFullscreen ? '全画面解除' : '全画面表示'}
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>
    </header>
  );
};
