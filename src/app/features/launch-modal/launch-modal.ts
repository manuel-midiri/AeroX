import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  output,
} from '@angular/core';
import { DomSanitizer, type SafeResourceUrl } from '@angular/platform-browser';
import { I18n } from '../../core/services/i18n';
import { Hotkeys } from '../../core/services/hotkeys';
import { Dot } from '../../shared/ui/atoms/dot/dot';
import { fmtDateTime } from '../../shared/utils/format';
import type { Launch } from '../../core/models/launch';

@Component({
  selector: 'app-launch-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Dot],
  template: `
    <div class="modal-bg" (click)="close()" role="presentation">
      <div
        class="modal"
        (click)="$event.stopPropagation()"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="launch().name"
      >
        <span class="mc-tr"></span>
        <span class="mc-bl"></span>

        <div class="modal-head">
          <div>
            <div class="m-tag">▸ {{ i18n.t('modal.flight') }} #{{ launch().flight_number }} · {{ i18n.t('modal.record') }}</div>
            <h2>{{ launch().name }}</h2>
          </div>
          <button type="button" class="modal-close" (click)="close()">{{ i18n.t('modal.close') }}</button>
        </div>

        <div class="modal-body">
          <div class="modal-meta-grid">
            <div>
              <div class="k">{{ i18n.t('modal.vehicle') }}</div>
              <div class="v amber">{{ launch().rocket }}</div>
            </div>
            <div>
              <div class="k">{{ i18n.t('modal.date') }}</div>
              <div class="v">{{ formattedDate() }}</div>
            </div>
            <div>
              <div class="k">{{ i18n.t('modal.orbit') }}</div>
              <div class="v cyan">{{ launch().orbit }}</div>
            </div>
            <div>
              <div class="k">{{ i18n.t('modal.outcome') }}</div>
              <div class="v">
                <span [class.green]="launch().success" [class.red]="!launch().success">
                  ● {{ launch().success ? i18n.t('launches.success') : i18n.t('launches.fail') }}
                </span>
              </div>
            </div>
          </div>

          <div class="modal-section-title">{{ i18n.t('modal.brief') }}</div>
          <div class="modal-details">{{ launch().details }}</div>

          <div class="modal-section-title">{{ i18n.t('modal.webcast') }}</div>
          <div class="video-frame">
            <div class="vf-overlay"><app-dot tone="red" /> {{ i18n.t('modal.archived') }}</div>
            <iframe
              [src]="videoUrl()"
              [title]="launch().name + ' webcast'"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LaunchModal {
  protected readonly i18n = inject(I18n);
  private readonly hotkeys = inject(Hotkeys);
  private readonly destroyRef = inject(DestroyRef);
  private readonly sanitizer = inject(DomSanitizer);

  readonly launch = input.required<Launch>();
  readonly closed = output<void>();

  protected readonly formattedDate = computed(() => fmtDateTime(this.launch().date));

  protected readonly videoUrl = computed<SafeResourceUrl>(() => {
    const id = this.launch().youtube;
    return this.sanitizer.bypassSecurityTrustResourceUrl(
      `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`
    );
  });

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
