import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  output,
} from '@angular/core';
import { I18n } from '../../core/services/i18n';
import { Hotkeys } from '../../core/services/hotkeys';

interface HotkeyRow {
  keys: readonly string[];
  desc: string;
}

interface HotkeyGroup {
  title: string;
  rows: readonly HotkeyRow[];
}

@Component({
  selector: 'app-hotkeys-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="modal-bg" (click)="close()" role="presentation">
      <div
        class="modal hk-modal"
        (click)="$event.stopPropagation()"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="i18n.t('hk.title')"
      >
        <span class="mc-tr"></span>
        <span class="mc-bl"></span>

        <div class="modal-head">
          <div>
            <div class="m-tag">▸ {{ i18n.t('hk.quickRef') }}</div>
            <h2>{{ i18n.t('hk.title') }}</h2>
          </div>
          <button type="button" class="modal-close" (click)="close()">{{ i18n.t('hk.close') }}</button>
        </div>

        <div class="modal-body hk-body">
          @for (group of groups(); track group.title) {
            <div class="hk-group">
              <div class="modal-section-title">{{ group.title }}</div>
              <div class="hk-rows">
                @for (row of group.rows; track row.desc) {
                  <div class="hk-row">
                    <div class="hk-keys">
                      @for (k of row.keys; track k) {
                        <kbd class="hk-kbd">{{ k }}</kbd>
                      }
                    </div>
                    <div class="hk-desc">{{ row.desc }}</div>
                  </div>
                }
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
})
export class HotkeysModal {
  protected readonly i18n = inject(I18n);
  private readonly hotkeys = inject(Hotkeys);
  private readonly destroyRef = inject(DestroyRef);

  readonly closed = output<void>();

  protected readonly groups = computed<readonly HotkeyGroup[]>(() => [
    {
      title: this.i18n.t('hk.tabNav'),
      rows: [
        { keys: ['1'], desc: this.i18n.t('hk.tabOps') },
        { keys: ['2'], desc: this.i18n.t('hk.tabLaunches') },
        { keys: ['3'], desc: this.i18n.t('hk.tabFleet') },
        { keys: ['4'], desc: this.i18n.t('hk.tabPads') },
        { keys: ['5'], desc: this.i18n.t('hk.tabCrew') },
        { keys: ['6'], desc: this.i18n.t('hk.tabStarlink') },
        { keys: ['7'], desc: this.i18n.t('hk.tabPatches') },
      ],
    },
    {
      title: this.i18n.t('hk.actions'),
      rows: [
        { keys: ['/'], desc: this.i18n.t('hk.search') },
        { keys: ['?'], desc: this.i18n.t('hk.toggle') },
        { keys: ['Esc'], desc: this.i18n.t('hk.escape') },
      ],
    },
    {
      title: this.i18n.t('hk.tips'),
      rows: [
        { keys: ['click'], desc: this.i18n.t('hk.click') },
        { keys: ['⚙'], desc: this.i18n.t('hk.tweaks') },
      ],
    },
  ]);

  constructor() {
    document.body.style.overflow = 'hidden';
    const off = this.hotkeys.register('Escape', () => this.close());
    this.destroyRef.onDestroy(() => {
      off();
      document.body.style.overflow = '';
    });
  }

  protected close(): void {
    this.closed.emit();
  }
}
