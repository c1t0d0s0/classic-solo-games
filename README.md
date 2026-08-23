# Classic Solo Games 🎮

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Passed-success.svg)](https://vitest.dev/)

A modern, responsive web portal for classic single-player games: **Klondike Solitaire**, **Minesweeper**, and **Shanghai (Mahjong Solitaire)**. Designed for seamless play on both desktop PCs and mobile smartphones.

---

## 🌟 Included Games & Features

### 1. ♠️ Klondike Solitaire
- **Classic Rules**: 7 tableau columns, 4 foundation piles (Ace to King by suit), stock/waste piles.
- **Controls**:
  - **Desktop**: Drag-and-drop or double-click to send cards to foundation piles.
  - **Mobile**: Tap-to-move auto-assist (moves cards directly to the best available slot with a single tap).
- **1-Card / 3-Card Draw**: Switch draw mode anytime.
- **Auto-Complete**: One-tap auto-finish button when all face-down cards are revealed.
- **Celebration**: Smooth 60fps card-bouncing waterfall animation and victory confetti.
- **Unlimited Undo** and live move/time/score tracking.

### 2. 💣 Minesweeper
- **3 Difficulty Levels**:
  - Beginner (9×9, 10 mines)
  - Intermediate (16×16, 40 mines)
  - Expert (30×16, 99 mines)
- **100% Safe First Click**: The first clicked tile and its 8 neighboring cells are guaranteed to be mine-free, launching an instant cascading opening.
- **Mobile Friendly**: Mode toggle button (`[💣 Open / 🚩 Flag]`), long-press to flag, and zoom/scroll controls for large boards.
- **Retro Look & Feel**: 7-segment LED counters, classic interactive smiley button (🙂/😮/😎/😵), and double-click/chord opening support.

### 3. 🀄 Shanghai (Mahjong Solitaire)
- **Standard 144 Tiles**: Full set of Characters, Dots, Bamboo, Winds, Dragons, Flowers, and Seasons in the classic "Turtle" pyramid layout.
- **Guaranteed Solvable**: Custom reverse-generation algorithm guarantees every generated puzzle can be solved without dead ends.
- **3D Isometric Depth**: Layered elevation with shadows and visual dimming for blocked tiles.
- **Assistance Tools**:
  - **Hint**: Highlights an available matching pair with an animated pulse glow.
  - **Shuffle**: Re-arranges remaining tiles if you get stuck (up to 3 times per game).
  - **Undo**: Revert your last matched pair.

---

## 🛠️ Platform & UI Highlights

- **📱 Fully Responsive**: Optimized layouts and touch interactions for mobile phones, tablets, and widescreen desktop monitors.
- **🔊 Web Audio API Sound Synthesizer**: Rich sound effects (card flips, stone clacks, mine clicks, explosions, victory fanfares) synthesized programmatically with zero external audio assets.
- **📊 Local Statistics**: Automatically saves games played, wins, win rate (%), best times, and win streaks to `localStorage`.
- **🎨 Theme Customizer**: Choose between Classic Felt Green, Deep Forest, Dark Slate, and Retro 90s.
- **⛶ Fullscreen Mode**: Distraction-free full-screen gameplay.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or yarn

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

```bash
npm run test
```

---

## 📁 Project Structure

```
classic-solo-games/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── audio/
│   │   └── soundEffects.ts       # Web Audio synthesizer engine
│   ├── types/
│   │   ├── common.ts
│   │   ├── solitaire.ts
│   │   ├── minesweeper.ts
│   │   └── shanghai.ts
│   ├── utils/
│   │   ├── storage.ts            # LocalStorage stats & settings
│   │   └── confetti.ts           # Confetti animations
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx        # Navigation & controls
│   │   │   ├── GameHub.tsx       # Home portal screen
│   │   │   ├── StatsModal.tsx    # Statistics modal
│   │   │   └── SettingsModal.tsx # Settings modal
│   │   ├── solitaire/
│   │   │   ├── SolitaireGame.tsx
│   │   │   ├── SolitaireCard.tsx
│   │   │   ├── SolitairePile.tsx
│   │   │   ├── solitaireLogic.ts
│   │   │   └── WinAnimation.tsx
│   │   ├── minesweeper/
│   │   │   ├── MinesweeperGame.tsx
│   │   │   ├── MineCell.tsx
│   │   │   ├── MineHeader.tsx
│   │   │   └── minesweeperLogic.ts
│   │   └── shanghai/
│   │       ├── ShanghaiGame.tsx
│   │       ├── MahjongTile.tsx
│   │       ├── shanghaiLayouts.ts
│   │       ├── shanghaiLogic.ts
│   │       └── shanghaiSolver.ts
│   └── tests/
│       ├── solitaire.test.ts
│       ├── minesweeper.test.ts
│       └── shanghai.test.ts
```

---

## 📄 License

MIT License. Free to use, modify, and distribute.
