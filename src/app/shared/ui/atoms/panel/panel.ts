import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="panel">
      <div class="panel-corner-tl"></div>
      <div class="panel-corner-tr"></div>
      <div class="panel-corner-bl"></div>
      <div class="panel-corner-br"></div>
      @if (title()) {
        <div class="panel-head">
          <div class="panel-title">{{ title() }}</div>
          @if (meta()) {
            <div class="panel-meta">{{ meta() }}</div>
          }
        </div>
      }
      <ng-content />
    </div>
  `,
})
export class Panel {
  readonly title = input<string>('');
  readonly meta = input<string>('');
}
