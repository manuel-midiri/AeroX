import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { I18n } from '../../core/services/i18n';
import { Dot } from '../../shared/ui/atoms/dot/dot';

@Component({
  selector: 'app-statusbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Dot],
  template: `
    <footer class="statusbar">
      <div><app-dot tone="green" /> <b>{{ i18n.t('fb.sysNominal') }}</b></div>
      <div><span class="dim">{{ i18n.t('fb.uplink') }}</span> <b>S-BAND 2.2 GHz</b></div>
      <div><span class="dim">{{ i18n.t('fb.downlink') }}</span> <b>X-BAND 8.4 GHz</b></div>
      <div><span class="dim">{{ i18n.t('fb.crypt') }}</span> <b>AES-256 / KU-OK</b></div>
      <div class="sb-spacer"></div>
      <div><span class="dim">{{ i18n.t('fb.operator') }}</span> <b>7841 · {{ i18n.t('fb.active') }}</b></div>
      <div><span class="dim">{{ i18n.t('fb.shift') }}</span> <b>BLUE 02</b></div>
      <div><app-dot tone="amber" /> <b>{{ i18n.t('fb.rangeGreen') }}</b></div>
    </footer>
  `,
})
export class Statusbar {
  protected readonly i18n = inject(I18n);
}
