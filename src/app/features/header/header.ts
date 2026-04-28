import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { I18n } from '../../core/services/i18n';
import { Clock } from '../../core/services/clock';
import { Dot } from '../../shared/ui/atoms/dot/dot';
import { fmtNum } from '../../shared/utils/format';
import type { SrcStatus } from '../../core/models/common';

export interface HeaderStats {
  active: number;
  success: number;
  successRate: number;
  crew: number;
}

@Component({
  selector: 'app-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Dot],
  template: `
    <header class="hdr">
      <div class="hdr-left">
        <div class="hdr-logo"><span>X</span></div>
        <div>
          <div class="hdr-title">{{ i18n.t('console.title') }}</div>
          <div class="hdr-sub">{{ i18n.t('console.sub') }}</div>
        </div>
      </div>

      <div class="hdr-center">
        <div class="hdr-stat">
          <b class="amber">{{ stats().active }}</b>
          {{ i18n.t('stats.activeVehicles') }}
        </div>
        <div class="hdr-stat">
          <b>{{ formatNum(stats().success) }}</b>
          {{ i18n.t('stats.totalLaunches') }}
        </div>
        <div class="hdr-stat">
          <b class="go">{{ stats().successRate }}%</b>
          {{ i18n.t('stats.successRate') }}
        </div>
        <div class="hdr-stat">
          <b>{{ stats().crew }}</b>
          {{ i18n.t('stats.crewOnOrbit') }}
        </div>
      </div>

      <div class="hdr-right">
        <span
          class="src-badge"
          [class.live]="srcStatus() === 'live'"
          [class.cached]="srcStatus() === 'cached' || srcStatus() === 'fetching'"
          [class.error]="srcStatus() === 'error'"
        >
          <app-dot [tone]="srcDotTone()" />
          {{ srcLabel() }}
        </span>
        <div class="live-indicator">
          <app-dot tone="green" />
          <span>{{ i18n.t('telemetry.live') }}</span>
        </div>
        <div class="hdr-clock">
          <span class="dim">UTC </span>
          {{ utcDate() }} <span class="dim">·</span> {{ utcTime() }}
        </div>
      </div>
    </header>
  `,
})
export class Header {
  protected readonly i18n = inject(I18n);
  private readonly clock = inject(Clock);

  readonly stats = input.required<HeaderStats>();
  readonly srcStatus = input.required<SrcStatus>();

  protected readonly utcDate = computed(() => this.clock.now().toISOString().slice(0, 10));
  protected readonly utcTime = computed(() => this.clock.now().toISOString().slice(11, 19));

  protected readonly srcDotTone = computed(() => {
    const s = this.srcStatus();
    if (s === 'live') return 'green' as const;
    if (s === 'error') return 'red' as const;
    return 'amber' as const;
  });

  protected readonly srcLabel = computed(() => {
    const s = this.srcStatus();
    if (s === 'live') return this.i18n.t('src.live');
    if (s === 'error') return this.i18n.t('src.error');
    if (s === 'fetching') return this.i18n.t('src.fetching');
    return this.i18n.t('src.cached');
  });

  protected formatNum(n: number): string {
    return fmtNum(n);
  }
}
