import { DestroyRef, Injectable, OnDestroy, inject } from '@angular/core';

export type HotkeyHandler = (event: KeyboardEvent) => void;

interface HotkeyBinding {
  key: string;
  handler: HotkeyHandler;
}

@Injectable({ providedIn: 'root' })
export class Hotkeys implements OnDestroy {
  private readonly bindings = new Map<symbol, HotkeyBinding>();
  private readonly listener = (e: KeyboardEvent): void => this.dispatch(e);
  private attached = false;

  constructor() {
    inject(DestroyRef).onDestroy(() => this.detach());
  }

  ngOnDestroy(): void {
    this.detach();
  }

  register(key: string, handler: HotkeyHandler): () => void {
    const id = Symbol(key);
    this.bindings.set(id, { key, handler });
    this.attach();
    return () => {
      this.bindings.delete(id);
      if (this.bindings.size === 0) this.detach();
    };
  }

  private attach(): void {
    if (this.attached) return;
    window.addEventListener('keydown', this.listener);
    this.attached = true;
  }

  private detach(): void {
    if (!this.attached) return;
    window.removeEventListener('keydown', this.listener);
    this.attached = false;
  }

  private dispatch(event: KeyboardEvent): void {
    const target = event.target;
    if (target instanceof HTMLElement) {
      const tag = target.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target.isContentEditable) {
        if (event.key !== 'Escape') return;
      }
    }
    for (const binding of this.bindings.values()) {
      if (binding.key === event.key) binding.handler(event);
    }
  }
}
