class RetroSoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = true;
  private bgmEnabled: boolean = false;
  private bgmTimer: number | null = null;
  private bgmStep: number = 0;

  private ensureContext(): AudioContext | null {
    if (this.muted) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public isBgmEnabled(): boolean {
    return this.bgmEnabled;
  }

  public setMuted(muted: boolean): void {
    this.muted = muted;
    if (muted) {
      this.stopBgm();
    }
  }

  public toggleMute(): boolean {
    this.setMuted(!this.muted);
    return this.muted;
  }

  public toggleBgm(): boolean {
    this.bgmEnabled = !this.bgmEnabled;
    if (this.bgmEnabled && !this.muted) {
      this.startBgm();
    } else {
      this.stopBgm();
    }
    return this.bgmEnabled;
  }

  private playTone(
    freq: number,
    duration: number,
    type: OscillatorType = 'square',
    volume: number = 0.06,
    delay: number = 0,
    endFreq?: number
  ) {
    const ctx = this.ensureContext();
    if (!ctx) return;

    const now = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (endFreq !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(40, endFreq), now + duration);
    }

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  public playStartGame() {
    const notes = [392, 523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => this.playTone(n, 0.11, 'square', 0.06, i * 0.075));
  }

  public playJump() {
    this.playTone(240, 0.14, 'square', 0.045, 0, 560);
  }

  public playCoin() {
    this.playTone(987.77, 0.07, 'square', 0.05, 0);
    this.playTone(1318.51, 0.18, 'square', 0.05, 0.065);
  }

  public playStar() {
    const notes = [587.33, 739.99, 880, 1174.66];
    notes.forEach((n, i) => this.playTone(n, 0.09, 'triangle', 0.07, i * 0.05));
  }

  public playInteract() {
    this.playTone(440, 0.06, 'square', 0.045, 0);
    this.playTone(659.25, 0.1, 'square', 0.045, 0.055);
  }

  public playDialogueBlip() {
    this.playTone(520 + Math.random() * 120, 0.035, 'square', 0.02, 0);
  }

  public playSecret() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.51, 1567.98];
    notes.forEach((n, i) => this.playTone(n, 0.12, 'triangle', 0.065, i * 0.06));
  }

  public playHit() {
    this.playTone(220, 0.16, 'sawtooth', 0.06, 0, 85);
  }

  public playSuccess() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => this.playTone(n, 0.14, 'square', 0.05, i * 0.08));
  }

  public playVictory() {
    const melody = [
      { f: 523.25, d: 0.12, t: 0 },
      { f: 523.25, d: 0.12, t: 0.14 },
      { f: 523.25, d: 0.12, t: 0.28 },
      { f: 659.25, d: 0.26, t: 0.42 },
      { f: 587.33, d: 0.14, t: 0.72 },
      { f: 659.25, d: 0.14, t: 0.88 },
      { f: 783.99, d: 0.38, t: 1.04 },
    ];
    melody.forEach((m) => this.playTone(m.f, m.d, 'square', 0.055, m.t));
  }

  public playPowerOn() {
    this.playTone(196, 0.16, 'triangle', 0.04, 0, 392);
    this.playTone(523.25, 0.18, 'square', 0.04, 0.12, 783.99);
  }

  public playCrtBoot() {
    // Low CRT degauss hum followed by crisp phosphor tube ping
    this.playTone(88, 0.28, 'triangle', 0.045, 0, 140);
    this.playTone(1174.66, 0.22, 'sine', 0.035, 0.16, 880);
  }

  public playTitleImpact() {
    const notes = [523.25, 659.25, 783.99, 987.77];
    notes.forEach((n, i) => this.playTone(n, 0.14, 'triangle', 0.045, i * 0.055));
  }

  public playWarp() {
    this.playTone(220, 0.45, 'sawtooth', 0.035, 0, 960);
    this.playTone(440, 0.4, 'triangle', 0.04, 0.06, 1320);
  }

  public playLand() {
    this.playTone(180, 0.12, 'triangle', 0.06, 0, 72);
    this.playTone(392, 0.08, 'square', 0.035, 0.06, 523.25);
  }

  public playArcadeRoomEnter() {
    // Soft deep synth pad hum entering the darkened arcade hall
    this.playTone(110, 0.45, 'triangle', 0.03, 0, 146.83);
    this.playTone(220, 0.4, 'sine', 0.02, 0.08, 293.66);
  }

  public playArcadeGlitch() {
    // Short subtle retro CRT sync burst
    this.playTone(620, 0.05, 'sawtooth', 0.025, 0, 180);
    this.playTone(310, 0.06, 'square', 0.02, 0.055, 880);
    this.playTone(140, 0.12, 'triangle', 0.025, 0.11, 95);
  }

  public playArcadePowerStep(step: number = 0) {
    // Soft staggered CRT power-on hum as corridor machines awaken one by one
    const baseFreq = 180 + step * 75;
    this.playTone(baseFreq, 0.14, 'triangle', 0.022, 0, baseFreq * 1.45);
  }

  public playPixelAssembleLock() {
    // Deep warm phosphor thump + crystalline lock chord when GAME OVER snaps into place
    this.playTone(92, 0.32, 'triangle', 0.05, 0, 58);
    this.playTone(392, 0.18, 'square', 0.03, 0.02);
    this.playTone(523.25, 0.24, 'triangle', 0.035, 0.07);
    this.playTone(783.99, 0.34, 'sine', 0.03, 0.12);
  }

  public startBgm() {
    if (this.muted || !this.bgmEnabled || this.bgmTimer !== null) return;
    // Gentle 8-bit ambient arpeggio loop (calm midnight adventure vibe)
    const bassPattern = [130.81, 130.81, 164.81, 196.0, 146.83, 146.83, 174.61, 196.0];
    const leadPattern = [523.25, 0, 659.25, 783.99, 587.33, 0, 659.25, 880.0];

    this.bgmTimer = window.setInterval(() => {
      if (this.muted || !this.bgmEnabled) return;
      const idx = this.bgmStep % bassPattern.length;
      this.playTone(bassPattern[idx], 0.22, 'triangle', 0.022, 0);
      const lead = leadPattern[idx];
      if (lead > 0) {
        this.playTone(lead, 0.16, 'sine', 0.018, 0.04);
      }
      this.bgmStep++;
    }, 320);
  }

  public stopBgm() {
    if (this.bgmTimer !== null) {
      clearInterval(this.bgmTimer);
      this.bgmTimer = null;
    }
  }
}

export const soundEngine = new RetroSoundEngine();
