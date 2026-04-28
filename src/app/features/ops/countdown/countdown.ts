import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { I18n } from '../../../core/services/i18n';
import { AudioCue } from '../../../core/services/audio-cue';
import { pad2 } from '../../../shared/utils/format';

interface CountdownTick {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  diff: number;
  tbd: boolean;
}

@Component({
  selector: 'app-countdown',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="countdown" role="timer" [attr.aria-label]="i18n.t('hero.tag')">
      <div class="cd-cell">
        <div class="cd-num">{{ tbd() ? '--' : pad(tick().days) }}</div>
        <div class="cd-label">{{ i18n.t('hero.cd.days') }}</div>
      </div>
      <div class="cd-cell">
        <div class="cd-num">{{ tbd() ? '--' : pad(tick().hours) }}</div>
        <div class="cd-label">{{ i18n.t('hero.cd.hours') }}</div>
      </div>
      <div class="cd-cell">
        <div class="cd-num">{{ tbd() ? '--' : pad(tick().minutes) }}</div>
        <div class="cd-label">{{ i18n.t('hero.cd.min') }}</div>
      </div>
      <div class="cd-cell">
        <div class="cd-num">{{ tbd() ? '--' : pad(tick().seconds) }}</div>
        <div class="cd-label">{{ i18n.t('hero.cd.sec') }}</div>
      </div>
    </div>
  `,
})
export class Countdown {
  protected readonly i18n = inject(I18n);
  private readonly audio = inject(AudioCue);
  private readonly destroyRef = inject(DestroyRef);

  readonly targetIso = input<string | null>(null);

  private readonly now = signal<number>(Date.now());

  protected readonly tick = computed<CountdownTick>(() => {
    const iso = this.targetIso();
    if (!iso) {
      return { days: 0, hours: 0, minutes: 0, seconds: 0, diff: 0, tbd: true };
    }
    const target = new Date(iso).getTime();
    const diff = Math.max(0, target - this.now());
    const days = Math.floor(diff / 86_400_000);
    const hours = Math.floor((diff % 86_400_000) / 3_600_000);
    const minutes = Math.floor((diff % 3_600_000) / 60_000);
    const seconds = Math.floor((diff % 60_000) / 1000);
    return { days, hours, minutes, seconds, diff, tbd: false };
  });

  protected readonly tbd = computed(() => this.tick().tbd);

  constructor() {
    const id = setInterval(() => {
      this.now.set(Date.now());
      if (this.tick().diff > 0) this.audio.secondTick();
    }, 1000);
    this.destroyRef.onDestroy(() => clearInterval(id));
  }

  protected pad(n: number): string {
    return pad2(n);
  }
}
