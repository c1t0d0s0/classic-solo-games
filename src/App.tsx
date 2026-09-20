import { useState, useEffect } from 'react';
import { GameType, UserSettings, AllStats } from './types/common';
import { loadSettings, loadStats, saveSettings } from './utils/storage';
import { sounds } from './audio/soundEffects';
import { Header } from './components/common/Header';
import { GameHub } from './components/common/GameHub';
import { SolitaireGame } from './components/solitaire/SolitaireGame';
import { MinesweeperGame } from './components/minesweeper/MinesweeperGame';
import { ShanghaiGame } from './components/shanghai/ShanghaiGame';
import { FreeCellGame } from './components/freecell/FreeCellGame';
import { SokobanGame } from './components/sokoban/SokobanGame';
import { SudokuGame } from './components/sudoku/SudokuGame';
import { StatsModal } from './components/common/StatsModal';
import { SettingsModal } from './components/common/SettingsModal';
import { LanguageProvider } from './i18n/LanguageContext';

export function App() {
  const [activeGame, setActiveGame] = useState<GameType>('hub');
  const [stats, setStats] = useState<AllStats>(() => loadStats());
  const [settings, setSettings] = useState<UserSettings>(() => loadSettings());
  const [isStatsOpen, setIsStatsOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Apply sound setting on initial load
  useEffect(() => {
    sounds.setMuted(!settings.soundEnabled);
  }, [settings.soundEnabled]);

  const handleUpdateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const handleOpenStats = () => {
    setStats(loadStats()); // Refresh latest stats
    setIsStatsOpen(true);
  };

  // Theme styling
  const getThemeBackground = () => {
    switch (settings.theme) {
      case 'felt':
        return 'bg-gradient-to-b from-teal-950 via-emerald-950 to-slate-950 text-slate-100';
      case 'dark':
        return 'bg-slate-950 text-slate-100';
      case 'retro-win':
        return 'bg-slate-800 text-slate-100';
      case 'classic':
      default:
        return 'bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100';
    }
  };

  return (
    <LanguageProvider settings={settings}>
      <div className={`min-h-screen flex flex-col ${getThemeBackground()} transition-colors duration-300`}>
        {/* Top Navigation */}
        <Header
          activeGame={activeGame}
          onSelectGame={setActiveGame}
          onOpenStats={handleOpenStats}
          onOpenSettings={() => setIsSettingsOpen(true)}
        />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col items-center justify-start p-3 sm:p-6 w-full max-w-7xl mx-auto">
          {activeGame === 'hub' && (
            <GameHub stats={stats} onSelectGame={setActiveGame} />
          )}

          {activeGame === 'solitaire' && (
            <SolitaireGame
              drawMode={settings.solitaireDrawMode}
              onOpenStats={handleOpenStats}
            />
          )}

          {activeGame === 'minesweeper' && (
            <MinesweeperGame onOpenStats={handleOpenStats} />
          )}

          {activeGame === 'shanghai' && (
            <ShanghaiGame onOpenStats={handleOpenStats} />
          )}

          {activeGame === 'freecell' && (
            <FreeCellGame onOpenStats={handleOpenStats} />
          )}

          {activeGame === 'sokoban' && (
            <SokobanGame onOpenStats={handleOpenStats} />
          )}

          {activeGame === 'sudoku' && (
            <SudokuGame
              onOpenStats={handleOpenStats}
              highlightDuplicates={settings.sudokuHighlightDuplicates}
              autoClearNotes={settings.sudokuAutoClearNotes}
            />
          )}
        </main>

        {/* Modals */}
        <StatsModal
          isOpen={isStatsOpen}
          onClose={() => setIsStatsOpen(false)}
          stats={stats}
        />

        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          settings={settings}
          onUpdateSettings={handleUpdateSettings}
        />
      </div>
    </LanguageProvider>
  );
}

export default App;
