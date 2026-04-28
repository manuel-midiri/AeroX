import { ChangeDetectionStrategy, Component, inject, output } from '@angular/core';
import { I18n } from '../../core/services/i18n';
import { AudioCue } from '../../core/services/audio-cue';

@Component({
  selector: 'app-hotkey-hint',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="hotkey-hint"
      (click)="onClick()"
      [title]="i18n.t('hk.showHint')"
      [attr.aria-label]="i18n.t('hk.showHint')"
    >
      <span class="hk-key" aria-hidden="true">?</span>
      <span class="hk-label">{{ i18n.t('hk.show') }}</span>
    </button>
  `,
})
export class HotkeyHint {
  protected readonly i18n = inject(I18n);
  private readonly audio = inject(AudioCue);

  readonly toggle = output<void>();

  protected onClick(): void {
    this.audio.select();
    this.toggle.emit();
  }
}
