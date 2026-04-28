export interface Upcoming {
  name: string;
  flight_number: number;
  date_utc: string;
  rocket: string;
  launchpad: string;
  payload_mass: number;
  payload_count: number;
  orbit: string;
  customer: string;
  window_seconds: number;
  static_fire_complete: boolean;
  weather_go: number;
  range_status: string;
  booster: string;
  droneship: string;
  patch: string | null;
  objectives: readonly string[];
}
