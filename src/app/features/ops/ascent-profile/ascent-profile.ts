import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { I18n } from '../../../core/services/i18n';

const W = 600;
const H = 220;
const PAD_LEFT = 44;
const PAD_RIGHT = 30;
const PAD_TOP = 36;
const PAD_BOTTOM = 30;
const MAX_ALT = 250;
const MAX_VEL = 8000;
const MAX_T = 540;

interface AscentEvent {
  s: number;
  label: string;
  level: 0 | 1;
  anchor: 'start' | 'end';
}

@Component({
  selector: 'app-ascent-profile',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.viewBox]="'0 0 ' + W + ' ' + H"
      preserveAspectRatio="xMidYMid meet"
      style="width: 100%; height: 100%;"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="altFillGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="var(--amber)" stop-opacity="0.25" />
          <stop offset="100%" stop-color="var(--amber)" stop-opacity="0" />
        </linearGradient>
      </defs>

      @for (i of horizGrid; track i) {
        <line
          [attr.x1]="PAD_LEFT"
          [attr.y1]="PAD_TOP + i * (H - PAD_TOP - PAD_BOTTOM) / 4"
          [attr.x2]="W - PAD_RIGHT"
          [attr.y2]="PAD_TOP + i * (H - PAD_TOP - PAD_BOTTOM) / 4"
          stroke="var(--line)"
          stroke-dasharray="2 4"
        />
      }
      @for (i of vertGrid; track i) {
        <line
          [attr.x1]="PAD_LEFT + i * (W - PAD_LEFT - PAD_RIGHT) / 6"
          [attr.y1]="PAD_TOP"
          [attr.x2]="PAD_LEFT + i * (W - PAD_LEFT - PAD_RIGHT) / 6"
          [attr.y2]="H - PAD_BOTTOM"
          stroke="var(--line)"
          stroke-dasharray="2 4"
        />
      }

      <line [attr.x1]="PAD_LEFT" [attr.y1]="H - PAD_BOTTOM" [attr.x2]="W - PAD_RIGHT" [attr.y2]="H - PAD_BOTTOM" stroke="var(--line-2)" />
      <line [attr.x1]="PAD_LEFT" [attr.y1]="PAD_TOP" [attr.x2]="PAD_LEFT" [attr.y2]="H - PAD_BOTTOM" stroke="var(--line-2)" />

      <path [attr.d]="altFill()" fill="url(#altFillGrad)" />
      <path [attr.d]="altPath()" fill="none" stroke="var(--amber)" stroke-width="1.4" />
      <path [attr.d]="velPath()" fill="none" stroke="var(--cyan)" stroke-width="1.4" stroke-dasharray="3 2" />

      @for (ev of events(); track ev.s) {
        <g>
          <line
            [attr.x1]="px(ev.s)"
            [attr.y1]="PAD_TOP"
            [attr.x2]="px(ev.s)"
            [attr.y2]="H - PAD_BOTTOM"
            stroke="var(--amber)"
            stroke-dasharray="1 3"
            opacity="0.55"
          />
          <text
            [attr.x]="ev.anchor === 'end' ? px(ev.s) - 3 : px(ev.s) + 3"
            [attr.y]="ev.level === 0 ? PAD_TOP - 14 : PAD_TOP - 4"
            [attr.text-anchor]="ev.anchor"
            font-family="JetBrains Mono"
            font-size="8"
            fill="var(--amber)"
            letter-spacing="1"
          >{{ ev.label }}</text>
        </g>
      }

      <text [attr.x]="PAD_LEFT - 6" [attr.y]="PAD_TOP + 4" text-anchor="end" font-family="JetBrains Mono" font-size="8" fill="var(--text-2)">{{ MAX_ALT }}</text>
      <text [attr.x]="PAD_LEFT - 6" [attr.y]="H - PAD_BOTTOM" text-anchor="end" font-family="JetBrains Mono" font-size="8" fill="var(--text-2)">0</text>

      <text [attr.x]="6" [attr.y]="14" text-anchor="start" font-family="JetBrains Mono" font-size="8" fill="var(--amber)" letter-spacing="1">{{ i18n.t('ascent.altLabel') }}</text>
      <text [attr.x]="W - 6" [attr.y]="14" text-anchor="end" font-family="JetBrains Mono" font-size="8" fill="var(--cyan)" letter-spacing="1">{{ i18n.t('ascent.velLabel') }}</text>
      <text [attr.x]="W - PAD_RIGHT" [attr.y]="H - 8" text-anchor="end" font-family="JetBrains Mono" font-size="8" fill="var(--text-2)">{{ i18n.t('ascent.timeLabel') }} →</text>
    </svg>
  `,
})
export class AscentProfile {
  protected readonly i18n = inject(I18n);

  protected readonly W = W;
  protected readonly H = H;
  protected readonly PAD_LEFT = PAD_LEFT;
  protected readonly PAD_RIGHT = PAD_RIGHT;
  protected readonly PAD_TOP = PAD_TOP;
  protected readonly PAD_BOTTOM = PAD_BOTTOM;
  protected readonly MAX_ALT = MAX_ALT;
  protected readonly horizGrid = [0, 1, 2, 3, 4] as const;
  protected readonly vertGrid = [0, 1, 2, 3, 4, 5, 6] as const;

  private readonly points = (() => {
    const arr: { s: number; alt: number; vel: number }[] = [];
    for (let s = 0; s <= MAX_T; s += 6) {
      const alt = (MAX_ALT * 0.8) / (1 + Math.exp(-(s - 240) / 70));
      const vel = (MAX_VEL * 0.975) / (1 + Math.exp(-(s - 250) / 60));
      arr.push({ s, alt, vel });
    }
    return arr;
  })();

  protected readonly events = computed<readonly AscentEvent[]>(() => [
    { s: 78, label: this.i18n.t('ascent.maxq'), level: 0, anchor: 'start' },
    { s: 162, label: this.i18n.t('ascent.meco'), level: 0, anchor: 'start' },
    { s: 168, label: this.i18n.t('ascent.sep'), level: 1, anchor: 'start' },
    { s: 510, label: this.i18n.t('ascent.seco'), level: 0, anchor: 'end' },
    { s: 530, label: this.i18n.t('ascent.deploy'), level: 1, anchor: 'end' },
  ]);

  protected px(s: number): number {
    return PAD_LEFT + (s / MAX_T) * (W - PAD_LEFT - PAD_RIGHT);
  }

  private pyA(a: number): number {
    return H - PAD_BOTTOM - (a / MAX_ALT) * (H - PAD_TOP - PAD_BOTTOM);
  }

  private pyV(v: number): number {
    return H - PAD_BOTTOM - (v / MAX_VEL) * (H - PAD_TOP - PAD_BOTTOM);
  }

  protected readonly altPath = computed(
    () => 'M ' + this.points.map((p) => this.px(p.s) + ' ' + this.pyA(p.alt)).join(' L ')
  );

  protected readonly velPath = computed(
    () => 'M ' + this.points.map((p) => this.px(p.s) + ' ' + this.pyV(p.vel)).join(' L ')
  );

  protected readonly altFill = computed(
    () =>
      `${this.altPath()} L ${this.px(MAX_T)} ${H - PAD_BOTTOM} L ${this.px(0)} ${H - PAD_BOTTOM} Z`
  );
}
