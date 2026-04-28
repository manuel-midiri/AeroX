import { ChangeDetectionStrategy, Component } from '@angular/core';

type AlarmTone = 'ok' | 'amber' | 'red';

interface AlarmItem {
  sys: string;
  state: string;
  tone: AlarmTone;
}

const ITEMS: readonly AlarmItem[] = [
  { sys: 'PROP', state: 'OK', tone: 'ok' },
  { sys: 'AVIONICS', state: 'OK', tone: 'ok' },
  { sys: 'GNC', state: 'OK', tone: 'ok' },
  { sys: 'TVC', state: 'OK', tone: 'ok' },
  { sys: 'FTS', state: 'ARM', tone: 'amber' },
  { sys: 'RANGE', state: 'OK', tone: 'ok' },
  { sys: 'WX', state: 'WATCH', tone: 'amber' },
  { sys: 'RECOV', state: 'OK', tone: 'ok' },
  { sys: 'TELEM', state: 'OK', tone: 'ok' },
  { sys: 'POWER', state: 'OK', tone: 'ok' },
  { sys: 'THERMAL', state: 'OK', tone: 'ok' },
  { sys: 'COMM', state: 'OK', tone: 'ok' },
];

@Component({
  selector: 'app-alarm-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="alarm-grid">
      @for (item of items; track item.sys) {
        <div
          class="alarm-cell"
          [class.ok]="item.tone === 'ok'"
          [class.amber]="item.tone === 'amber'"
          [class.red]="item.tone === 'red'"
        >
          <div class="al-sys">{{ item.sys }}</div>
          <div class="al-state">{{ item.state }}</div>
        </div>
      }
    </div>
  `,
})
export class AlarmPanel {
  protected readonly items = ITEMS;
}
