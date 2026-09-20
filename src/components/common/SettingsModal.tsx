import React from 'react';
import { AppTheme, UserSettings } from '../../types/common';
import { X, Settings, Volume2, VolumeX, Palette, Layers, Globe } from 'lucide-react';
import { sounds } from '../../audio/soundEffects';
import { useTranslation } from '../../i18n/LanguageContext';

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
  const { t } = useTranslation();
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

  const handleLanguageChange = (language: 'auto' | 'ja' | 'en') => {
    sounds.playClick();
    onUpdateSettings({ ...settings, language });
  };

  const themes: { id: AppTheme; label: string; desc: string; preview: string }[] = [
    { id: 'classic', label: t('themeClassic'), desc: t('themeClassicDesc'), preview: 'bg-emerald-800' },
    { id: 'dark', label: t('themeDark'), desc: t('themeDarkDesc'), preview: 'bg-slate-900' },
    { id: 'retro-win', label: t('themeRetro'), desc: t('themeRetroDesc'), preview: 'bg-slate-400' },
    { id: 'felt', label: t('themeFelt'), desc: t('themeFeltDesc'), preview: 'bg-teal-900' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">{t('settings')}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Language Option */}
        <div className="flex flex-col gap-2 p-3 bg-slate-800/60 rounded-xl border border-slate-700">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-sky-400" />
            <span className="font-bold text-sm text-slate-200">{t('language')}</span>
          </div>
          <div className="grid grid-cols-3 gap-1.5 bg-slate-900 p-1 rounded-lg border border-slate-700 text-xs font-semibold">
            <button
              onClick={() => handleLanguageChange('auto')}
              className={`py-1.5 px-2 rounded-md transition-all ${
                (settings.language || 'auto') === 'auto'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('langAuto')}
            </button>
            <button
              onClick={() => handleLanguageChange('ja')}
              className={`py-1.5 px-2 rounded-md transition-all ${
                settings.language === 'ja'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('langJa')}
            </button>
            <button
              onClick={() => handleLanguageChange('en')}
              className={`py-1.5 px-2 rounded-md transition-all ${
                settings.language === 'en'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {t('langEn')}
            </button>
          </div>
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
              <div className="font-bold text-sm text-slate-200">{t('sound')}</div>
              <div className="text-xs text-slate-400">{t('soundDesc')}</div>
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
            <span>{t('theme')}</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {themes.map((tItem) => (
              <button
                key={tItem.id}
                onClick={() => handleThemeChange(tItem.id)}
                className={`p-2.5 rounded-xl border text-left flex flex-col gap-1 transition-all ${
                  settings.theme === tItem.id
                    ? 'border-indigo-500 bg-indigo-950/40 ring-2 ring-indigo-500/50'
                    : 'border-slate-700 bg-slate-800/40 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full ${tItem.preview} border border-white/20`} />
                  <span className="font-bold text-xs text-slate-200">{tItem.label}</span>
                </div>
                <span className="text-[10px] text-slate-400 leading-tight">{tItem.desc}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Solitaire Draw Mode Default */}
        <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700">
          <div className="flex items-center gap-3">
            <Layers className="w-5 h-5 text-indigo-400" />
            <div>
              <div className="font-bold text-sm text-slate-200">{t('drawModeLabel')}</div>
              <div className="text-xs text-slate-400">{t('drawModeDesc')}</div>
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
              {t('draw1')}
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
              {t('draw3')}
            </button>
          </div>
        </div>

        {/* Sudoku Settings */}
        <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700">
          <div>
            <div className="font-bold text-sm text-slate-200">数独: 重複数字の強調表示</div>
            <div className="text-xs text-slate-400">同じ行・列・ブロック内の重複を赤色で警告</div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onUpdateSettings({ ...settings, sudokuHighlightDuplicates: !settings.sudokuHighlightDuplicates });
            }}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
              settings.sudokuHighlightDuplicates !== false ? 'bg-indigo-600 justify-end' : 'bg-slate-600 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md transition-transform" />
          </button>
        </div>

        <div className="flex items-center justify-between p-3 bg-slate-800/60 rounded-xl border border-slate-700">
          <div>
            <div className="font-bold text-sm text-slate-200">数独: メモの自動消去</div>
            <div className="text-xs text-slate-400">数字確定時に関連マスのメモ候補を自動で消去</div>
          </div>
          <button
            onClick={() => {
              sounds.playClick();
              onUpdateSettings({ ...settings, sudokuAutoClearNotes: !settings.sudokuAutoClearNotes });
            }}
            className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
              settings.sudokuAutoClearNotes !== false ? 'bg-indigo-600 justify-end' : 'bg-slate-600 justify-start'
            }`}
          >
            <div className="w-4 h-4 rounded-full bg-white shadow-md transition-transform" />
          </button>
        </div>

        {/* Done Button */}
        <button
          onClick={onClose}
          className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors shadow-md"
        >
          {t('saveAndClose')}
        </button>
      </div>
    </div>
  );
};
