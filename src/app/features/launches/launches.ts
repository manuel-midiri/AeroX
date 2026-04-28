import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { I18n } from '../../core/services/i18n';
import { Dot } from '../../shared/ui/atoms/dot/dot';
import { fmtDate } from '../../shared/utils/format';
import type { Launch } from '../../core/models/launch';

type RocketFilter = 'ALL' | 'FALCON 9' | 'FALCON HEAVY' | 'STARSHIP';

const FILTERS: readonly RocketFilter[] = ['ALL', 'FALCON 9', 'FALCON HEAVY', 'STARSHIP'];

@Component({
  selector: 'app-launches',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Dot],
  template: `
    <div>
      <div class="section-h">
        <h3>{{ i18n.t('launches.heading') }}</h3>
        <div class="sh-meta">
          {{ i18n.t('launches.showing') }} <b>{{ filtered().length }}</b> / {{ launches().length }} {{ i18n.t('launches.records') }}
        </div>
      </div>

      <div class="filterbar">
        <input
          type="search"
          [attr.placeholder]="i18n.t('launches.search')"
          [value]="query()"
          (input)="onQuery($event)"
          [attr.aria-label]="i18n.t('launches.search')"
        />
        @for (f of filters; track f) {
          <button
            type="button"
            class="chip"
            [class.active]="filter() === f"
            (click)="setFilter(f)"
          >{{ f }}</button>
        }
      </div>

      <div class="list-head" role="row">
        <div>{{ i18n.t('launches.col.flight') }}</div>
        <div>{{ i18n.t('launches.col.patch') }}</div>
        <div>{{ i18n.t('launches.col.mission') }}</div>
        <div>{{ i18n.t('launches.col.vehicle') }}</div>
        <div>{{ i18n.t('launches.col.date') }}</div>
        <div>{{ i18n.t('launches.col.orbit') }}</div>
        <div>{{ i18n.t('launches.col.status') }}</div>
      </div>

      <div class="launch-list" role="list">
        @for (l of filtered(); track l.id) {
          <button
            type="button"
            class="launch-row"
            (click)="onSelect(l)"
            [attr.aria-label]="l.name"
          >
            <div class="lr-num">#{{ l.flight_number }}</div>
            <div class="lr-patch" [class.empty]="!hasPatch(l) || patchErrors().has(l.id)">
              @if (hasPatch(l) && !patchErrors().has(l.id)) {
                <img
                  [src]="l.patch"
                  [alt]="l.name + ' patch'"
                  loading="lazy"
                  (error)="onPatchError(l.id)"
                />
              } @else {
                <div
                  style="width:100%;height:100%;background:radial-gradient(circle, rgba(255,179,71,0.2), transparent 70%);border:1px dashed rgba(255,179,71,0.4);border-radius:50%;"
                  aria-hidden="true"
                ></div>
              }
            </div>
            <div>
              <div class="lr-name">{{ l.name }}</div>
              <div class="lr-details">{{ l.details }}</div>
            </div>
            <div class="lr-rocket">{{ l.rocket }}</div>
            <div class="lr-date">{{ formatDate(l.date) }}</div>
            <div class="lr-orbit">{{ l.orbit }}</div>
            <div class="lr-status" [class.ok]="l.success" [class.fail]="!l.success">
              <app-dot [tone]="l.success ? 'green' : 'red'" />
              {{ l.success ? i18n.t('launches.success') : i18n.t('launches.fail') }}
            </div>
          </button>
        } @empty {
          <div class="empty-state">{{ i18n.t('launches.empty') }}</div>
        }
      </div>
    </div>
  `,
})
export class Launches {
  protected readonly i18n = inject(I18n);

  readonly launches = input.required<readonly Launch[]>();
  readonly select = output<Launch>();

  protected readonly query = signal('');
  protected readonly filter = signal<RocketFilter>('ALL');
  protected readonly patchErrors = signal<Set<string>>(new Set());
  protected readonly filters = FILTERS;

  protected readonly filtered = computed<readonly Launch[]>(() => {
    const list = this.launches();
    const q = this.query().toLowerCase();
    const f = this.filter();
    return list.filter((l) => {
      if (f !== 'ALL') {
        const r = (l.rocket || '').toUpperCase().replace(/\s+/g, '');
        const fNorm = f.replace(/\s+/g, '').toUpperCase();
        if (!r.includes(fNorm)) return false;
      }
      if (q) {
        const inName = l.name.toLowerCase().includes(q);
        const inId = (l.id || '').toLowerCase().includes(q);
        if (!inName && !inId) return false;
      }
      return true;
    });
  });

  protected onQuery(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.query.set(target.value);
  }

  protected setFilter(f: RocketFilter): void {
    this.filter.set(f);
  }

  protected onSelect(l: Launch): void {
    this.select.emit(l);
  }

  protected hasPatch(l: Launch): boolean {
    return !!l.patch;
  }

  protected onPatchError(id: string): void {
    this.patchErrors.update((curr) => {
      const next = new Set(curr);
      next.add(id);
      return next;
    });
  }

  protected formatDate(iso: string): string {
    return fmtDate(iso);
  }
}
