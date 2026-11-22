export type MusicTheme = 'none' | 'title' | 'day' | 'night' | 'boss';

interface NoteStep {
  lead?: number;
  bass?: number;
  arp?: number;
  kick?: boolean;
  hat?: boolean;
}

// Terraria-inspired upbeat Forest Day theme (bouncy bell melody + triangle bass + major arpeggio)
const DAY_PATTERN: NoteStep[] = [
  { lead: 523.25, bass: 130.81, arp: 261.63, kick: true },
  { arp: 329.63 },
  { lead: 659.25, arp: 392.0, hat: true },
  { lead: 783.99, bass: 196.0, arp: 523.25 },
  { lead: 659.25, bass: 164.81, arp: 329.63, kick: true },
  { lead: 587.33, arp: 392.0 },
  { lead: 523.25, arp: 261.63, hat: true },
  { lead: 392.0, bass: 196.0, arp: 329.63 },
  { lead: 440.0, bass: 110.0, arp: 220.0, kick: true },
  { lead: 523.25, arp: 261.63 },
  { lead: 659.25, arp: 329.63, hat: true },
  { lead: 587.33, bass: 146.83, arp: 293.66 },
  { lead: 523.25, bass: 196.0, arp: 392.0, kick: true },
  { arp: 493.88 },
  { lead: 587.33, arp: 392.0, hat: true },
  { bass: 196.0, arp: 293.66 },
];

// Atmospheric Night / Underground Cavern theme (mysterious minor chimes + deep bass)
const NIGHT_PATTERN: NoteStep[] = [
  { lead: 329.63, bass: 110.0, arp: 220.0, kick: true },
  { arp: 261.63 },
  { lead: 392.0, arp: 329.63 },
  { bass: 164.81, arp: 261.63, hat: true },
  { lead: 440.0, bass: 110.0, arp: 220.0 },
  { lead: 392.0, arp: 293.66 },
  { lead: 349.23, arp: 261.63, hat: true },
  { bass: 146.83, arp: 220.0 },
  { lead: 329.63, bass: 98.0, arp: 196.0, kick: true },
  { arp: 246.94 },
  { lead: 293.66, arp: 293.66 },
  { bass: 130.81, arp: 246.94, hat: true },
  { lead: 261.63, bass: 110.0, arp: 220.0 },
  { arp: 246.94 },
  { lead: 220.0, arp: 196.0, hat: true },
  { bass: 164.81, arp: 220.0 },
];

// Driving Boss Battle theme (energetic 16-step Terraria boss chiptune pulse!)
const BOSS_PATTERN: NoteStep[] = [
  { lead: 440.0, bass: 110.0, arp: 220.0, kick: true, hat: true },
  { lead: 440.0, arp: 329.63, hat: true },
  { lead: 523.25, bass: 110.0, arp: 220.0, hat: true },
  { lead: 493.88, arp: 329.63, kick: true },
  { lead: 440.0, bass: 130.81, arp: 261.63, kick: true, hat: true },
  { lead: 587.33, arp: 392.0, hat: true },
  { lead: 659.25, bass: 130.81, arp: 261.63, kick: true },
  { lead: 523.25, arp: 329.63, hat: true },
  { lead: 698.46, bass: 146.83, arp: 293.66, kick: true, hat: true },
  { lead: 659.25, arp: 349.23, hat: true },
  { lead: 587.33, bass: 146.83, arp: 293.66, hat: true },
  { lead: 523.25, arp: 349.23, kick: true },
  { lead: 659.25, bass: 164.81, arp: 329.63, kick: true, hat: true },
  { lead: 587.33, arp: 392.0, hat: true },
  { lead: 523.25, bass: 196.0, arp: 493.88, kick: true },
  { lead: 493.88, bass: 164.81, arp: 329.63, hat: true },
];

// Gentle Title screen theme
const TITLE_PATTERN: NoteStep[] = [
  { lead: 392.0, bass: 130.81, arp: 261.63 },
  { arp: 329.63 },
  { lead: 523.25, arp: 392.0 },
  { arp: 523.25 },
  { lead: 493.88, bass: 196.0, arp: 293.66 },
  { arp: 392.0 },
  { lead: 392.0, arp: 329.63 },
  { bass: 164.81, arp: 261.63 },
  { lead: 440.0, bass: 110.0, arp: 220.0 },
  { arp: 261.63 },
  { lead: 523.25, arp: 329.63 },
  { arp: 392.0 },
  { lead: 587.33, bass: 146.83, arp: 293.66 },
  { arp: 349.23 },
  { lead: 523.25, arp: 392.0 },
  { bass: 196.0, arp: 329.63 },
];

