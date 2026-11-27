import { GameSettings, Language } from './types';

const SETTINGS_STORAGE_KEY = 'kotarria_settings_v2';

export function detectQueryLanguage(): Language | null {
  if (typeof window === 'undefined') return null;
  try {
    const param = new URLSearchParams(window.location.search).get('lang');
    if (param === 'ru' || param === 'en') return param;
  } catch {
    // ignore
  }
  return null;
}

export const DEFAULT_SETTINGS: GameSettings = {
  language: 'en',
  musicEnabled: true,
  musicVolume: 0.45,
  sfxEnabled: true,
  sfxVolume: 0.75,
  screenShake: true,
  particlesEnabled: true,
  autopauseInMenus: true,
};

export function clampVolume(val: number): number {
  if (!Number.isFinite(val)) return 0.5;
  return Math.max(0, Math.min(1, val));
}

export function loadSettings(): GameSettings {
  const queryLang = detectQueryLanguage();
  if (typeof window === 'undefined' || !window.localStorage) {
    return { ...DEFAULT_SETTINGS, language: queryLang ?? DEFAULT_SETTINGS.language };
  }
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS, language: queryLang ?? DEFAULT_SETTINGS.language };
    const parsed = JSON.parse(raw) as Partial<GameSettings>;
    const savedLang: Language = parsed.language === 'ru' || parsed.language === 'en' ? parsed.language : 'en';
    return {
      language: queryLang ?? savedLang,
      musicEnabled:
        typeof parsed.musicEnabled === 'boolean'
          ? parsed.musicEnabled
          : DEFAULT_SETTINGS.musicEnabled,
      musicVolume:
        typeof parsed.musicVolume === 'number'
          ? clampVolume(parsed.musicVolume)
          : DEFAULT_SETTINGS.musicVolume,
      sfxEnabled:
        typeof parsed.sfxEnabled === 'boolean'
          ? parsed.sfxEnabled
          : DEFAULT_SETTINGS.sfxEnabled,
      sfxVolume:
        typeof parsed.sfxVolume === 'number'
          ? clampVolume(parsed.sfxVolume)
          : DEFAULT_SETTINGS.sfxVolume,
      screenShake:
        typeof parsed.screenShake === 'boolean'
          ? parsed.screenShake
          : DEFAULT_SETTINGS.screenShake,
      particlesEnabled:
        typeof parsed.particlesEnabled === 'boolean'
          ? parsed.particlesEnabled
          : DEFAULT_SETTINGS.particlesEnabled,
      autopauseInMenus:
        typeof parsed.autopauseInMenus === 'boolean'
          ? parsed.autopauseInMenus
          : DEFAULT_SETTINGS.autopauseInMenus,
    };
  } catch {
    return { ...DEFAULT_SETTINGS, language: queryLang ?? DEFAULT_SETTINGS.language };
  }
}

export function saveSettings(settings: GameSettings): void {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
  } catch {
    // Ignore storage quota errors
  }
}

