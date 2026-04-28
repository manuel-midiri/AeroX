import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { I18n } from '../../core/services/i18n';
import { fmtDate } from '../../shared/utils/format';
import type { Pad } from '../../core/models/pad';

interface PadView extends Pad {
  x: number;
  y: number;
  tone: string;
}

@Component({
  selector: 'app-pads',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <div class="section-h">
        <h3>{{ i18n.t('pads.heading') }}</h3>
        <div class="sh-meta">
          {{ i18n.t('pads.padsLabel') }} <b>{{ pads().length }}</b> ·
          {{ i18n.t('pads.activeLabel') }} <b>{{ activeCount() }}</b>
        </div>
      </div>

      <div class="pads-grid">
        <div class="map-panel">
          <svg viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet" class="map-svg" aria-hidden="true">
            <defs>
              <radialGradient id="radarGrad" cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stop-color="var(--amber)" stop-opacity="0.15" />
                <stop offset="60%" stop-color="var(--amber)" stop-opacity="0.04" />
                <stop offset="100%" stop-color="transparent" />
              </radialGradient>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path d="M 50 0 L 0 0 0 50" fill="none" stroke="var(--line)" stroke-width="0.4" />
              </pattern>
            </defs>

            <rect width="1000" height="500" fill="url(#grid)" />

            <line x1="0" y1="250" x2="1000" y2="250" stroke="var(--line-2)" stroke-dasharray="4 6" opacity="0.5" />
            <line x1="0" y1="187" x2="1000" y2="187" stroke="var(--line)" stroke-dasharray="2 6" opacity="0.4" />
            <line x1="0" y1="313" x2="1000" y2="313" stroke="var(--line)" stroke-dasharray="2 6" opacity="0.4" />

            <g fill="var(--bg-2)" stroke="var(--line-2)" stroke-width="0.5">
              <path d="M 130 110 L 200 100 L 280 130 L 290 180 L 250 220 L 200 240 L 170 230 L 140 200 L 110 170 L 115 130 Z" />
              <path d="M 270 260 L 320 270 L 340 320 L 320 380 L 290 410 L 270 380 L 265 320 Z" />
              <path d="M 470 130 L 540 120 L 560 150 L 540 180 L 490 180 L 470 160 Z" />
              <path d="M 490 200 L 570 200 L 590 270 L 570 340 L 540 360 L 510 320 L 490 260 Z" />
              <path d="M 580 110 L 750 110 L 820 150 L 830 200 L 770 230 L 700 220 L 620 200 L 580 160 Z" />
              <path d="M 770 320 L 850 320 L 870 350 L 830 380 L 780 370 L 765 345 Z" />
              <path d="M 350 70 L 400 65 L 410 110 L 380 130 L 350 110 Z" />
            </g>

            <g transform="translate(245, 220)">
              <circle r="80" class="radar-sweep" />
            </g>

            @for (p of padViews(); track p.id) {
              <g class="map-pad" [attr.transform]="'translate(' + p.x + ', ' + p.y + ')'" (click)="selectPad(p.id)">
                <circle class="map-pad-pulse" cx="0" cy="0" r="4" [attr.stroke]="p.tone" />
                <circle cx="0" cy="0" [attr.r]="selectedId() === p.id ? 6 : 4" [attr.fill]="p.tone" />
                <circle cx="0" cy="0" [attr.r]="selectedId() === p.id ? 10 : 7" fill="none" [attr.stroke]="p.tone" stroke-width="0.6" />
                @if (selectedId() === p.id) {
                  <g>
                    <line x1="0" y1="-12" x2="0" y2="-22" [attr.stroke]="p.tone" />
                    <rect x="-50" y="-44" width="100" height="20" fill="var(--bg-0)" [attr.stroke]="p.tone" />
                    <text x="0" y="-30" text-anchor="middle" [attr.fill]="p.tone" font-size="9" font-family="JetBrains Mono" letter-spacing="1">{{ p.name }}</text>
                  </g>
                }
              </g>
            }

            <g font-family="JetBrains Mono" font-size="9" fill="var(--text-3)">
              <text x="10" y="16">LAT/LNG · WGS84</text>
              <text x="10" y="492">SCALE 1:160M · MERCATOR-EQ</text>
              <text x="990" y="16" text-anchor="end">RADAR · ACTIVE</text>
              <text x="990" y="492" text-anchor="end">CONFIDENTIAL</text>
            </g>
          </svg>
        </div>

        <div class="pad-list" role="list">
          @for (p of pads(); track p.id) {
            <button
              type="button"
              class="pad-card"
              [class.active]="selectedId() === p.id"
              (click)="selectPad(p.id)"
            >
              <div class="pc-head">
                <div class="pc-name">{{ p.name }}</div>
                <div class="pc-status" [class.sea]="p.status === 'AT SEA'" [class.port]="p.status === 'PORT'">
                  ● {{ p.status }}
                </div>
              </div>
              <div class="pc-site">{{ p.site }} · {{ p.state }}</div>
              <div class="pc-stats">
                <div><span>{{ i18n.t('pads.col.type') }}</span> {{ p.type }}</div>
                <div><span>{{ i18n.t('pads.col.ops') }}</span> {{ p.launches }}</div>
                <div><span>{{ i18n.t('pads.col.last') }}</span> {{ formatDate(p.last_launch) }}</div>
              </div>
            </button>
          }
        </div>
      </div>
    </div>
  `,
})
export class Pads {
  protected readonly i18n = inject(I18n);

  readonly pads = input.required<readonly Pad[]>();

  protected readonly selectedId = signal<string | null>(null);

  protected readonly activeCount = computed(
    () => this.pads().filter((p) => p.status === 'ACTIVE').length
  );

  protected readonly padViews = computed<readonly PadView[]>(() => {
    return this.pads().map((p) => ({
      ...p,
      x: ((p.lng + 180) / 360) * 1000,
      y: ((90 - p.lat) / 180) * 500,
      tone: p.type === 'Droneship' ? 'var(--cyan)' : 'var(--amber)',
    }));
  });

  protected selectPad(id: string): void {
    this.selectedId.set(id);
  }

  protected formatDate(iso: string): string {
    return fmtDate(iso);
  }
}
