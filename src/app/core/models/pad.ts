export type PadStatus = 'ACTIVE' | 'AT SEA' | 'PORT' | 'RETIRED';

export interface Pad {
  id: string;
  name: string;
  site: string;
  state: string;
  lat: number;
  lng: number;
  status: PadStatus;
  launches: number;
  last_launch: string;
  type: string;
}
