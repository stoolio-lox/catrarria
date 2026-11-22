import { GameSettings } from './types';

const SETTINGS_STORAGE_KEY = 'kotarria_settings_v1';

export const DEFAULT_SETTINGS: GameSettings = {
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
  if (typeof window === 'undefined' || !window.localStorage) {
    return { ...DEFAULT_SETTINGS };
  }
  try {
    const raw = window.localStorage.getItem(SETTINGS_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    const parsed = JSON.parse(raw) as Partial<GameSettings>;
    return {
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
    return { ...DEFAULT_SETTINGS };
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
