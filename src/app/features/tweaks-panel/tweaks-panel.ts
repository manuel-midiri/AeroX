import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { I18n } from '../../core/services/i18n';
import { TweaksStore } from '../../core/services/tweaks';
import { AudioCue } from '../../core/services/audio-cue';
import type {
  DataSource,
  Density,
  Language,
  ThemeAccent,
  Tweaks,
} from '../../core/models/common';

interface RadioOption<T extends string> {
  value: T;
  label: string;
}

@Component({
  selector: 'app-tweaks-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      type="button"
      class="tweaks-trigger"
      (click)="toggle()"
      [attr.aria-expanded]="open()"
      aria-controls="tweaks-panel"
      [title]="i18n.t('tw.title')"
    >
      <span class="tt-icon" aria-hidden="true">⚙</span>
      <span>{{ i18n.t('tw.open') }}</span>
    </button>

    @if (open()) {
      <aside id="tweaks-panel" class="tweaks-panel" role="dialog" [attr.aria-label]="i18n.t('tw.title')">
        <div class="tw-head">
          <span class="tw-title">{{ i18n.t('tw.title') }}</span>
          <button type="button" class="tw-close" (click)="close()" [attr.aria-label]="i18n.t('tw.close')">✕</button>
        </div>
        <div class="tw-body">
          <div class="tw-section">
            <div class="tw-section-title">{{ i18n.t('tw.theme') }}</div>

            <div class="tw-row">
              <div class="tw-label">{{ i18n.t('tw.accent') }}</div>
              <div class="tw-radio" role="radiogroup" [attr.aria-label]="i18n.t('tw.accent')">
                @for (opt of themeOptions; track opt.value) {
                  <button
                    type="button"
                    role="radio"
                    [class.active]="t().theme === opt.value"
                    [attr.aria-checked]="t().theme === opt.value"
                    (click)="setTheme(opt.value)"
                  >{{ opt.label }}</button>
                }
              </div>
            </div>

            <div class="tw-row">
              <div class="tw-label">{{ i18n.t('tw.density') }}</div>
              <div class="tw-radio" role="radiogroup" [attr.aria-label]="i18n.t('tw.density')">
                @for (opt of densityOptions(); track opt.value) {
                  <button
                    type="button"
                    role="radio"
                    [class.active]="t().density === opt.value"
                    [attr.aria-checked]="t().density === opt.value"
                    (click)="setDensity(opt.value)"
                  >{{ opt.label }}</button>
                }
              </div>
            </div>

            <div class="tw-row tw-row-h">
              <div class="tw-label">{{ i18n.t('tw.scanlines') }}</div>
              <button
                type="button"
                class="tw-toggle"
                role="switch"
                [attr.data-on]="t().scanlines"
                [attr.aria-checked]="t().scanlines"
                (click)="toggleScanlines()"
                [attr.aria-label]="i18n.t('tw.scanlines')"
              ><i></i></button>
            </div>
          </div>

          <div class="tw-section">
            <div class="tw-section-title">{{ i18n.t('tw.system') }}</div>

            <div class="tw-row tw-row-h">
              <div class="tw-label">{{ i18n.t('tw.audio') }}</div>
              <button
                type="button"
                class="tw-toggle"
                role="switch"
                [attr.data-on]="t().audio"
                [attr.aria-checked]="t().audio"
                (click)="toggleAudio()"
                [attr.aria-label]="i18n.t('tw.audio')"
              ><i></i></button>
            </div>

            <div class="tw-row">
              <div class="tw-label">{{ i18n.t('tw.language') }}</div>
              <div class="tw-radio" role="radiogroup" [attr.aria-label]="i18n.t('tw.language')">
                @for (opt of langOptions; track opt.value) {
                  <button
                    type="button"
                    role="radio"
                    [class.active]="t().language === opt.value"
                    [attr.aria-checked]="t().language === opt.value"
                    (click)="setLang(opt.value)"
                  >{{ opt.label }}</button>
                }
              </div>
            </div>

            <div class="tw-row">
              <div class="tw-label">{{ i18n.t('tw.dataSource') }}</div>
              <div class="tw-radio" role="radiogroup" [attr.aria-label]="i18n.t('tw.dataSource')">
                @for (opt of dataSourceOptions(); track opt.value) {
                  <button
                    type="button"
                    role="radio"
                    [class.active]="t().dataSource === opt.value"
                    [attr.aria-checked]="t().dataSource === opt.value"
                    (click)="setDataSource(opt.value)"
                  >{{ opt.label }}</button>
                }
              </div>
            </div>
          </div>
        </div>
      </aside>
    }
  `,
})
export class TweaksPanel {
  protected readonly i18n = inject(I18n);
  private readonly store = inject(TweaksStore);
  private readonly audio = inject(AudioCue);

  protected readonly open = signal(false);
  protected readonly t = computed<Tweaks>(() => this.store.tweaks());

  protected readonly themeOptions: readonly RadioOption<ThemeAccent>[] = [
    { value: 'amber', label: 'Amber' },
    { value: 'phosphor', label: 'Phosphor' },
    { value: 'ice', label: 'Ice' },
  ];

  protected readonly langOptions: readonly RadioOption<Language>[] = [
    { value: 'en', label: 'EN' },
    { value: 'it', label: 'IT' },
  ];

  protected readonly densityOptions = computed<readonly RadioOption<Density>[]>(() => [
    { value: 'compact', label: this.i18n.t('tw.compact') },
    { value: 'comfy', label: this.i18n.t('tw.comfy') },
  ]);

  protected readonly dataSourceOptions = computed<readonly RadioOption<DataSource>[]>(() => [
    { value: 'live', label: this.i18n.t('tw.live') },
    { value: 'cached', label: this.i18n.t('tw.baked') },
  ]);

  protected toggle(): void {
    this.open.update((v) => !v);
  }

  protected close(): void {
    this.open.set(false);
  }

  protected setTheme(value: ThemeAccent): void {
    this.store.set('theme', value);
  }

  protected setDensity(value: Density): void {
    this.store.set('density', value);
  }

  protected toggleScanlines(): void {
    this.store.set('scanlines', !this.t().scanlines);
  }

  protected toggleAudio(): void {
    const next = !this.t().audio;
    this.store.set('audio', next);
    if (next) setTimeout(() => this.audio.confirm(), 100);
  }

  protected setLang(value: Language): void {
    this.store.set('language', value);
  }

  protected setDataSource(value: DataSource): void {
    this.store.set('dataSource', value);
  }
}
