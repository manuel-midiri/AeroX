import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  output,
  signal,
} from '@angular/core';
import { Clock } from '../../core/services/clock';

interface BootLine {
  html: string;
}

const BOOT_LINES: readonly BootLine[] = [
  { html: '<span class="tag">[INIT]</span> Booting AeroX Mission Control...' },
  { html: '<span class="tag">[NET]</span> Resolving api.spacexdata.com... <span class="ok">OK</span>' },
  { html: '<span class="tag">[AUTH]</span> Operator credentials verified <span class="ok">OK</span>' },
  { html: '<span class="tag">[FEED]</span> Telemetry uplink established... <span class="ok">NOMINAL</span>' },
  { html: '<span class="tag">[FEED]</span> Loading launch manifest... <span class="ok">442 records</span>' },
  { html: '<span class="tag">[FEED]</span> Loading fleet registry... <span class="ok">4 vehicles</span>' },
  { html: '<span class="tag">[FEED]</span> Loading pad telemetry... <span class="ok">9 pads</span>' },
  { html: '<span class="tag">[FEED]</span> Loading crew roster... <span class="ok">35 active</span>' },
  { html: '<span class="tag">[FEED]</span> Loading constellation... <span class="ok">7,820 sats</span>' },
  { html: '<span class="tag">[SYS]</span> Range status... <span class="ok">GREEN</span>' },
  { html: '<span class="tag">[SYS]</span> Console ready. <span class="blink">_</span>' },
];

@Component({
  selector: 'app-boot-sequence',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="boot" [class.fade]="fading()" aria-live="polite">
      <div class="boot-inner">
        <div class="boot-head">
          <span>AEROX // CONSOLE v4.2.1</span>
          <span>{{ utcStamp() }}</span>
        </div>
        <div class="boot-title">MISSION CONTROL</div>
        <div class="boot-sub">SECURE TERMINAL · AUTH: OPERATOR-7841</div>
        <div class="boot-log">
          @for (line of visibleLines(); track $index) {
            <div class="ln" [innerHTML]="line"></div>
          }
        </div>
      </div>
    </div>
  `,
})
export class BootSequence {
  private readonly clock = inject(Clock);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly index = signal(0);
  protected readonly fading = signal(false);
  protected readonly done = output<void>();

  protected readonly visibleLines = computed<readonly string[]>(() => {
    const i = this.index();
    const start = Math.max(0, i - 9);
    return BOOT_LINES.slice(start, i).map((l) => l.html);
  });

  protected readonly utcStamp = computed(() => {
    return this.clock.now().toISOString().slice(11, 19) + ' UTC';
  });

  constructor() {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let unmounted = false;

    const tick = (): void => {
      if (unmounted) return;
      const next = this.index() + 1;
      this.index.set(next);
      if (next >= BOOT_LINES.length) {
        timer = setTimeout(() => {
          if (unmounted) return;
          this.fading.set(true);
          timer = setTimeout(() => {
            if (unmounted) return;
            this.done.emit();
          }, 600);
        }, 500);
        return;
      }
      timer = setTimeout(tick, 140 + Math.random() * 110);
    };

    timer = setTimeout(tick, 200);

    this.destroyRef.onDestroy(() => {
      unmounted = true;
      if (timer) clearTimeout(timer);
    });

    // Touch effect to keep clock signal subscription alive
    effect(() => {
      this.utcStamp();
    });
  }
}
