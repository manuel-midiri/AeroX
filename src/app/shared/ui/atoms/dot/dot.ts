import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type DotTone = 'green' | 'amber' | 'red' | 'cyan';

@Component({
  selector: 'app-dot',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span class="dot" [class.green]="tone() === 'green'" [class.amber]="tone() === 'amber'" [class.red]="tone() === 'red'" [class.cyan]="tone() === 'cyan'" aria-hidden="true"></span>`,
})
export class Dot {
  readonly tone = input<DotTone>('green');
}
