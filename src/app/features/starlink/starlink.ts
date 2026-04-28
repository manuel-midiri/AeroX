import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  signal,
} from '@angular/core';
import { I18n } from '../../core/services/i18n';
import { fmtNum } from '../../shared/utils/format';
import type { Starlink as StarlinkData } from '../../core/models/starlink';

interface SatPos {
  r: number;
  baseAngle: number;
  shell: number;
}

interface ShellRing {
  rx: number;
  ry: number;
  rotate: number;
}

const CX = 250;
const CY = 250;

@Component({
  selector: 'app-starlink',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <div class="section-h">
        <h3>{{ i18n.t('starlink.heading') }}</h3>
        <div class="sh-meta">
          {{ i18n.t('starlink.sats') }} <b>{{ totalFmt() }}</b> ·
          {{ i18n.t('starlink.ops') }} <b>{{ opsFmt() }}</b>
        </div>
      </div>

      <div class="bigstat">
        <div class="bigstat-cell">
          <div class="k">{{ i18n.t('starlink.totalDeployed') }}</div>
          <div class="v">{{ totalFmt() }}</div>
        </div>
        <div class="bigstat-cell">
          <div class="k">{{ i18n.t('starlink.operational') }}</div>
          <div class="v cyan">{{ opsFmt() }}</div>
        </div>
        <div class="bigstat-cell">
          <div class="k">{{ i18n.t('starlink.coverage') }}</div>
          <div class="v">{{ data().coverage_pct }}<small>%</small></div>
        </div>
        <div class="bigstat-cell">
          <div class="k">{{ i18n.t('starlink.subscribers') }}</div>
          <div class="v">{{ data().subscribers_m }}<small>M</small></div>
        </div>
      </div>

      <div class="starlink-wrap">
        <div class="constellation">
          <svg viewBox="0 0 500 500" preserveAspectRatio="xMidYMid meet" aria-hidden="true">
            <defs>
              <radialGradient id="earthGrad" cx="0.4" cy="0.35" r="0.7">
                <stop offset="0%" stop-color="#1a3a5c" />
                <stop offset="50%" stop-color="#0d1f30" />
                <stop offset="100%" stop-color="#050a14" />
              </radialGradient>
              <radialGradient id="atmGrad" cx="0.5" cy="0.5" r="0.5">
                <stop offset="80%" stop-color="transparent" />
                <stop offset="95%" stop-color="rgba(125,249,255,0.1)" />
                <stop offset="100%" stop-color="transparent" />
              </radialGradient>
            </defs>

            <circle [attr.cx]="CX" [attr.cy]="CY" r="80" fill="url(#earthGrad)" stroke="rgba(125,249,255,0.3)" stroke-width="0.5" />
            <circle [attr.cx]="CX" [attr.cy]="CY" r="84" fill="url(#atmGrad)" />

            @for (lat of latLines; track lat) {
              <ellipse [attr.cx]="CX" [attr.cy]="CY" rx="80" [attr.ry]="latRy(lat)" fill="none" stroke="rgba(125,249,255,0.15)" stroke-width="0.4" />
            }
            @for (a of meridians; track a) {
              <line
                [attr.x1]="CX + cos(a) * 80"
                [attr.y1]="CY + sin(a) * 80"
                [attr.x2]="CX - cos(a) * 80"
                [attr.y2]="CY - sin(a) * 80"
                stroke="rgba(125,249,255,0.15)"
                stroke-width="0.4"
              />
            }

            @for (ring of shellRings(); track $index) {
              <ellipse
                [attr.cx]="CX"
                [attr.cy]="CY"
                [attr.rx]="ring.rx"
                [attr.ry]="ring.ry"
                fill="none"
                stroke="var(--cyan)"
                stroke-width="0.4"
                stroke-dasharray="2 4"
                opacity="0.3"
                [attr.transform]="'rotate(' + ring.rotate + ' ' + CX + ' ' + CY + ')'"
              />
            }

            @for (s of currentSats(); track $index) {
              <circle [attr.cx]="s.x" [attr.cy]="s.y" r="1.4" fill="var(--cyan)" opacity="0.7" />
            }

            <g font-family="JetBrains Mono" font-size="9" fill="var(--text-3)" letter-spacing="1">
              <text x="10" y="20">CONSTELLATION · LIVE</text>
              <text x="10" y="490">5 ORBITAL SHELLS · 540-570 KM</text>
              <text x="490" y="20" text-anchor="end">FRAME ECEF</text>
              <text x="490" y="490" text-anchor="end">REFRESH 60HZ</text>
            </g>
          </svg>
        </div>

        <div class="shell-list">
          <div class="section-h" style="margin-bottom: 4px;">
            <h3 style="font-size: 13px;">{{ i18n.t('starlink.shells') }}</h3>
          </div>
          @for (sh of data().shells; track sh.name) {
            <div class="shell-card">
              <div class="sh-head">
                <div class="sh-name">{{ sh.name }}</div>
                <div class="sh-count">{{ formatNum(sh.count) }} {{ i18n.t('starlink.satsLabel') }}</div>
              </div>
              <div class="sh-meta">
                <span>ALT {{ sh.altitude_km }}km</span>
                <span>INC {{ sh.inclination }}°</span>
              </div>
              <div class="bar"><span [style.width.%]="shellBar(sh.count)"></span></div>
            </div>
          }
          <div class="shell-card" style="margin-top: 6px;">
            <div class="sh-head">
              <div class="sh-name" style="color: var(--amber);">{{ i18n.t('starlink.coverageMap') }}</div>
              <div class="sh-count">{{ data().countries_active }} CC</div>
            </div>
            <div class="sh-meta">
              <span>{{ i18n.t('starlink.countriesActive') }}</span>
              <span>{{ data().countries_active }} / 195</span>
            </div>
            <div class="bar"><span [style.width.%]="coverageBar()"></span></div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class Starlink {
  protected readonly i18n = inject(I18n);
  private readonly destroyRef = inject(DestroyRef);

  readonly data = input.required<StarlinkData>();

  protected readonly CX = CX;
  protected readonly CY = CY;
  protected readonly latLines = [-60, -30, 0, 30, 60] as const;
  protected readonly meridians = [0, 45, 90, 135] as const;

  private readonly tick = signal(0);

  protected readonly sats = computed<readonly SatPos[]>(() => {
    const arr: SatPos[] = [];
    this.data().shells.forEach((sh, sIdx) => {
      const r = 90 + sIdx * 28;
      const count = Math.min(40, Math.floor(sh.count / 50));
      for (let i = 0; i < count; i++) {
        arr.push({
          r,
          baseAngle: (i / count) * Math.PI * 2,
          shell: sIdx,
        });
      }
    });
    return arr;
  });

  protected readonly shellRings = computed<readonly ShellRing[]>(() =>
    this.data().shells.map((_, i) => ({
      rx: 90 + i * 28,
      ry: (90 + i * 28) * 0.85,
      rotate: i * 12,
    }))
  );

  protected readonly currentSats = computed(() => {
    const speed = this.tick() * 0.005;
    return this.sats().map((s) => {
      const angle = s.baseAngle + speed * (1 - s.shell * 0.1);
      return {
        x: CX + Math.cos(angle) * s.r,
        y: CY + Math.sin(angle) * s.r * 0.85,
      };
    });
  });

  protected readonly totalFmt = computed(() => fmtNum(this.data().total_satellites));
  protected readonly opsFmt = computed(() => fmtNum(this.data().operational));

  constructor() {
    let raf = 0;
    const loop = (): void => {
      this.tick.update((t) => t + 1);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    this.destroyRef.onDestroy(() => cancelAnimationFrame(raf));
  }

  protected cos(deg: number): number {
    return Math.cos((deg * Math.PI) / 180);
  }

  protected sin(deg: number): number {
    return Math.sin((deg * Math.PI) / 180);
  }

  protected latRy(lat: number): number {
    return Math.abs(80 * Math.cos((lat * Math.PI) / 180));
  }

  protected shellBar(count: number): number {
    return Math.min(100, count / 16);
  }

  protected readonly coverageBar = computed(() => (this.data().countries_active / 195) * 100);

  protected formatNum(n: number): string {
    return fmtNum(n);
  }
}
