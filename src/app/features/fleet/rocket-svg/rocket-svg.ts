import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

type RocketKind = 'falcon9' | 'falconheavy' | 'starship' | 'dragon';

@Component({
  selector: 'app-rocket-svg',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @switch (kind()) {
      @case ('falcon9') {
        <svg viewBox="0 0 120 420" class="rocket-svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <g stroke="var(--amber)" stroke-width="1" fill="none">
            <path d="M60 20 L80 80 L40 80 Z" fill="var(--bg-0)" />
            <path d="M40 80 L40 130 L80 130 L80 80" fill="var(--bg-1)" />
            <line x1="60" y1="20" x2="60" y2="130" stroke-dasharray="2 3" opacity="0.3" />
            <rect x="44" y="130" width="32" height="80" fill="var(--bg-1)" />
            <text x="60" y="172" text-anchor="middle" fill="var(--amber)" font-size="7" font-family="JetBrains Mono">S2</text>
            <rect x="44" y="210" width="32" height="14" fill="var(--bg-2)" />
            <rect x="44" y="224" width="32" height="150" fill="var(--bg-1)" />
            <text x="60" y="305" text-anchor="middle" fill="var(--amber)" font-size="7" font-family="JetBrains Mono">S1 · MERLIN</text>
            <rect x="32" y="234" width="12" height="14" fill="var(--bg-2)" />
            <rect x="76" y="234" width="12" height="14" fill="var(--bg-2)" />
            <line x1="44" y1="370" x2="32" y2="395" />
            <line x1="76" y1="370" x2="88" y2="395" />
            <path d="M44 374 L48 395 L72 395 L76 374 Z" fill="var(--bg-0)" />
            <path d="M48 395 L52 410 L60 405 L68 410 L72 395" fill="none" stroke="var(--amber)" opacity="0.4" />
          </g>
          <g font-family="JetBrains Mono" font-size="7" fill="var(--text-2)">
            <text x="92" y="84">↕ 70m</text>
            <text x="92" y="220">↔ 3.7m</text>
          </g>
        </svg>
      }
      @case ('falconheavy') {
        <svg viewBox="0 0 200 420" class="rocket-svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <g stroke="var(--amber)" stroke-width="1" fill="none">
            <g>
              <path d="M40 60 L54 110 L26 110 Z" fill="var(--bg-0)" />
              <rect x="26" y="110" width="28" height="260" fill="var(--bg-1)" />
              <path d="M26 370 L30 395 L50 395 L54 370" fill="var(--bg-0)" />
            </g>
            <g>
              <path d="M100 20 L114 80 L86 80 Z" fill="var(--bg-0)" />
              <rect x="86" y="80" width="28" height="290" fill="var(--bg-1)" />
              <path d="M86 370 L90 395 L110 395 L114 370" fill="var(--bg-0)" />
            </g>
            <g>
              <path d="M160 60 L174 110 L146 110 Z" fill="var(--bg-0)" />
              <rect x="146" y="110" width="28" height="260" fill="var(--bg-1)" />
              <path d="M146 370 L150 395 L170 395 L174 370" fill="var(--bg-0)" />
            </g>
            <text x="100" y="200" text-anchor="middle" fill="var(--amber)" font-size="8" font-family="JetBrains Mono">FH · 27 MERLINS</text>
          </g>
        </svg>
      }
      @case ('starship') {
        <svg viewBox="0 0 130 420" class="rocket-svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <g stroke="var(--amber)" stroke-width="1" fill="none">
            <path d="M65 15 L82 50 L82 90 L48 90 L48 50 Z" fill="var(--bg-0)" />
            <rect x="48" y="90" width="34" height="100" fill="var(--bg-1)" />
            <path d="M48 95 L30 105 L30 120 L48 115" fill="var(--bg-2)" />
            <path d="M82 95 L100 105 L100 120 L82 115" fill="var(--bg-2)" />
            <text x="65" y="145" text-anchor="middle" fill="var(--amber)" font-size="7" font-family="JetBrains Mono">SHIP</text>
            <path d="M48 175 L26 188 L26 200 L48 195" fill="var(--bg-2)" />
            <path d="M82 175 L104 188 L104 200 L82 195" fill="var(--bg-2)" />
            <rect x="44" y="190" width="42" height="190" fill="var(--bg-1)" />
            <text x="65" y="290" text-anchor="middle" fill="var(--amber)" font-size="7" font-family="JetBrains Mono">SUPER HEAVY</text>
            <text x="65" y="305" text-anchor="middle" fill="var(--text-2)" font-size="6" font-family="JetBrains Mono">33× RAPTOR</text>
            <rect x="32" y="200" width="12" height="16" fill="var(--bg-2)" />
            <rect x="86" y="200" width="12" height="16" fill="var(--bg-2)" />
            <path d="M44 380 L50 400 L80 400 L86 380" fill="var(--bg-0)" />
            <path d="M50 400 L55 412 L65 408 L75 412 L80 400" fill="none" stroke="var(--amber)" opacity="0.5" />
          </g>
          <g font-family="JetBrains Mono" font-size="7" fill="var(--text-2)">
            <text x="108" y="60">↕ 121m</text>
            <text x="108" y="295">↔ 9m</text>
          </g>
        </svg>
      }
      @case ('dragon') {
        <svg viewBox="0 0 120 280" class="rocket-svg" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
          <g stroke="var(--amber)" stroke-width="1" fill="none">
            <path d="M30 50 L35 30 L60 18 L85 30 L90 50 L85 130 L35 130 Z" fill="var(--bg-1)" />
            <circle cx="60" cy="80" r="14" fill="var(--bg-0)" />
            <circle cx="60" cy="80" r="10" fill="none" />
            <rect x="35" y="130" width="50" height="80" fill="var(--bg-2)" />
            <text x="60" y="170" text-anchor="middle" fill="var(--amber)" font-size="7" font-family="JetBrains Mono">TRUNK</text>
            <rect x="15" y="138" width="20" height="60" fill="var(--bg-1)" />
            <rect x="85" y="138" width="20" height="60" fill="var(--bg-1)" />
            @for (y of solarLines; track y) {
              <line x1="15" [attr.y1]="y" x2="35" [attr.y2]="y" opacity="0.5" />
              <line x1="85" [attr.y1]="y" x2="105" [attr.y2]="y" opacity="0.5" />
            }
            @for (x of dracoX; track x) {
              <rect [attr.x]="x - 2" y="125" width="4" height="6" fill="var(--bg-0)" />
            }
          </g>
          <g font-family="JetBrains Mono" font-size="7" fill="var(--text-2)">
            <text x="95" y="22">↕ 8.1m</text>
            <text x="95" y="225">↔ 4m</text>
          </g>
        </svg>
      }
    }
  `,
})
export class RocketSvg {
  readonly rocketId = input.required<string>();

  protected readonly kind = computed<RocketKind>(() => {
    const id = this.rocketId();
    if (id === 'falcon9' || id === 'falconheavy' || id === 'starship' || id === 'dragon') return id;
    return 'falcon9';
  });

  protected readonly solarLines = [145, 158, 171, 184] as const;
  protected readonly dracoX = [42, 56, 70, 84] as const;
}
