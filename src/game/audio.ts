class SoundEngine {
  private ctx: AudioContext | null = null;
  public muted = false;

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
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

  private playTone(
    freqStart: number,
    freqEnd: number,
    duration: number,
    type: OscillatorType = 'triangle',
    gainPeak = 0.12,
  ): void {
    const ctx = this.ensureContext();
    if (!ctx) return;
    const now = ctx.currentTime;
    const jitter = 0.92 + Math.random() * 0.16;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(Math.max(40, freqStart * jitter), now);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, freqEnd * jitter), now + duration);
    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(gainPeak, now + 0.012);
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
    // Stylized cat yowl!
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
