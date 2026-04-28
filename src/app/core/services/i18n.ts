import { Injectable, computed, signal } from '@angular/core';
import { I18N_DICT, type TranslationDict } from '../data/i18n-strings';
import type { Language } from '../models/common';

@Injectable({ providedIn: 'root' })
export class I18n {
  private readonly _lang = signal<Language>('en');

  readonly lang = this._lang.asReadonly();
  readonly dict = computed<TranslationDict>(() => I18N_DICT[this._lang()]);

  setLang(lang: Language): void {
    this._lang.set(lang);
  }

  t(key: string): string {
    return this.dict()[key] ?? key;
  }
}
