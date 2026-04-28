import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { I18n } from '../../../core/services/i18n';
import { Panel } from '../../../shared/ui/atoms/panel/panel';

interface PollItem {
  key: string;
  state: 'GO' | 'NO-GO' | 'HOLD';
}

@Component({
  selector: 'app-go-no-go',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Panel],
  template: `
    <app-panel [title]="i18n.t('telem.gono.title')" [meta]="i18n.t('telem.gono.t15')">
      @for (item of items(); track item.key) {
        <div class="telem-row">
          <span class="k">{{ item.key }}</span>
          <span class="v go">● {{ item.state }}</span>
        </div>
      }
    </app-panel>
  `,
})
export class GoNoGo {
  protected readonly i18n = inject(I18n);

  protected readonly items = computed<readonly PollItem[]>(() => [
    { key: this.i18n.t('gono.fd'), state: 'GO' },
    { key: this.i18n.t('gono.booster'), state: 'GO' },
    { key: this.i18n.t('gono.avionics'), state: 'GO' },
    { key: this.i18n.t('gono.prop'), state: 'GO' },
    { key: this.i18n.t('gono.gnc'), state: 'GO' },
    { key: this.i18n.t('gono.range'), state: 'GO' },
    { key: this.i18n.t('gono.wx'), state: 'GO' },
    { key: this.i18n.t('gono.recovery'), state: 'GO' },
  ]);
}
