# クラシック・ソロゲームズ (Classic Solo Games) 🎮

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Passed-success.svg)](https://vitest.dev/)

PCとスマートフォンのどちらでも快適にプレイできる、古典的な一人遊び用ゲームポータルです。
**ソリティア（クロンダイク）**、**マインスイーパー**、**上海（麻雀ソリティア）** を高品質なUI・効果音・独自アルゴリズムとともに収録しています。

---

## 🌟 収録ゲームと主な機能

### 1. ♠️ クロンダイク・ソリティア (Klondike Solitaire)
- **王道ルール**: 7列の場札、4つの組札（AからKの昇順）、山札。赤黒交互・降順の移動ルールを完全再現。
- **直感的な操作性**:
  - **PC**: マウスによるドラッグ＆ドロップ、ダブルクリックで組札へ即時移動。
  - **スマートフォン**: タップするだけで最適な組札または場札へ自動移動（Tap-to-move アシスト）。
- **めくり枚数切り替え**: 1枚めくり / 3枚めくりをゲーム中にいつでも変更可能。
- **自動完成（オートコンプリート）**: すべての裏向きカードが開いた時点で、1タップで全札を自動回収。
- **勝利演出**: クラシックなカードの放物線バウンド・ウォーターフォール描画（Canvas 60fps）＆紙吹雪。
- **無制限Undo**、手数・経過時間・スコアのリアルタイム表示。

### 2. 💣 マインスイーパー (Minesweeper)
- **3つの難易度**:
  - 初級 (9×9 / 地雷10個)
  - 中級 (16×16 / 地雷40個)
  - 上級 (30×16 / 地雷99個)
- **初手安全保証**: 最初にクリック・タップしたマスとその周囲8マスには絶対に地雷が配置されず、爽快な0マス連鎖オープンからスタートできます。
- **スマートフォン最適化**: 「💣 開く / 🚩 旗」モード切り替えボタン、長押し旗立て、上級盤面用の拡大・縮小（ズーム）＆スムーズスクロール。
- **レトロな演出**: 7セグメントLED風カウンター、クラシックな表情ボタン（🙂/😮/😎/😵）、コードオープン（両クリック一括展開）対応。

### 3. 🀄 上海 / 麻雀ソリティア (Mahjong Solitaire)
- **伝統の144牌**: 萬子・筒子・索子・風牌・三元牌・花牌・季節牌を用いたクラシック「亀（タートル）」ピラミッド配置。
- **100%解ける盤面生成（Solvable Board Generator）**: 逆シミュレーションアルゴリズムにより、途中で手詰まりにならない合法な牌配置を自動生成。
- **3D立体視覚アシスト**: 段数に応じたドロップシャドウと、選択できないブロック牌のトーンダウン表示。
- **サポート機能**:
  - **ヒント**: 現在消去可能なペアを水色にパルス発光。
  - **再配置（シャッフル）**: 手詰まり時や気分転換に残りの牌をシャッフル（1ゲーム中3回まで）。
  - **Undo**: 直前に消したペアを復元。
- **花牌・季節牌ルール**: 春夏秋冬（季節牌同士）、梅蘭菊竹（花牌同士）は絵柄が異なっていてもマッチ可能。

---

## 🛠️ ポータル共通機能 & こだわり

- **📱 完全レスポンシブ**: PCの大画面はもちろん、スマートフォンの縦画面・横画面どちらでも崩れず快適に操作可能。
- **🔊 Web Audio API 合成音源**: 外部の音声ファイルを使用せず、ブラウザのWeb Audio APIでカードめくり音、牌の衝突音、爆発音、ファンファーレをリアルタイム生成（通信量ゼロ・遅延ゼロ）。
- **📊 戦績・統計管理**: 各ゲーム・難易度ごとのプレイ回数、勝利数、勝率、ベストタイム、現在の連勝・最高連勝記録を `localStorage` に自動保存。
- **🎨 テーマ切り替え**: クラシック・フェルト / ディープ・フォレスト / ダーク・スレート / レトロ・90s の4種類から選択可能。
- **⛶ 全画面表示対応**: 没入感のあるフルスクリーンプレイ。

---

## 🚀 開発環境のセットアップと実行

### 必要条件
- Node.js (v18以上推奨)
- npm

### インストールと起動

```bash
# 1. リポジトリディレクトリに移動
cd classic-solo-games

# 2. 依存パッケージのインストール
npm install

# 3. 開発サーバーの起動
npm run dev

# 4. ブラウザでアクセス（通常 http://localhost:3000）
```

### プロダクションビルド

```bash
npm run build
npm run preview
```

### テスト実行 (Vitest)

```bash
npm run test
```

---

## 📁 ディレクトリ構成

```
classic-solo-games/
├── README.md                 # 英語版ドキュメント
├── README.ja.md              # 日本語版ドキュメント
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── audio/
│   │   └── soundEffects.ts       # Web Audio API シンセサイザー
│   ├── types/
│   │   ├── common.ts
│   │   ├── solitaire.ts
│   │   ├── minesweeper.ts
│   │   └── shanghai.ts
│   ├── utils/
│   │   ├── storage.ts            # ローカルストレージ統計・設定
│   │   └── confetti.ts           # 勝利時の紙吹雪演出
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx        # ヘッダーナビゲーション
│   │   │   ├── GameHub.tsx       # ポータルトップ画面
│   │   │   ├── StatsModal.tsx    # 統計モーダル
│   │   │   └── SettingsModal.tsx # 設定モーダル
│   │   ├── solitaire/
│   │   │   ├── SolitaireGame.tsx
│   │   │   ├── SolitaireCard.tsx
│   │   │   ├── SolitairePile.tsx
│   │   │   ├── solitaireLogic.ts
│   │   │   └── WinAnimation.tsx  # カード跳ね返りアニメーション
│   │   ├── minesweeper/
│   │   │   ├── MinesweeperGame.tsx
│   │   │   ├── MineCell.tsx
│   │   │   ├── MineHeader.tsx
│   │   │   └── minesweeperLogic.ts
│   │   └── shanghai/
│   │       ├── ShanghaiGame.tsx
│   │       ├── MahjongTile.tsx   # 3D牌コンポーネント
│   │       ├── shanghaiLayouts.ts
│   │       ├── shanghaiLogic.ts
│   │       └── shanghaiSolver.ts # 解ける盤面生成器
│   └── tests/
│       ├── solitaire.test.ts
│       ├── minesweeper.test.ts
│       └── shanghai.test.ts
```

---

## 📄 ライセンス

MIT License
