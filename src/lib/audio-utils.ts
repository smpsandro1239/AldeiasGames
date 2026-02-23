/**
 * Utilitários para a Web Audio API do Aldeias Games.
 * Fornece sons processuais sem necessidade de ficheiros externos.
 */

class SoundEngine {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  private playTone(freq: number, type: OscillatorType, duration: number, volume: number) {
    this.init();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

    gain.gain.setValueAtTime(volume, this.ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start();
    osc.stop(this.ctx.currentTime + duration);
  }

  playWin() {
    this.playTone(523.25, 'sine', 0.1, 0.2); // C5
    setTimeout(() => this.playTone(659.25, 'sine', 0.1, 0.2), 100); // E5
    setTimeout(() => this.playTone(783.99, 'sine', 0.3, 0.2), 200); // G5
  }

  playClick() {
    this.playTone(440, 'triangle', 0.05, 0.1);
  }

  playScratch() {
    this.playTone(Math.random() * 100 + 200, 'sawtooth', 0.02, 0.05);
  }

  playError() {
    this.playTone(110, 'square', 0.3, 0.1);
  }
}

export const soundEngine = new SoundEngine();
