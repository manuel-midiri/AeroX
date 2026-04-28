import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { I18n } from './core/services/i18n';
import { TweaksStore } from './core/services/tweaks';
import { AudioCue } from './core/services/audio-cue';
import { Hotkeys } from './core/services/hotkeys';
import { SpaceXApi } from './core/services/spacex-api';
import { Toast } from './core/services/toast';
import { BootSequence } from './features/boot-sequence/boot-sequence';
import { Header, type HeaderStats } from './features/header/header';
import { Statusbar } from './features/statusbar/statusbar';
import { ToastDisplay } from './features/toast/toast-display';
import { TweaksPanel } from './features/tweaks-panel/tweaks-panel';
import { HotkeyHint } from './features/hotkey-hint/hotkey-hint';
import { HotkeysModal } from './features/hotkeys-modal/hotkeys-modal';
import { LaunchModal } from './features/launch-modal/launch-modal';
import { Ops } from './features/ops/ops';
import { Launches } from './features/launches/launches';
import { Fleet } from './features/fleet/fleet';
import { Pads } from './features/pads/pads';
import { Crew } from './features/crew/crew';
import { Starlink } from './features/starlink/starlink';
import { Patches } from './features/patches/patches';
import type { Dataset } from './core/models/dataset';
import type { Launch } from './core/models/launch';
import type { SrcStatus } from './core/models/common';

type TabId = 'ops' | 'launches' | 'fleet' | 'pads' | 'crew' | 'starlink' | 'patches';

interface TabDef {
  id: TabId;
  label: string;
}

const TAB_KEY_MAP: Readonly<Record<string, TabId>> = {
  '1': 'ops',
  '2': 'launches',
  '3': 'fleet',
  '4': 'pads',
  '5': 'crew',
  '6': 'starlink',
  '7': 'patches',
};

const TAB_STORAGE_KEY = 'aerox.tab';

const TAB_IDS: Readonly<Record<TabId, true>> = {
  ops: true,
  launches: true,
  fleet: true,
  pads: true,
  crew: true,
  starlink: true,
  patches: true,
};

function loadInitialTab(): TabId {
  try {
    const stored = localStorage.getItem(TAB_STORAGE_KEY);
    if (stored && stored in TAB_IDS) return stored as TabId;
  } catch {
    /* ignore */
  }
  return 'ops';
}

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    BootSequence,
    Header,
    Statusbar,
    ToastDisplay,
    TweaksPanel,
    HotkeyHint,
    HotkeysModal,
    LaunchModal,
    Ops,
    Launches,
    Fleet,
    Pads,
    Crew,
    Starlink,
    Patches,
  ],
  template: `
    @if (booting()) {
      <app-boot-sequence (done)="onBootDone()" />
    }

    <div class="app-shell">
      <app-header [stats]="headerStats()" [srcStatus]="srcStatus()" />

      <nav class="tabs" role="tablist" aria-label="Mission Control sections">
        @for (tb of tabs(); track tb.id; let i = $index) {
          <button
            type="button"
            class="tab"
            [class.active]="tab() === tb.id"
            (click)="onTabClick(tb.id)"
            role="tab"
            [attr.aria-selected]="tab() === tb.id"
            [attr.tabindex]="tab() === tb.id ? 0 : -1"
          >
            <span class="num">0{{ i + 1 }}</span>
            {{ tb.label }}
          </button>
        }
      </nav>

      <main class="main">
        @switch (tab()) {
          @case ('ops') {
            <app-ops [launch]="data().upcoming" />
          }
          @case ('launches') {
            <app-launches [launches]="data().past" (select)="onLaunchSelect($event)" />
          }
          @case ('fleet') {
            <app-fleet [rockets]="data().rockets" />
          }
          @case ('pads') {
            <app-pads [pads]="data().pads" />
          }
          @case ('crew') {
            <app-crew [crew]="data().crew" />
          }
          @case ('starlink') {
            <app-starlink [data]="data().starlink" />
          }
          @case ('patches') {
            <app-patches [launches]="data().past" (select)="onLaunchSelect($event)" />
          }
        }
      </main>

      <app-statusbar />
    </div>

    @if (selectedLaunch(); as l) {
      <app-launch-modal [launch]="l" (closed)="onLaunchClose()" />
    }

    <app-hotkey-hint (toggle)="toggleHotkeys()" />

    @if (hotkeysOpen()) {
      <app-hotkeys-modal (closed)="closeHotkeys()" />
    }

    <app-toast-display />

    <app-tweaks-panel />
  `,
})
export class App {
  private readonly i18nSvc = inject(I18n);
  private readonly tweaks = inject(TweaksStore);
  private readonly audio = inject(AudioCue);
  private readonly hotkeys = inject(Hotkeys);
  private readonly api = inject(SpaceXApi);
  private readonly toast = inject(Toast);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly booting = signal(true);
  protected readonly tab = signal<TabId>(loadInitialTab());
  protected readonly selectedLaunch = signal<Launch | null>(null);
  protected readonly hotkeysOpen = signal(false);
  protected readonly data = signal<Dataset>(this.api.cached());
  protected readonly srcStatus = signal<SrcStatus>('cached');

