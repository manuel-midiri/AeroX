import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { I18n } from '../../../core/services/i18n';
import { AudioCue } from '../../../core/services/audio-cue';
import { Panel } from '../../../shared/ui/atoms/panel/panel';

interface Telemetry {
  pressure: number;
  lox: number;
  rp1: number;
  voltage: number;
}

@Component({
  selector: 'app-telemetry-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Panel],
  template: `
    <app-panel [title]="i18n.t('telem.title')" [meta]="i18n.t('telem.stream')">
      <div class="telem-row">
        <span class="k">{{ i18n.t('telem.range') }}</span>
        <span class="v go">● {{ rangeStatus() }}</span>
      </div>
      <div class="telem-row">
        <span class="k">{{ i18n.t('telem.weather') }}</span>
        <span class="v amber">{{ weatherGo() }}%</span>
      </div>
      <div class="telem-row">
        <span class="k">{{ i18n.t('telem.padPressure') }}</span>
        <span class="v">{{ tele().pressure }} <span class="dim">psi</span></span>
      </div>
      <div class="telem-row">
        <span class="k">{{ i18n.t('telem.lox') }}</span>
        <span class="v go">{{ tele().lox }}%</span>
      </div>
      <div class="telem-row">
        <span class="k">{{ i18n.t('telem.rp1') }}</span>
        <span class="v go">{{ tele().rp1 }}%</span>
      </div>
      <div class="telem-row">
        <span class="k">{{ i18n.t('telem.voltage') }}</span>
        <span class="v">{{ tele().voltage }} <span class="dim">V</span></span>
      </div>

      <div class="telem-downlink">{{ i18n.t('telem.downlink') }}</div>

      <div class="spark" aria-hidden="true">
        @for (h of bars(); track $index) {
          <span [style.height.%]="h"></span>
        }
      </div>
    </app-panel>
  `,
})
export class TelemetryPanel {
  protected readonly i18n = inject(I18n);
  private readonly audio = inject(AudioCue);
  private readonly destroyRef = inject(DestroyRef);

  readonly rangeStatus = input.required<string>();
  readonly weatherGo = input.required<number>();

  private readonly _tele = signal<Telemetry>({
    pressure: 14.696,
    lox: 96.4,
    rp1: 94.8,
    voltage: 28.2,
  });
  private readonly _bars = signal<readonly number[]>(
    Array.from({ length: 28 }, () => 30 + Math.random() * 60)
  );

  protected readonly tele = this._tele.asReadonly();
  protected readonly bars = this._bars.asReadonly();

  constructor() {
    const teleTimer = setInterval(() => {
      this._tele.set({
        pressure: +(14.7 + (Math.random() - 0.5) * 0.04).toFixed(3),
        lox: +(96 + (Math.random() - 0.5) * 1.2).toFixed(1),
        rp1: +(94.5 + (Math.random() - 0.5) * 1.2).toFixed(1),
        voltage: +(28.1 + (Math.random() - 0.5) * 0.4).toFixed(2),
      });
      this.audio.tick();
    }, 1500);

    const barTimer = setInterval(() => {
      this._bars.update((curr) => {
        const next = curr.slice(1);
        return [...next, 30 + Math.random() * 60];
      });
    }, 600);

    this.destroyRef.onDestroy(() => {
      clearInterval(teleTimer);
      clearInterval(barTimer);
    });
  }
}

