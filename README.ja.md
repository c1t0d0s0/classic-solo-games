# クラシック・ソロゲームズ (Classic Solo Games) 🎮

[![React](https://img.shields.io/badge/React-19-blue.svg)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8.svg)](https://tailwindcss.com/)
[![Vitest](https://img.shields.io/badge/Vitest-Passed-success.svg)](https://vitest.dev/)

PCとスマートフォンのどちらでも快適にプレイできる、永遠の名作一人遊びゲームをまとめたWebポータルです。
すべてブラウザ上で高速に動作し、インストールの必要なく完全無料で楽しめます。

---

## 🌟 収録ゲーム（全6種）

以下の順番でヘッダーやポータルからいつでも素早く切り替えてプレイできます。

```
[ホーム] → 1. ソリティア → 2. フリーセル → 3. マインスイーパー → 4. 上海 → 5. 倉庫番 → 6. 数独
```

---

### 1. ♠️ ソリティア (Klondike Solitaire)
*永遠の定番トランプ一人遊び*
- **王道ルール**: 7列の場札、4つの組札（AからKの昇順）、山札。赤黒交互・降順の移動ルールを完全再現。
- **100%クリア保証**: 独自のシミュレーションにより、必ず解くことができる配牌を生成。
- **1枚めくり / 3枚めくり**: ゲーム中いつでもめくり枚数を切り替え可能。
- **快適な操作性**:
  - PC: マウスによるドラッグ＆ドロップ、ダブルクリックで組札へ即時移動。
  - スマホ: カードをタップするだけで最適な場所へ自動移動（Tap-to-move）。
- **自動完成（オートコンプリート）**: すべての裏向きカードが開いた時点で、ワンタップで全札を自動回収。
- **勝利演出**: クラシックなカードの放物線バウンド・ウォーターフォール描画（Canvas 60fps）＆紙吹雪。
- **無制限Undo**、手数・経過時間・スコアのリアルタイム表示。

---

### 2. 🃏 フリーセル (FreeCell)
*運に頼らない、完全情報型の思考カードゲーム*
- **クラシック完全準拠**: 52枚のカードがすべて表向きで配られる完全公開情報。4つのフリーセルと4つの組札を活用してA〜Kを揃えます。
- **本格ゲーム番号指定**: Windows標準のMicrosoft FreeCellと同じ乱数生成アルゴリズム（MS-LCG）を搭載し、**第1問〜第32000問**の有名問題を完全再現。
- **複数枚スーパー移動（スーパーフライト）**: 空きフリーセルと空き列の数から移動可能最大枚数を自動計算し、複数枚の整列済みシーケンスを一括で移動可能。
- **アシスト機能**:
  - タップ移動: 1タップで空きセル・組札・列への最適移動を自動判定。
  - オートホーム: 安全に組札へ送れるカードをワンタップで自動回収。
- **無制限Undo**、手数・経過時間記録。

---

### 3. 💣 マインスイーパー (Minesweeper)
*数字の手がかりから地雷を推理する論理パズル*
- **3段階の難易度**:
  - 初級 (9×9 / 地雷10個)
  - 中級 (16×16 / 地雷40個)
  - 上級 (30×16 / 地雷99個)
- **初手安全保証**: 最初に開いたマスとその周囲8マスには絶対に地雷が置かれず、爽快な0マス連鎖オープンからスタート。
- **スマートフォン最適化**: 「💣 開く / 🚩 旗」モード切り替え、長押し旗立て、上級盤面用の拡大・縮小（ズーム）＆スムーズスクロール。
- **クラシック再現**: 7セグメントLED風カウンター、表情が変わるスマイルボタン（🙂/😮/😎/😵）、コードオープン（数字ダブルクリックで一括開き）対応。

---

### 4. 🀄 上海 / 麻雀ソリティア (Mahjong Solitaire)
*立体的に積まれた麻雀牌を対で消していく伝統パズル*
- **日本の麻雀牌に完全統一**: 萬子・筒子・索子・字牌（東南西北白發中）の144牌。
- **美麗な3D彫刻グラフィック**: 1筒の花車文様、1索の孔雀、無地の白、翡翠（ジェイド）グリーンの背張り、段数に応じた立体ドロップシャドウを再現。
- **5種類の山形レイアウト**:
  - タートル (亀 / 伝統のピラミッド)
  - フォートレス (城塞)
  - キャニオン (峡谷)
  - スパイダー (蜘蛛)
  - ドラゴン (昇龍)
- **100%解ける盤面生成**: 逆再生アルゴリズムで、手詰まりにならない合法な牌配置を自動生成。
- **充実のサポート**:
  - ヒント: 消せるペアを光らせて通知。
  - 再配置（シャッフル）: 手詰まり時や気分転換に残りの牌をシャッフル（1ゲーム3回まで）。
  - Undo: 直前に消したペアを復元。

---

### 5. 📦 倉庫番 (Sokoban)
*荷物を押して指定のゴールに運ぶ不朽の名作パズル*
- **全25ステージ収録**: チュートリアルから手応えある超難関ステージまで段階的にステップアップ。
- **AIソルバー搭載（Push-BFS）**:
  - **ヒント機能**: 最短手数でゴールへ至る次の1手を矢印とメッセージでガイド。
  - **自動解法（オートプレイ）**: AIが自動で最後まで解いてくれる再生モード。
- **詰み（デッドロック）検知**: 四隅や壁際の復帰不能な状態を即座に検知し、警告メッセージを表示。
- **操作性**:
  - キーボード: 矢印キー、WASD、U（戻す）、R（リセット）、H（ヒント）。
  - モバイル: 画面上に配置された押しやすい仮想十字キー（D-Pad）。
- **表情豊かなキャラクター**: 待機中（•_•）、押し中（>_<）、Undo時（o_o）、クリア時（^▽^）など状況に合わせて変化。
- **ステージ選択モーダル**: クリア済みマーク付きの25面セレクト画面。

---

### 6. 🔢 数独 / ナンプレ (Sudoku)
*論理的思考でマスを埋める数字パズルの最高峰*
- **4段階の難易度**:
  - 初級 (Easy / 約42ヒント)
  - 中級 (Medium / 約32ヒント)
  - 上級 (Hard / 約28ヒント)
  - エキスパート (Expert / 約24ヒント)
- **唯一解保証**: 最小残余値探索（MRV）ソルバーを用いて、答えが必ず1通りに定まる問題のみを自動生成。
- **メモ機能（ペンシルマーク）**: 各マスに1〜9の候補数字を3×3のミニグリッドで記録可能。
- **自動メモ消去**: 数字を確定した際、同一の行・列・3×3ブロック内のメモから該当数字を自動削除（設定でON/OFF可能）。
- **インテリジェントなハイライト**:
  - 選択中のマスと関連する行・列・3×3ブロックをハイライト。
  - 同じ数字のマスを一斉に強調。
  - 重複（エラー）しているマスを即座に赤く警告表示。
- **入力アシスト**: 数字キーパッドに各数字の残り配置可能数バッジを表示（9個すべて置くと完了表示）。
- **サポート機能**: ヒント（1マス自動確定）、一時停止・再開、無制限Undo、消去。

---

## 🛠️ ポータル共通機能 & こだわり

- **🌐 多言語対応 (i18n)**: 日本語 / 英語 をワンクリックで切り替え可能。ブラウザ設定からの自動検出にも対応。
- **📱 完全レスポンシブ**: PCの大画面はもちろん、スマートフォンの縦画面・横画面どちらでも崩れず快適に操作可能。
- **🔊 Web Audio API 合成音源**: 外部の音声ファイルを使用せず、ブラウザのWeb Audio APIでカードめくり音、牌の衝突音、爆発音、荷物押し音、ファンファーレをリアルタイム生成（通信量ゼロ・低遅延・オフライン動作）。
- **📊 戦績・統計管理**: 各ゲーム・難易度ごとのプレイ回数、勝利数、勝率、ベストタイム、連勝記録を `localStorage` に自動保存。
- **🎨 4つのテーマ**: クラシック・フェルト / ディープ・フォレスト / ダーク・スレート / レトロ・90s から選択可能。
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

# 4. ブラウザでアクセス (通常 http://localhost:3000)
```

### プロダクションビルド

```bash
npm run build
npm run preview
```

### テスト実行 (Vitest)

全7テストスイート・37テストケースを実行します。

```bash
npm test
```

---

## 📁 ディレクトリ構成

```
classic-solo-games/
├── README.md                 # 英語版ドキュメント
├── README.ja.md              # 日本語版ドキュメント
├── index.html                # エントリーHTML (GTM/設定スクリプト含む)
├── package.json
├── tsconfig.json
├── vite.config.ts
├── public/
│   ├── config.js             # GTM等の外部設定
│   ├── favicon.svg
│   └── vite.svg
├── src/
│   ├── main.tsx
│   ├── App.tsx               # ルーティング・ゲーム切り替え
│   ├── index.css             # Tailwind CSS v4
│   ├── audio/
│   │   └── soundEffects.ts   # Web Audio API シンセサイザー音源
│   ├── i18n/
│   │   ├── LanguageContext.tsx
│   │   └── translations.ts   # 日英多言語リソース
│   ├── types/
│   │   ├── common.ts         # 共通型定義 (GameType, AllStats, UserSettings)
│   │   ├── solitaire.ts      # ソリティア型定義
│   │   ├── freecell.ts       # フリーセル型定義
│   │   ├── minesweeper.ts    # マインスイーパー型定義
│   │   ├── shanghai.ts       # 上海型定義
│   │   ├── sokoban.ts        # 倉庫番型定義
│   │   └── sudoku.ts         # 数独型定義
│   ├── utils/
│   │   ├── storage.ts        # LocalStorage 統計・設定管理
│   │   └── confetti.ts       # 勝利時の紙吹雪アニメーション
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.tsx        # ヘッダーナビゲーション (7ゲームタブ対応)
│   │   │   ├── GameHub.tsx       # ポータルカード一覧
│   │   │   ├── StatsModal.tsx    # 総合統計モーダル
│   │   │   └── SettingsModal.tsx # 設定モーダル
│   │   ├── solitaire/
│   │   │   ├── SolitaireGame.tsx
│   │   │   ├── SolitaireCard.tsx
│   │   │   ├── SolitairePile.tsx
│   │   │   ├── solitaireLogic.ts
│   │   │   ├── solitaireSolver.ts
│   │   │   └── WinAnimation.tsx
│   │   ├── freecell/
│   │   │   ├── FreeCellGame.tsx
│   │   │   ├── freecellLogic.ts
│   │   │   └── freecellRNG.ts
│   │   ├── minesweeper/
│   │   │   ├── MinesweeperGame.tsx
│   │   │   ├── MineCell.tsx
│   │   │   ├── MineHeader.tsx
│   │   │   └── minesweeperLogic.ts
│   │   ├── shanghai/
│   │   │   ├── ShanghaiGame.tsx
│   │   │   ├── MahjongTile.tsx
│   │   │   ├── MahjongTileArt.tsx
│   │   │   ├── shanghaiLayouts.ts
│   │   │   ├── shanghaiLogic.ts
│   │   │   └── shanghaiSolver.ts
│   │   ├── sokoban/
│   │   │   ├── SokobanGame.tsx
│   │   │   ├── sokobanLevels.ts  # 全25ステージデータ
│   │   │   ├── sokobanLogic.ts
│   │   │   └── sokobanSolver.ts  # Push-BFS ソルバー
│   │   └── sudoku/
│   │       ├── SudokuGame.tsx
│   │       └── sudokuLogic.ts    # MRV探索・問題生成・バリデーション
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

## 📄 ライセンス

MIT License. Free to use, modify, and distribute.
