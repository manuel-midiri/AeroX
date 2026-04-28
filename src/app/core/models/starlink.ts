export interface OrbitalShell {
  name: string;
  altitude_km: number;
  inclination: number;
  count: number;
}

export interface Starlink {
  total_satellites: number;
  operational: number;
  deorbited: number;
  shells: readonly OrbitalShell[];
  coverage_pct: number;
  countries_active: number;
  subscribers_m: number;
}
