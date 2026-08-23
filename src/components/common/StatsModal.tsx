import React from 'react';
import { AllStats } from '../../types/common';
import { X, Trophy, Flame, Clock, Play } from 'lucide-react';

interface StatsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: AllStats;
  onResetStats?: () => void;
}

export const StatsModal: React.FC<StatsModalProps> = ({
  isOpen,
  onClose,
  stats,
}) => {
  if (!isOpen) return null;

  const formatTime = (secs: number | null) => {
    if (secs === null) return '--:--';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const statItems = [
    { label: 'ソリティア (1枚めくり)', data: stats.solitaire_draw1, color: 'border-emerald-500/40 bg-emerald-950/20' },
    { label: 'ソリティア (3枚めくり)', data: stats.solitaire_draw3, color: 'border-emerald-500/40 bg-emerald-950/20' },
    { label: 'マインスイーパー (初級)', data: stats.minesweeper_easy, color: 'border-blue-500/40 bg-blue-950/20' },
    { label: 'マインスイーパー (中級)', data: stats.minesweeper_medium, color: 'border-blue-500/40 bg-blue-950/20' },
    { label: 'マインスイーパー (上級)', data: stats.minesweeper_hard, color: 'border-blue-500/40 bg-blue-950/20' },
    { label: '上海 (タートル)', data: stats.shanghai_turtle, color: 'border-amber-500/40 bg-amber-950/20' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            <h2 className="text-lg sm:text-xl font-bold text-white">ゲーム戦績・統計</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stats Grid */}
        <div className="flex flex-col gap-3">
          {statItems.map((item, idx) => {
            const winRate =
              item.data.played > 0
                ? Math.round((item.data.won / item.data.played) * 100)
                : 0;

            return (
              <div
                key={idx}
                className={`p-3 rounded-xl border ${item.color} flex flex-col gap-2`}
              >
                <div className="flex justify-between items-center">
                  <span className="font-bold text-sm text-slate-200">{item.label}</span>
                  <span className="text-xs font-semibold text-slate-400">
                    勝率: <span className="text-amber-400 font-bold">{winRate}%</span> ({item.data.won}/{item.data.played})
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
                      <Clock className="w-3 h-3 text-sky-400" />
                      <span>ベストタイム</span>
                    </div>
                    <span className="font-mono-digits font-bold text-sky-400 text-sm">
                      {formatTime(item.data.bestTime)}
                    </span>
                  </div>

                  <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
                      <Flame className="w-3 h-3 text-orange-400" />
                      <span>連勝 / 最高</span>
                    </div>
                    <span className="font-mono-digits font-bold text-orange-400 text-sm">
                      {item.data.currentStreak} / {item.data.bestStreak}
                    </span>
                  </div>

                  <div className="bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-center gap-1 text-slate-400 mb-0.5">
                      <Play className="w-3 h-3 text-emerald-400" />
                      <span>プレイ数</span>
                    </div>
                    <span className="font-mono-digits font-bold text-emerald-400 text-sm">
                      {item.data.played}回
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl transition-colors mt-2"
        >
          閉じる
        </button>
      </div>
    </div>
  );
};
