import { Injectable, effect, signal } from '@angular/core';
import type { Tweaks } from '../models/common';

const STORAGE_KEY = 'aerox.tweaks';

const DEFAULT_TWEAKS: Tweaks = {
  theme: 'amber',
  density: 'comfy',
  scanlines: false,
  audio: false,
  language: 'en',
  dataSource: 'live',
};

function loadFromStorage(): Tweaks {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_TWEAKS;
    const parsed = JSON.parse(raw) as Partial<Tweaks>;
    return { ...DEFAULT_TWEAKS, ...parsed };
  } catch {
    return DEFAULT_TWEAKS;
  }
}

@Injectable({ providedIn: 'root' })
export class TweaksStore {
  private readonly _tweaks = signal<Tweaks>(loadFromStorage());

  readonly tweaks = this._tweaks.asReadonly();

  constructor() {
    effect(() => {
      const t = this._tweaks();
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(t));
      } catch {
        /* localStorage may be unavailable; ignore */
      }
      const body = document.body;
      body.dataset['theme'] = t.theme;
      body.dataset['density'] = t.density;
      body.dataset['scanlines'] = String(t.scanlines);
    });
  }

  set<K extends keyof Tweaks>(key: K, value: Tweaks[K]): void {
    this._tweaks.update((curr) => ({ ...curr, [key]: value }));
  }
}
