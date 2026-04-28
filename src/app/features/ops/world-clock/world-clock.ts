import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Clock } from '../../../core/services/clock';
import { pad2 } from '../../../shared/utils/format';

interface Site {
  name: string;
  tz: number;
  code: string;
}

interface RenderedSite {
  code: string;
  name: string;
  time: string;
  isDay: boolean;
}

const SITES: readonly Site[] = [
  { name: 'Cape Canaveral', tz: -4, code: 'CCAFS' },
  { name: 'Vandenberg', tz: -7, code: 'VSFB' },
  { name: 'Boca Chica', tz: -5, code: 'BCST' },
  { name: 'Hawthorne', tz: -7, code: 'HTHR' },
  { name: 'Greenwich', tz: 0, code: 'UTC' },
  { name: 'Roma', tz: 2, code: 'ROMA' },
];

@Component({
  selector: 'app-world-clock',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="world-clock-strip">
      @for (site of sites(); track site.code) {
        <div class="wc-cell">
          <div class="wc-code">
            <span class="wc-day" [class.day]="site.isDay" [class.night]="!site.isDay" aria-hidden="true">
              {{ site.isDay ? '☀' : '☾' }}
            </span>
            {{ site.code }}
          </div>
          <div class="wc-time">{{ site.time }}</div>
          <div class="wc-name">{{ site.name }}</div>
        </div>
      }
    </div>
  `,
})
export class WorldClock {
  private readonly clock = inject(Clock);

  protected readonly sites = computed<readonly RenderedSite[]>(() => {
    const now = this.clock.now();
    return SITES.map((s) => {
      const d = new Date(now.getTime() + s.tz * 3_600_000);
      const time =
        pad2(d.getUTCHours()) + ':' + pad2(d.getUTCMinutes()) + ':' + pad2(d.getUTCSeconds());
      const hour = (now.getUTCHours() + s.tz + 24) % 24;
      const isDay = hour >= 6 && hour < 20;
      return { code: s.code, name: s.name, time, isDay };
    });
  });
}
