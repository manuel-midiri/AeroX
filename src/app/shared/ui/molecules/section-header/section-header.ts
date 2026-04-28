import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-section-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="section-h">
      <h3>{{ title() }}</h3>
      @if (meta()) {
        <div class="sh-meta"><ng-content /></div>
      }
    </div>
  `,
})
export class SectionHeader {
  readonly title = input.required<string>();
  readonly meta = input<boolean>(true);
}
