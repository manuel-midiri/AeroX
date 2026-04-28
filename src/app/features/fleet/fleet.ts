import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { I18n } from '../../core/services/i18n';
import { RocketSvg } from './rocket-svg/rocket-svg';
import { fmtDate, fmtNum } from '../../shared/utils/format';
import type { Rocket } from '../../core/models/rocket';

@Component({
  selector: 'app-fleet',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RocketSvg],
  template: `
    @if (selected(); as r) {
      <div class="fleet-grid">
        <div class="fleet-list">
          <div class="section-h" style="margin-bottom: 8px;">
            <h3 style="font-size: 14px;">{{ i18n.t('fleet.heading') }}</h3>
          </div>
          @for (rk of rockets(); track rk.id) {
            <button
              type="button"
              class="fleet-item"
              [class.active]="selectedId() === rk.id"
              (click)="select(rk.id)"
            >
              <div class="fi-name">{{ rk.name }}</div>
              <div class="fi-meta">
                <span>{{ rk.flights }} {{ i18n.t('fleet.flightsSuffix') }}</span>
                <span class="fi-status" [class.active]="rk.status === 'ACTIVE'" [class.development]="rk.status === 'DEVELOPMENT'">
                  ● {{ rk.status }}
                </span>
              </div>
            </button>
          }
        </div>

        <div class="fleet-detail">
          <div class="panel-corner-tl"></div>
          <div class="panel-corner-tr"></div>
          <div class="panel-corner-bl"></div>
          <div class="panel-corner-br"></div>

          <div class="rocket-render">
            <app-rocket-svg [rocketId]="r.id" />
          </div>

          <div class="fleet-info">
            <div class="subtitle">{{ r.family }} Family · {{ r.status }}</div>
            <h2>{{ r.name }}</h2>
            <div class="desc">{{ r.description }}</div>

            <div class="spec-grid">
              <div class="spec">
                <div class="k">{{ i18n.t('fleet.spec.height') }}</div>
                <div class="v">{{ r.height_m }}<small>m</small></div>
              </div>
              <div class="spec">
                <div class="k">{{ i18n.t('fleet.spec.diameter') }}</div>
                <div class="v">{{ r.diameter_m }}<small>m</small></div>
              </div>
              <div class="spec">
                <div class="k">{{ i18n.t('fleet.spec.mass') }}</div>
                <div class="v">{{ massT() }}<small>t</small></div>
              </div>
              <div class="spec">
                <div class="k">{{ i18n.t('fleet.spec.stages') }}</div>
                <div class="v">{{ r.stages }}</div>
              </div>
              <div class="spec">
                <div class="k">{{ i18n.t('fleet.spec.thrust') }}</div>
                <div class="v">{{ thrustNum() }}<small>kN</small></div>
              </div>
              <div class="spec">
                <div class="k">{{ i18n.t('fleet.spec.engines') }}</div>
                <div class="v compact">{{ r.engines }}</div>
              </div>
              <div class="spec">
                <div class="k">{{ i18n.t('fleet.spec.firstFlight') }}</div>
                <div class="v compact">{{ firstFlight() }}</div>
              </div>
              <div class="spec">
                <div class="k">{{ i18n.t('fleet.spec.flights') }}</div>
                <div class="v">{{ r.flights }}</div>
              </div>
              <div class="spec">
                <div class="k">{{ i18n.t('fleet.spec.success') }}</div>
                <div class="v">{{ r.success_rate }}<small>%</small></div>
              </div>
            </div>

            <div class="payload-bars">
              <div class="payload-bar">
                <div class="pb-label">
                  <span>{{ i18n.t('fleet.payload.leo') }}</span>
                  <b>{{ leoFmt() }} kg</b>
                </div>
                <div class="pb-track">
                  <div class="pb-fill" [style.width.%]="leoBar()"></div>
                </div>
              </div>
              <div class="payload-bar">
                <div class="pb-label">
                  <span>{{ i18n.t('fleet.payload.gto') }}</span>
                  <b>{{ gtoLabel() }}</b>
                </div>
                <div class="pb-track">
                  <div class="pb-fill" [style.width.%]="gtoBar()"></div>
                </div>
              </div>
              <div class="payload-bar">
                <div class="pb-label">
                  <span>{{ i18n.t('fleet.payload.cost') }}</span>
                  <b>{{ costLabel() }}</b>
                </div>
                <div class="pb-track">
                  <div class="pb-fill" [style.width.%]="costBar()"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class Fleet {
  protected readonly i18n = inject(I18n);

  readonly rockets = input.required<readonly Rocket[]>();

  protected readonly selectedId = signal<string | null>(null);

  protected readonly selected = computed<Rocket | null>(() => {
    const list = this.rockets();
    if (list.length === 0) return null;
    const id = this.selectedId();
    if (!id) return list[0] ?? null;
    return list.find((r) => r.id === id) ?? list[0] ?? null;
  });

  protected select(id: string): void {
    this.selectedId.set(id);
  }

  protected readonly massT = computed(() => {
    const r = this.selected();
    return r ? (r.mass_kg / 1000).toFixed(0) : '—';
  });

  protected readonly thrustNum = computed(() => {
    const r = this.selected();
    return r ? fmtNum(r.thrust_sl_kn) : '—';
  });

  protected readonly firstFlight = computed(() => {
    const r = this.selected();
    return r ? fmtDate(r.first_flight) : '—';
  });

  protected readonly leoFmt = computed(() => {
    const r = this.selected();
    return r ? fmtNum(r.payload_leo_kg) : '—';
  });

  protected readonly leoBar = computed(() => {
    const r = this.selected();
    return r ? Math.min(100, r.payload_leo_kg / 1500) : 0;
  });

  protected readonly gtoLabel = computed(() => {
    const r = this.selected();
    if (!r) return '—';
    return r.payload_gto_kg ? `${fmtNum(r.payload_gto_kg)} kg` : '—';
  });

  protected readonly gtoBar = computed(() => {
    const r = this.selected();
    return r ? Math.min(100, (r.payload_gto_kg || 0) / 270) : 0;
  });

  protected readonly costLabel = computed(() => {
    const r = this.selected();
    return r ? `$${(r.cost_per_launch / 1_000_000).toFixed(0)}M USD` : '—';
  });

  protected readonly costBar = computed(() => {
    const r = this.selected();
    return r ? Math.min(100, r.cost_per_launch / 1_000_000) : 0;
  });
}
