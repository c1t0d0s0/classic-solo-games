import React from 'react';
import { AppTheme, UserSettings } from '../../types/common';
import { X, Settings, Volume2, VolumeX, Palette, Layers } from 'lucide-react';
import { sounds } from '../../audio/soundEffects';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onUpdateSettings: (newSettings: UserSettings) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
}) => {
  if (!isOpen) return null;

  const handleSoundToggle = () => {
    const next = !settings.soundEnabled;
    sounds.setMuted(!next);
    onUpdateSettings({ ...settings, soundEnabled: next });
  };

  const handleThemeChange = (theme: AppTheme) => {
    sounds.playClick();
    onUpdateSettings({ ...settings, theme });
  };

  const themes: { id: AppTheme; label: string; desc: string; preview: string }[] = [
    { id: 'classic', label: 'クラシック・フェルト', desc: 'カジノテーブル風の伝統的グリーン', preview: 'bg-emerald-800' },
    { id: 'dark', label: 'ダーク・スレート', desc: '目に優しいモダンなダークモード', preview: 'bg-slate-900' },
    { id: 'retro-win', label: 'レトロ・90s', desc: '懐かしのクラシックPC風', preview: 'bg-slate-400' },
    { id: 'felt', label: 'ディープ・フォレスト', desc: '落ち着きのある深緑', preview: 'bg-teal-900' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">設定</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sound Option */}
        <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700">
          <div className="flex items-center gap-3">
            {settings.soundEnabled ? (
              <Volume2 className="w-5 h-5 text-emerald-400" />
            ) : (
              <VolumeX className="w-5 h-5 text-red-400" />
            )}
            <div>
              <div className="font-bold text-sm text-slate-200">効果音</div>
              <div className="text-xs text-slate-400">カード、牌、爆発などの効果音</div>
            </div>
          </div>
          <button
            onClick={handleSoundToggle}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
              settings.soundEnabled ? 'bg-emerald-600 justify-end' : 'bg-slate-600 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md transition-transform" />
          </button>
        </div>

        {/* Theme Option */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-300">
            <Palette className="w-4 h-4 text-amber-400" />
            <span>背景テーマ</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {themes.map((t) => (
              <button
                key={t.id}
                onClick={() => handleThemeChange(t.id)}
                className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  settings.theme === t.id
                    ? 'border-indigo-500 bg-indigo-950/40 ring-2 ring-indigo-500/50'
                    : 'border-slate-700 bg-slate-800/40 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${t.preview} border border-white/20`} />
                  <span className="font-bold text-xs text-slate-200">{t.label}</span>
                </div>
                <span className="text-[10px] text-slate-400 leading-tight">{t.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Solitaire Draw Mode Default */}
        <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-indigo-400" />
            <div>
              <div className="font-bold text-sm text-slate-200">ソリティアめくり枚数</div>
              <div className="text-xs text-slate-400">標準のめくり設定</div>
            </div>
          </div>
          <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-700 text-xs">
            <button
              onClick={() => {
                sounds.playClick();
                onUpdateSettings({ ...settings, solitaireDrawMode: 1 });
              }}
              className={`px-2.5 py-1 rounded font-medium ${
                settings.solitaireDrawMode === 1
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400'
              }`}
            >
              1枚
            </button>
            <button
              onClick={() => {
                sounds.playClick();
                onUpdateSettings({ ...settings, solitaireDrawMode: 3 });
              }}
              className={`px-2.5 py-1 rounded font-medium ${
                settings.solitaireDrawMode === 3
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400'
              }`}
            >
              3枚
            </button>
          </div>
        </div>

        {/* Done Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors shadow-md"
        >
          保存して閉じる
        </button>
      </div>
    </div>
  );
};
