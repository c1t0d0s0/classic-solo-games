import React from 'react';
import { AllStats, GameType } from '../../types/common';
import { Trophy, ArrowRight, Sparkles, CheckCircle2, ShieldAlert } from 'lucide-react';
import { sounds } from '../../audio/soundEffects';

interface GameHubProps {
  stats: AllStats;
  onSelectGame: (game: GameType) => void;
}

export const GameHub: React.FC<GameHubProps> = ({ stats, onSelectGame }) => {
  const games: {
    id: GameType;
    title: string;
    subTitle: string;
    description: string;
    icon: string;
    badge: string;
    features: string[];
    gradient: string;
    border: string;
    played: number;
    won: number;
  }[] = [
    {
      id: 'solitaire',
      title: 'ソリティア (クロンダイク)',
      subTitle: 'Klondike Solitaire',
      description: '古典的なトランプの一人遊び。赤と黒を交互に重ね、AからKまで4つの組札を完成させましょう。',
      icon: '♠️',
      badge: '定番カードゲーム',
      features: [
        'スマホ対応ワンタップ移動 ＆ PCドラッグ操作',
        '1枚めくり / 3枚めくり切り替え',
        '爽快な自動完成 ＆ カード跳ね返り演出',
      ],
      gradient: 'from-emerald-900/60 via-emerald-950/40 to-slate-900',
      border: 'border-emerald-600/40 hover:border-emerald-500',
      played: stats.solitaire_draw1.played + stats.solitaire_draw3.played,
      won: stats.solitaire_draw1.won + stats.solitaire_draw3.won,
    },
    {
      id: 'minesweeper',
      title: 'マインスイーパー',
      subTitle: 'Minesweeper',
      description: '数字のヒントを頼りに、地雷を避けてすべての安全なマスを開放する論理パズル。',
      icon: '💣',
      badge: '論理思考パズル',
      features: [
        '初手安全保証（最初のクリックは必ず安全）',
        '初級(9x9)・中級(16x16)・上級(30x16)の3難易度',
        'スマホ用ワンタップ旗モード ＆ 盤面ズーム機能',
      ],
      gradient: 'from-blue-900/60 via-blue-950/40 to-slate-900',
      border: 'border-blue-600/40 hover:border-blue-500',
      played:
        stats.minesweeper_easy.played +
        stats.minesweeper_medium.played +
        stats.minesweeper_hard.played,
      won:
        stats.minesweeper_easy.won +
        stats.minesweeper_medium.won +
        stats.minesweeper_hard.won,
    },
    {
      id: 'shanghai',
      title: '上海 (麻雀ソリティア)',
      subTitle: 'Mahjong Solitaire',
      description: '積み上げられた144枚の麻雀牌から、左右が開いている同じ絵柄の牌を2枚ずつ消していく伝統パズル。',
      icon: '🀄',
      badge: '牌消しパズル',
      features: [
        '100%確実に解ける盤面生成アルゴリズム',
        '3D立体レイヤー表示 ＆ 選択可能牌の視覚アシスト',
        '困ったときのヒント機能 ＆ 牌の再配置シャッフル',
      ],
      gradient: 'from-amber-900/60 via-amber-950/40 to-slate-900',
      border: 'border-amber-600/40 hover:border-amber-500',
      played: stats.shanghai_turtle.played,
      won: stats.shanghai_turtle.won,
    },
  ];

  const handleGameLaunch = (gameId: GameType) => {
    sounds.playClick();
    onSelectGame(gameId);
  };

  return (
    <div className="w-full max-w-5xl flex flex-col items-center gap-6 sm:gap-8 py-4 sm:py-6 px-3">
      {/* Hero Banner */}
      <div className="text-center flex flex-col items-center gap-2 sm:gap-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>PC & スマートフォン両対応・Web版</span>
        </div>
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
          クラシック・ソロゲームズ
        </h1>
        <p className="text-xs sm:text-base text-slate-300 max-w-2xl leading-relaxed">
          誰でも知っている永遠の名作一人遊びゲームを、快適な操作感と美しい演出で。
          通勤中や休憩時間の手軽な脳トレにどうぞ。
        </p>
      </div>

      {/* Game Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full">
        {games.map((game) => {
          const winRate = game.played > 0 ? Math.round((game.won / game.played) * 100) : 0;

          return (
            <div
              key={game.id}
              onClick={() => handleGameLaunch(game.id)}
              className={`relative rounded-2xl bg-gradient-to-b ${game.gradient} border ${game.border} p-5 sm:p-6 shadow-xl hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-200 cursor-pointer flex flex-col justify-between group overflow-hidden`}
            >
              {/* Top info */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-4xl sm:text-5xl filter drop-shadow-md group-hover:scale-110 transition-transform">
                    {game.icon}
                  </span>
                  <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-slate-200 border border-white/15 backdrop-blur">
                    {game.badge}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg sm:text-xl font-black text-white group-hover:text-indigo-300 transition-colors">
                    {game.title}
                  </h3>
                  <div className="text-xs text-slate-400 font-medium">{game.subTitle}</div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed min-h-[3rem]">
                  {game.description}
                </p>

                {/* Features */}
                <div className="flex flex-col gap-1.5 pt-2 border-t border-white/10">
                  {game.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-1.5 text-[11px] sm:text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Launch Bar */}
              <div className="pt-5 mt-4 border-t border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-slate-300">
                  <Trophy className="w-3.5 h-3.5 text-amber-400" />
                  <span>
                    勝率: <strong className="text-white">{winRate}%</strong> ({game.won}/{game.played})
                  </span>
                </div>

                <div className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-indigo-600 group-hover:bg-indigo-500 text-white text-xs font-bold shadow-md transition-colors">
                  <span>プレイ</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="w-full text-center text-xs text-slate-400 pt-4 flex flex-wrap items-center justify-center gap-4 border-t border-slate-800">
        <span className="flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
          全ゲーム完全無料・登録不要
        </span>
        <span>•</span>
        <span>Web Audio API 高音質シンセ音源</span>
        <span>•</span>
        <span>ローカル自動セーブ対応</span>
      </div>
    </div>
  );
};
