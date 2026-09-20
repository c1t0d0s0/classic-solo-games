# Classic Solo Games 🎮

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Passed-success.svg)](https://vitest.dev/)

A modern, responsive web portal for timeless single-player games. Play entirely in your browser with no installation needed and 100% free of charge.

---

## 🌟 Included Games (6 Games)

Easily switch between games anytime from the navigation header or the home hub in the following order:

```
[Home Hub] → 1. Solitaire → 2. FreeCell → 3. Minesweeper → 4. Shanghai → 5. Sokoban → 6. Sudoku
```

---

### 1. ♠️ Klondike Solitaire
*The timeless classic card game*
- **Classic Rules**: 7 tableau columns, 4 foundation piles (Ace to King by suit), stock and waste piles with alternating red/black descending build rules.
- **100% Solvable Deals**: Proprietary simulation algorithm guarantees every deal can be won.
- **1-Card / 3-Card Draw**: Switch draw mode seamlessly at any point during gameplay.
- **Intuitive Controls**:
  - Desktop: Drag-and-drop or double-click to quickly send cards to foundation piles.
  - Mobile: Tap-to-move auto-assist (moves cards directly to the best available slot with a single tap).
- **Auto-Complete**: One-tap auto-finish button when all face-down cards are revealed.
- **Celebration**: Smooth 60fps card-bouncing waterfall animation and victory confetti.
- **Unlimited Undo** and live move, timer, and score tracking.

---

### 2. 🃏 FreeCell
*Skill and strategy card game with 100% open information*
- **Faithful Implementation**: All 52 cards are dealt face-up across 8 cascade columns. Utilize 4 free cells and 4 foundation piles to sort suits from Ace to King.
- **Authentic Game Numbers**: Built-in Microsoft Linear Congruential Generator (MS-LCG) replicating classic **Deals #1 to #32000**.
- **Supermoves**: Automatically calculates maximum movable sequence based on available free cells and empty cascade columns for seamless multi-card transfers.
- **Player Assists**:
  - Tap-to-move auto-routing to free cells, foundations, or cascades.
  - Auto-home button to quickly send guaranteed safe cards to foundations.
- **Unlimited Undo**, moves counter, and timer.

---

### 3. 💣 Minesweeper
*Classic deductive reasoning puzzle*
- **3 Difficulty Levels**:
  - Beginner (9×9, 10 mines)
  - Intermediate (16×16, 40 mines)
  - Expert (30×16, 99 mines)
- **100% Safe First Click**: The first clicked tile and its 8 adjacent neighbors are always mine-free, launching an immediate cascade opening.
- **Mobile Friendly**: Quick mode toggle button (`[💣 Open / 🚩 Flag]`), long-press to flag, and zoom/scroll controls for large boards.
- **Authentic Experience**: 7-segment LED counters, interactive classic smiley button (🙂/😮/😎/😵), and chord opening (double-click/both mouse buttons on revealed numbers).

---

### 4. 🀄 Shanghai (Mahjong Solitaire)
*Traditional tile-matching solitaire puzzle*
- **Authentic Japanese Mahjong Tiles**: 144 tiles consisting of standard Japanese suits (Characters 1-9萬, Dots 1-9筒, Bamboo 1-9索, Winds 東南西北, and Dragons 白發中).
- **Realistic 3D Engraving**: Intricate 1-Pin rosette flower, 1-Sou peacock, blank ivory Haku, jade-green melamine backing, and layered drop shadows.
- **5 Classic Layouts**:
  - Turtle (Traditional pyramid)
  - Fortress
  - Canyon
  - Spider
  - Dragon
- **Guaranteed Solvable**: Reverse-generation algorithm ensures every generated board can be completely cleared without deadlocks.
- **Assistance Tools**:
  - Hint: Highlights available matching pairs with a glowing pulse.
  - Shuffle: Re-arranges remaining tiles when stuck (up to 3 times per game).
  - Undo: Reverts the last matched pair.

---

### 5. 📦 Sokoban
*The classic warehouse box-pushing puzzle*
- **25 Handcrafted Stages**: Progressively challenging levels from beginner tutorials to master puzzles.
- **AI Solver Engine (Push-BFS)**:
  - **Hint System**: Calculates the optimal path and indicates the next move with an on-screen arrow and guidance.
  - **Auto-Play**: Watch the AI solve the level step-by-step in real-time.
- **Deadlock Detection**: Real-time detection of corner and wall deadlocks with instant warning notifications.
- **Controls**:
  - Keyboard: Arrow keys, WASD, U (undo), R (reset), H (hint).
  - Mobile: On-screen responsive virtual D-pad.
- **Animated Expressive Character**: Dynamic facial expressions (`•_•`, `>_<`, `o_o`, `^o^`, `^▽^`) that react to player actions.
- **Stage Selection**: Complete stage browser with clear badges and progress tracking.

---

### 6. 🔢 Sudoku
*The ultimate number-placement logic puzzle*
- **4 Difficulty Levels**:
  - Easy (~42 clues)
  - Medium (~32 clues)
  - Hard (~28 clues)
  - Expert (~24 clues)
- **Guaranteed Unique Solutions**: MRV (Minimum Remaining Values) backtracking solver verifies exactly one unique solution for every generated puzzle.
- **Pencil Notes Mode**: 3×3 sub-grid inside each cell for tracking candidate numbers 1 through 9.
- **Auto-Clear Notes**: Automatically removes placed numbers from candidate notes in the same row, column, and 3×3 block (toggleable in settings).
- **Smart Highlighting**:
  - Highlights selected cell, associated row, column, and 3×3 block.
  - Same-digit highlighting across the entire board.
  - Duplicate conflict detection in red.
- **Input Keypad**: Number pad 1-9 with remaining count badges that update in real time.
- **Player Assists**: Hint button (reveals next logical cell), Pause/Resume, Unlimited Undo, Erase.

---

## 🛠️ Platform & UI Highlights

- **🌐 Full Internationalization (i18n)**: Seamless English and Japanese localization with automatic browser detection and manual toggle.
- **📱 Fully Responsive**: Optimized layouts and touch interactions for mobile phones, tablets, and widescreen desktop monitors.
- **🔊 Web Audio API Sound Synthesizer**: Rich sound effects (card flips, stone clacks, mine clicks, box pushes, explosions, victory fanfares) synthesized programmatically with zero external audio assets.
- **📊 Local Statistics**: Automatically tracks games played, wins, win rate (%), best times, and win streaks saved to `localStorage`.
- **🎨 Theme Customizer**: Choose between Classic Felt Green, Deep Forest, Dark Slate, and Retro 90s.
- **⛶ Fullscreen Mode**: Distraction-free full-screen gameplay.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Installation & Run

```bash
# 1. Clone or navigate to the repository
cd classic-solo-games

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

# 4. Open in browser (typically http://localhost:3000)
```

### Production Build

```bash
npm run build
npm run preview
```

### Running Tests

Runs all 7 test suites (37 test cases) using Vitest:

```bash
npm test
```

---

## 📁 Project Structure

```
classic-solo-games/
├── README.md                 # English documentation
├── README.ja.md              # Japanese documentation
├── index.html                # HTML entry point (with GTM script)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── public/
│   ├── config.js             # Runtime configuration (GTM ID)
│   ├── favicon.svg
│   └── vite.svg
├── src/
│   ├── main.tsx
│   ├── App.tsx               # App routing and game switching
│   ├── index.css             # Tailwind CSS v4 styling
│   ├── audio/
│   │   └── soundEffects.ts   # Web Audio synthesizer engine
│   ├── i18n/
│   │   ├── LanguageContext.tsx
│   │   └── translations.ts   # JA/EN localization strings
│   ├── types/
│   │   ├── common.ts         # Common types (GameType, AllStats, UserSettings)
│   │   ├── solitaire.ts      # Solitaire types
│   │   ├── freecell.ts       # FreeCell types
│   │   ├── minesweeper.ts    # Minesweeper types
│   │   ├── shanghai.ts       # Shanghai types
│   │   ├── sokoban.ts        # Sokoban types
│   │   └── sudoku.ts         # Sudoku types
│   ├── utils/
│   │   ├── storage.ts        # LocalStorage stats & settings
│   │   └── confetti.ts       # Confetti particle animations
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx        # Navigation & controls
│   │   │   ├── GameHub.tsx       # Home portal screen
│   │   │   ├── StatsModal.tsx    # Comprehensive statistics modal
│   │   │   └── SettingsModal.tsx # Settings modal
│   │   ├── solitaire/
│   │   │   ├── SolitaireGame.tsx
│   │   │   ├── SolitaireCard.tsx
│   │   │   ├── SolitairePile.tsx
│   │   │   ├── solitaireLogic.ts
│   │   │   ├── solitaireSolver.ts
│   │   │   └── WinAnimation.tsx  # Bouncing card waterfall effect
│   │   ├── freecell/
│   │   │   ├── FreeCellGame.tsx
│   │   │   ├── freecellLogic.ts
│   │   │   └── freecellRNG.ts    # Microsoft FreeCell RNG (#1-#32000)
│   │   ├── minesweeper/
│   │   │   ├── MinesweeperGame.tsx
│   │   │   ├── MineCell.tsx
│   │   │   ├── MineHeader.tsx
│   │   │   └── minesweeperLogic.ts
│   │   ├── shanghai/
│   │   │   ├── ShanghaiGame.tsx
│   │   │   ├── MahjongTile.tsx   # 3D tile component
│   │   │   ├── MahjongTileArt.tsx
│   │   │   ├── shanghaiLayouts.ts
│   │   │   ├── shanghaiLogic.ts
│   │   │   └── shanghaiSolver.ts # Solvable board generator
│   │   ├── sokoban/
│   │   │   ├── SokobanGame.tsx   # Interactive board, D-pad, solver
│   │   │   ├── sokobanLevels.ts  # 25 original levels
│   │   │   ├── sokobanLogic.ts
│   │   │   └── sokobanSolver.ts  # Push-BFS solver & deadlock detector
│   │   └── sudoku/
│   │       ├── SudokuGame.tsx    # 9x9 grid, keypad, notes mode
│   │       └── sudokuLogic.ts    # MRV solver & unique puzzle generator
│   └── tests/
│       ├── solitaire.test.ts
│       ├── freecell.test.ts
│       ├── minesweeper.test.ts
│       ├── shanghai.test.ts
│       ├── sokoban.test.ts
│       ├── sudoku.test.ts
│       └── i18n.test.ts
```

---

## 📄 License

MIT License. Free to use, modify, and distribute.