  protected readonly headerStats = computed<HeaderStats>(() => {
    const d = this.data();
    return {
      active: d.rockets.filter((r) => r.status === 'ACTIVE').length,
      success: 442,
      successRate: 99,
      crew: 7,
    };
  });

  protected readonly tabs = computed<readonly TabDef[]>(() => [
    { id: 'ops', label: this.i18nSvc.t('tab.ops') },
    { id: 'launches', label: this.i18nSvc.t('tab.launches') },
    { id: 'fleet', label: this.i18nSvc.t('tab.fleet') },
    { id: 'pads', label: this.i18nSvc.t('tab.pads') },
    { id: 'crew', label: this.i18nSvc.t('tab.crew') },
    { id: 'starlink', label: this.i18nSvc.t('tab.starlink') },
    { id: 'patches', label: this.i18nSvc.t('tab.patches') },
  ]);

  constructor() {
    // Sync language and audio enable from tweaks store
    effect(() => {
      const tw = this.tweaks.tweaks();
      this.i18nSvc.setLang(tw.language);
      this.audio.setEnabled(tw.audio);
    });

    // Persist tab
    effect(() => {
      try {
        localStorage.setItem(TAB_STORAGE_KEY, this.tab());
      } catch {
        /* ignore */
      }
    });

    // React to dataSource changes: live fetch with fallback to cached
    let alive = true;
    let lastSource: 'live' | 'cached' | null = null;
    effect(() => {
      const source = this.tweaks.tweaks().dataSource;
      if (source === lastSource) return;
      lastSource = source;

      if (source === 'cached') {
        this.data.set(this.api.cached());
        this.srcStatus.set('cached');
        return;
      }

      this.srcStatus.set('fetching');
      this.toast.show(this.i18nSvc.t('toast.fetching'), 'amber');

      this.api
        .loadAll()
        .then((d) => {
          if (!alive) return;
          this.data.set(d);
          this.srcStatus.set('live');
          this.audio.confirm();
          this.toast.show(this.i18nSvc.t('toast.live'), 'green');
        })
        .catch(() => {
          if (!alive) return;
          this.data.set(this.api.cached());
          this.srcStatus.set('error');
          this.toast.show(this.i18nSvc.t('toast.error'), 'red');
        });
    });

    this.destroyRef.onDestroy(() => {
      alive = false;
    });

    // Hotkeys
    const offTabs = Object.entries(TAB_KEY_MAP).map(([key, tabId]) =>
      this.hotkeys.register(key, () => {
        this.tab.set(tabId);
        this.audio.select();
        this.toast.show('→ ' + tabId.toUpperCase(), 'amber');
      })
    );
    const offSearch = this.hotkeys.register('/', (e) => {
      e.preventDefault();
      const inp = document.querySelector<HTMLInputElement>('.filterbar input');
      inp?.focus();
    });
    const offToggle = this.hotkeys.register('?', () => {
      this.hotkeysOpen.update((o) => !o);
    });

    this.destroyRef.onDestroy(() => {
      offTabs.forEach((off) => off());
      offSearch();
      offToggle();
    });
  }

  protected onBootDone(): void {
    this.booting.set(false);
  }

  protected onTabClick(id: TabId): void {
    this.tab.set(id);
    this.audio.select();
  }

  protected onLaunchSelect(l: Launch): void {
    this.selectedLaunch.set(l);
    this.audio.confirm();
  }

  protected onLaunchClose(): void {
    this.selectedLaunch.set(null);
  }

  protected toggleHotkeys(): void {
    this.hotkeysOpen.update((v) => !v);
  }

  protected closeHotkeys(): void {
    this.hotkeysOpen.set(false);
  }
}
