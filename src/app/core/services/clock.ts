import { Injectable, OnDestroy, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class Clock implements OnDestroy {
  private readonly _now = signal<Date>(new Date());
  private readonly intervalId: ReturnType<typeof setInterval>;

  readonly now = this._now.asReadonly();

  constructor() {
    this.intervalId = setInterval(() => this._now.set(new Date()), 1000);
  }

  ngOnDestroy(): void {
    clearInterval(this.intervalId);
  }
}
