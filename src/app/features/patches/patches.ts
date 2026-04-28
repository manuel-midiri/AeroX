import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { I18n } from '../../core/services/i18n';
import type { Launch } from '../../core/models/launch';

interface PatchView {
  launch: Launch;
  fallbackStyle: string;
  fallbackText: string;
  hasPatch: boolean;
}

@Component({
  selector: 'app-patches',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <div class="section-h">
        <h3>{{ i18n.t('patches.heading') }}</h3>
        <div class="sh-meta">
          {{ i18n.t('patches.insignia') }} <b>{{ launches().length }}</b> · {{ i18n.t('patches.official') }}
        </div>
      </div>

      <div class="patches-gallery">
        @for (v of views(); track v.launch.id) {
          <button
            type="button"
            class="patch-card"
            (click)="onSelect(v.launch)"
            [title]="v.launch.name"
            [attr.aria-label]="v.launch.name"
          >
            @if (v.hasPatch && !errors().has(v.launch.id)) {
              <img
                [src]="v.launch.patch"
                [alt]="v.launch.name + ' patch'"
                class="patch-img-full"
                loading="lazy"
                (error)="onPatchError(v.launch.id)"
              />
            } @else {
              <div class="patch-fallback" [style]="v.fallbackStyle">
                {{ v.fallbackText }}
              </div>
            }
            <div class="patch-card-label">FL #{{ v.launch.flight_number }}</div>
          </button>
        }
      </div>
    </div>
  `,
  styles: [
    `
      .patch-fallback {
        width: 82%;
        height: 82%;
        border-radius: 50%;
        border: 1px dashed rgba(255, 179, 71, 0.4);
        display: grid;
        place-items: center;
        font-family: var(--display);
        font-size: 11px;
        font-weight: 600;
        color: var(--amber);
        letter-spacing: 0.05em;
        text-align: center;
        padding: 6px;
        line-height: 1.1;
      }
    `,
  ],
})
export class Patches {
  protected readonly i18n = inject(I18n);

  readonly launches = input.required<readonly Launch[]>();
  readonly select = output<Launch>();

  protected readonly errors = signal<Set<string>>(new Set());

  protected readonly views = computed<readonly PatchView[]>(() =>
    this.launches().map((launch) => {
      const seed = (launch.flight_number * 47) % 360;
      const fallbackStyle = `background: radial-gradient(circle at 35% 30%, var(--amber-soft), transparent 65%), repeating-linear-gradient(${seed}deg, rgba(255,179,71,0.12) 0 6px, transparent 6px 14px), var(--bg-1);`;
      const fallbackText = launch.name.split(' ').slice(0, 2).join(' ').toUpperCase();
      return {
        launch,
        fallbackStyle,
        fallbackText,
        hasPatch: !!launch.patch,
      };
    })
  );

  protected onSelect(l: Launch): void {
    this.select.emit(l);
  }

  protected onPatchError(id: string): void {
    this.errors.update((curr) => {
      const next = new Set(curr);
      next.add(id);
      return next;
    });
  }
}