class SoundEngine {
  private ctx: AudioContext | null = null;
  public muted = false;
  public musicEnabled = true;
  public musicVolume = 0.45;
  public sfxEnabled = true;
  public sfxVolume = 0.75;

  private musicTheme: MusicTheme = 'none';
  private musicTimerId: number | null = null;
  private stepIndex = 0;

  public applySettings(opts: {
    musicEnabled: boolean;
    musicVolume: number;
    sfxEnabled: boolean;
    sfxVolume: number;
    muted?: boolean;
  }): void {
    this.musicEnabled = opts.musicEnabled;
    this.musicVolume = Math.max(0, Math.min(1, opts.musicVolume));
    this.sfxEnabled = opts.sfxEnabled;
    this.sfxVolume = Math.max(0, Math.min(1, opts.sfxVolume));
    if (typeof opts.muted === 'boolean') {
      this.muted = opts.muted;
    }
    this.syncMusicLoop();
  }

  public unlock(): void {
    this.ensureContext(false);
    this.syncMusicLoop();
  }

  public setMusicTheme(theme: MusicTheme): void {
    if (this.musicTheme === theme) return;
    this.musicTheme = theme;
    this.stepIndex = 0;
    this.syncMusicLoop();
  }

  private ensureContext(forSfx = true): AudioContext | null {
    if (this.muted) return null;
    if (forSfx && (!this.sfxEnabled || this.sfxVolume <= 0.005)) return null;
    if (!forSfx && (!this.musicEnabled || this.musicVolume <= 0.005)) return null;
    if (typeof window === 'undefined') return null;

    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  private syncMusicLoop(): void {
    if (typeof window === 'undefined') return;
    const shouldPlay =
      !this.muted &&
      this.musicEnabled &&
      this.musicVolume > 0.005 &&
      this.musicTheme !== 'none';

    if (!shouldPlay) {
      if (this.musicTimerId !== null) {
        window.clearInterval(this.musicTimerId);
        this.musicTimerId = null;
      }
      return;
    }

    if (this.musicTimerId !== null) {
      window.clearInterval(this.musicTimerId);
      this.musicTimerId = null;
    }

    const stepMs =
      this.musicTheme === 'boss'
        ? 145
        : this.musicTheme === 'day'
          ? 210
          : this.musicTheme === 'title'
            ? 270
            : 295;

    this.musicTimerId = window.setInterval(() => {
      this.tickMusicStep();
    }, stepMs);
  }

  private tickMusicStep(): void {
    const ctx = this.ensureContext(false);
    if (!ctx || ctx.state !== 'running') return;

    const pattern =
      this.musicTheme === 'boss'
        ? BOSS_PATTERN
        : this.musicTheme === 'night'
          ? NIGHT_PATTERN
          : this.musicTheme === 'title'
            ? TITLE_PATTERN
            : DAY_PATTERN;

    const step = pattern[this.stepIndex % pattern.length];
    this.stepIndex = (this.stepIndex + 1) % pattern.length;

    const vol = this.musicVolume;
    const now = ctx.currentTime;

    if (step.lead) {
      const wave: OscillatorType =
        this.musicTheme === 'boss'
          ? 'sawtooth'
          : this.musicTheme === 'night'
            ? 'sine'
            : 'triangle';
      const dur = this.musicTheme === 'boss' ? 0.13 : 0.24;
      this.playMusicVoice(ctx, now, step.lead, dur, wave, 0.065 * vol);
    }
    if (step.bass) {
      const dur = this.musicTheme === 'boss' ? 0.14 : 0.28;
      this.playMusicVoice(ctx, now, step.bass, dur, 'triangle', 0.08 * vol);
    }
    if (step.arp) {
      const dur = this.musicTheme === 'boss' ? 0.1 : 0.18;
      this.playMusicVoice(ctx, now, step.arp, dur, 'sine', 0.032 * vol);
    }
    if (step.kick) {
      this.playMusicKick(ctx, now, 0.085 * vol);
    }
    if (step.hat && this.musicTheme === 'boss') {
      this.playMusicHat(ctx, now, 0.028 * vol);
    }
  }

  private playMusicVoice(
    ctx: AudioContext,
    startTime: number,
    freq: number,
    duration: number,
    type: OscillatorType,
    peak: number,
  ): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    gain.gain.setValueAtTime(0.0008, startTime);
    gain.gain.linearRampToValueAtTime(Math.max(0.001, peak), startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0008, startTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  private playMusicKick(ctx: AudioContext, startTime: number, peak: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(115, startTime);
    osc.frequency.exponentialRampToValueAtTime(42, startTime + 0.09);
    gain.gain.setValueAtTime(Math.max(0.001, peak), startTime);
    gain.gain.exponentialRampToValueAtTime(0.0008, startTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + 0.11);
  }

  private playMusicHat(ctx: AudioContext, startTime: number, peak: number): void {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(3400, startTime);
    gain.gain.setValueAtTime(Math.max(0.0008, peak), startTime);
    gain.gain.exponentialRampToValueAtTime(0.0005, startTime + 0.035);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + 0.04);
  }

  private playTone(
    freqStart: number,
    freqEnd: number,
    duration: number,
    type: OscillatorType = 'triangle',
    gainPeak = 0.12,
  ): void {
    const ctx = this.ensureContext(true);
    if (!ctx) return;
    const now = ctx.currentTime;
    const jitter = 0.92 + Math.random() * 0.16;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(40, freqStart * jitter), now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, freqEnd * jitter), now + duration);
    const scaledPeak = Math.max(0.001, gainPeak * this.sfxVolume);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(scaledPeak, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  playJump(): void {
    this.playTone(230, 490, 0.13, 'triangle', 0.1);
  }

  playMineHit(): void {
    this.playTone(320, 140, 0.06, 'square', 0.07);
  }

  playBlockBreak(): void {
    this.playTone(180, 75, 0.12, 'sawtooth', 0.1);
  }

  playPlace(): void {
    this.playTone(260, 340, 0.07, 'sine', 0.09);
  }

  playChestOpen(): void {
    this.playTone(300, 440, 0.1, 'triangle', 0.1);
    setTimeout(() => this.playTone(460, 620, 0.12, 'sine', 0.09), 60);
  }

  playBossRoar(): void {
    this.playTone(170, 68, 0.42, 'sawtooth', 0.16);
    setTimeout(() => this.playTone(140, 55, 0.35, 'square', 0.12), 90);
  }

  playSwing(): void {
    this.playTone(380, 140, 0.11, 'triangle', 0.09);
  }

  playBow(): void {
    this.playTone(460, 180, 0.1, 'triangle', 0.09);
  }

  playMagic(): void {
    this.playTone(540, 880, 0.16, 'sine', 0.09);
  }

  playLaser(): void {
    this.playTone(1100, 340, 0.08, 'sawtooth', 0.07);
  }

  playExplosion(): void {
    this.playTone(140, 42, 0.28, 'sawtooth', 0.16);
  }

  playEnemyHit(): void {
    this.playTone(210, 95, 0.1, 'square', 0.1);
  }

  playPlayerHurt(): void {
    this.playTone(620, 310, 0.22, 'sawtooth', 0.13);
  }

  playPickup(): void {
    this.playTone(580, 860, 0.08, 'sine', 0.07);
  }

  playDrop(): void {
    this.playTone(340, 210, 0.09, 'sine', 0.08);
  }

  playCraft(): void {
    this.playTone(440, 660, 0.1, 'triangle', 0.1);
    setTimeout(() => this.playTone(660, 990, 0.14, 'triangle', 0.1), 70);
  }

  playHeal(): void {
    this.playTone(390, 580, 0.15, 'sine', 0.1);
  }

  playPurr(): void {
    this.playTone(190, 240, 0.12, 'sine', 0.09);
    setTimeout(() => this.playTone(230, 310, 0.14, 'sine', 0.08), 85);
  }

  playStoolCopy(): void {
    this.playTone(520, 780, 0.09, 'triangle', 0.1);
    setTimeout(() => this.playTone(780, 1040, 0.12, 'triangle', 0.1), 75);
  }
}

export const sound = new SoundEngine();
