import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Toast } from '../../core/services/toast';
import { Dot, type DotTone } from '../../shared/ui/atoms/dot/dot';

@Component({
  selector: 'app-toast-display',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Dot],
  template: `
    @if (current()) {
      <div
        class="toast"
        [class.tone-green]="current()!.tone === 'green'"
        [class.tone-red]="current()!.tone === 'red'"
        [class.tone-cyan]="current()!.tone === 'cyan'"
        role="status"
        aria-live="polite"
      >
        <app-dot [tone]="dotTone()" />
        <span>{{ current()!.msg }}</span>
      </div>
    }
  `,
})
export class ToastDisplay {
  private readonly toast = inject(Toast);

  protected readonly current = this.toast.current;

  protected readonly dotTone = computed<DotTone>(() => {
    const c = this.current();
    if (!c) return 'amber';
    if (c.tone === 'green') return 'green';
    if (c.tone === 'red') return 'red';
    if (c.tone === 'cyan') return 'cyan';
    return 'amber';
  });
}
