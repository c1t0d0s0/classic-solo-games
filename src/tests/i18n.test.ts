import { describe, it, expect } from 'vitest';
import { translations } from '../i18n/translations';
import { detectBrowserLanguage } from '../i18n/LanguageContext';

describe('i18n Internationalization Tests', () => {
  it('should have all matching translation keys in ja and en dictionaries', () => {
    const jaKeys = Object.keys(translations.ja).sort();
    const enKeys = Object.keys(translations.en).sort();

    expect(jaKeys).toEqual(enKeys);
    expect(jaKeys.length).toBeGreaterThan(30);
  });

  it('should detect language based on navigator.language', () => {
    // Save original navigator
    const originalLanguage = navigator.language;

    Object.defineProperty(navigator, 'language', {
      value: 'ja-JP',
      configurable: true,
    });
    expect(detectBrowserLanguage()).toBe('ja');

    Object.defineProperty(navigator, 'language', {
      value: 'en-US',
      configurable: true,
    });
    expect(detectBrowserLanguage()).toBe('en');

    Object.defineProperty(navigator, 'language', {
      value: 'fr-FR',
      configurable: true,
    });
    expect(detectBrowserLanguage()).toBe('en');

    // Restore
    Object.defineProperty(navigator, 'language', {
      value: originalLanguage,
      configurable: true,
    });
  });
});
