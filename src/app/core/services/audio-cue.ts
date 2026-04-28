import { Injectable } from '@angular/core';

type WaveType = 'sine' | 'square' | 'triangle' | 'sawtooth';

interface WindowWithWebkitAudio {
  AudioContext?: typeof AudioContext;
  webkitAudioContext?: typeof AudioContext;
}

@Injectable({ providedIn: 'root' })
export class AudioCue {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private enabled = false;

  setEnabled(value: boolean): void {
    this.enabled = value;
    if (value) this.init();
    if (this.ctx && this.ctx.state === 'suspended') {
      void this.ctx.resume();
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  tick(): void {
    this.beep(2400, 0.04, 'square', 0.3);
  }

  secondTick(): void {
    this.beep(1800, 0.025, 'square', 0.2);
  }

  confirm(): void {
    this.beep(880, 0.08, 'sine', 0.5);
    setTimeout(() => this.beep(1320, 0.1, 'sine', 0.5), 60);
  }

  select(): void {
    this.beep(1100, 0.05, 'triangle', 0.4);
  }

  alarm(): void {
    this.beep(660, 0.12, 'square', 0.6);
    setTimeout(() => this.beep(440, 0.18, 'square', 0.6), 130);
  }

  log(): void {
    this.beep(2000, 0.02, 'square', 0.2);
  }

  private init(): void {
    if (this.ctx) return;
    try {
      const w = window as Window & WindowWithWebkitAudio;
      const Ctor = w.AudioContext ?? w.webkitAudioContext;
      if (!Ctor) return;
      this.ctx = new Ctor();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.06;
      this.masterGain.connect(this.ctx.destination);
    } catch {
      this.ctx = null;
    }
  }

  private beep(freq: number, dur: number, type: WaveType, vol: number): void {
    if (!this.enabled || !this.ctx || !this.masterGain) return;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, this.ctx.currentTime);
    g.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.005);
    g.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + dur);
    osc.connect(g);
    g.connect(this.masterGain);
    osc.start();
    osc.stop(this.ctx.currentTime + dur + 0.05);
  }
}
