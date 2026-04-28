import { Injectable, signal } from '@angular/core';
import type { ToastTone } from '../models/common';

export interface ToastMessage {
  msg: string;
  tone: ToastTone;
  ts: number;
}

@Injectable({ providedIn: 'root' })
export class Toast {
  private readonly _current = signal<ToastMessage | null>(null);
  private timer: ReturnType<typeof setTimeout> | null = null;

  readonly current = this._current.asReadonly();

  show(msg: string, tone: ToastTone = 'amber', durationMs = 2400): void {
    if (this.timer) clearTimeout(this.timer);
    const ts = Date.now();
    this._current.set({ msg, tone, ts });
    this.timer = setTimeout(() => {
      const c = this._current();
      if (c && c.ts === ts) this._current.set(null);
    }, durationMs);
  }

  dismiss(): void {
    if (this.timer) clearTimeout(this.timer);
    this._current.set(null);
  }
}
