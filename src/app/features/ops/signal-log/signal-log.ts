import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  signal,
} from '@angular/core';
import { I18n } from '../../../core/services/i18n';
import { AudioCue } from '../../../core/services/audio-cue';
import { pad2 } from '../../../shared/utils/format';

interface SeedLine {
  src: string;
  msg: string;
}

interface RenderedLine {
  stamp: string;
  src: string;
  msg: string;
  key: string;
}

const SEED: readonly SeedLine[] = [
  { src: 'FD', msg: 'Range green. Proceeding with countdown.' },
  { src: 'BOOSTER', msg: 'Stage one tanking nominal. LOX at 96.4%.' },
  { src: 'GUIDANCE', msg: 'INS alignment complete. Sigma drift 0.003.' },
  { src: 'WX', msg: 'Upper level winds 18 knots. GO for launch.' },
  { src: 'RECOVERY', msg: 'ASOG on station. Sea state 2.' },
  { src: 'PROP', msg: 'RP-1 chill complete. Engine bay temp -8 C.' },
  { src: 'GNC', msg: 'Trajectory loaded. Azimuth 044.2 degrees.' },
  { src: 'FTS', msg: 'Flight termination armed. Signal -91 dBm.' },
  { src: 'RANGE', msg: 'Air space cleared. Marine assets in safe zones.' },
  { src: 'AVIONICS', msg: 'Pyro continuity verified. All channels green.' },
  { src: 'PLF', msg: 'Fairing pneumatics 4500 psi. Latches confirmed.' },
  { src: 'S1', msg: 'Octaweb temps within band. Helium pressed.' },
  { src: 'S2', msg: 'MVac chilldown initiated. T-12:30 cycle.' },
  { src: 'TVC', msg: 'Gimbal sweep complete. ±5° both axes.' },
  { src: 'TELEMETRY', msg: 'Downlink 8.412 GHz. Eb/N0 = 14.3 dB.' },
];

const MAX_LINES = 7;

@Component({
  selector: 'app-signal-log',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="signal-log">
      @for (line of lines(); track line.key) {
        <div class="sl-line">
          <span class="sl-time">{{ line.stamp }}</span>
          <span class="sl-src">[{{ line.src }}]</span>
          <span class="sl-msg">{{ line.msg }}</span>
        </div>
      } @empty {
        <div class="sl-line dim">{{ i18n.t('log.empty') }}</div>
      }
    </div>
  `,
})
export class SignalLog {
  protected readonly i18n = inject(I18n);
  private readonly audio = inject(AudioCue);
  private readonly destroyRef = inject(DestroyRef);

  private readonly _lines = signal<readonly RenderedLine[]>([]);
  protected readonly lines = computed(() => this._lines());

  constructor() {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let alive = true;
    let seq = 0;

    const tick = (): void => {
      if (!alive) return;
      const seedIdx = Math.floor(Math.random() * SEED.length);
      const seedItem: SeedLine = SEED[seedIdx] ?? SEED[0]!;
      const now = new Date();
      const stamp =
        pad2(now.getUTCHours()) + ':' + pad2(now.getUTCMinutes()) + ':' + pad2(now.getUTCSeconds());
      seq += 1;
      const newLine: RenderedLine = {
        stamp,
        src: seedItem.src,
        msg: seedItem.msg,
        key: `${seq}-${stamp}`,
      };
      this._lines.update((curr) => [...curr, newLine].slice(-MAX_LINES));
      this.audio.log();
      timer = setTimeout(tick, 1800 + Math.random() * 2400);
    };

    timer = setTimeout(tick, 800);

    this.destroyRef.onDestroy(() => {
      alive = false;
      if (timer) clearTimeout(timer);
    });
  }
}
