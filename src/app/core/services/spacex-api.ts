import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom, timeout, lastValueFrom, forkJoin } from 'rxjs';
import { buildBakedData } from '../data/baked-data';
import type { Dataset } from '../models/dataset';
import type { Launch } from '../models/launch';
import type { Upcoming } from '../models/upcoming';

const BASE = 'https://api.spacexdata.com/v4';
const TIMEOUT_MS = 6000;

interface ApiPatchLinks {
  small?: string | null;
  large?: string | null;
}

interface ApiLinks {
  patch?: ApiPatchLinks | null;
  youtube_id?: string | null;
}

interface ApiLaunch {
  id: string;
  name: string;
  flight_number: number;
  date_utc: string;
  rocket: string;
  success: boolean | null;
  details: string | null;
  links?: ApiLinks | null;
  static_fire_date_utc?: string | null;
}

interface ApiRocket {
  id: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class SpaceXApi {
  private readonly http = inject(HttpClient);

  cached(): Dataset {
    return buildBakedData();
  }

  async loadAll(): Promise<Dataset> {
    const baked = buildBakedData();
    const [past, upcoming, rockets] = await lastValueFrom(
      forkJoin({
        past: this.http.get<ApiLaunch[]>(`${BASE}/launches/past?limit=12`).pipe(timeout(TIMEOUT_MS)),
        upcoming: this.http.get<ApiLaunch[]>(`${BASE}/launches/upcoming`).pipe(timeout(TIMEOUT_MS)),
        rockets: this.http.get<ApiRocket[]>(`${BASE}/rockets`).pipe(timeout(TIMEOUT_MS)),
      }).pipe(timeout(TIMEOUT_MS))
    ).then((r) => [r.past, r.upcoming, r.rockets] as const);

    const now = Date.now();
    const futureUpcoming = upcoming.find(
      (u) => u.date_utc && new Date(u.date_utc).getTime() > now
    );
    const next = this.mapNext(futureUpcoming, rockets, baked.upcoming);

    return {
      live: true,
      upcoming: next,
      past: this.mapPast(past, rockets),
      rockets: baked.rockets,
      pads: baked.pads,
      crew: baked.crew,
      starlink: baked.starlink,
    };
  }

  /** Single-shot fetch helper using firstValueFrom for callers that need it. */
  fetchLaunches(): Promise<ApiLaunch[]> {
    return firstValueFrom(
      this.http.get<ApiLaunch[]>(`${BASE}/launches/past?limit=12`).pipe(timeout(TIMEOUT_MS))
    );
  }

  private mapPast(launches: readonly ApiLaunch[], rockets: readonly ApiRocket[]): readonly Launch[] {
    const rmap = new Map<string, string>(rockets.map((r) => [r.id, r.name]));
    return launches
      .filter((l) => l.success !== null)
      .slice(-12)
      .reverse()
      .map<Launch>((l) => {
        const rocketName =
          rmap.get(l.rocket) ??
          (typeof l.rocket === 'string' && l.rocket.length < 30 ? l.rocket : 'Falcon 9');
        const patch = l.links?.patch?.small ?? l.links?.patch?.large ?? null;
        return {
          id: l.id,
          name: l.name,
          flight_number: l.flight_number,
          date: l.date_utc,
          rocket: rocketName,
          success: l.success === true,
          details: l.details ?? '—',
          patch,
          youtube: l.links?.youtube_id ?? 'dQw4w9WgXcQ',
          orbit: '—',
        };
      });
  }

  private mapNext(
    l: ApiLaunch | undefined,
    rockets: readonly ApiRocket[],
    fallback: Upcoming
  ): Upcoming {
    if (!l) return fallback;
    const rk = rockets.find((r) => r.id === l.rocket);
    const isFuture = !!l.date_utc && new Date(l.date_utc).getTime() > Date.now();
    return {
      ...fallback,
      name: l.name || fallback.name,
      flight_number: l.flight_number || fallback.flight_number,
      date_utc: isFuture ? l.date_utc : fallback.date_utc,
      rocket: rk?.name ?? fallback.rocket,
      static_fire_complete: l.static_fire_date_utc != null,
      patch: l.links?.patch?.small ?? fallback.patch,
      objectives: [
        l.details ?? 'Mission objectives pending publication.',
        'Booster recovery on droneship',
        'Payload deployment on schedule',
      ],
    };
  }
}
