import { ChangeDetectionStrategy, Component, computed, inject, input, signal } from '@angular/core';
import { I18n } from '../../core/services/i18n';
import type { CrewMember, CrewStatus } from '../../core/models/crew';

type CrewFilter = 'ALL' | CrewStatus;

interface CrewView {
  member: CrewMember;
  initials: string;
  tone: 'green' | 'amber' | 'dim';
}

const FILTERS: readonly CrewFilter[] = ['ALL', 'ACTIVE', 'TRAINING', 'RESERVE'];

@Component({
  selector: 'app-crew',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div>
      <div class="section-h">
        <h3>{{ i18n.t('crew.heading') }}</h3>
        <div class="sh-meta">
          {{ i18n.t('crew.personnel') }} <b>{{ crew().length }}</b> ·
          {{ i18n.t('crew.active') }} <b>{{ activeCount() }}</b>
        </div>
      </div>

      <div class="filterbar">
        @for (f of filters; track f) {
          <button
            type="button"
            class="chip"
            [class.active]="filter() === f"
            (click)="setFilter(f)"
          >{{ f }}</button>
        }
      </div>

      <div class="crew-grid">
        @for (v of views(); track v.member.name) {
          <article class="crew-card">
            <div class="crew-avatar" aria-hidden="true">{{ v.initials }}</div>
            <div class="crew-name">{{ v.member.name }}</div>
            <div class="crew-role">{{ v.member.role }}</div>
            <div class="crew-meta">
              <div>{{ i18n.t('crew.col.agency') }} <b class="amber">{{ v.member.agency }}</b></div>
              <div>
                {{ i18n.t('crew.col.status') }}
                <b [class.green]="v.tone === 'green'" [class.amber]="v.tone === 'amber'" [class.dim]="v.tone === 'dim'">● {{ v.member.status }}</b>
              </div>
              <div>{{ i18n.t('crew.col.missions') }} <b>{{ v.member.missions }}</b></div>
              <div>{{ i18n.t('crew.col.last') }} <b class="dim">{{ v.member.last }}</b></div>
            </div>
          </article>
        }
      </div>
    </div>
  `,
})
export class Crew {
  protected readonly i18n = inject(I18n);

  readonly crew = input.required<readonly CrewMember[]>();

  protected readonly filters = FILTERS;
  protected readonly filter = signal<CrewFilter>('ALL');

  protected readonly views = computed<readonly CrewView[]>(() => {
    const f = this.filter();
    const list = f === 'ALL' ? this.crew() : this.crew().filter((c) => c.status === f);
    return list.map((member) => ({
      member,
      initials: member.name
        .split(' ')
        .map((w) => w[0] ?? '')
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      tone:
        member.status === 'ACTIVE'
          ? 'green'
          : member.status === 'TRAINING'
            ? 'amber'
            : 'dim',
    }));
  });

  protected readonly activeCount = computed(
    () => this.crew().filter((c) => c.status === 'ACTIVE').length
  );

  protected setFilter(f: CrewFilter): void {
    this.filter.set(f);
  }
}
