import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { I18n } from '../../core/services/i18n';
import { Panel } from '../../shared/ui/atoms/panel/panel';
import { Dot } from '../../shared/ui/atoms/dot/dot';
import { Countdown } from './countdown/countdown';
import { TelemetryPanel } from './telemetry-panel/telemetry-panel';
import { GoNoGo } from './go-no-go/go-no-go';
import { WorldClock } from './world-clock/world-clock';
import { AscentProfile } from './ascent-profile/ascent-profile';
import { AlarmPanel } from './alarm-panel/alarm-panel';
import { SignalLog } from './signal-log/signal-log';
import { fmtNum } from '../../shared/utils/format';
import type { Upcoming } from '../../core/models/upcoming';

@Component({
  selector: 'app-ops',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Panel,
    Dot,
    Countdown,
    TelemetryPanel,
    GoNoGo,
    WorldClock,
    AscentProfile,
    AlarmPanel,
    SignalLog,
  ],
  template: `
    <app-world-clock />

    <div class="hero">
      <div class="hero-main">
        <div class="hero-content">
          <div class="hero-tag">
            <app-dot tone="amber" /> {{ i18n.t('hero.tag') }}
          </div>
          <div class="hero-name">{{ launch().name }}</div>
          <div class="hero-flight">
            {{ i18n.t('hero.flight') }} <b>#{{ launch().flight_number }}</b> · {{ launch().rocket }} · {{ launch().launchpad }}
          </div>

          <app-countdown [targetIso]="targetIso()" />

          <div class="hero-meta-grid">
            <div class="hero-meta-item">
              <div class="k">{{ i18n.t('hero.payloadMass') }}</div>
              <div class="v">{{ payloadMass() }} kg <span class="dim">/ {{ launch().payload_count }} {{ i18n.t('hero.units') }}</span></div>
            </div>
            <div class="hero-meta-item">
              <div class="k">{{ i18n.t('hero.targetOrbit') }}</div>
              <div class="v cyan">{{ launch().orbit }}</div>
            </div>
            <div class="hero-meta-item">
              <div class="k">{{ i18n.t('hero.booster') }}</div>
              <div class="v">{{ launch().booster }} <span class="dim">· {{ i18n.t('hero.flightSuffix') }}</span></div>
            </div>
            <div class="hero-meta-item">
              <div class="k">{{ i18n.t('hero.recovery') }}</div>
              <div class="v">{{ launch().droneship }}</div>
            </div>
            <div class="hero-meta-item">
              <div class="k">{{ i18n.t('hero.staticFire') }}</div>
              <div class="v"><span class="green">{{ i18n.t('hero.staticFire.complete') }}</span></div>
            </div>
            <div class="hero-meta-item">
              <div class="k">{{ i18n.t('hero.window') }}</div>
              <div class="v">{{ windowHours() }}h <span class="dim">{{ i18n.t('hero.instantaneous') }}</span></div>
            </div>
          </div>

          <div class="objectives">
            <div class="objectives-title">{{ i18n.t('hero.objectives') }}</div>
            <ul>
              @for (obj of launch().objectives; track $index) {
                <li>{{ obj }}</li>
              }
            </ul>
          </div>
        </div>

        <div class="hero-side">
          <div class="patch-frame">
            @if (showPatch()) {
              <img
                [src]="launch().patch"
                [alt]="launch().name + ' mission patch'"
                class="patch-img"
                (error)="onPatchError()"
              />
            } @else {
              <div class="patch-placeholder">
                <span>{{ i18n.t('hero.patch.title') }}<br />{{ launch().name }}</span>
              </div>
            }
          </div>
          <div class="patch-classified">{{ i18n.t('hero.patch.classified') }}</div>
        </div>
      </div>

      <div class="col" style="gap: 18px;">
        <app-telemetry-panel
          [rangeStatus]="launch().range_status"
          [weatherGo]="launch().weather_go"
        />
        <app-go-no-go />
      </div>
    </div>

    <div class="hero-extras">
      <app-panel [title]="i18n.t('ascent.title')" meta="T+0 → T+540s">
        <div class="ascent-svg-wrap">
          <app-ascent-profile />
        </div>
      </app-panel>
      <app-panel [title]="i18n.t('alarm.title')" [meta]="i18n.t('alarm.armed')">
        <app-alarm-panel />
      </app-panel>
    </div>

    <div style="margin-bottom: 18px;">
      <app-panel [title]="i18n.t('log.title')" [meta]="i18n.t('log.live')">
        <app-signal-log />
      </app-panel>
    </div>
  `,
})
export class Ops {
  protected readonly i18n = inject(I18n);
  readonly launch = input.required<Upcoming>();

  private readonly patchError = signal(false);

  protected readonly showPatch = computed(() => !this.patchError() && !!this.launch().patch);

  protected readonly targetIso = computed<string | null>(() => this.launch().date_utc ?? null);

  protected readonly payloadMass = computed(() => fmtNum(this.launch().payload_mass));

  protected readonly windowHours = computed(() => Math.floor(this.launch().window_seconds / 3600));

  protected onPatchError(): void {
    this.patchError.set(true);
  }
}
